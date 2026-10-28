import { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Shell } from './components/Shell'
import { ToastProvider } from './components/Toast'
import { AppStateProvider } from './state/AppState'
import { MilestoneToastListener } from './core/gamification/MilestoneToastListener'
import { ServiceWorkerUpdater } from './core/pwa/ServiceWorkerUpdater'
import { TourProvider } from './core/onboarding/Tour'
import Home from './pages/Home'
import { ClockProvider } from './core/time/Clock'
import { prefetchRoutesOnIdle } from './core/ui/prefetchRoutes'

import { lazyRoute } from './core/ui/lazyRoute'

// Route-level code splitting (Stage 17a, 16.1): Home is eagerly imported; all other routes are lazy
const Explore = lazyRoute(() => import('./pages/Explore'), 'Explore')
const Track = lazyRoute(() => import('./pages/Track'), 'Track')
const Mastery = lazyRoute(() => import('./pages/Mastery'), 'Mastery')
const Lesson = lazyRoute(() => import('./pages/Lesson'), 'Lesson')
const QuizPage = lazyRoute(() => import('./pages/Quiz'), 'Quiz')
const Practice = lazyRoute(() => import('./pages/Practice'), 'Practice')
const Progress = lazyRoute(() => import('./pages/Progress'), 'Progress')
const Review = lazyRoute(() => import('./pages/Review'), 'Review')
const NotesPage = lazyRoute(() => import('./core/notes/NotesPage'), 'NotesPage')
const BookmarksPage = lazyRoute(() => import('./core/notes/BookmarksPage'), 'BookmarksPage')
const Settings = lazyRoute(() => import('./pages/Settings'), 'Settings')
const NotFound = lazyRoute(() => import('./pages/NotFound'), 'NotFound')

const UiGallery = import.meta.env.DEV ? lazyRoute(() => import('./pages/UiGallery'), 'UiGallery') : null
const UiOrbitGallery = import.meta.env.DEV ? lazyRoute(() => import('./pages/UiOrbitGallery'), 'UiOrbitGallery') : null

export default function App() {
  useEffect(() => {
    prefetchRoutesOnIdle()
  }, [])

  return (
    <ErrorBoundary>
      <ClockProvider>
        <AppStateProvider>
          <ToastProvider>
            <MilestoneToastListener />
            <ServiceWorkerUpdater />
            <TourProvider>
              <Routes>
              <Route element={<Shell />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="learn/:technologyId" element={<Track />} />
                <Route path="learn/:technologyId/mastery" element={<Mastery />} />
                <Route path="mastery" element={<Navigate to="/learn/html/mastery" replace />} />
                <Route path="lesson/:topicId" element={<Lesson />} />
                <Route path="quiz/:topicId" element={<QuizPage />} />
                <Route path="practice/:challengeId" element={<Practice />} />
                <Route path="progress" element={<Progress />} />
                <Route path="review" element={<Review />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="bookmarks" element={<BookmarksPage />} />
                <Route path="settings" element={<Settings />} />
                {import.meta.env.DEV && UiGallery && (
                  <Route
                    path="__ui"
                    element={
                      <Suspense fallback={<div className="page">Loading gallery...</div>}>
                        <UiGallery />
                      </Suspense>
                    }
                  />
                )}
                {import.meta.env.DEV && UiOrbitGallery && (
                  <Route
                    path="__ui/orbit"
                    element={
                      <Suspense fallback={<div className="page">Loading orbit fixture...</div>}>
                        <UiOrbitGallery />
                      </Suspense>
                    }
                  />
                )}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </TourProvider>
          </ToastProvider>
        </AppStateProvider>
      </ClockProvider>
    </ErrorBoundary>
  )
}
