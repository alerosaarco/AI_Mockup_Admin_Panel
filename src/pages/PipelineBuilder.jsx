import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Download, Edit3 } from 'lucide-react'
import { useAssistant } from '../context/AssistantContext'
import { getNodes } from '../data/mockData'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'

const TYPE_COLORS = { LLM: '#818cf8', Tool: '#22d3ee', Router: '#f59e0b' }

const INITIAL_POSITIONS = [
  { x: 320, y: 40 },
  { x: 80,  y: 180 },
  { x: 240, y: 180 },
  { x: 400, y: 180 },
  { x: 560, y: 180 },
]

const CONNECTIONS = [[0,1],[0,2],[0,3],[0,4]]

export default function PipelineBuilder() {
  const { selected } = useAssistant()
  const navigate = useNavigate()
  const nodes = getNodes(selected?.name || 'Grammar & Style')

  const [mode, setMode] = useState('production') // 'production' | 'staging'
  const [positions, setPositions] = useState(() => nodes.map((_, i) => INITIAL_POSITIONS[i] || { x: 100 + i * 160, y: 180 }))
  const [selectedNode, setSelectedNode] = useState(null)
  const [showGenModal, setShowGenModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [stagingNodes, setStagingNodes] = useState(nodes)
  const [stagingPositions, setStagingPositions] = useState(positions)
  const [toast, setToast] = useState(false)

  const dragging = useRef(null)
  const svgRef = useRef(null)

  const activeNodes = mode === 'staging' ? stagingNodes : nodes
  const activePositions = mode === 'staging' ? stagingPositions : positions
  const setActivePositions = mode === 'staging' ? setStagingPositions : setPositions

  const enterStaging = () => {
    setStagingNodes([...nodes])
    setStagingPositions([...positions])
    setMode('staging')
  }

  const onMouseDown = useCallback((e, idx) => {
    if (mode !== 'staging') return
    e.preventDefault()
    const rect = svgRef.current.getBoundingClientRect()
    dragging.current = { idx, ox: e.clientX - rect.left - activePositions[idx].x, oy: e.clientY - rect.top - activePositions[idx].y }
  }, [mode, activePositions])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const { idx, ox, oy } = dragging.current
    setActivePositions(prev => prev.map((p, i) => i === idx ? { x: e.clientX - rect.left - ox, y: e.clientY - rect.top - oy } : p))
  }, [setActivePositions])

  const onMouseUp = useCallback(() => { dragging.current = null }, [])

  const removeNode = (idx) => {
    setStagingNodes(ns => ns.filter((_, i) => i !== idx))
    setStagingPositions(ps => ps.filter((_, i) => i !== idx))
    if (selectedNode?.id === stagingNodes[idx]?.id) setSelectedNode(null)
  }

  const W = 760, H = 320

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
          Pipeline Builder — {selected?.name}
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {mode === 'production' ? (
            <>
              <span style={{ fontSize: 13, color: '#9ca3af', padding: '6px 12px', background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8 }}>
                Viewing Production Pipeline
              </span>
              <button className="btn-primary" onClick={enterStaging}>
                <Edit3 size={14} /> Edit in Staging
              </button>
            </>
          ) : (
            <>
              <span className="badge badge-warning" style={{ fontSize: 12, padding: '6px 12px' }}>Staging Mode</span>
              <button className="btn-secondary" onClick={() => { setMode('production'); setSelectedNode(null) }}>Discard Changes</button>
              <button className="btn-primary" onClick={() => setShowGenModal(true)}>
                <Download size={14} /> Generate Config Bundle
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
        {/* Canvas */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {mode === 'staging' ? 'Drag nodes to reorder. Click to inspect.' : 'Click a node to inspect.'}
            </span>
            {mode === 'staging' && (
              <button className="btn-secondary" onClick={() => setShowAddModal(true)} style={{ padding: '4px 10px', fontSize: 12 }}>
                <Plus size={12} /> Add Node
              </button>
            )}
          </div>
          <svg
            ref={svgRef}
            width="100%" viewBox={`0 0 ${W} ${H}`}
            style={{ display: 'block', cursor: mode === 'staging' ? 'grab' : 'default', background: '#0a0a0f' }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <defs>
              <marker id="pb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a2a3e" />
              </marker>
            </defs>
            {/* Connections */}
            {CONNECTIONS.filter(([a,b]) => a < activeNodes.length && b < activeNodes.length).map(([a, b], i) => {
              const pa = activePositions[a] || { x: 0, y: 0 }
              const pb = activePositions[b] || { x: 0, y: 0 }
              const mx = (pa.x + 80 + pb.x + 75) / 2
              const my = (pa.y + 28 + pb.y) / 2
              return (
                <path key={i}
                  d={`M ${pa.x + 80} ${pa.y + 28} C ${pa.x + 80} ${my + 20}, ${pb.x + 75} ${my - 20}, ${pb.x + 75} ${pb.y}`}
                  stroke="#2a2a3e" strokeWidth={1.5} fill="none" markerEnd="url(#pb-arrow)"
                />
              )
            })}
            {/* Nodes */}
            {activeNodes.map((node, i) => {
              const pos = activePositions[i] || { x: 100 + i*160, y: 60 }
              const isSelected = selectedNode?.id === node.id
              const tc = TYPE_COLORS[node.type] || '#6366f1'
              return (
                <foreignObject
                  key={node.id}
                  x={pos.x} y={pos.y} width={160} height={80}
                  style={{ cursor: mode === 'staging' ? 'grab' : 'pointer', userSelect: 'none', overflow: 'visible' }}
                  onMouseDown={e => { onMouseDown(e, i); setSelectedNode(node) }}
                  onClick={() => setSelectedNode(node)}
                >
                  <div style={{
                    background: '#13131a', border: `1.5px solid ${isSelected ? '#6366f1' : tc + '44'}`,
                    borderRadius: 10, padding: '10px 12px', height: '100%', position: 'relative',
                    boxShadow: isSelected ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none',
                    transition: 'border-color 0.15s',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{node.name}</div>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 9999, background: `${tc}22`, color: tc }}>{node.type}</span>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, lineHeight: 1.3 }}>{node.desc.slice(0, 40)}</div>
                    {mode === 'staging' && (
                      <div
                        onClick={e => { e.stopPropagation(); removeNode(i) }}
                        style={{ position: 'absolute', top: 4, right: 6, cursor: 'pointer', color: '#4b5563', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}
                      >
                        <X size={10} />
                      </div>
                    )}
                  </div>
                </foreignObject>
              )
            })}
          </svg>
        </div>

        {/* Inspector */}
        <div className="card">
          {selectedNode ? (
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 12px' }}>
                {selectedNode.name}
              </h3>
              <div style={{ marginBottom: 10 }}>
                <span className="badge" style={{ background: `${TYPE_COLORS[selectedNode.type] || '#6366f1'}22`, color: TYPE_COLORS[selectedNode.type] || '#818cf8', border: `1px solid ${TYPE_COLORS[selectedNode.type] || '#6366f1'}44` }}>
                  {selectedNode.type}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12, lineHeight: 1.5 }}>{selectedNode.desc}</p>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 6, padding: 10, color: '#a5b4fc', lineHeight: 1.6, maxHeight: 160, overflowY: 'auto', marginBottom: 12 }}>
                {selectedNode.prompt?.slice(0, 200)}...
              </div>
              <button className="btn-secondary" onClick={() => navigate('/prompt-editor')} style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                Edit in Prompt Editor →
              </button>
            </div>
          ) : (
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 12px' }}>
                Pipeline Info
              </h3>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.8 }}>
                <div>Created: Mar 12, 2026</div>
                <div>Last modified: Apr 24, 2026</div>
                <div>Version: v5</div>
                <div>Nodes: {activeNodes.length}</div>
              </div>
              <p style={{ fontSize: 12, color: '#4b5563', marginTop: 12 }}>Click a node to inspect its details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Config Modal */}
      <Modal isOpen={showGenModal} onClose={() => setShowGenModal(false)} title="Generate Config Bundle" size="sm">
        <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 16 }}>
          This will generate a LangGraph-compatible config file and boilerplate representing your staging pipeline. An engineer must review and apply this to production.
        </p>
        <div style={{ padding: 12, background: '#0d0d14', borderRadius: 8, border: '1px solid #1e1e2e', marginBottom: 16 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#4b5563' }}>
            {`{\n  "pipeline": "${selected?.name}",\n  "nodes": ${activeNodes.length},\n  "version": "staging-${new Date().toISOString().split('T')[0]}"\n}`}
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setShowGenModal(false); setToast(true) }}>
          <Download size={14} /> Download Pipeline Bundle (.zip)
        </button>
      </Modal>

      {/* Add Node Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Node" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['Node name','text','e.g. Formality Agent'],['Type','select',''],['Description','text','Brief one-line description']].map(([label, type, placeholder]) => (
            <div key={label}>
              <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 4 }}>{label}</label>
              {type === 'select'
                ? <select className="input" style={{ width: '100%' }}>{['LLM','Tool','Router'].map(t => <option key={t}>{t}</option>)}</select>
                : <input className="input" style={{ width: '100%' }} placeholder={placeholder} />
              }
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Initial prompt</label>
            <textarea className="input" rows={4} style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, resize: 'none' }} />
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Add Node</button>
        </div>
      </Modal>

      <Toast message="Pipeline bundle downloaded" show={toast} onHide={() => setToast(false)} />
    </div>
  )
}
