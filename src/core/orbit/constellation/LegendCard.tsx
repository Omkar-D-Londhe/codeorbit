import { Icon } from '../../../components/Icon'

export function LegendCard() {
  return (
    <div className="card constellation-legend-card" style={{ padding: '16px' }}>
      <h3 style={{ fontSize: 'var(--fs-small, 14px)', fontWeight: 700, margin: '0 0 12px' }}>
        Legend
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--success, #48c78e)',
              color: '#0b0914',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check" size={12} />
          </span>
          <span>Completed</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid var(--accent, #9a8bff)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <span>In Progress</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid var(--border-hover, #5a547a)',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <span>Ready to start</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--surface, #181624)',
              border: '1px solid var(--border, #2d2a42)',
              color: 'var(--text-muted, #9c97b8)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="lock" size={10} />
          </span>
          <span>Locked (advisory)</span>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border, #3a3556)',
            marginTop: '6px',
            paddingTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '28px',
                height: '0',
                borderTop: '2px dashed var(--orbit-edge-prereq, #a79aff)',
              }}
            />
            <span>Prerequisite (advisory)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '28px',
                height: '0',
                borderTop: '2px dotted var(--orbit-edge-order, #5a547a)',
              }}
            />
            <span>Curriculum sequence</span>
          </div>
        </div>
      </div>
    </div>
  )
}
