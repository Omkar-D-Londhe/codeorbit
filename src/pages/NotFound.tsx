import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/hooks'

export default function NotFound() {
  useDocumentTitle('Not found')
  return (
    <div className="page">
      <h1 className="page-title">That page doesn’t exist</h1>
      <p className="page-lede">The address may be mistyped, or the topic was renamed.</p>
      <div className="btn-row">
        <Link className="btn btn--primary" to="/">Go home</Link>
        <Link className="btn btn--secondary" to="/learn/html">Open the HTML Learning Orbit</Link>
      </div>
    </div>
  )
}
