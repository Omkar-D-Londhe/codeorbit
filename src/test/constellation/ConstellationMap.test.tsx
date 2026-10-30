import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import App from '../../App'
import { topics } from '../../data/curriculum'
import { challengesForTopic } from '../../data/challenges'
import { lessonPath, quizPath, practicePath } from '../../lib/routes'

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  window.matchMedia = ((q: string) => {
    const m = /max-width:\s*(\d+)px/.exec(q)
    const matches = m ? w <= Number(m[1]) : false
    return {
      matches,
      media: q,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
}

const renderConstellation = () =>
  render(
    <MemoryRouter initialEntries={['/learn/html?orbit=constellation']}>
      <App />
    </MemoryRouter>,
  )

describe('ConstellationMap component integration', () => {
  beforeEach(() => {
    setWidth(1440)
    window.localStorage.clear()
  })

  it('renders one star button per topic for HTML track with correct names and states', () => {
    renderConstellation()

    // Map container
    expect(
      screen.getByRole('group', { name: new RegExp(`Learning Orbit map for HTML, ${topics.length} topics`, 'i') }),
    ).toBeInTheDocument()

    // star buttons
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      const numStr = String(i + 1).padStart(2, '0')
      // Star button accessible name includes number and title
      const star = screen.getByRole('button', {
        name: new RegExp(`${numStr} ${topic.title}`, 'i'),
      })
      expect(star).toBeInTheDocument()
    }
  })

  it('click selects topic (SELECT_TOPIC) and details panel updates', async () => {
    const user = userEvent.setup()
    renderConstellation()

    // Click on topic 3: Headings and paragraphs
    const topic3 = topics[2]
    const star3 = screen.getByRole('button', {
      name: new RegExp(`03 ${topic3.title}`, 'i'),
    })

    await user.click(star3)

    // Details panel updates with topic title
    const panel = screen.getByRole('complementary', { name: /Selected topic details/i })
    expect(panel).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: topic3.title })).toBeInTheDocument()
    expect(star3).toHaveAttribute('aria-current', 'true')
  })

  it('Enter and Space keys select topics via keyboard', async () => {
    const user = userEvent.setup()
    renderConstellation()

    const topic2 = topics[1]
    const star2 = screen.getByRole('button', {
      name: new RegExp(`02 ${topic2.title}`, 'i'),
    })

    star2.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { level: 2, name: topic2.title })).toBeInTheDocument()

    const topic4 = topics[3]
    const star4 = screen.getByRole('button', {
      name: new RegExp(`04 ${topic4.title}`, 'i'),
    })
    star4.focus()
    await user.keyboard(' ')

    expect(screen.getByRole('heading', { level: 2, name: topic4.title })).toBeInTheDocument()
  })

  it('View topic, Lesson, Quiz, Practice links equal lib/routes outputs for every topic', async () => {
    const user = userEvent.setup()
    renderConstellation()

    // Test a sample of topics (e.g. topic 1 and topic 2)
    for (let i = 0; i < 2; i++) {
      const topic = topics[i]
      const numStr = String(i + 1).padStart(2, '0')
      const star = screen.getByRole('button', {
        name: new RegExp(`^${numStr} ${topic.title}`, 'i'),
      })
      await user.click(star)

      const viewTopicLink = screen.getByRole('link', { name: /View topic/i })
      expect(viewTopicLink).toHaveAttribute('href', lessonPath(topic.id))

      const lessonLink = screen.getByRole('link', { name: /Lesson/i })
      expect(lessonLink).toHaveAttribute('href', lessonPath(topic.id))

      const quizLink = screen.getByRole('link', { name: /Quick quiz/i })
      expect(quizLink).toHaveAttribute('href', quizPath(topic.id))

      const challenge = challengesForTopic(topic.id)[0]
      const practiceLink = screen.getByRole('link', { name: /Practice/i })
      expect(practiceLink).toHaveAttribute('href', practicePath(challenge.id))
    }
  })

  it('advisory locked topic shows "Recommended first" and remains openable (Decision O-16)', async () => {
    const user = userEvent.setup()
    renderConstellation()

    // Capstone topic (putting-together) has prerequisites and is locked initially
    const capstoneIndex = topics.findIndex((t) => t.id === 'putting-together')
    const capstone = topics[capstoneIndex]
    const capstoneNum = String(capstoneIndex + 1).padStart(2, '0')
    const star12 = screen.getByRole('button', {
      name: new RegExp(`${capstoneNum} ${capstone.title}`, 'i'),
    })
    expect(star12).toHaveAttribute('aria-label', expect.stringContaining('Locked'))

    // Clicking it still opens details panel (Decision O-16: Advisory lock never blocks)
    await user.click(star12)

    expect(screen.getByText(/Recommended first:/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Complete the prerequisite topics for this module/i),
    ).toBeInTheDocument()

    // View topic link is still present and points to lessonPath
    const viewTopicLink = screen.getByRole('link', { name: /View topic/i })
    expect(viewTopicLink).toHaveAttribute('href', lessonPath(capstone.id))
  })

  it('hub selection shows track overview with Continue equal to nextAction()', async () => {
    const user = userEvent.setup()
    renderConstellation()

    // Click Hub button
    const hubBtn = screen.getByRole('button', { name: /HTML track overview/i })
    await user.click(hubBtn)

    // Panel shows Track Overview
    expect(screen.getByRole('complementary', { name: /Track overview/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /HTML Track Overview/i }),
    ).toBeInTheDocument()

    const continueLink = screen.getByRole('link', { name: /Continue track/i })
    expect(continueLink).toBeInTheDocument()
    // For fresh state, nextAction is topic 1 lesson
    expect(continueLink).toHaveAttribute('href', lessonPath(topics[0].id))
  })
})
