import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

export default function Toast({ message, show, onHide }) {
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onHide, 3000)
    return () => clearTimeout(t)
  }, [show, onHide])

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      background: '#13131a', border: '1px solid rgba(99,102,241,0.4)',
      borderRadius: 10, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.2s, transform 0.2s',
      pointerEvents: show ? 'all' : 'none',
    }}>
      <CheckCircle size={16} color="#22c55e" />
      <span style={{ fontSize: 14, color: '#e2e8f0' }}>{message}</span>
    </div>
  )
}
