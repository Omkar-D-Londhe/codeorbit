import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Shell } from './components/Shell'
import { ToastProvider } from './components/Toast'
import { AppStateProvider } from './state/AppState'
import { MilestoneToastListener } from './core/gamification/MilestoneToastListener'
import Explore from './pages/Explore'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import NotFound from './pages/NotFound'
import Practice from './pages/Practice'
import Progress from './pages/Progress'
import QuizPage from './pages/Quiz'
import Review from './pages/Review'
import Track from './pages/Track'
import Settings from './pages/Settings'
import { ClockProvider } from './core/time/Clock'

const UiGallery = import.meta.env.DEV ? lazy(() => import('./pages/UiGallery')) : null
const UiOrbitGallery = import.meta.env.DEV ? lazy(() => import('./pages/UiOrbitGallery')) : null

export default function App() {
  return (
    <ErrorBoundary>
      <ClockProvider>
        <AppStateProvider>
          <ToastProvider>
            <MilestoneToastListener />
            <Routes>
              <Route element={<Shell />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="learn/:technologyId" element={<Track />} />
                <Route path="lesson/:topicId" element={<Lesson />} />
                <Route path="quiz/:topicId" element={<QuizPage />} />
                <Route path="practice/:challengeId" element={<Practice />} />
                <Route path="progress" element={<Progress />} />
                <Route path="review" element={<Review />} />
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
          </ToastProvider>
        </AppStateProvider>
      </ClockProvider>
    </ErrorBoundary>
  )
}
