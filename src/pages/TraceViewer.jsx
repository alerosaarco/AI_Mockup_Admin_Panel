import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { TRACES } from '../data/mockData'

const STATUS_CLASS = { success: 'badge-success', error: 'badge-danger' }
const BAR_COLORS   = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b' }

function WaterfallBar({ steps }) {
  const [expanded, setExpanded] = useState(null)
  const totalDur = steps.reduce((s, n) => s + n.duration, 0)
  let offset = 0

  return (
    <div>
      {steps.map((step, i) => {
        const start = offset
        offset += step.duration
        const pct = (step.duration / totalDur) * 100
        const leftPct = (start / totalDur) * 100
        const color = BAR_COLORS[step.status] || '#6366f1'
        const isExp = expanded === i

        return (
          <div key={i}>
            <div
              onClick={() => setExpanded(isExp ? null : i)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', cursor: 'pointer' }}
            >
              <div style={{ width: 160, fontSize: 12, color: '#9ca3af', flexShrink: 0, textAlign: 'right' }}>{step.node}</div>
              <div style={{ flex: 1, height: 22, background: '#0d0d14', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${leftPct}%`, width: `${Math.max(pct, 2)}%`,
                  background: color, borderRadius: 4, opacity: isExp ? 1 : 0.75,
                  transition: 'opacity 0.15s',
                }} />
              </div>
              <div style={{ width: 50, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6b7280', flexShrink: 0 }}>
                {step.duration.toFixed(2)}s
              </div>
              <div style={{ width: 50, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#4b5563', flexShrink: 0 }}>
                {step.tokens}t
              </div>
              <div style={{ width: 16, flexShrink: 0 }}>
                {isExp ? <ChevronUp size={12} color="#6b7280" /> : <ChevronDown size={12} color="#6b7280" />}
              </div>
            </div>
            {isExp && (
              <div style={{ marginLeft: 172, marginBottom: 8, background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
                {step.error && (
                  <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>ERROR: </span>
                    <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5' }}>{step.error}</span>
                  </div>
                )}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Input</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#a5b4fc', lineHeight: 1.6, marginBottom: 10 }}>
                    {`{ "role": "user", "content": "[routed text excerpt]", "tokens": ${Math.floor(step.tokens * 0.4)} }`}
                  </div>
                  <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6ee7b7', lineHeight: 1.6 }}>
                    {step.error ? 'null' : `{ "corrections": [], "confidence": 0.94, "tokens_used": ${Math.floor(step.tokens * 0.6)} }`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TraceViewer() {
  const [source, setSource] = useState('All')
  const [selected, setSelected] = useState(TRACES[0])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = TRACES.filter(t => {
    if (source !== 'All' && t.source !== source) return false
    if (statusFilter !== 'All' && t.status !== statusFilter.toLowerCase()) return false
    if (search && !t.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>
        Trace Viewer
      </h1>

      {/* Top controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
          {['All','CMS','Eval'].map(s => (
            <button key={s} onClick={() => setSource(s)} style={{ padding: '6px 14px', fontSize: 13, border: 'none', cursor: 'pointer', background: source === s ? '#6366f1' : 'transparent', color: source === s ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
          {['All','Success','Error'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', fontSize: 13, border: 'none', cursor: 'pointer', background: statusFilter === s ? '#6366f1' : 'transparent', color: statusFilter === s ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>{s}</button>
          ))}
        </div>
        <div className="card" style={{ padding: '6px 14px', fontSize: 13, color: '#9ca3af' }}>Apr 25 – Apr 30, 2026</div>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input className="input" placeholder="Search trace ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, width: 180 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: 16 }}>
        {/* Trace list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0f0f18' }}>
              <tr>
                {['Trace ID','Date','Source','Duration','Status'].map(h => (
                  <th key={h} className="th" style={{ fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(trace => (
                <tr key={trace.id} className="tr" style={{ cursor: 'pointer', background: selected?.id === trace.id ? 'rgba(99,102,241,0.08)' : 'transparent' }} onClick={() => setSelected(trace)}>
                  <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#818cf8' }}>{trace.id}</td>
                  <td className="td" style={{ fontSize: 11, color: '#6b7280' }}>{trace.date.split(' ')[1]}</td>
                  <td className="td">
                    <span className={`badge ${trace.source === 'CMS' ? 'badge-cyan' : 'badge-indigo'}`} style={{ fontSize: 10 }}>{trace.source}</span>
                  </td>
                  <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{trace.duration}s</td>
                  <td className="td">
                    <span className={`badge ${STATUS_CLASS[trace.status] || 'badge-gray'}`} style={{ fontSize: 10 }}>{trace.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trace detail */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#818cf8' }}>{selected.id}</span>
                <span className={`badge ${STATUS_CLASS[selected.status] || 'badge-gray'}`}>{selected.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6b7280' }}>
                <span>{selected.date}</span>
                <span>·</span>
                <span>{selected.duration}s total</span>
                <span>·</span>
                <span>{selected.tokens.toLocaleString()} tokens</span>
                <span>·</span>
                <span className={`badge ${selected.source === 'CMS' ? 'badge-cyan' : 'badge-indigo'}`}>{selected.source}</span>
              </div>
            </div>

            {/* Waterfall */}
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>
                Execution Timeline
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, paddingLeft: 172 }}>
                <div style={{ flex: 1, fontSize: 10, color: '#4b5563', textAlign: 'center' }}>← {selected.duration}s total →</div>
                <div style={{ width: 50 }} />
                <div style={{ width: 50 }} />
                <div style={{ width: 16 }} />
              </div>
              <WaterfallBar steps={selected.steps} />
            </div>

            {/* Input/Output diff */}
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 12px' }}>
                Input / Output
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Input', selected.input, '#a5b4fc'], ['Output', selected.output || '(no output — error)', selected.output ? '#6ee7b7' : '#4b5563']].map(([label, text, color]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 6, padding: 10, color, lineHeight: 1.6, minHeight: 60 }}>
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
