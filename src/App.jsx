import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AssistantProvider } from './context/AssistantContext'
import Layout from './components/layout/Layout'
import Overview from './pages/Overview'
import EvalDashboard from './pages/EvalDashboard'
import EvalBuilder from './pages/EvalBuilder'
import ABTests from './pages/ABTests'
import PromptEditor from './pages/PromptEditor'
import PipelineBuilder from './pages/PipelineBuilder'
import CMSMetrics from './pages/CMSMetrics'
import TraceViewer from './pages/TraceViewer'
import RunHistory from './pages/RunHistory'

export default function App() {
  return (
    <AssistantProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/eval" element={<EvalDashboard />} />
            <Route path="/eval-builder" element={<EvalBuilder />} />
            <Route path="/ab-tests" element={<ABTests />} />
            <Route path="/prompt-editor" element={<PromptEditor />} />
            <Route path="/pipeline-builder" element={<PipelineBuilder />} />
            <Route path="/cms-metrics" element={<CMSMetrics />} />
            <Route path="/traces" element={<TraceViewer />} />
            <Route path="/run-history" element={<RunHistory />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AssistantProvider>
  )
}
