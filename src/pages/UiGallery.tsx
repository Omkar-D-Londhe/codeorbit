import { useState } from 'react'
import {
  Button,
  IconButton,
  Card,
  GlassPanel,
  Tabs,
  Toggle,
  Select,
  Segmented,
  Tooltip,
  Kbd,
  Skeleton,
  StatusChip,
  ProgressRing,
  ProgressBar,
  DockedPanel,
  Drawer,
  Icon,
} from '../core/ui'
import type { IconId } from '../core/ui'
import {
  applyAppearance,
  readEarlyAppearance,
  writeEarlyAppearance
} from '../core/settings/appearance'
import type {
  ThemeId,
  AccentId,
  ContrastMode
} from '../core/settings/appearance'

export default function UiGallery() {
  const current = readEarlyAppearance()
  const [theme, setTheme] = useState<ThemeId>(current.theme)
  const [accent, setAccent] = useState<AccentId>(current.accent)
  const [contrast, setContrast] = useState<ContrastMode>(current.contrast)
  const [activeTab, setActiveTab] = useState('components')
  const [toggleVal, setToggleVal] = useState(false)
  const [segmentedVal, setSegmentedVal] = useState<'map' | 'list'>('map')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleThemeChange = (newTheme: ThemeId) => {
    setTheme(newTheme)
    const next = { theme: newTheme, accent, contrast }
    applyAppearance(next)
    writeEarlyAppearance(next)
  }

  const handleAccentChange = (newAccent: AccentId) => {
    setAccent(newAccent)
    const next = { theme, accent: newAccent, contrast }
    applyAppearance(next)
    writeEarlyAppearance(next)
  }

  const handleContrastChange = (newContrast: ContrastMode) => {
    setContrast(newContrast)
    const next = { theme, accent, contrast: newContrast }
    applyAppearance(next)
    writeEarlyAppearance(next)
  }

  const tabs = [
    { id: 'components', label: 'Core UI Components' },
    { id: 'constellation', label: 'Constellation Specimens (10 §19)' },
    { id: 'tokens', label: 'Tokens & Themes' }
  ]

  const iconList: IconId[] = [
    'check', 'lock', 'play', 'book-open', 'help-circle', 'code',
    'sparkles', 'orbit', 'refresh', 'chevron-right', 'chevron-left',
    'chevron-down', 'zoom-in', 'zoom-out', 'maximize', 'sun', 'moon', 'x', 'pencil'
  ]

  return (
    <div className="page page--wide ui-gallery" style={{ padding: 'var(--s-6) 0' }}>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <div className="eyebrow">Design System V2</div>
            <h1 className="page-title">UI Component & Constellation Gallery</h1>
            <p className="page-lede">
              Living design system catalog for CodeOrbit: Obsidian, Starlight, and Aurora themes, 5 accent presets, WCAG-verified contrast, and constellation foundations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Select
              label="Theme"
              value={theme}
              options={[
                { value: 'obsidian', label: 'Obsidian (Dark)' },
                { value: 'starlight', label: 'Starlight (Light)' },
                { value: 'aurora', label: 'Aurora (Teal Dark)' }
              ]}
              onChange={(e) => handleThemeChange(e.target.value as ThemeId)}
            />
            <Select
              label="Accent"
              value={accent}
              options={[
                { value: 'violet', label: 'Violet' },
                { value: 'teal', label: 'Teal' },
                { value: 'amber', label: 'Amber' },
                { value: 'rose', label: 'Rose' },
                { value: 'azure', label: 'Azure' }
              ]}
              onChange={(e) => handleAccentChange(e.target.value as AccentId)}
            />
            <Select
              label="Contrast"
              value={contrast}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High Contrast' }
              ]}
              onChange={(e) => handleContrastChange(e.target.value as ContrastMode)}
            />
          </div>
        </div>
      </header>

      <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} ariaLabel="Gallery sections" />

      {activeTab === 'components' && (
        <div style={{ display: 'grid', gap: 'var(--s-6)' }}>
          {/* Buttons Section */}
          <Card title="Buttons & Actions">
            <div className="btn-row" style={{ marginTop: 'var(--s-3)' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="danger-ghost">Danger Ghost</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="primary" loading>Loading</Button>
            </div>
            <div className="btn-row" style={{ alignItems: 'center' }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <IconButton aria-label="Open settings" icon={<Icon id="refresh" />} tooltip="Reload settings" />
              <IconButton aria-label="Bookmarked" icon={<Icon id="check" />} />
            </div>
          </Card>

          {/* Cards & Glass Surfaces */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--s-4)' }}>
            <Card title="Standard Card" eyebrow="Card Variant">
              <p className="muted small">Opaque surface with standard elevation shadow and subtle border.</p>
            </Card>
            <Card variant="feature" title="Feature Card" eyebrow="Card Variant">
              <p className="muted small">Gradient surface for hero cards and milestone celebrations.</p>
            </Card>
            <GlassPanel elevated>
              <div className="eyebrow">Glassmorphism Panel (1.4)</div>
              <h3 className="card__title">Glass Surface</h3>
              <p className="muted small">Backdrop-filtered surface with highlight rim and high-contrast fallback.</p>
            </GlassPanel>
          </div>

          {/* Controls */}
          <Card title="Form & Interactive Controls">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--s-5)', alignItems: 'center' }}>
              <Toggle
                label="Reduced Motion"
                description="Disable decorative animations"
                checked={toggleVal}
                onChange={(e) => setToggleVal(e.target.checked)}
              />
              <div>
                <div className="field-label">Segmented View Toggle</div>
                <Segmented
                  ariaLabel="View mode"
                  value={segmentedVal}
                  options={[
                    { value: 'map', label: 'Map View' },
                    { value: 'list', label: 'List View' }
                  ]}
                  onChange={setSegmentedVal}
                />
              </div>
              <div>
                <div className="field-label">Tooltip & Keyboard Key</div>
                <Tooltip content="Press ⌘K to open command palette">
                  <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
                    Hover here for tooltip <Kbd>Ctrl + K</Kbd>
                  </span>
                </Tooltip>
              </div>
            </div>
          </Card>

          {/* Progress Indicators */}
          <Card title="Progress Indicators (Real State)">
            <div style={{ display: 'flex', gap: 'var(--s-6)', alignItems: 'center', flexWrap: 'wrap' }}>
              <ProgressRing value={25} size={64}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>25%</span>
              </ProgressRing>
              <ProgressRing value={66} size={64}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>66%</span>
              </ProgressRing>
              <ProgressRing value={100} size={64}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>100%</span>
              </ProgressRing>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div className="muted small" style={{ marginBottom: '4px' }}>Topic Mastery (8 of 12)</div>
                <ProgressBar value={8} max={12} />
              </div>
            </div>
          </Card>

          {/* Drawers & Panels */}
          <Card title="Overlays & Docked Panels">
            <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
              <Button onClick={() => setDrawerOpen(true)}>Open Details Drawer</Button>
            </div>
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Topic 01: HTML Structure">
              <p className="muted small">
                Every web document begins with a document type declaration and an html element enclosing head and body.
              </p>
              <div style={{ marginTop: 'var(--s-4)' }}>
                <StatusChip status="in-progress" />
              </div>
            </Drawer>
          </Card>

          {/* Skeleton Loaders */}
          <Card title="Skeleton Placeholders">
            <div style={{ display: 'grid', gap: '8px' }}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="85%" height={16} />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'constellation' && (
        <div style={{ display: 'grid', gap: 'var(--s-6)' }}>
          {/* Constellation Specimen Header */}
          <Card title="Constellation Learning Orbit Foundations (10 §19)">
            <p className="muted small">
              Foundational tokens and specimens for the constellation learning orbit. Node states, central hub, and connectors.
            </p>
          </Card>

          {/* Node States */}
          <Card title="Topic Star States">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ width: 'var(--orbit-star-size)', height: 'var(--orbit-star-size)', borderRadius: '50%', background: 'var(--c-surface-1)', border: '2px solid var(--orbit-star-completed)', display: 'grid', placeItems: 'center', color: 'var(--orbit-star-completed)' }}>
                  <Icon id="check" size={24} />
                </div>
                <StatusChip status="completed" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ width: 'var(--orbit-star-size)', height: 'var(--orbit-star-size)', borderRadius: '50%', background: 'var(--c-surface-1)', border: '2px solid var(--orbit-star-progress)', display: 'grid', placeItems: 'center', color: 'var(--orbit-star-progress)' }}>
                  <Icon id="play" size={20} />
                </div>
                <StatusChip status="in-progress" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ width: 'var(--orbit-star-size)', height: 'var(--orbit-star-size)', borderRadius: '50%', background: 'var(--c-surface-1)', border: '2px solid var(--orbit-star-available)', display: 'grid', placeItems: 'center', color: 'var(--orbit-star-available)' }}>
                  <Icon id="sparkles" size={22} />
                </div>
                <StatusChip status="available" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ width: 'var(--orbit-star-size)', height: 'var(--orbit-star-size)', borderRadius: '50%', background: 'var(--c-surface-1)', border: '2px solid var(--orbit-star-locked)', display: 'grid', placeItems: 'center', color: 'var(--orbit-star-locked)' }}>
                  <Icon id="lock" size={22} />
                </div>
                <StatusChip status="locked" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ width: 'var(--orbit-star-size)', height: 'var(--orbit-star-size)', borderRadius: '50%', background: 'var(--c-surface-1)', border: '2px solid var(--c-accent)', boxShadow: 'var(--glow-active)', display: 'grid', placeItems: 'center', color: 'var(--c-accent)' }}>
                  <Icon id="sparkles" size={22} />
                </div>
                <StatusChip status="in-progress" label="Selected Star" />
              </div>
            </div>
          </Card>

          {/* Hub and Line Connections */}
          <Card title="Track Hub & Distinct Line Styles (Never Color Alone)">
            <div style={{ display: 'flex', gap: 'var(--s-8)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', padding: 'var(--s-6) 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--c-surface-2)', border: '2px solid var(--c-border-strong)', boxShadow: 'var(--orbit-hub-glow)', display: 'grid', placeItems: 'center' }}>
                  <Icon id="orbit" size={48} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>HTML Orbit Hub</div>
                  <div className="muted small">12 Topics · Available</div>
                </div>
              </div>

              <div style={{ minWidth: '280px', display: 'grid', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: 'var(--fs-small)', fontWeight: 600, marginBottom: '6px' }}>
                    Prerequisite Connector (Dashed 6 4)
                  </div>
                  <svg width="100%" height="24">
                    <line x1="0" y1="12" x2="100%" y2="12" stroke="var(--orbit-edge-prereq)" strokeWidth="2" strokeDasharray="6 4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--fs-small)', fontWeight: 600, marginBottom: '6px' }}>
                    Curriculum Order Path (Dotted 1 6)
                  </div>
                  <svg width="100%" height="24">
                    <line x1="0" y1="12" x2="100%" y2="12" stroke="var(--orbit-edge-order)" strokeWidth="2" strokeDasharray="1 6" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--fs-small)', fontWeight: 600, marginBottom: '6px' }}>
                    Active / Highlighted Connector
                  </div>
                  <svg width="100%" height="24">
                    <line x1="0" y1="12" x2="100%" y2="12" stroke="var(--orbit-edge-active)" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          {/* Docked Panel Demo */}
          <DockedPanel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Docked Orbit Info Panel</strong>
                <p className="muted small" style={{ margin: 0 }}>Renders beneath the constellation map on tablet and mobile viewports.</p>
              </div>
              <StatusChip status="available" />
            </div>
          </DockedPanel>
        </div>
      )}

      {activeTab === 'tokens' && (
        <Card title="Curated Inline-SVG Icon Registry">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
            {iconList.map((id) => (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-sm)' }}>
                <Icon id={id} size={24} />
                <span style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>{id}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
