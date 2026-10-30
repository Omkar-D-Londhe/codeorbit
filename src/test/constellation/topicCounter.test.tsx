import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { topicsFor } from '../../data/curriculum'
import { TopicStepper } from '../../core/orbit/constellation/TopicStepper'
import { TopicDetailsPanel } from '../../core/orbit/constellation/TopicDetailsPanel'
import { ConstellationOrbit } from '../../core/orbit/constellation/ConstellationOrbit'
import { AppStateProvider } from '../../state/AppState'

describe('Topic Counter & Total Consistency (Stage 10 Acceptance Fixes)', () => {
  it('HTML track curriculum collection contains all topics', () => {
    const htmlTopics = topicsFor('html')
    expect(htmlTopics).toHaveLength(13)
    expect(htmlTopics[0].id).toBe('html-structure')
    expect(htmlTopics[htmlTopics.length - 1].id).toBe('putting-together')
  })

  it('TopicStepper derives count dynamically from topics.length (not hardcoded)', () => {
    const htmlTopics = topicsFor('html')
    const onSelect = vi.fn()

    const { rerender } = render(
      <TopicStepper
        topics={htmlTopics}
        selectedIndex={0}
        onSelectIndex={onSelect}
      />
    )

    // Check compact counter element reflects 1 / N
    const counter = document.querySelector('.constellation-stepper-counter')
    expect(counter).not.toBeNull()
    expect(counter?.textContent?.trim()).toBe(`1 / ${htmlTopics.length}`)

    // Rerender at last topic index
    rerender(
      <TopicStepper
        topics={htmlTopics}
        selectedIndex={htmlTopics.length - 1}
        onSelectIndex={onSelect}
      />
    )
    expect(counter?.textContent?.trim()).toBe(`${htmlTopics.length} / ${htmlTopics.length}`)

    // Test with arbitrary 7 synthetic topics to guarantee zero hardcoding
    const mockTopics = Array.from({ length: 7 }, (_, i) => ({
      id: `syn-${i + 1}`,
      technologyId: 'mock',
      title: `Synthetic ${i + 1}`,
      shortTitle: `S${i + 1}`,
      groupId: 'g1',
      description: 'Test',
      prerequisiteIds: [],
    }))

    rerender(
      <TopicStepper
        topics={mockTopics}
        selectedIndex={2}
        onSelectIndex={onSelect}
      />
    )
    expect(counter?.textContent?.trim()).toBe('3 / 7')
  })

  it('TopicDetailsPanel badge displays "Topic 1 of N" dynamically', () => {
    const htmlTopics = topicsFor('html')
    render(
      <MemoryRouter>
        <TopicDetailsPanel
          topic={htmlTopics[0]}
          index={0}
          totalTopics={htmlTopics.length}
          trackTitle="HTML"
          trackGlyph="</>"
          trackDescription="HTML track"
        />
      </MemoryRouter>
    )

    expect(screen.getByText(`Topic 1 of ${htmlTopics.length}`)).toBeInTheDocument()
  })

  it('ConstellationOrbit in expanded mode renders floating card with "Topic 1 of N"', async () => {
    const htmlTopics = topicsFor('html')

    render(
      <MemoryRouter initialEntries={['/learn/html']}>
        <AppStateProvider>
          <ConstellationOrbit
            technologyId="html"
            technologyName="HTML"
            technologyGlyph="</>"
            technologyDescription="HTML track"
            topics={htmlTopics}
            groups={[]}
          />
        </AppStateProvider>
      </MemoryRouter>
    )

    // Select a star first
    const star = screen.getByRole('button', { name: /Document structure/i })
    star.click()

    // Expand map
    const expandBtn = screen.getByRole('button', { name: /Expand constellation view/i })
    expandBtn.click()

    // Floating card should display Topic 1 of N
    expect(await screen.findByText(`Topic 1 of ${htmlTopics.length}`)).toBeInTheDocument()
  })
})
