import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart2, Database, GitBranch, FileText, Workflow, TrendingUp, Activity, Clock } from 'lucide-react'
import { useAssistant } from '../../context/AssistantContext'

const NAV = [
  { to: '/overview',          label: 'Overview',          Icon: LayoutDashboard },
  { to: '/eval',              label: 'Eval Dashboard',    Icon: BarChart2 },
  { to: '/eval-builder',      label: 'Eval Builder',      Icon: Database },
  { to: '/ab-tests',          label: 'A/B Tests',         Icon: GitBranch },
  { to: '/prompt-editor',     label: 'Prompt Editor',     Icon: FileText },
  { to: '/pipeline-builder',  label: 'Pipeline Builder',  Icon: Workflow },
  { to: '/cms-metrics',       label: 'CMS Metrics',       Icon: TrendingUp },
  { to: '/traces',            label: 'Trace Viewer',      Icon: Activity },
  { to: '/run-history',       label: 'Run History',       Icon: Clock },
]

export default function Sidebar() {
  const { assistants, selected, setSelected } = useAssistant()

  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#0d0d14', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Assistant selector */}
      <div style={{ padding: '12px 8px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 4 }}>
          Assistant
        </div>
        {assistants.map(a => (
          <button
            key={a.id}
            onClick={() => setSelected(a)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '7px 10px', borderRadius: 6,
              background: selected?.id === a.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              borderLeft: selected?.id === a.id ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer', border: 'none', outline: 'none',
              transition: 'background 0.15s',
              marginBottom: 1,
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: a.status === 'healthy' ? '#22c55e' : '#f59e0b',
            }} />
            <span style={{
              fontSize: 13, color: selected?.id === a.id ? '#e2e8f0' : '#9ca3af',
              textAlign: 'left', lineHeight: 1.3,
            }}>
              {a.name}
            </span>
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #1e1e2e', margin: '4px 0' }} />

      {/* Navigation */}
      <nav style={{ padding: '8px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 4 }}>
          Navigation
        </div>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 6, marginBottom: 1,
              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: isActive ? '#e2e8f0' : '#6b7280',
              textDecoration: 'none', fontSize: 13,
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} color={isActive ? '#818cf8' : '#4b5563'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
