import { useState } from 'react'
import { Copy, Save, Trash2, History, ChevronRight } from 'lucide-react'
import { useAssistant } from '../context/AssistantContext'
import { getNodes, PROMPT_VERSIONS, PROMPT_CONTENTS } from '../data/mockData'
import Toast from '../components/ui/Toast'

function DiffLine({ text, type }) {
  const colors = { added: { bg: 'rgba(34,197,94,0.08)', text: '#4ade80', prefix: '+ ' }, removed: { bg: 'rgba(239,68,68,0.08)', text: '#f87171', prefix: '- ' }, context: { bg: 'transparent', text: '#9ca3af', prefix: '  ' } }
  const c = colors[type] || colors.context
  return (
    <div style={{ background: c.bg, color: c.text, padding: '2px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.6, borderLeft: `3px solid ${type === 'added' ? '#22c55e' : type === 'removed' ? '#ef4444' : 'transparent'}` }}>
      {c.prefix}{text}
    </div>
  )
}

function generateDiff(oldText, newText) {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result = []
  const maxLen = Math.max(oldLines.length, newLines.length)
  for (let i = 0; i < maxLen; i++) {
    if (oldLines[i] === newLines[i]) result.push({ type: 'context', text: oldLines[i] || '' })
    else {
      if (oldLines[i] != null) result.push({ type: 'removed', text: oldLines[i] })
      if (newLines[i] != null) result.push({ type: 'added',   text: newLines[i] })
    }
  }
  return result
}

export default function PromptEditor() {
  const { selected } = useAssistant()
  const nodes = getNodes(selected?.name || 'Grammar & Style')
  const [selectedNode, setSelectedNode] = useState(nodes[1])
  const [selectedVersion, setSelectedVersion] = useState(7)
  const [showDiff, setShowDiff] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [promptText, setPromptText] = useState(PROMPT_CONTENTS[7] || '')
  const [toast, setToast] = useState({ show: false, message: '' })

  const currentNodePrompts = PROMPT_CONTENTS
  const displayPrompt = currentNodePrompts[selectedVersion] || selectedNode?.prompt || ''

  const handleSelectNode = node => {
    setSelectedNode(node)
    setPromptText(PROMPT_CONTENTS[7] || node.prompt || '')
    setSelectedVersion(7)
    setShowDiff(false)
  }

  const handleVersionSelect = v => {
    setSelectedVersion(v)
    setShowDiff(false)
  }

  const diffLines = showDiff ? generateDiff(PROMPT_CONTENTS[6] || '', selectedVersion === 7 ? promptText : (PROMPT_CONTENTS[selectedVersion] || '')) : []

  const handleSave = () => {
    setToast({ show: true, message: 'Saved as v8 (staging)' })
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(promptText).catch(() => {})
    setToast({ show: true, message: 'Prompt copied to clipboard' })
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>
        Prompt Editor — {selected?.name}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Node list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px 8px', fontSize: 11, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Nodes
          </div>
          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => handleSelectNode(node)}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                background: selectedNode?.id === node.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                borderLeft: `3px solid ${selectedNode?.id === node.id ? '#6366f1' : 'transparent'}`,
                borderBottom: '1px solid #1e1e2e', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 13, color: selectedNode?.id === node.id ? '#e2e8f0' : '#9ca3af', fontWeight: selectedNode?.id === node.id ? 500 : 400 }}>
                {node.name}
              </div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>Apr 24, 2026</div>
            </div>
          ))}
        </div>

        {/* Editor panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div className="card" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>{selectedNode?.name}</span>
                  <span className="badge badge-warning">Staging</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Last edited: Apr 24, 2026 by Maria L.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Version selector */}
                <select
                  className="input"
                  value={selectedVersion}
                  onChange={e => handleVersionSelect(Number(e.target.value))}
                  style={{ fontSize: 12 }}
                >
                  {PROMPT_VERSIONS.map(v => (
                    <option key={v.version} value={v.version}>
                      v{v.version}{v.current ? ' (current)' : ''} — {v.date}
                    </option>
                  ))}
                </select>
                {/* Diff toggle */}
                <button
                  onClick={() => setShowDiff(d => !d)}
                  style={{
                    padding: '6px 12px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: showDiff ? '#6366f1' : '#1e1e2e', color: showDiff ? '#fff' : '#9ca3af', transition: 'all 0.15s',
                  }}
                >
                  View Diff
                </button>
                <button onClick={() => setShowHistory(h => !h)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex' }}>
                  <History size={16} />
                </button>
              </div>
            </div>

            {/* Diff or editor */}
            {showDiff ? (
              <div style={{ background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden', maxHeight: 400, overflowY: 'auto' }}>
                <div style={{ padding: '6px 12px', background: '#0d0d14', borderBottom: '1px solid #1e1e2e', fontSize: 11, color: '#6b7280' }}>
                  Showing diff: v{selectedVersion - 1} → v{selectedVersion}
                </div>
                {diffLines.map((l, i) => <DiffLine key={i} text={l.text} type={l.type} />)}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <textarea
                  value={selectedVersion === 7 ? promptText : (PROMPT_CONTENTS[selectedVersion] || '')}
                  onChange={e => selectedVersion === 7 ? setPromptText(e.target.value) : null}
                  readOnly={selectedVersion !== 7}
                  style={{
                    width: '100%', minHeight: 380, background: '#0a0a0f', border: '1px solid #1e1e2e',
                    borderRadius: 8, padding: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                    color: '#a5b4fc', lineHeight: 1.7, resize: 'vertical', outline: 'none',
                    opacity: selectedVersion !== 7 ? 0.7 : 1,
                  }}
                />
                <div style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 11, color: '#4b5563' }}>
                  {promptText.length} chars
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, padding: '12px 16px', display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={14} /> Save as new version
            </button>
            <button className="btn-secondary" onClick={() => { setPromptText(PROMPT_CONTENTS[7] || ''); setToast({ show: true, message: 'Changes discarded' }) }}>
              <Trash2 size={14} /> Discard changes
            </button>
            <button className="btn-secondary" onClick={handleCopy} style={{ marginLeft: 'auto' }}>
              <Copy size={14} /> Copy prompt
            </button>
          </div>
        </div>
      </div>

      {/* Version history sidebar */}
      {showHistory && (
        <div style={{ position: 'fixed', top: 56, right: 0, bottom: 0, width: 320, background: '#13131a', borderLeft: '1px solid #1e1e2e', zIndex: 500, overflowY: 'auto', animation: 'slide-in 0.2s ease-out' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#e2e8f0' }}>Version History</span>
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          {PROMPT_VERSIONS.map(v => (
            <div
              key={v.version}
              onClick={() => { handleVersionSelect(v.version); setShowHistory(false) }}
              style={{ padding: '12px 20px', borderBottom: '1px solid #1e1e2e', cursor: 'pointer', background: selectedVersion === v.version ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'background 0.15s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>v{v.version}</span>
                {v.current && <span className="badge badge-indigo" style={{ fontSize: 10 }}>current</span>}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{v.date} · {v.author}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{v.note}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
      <Toast message={toast.message} show={toast.show} onHide={() => setToast(t => ({ ...t, show: false }))} />
    </div>
  )
}
