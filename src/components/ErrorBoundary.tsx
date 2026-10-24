import { Component, type ReactNode } from 'react'

interface State { error: Error | null }

/** Last-resort boundary: explains what happened and offers a reload; never wipes saved data on its own. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error): State { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="fatal" role="alert">
        <h1>Something went wrong</h1>
        <p>CodeOrbit hit an unexpected problem while drawing this page. Your saved progress is stored separately and was not changed.</p>
        <p className="muted">{this.state.error.message}</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.assign('/')}>Reload CodeOrbit</button>
      </div>
    )
  }
}
