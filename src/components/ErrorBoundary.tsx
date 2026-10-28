import { Component, type ReactNode } from 'react'
import { loadState } from '../lib/storage'
import { buildExport } from '../core/storage/exportImport'
import { triggerDownload, formatExportDate } from '../core/storage/exportNotes'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export interface ErrorBoundaryState {
  error: Error | null
  copied: boolean
  showDiagnosticsFallback: boolean
  exportStatus: 'idle' | 'success' | 'failed'
}

/**
 * ErrorBoundary with Resilience & Recovery UI (Stage 17a, 16.5)
 * Catches rendering errors, ensures saved progress is safe, and provides:
 * 1. Reload CodeOrbit
 * 2. Reset this screen
 * 3. Copy sanitized diagnostic info (strictly excludes learner code and notes)
 * 4. Export my data (safeguards learner progress using Stage 03 export)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    copied: false,
    showDiagnosticsFallback: false,
    exportStatus: 'idle',
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }

  handleResetScreen = () => {
    this.setState({
      error: null,
      copied: false,
      showDiagnosticsFallback: false,
      exportStatus: 'idle',
    })
  }

  buildSanitizedDiagnostics = (): string => {
    const error = this.state.error
    const diagnostics = {
      app: 'codeorbit',
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name || 'Error',
        message: error?.message || 'Unknown error',
        stack: error?.stack?.split('\n').slice(0, 6).join('\n') || '',
      },
      environment: {
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
      notice: 'Diagnostics sanitized: learner code and notes are never included.',
    }
    return JSON.stringify(diagnostics, null, 2)
  }

  handleCopyDiagnostics = async () => {
    const payload = this.buildSanitizedDiagnostics()
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload)
        this.setState({ copied: true, showDiagnosticsFallback: false })
        setTimeout(() => this.setState({ copied: false }), 4000)
      } else {
        this.setState({ showDiagnosticsFallback: true })
      }
    } catch {
      this.setState({ showDiagnosticsFallback: true })
    }
  }

  handleExportData = () => {
    try {
      const stateResult = loadState()
      const exportJson = buildExport(stateResult.state)
      const filename = `codeorbit-recovery-backup-${formatExportDate()}.json`
      const ok = triggerDownload(filename, exportJson, 'application/json;charset=utf-8')
      if (ok) {
        this.setState({ exportStatus: 'success' })
      } else {
        this.setState({ exportStatus: 'failed' })
      }
    } catch {
      this.setState({ exportStatus: 'failed' })
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    const error = this.state.error
    const diagnosticsText = this.buildSanitizedDiagnostics()

    return (
      <div className="fatal error-recovery" role="alert" aria-live="assertive">
        <div className="card error-recovery__card">
          <div className="error-recovery__header">
            <h1 className="error-recovery__title">Something went wrong</h1>
            <p className="error-recovery__lede">
              CodeOrbit ran into an unexpected problem drawing this page. Your saved progress, completed topics, and settings are stored safely and were not affected.
            </p>
            {error && (
              <div className="error-recovery__message">
                <span className="muted small font-mono">{error.name}: {error.message}</span>
              </div>
            )}
          </div>

          <div className="error-recovery__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={this.handleReload}
            >
              Reload CodeOrbit
            </button>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={this.handleResetScreen}
            >
              Reset this screen
            </button>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={this.handleCopyDiagnostics}
            >
              {this.state.copied ? '✓ Diagnostic info copied' : 'Copy diagnostic info'}
            </button>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={this.handleExportData}
            >
              {this.state.exportStatus === 'success'
                ? '✓ Data exported'
                : this.state.exportStatus === 'failed'
                ? 'Export failed — Retry'
                : 'Export my data'}
            </button>
          </div>

          {this.state.showDiagnosticsFallback && (
            <div className="error-recovery__fallback-box" style={{ marginTop: '16px' }}>
              <label htmlFor="diagnostic-payload" className="small muted">
                Clipboard copy was blocked. You can manually copy the sanitized diagnostics below:
              </label>
              <textarea
                id="diagnostic-payload"
                readOnly
                value={diagnosticsText}
                rows={6}
                className="input font-mono small"
                style={{ width: '100%', marginTop: '6px' }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}
