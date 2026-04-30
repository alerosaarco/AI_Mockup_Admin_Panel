const COLORS = {
  indigo: { bg: 'rgba(99,102,241,0.12)', text: '#818cf8' },
  cyan:   { bg: 'rgba(34,211,238,0.12)', text: '#22d3ee' },
  green:  { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e' },
  amber:  { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
}

export default function StatCard({ label, value, sub, icon: Icon, color = 'indigo' }) {
  const c = COLORS[color] || COLORS.indigo
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} color={c.text} />
          </div>
        )}
      </div>
    </div>
  )
}
