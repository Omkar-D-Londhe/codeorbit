import React, { type ComponentType } from 'react'
import Track from '../../pages/Track'
import Explore from '../../pages/Explore'
import Mastery from '../../pages/Mastery'
import Lesson from '../../pages/Lesson'
import Quiz from '../../pages/Quiz'
import Practice from '../../pages/Practice'
import Progress from '../../pages/Progress'
import Review from '../../pages/Review'
import NotesPage from '../notes/NotesPage'
import BookmarksPage from '../notes/BookmarksPage'
import Settings from '../../pages/Settings'
import NotFound from '../../pages/NotFound'

const componentMap: Record<string, ComponentType<object>> = {
  Track: Track as ComponentType<object>,
  Explore: Explore as ComponentType<object>,
  Mastery: Mastery as ComponentType<object>,
  Lesson: Lesson as ComponentType<object>,
  Quiz: Quiz as ComponentType<object>,
  Practice: Practice as ComponentType<object>,
  Progress: Progress as ComponentType<object>,
  Review: Review as ComponentType<object>,
  NotesPage: NotesPage as ComponentType<object>,
  BookmarksPage: BookmarksPage as ComponentType<object>,
  Settings: Settings as ComponentType<object>,
  NotFound: NotFound as ComponentType<object>,
}

export function lazyRoute<P extends object = object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  name?: string
): ComponentType<P> {
  if ((globalThis as unknown as { __USE_REAL_LAZY__?: boolean }).__USE_REAL_LAZY__) {
    return React.lazy(factory)
  }
  const key = name || factory.toString()
  for (const [k, comp] of Object.entries(componentMap)) {
    if (key.includes(k)) {
      return comp as unknown as ComponentType<P>
    }
  }
  return React.lazy(factory)
}
