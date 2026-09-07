import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { InterviewProvider } from './context/InterviewContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage       from './pages/HomePage'
import LoginPage      from './pages/LoginPage'
import SignupPage     from './pages/SignupPage'
import SetupPage      from './pages/SetupPage'
import InterviewPage  from './pages/InterviewPage'
import ResultsPage    from './pages/ResultsPage'
import HistoryPage    from './pages/HistoryPage'
import SessionDetailPage from './pages/SessionDetailPage'
export default function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <Router>
          <Routes>
            {/* Public routes — anyone can access */}
            <Route path="/"        element={<HomePage />}       />
            <Route path="/login"   element={<LoginPage />}      />
            <Route path="/signup"  element={<SignupPage />}     />
            {/* Protected routes — must be logged in */}
            <Route element={<ProtectedRoute />}>
              <Route path="/setup"      element={<SetupPage />}     />
              <Route path="/interview"  element={<InterviewPage />} />
              <Route path="/results"    element={<ResultsPage />}   />
              <Route path="/history"    element={<HistoryPage />}   />
              <Route path="/history/:id"      element={<SessionDetailPage />} /> 
            </Route>
          </Routes>
        </Router>
      </InterviewProvider>
    </AuthProvider>
  )
}