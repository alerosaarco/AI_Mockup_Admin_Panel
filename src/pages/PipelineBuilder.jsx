import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Download, Edit3 } from 'lucide-react'
import { useAssistant } from '../context/AssistantContext'
import { getNodes } from '../data/mockData'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'

const TYPE_COLORS = { LLM: '#818cf8', Tool: '#22d3ee', Router: '#f59e0b', Verifier: '#f43f5e' }
const NODE_W = 160
const NODE_H = 80
const W = 780
const H = 440

function defaultPositions(nodes) {
  const orch = { x: W / 2 - NODE_W / 2, y: 40 }
  const children = nodes.slice(1)
  const gap = Math.min(180, (W - 40) / Math.max(children.length, 1))
  const startX = (W - gap * (children.length - 1) - NODE_W) / 2
  return [
    orch,
    ...children.map((_, i) => ({ x: startX + i * gap, y: 200 })),
  ]
}

function defaultConnections(nodes) {
  return nodes.slice(1).map((_, i) => [0, i + 1])
}

export default function PipelineBuilder() {
  const { selected } = useAssistant()
  const navigate = useNavigate()
  const baseNodes = getNodes(selected?.name || 'Grammar & Style')

  const [mode, setMode] = useState('production')
  const [stagingNodes, setStagingNodes] = useState(() => [...baseNodes])
  const [stagingPositions, setStagingPositions] = useState(() => defaultPositions(baseNodes))
  const [stagingConnections, setStagingConnections] = useState(() => defaultConnections(baseNodes))
  const [selectedNode, setSelectedNode] = useState(null)
  const [showGenModal, setShowGenModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(false)
  const [pendingConn, setPendingConn] = useState(null) // { fromIdx, x, y }
  const [newNode, setNewNode] = useState({ name: '', type: 'LLM', desc: '', prompt: '' })

  const dragging = useRef(null)
  const svgRef = useRef(null)

  const prodPositions = defaultPositions(baseNodes)
  const prodConnections = defaultConnections(baseNodes)

  const activeNodes = mode === 'staging' ? stagingNodes : baseNodes
  const activePositions = mode === 'staging' ? stagingPositions : prodPositions
  const activeConnections = mode === 'staging' ? stagingConnections : prodConnections

  const getSvgPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const enterStaging = () => {
    setStagingNodes([...baseNodes])
    setStagingPositions(defaultPositions(baseNodes))
    setStagingConnections(defaultConnections(baseNodes))
    setMode('staging')
    setSelectedNode(null)
  }

  // Drag node
  const onNodeMouseDown = useCallback((e, idx) => {
    if (mode !== 'staging') return
    e.preventDefault()
    e.stopPropagation()
    const pt = getSvgPoint(e)
    dragging.current = {
      idx,
      ox: pt.x - stagingPositions[idx].x,
      oy: pt.y - stagingPositions[idx].y,
    }
    setSelectedNode(stagingNodes[idx])
  }, [mode, stagingPositions, stagingNodes])

  // Start drawing a connection from output port
  const onPortMouseDown = useCallback((e, fromIdx) => {
    e.preventDefault()
    e.stopPropagation()
    const pt = getSvgPoint(e)
    setPendingConn({ fromIdx, x: pt.x, y: pt.y })
  }, [])

  // Finish connection on input port
  const onInputPortMouseUp = useCallback((e, toIdx) => {
    e.stopPropagation()
    if (pendingConn && pendingConn.fromIdx !== toIdx) {
      const already = stagingConnections.some(([a, b]) => a === pendingConn.fromIdx && b === toIdx)
      if (!already) setStagingConnections(prev => [...prev, [pendingConn.fromIdx, toIdx]])
    }
    setPendingConn(null)
  }, [pendingConn, stagingConnections])

  const onSvgMouseMove = useCallback((e) => {
    const pt = getSvgPoint(e)
    if (dragging.current) {
      const { idx, ox, oy } = dragging.current
      setStagingPositions(prev => prev.map((p, i) => i === idx ? {
        x: Math.max(0, Math.min(W - NODE_W, pt.x - ox)),
        y: Math.max(0, Math.min(H - NODE_H, pt.y - oy)),
      } : p))
    }
    if (pendingConn) setPendingConn(p => ({ ...p, x: pt.x, y: pt.y }))
  }, [pendingConn])

  const onSvgMouseUp = useCallback(() => {
    dragging.current = null
    setPendingConn(null)
  }, [])

  const removeNode = (idx) => {
    setStagingNodes(ns => ns.filter((_, i) => i !== idx))
    setStagingPositions(ps => ps.filter((_, i) => i !== idx))
    setStagingConnections(cs => cs
      .filter(([a, b]) => a !== idx && b !== idx)
      .map(([a, b]) => [a > idx ? a - 1 : a, b > idx ? b - 1 : b])
    )
    if (selectedNode?.id === stagingNodes[idx]?.id) setSelectedNode(null)
  }

  const removeConnection = (idx) => {
    setStagingConnections(cs => cs.filter((_, i) => i !== idx))
  }

  const addNode = () => {
    if (!newNode.name.trim()) return
    const node = {
      id: `custom-${Date.now()}`,
      name: newNode.name,
      type: newNode.type,
      desc: newNode.desc || 'Custom node',
      prompt: newNode.prompt || `You are the ${newNode.name}.\n\n`,
    }
    const pos = { x: 80 + (stagingNodes.length % 4) * 170, y: 320 }
    setStagingNodes(ns => [...ns, node])
    setStagingPositions(ps => [...ps, pos])
    setNewNode({ name: '', type: 'LLM', desc: '', prompt: '' })
    setShowAddModal(false)
  }

  // Port positions
  const outputPort = (pos) => ({ cx: pos.x + NODE_W / 2, cy: pos.y + NODE_H })
  const inputPort  = (pos) => ({ cx: pos.x + NODE_W / 2, cy: pos.y })

  return (
    <div>
      {/* Header */}
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
              <button className="btn-secondary" onClick={() => { setMode('production'); setSelectedNode(null) }}>
                Discard Changes
              </button>
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
              {mode === 'staging'
                ? 'Drag nodes to reposition. Drag from a ● port to connect. Click an arrow to remove it.'
                : 'Click a node to inspect.'}
            </span>
            {mode === 'staging' && (
              <button className="btn-secondary" onClick={() => setShowAddModal(true)} style={{ padding: '4px 10px', fontSize: 12 }}>
                <Plus size={12} /> Add Node
              </button>
            )}
          </div>

          <svg
            ref={svgRef}
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            style={{ display: 'block', background: '#0a0a0f', cursor: pendingConn ? 'crosshair' : 'default' }}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
          >
            <defs>
              <marker id="pb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a3a5e" />
              </marker>
              <marker id="pb-arrow-pend" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Connections */}
            {activeConnections.map(([a, b], i) => {
              const pa = activePositions[a]
              const pb = activePositions[b]
              if (!pa || !pb) return null
              const op = outputPort(pa)
              const ip = inputPort(pb)
              const cy1 = op.cy + (ip.cy - op.cy) * 0.5
              const cy2 = ip.cy - (ip.cy - op.cy) * 0.5
              return (
                <g key={i}>
                  {/* Wide invisible hit area */}
                  <path
                    d={`M ${op.cx} ${op.cy} C ${op.cx} ${cy1}, ${ip.cx} ${cy2}, ${ip.cx} ${ip.cy}`}
                    stroke="transparent" strokeWidth={12} fill="none"
                    style={{ cursor: mode === 'staging' ? 'pointer' : 'default' }}
                    onClick={() => mode === 'staging' && removeConnection(i)}
                  />
                  {/* Visual arrow */}
                  <path
                    d={`M ${op.cx} ${op.cy} C ${op.cx} ${cy1}, ${ip.cx} ${cy2}, ${ip.cx} ${ip.cy}`}
                    stroke="#2a2a3e" strokeWidth={1.5} fill="none"
                    markerEnd="url(#pb-arrow)"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              )
            })}

            {/* Pending connection line */}
            {pendingConn && activePositions[pendingConn.fromIdx] && (() => {
              const op = outputPort(activePositions[pendingConn.fromIdx])
              return (
                <line
                  x1={op.cx} y1={op.cy}
                  x2={pendingConn.x} y2={pendingConn.y}
                  stroke="#6366f1" strokeWidth={1.5} strokeDasharray="6,3"
                  markerEnd="url(#pb-arrow-pend)"
                  style={{ pointerEvents: 'none' }}
                />
              )
            })()}

            {/* Nodes */}
            {activeNodes.map((node, i) => {
              const pos = activePositions[i] || { x: 100 + i * 170, y: 60 }
              const isSelected = selectedNode?.id === node.id
              const tc = TYPE_COLORS[node.type] || '#6366f1'
              const op = outputPort(pos)
              const ip = inputPort(pos)

              return (
                <g key={node.id}>
                  {/* Node card */}
                  <foreignObject
                    x={pos.x} y={pos.y} width={NODE_W} height={NODE_H}
                    style={{ overflow: 'visible', userSelect: 'none', cursor: mode === 'staging' ? 'grab' : 'pointer' }}
                    onMouseDown={e => onNodeMouseDown(e, i)}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div style={{
                      background: '#13131a',
                      border: `1.5px solid ${isSelected ? '#6366f1' : tc + '55'}`,
                      borderRadius: 10, padding: '10px 12px', height: '100%', position: 'relative',
                      boxShadow: isSelected ? '0 0 0 2px rgba(99,102,241,0.25)' : 'none',
                      transition: 'border-color 0.15s',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4, paddingRight: 14 }}>{node.name}</div>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 9999, background: `${tc}22`, color: tc }}>{node.type}</span>
                      <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, lineHeight: 1.3 }}>
                        {node.desc.length > 38 ? node.desc.slice(0, 38) + '…' : node.desc}
                      </div>
                      {mode === 'staging' && (
                        <div
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); removeNode(i) }}
                          style={{ position: 'absolute', top: 5, right: 7, cursor: 'pointer', color: '#4b5563', lineHeight: 1 }}
                        >
                          <X size={10} />
                        </div>
                      )}
                    </div>
                  </foreignObject>

                  {/* Input port (top) */}
                  {mode === 'staging' && (
                    <circle
                      cx={ip.cx} cy={ip.cy} r={5}
                      fill="#13131a" stroke={tc} strokeWidth={1.5}
                      style={{ cursor: 'crosshair' }}
                      onMouseUp={e => onInputPortMouseUp(e, i)}
                    />
                  )}

                  {/* Output port (bottom) */}
                  {mode === 'staging' && (
                    <circle
                      cx={op.cx} cy={op.cy} r={5}
                      fill="#6366f1" stroke="#818cf8" strokeWidth={1.5}
                      style={{ cursor: 'crosshair' }}
                      onMouseDown={e => onPortMouseDown(e, i)}
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {mode === 'staging' && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid #1e1e2e', display: 'flex', gap: 16, fontSize: 11, color: '#4b5563' }}>
              <span>● Indigo port = drag to create connection</span>
              <span>Click an arrow to remove it</span>
              <span>✕ on node to remove it</span>
            </div>
          )}
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
                {selectedNode.prompt?.slice(0, 220)}{selectedNode.prompt?.length > 220 ? '…' : ''}
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
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>
                <div>Created: Mar 12, 2026</div>
                <div>Last modified: Apr 24, 2026</div>
                <div>Version: v5</div>
                <div>Nodes: {activeNodes.length}</div>
                <div>Connections: {activeConnections.length}</div>
              </div>
              <p style={{ fontSize: 12, color: '#4b5563', marginTop: 12 }}>Click a node to inspect its details.</p>
              {mode === 'staging' && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', fontSize: 12, color: '#818cf8', lineHeight: 1.6 }}>
                  Tip: Add a <strong>Verifier</strong> node to check another agent's output before it proceeds.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generate Config Modal */}
      <Modal isOpen={showGenModal} onClose={() => setShowGenModal(false)} title="Generate Config Bundle" size="sm">
        <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 16 }}>
          This will generate a LangGraph-compatible config file representing your staging pipeline. An engineer must review and apply this to production.
        </p>
        <div style={{ padding: 12, background: '#0d0d14', borderRadius: 8, border: '1px solid #1e1e2e', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4b5563', lineHeight: 1.8 }}>
          {`{\n  "pipeline": "${selected?.name}",\n  "nodes": ${activeNodes.length},\n  "connections": ${activeConnections.length},\n  "version": "staging-${new Date().toISOString().split('T')[0]}"\n}`}
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { setShowGenModal(false); setToast(true) }}>
          <Download size={14} /> Download Pipeline Bundle (.zip)
        </button>
      </Modal>

      {/* Add Node Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Node" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Node name</label>
            <input className="input" style={{ width: '100%' }} placeholder="e.g. Formality Verifier"
              value={newNode.name} onChange={e => setNewNode(n => ({ ...n, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Type</label>
            <select className="input" style={{ width: '100%' }} value={newNode.type}
              onChange={e => setNewNode(n => ({ ...n, type: e.target.value }))}>
              {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
            </select>
            {newNode.type === 'Verifier' && (
              <p style={{ fontSize: 11, color: '#f43f5e', marginTop: 6 }}>
                Verifier nodes check another agent's output before the pipeline continues.
              </p>
            )}
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Description</label>
            <input className="input" style={{ width: '100%' }} placeholder="Brief one-line description"
              value={newNode.desc} onChange={e => setNewNode(n => ({ ...n, desc: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Initial prompt</label>
            <textarea className="input" rows={4} style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, resize: 'none' }}
              placeholder={`You are the ${newNode.name || 'new agent'}.\n\n`}
              value={newNode.prompt} onChange={e => setNewNode(n => ({ ...n, prompt: e.target.value }))} />
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={addNode}>
            <Plus size={14} /> Add Node
          </button>
        </div>
      </Modal>

      <Toast message="Pipeline bundle downloaded" show={toast} onHide={() => setToast(false)} />
    </div>
  )
}
