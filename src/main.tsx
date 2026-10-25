import './app/registerTracks'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/jetbrains-mono'
import './styles/tokens.css'
import './styles/themes.css'
import './styles/orbit-tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/pages.css'
import { applyAppearance, readEarlyAppearance } from './core/settings/appearance'
import App from './App'

// Synchronise appearance with stored preferences
applyAppearance(readEarlyAppearance())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
