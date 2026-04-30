import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChevronDown, ChevronUp, Play } from 'lucide-react'
import { useAssistant } from '../context/AssistantContext'
import { EVAL_TREND_DATA, EVAL_PROBLEM_TABLE, EVAL_RUN_HISTORY, PROBLEM_TREND_COLORS } from '../data/mockData'

const RUN_TYPES = ['All', 'Eval', 'Quick Eval']
const STATUS_CLASS = { success: 'badge-success', error: 'badge-danger' }

function sortData(arr, key, dir) {
  return [...arr].sort((a, b) => {
    const av = a[key] ?? -Infinity, bv = b[key] ?? -Infinity
    return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })
}

export default function EvalDashboard() {
  const { selected } = useAssistant()
  const navigate = useNavigate()
  const [runType, setRunType] = useState('All')
  const [expandedRow, setExpandedRow] = useState(null)
  const [sort, setSort] = useState({ key: 'latestF1', dir: 'desc' })

  const toggleSort = key => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  const SortIcon = ({ k }) => sort.key === k ? (sort.dir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null

  const filteredRuns = runType === 'All' ? EVAL_RUN_HISTORY : EVAL_RUN_HISTORY.filter(r => r.type === runType)
  const sortedProblems = sortData(EVAL_PROBLEM_TABLE, sort.key, sort.dir)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
          Eval Dashboard — {selected?.name}
        </h1>
        <button className="btn-primary" onClick={() => navigate('/eval-builder')}>
          <Play size={14} /> Run New Eval →
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <div className="card" style={{ padding: '6px 14px', fontSize: 13, color: '#9ca3af' }}>
          Apr 1 – Apr 30, 2026
        </div>
        <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
          {RUN_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setRunType(t)}
              style={{
                padding: '6px 14px', fontSize: 13, border: 'none', cursor: 'pointer',
                background: runType === t ? '#6366f1' : 'transparent',
                color: runType === t ? '#fff' : '#9ca3af',
                transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Score trend chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>
          Score Trend (Last 8 Evals)
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={EVAL_TREND_DATA} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis domain={[65, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {Object.entries(PROBLEM_TREND_COLORS).map(([k, c]) => (
              <Line key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Problem breakdown table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 4px' }}>
          Problem Breakdown
        </h2>
        <p style={{ fontSize: 12, color: '#4b5563', marginBottom: 12 }}>Click a row to expand run history</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[['problem','Problem'],['latestF1','Latest F1'],['prevF1','Prev F1'],['rowsEvaluated','# Rows'],['lastRun','Last Run']].map(([k,l]) => (
                <th key={k} className="th" onClick={() => toggleSort(k)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{l} <SortIcon k={k} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedProblems.map(row => {
              const delta = row.latestF1 - row.prevF1
              const expanded = expandedRow === row.problem
              return (
                <>
                  <tr key={row.problem} className="tr" style={{ cursor: 'pointer' }} onClick={() => setExpandedRow(expanded ? null : row.problem)}>
                    <td className="td">{row.problem}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a5b4fc' }}>{row.latestF1}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6b7280' }}>{row.prevF1}</td>
                    <td className="td">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: delta >= 0 ? '#22c55e' : '#ef4444' }}>
                        {delta >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {Math.abs(delta).toFixed(1)}
                      </span>
                    </td>
                    <td className="td">{row.rowsEvaluated}</td>
                    <td className="td" style={{ fontSize: 12, color: '#6b7280' }}>{row.lastRun}</td>
                  </tr>
                  {expanded && (
                    <tr key={`${row.problem}-exp`} style={{ background: '#0f0f18' }}>
                      <td colSpan={6} style={{ padding: '8px 16px 12px' }}>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Last 3 runs:</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {row.history.map((score, i) => (
                            <div key={i} style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 6, padding: '6px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#a5b4fc' }}>
                              {score}
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

      {/* Run history table */}
      <div className="card">
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 12px' }}>
          Run History
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Run ID','Date','Type','Dataset','Rows','Avg F1','Status','Actions'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map(run => (
              <tr key={run.id} className="tr">
                <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#818cf8' }}>{run.id}</td>
                <td className="td" style={{ fontSize: 12 }}>{run.date}</td>
                <td className="td">
                  <span className={`badge ${run.type === 'Eval' ? 'badge-indigo' : run.type === 'Quick Eval' ? 'badge-cyan' : 'badge-gray'}`} style={{ fontSize: 11 }}>
                    {run.type}
                  </span>
                </td>
                <td className="td" style={{ fontSize: 12 }}>{run.dataset}</td>
                <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{run.rows}</td>
                <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: run.avgF1 ? '#a5b4fc' : '#4b5563' }}>
                  {run.avgF1 ?? '—'}
                </td>
                <td className="td">
                  <span className={`badge ${STATUS_CLASS[run.status] || 'badge-gray'}`} style={{ fontSize: 11 }}>{run.status}</span>
                </td>
                <td className="td">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate('/eval-builder')} style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      View Results
                    </button>
                    <button onClick={() => navigate('/traces')} style={{ fontSize: 12, color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      View Traces
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
