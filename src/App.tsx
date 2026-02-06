import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Auth Pages
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import CantLogin from './pages/auth/CantLogin'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResendConfirmation from './pages/auth/ResendConfirmation'

// App Pages
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/app/Home'
import AgentSpark from './pages/app/AgentSpark'
import Audiences from './pages/app/Audiences'
import AudienceDetail from './pages/app/AudienceDetail'
import Charts from './pages/app/Charts'
import ChartDetail from './pages/app/ChartDetail'
import Crosstabs from './pages/app/Crosstabs'
import CrosstabDetail from './pages/app/CrosstabDetail'
import Dashboards from './pages/app/Dashboards'
import DashboardDetail from './pages/app/DashboardDetail'
import Canvas from './pages/app/Canvas'
import CanvasAudiences from './pages/app/CanvasAudiences'
import Reports from './pages/app/Reports'
import Questions from './pages/app/Questions'
import TvStudy from './pages/app/TvStudy'
import PrintRF from './pages/app/PrintRF'
import Settings from './pages/app/Settings'

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/cant-login" element={<CantLogin />} />
        <Route path="/password-recovery" element={<ForgotPassword />} />
        <Route path="/resend-confirmation" element={<ResendConfirmation />} />

        {/* App Routes */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="agent-spark" element={<AgentSpark />} />
          <Route path="audiences" element={<Audiences />} />
          <Route path="audiences/new" element={<AudienceDetail isNew />} />
          <Route path="audiences/:id" element={<AudienceDetail />} />
          <Route path="chart-builder" element={<Charts />} />
          <Route path="chart-builder/questions" element={<Questions />} />
          <Route path="chart-builder/chart/:id" element={<ChartDetail />} />
          <Route path="crosstabs" element={<Crosstabs />} />
          <Route path="crosstabs/new" element={<CrosstabDetail isNew />} />
          <Route path="crosstabs/:id" element={<CrosstabDetail />} />
          <Route path="dashboards" element={<Dashboards />} />
          <Route path="dashboards/:id" element={<DashboardDetail />} />
          <Route path="canvas" element={<Canvas />} />
          <Route path="canvas/goals" element={<Canvas />} />
          <Route path="canvas/audiences" element={<CanvasAudiences />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tv-study" element={<TvStudy />} />
          <Route path="printrf" element={<PrintRF />} />
          <Route path="account-settings" element={<Settings />} />
          <Route path="account-settings/:tab" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
