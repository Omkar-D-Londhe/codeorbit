import { describe, it, expect } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { AccessibleBarChart } from '../../core/insights/charts/AccessibleBarChart'
import { AccessibleLineChart } from '../../core/insights/charts/AccessibleLineChart'

describe('Accessible SVG Charts (Stage 15c, Catalog 12.1)', () => {
  describe('AccessibleBarChart', () => {
    it('renders empty message note and no broken axes when data is empty', () => {
      const { getByText, queryByRole } = render(
        <AccessibleBarChart title="Test Bar Chart" data={[]} emptyMessage="Nothing to display" />
      )

      expect(getByText('Test Bar Chart')).toBeDefined()
      expect(getByText('Nothing to display')).toBeDefined()
      expect(queryByRole('img')).toBeNull()
    })

    it('renders interactive SVG chart with graphics-symbols and semantic table alternative', () => {
      const sample = [
        { label: 'Foundations', value: 30 },
        { label: 'Forms', value: 45 },
      ]

      const { getByRole, getAllByRole, getByText } = render(
        <AccessibleBarChart title="Group Estimates" data={sample} yUnit="min" />
      )

      const svg = getByRole('img')
      expect(svg).toBeDefined()
      expect(svg.getAttribute('aria-label')).toContain('Group Estimates')

      const symbols = getAllByRole('graphics-symbol')
      expect(symbols).toHaveLength(2)
      expect(symbols[0].getAttribute('aria-label')).toBe('Foundations: 30 min')

      // Check semantic table alternative
      const table = getByRole('table')
      expect(table).toBeDefined()
      expect(getByText('Group Estimates data table')).toBeDefined()
      expect(within(table).getByText('Foundations')).toBeDefined()
      expect(within(table).getByText('30')).toBeDefined()

      // Focus triggers tooltip
      fireEvent.focus(symbols[0])
      expect(getByRole('status').textContent).toContain('Foundations: 30 min')
    })
  })

  describe('AccessibleLineChart', () => {
    it('renders empty pace message without empty axes when points are empty or all 0', () => {
      const { getByText, queryByRole } = render(
        <AccessibleLineChart
          title="Learning Velocity"
          points={[{ label: 'Oct 26', value: 0 }, { label: 'Oct 27', value: 0 }]}
          emptyMessage="Complete a lesson to see your pace"
        />
      )

      expect(getByText('Complete a lesson to see your pace')).toBeDefined()
      expect(queryByRole('img')).toBeNull()
    })

    it('renders smooth SVG path, interactive circles, and table alternative when points exist', () => {
      const points = [
        { label: 'Oct 26', value: 2 },
        { label: 'Oct 27', value: 5 },
      ]

      const { getByRole, getAllByRole } = render(
        <AccessibleLineChart title="Learning Velocity" points={points} yUnit="events" />
      )

      const svg = getByRole('img')
      expect(svg).toBeDefined()

      const dots = getAllByRole('graphics-symbol')
      expect(dots).toHaveLength(2)
      expect(dots[1].getAttribute('aria-label')).toBe('Oct 27: 5 events')

      // Focus dot reveals tooltip
      fireEvent.focus(dots[1])
      expect(getByRole('status').textContent).toContain('Oct 27: 5 events')

      // Verify table alternative
      const table = getByRole('table')
      expect(table).toBeDefined()
      expect(within(table).getByText('Oct 27')).toBeDefined()
      expect(within(table).getByText('5')).toBeDefined()
    })

    it('remains stable and updates tooltip smoothly on mouseEnter, adjacent node transitions, and mouseLeave', () => {
      const points = [
        { label: 'Oct 26', value: 2 },
        { label: 'Oct 27', value: 5 },
      ]

      const { getByRole, getAllByRole, container } = render(
        <AccessibleLineChart title="Learning Velocity" points={points} yUnit="events" />
      )

      const dots = getAllByRole('graphics-symbol')
      const tooltipSlot = container.querySelector('.chart-tooltip-wrap')
      expect(tooltipSlot).toBeDefined()

      // Before hover: placeholder is mounted so layout space is reserved (prevents layout shift / stutter)
      const tooltip = getByRole('status')
      expect(tooltip.classList.contains('chart-tooltip--placeholder')).toBe(true)

      // Hover dot 0
      fireEvent.mouseEnter(dots[0])
      expect(dots[0].classList.contains('is-active')).toBe(true)
      expect(tooltip.classList.contains('chart-tooltip--placeholder')).toBe(false)
      expect(tooltip.textContent).toContain('Oct 26: 2 events')

      // Move directly to adjacent dot 1
      fireEvent.mouseLeave(dots[0])
      fireEvent.mouseEnter(dots[1])
      expect(dots[0].classList.contains('is-active')).toBe(false)
      expect(dots[1].classList.contains('is-active')).toBe(true)
      expect(tooltip.textContent).toContain('Oct 27: 5 events')

      // Mouse leaves chart
      fireEvent.mouseLeave(dots[1])
      expect(dots[1].classList.contains('is-active')).toBe(false)
      expect(tooltip.classList.contains('chart-tooltip--placeholder')).toBe(true)
    })
  })
})
