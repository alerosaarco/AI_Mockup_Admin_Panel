import { useState } from 'react'
import { Plus, Play, Edit2, Trash2, ChevronDown, ChevronUp, Check, X as XIcon, Search } from 'lucide-react'
import { useAssistant } from '../context/AssistantContext'
import { GOLDEN_DATASET_ROWS } from '../data/mockData'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'

const PROBLEM_TYPES = ['Subject-Verb Agreement', 'Comma Usage', 'Sentence Clarity', 'Redundancy', 'Passive Voice']
const JUDGE_FILTERS = ['All', 'Correct', 'Incorrect', 'Pending']
const PROBLEM_COLORS = {
  'Subject-Verb Agreement': '#818cf8',
  'Comma Usage': '#22d3ee',
  'Sentence Clarity': '#22c55e',
  'Redundancy': '#f59e0b',
  'Passive Voice': '#ef4444',
}

function JudgeBadge({ result }) {
  if (result === 'correct')   return <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Check size={13} /> Correct</span>
  if (result === 'incorrect') return <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><XIcon size={13} /> Incorrect</span>
  return <span style={{ color: '#6b7280', fontSize: 13 }}>Pending</span>
}

export default function EvalBuilder() {
  const { selected } = useAssistant()
  const [expandedRow, setExpandedRow] = useState(null)
  const [judgeFilter, setJudgeFilter] = useState('All')
  const [problemFilter, setProblemFilter] = useState([])
  const [search, setSearch] = useState('')
  const [showRunModal, setShowRunModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [runRange, setRunRange] = useState('full')
  const [toast, setToast] = useState(false)

  const filtered = GOLDEN_DATASET_ROWS.filter(r => {
    if (judgeFilter !== 'All' && r.judgeResult !== judgeFilter.toLowerCase()) return false
    if (problemFilter.length > 0 && !problemFilter.includes(r.problemType)) return false
    if (search && !r.inputText.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleRunEval = () => {
    setShowRunModal(false)
    setToast(true)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
            {selected?.name} — Golden Dataset v3
          </h1>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280' }}>
            <span>142 rows</span>
            <span>·</span>
            <span>Last updated: Apr 22, 2026</span>
            <span>·</span>
            <span>Last run: Apr 28, 2026</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Rows
          </button>
          <button className="btn-primary" onClick={() => setShowRunModal(true)}>
            <Play size={14} /> Run Eval
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input className="input" placeholder="Search input text..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, width: 220 }} />
        </div>
        <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
          {JUDGE_FILTERS.map(f => (
            <button key={f} onClick={() => setJudgeFilter(f)} style={{ padding: '6px 12px', fontSize: 12, border: 'none', cursor: 'pointer', background: judgeFilter === f ? '#6366f1' : 'transparent', color: judgeFilter === f ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PROBLEM_TYPES.map(pt => (
            <button
              key={pt}
              onClick={() => setProblemFilter(pf => pf.includes(pt) ? pf.filter(x => x !== pt) : [...pf, pt])}
              style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 9999, border: '1px solid', cursor: 'pointer',
                background: problemFilter.includes(pt) ? `${PROBLEM_COLORS[pt]}22` : 'transparent',
                color: problemFilter.includes(pt) ? PROBLEM_COLORS[pt] : '#6b7280',
                borderColor: problemFilter.includes(pt) ? `${PROBLEM_COLORS[pt]}44` : '#1e1e2e',
                transition: 'all 0.15s',
              }}
            >
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0f0f18' }}>
            <tr>
              {['#','Problem Type','Input Text','Expected Output','AI Output','LLM Judge','Score','Actions'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const expanded = expandedRow === row.id
              return (
                <>
                  <tr key={row.id} className="tr" style={{ cursor: 'pointer' }} onClick={() => setExpandedRow(expanded ? null : row.id)}>
                    <td className="td" style={{ color: '#4b5563', width: 40 }}>{row.id}</td>
                    <td className="td">
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: `${PROBLEM_COLORS[row.problemType] || '#6366f1'}18`, color: PROBLEM_COLORS[row.problemType] || '#818cf8', whiteSpace: 'nowrap' }}>
                        {row.problemType}
                      </span>
                    </td>
                    <td className="td" style={{ maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{row.inputText}</div>
                    </td>
                    <td className="td" style={{ maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{row.expectedOutput}</div>
                    </td>
                    <td className="td" style={{ maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: row.aiOutput ? '#d1d5db' : '#4b5563' }}>
                        {row.aiOutput || '(not run)'}
                      </div>
                    </td>
                    <td className="td"><JudgeBadge result={row.judgeResult} /></td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a5b4fc' }}>
                      {row.score != null ? row.score.toFixed(2) : '—'}
                    </td>
                    <td className="td" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2 }}><Edit2 size={13} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2 }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${row.id}-exp`} style={{ background: '#0a0a12' }}>
                      <td colSpan={8} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                          {[['Input Text', row.inputText, '#a5b4fc'], ['Expected Output', row.expectedOutput, '#22c55e'], ['AI Output', row.aiOutput || '(not run yet)', row.aiOutput ? '#d1d5db' : '#4b5563']].map(([label, text, color]) => (
                            <div key={label}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: 6, padding: 10, color, lineHeight: 1.6, minHeight: 64 }}>
                                {text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Run Eval Modal */}
      <Modal isOpen={showRunModal} onClose={() => setShowRunModal(false)} title="Run Evaluation" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 12, background: '#0d0d14', borderRadius: 8, border: '1px solid #1e1e2e' }}>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Dataset: <span style={{ color: '#e2e8f0' }}>{selected?.name} — Golden Dataset v3</span></div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280' }}>
              <span>Rows: <span style={{ color: '#a5b4fc' }}>142</span></span>
              <span>Est. cost: <span style={{ color: '#22c55e' }}>$0.84</span></span>
              <span>Est. time: <span style={{ color: '#f59e0b' }}>~3 min</span></span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Row range</div>
            {[['full','Full Dataset (142 rows)'],['custom','Custom range']].map(([v,l]) => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#d1d5db', marginBottom: 6, cursor: 'pointer' }}>
                <input type="radio" checked={runRange === v} onChange={() => setRunRange(v)} style={{ accentColor: '#6366f1' }} />
                {l}
              </label>
            ))}
            {runRange === 'custom' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <input className="input" placeholder="From" style={{ width: 70 }} />
                <span style={{ color: '#6b7280' }}>to</span>
                <input className="input" placeholder="To" style={{ width: 70 }} />
              </div>
            )}
          </div>
          <button className="btn-primary" onClick={handleRunEval} style={{ width: '100%', justifyContent: 'center' }}>
            <Play size={14} /> Start Eval Run
          </button>
        </div>
      </Modal>

      {/* Add Rows Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Dataset Rows" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Paste CSV/JSON or upload a file to add rows to the golden dataset.</p>
          <textarea className="input" rows={6} placeholder={'[\n  {\n    "problemType": "Comma Usage",\n    "inputText": "...",\n    "expectedOutput": "..."\n  }\n]'} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Upload File</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Add Rows</button>
          </div>
        </div>
      </Modal>

      <Toast message="Eval run started — you'll be notified when complete" show={toast} onHide={() => setToast(false)} />
    </div>
  )
}
