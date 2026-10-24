import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Shell } from './components/Shell'
import { ToastProvider } from './components/Toast'
import { AppStateProvider } from './state/AppState'
import Explore from './pages/Explore'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import NotFound from './pages/NotFound'
import Practice from './pages/Practice'
import Progress from './pages/Progress'
import QuizPage from './pages/Quiz'
import Review from './pages/Review'
import Track from './pages/Track'

export default function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <ToastProvider>
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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AppStateProvider>
    </ErrorBoundary>
  )
}
