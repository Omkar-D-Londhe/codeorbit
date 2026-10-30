/**
 * Preview Harness for Script-Enabled Previews (PLT-11, Stage 23a, C-05).
 * Injected into the opaque-origin iframe to bridge console output, errors,
 * DOM events and query assertions back to the host via postMessage.
 */

export type HarnessMsg =
  | { nonce: string; type: 'console'; level: 'log' | 'warn' | 'error'; text: string }
  | { nonce: string; type: 'error'; message: string; line?: number }
  | { nonce: string; type: 'assert'; id: string; ok: boolean; detail?: string }
  | { nonce: string; type: 'done' }

export interface HarnessDispatchCommand {
  nonce: string
  type: 'dispatch'
  event: 'click' | 'mouseover' | 'keydown' | 'input'
  selector: string
  value?: string
  key?: string
  id?: string
}

export interface HarnessQueryCommand {
  nonce: string
  type: 'query'
  id: string
  selector: string
  check: 'exists' | 'text' | 'attribute' | 'count'
  expected?: string | number
  attr?: string
}

export type HostToHarnessCommand = HarnessDispatchCommand | HarnessQueryCommand

/**
 * Generates the JavaScript source code for the in-iframe preview harness.
 * All messages exchanged with parent must match the provided unique nonce.
 */
export function createPreviewHarnessScript(nonce: string): string {
  return `(function() {
  var NONCE = ${JSON.stringify(nonce)};

  function send(type, data) {
    try {
      var payload = Object.assign({ nonce: NONCE, type: type }, data || {});
      window.parent.postMessage(payload, '*');
    } catch (_) {}
  }

  // Intercept console
  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;

  console.log = function() {
    origLog.apply(console, arguments);
    var args = Array.prototype.slice.call(arguments);
    send('console', {
      level: 'log',
      text: args.map(function(a) { return typeof a === 'string' ? a : JSON.stringify(a); }).join(' ')
    });
  };

  console.warn = function() {
    origWarn.apply(console, arguments);
    var args = Array.prototype.slice.call(arguments);
    send('console', {
      level: 'warn',
      text: args.map(function(a) { return typeof a === 'string' ? a : JSON.stringify(a); }).join(' ')
    });
  };

  console.error = function() {
    origError.apply(console, arguments);
    var args = Array.prototype.slice.call(arguments);
    send('console', {
      level: 'error',
      text: args.map(function(a) { return typeof a === 'string' ? a : JSON.stringify(a); }).join(' ')
    });
  };

  // Intercept global runtime errors and unhandled rejections
  window.addEventListener('error', function(e) {
    send('error', { message: e.message || 'Script runtime error', line: e.lineno });
  });

  window.addEventListener('unhandledrejection', function(e) {
    send('error', { message: String(e.reason || 'Unhandled Promise Rejection') });
  });

  // Listen for host commands (must match NONCE)
  window.addEventListener('message', function(ev) {
    var msg = ev.data;
    if (!msg || typeof msg !== 'object' || msg.nonce !== NONCE) return;

    if (msg.type === 'dispatch') {
      try {
        var el = document.querySelector(msg.selector);
        if (!el) {
          send('assert', { id: msg.id || 'dispatch', ok: false, detail: 'Selector not found: ' + msg.selector });
          return;
        }
        if (msg.event === 'click') {
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        } else if (msg.event === 'mouseover') {
          el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
        } else if (msg.event === 'input') {
          if (msg.value !== undefined && 'value' in el) el.value = msg.value;
          el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        } else if (msg.event === 'keydown') {
          el.dispatchEvent(new KeyboardEvent('keydown', { key: msg.key || 'Enter', bubbles: true, cancelable: true }));
        }
        send('assert', { id: msg.id || 'dispatch', ok: true });
      } catch (err) {
        send('assert', { id: msg.id || 'dispatch', ok: false, detail: String(err) });
      }
    } else if (msg.type === 'query') {
      try {
        var el = document.querySelector(msg.selector);
        if (!el) {
          send('assert', { id: msg.id, ok: false, detail: 'Selector not found: ' + msg.selector });
          return;
        }
        if (msg.check === 'exists') {
          send('assert', { id: msg.id, ok: true });
        } else if (msg.check === 'text') {
          var text = (el.textContent || '').trim();
          var ok = msg.expected !== undefined ? text.indexOf(String(msg.expected).trim()) !== -1 : text.length > 0;
          send('assert', { id: msg.id, ok: ok, detail: ok ? undefined : 'Text mismatch. Actual: "' + text + '"' });
        } else if (msg.check === 'attribute') {
          var val = el.getAttribute(msg.attr || '');
          var ok = msg.expected !== undefined ? val === msg.expected : val !== null;
          send('assert', { id: msg.id, ok: ok, detail: ok ? undefined : 'Attribute mismatch. Actual: ' + val });
        }
      } catch (err) {
        send('assert', { id: msg.id, ok: false, detail: String(err) });
      }
    }
  });

  // Signal initialization finished
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { send('done'); });
  } else {
    setTimeout(function() { send('done'); }, 0);
  }
})();`
}
