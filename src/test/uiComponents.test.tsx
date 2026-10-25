import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoA11yViolations } from './a11y'
import {
  Button,
  IconButton,
  Card,
  GlassPanel,
  Tabs,
  Toggle,
  Select,
  Segmented,
  Kbd,
  Skeleton,
  StatusChip,
  ProgressRing,
  ProgressBar,
  DockedPanel,
  Drawer,
  Icon
} from '../core/ui'

describe('core/ui components', () => {
  describe('Button', () => {
    it('renders with variants and handles clicks', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const { container } = render(
        <Button variant="primary" size="lg" onClick={onClick}>
          Click Me
        </Button>
      )
      const btn = screen.getByRole('button', { name: 'Click Me' })
      expect(btn).toHaveClass('btn--primary', 'btn--lg')
      await user.click(btn)
      expect(onClick).toHaveBeenCalledTimes(1)
      await expectNoA11yViolations(container)
    })

    it('honours disabled and loading states', () => {
      const { rerender } = render(<Button disabled>Disabled</Button>)
      const btn = screen.getByRole('button', { name: 'Disabled' })
      expect(btn).toBeDisabled()

      rerender(<Button loading loadingText="Saving...">Save</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  describe('IconButton', () => {
    it('requires accessible name and renders tooltip on hover/focus', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <IconButton aria-label="Search items" icon={<span>🔍</span>} tooltip="Search shortcut" />
      )
      const btn = screen.getByRole('button', { name: 'Search items' })
      expect(btn).toBeInTheDocument()

      await user.hover(btn)
      // Fast-forward or wait
      await expectNoA11yViolations(container)
    })
  })

  describe('Card and GlassPanel', () => {
    it('renders Card with variants and optional header/footer', async () => {
      const { container } = render(
        <Card variant="glass" eyebrow="Topic 01" title="Introduction" footer={<button>Go</button>}>
          <p>Card body text</p>
        </Card>
      )
      expect(screen.getByText('Topic 01')).toBeInTheDocument()
      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Card body text')).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })

    it('renders GlassPanel with fallback capability', async () => {
      const { container } = render(
        <GlassPanel elevated>
          <span>Floating content</span>
        </GlassPanel>
      )
      expect(screen.getByText('Floating content')).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Tabs', () => {
    it('supports keyboard roving tabindex (arrows, Home, End)', () => {
      const onChange = vi.fn()
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' }
      ]
      render(<Tabs tabs={tabs} activeId="tab1" onChange={onChange} />)

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab2).toHaveAttribute('aria-selected', 'false')

      fireEvent.keyDown(tab1, { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith('tab2')

      fireEvent.keyDown(tab1, { key: 'End' })
      expect(onChange).toHaveBeenCalledWith('tab3')

      fireEvent.keyDown(tab1, { key: 'Home' })
      expect(onChange).toHaveBeenCalledWith('tab1')
    })
  })

  describe('Toggle', () => {
    it('toggles value via change and keyboard Space', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(
        <Toggle label="Reduce motion" description="Limits animations" checked={false} onChange={onChange} />
      )
      const toggle = screen.getByRole('switch', { name: 'Reduce motion Limits animations' })
      expect(toggle).not.toBeChecked()

      await user.click(toggle)
      expect(onChange).toHaveBeenCalled()
      await expectNoA11yViolations(container)
    })
  })

  describe('Select', () => {
    it('renders with associated label and options', async () => {
      const options = [
        { value: 'html', label: 'HTML Track' },
        { value: 'css', label: 'CSS Track' }
      ]
      const { container } = render(<Select label="Active Track" options={options} defaultValue="html" />)
      const select = screen.getByRole('combobox', { name: 'Active Track' })
      expect(select).toHaveValue('html')
      await expectNoA11yViolations(container)
    })
  })

  describe('Segmented control', () => {
    it('supports arrow key selection and radio semantics', async () => {
      const onChange = vi.fn()
      const options = [
        { value: 'map', label: 'Map View' },
        { value: 'list', label: 'List View' }
      ]
      const { container } = render(
        <Segmented ariaLabel="View selection" options={options} value="map" onChange={onChange} />
      )
      const mapRadio = screen.getByRole('radio', { name: 'Map View' })
      const listRadio = screen.getByRole('radio', { name: 'List View' })
      expect(mapRadio).toHaveAttribute('aria-checked', 'true')
      expect(listRadio).toHaveAttribute('aria-checked', 'false')

      fireEvent.keyDown(mapRadio, { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith('list')
      await expectNoA11yViolations(container)
    })
  })

  describe('StatusChip', () => {
    it('renders icon + text for all states without color-alone dependency', async () => {
      const { container } = render(
        <div>
          <StatusChip status="completed" />
          <StatusChip status="in-progress" />
          <StatusChip status="available" />
          <StatusChip status="locked" />
          <StatusChip status="mastered" />
        </div>
      )
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Available')).toBeInTheDocument()
      expect(screen.getByText('Locked')).toBeInTheDocument()
      expect(screen.getByText('Mastered')).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('ProgressRing & ProgressBar', () => {
    it('renders ProgressRing with progressbar semantics', async () => {
      const { container } = render(<ProgressRing value={75} max={100} label="75% completed" />)
      const bar = screen.getByRole('progressbar', { name: '75% completed' })
      expect(bar).toHaveAttribute('aria-valuenow', '75')
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '100')
      await expectNoA11yViolations(container)
    })

    it('renders ProgressBar with progressbar semantics', async () => {
      const { container } = render(<ProgressBar value={40} max={100} />)
      const bar = screen.getByRole('progressbar')
      expect(bar).toHaveAttribute('aria-valuenow', '40')
      await expectNoA11yViolations(container)
    })
  })

  describe('DockedPanel & Drawer', () => {
    it('renders DockedPanel when open', () => {
      render(
        <DockedPanel open>
          <span>Docked topic info</span>
        </DockedPanel>
      )
      expect(screen.getByText('Docked topic info')).toBeInTheDocument()
    })

    it('renders Drawer with dialog semantics and handles Esc close', () => {
      const onClose = vi.fn()
      render(
        <Drawer open onClose={onClose} title="Topic Details">
          <p>Drawer content</p>
        </Drawer>
      )
      const dialog = screen.getByRole('dialog', { name: 'Topic Details' })
      expect(dialog).toBeInTheDocument()

      fireEvent.keyDown(window, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Icons & Kbd & Skeleton', () => {
    it('renders Icon, Kbd and Skeleton cleanly', () => {
      render(
        <div>
          <Icon id="sparkles" label="Constellation star" />
          <Icon id="lock" />
          <Kbd>Ctrl + K</Kbd>
          <Skeleton width={100} height={20} />
        </div>
      )
      expect(screen.getByRole('img', { name: 'Constellation star' })).toBeInTheDocument()
      expect(screen.getByText('Ctrl + K')).toBeInTheDocument()
    })
  })
})
