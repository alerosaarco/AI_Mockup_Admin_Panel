import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Activity, Zap, Clock, Coins } from 'lucide-react'
import { useAssistant } from '../context/AssistantContext'
import { getNodes, getProblemScores, RECENT_RUNS } from '../data/mockData'
import StatCard from '../components/ui/StatCard'
import Drawer from '../components/ui/Drawer'

const TYPE_COLORS = { LLM: '#818cf8', Tool: '#22d3ee', Router: '#f59e0b' }

function NodeGraph({ nodes, onNodeClick }) {
  const W = 700, H = 280
  const orchestrator = nodes[0]
  const children = nodes.slice(1)
  const gap = W / (children.length + 1)
  const childY = 180
  const orchX = W / 2, orchY = 40
  const childXs = children.map((_, i) => gap * (i + 1))

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
        {/* Arrows from orchestrator to children */}
        {childXs.map((cx, i) => (
          <line key={i}
            x1={orchX} y1={orchY + 56}
            x2={cx} y2={childY}
            stroke="#2a2a3e" strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />
        ))}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a2a3e" />
          </marker>
        </defs>
        {/* Orchestrator node */}
        <foreignObject x={orchX - 80} y={orchY} width={160} height={56}>
          <div
            onClick={() => onNodeClick(orchestrator)}
            style={{
              background: '#1a1a2e', border: '1px solid #6366f1', borderRadius: 8,
              padding: '8px 12px', cursor: 'pointer', height: '100%',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{orchestrator.name}</div>
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 9999,
              background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
            }}>{orchestrator.type}</span>
          </div>
        </foreignObject>
        {/* Child nodes */}
        {children.map((node, i) => (
          <foreignObject key={node.id} x={childXs[i] - 75} y={childY} width={150} height={72}>
            <div
              onClick={() => onNodeClick(node)}
              style={{
                background: '#13131a', border: `1px solid ${TYPE_COLORS[node.type] || '#1e1e2e'}22`,
                borderRadius: 8, padding: '8px 10px', cursor: 'pointer', height: '100%',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>{node.name}</div>
              <span style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 9999,
                background: `${TYPE_COLORS[node.type] || '#6366f1'}22`,
                color: TYPE_COLORS[node.type] || '#818cf8',
              }}>{node.type}</span>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3, lineHeight: 1.3 }}>{node.desc}</div>
            </div>
          </foreignObject>
        ))}
      </svg>
    </div>
  )
}

const STATUS_CLASS = { success: 'badge-success', error: 'badge-danger', running: 'badge-indigo' }

export default function Overview() {
  const { selected } = useAssistant()
  const navigate = useNavigate()
  const [drawerNode, setDrawerNode] = useState(null)

  const nodes = getNodes(selected?.name || 'Grammar & Style')
  const problems = getProblemScores(selected?.name || 'Grammar & Style')

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, marginTop: 0 }}>
        Overview — {selected?.name}
      </h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Latest Eval Score" value="87.3 F1" sub="Last run Apr 30, 2026" icon={Activity} color="indigo" />
        <StatCard label="CMS Acceptance Rate" value="91.2%" sub="Last 30 days" icon={Zap} color="green" />
        <StatCard label="Avg Latency (live)" value="3.4s" sub="P50 over last 24h" icon={Clock} color="cyan" />
        <StatCard label="Token Usage" value="1.2M" sub="Last 30 days" icon={Coins} color="amber" />
      </div>

      {/* Node graph */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Agent Pipeline
          </h2>
          <span style={{ fontSize: 12, color: '#4b5563' }}>Click any node to inspect its prompt</span>
        </div>
        <NodeGraph nodes={nodes} onNodeClick={setDrawerNode} />
      </div>

      {/* Bottom two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Problem score breakdown */}
        <div className="card">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>
            Problem Score Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={problems} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[60, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="problem" type="category" width={160} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }}
                formatter={v => [`F1: ${v}`, '']}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {problems.map((_, i) => (
                  <Cell key={i} fill={`hsl(${240 + i * 15}, 70%, 65%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent runs */}
        <div className="card">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px' }}>
            Recent Runs
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'Type', 'Score', 'Status'].map(h => (
                  <th key={h} className="th" style={{ padding: '6px 8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_RUNS.map(run => (
                <tr key={run.id} className="tr">
                  <td className="td" style={{ padding: '8px 8px', fontSize: 12 }}>{run.date}</td>
                  <td className="td" style={{ padding: '8px 8px' }}>
                    <span className={`badge ${run.type === 'Eval' ? 'badge-indigo' : run.type === 'CMS Live' ? 'badge-cyan' : 'badge-gray'}`} style={{ fontSize: 11 }}>
                      {run.type}
                    </span>
                  </td>
                  <td className="td" style={{ padding: '8px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                    {run.avgF1 ? `${run.avgF1} F1` : '—'}
                  </td>
                  <td className="td" style={{ padding: '8px 8px' }}>
                    <span className={`badge ${STATUS_CLASS[run.status] || 'badge-gray'}`} style={{ fontSize: 11 }}>
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node prompt drawer */}
      <Drawer isOpen={!!drawerNode} onClose={() => setDrawerNode(null)} title={drawerNode?.name || ''}>
        {drawerNode && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <span className="badge badge-gray">{drawerNode.type}</span>
              <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>{drawerNode.desc}</p>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 8, padding: 16, color: '#a5b4fc', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 16 }}>
              {drawerNode.prompt}
            </div>
            <button
              className="btn-primary"
              onClick={() => { navigate('/prompt-editor'); setDrawerNode(null) }}
            >
              Edit in Prompt Editor →
            </button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
