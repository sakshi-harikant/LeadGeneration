import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ---------- Ambient network background (visual only, no logic here) ----------
// Same particle system used on the homepage and login page: faint connected
// nodes that react gently to the cursor. Purely decorative.
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
      const count = Math.min(70, Math.floor((w * h) / 18000))
      nodes = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
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
            if (dist < 140) {
              const f = ((140 - dist) / 140) * 0.03
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
          if (dist < 150) {
            ctx.strokeStyle = `rgba(210,215,235,${(1 - dist / 150) * 0.10})`
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
        ctx.fillStyle = 'rgba(225,228,240,0.4)'
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
            'radial-gradient(ellipse 900px 600px at 50% 0%, rgba(30,45,110,0.14), transparent 60%), linear-gradient(180deg, rgba(10,13,22,0) 0%, rgba(10,13,22,0.5) 60%, #0A0D16 100%)',
        }}
      />
    </>
  )
}

// ---------- Brand mark (same node-network glyph used on the homepage) ----------
const BrandMark = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(108,139,255,0.55))' }}>
    <line x1="5.5" y1="18.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55" />
    <line x1="18.5" y1="5.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55" />
    <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" stroke="#6C8BFF" strokeWidth="1" opacity="0.25" />
    <circle cx="5.5" cy="18.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3" />
    <circle cx="18.5" cy="5.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3" />
    <circle cx="12" cy="12" r="3" fill="#3457E0" />
  </svg>
)

const SignUp = () => {
  // ---- All auth logic below is untouched from the original ----
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const result = await signup(email, password, fullName)
    if (result.success) {
      navigate('/login')
    } else {
      setError(result.error || 'Signup failed')
    }
    setLoading(false)
  }
  // ---- End untouched logic ----

  return (
    <div className="relative min-h-screen bg-[#0A0D16] flex items-center justify-center px-6 overflow-hidden">
      <NetworkBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BrandMark />
            <span className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              LeadGen
            </span>
          </div>
          <h1
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
          >
            Create your account
          </h1>
          <p className="text-[#8B93A7] text-sm mt-2">Start finding verified leads today</p>
        </div>

        <div
          className="relative p-8 rounded-2xl border border-white/10 backdrop-blur-xl"
          style={{ background: 'rgba(18,23,43,0.55)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
          />

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#5B6478] focus:outline-none focus:border-[#6C8BFF]/60 focus:ring-2 focus:ring-[#3457E0]/20 transition"
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#5B6478] focus:outline-none focus:border-[#6C8BFF]/60 focus:ring-2 focus:ring-[#3457E0]/20 transition"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#5B6478] focus:outline-none focus:border-[#6C8BFF]/60 focus:ring-2 focus:ring-[#3457E0]/20 transition"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#5B6478] focus:outline-none focus:border-[#6C8BFF]/60 focus:ring-2 focus:ring-[#3457E0]/20 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl border border-[#6C8BFF]/50 text-white font-semibold backdrop-blur transition disabled:opacity-50"
              style={{ background: 'rgba(52,87,224,0.16)' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(52,87,224,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,87,224,0.16)' }}
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="text-center text-[#8B93A7] text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6C8BFF] hover:text-white transition">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
