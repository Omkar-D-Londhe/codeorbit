import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { openErrorCount } from '../lib/progress'
import { useMediaQuery } from '../lib/hooks'
import { useApp } from '../state/AppState'
import { Emblem, Icon, type IconName } from './Icon'
import { Atmosphere } from '../core/atmosphere/Atmosphere'
import { RouteTransition } from '../core/atmosphere/RouteTransition'

interface NavItem { to: string; label: string; icon: IconName; match: (p: string) => boolean }

const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', match: (p) => p === '/' },
  { to: '/explore', label: 'Explore', icon: 'compass', match: (p) => ['/explore', '/learn', '/lesson', '/quiz', '/practice'].some((x) => p === x || p.startsWith(x + '/')) },
  { to: '/progress', label: 'My Progress', icon: 'progress', match: (p) => p === '/progress' },
  { to: '/review', label: 'Review', icon: 'notebook', match: (p) => p === '/review' },
]

const SIDEBAR_NAV: NavItem[] = [
  ...PRIMARY_NAV,
  { to: '/settings', label: 'Settings', icon: 'settings', match: (p) => p === '/settings' },
]

function NavLinks({ variant }: { variant: 'side' | 'bottom' }) {
  const { pathname } = useLocation()
  const { state } = useApp()
  const open = openErrorCount(state)
  const items = variant === 'side' ? SIDEBAR_NAV : PRIMARY_NAV

  return (
    <ul className={`nav nav--${variant}`}>
      {items.map((item) => {
        const active = item.match(pathname)
        return (
          <li key={item.to}>
            <Link to={item.to} className={`nav__link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined} title={item.label}>
              <Icon name={item.icon} size={20} />
              <span className="nav__label">{item.label}</span>
              {item.to === '/review' && open > 0 && (
                <span className="nav__count" aria-label={`${open} open Error Notebook ${open === 1 ? 'item' : 'items'}`}>{open}</span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="CodeOrbit home">
      <Emblem size={30} />
      <span className="brand__word">CodeOrbit</span>
    </Link>
  )
}

function SaveNote() {
  const { saveStatus } = useApp()
  if (saveStatus.kind === 'error')
    return <p className="side-note side-note--warn"><Icon name="alert" size={16} />Progress cannot be saved in this browser right now.</p>
  if (saveStatus.quotaWarn)
    return <p className="side-note side-note--warn"><Icon name="alert" size={16} />Storage is nearly full (≥ 80%). Consider exporting data in Settings.</p>
  return <p className="side-note">Progress is stored only in this browser.</p>
}

function StorageBanner() {
  const { recovery, dismissRecovery } = useApp()
  const msg: Record<string, string> = {
    corrupt: 'Your saved data could not be read, so CodeOrbit started fresh. A copy of the unreadable data was kept in this browser.',
    'newer-version': 'Your saved data comes from a newer version of CodeOrbit and was not loaded. A copy was kept in this browser.',
    repaired: 'Some saved items were damaged and were skipped. Everything else was restored.',
    unavailable: 'Browser storage is unavailable, so progress will not be kept after you close this tab. You can still learn and practise.',
  }
  if (recovery === 'none') return null
  return (
    <div className="banner" role="status">
      <Icon name="alert" size={18} />
      <p>{msg[recovery]}</p>
      {recovery !== 'unavailable' && (
        <button type="button" className="icon-btn" aria-label="Dismiss message" onClick={dismissRecovery}><Icon name="close" size={16} /></button>
      )}
    </div>
  )
}

export function Shell() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const first = useRef(true)

  // On route change: scroll to top and move focus to the main region (not on first load).
  useEffect(() => {
    if (first.current) { first.current = false; return }
    window.scrollTo?.(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="shell">
      <Atmosphere />
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>Skip to main content</a>
      {isMobile ? (
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Brand />
          <Link
            to="/settings"
            className={`icon-btn ${pathname === '/settings' ? 'is-active' : ''}`}
            aria-label="Settings"
            title="Settings"
          >
            <Icon name="settings" size={20} />
          </Link>
        </header>
      ) : (
        <aside className="sidebar" aria-label="Primary">
          <Brand />
          <nav aria-label="Main"><NavLinks variant="side" /></nav>
          <SaveNote />
        </aside>
      )}
      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <StorageBanner />
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>
      {isMobile && <nav className="bottom-nav" aria-label="Main"><NavLinks variant="bottom" /></nav>}
    </div>
  )
}
