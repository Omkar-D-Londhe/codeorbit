export type UpdateCallback = (reload: () => void) => void

let refreshing = false

export function registerServiceWorker(onUpdate?: UpdateCallback): void {
  // Only register in browser environment with serviceWorker support
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  // Register in production mode or when explicit test query/flag is present
  if (!import.meta.env.PROD && !window.location.search.includes('enable-sw')) {
    return
  }

  // Only reload once controller changes when an active controller already existed (i.e. update after skipWaiting).
  // Do NOT reload on the initial claim, which causes ERR_ABORTED race conditions.
  let hadController = Boolean(navigator.serviceWorker.controller)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) {
      hadController = true
      return
    }
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  const runRegister = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Case 1: A service worker is already waiting to activate
        if (registration.waiting) {
          triggerUpdate(registration.waiting, onUpdate)
          return
        }

        // Case 2: A new service worker is installing
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing
          if (!installingWorker) return

          installingWorker.addEventListener('statechange', () => {
            // Once installed, if an active controller already exists, it's an update
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              triggerUpdate(installingWorker, onUpdate)
            }
          })
        })
      })
      .catch((err) => {
        if (!import.meta.env.PROD) {
          console.warn('[PWA] Service worker registration failed:', err)
        }
      })
  }

  if (document.readyState === 'complete') {
    runRegister()
  } else {
    window.addEventListener('load', runRegister)
  }
}

function triggerUpdate(worker: ServiceWorker, onUpdate?: UpdateCallback) {
  const reload = () => {
    worker.postMessage({ type: 'SKIP_WAITING' })
  }
  if (onUpdate) {
    onUpdate(reload)
  }
}
