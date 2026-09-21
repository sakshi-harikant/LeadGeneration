import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ---------- Ambient network background (visual only, no logic here) ----------
const NetworkBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, nodes
    let animationId
    const mouse = { x: null, y: null, active: false }

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      const count = Math.min(50, Math.floor((w * h) / 24000))
      nodes = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.4 + 0.5,
      }))
    }

    const step = () => {
      ctx.clearRect(0, 0, w, h)

      for (const n of nodes) {
        if (!reduceMotion) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > w) n.vx *= -1
          if (n.y < 0 || n.y > h) n.vy *= -1

          if (mouse.active) {
            const dx = n.x - mouse.x
            const dy = n.y - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120) {
              const f = ((120 - dist) / 120) * 0.02
              n.x += dx * f
              n.y += dy * f
            }
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            ctx.strokeStyle = `rgba(210,215,235,${(1 - dist / 140) * 0.06})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(225,228,240,0.25)'
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduceMotion) animationId = requestAnimationFrame(step)
    }

    const handleMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true }
    const handleLeave = () => { mouse.active = false }

    resize()
    step()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 900px 600px at 50% 0%, rgba(30,45,110,0.10), transparent 60%), linear-gradient(180deg, rgba(10,13,22,0) 0%, rgba(10,13,22,0.4) 70%, #0A0D16 100%)',
        }}
      />
    </>
  )
}

// ---------- Small presentational helpers ----------
const GlassCard = ({ children, className = '', style = {} }) => (
  <div
    className={`relative rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden ${className}`}
    style={{ background: 'rgba(18,23,43,0.55)', ...style }}
  >
    <div
      className="absolute top-0 left-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
    />
    {children}
  </div>
)

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#5B6478] focus:outline-none focus:border-[#6C8BFF]/60 focus:ring-2 focus:ring-[#3457E0]/20 transition'

const ChangePassword = () => {
  // ---- All logic below is untouched from the original ----
  const [current, setCurrent] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { changePassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword !== confirm) { setError('Passwords do not match'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const result = await changePassword(current, newPassword)
    if (result.success) {
      setMessage('Password changed successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } else {
      setError(result.error || 'Change failed')
    }
    setLoading(false)
  }
  // ---- End untouched logic ----

  return (
    <div className="relative min-h-screen">
      <NetworkBackground />

      <div className="relative z-10 max-w-md mx-auto px-6 py-16">
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
          >
            Change password
          </h1>
          <p className="text-[#8B93A7] text-sm mt-1.5">Update the password on your LeadGen account.</p>
        </div>

        <GlassCard className="p-8" style={{ animation: 'fadeUp .4s ease both' }}>
          {message && (
            <div
              className="mb-5 pl-4 pr-5 py-3 rounded-lg border-l-2 text-sm"
              style={{ borderColor: '#17A34A', background: 'rgba(23,163,74,0.08)', color: '#4ADE80' }}
            >
              {message}
            </div>
          )}
          {error && (
            <div
              className="mb-5 pl-4 pr-5 py-3 rounded-lg border-l-2 text-sm"
              style={{ borderColor: '#E24C4B', background: 'rgba(226,76,75,0.08)', color: '#F87171' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Current password"
                className={inputClass}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className={inputClass}
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className={inputClass}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl border text-white font-semibold transition backdrop-blur disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: 'rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(52,87,224,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,87,224,0.16)' }}
            >
              {loading ? 'Changing…' : 'Change password'}
            </button>
          </form>
        </GlassCard>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default ChangePassword
