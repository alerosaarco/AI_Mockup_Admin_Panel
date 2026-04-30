import { useState } from 'react'
import { Plus, Download, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AB_TESTS } from '../data/mockData'
import Modal from '../components/ui/Modal'

const STATUS_CLASS = { active: 'badge-indigo', completed: 'badge-success', draft: 'badge-gray' }

function DiffView({ diff }) {
  if (!diff) return <div style={{ fontSize: 13, color: '#4b5563', fontFamily: 'JetBrains Mono, monospace', padding: 12 }}>Baseline — no changes</div>
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
      {diff.map((line, i) => (
        <div key={i} style={{
          padding: '3px 12px',
          background: line.type === 'added' ? 'rgba(34,197,94,0.08)' : line.type === 'removed' ? 'rgba(239,68,68,0.08)' : 'transparent',
          color: line.type === 'added' ? '#4ade80' : line.type === 'removed' ? '#f87171' : '#9ca3af',
          borderLeft: `3px solid ${line.type === 'added' ? '#22c55e' : line.type === 'removed' ? '#ef4444' : 'transparent'}`,
          whiteSpace: 'pre-wrap', lineHeight: 1.6,
        }}>
          {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}{line.text}
        </div>
      ))}
    </div>
  )
}

function ComparisonChart({ test }) {
  if (!test.variants[0].scores || Object.keys(test.variants[0].scores).length === 0) return null
  const problems = Object.keys(test.variants[0].scores)
  const data = problems.map(p => {
    const row = { problem: p.split(' ').slice(-1)[0] }
    test.variants.forEach(v => { row[v.id] = v.scores[p] })
    return row
  })
  const COLORS = ['#818cf8', '#22d3ee', '#f59e0b']
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 12px' }}>Variant Comparison</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ left: -20, right: 10 }}>
          <XAxis dataKey="problem" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis domain={[60, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {test.variants.map((v, i) => (
            <Bar key={v.id} dataKey={v.id} name={v.label} fill={COLORS[i]} radius={[3,3,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ABTests() {
  const [selectedTest, setSelectedTest] = useState(AB_TESTS[0])
  const [activeVariant, setActiveVariant] = useState('A')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [newStep, setNewStep] = useState(1)
  const [changeType, setChangeType] = useState('prompt')

  const filtered = statusFilter === 'All' ? AB_TESTS : AB_TESTS.filter(t => t.status === statusFilter.toLowerCase())
  const currentVariant = selectedTest?.variants.find(v => v.id === activeVariant) || selectedTest?.variants[0]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>A/B Test Manager</h1>
        <button className="btn-primary" onClick={() => { setShowNewModal(true); setNewStep(1) }}>
          <Plus size={14} /> New A/B Test
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden', width: 'fit-content', marginBottom: 16 }}>
        {['All','Active','Completed','Draft'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '7px 16px', fontSize: 13, border: 'none', cursor: 'pointer', background: statusFilter === s ? '#6366f1' : 'transparent', color: statusFilter === s ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>{s}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: 16 }}>
        {/* Test list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(test => (
            <div
              key={test.id}
              onClick={() => { setSelectedTest(test); setActiveVariant('A') }}
              style={{
                background: selectedTest?.id === test.id ? 'rgba(99,102,241,0.08)' : '#13131a',
                border: `1px solid ${selectedTest?.id === test.id ? '#6366f1' : '#1e1e2e'}`,
                borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', lineHeight: 1.3 }}>{test.name}</div>
                <span className={`badge ${STATUS_CLASS[test.status]}`} style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{test.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {test.variants.length} variants · Created {test.created}
              </div>
              {test.status !== 'draft' && test.variants[0].scores && Object.keys(test.variants[0].scores).length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {test.variants.map(v => (
                    <span key={v.id} style={{ fontSize: 11, color: '#9ca3af' }}>
                      {v.id}: {v.scores['Subject-Verb Agreement'] || v.scores[Object.keys(v.scores)[0]] || '—'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Test detail */}
        {selectedTest && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>{selectedTest.name}</h2>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Created {selectedTest.created}</div>
              </div>
              <span className={`badge ${STATUS_CLASS[selectedTest.status]}`}>{selectedTest.status}</span>
            </div>

            {/* Variant tabs */}
            <div style={{ display: 'flex', gap: 0, background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden', width: 'fit-content', marginBottom: 16 }}>
              {selectedTest.variants.map(v => (
                <button key={v.id} onClick={() => setActiveVariant(v.id)} style={{ padding: '8px 18px', fontSize: 13, border: 'none', cursor: 'pointer', background: activeVariant === v.id ? '#6366f1' : 'transparent', color: activeVariant === v.id ? '#fff' : '#9ca3af', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Modified nodes */}
            {currentVariant && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Modified nodes:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {currentVariant.isBaseline
                    ? <span className="badge badge-gray">Production baseline — read only</span>
                    : currentVariant.modified.map(m => <span key={m} className="badge badge-indigo">{m}</span>)
                  }
                </div>
              </div>
            )}

            {/* Diff */}
            {currentVariant && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                  {currentVariant.isBaseline ? 'Prompt (read only)' : 'Prompt diff vs. Variant A'}
                </div>
                <DiffView diff={currentVariant.promptDiff} />
              </div>
            )}

            {/* Comparison chart */}
            <ComparisonChart test={selectedTest} />

            {/* Winner banner */}
            {selectedTest.status === 'completed' && selectedTest.winner && (
              <div style={{ marginTop: 16, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Trophy size={18} color="#22c55e" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>{selectedTest.winnerSummary}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Variant {selectedTest.winner} is the recommended winner</div>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setShowExportModal(true)} style={{ background: '#22c55e', whiteSpace: 'nowrap' }}>
                  <Download size={14} /> Export Bundle
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Production Bundle" size="sm">
        <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 16 }}>
          This will package all prompt files and config for <span style={{ color: '#e2e8f0' }}>Variant {selectedTest?.winner}</span> into a <code style={{ background: '#0d0d14', padding: '2px 6px', borderRadius: 4, color: '#a5b4fc' }}>.zip</code> for engineer review and manual production migration.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowExportModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowExportModal(false)}>
            <Download size={14} /> Download Bundle
          </button>
        </div>
      </Modal>

      {/* New A/B Test Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title={`New A/B Test — Step ${newStep} of 4`} size="md">
        <div>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {[1,2,3,4].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 9999, background: s <= newStep ? '#6366f1' : '#1e1e2e', transition: 'background 0.2s' }} />
            ))}
          </div>
          {newStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Test name</label>
                <input className="input" style={{ width: '100%' }} placeholder="e.g. Grammar Agent v2 Test" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Base assistant</label>
                <select className="input" style={{ width: '100%' }}><option>Grammar & Style</option></select>
              </div>
            </div>
          )}
          {newStep === 2 && (
            <div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>What are you changing?</div>
              {[['prompt','Prompt only'],['node','Add or remove a node'],['both','Both']].map(([v,l]) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#d1d5db', marginBottom: 10, cursor: 'pointer' }}>
                  <input type="radio" name="changetype" checked={changeType===v} onChange={() => setChangeType(v)} style={{ accentColor: '#6366f1' }} />
                  {l}
                </label>
              ))}
            </div>
          )}
          {newStep === 3 && (
            <div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Configure Variant B</div>
              <textarea className="input" rows={8} style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, resize: 'none' }} placeholder="Enter the modified prompt for Variant B..." />
            </div>
          )}
          {newStep === 4 && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Ready to create</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Your A/B test will be created as a Draft. Run an eval to gather results.</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {newStep > 1 && <button className="btn-secondary" onClick={() => setNewStep(s => s - 1)} style={{ flex: 1, justifyContent: 'center' }}>Back</button>}
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => newStep < 4 ? setNewStep(s => s + 1) : setShowNewModal(false)}>
              {newStep === 4 ? 'Create Test' : 'Next →'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
