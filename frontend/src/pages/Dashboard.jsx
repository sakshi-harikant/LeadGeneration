import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
    className={`relative rounded-xl border border-white/10 backdrop-blur-xl overflow-hidden ${className}`}
    style={{ background: 'rgba(18,23,43,0.55)', ...style }}
  >
    <div
      className="absolute top-0 left-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
    />
    {children}
  </div>
)

const SkeletonBlock = ({ className = '' }) => (
  <div className={`rounded-xl border border-white/10 animate-pulse ${className}`} style={{ background: 'rgba(18,23,43,0.4)' }} />
)

// Animates a number counting up from 0 to `value` whenever `value` changes.
const useCountUp = (value, duration = 700) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const from = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return display
}

const AnimatedNumber = ({ value, style, className }) => {
  const display = useCountUp(value)
  return <span style={style} className={className}>{display}</span>
}

// Circular progress ring for the headline verification rate.
const ProgressRing = ({ percent, size = 132, stroke = 10, color = '#17A34A' }) => {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOffset(circumference - (percent / 100) * circumference)
    })
    return () => cancelAnimationFrame(id)
  }, [percent, circumference])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)', filter: `drop-shadow(0 0 8px ${color}66)` }}
      />
    </svg>
  )
}

// A standalone, accented overview tile — replaces the old single divided card.
const OverviewTile = ({ label, value, accent, delay = 0 }) => (
  <GlassCard
    className="p-6 group transition-transform duration-300 hover:-translate-y-0.5"
    style={{ animation: `fadeUp .5s ease ${delay}s both` }}
  >
    <div
      className="absolute top-0 left-0 right-0 h-[2px]"
      style={{ background: accent, opacity: 0.8 }}
    />
    <div
      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
      style={{ background: accent }}
    />
    <div className="relative">
      <AnimatedNumber
        value={value}
        className="text-4xl font-semibold block"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: accent }}
      />
      <div className="text-sm text-[#8B93A7] mt-2.5">{label}</div>
    </div>
  </GlassCard>
)

const Dashboard = () => {
  // ---- All data-fetching logic below is untouched from the original ----
  const [stats, setStats] = useState({
    totalLeads: 0,
    uniqueLeads: 0,
    companies: 0,
    verifiedEmails: 0,
    invalidEmails: 0,
    riskyEmails: 0,
    unknownEmails: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/leads/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])
  // ---- End untouched logic ----

  const overviewCards = [
    { label: 'Total Leads', value: stats.totalLeads, accent: '#6C8BFF' },
    { label: 'Unique Leads', value: stats.uniqueLeads, accent: '#17A34A' },
    { label: 'Companies', value: stats.companies, accent: '#9B6BFF' },
  ]

  const verificationCards = [
    { label: 'Verified', value: stats.verifiedEmails, color: '#17A34A' },
    { label: 'Invalid', value: stats.invalidEmails, color: '#E24C4B' },
    { label: 'Risky', value: stats.riskyEmails, color: '#D9A62B' },
    { label: 'Unknown', value: stats.unknownEmails, color: '#8B93A7' },
  ]

  // Derived only from data already fetched above — no extra requests.
  const checkedTotal = stats.totalLeads > 0 ? stats.totalLeads : 1
  const pct = (v) => Math.round((v / checkedTotal) * 100)
  const verifiedRate = pct(stats.verifiedEmails)
  const avgPerCompany = stats.companies > 0 ? Math.round(stats.totalLeads / stats.companies) : 0

  return (
    <div className="relative min-h-screen">
      <NetworkBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* ---- Header ---- */}
        <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
          <div>
            <h1
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
            >
              Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#17A34A', boxShadow: '0 0 6px #17A34Acc' }} />
              <p className="text-[#8B93A7] text-sm">Live overview of your lead generation activity</p>
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2.5 rounded-lg border border-white/15 text-sm text-white transition backdrop-blur"
            style={{ background: 'rgba(255,255,255,0.03)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SkeletonBlock className="h-44 md:col-span-1" />
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-24" />)}
            </div>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ---- Hero row: verification ring + accented overview tiles ---- */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard
                className="p-6 flex flex-col items-center justify-center text-center"
                style={{ animation: 'fadeUp .5s ease both' }}
              >
                <div className="relative">
                  <ProgressRing percent={verifiedRate} color="#17A34A" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {verifiedRate}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-white mt-4 font-medium">Verification rate</p>
                <p className="text-xs text-[#5B6478] mt-1">of all leads confirmed reachable</p>
              </GlassCard>

              {overviewCards.map((s, i) => (
                <OverviewTile key={i} label={s.label} value={s.value} accent={s.accent} delay={0.08 + i * 0.06} />
              ))}
            </section>

            {/* ---- Secondary context line ---- */}
            {stats.companies > 0 && (
              <p className="text-sm text-[#5B6478] -mt-6">
                Averaging <span className="text-white">{avgPerCompany}</span> leads per company across {stats.companies} companies.
              </p>
            )}

            {/* ---- Email verification breakdown ---- */}
            <section style={{ animation: 'fadeUp .5s ease .3s both' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5B6478]">Email verification</h2>
                <span className="text-sm text-[#8B93A7]">{stats.totalLeads} total checked</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {verificationCards.map((v, i) => (
                  <GlassCard key={i} className="p-5" style={{ animation: `fadeUp .5s ease ${0.34 + i * 0.05}s both` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[#8B93A7]">{v.label}</span>
                      <span className="text-xs font-medium" style={{ color: v.color }}>{pct(v.value)}%</span>
                    </div>
                    <AnimatedNumber
                      value={v.value}
                      className="text-2xl font-semibold block mb-3"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: v.color }}
                    />
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct(v.value)}%`, background: v.color, opacity: 0.85 }}
                      />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>

          </div>
        )}
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

export default Dashboard
