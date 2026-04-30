import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Search, RefreshCw } from 'lucide-react'
import { useAssistant } from '../context/AssistantContext'
import { RUN_HISTORY_FULL } from '../data/mockData'
import Toast from '../components/ui/Toast'

const PAGE_SIZE = 20
const TYPE_CLASSES = { 'Eval': 'badge-indigo', 'Eval': 'badge-cyan', 'CMS Live': 'badge-gray' }
const STATUS_CLASS  = { success: 'badge-success', error: 'badge-danger' }

export default function RunHistory() {
  const { selected } = useAssistant()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [expanded, setExpanded] = useState(null)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(false)

  const toggleSort = key => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  const SortIcon = ({ k }) => sort.key === k ? (sort.dir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null

  const filtered = RUN_HISTORY_FULL.filter(r => {
    if (typeFilter !== 'All' && r.type !== typeFilter) return false
    if (statusFilter !== 'All' && r.status !== statusFilter.toLowerCase()) return false
    if (search && !r.id.toLowerCase().includes(search.toLowerCase()) && !r.dataset.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.key] ?? '', bv = b[sort.key] ?? ''
    return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const evalRuns = filtered.filter(r => r.type === 'Eval' || r.type === 'Eval')
  const avgF1 = evalRuns.filter(r => r.avgF1).reduce((s, r) => s + r.avgF1, 0) / (evalRuns.filter(r => r.avgF1).length || 1)

  const MOCK_PROBLEMS = [
    { problem: 'Subject-Verb Agreement', f1: 92 },
    { problem: 'Comma Usage', f1: 88 },
    { problem: 'Sentence Clarity', f1: 84 },
    { problem: 'Redundancy', f1: 79 },
    { problem: 'Passive Voice', f1: 71 },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>
        Run History — {selected?.name}
      </h1>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 24, background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 10, padding: '14px 20px', marginBottom: 20 }}>
        {[
          ['Total runs', filtered.length],
          ['Eval runs', evalRuns.length],
          ['CMS runs', filtered.filter(r => r.type === 'CMS Live').length],
          ['Avg F1 (evals)', avgF1.toFixed(1)],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 11, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input className="input" placeholder="Search run ID or dataset..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, width: 220 }} />
        </div>
        <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
          {['All','Eval','Eval','CMS Live'].map(t => (
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1) }} style={{ padding: '6px 12px', fontSize: 12, border: 'none', cursor: 'pointer', background: typeFilter === t ? '#6366f1' : 'transparent', color: typeFilter === t ? '#fff' : '#9ca3af', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
          {['All','Success','Error'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} style={{ padding: '6px 12px', fontSize: 12, border: 'none', cursor: 'pointer', background: statusFilter === s ? '#6366f1' : 'transparent', color: statusFilter === s ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0f0f18' }}>
            <tr>
              {[['id','Run ID'],['date','Date'],['type','Type'],['dataset','Dataset'],['rows','Rows'],['avgF1','Avg F1'],['avgLatency','Latency'],['tokens','Tokens'],['status','Status']].map(([k,l]) => (
                <th key={k} className="th" onClick={() => toggleSort(k)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{l} <SortIcon k={k} /></span>
                </th>
              ))}
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(run => {
              const isExp = expanded === run.id
              return (
                <>
                  <tr key={run.id} className="tr" style={{ cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : run.id)}>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#818cf8' }}>{run.id}</td>
                    <td className="td" style={{ fontSize: 12 }}>{run.date} <span style={{ color: '#4b5563' }}>{run.time}</span></td>
                    <td className="td">
                      <span className={`badge ${TYPE_CLASSES[run.type] || 'badge-gray'}`} style={{ fontSize: 11 }}>{run.type}</span>
                    </td>
                    <td className="td" style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.dataset}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{run.rows}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: run.avgF1 ? '#a5b4fc' : '#4b5563' }}>{run.avgF1 ?? '—'}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{run.avgLatency}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6b7280' }}>{run.tokens}</td>
                    <td className="td">
                      <span className={`badge ${STATUS_CLASS[run.status] || 'badge-gray'}`} style={{ fontSize: 11 }}>{run.status}</span>
                    </td>
                    <td className="td" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => navigate('/eval-builder')} style={{ fontSize: 11, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>Results</button>
                        <button onClick={() => navigate('/traces')} style={{ fontSize: 11, color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>Trace</button>
                        <button onClick={() => setToast(true)} style={{ fontSize: 11, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <RefreshCw size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExp && (
                    <tr key={`${run.id}-exp`} style={{ background: '#0a0a12' }}>
                      <td colSpan={11} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 24 }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Per-problem breakdown</div>
                            {(run.avgF1 ? MOCK_PROBLEMS : []).map(p => (
                              <div key={p.problem} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
                                <div style={{ width: 160, fontSize: 12, color: '#9ca3af' }}>{p.problem}</div>
                                <div style={{ width: 120, height: 6, background: '#0d0d14', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${p.f1}%`, background: '#6366f1', borderRadius: 3 }} />
                                </div>
                                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a5b4fc', width: 32 }}>{p.f1}</div>
                              </div>
                            ))}
                            {!run.avgF1 && <div style={{ fontSize: 12, color: '#4b5563' }}>No F1 scores — CMS Live run</div>}
                          </div>
                          <div style={{ borderLeft: '1px solid #1e1e2e', paddingLeft: 24 }}>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Summary</div>
                            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.8 }}>
                              <div>Dataset: {run.dataset}</div>
                              <div>Total tokens: {run.tokens}</div>
                              <div>Duration avg: {run.avgLatency}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #1e1e2e' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12, opacity: page === 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 13, background: page === p ? '#6366f1' : '#1e1e2e', color: page === p ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12, opacity: page === totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        </div>
      </div>

      <Toast message="Re-run started — you'll be notified when complete" show={toast} onHide={() => setToast(false)} />
    </div>
  )
}
