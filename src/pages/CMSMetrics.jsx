import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { MessageSquare, ThumbsUp, ThumbsDown, Users } from 'lucide-react'
import { CMS_DAILY_DATA, CMS_PROBLEM_BREAKDOWN, CMS_CHAPTER_BREAKDOWN, CMS_USER_BREAKDOWN, REJECTION_REASONS } from '../data/mockData'
import StatCard from '../components/ui/StatCard'

const GROUP_BY = ['Problem', 'Chapter', 'User']

function SparkLine({ data }) {
  const max = Math.max(...data), min = Math.min(...data)
  const W = 60, H = 20
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / ((max - min) || 1)) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none" stroke="#22d3ee" strokeWidth={1.5} />
    </svg>
  )
}

function TrendArrow({ v }) {
  return v >= 0
    ? <span style={{ color: '#22c55e', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}><ChevronUp size={12} />{v.toFixed(1)}</span>
    : <span style={{ color: '#ef4444', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}><ChevronDown size={12} />{Math.abs(v).toFixed(1)}</span>
}

export default function CMSMetrics() {
  const [groupBy, setGroupBy] = useState('Problem')
  const [showRejections, setShowRejections] = useState(false)
  const [sort, setSort] = useState({ key: 'rate', dir: 'desc' })

  const toggleSort = key => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))

  const tableData =
    groupBy === 'Problem' ? CMS_PROBLEM_BREAKDOWN :
    groupBy === 'Chapter' ? CMS_CHAPTER_BREAKDOWN :
    CMS_USER_BREAKDOWN

  const sorted = [...tableData].sort((a, b) => {
    const av = a[sort.key] ?? '', bv = b[sort.key] ?? ''
    return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const SortIcon = ({ k }) => sort.key === k ? (sort.dir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>
        CMS Metrics
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="card" style={{ padding: '6px 14px', fontSize: 13, color: '#9ca3af' }}>Apr 1 – Apr 30, 2026</div>
        <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
          {GROUP_BY.map(g => (
            <button key={g} onClick={() => setGroupBy(g)} style={{ padding: '6px 14px', fontSize: 13, border: 'none', cursor: 'pointer', background: groupBy === g ? '#6366f1' : 'transparent', color: groupBy === g ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Suggestions" value="4,821" sub="Last 30 days" icon={MessageSquare} color="indigo" />
        <StatCard label="Accepted" value="4,391" sub="91.1% acceptance rate" icon={ThumbsUp} color="green" />
        <StatCard label="Rejected" value="430" sub="8.9% rejection rate" icon={ThumbsDown} color="amber" />
        <StatCard label="Unique Users" value="34" sub="Active in last 30 days" icon={Users} color="cyan" />
      </div>

      {/* Acceptance rate over time */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>
          Acceptance Rate Over Time
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={CMS_DAILY_DATA} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} interval={4} />
            <YAxis domain={[80, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} unit="%" />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}%`, 'Rate']} />
            <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Acceptance Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown table */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e2e' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Breakdown by {groupBy}
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0f0f18' }}>
            <tr>
              {groupBy === 'Problem' && (
                <>
                  <th className="th" onClick={() => toggleSort('problem')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Problem <SortIcon k="problem" /></span></th>
                  <th className="th" onClick={() => toggleSort('total')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Total <SortIcon k="total" /></span></th>
                  <th className="th" onClick={() => toggleSort('accepted')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Accepted <SortIcon k="accepted" /></span></th>
                  <th className="th" onClick={() => toggleSort('rejected')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Rejected <SortIcon k="rejected" /></span></th>
                  <th className="th" onClick={() => toggleSort('rate')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Rate <SortIcon k="rate" /></span></th>
                  <th className="th">Trend</th>
                </>
              )}
              {groupBy === 'Chapter' && (
                <>
                  <th className="th">Chapter</th>
                  <th className="th">Subject</th>
                  <th className="th" onClick={() => toggleSort('total')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Total <SortIcon k="total" /></span></th>
                  <th className="th" onClick={() => toggleSort('rate')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Rate <SortIcon k="rate" /></span></th>
                  <th className="th">Top Rejection</th>
                </>
              )}
              {groupBy === 'User' && (
                <>
                  <th className="th">User</th>
                  <th className="th">Role</th>
                  <th className="th" onClick={() => toggleSort('total')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Suggestions <SortIcon k="total" /></span></th>
                  <th className="th" onClick={() => toggleSort('rate')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Rate <SortIcon k="rate" /></span></th>
                  <th className="th">Avg Response</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className="tr">
                {groupBy === 'Problem' && (
                  <>
                    <td className="td" style={{ fontWeight: 500 }}>{row.problem}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{row.total.toLocaleString()}</td>
                    <td className="td" style={{ color: '#22c55e', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{row.accepted.toLocaleString()}</td>
                    <td className="td" style={{ color: '#ef4444', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{row.rejected}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a5b4fc' }}>{row.rate}%</td>
                    <td className="td"><SparkLine data={row.trend} /></td>
                  </>
                )}
                {groupBy === 'Chapter' && (
                  <>
                    <td className="td" style={{ fontWeight: 500, fontSize: 13 }}>{row.chapter}</td>
                    <td className="td"><span className="badge badge-gray">{row.subject}</span></td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{row.total}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a5b4fc' }}>{row.rate}%</td>
                    <td className="td" style={{ fontSize: 12, color: '#9ca3af' }}>{row.topRejection}</td>
                  </>
                )}
                {groupBy === 'User' && (
                  <>
                    <td className="td" style={{ fontWeight: 500 }}>{row.user}</td>
                    <td className="td"><span className="badge badge-gray">{row.role}</span></td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{row.total.toLocaleString()}</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a5b4fc' }}>{row.rate}%</td>
                    <td className="td" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{row.avgResponse}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection reasons */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{ padding: '14px 16px', borderBottom: showRejections ? '1px solid #1e1e2e' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onClick={() => setShowRejections(s => !s)}
        >
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Rejection Reasons
          </h2>
          {showRejections ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
        </div>
        {showRejections && (
          <div style={{ padding: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={REJECTION_REASONS} margin={{ left: -10, right: 10 }}>
                <XAxis dataKey="reason" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {REJECTION_REASONS.map((_, i) => (
                    <Cell key={i} fill={`hsl(${240 + i * 20}, 70%, 65%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
