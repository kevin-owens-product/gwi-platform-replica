import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

// Auth Pages (small, load eagerly for fast first paint)
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import CantLogin from './pages/auth/CantLogin'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResendConfirmation from './pages/auth/ResendConfirmation'

// Layout + ProtectedRoute (needed immediately)
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Lazy-loaded App Pages
const Home = lazy(() => import('./pages/app/Home'))
const AgentSpark = lazy(() => import('./pages/app/AgentSpark'))
const AgentCatalog = lazy(() => import('./pages/app/AgentCatalog'))
const Audiences = lazy(() => import('./pages/app/Audiences'))
const AudienceDetail = lazy(() => import('./pages/app/AudienceDetail'))
const Charts = lazy(() => import('./pages/app/Charts'))
const ChartDetail = lazy(() => import('./pages/app/ChartDetail'))
const Crosstabs = lazy(() => import('./pages/app/Crosstabs'))
const CrosstabDetail = lazy(() => import('./pages/app/CrosstabDetail'))
const Dashboards = lazy(() => import('./pages/app/Dashboards'))
const DashboardDetail = lazy(() => import('./pages/app/DashboardDetail'))
const Canvas = lazy(() => import('./pages/app/Canvas'))
const CanvasAudiences = lazy(() => import('./pages/app/CanvasAudiences'))
const InsightsStudio = lazy(() => import('./pages/app/InsightsStudio'))
const Reports = lazy(() => import('./pages/app/Reports'))
const Questions = lazy(() => import('./pages/app/Questions'))
const DataExplorer = lazy(() => import('./pages/app/DataExplorer'))
const TvStudy = lazy(() => import('./pages/app/TvStudy'))
const PrintRF = lazy(() => import('./pages/app/PrintRF'))
const Settings = lazy(() => import('./pages/app/Settings'))
const Teams = lazy(() => import('./pages/app/Teams'))
const TeamDetail = lazy(() => import('./pages/app/TeamDetail'))
const Projects = lazy(() => import('./pages/app/Projects'))
const ProjectDetail = lazy(() => import('./pages/app/ProjectDetail'))
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px' }}>
      <Loader2 size={28} className="spin" style={{ opacity: 0.5 }} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={useMock ? <Navigate to="/app" replace /> : <SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/cant-login" element={<CantLogin />} />
        <Route path="/password-recovery" element={<ForgotPassword />} />
        <Route path="/resend-confirmation" element={<ResendConfirmation />} />

        {/* App Routes */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="agent-catalog" element={<Suspense fallback={<PageLoader />}><AgentCatalog /></Suspense>} />
          <Route path="agent-spark/:id?" element={<Suspense fallback={<PageLoader />}><AgentSpark /></Suspense>} />
          <Route path="audiences" element={<Suspense fallback={<PageLoader />}><Audiences /></Suspense>} />
          <Route path="data-explorer" element={<Suspense fallback={<PageLoader />}><DataExplorer /></Suspense>} />
          <Route path="audiences/new" element={<Suspense fallback={<PageLoader />}><AudienceDetail isNew /></Suspense>} />
          <Route path="audiences/:id" element={<Suspense fallback={<PageLoader />}><AudienceDetail /></Suspense>} />
          <Route path="chart-builder" element={<Suspense fallback={<PageLoader />}><Charts /></Suspense>} />
          <Route path="chart-builder/questions" element={<Suspense fallback={<PageLoader />}><Questions /></Suspense>} />
          <Route path="chart-builder/chart/:id" element={<Suspense fallback={<PageLoader />}><ChartDetail /></Suspense>} />
          <Route path="crosstabs" element={<Suspense fallback={<PageLoader />}><Crosstabs /></Suspense>} />
          <Route path="crosstabs/new" element={<Suspense fallback={<PageLoader />}><CrosstabDetail isNew /></Suspense>} />
          <Route path="crosstabs/:id" element={<Suspense fallback={<PageLoader />}><CrosstabDetail /></Suspense>} />
          <Route path="dashboards" element={<Suspense fallback={<PageLoader />}><Dashboards /></Suspense>} />
          <Route path="dashboards/:id" element={<Suspense fallback={<PageLoader />}><DashboardDetail /></Suspense>} />
          <Route path="canvas" element={<Suspense fallback={<PageLoader />}><Canvas /></Suspense>} />
          <Route path="canvas/goals" element={<Suspense fallback={<PageLoader />}><Canvas /></Suspense>} />
          <Route path="canvas/audiences" element={<Suspense fallback={<PageLoader />}><CanvasAudiences /></Suspense>} />
          <Route path="insights" element={<Suspense fallback={<PageLoader />}><InsightsStudio /></Suspense>} />
          <Route path="insights/:assetId" element={<Suspense fallback={<PageLoader />}><InsightsStudio /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
          <Route path="tv-study" element={<Suspense fallback={<PageLoader />}><TvStudy /></Suspense>} />
          <Route path="printrf" element={<Suspense fallback={<PageLoader />}><PrintRF /></Suspense>} />
          <Route path="teams" element={<Suspense fallback={<PageLoader />}><Teams /></Suspense>} />
          <Route path="teams/:id" element={<Suspense fallback={<PageLoader />}><TeamDetail /></Suspense>} />
          <Route path="projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
          <Route path="projects/:id" element={<Suspense fallback={<PageLoader />}><ProjectDetail /></Suspense>} />
          <Route path="account-settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
          <Route path="account-settings/:tab" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
