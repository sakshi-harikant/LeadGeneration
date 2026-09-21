import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef } from 'react'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)'
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      requestAnimationFrame(animate)
    }
    animate()
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0B0E1A] overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0B0E1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <span className="text-xl font-bold text-white">LeadGen</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white transition">Dashboard</Link>
                <Link to="/find-leads" className="text-sm text-gray-300 hover:text-white transition">Find Leads</Link>
                <Link to="/leads" className="text-sm text-gray-300 hover:text-white transition">Leads</Link>
                <Link to="/change-password" className="text-sm text-gray-300 hover:text-white transition">Settings</Link>
                <Link to="/" onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }} className="text-sm text-gray-300 hover:text-white transition">Logout</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/signup" className="px-5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition text-sm">Sign Up Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-24">
        {/* Hero */}
        <section className="min-h-[80vh] flex items-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
              🚀 Find & Verify Professional Contacts
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Discover Your</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Next Business Lead</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Search by company, verify emails instantly, and manage all your leads in one powerful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-14">How LeadGen Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🔍', title: 'Find Contacts', desc: 'Search by company domain to discover professional contacts with verified email addresses.' },
                { icon: '✅', title: 'Verify Emails', desc: 'Automatically validate each email to ensure deliverability and reduce bounce rates.' },
                { icon: '📊', title: 'Organize Leads', desc: 'Manage all your leads in one dashboard with filtering, search, and export capabilities.' }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition group">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Preview */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="text-center text-gray-400 text-sm font-medium mb-6">LEAD GENERATION SNAPSHOT</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Leads', value: '0' },
                  { label: 'Companies', value: '0' },
                  { label: 'Verified', value: '0' },
                  { label: 'Invalid', value: '0' }
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-gray-500 text-sm mt-6">Start finding leads to see your dashboard populate</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex justify-between text-sm text-gray-600">
            <span>© 2026 LeadGen. All rights reserved.</span>
            <span>Built with ❤️</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home