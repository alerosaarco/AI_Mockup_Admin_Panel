import { useAssistant } from '../../context/AssistantContext'

export default function TopBar() {
  const { selected } = useAssistant()

  return (
    <header style={{ background: '#13131a', borderBottom: '1px solid #1e1e2e', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', marginRight: 'auto' }}>
        AI Ops
      </div>

      {/* Center: current assistant */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: selected?.status === 'healthy' ? '#22c55e' : '#f59e0b',
          boxShadow: selected?.status === 'healthy' ? '0 0 6px #22c55e' : '0 0 6px #f59e0b',
        }} />
        <span style={{ color: '#d1d5db', fontSize: 14 }}>{selected?.name}</span>
      </div>

      {/* Right: env badge + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        <span className="badge badge-warning" style={{ fontSize: 11 }}>Admin / Staging</span>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
        }}>
          ML
        </div>
      </div>
    </header>
  )
}
