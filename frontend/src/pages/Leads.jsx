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

const statusColor = (status) => {
  if (status === 'valid' || status === 'verified') return '#17A34A'
  if (status === 'invalid') return '#E24C4B'
  if (status === 'risky') return '#D9A62B'
  return '#8B93A7'
}

const PageButton = ({ active, children, ...props }) => (
  <button
    {...props}
    className="px-3.5 py-2 rounded-lg text-sm font-medium transition backdrop-blur disabled:opacity-30 disabled:cursor-not-allowed"
    style={
      active
        ? { color: '#fff', borderColor: 'rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.25)', border: '1px solid rgba(108,139,255,0.5)' }
        : { color: '#8B93A7', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }
    }
    onMouseEnter={(e) => { if (!props.disabled && !active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
  >
    {children}
  </button>
)

const Leads = () => {
  // ---- All data-fetching/pagination logic below is untouched from the original ----
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLeads, setTotalLeads] = useState(0)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  const fetchLeads = async (page = 1) => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const skip = (page - 1) * itemsPerPage

      console.log(`📊 Fetching leads: page=${page}, skip=${skip}, limit=${itemsPerPage}`)

      const response = await axios.get(`${API_URL}/api/leads?skip=${skip}&limit=${itemsPerPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('📊 Response:', response.data)

      if (response.data.success) {
        const data = response.data.data || []
        const total = response.data.total || 0

        setLeads(data)
        setTotalLeads(total)
        setTotalPages(Math.ceil(total / itemsPerPage) || 1)
        setCurrentPage(page)

        console.log(`📊 Loaded ${data.length} leads, total: ${total}`)
      } else {
        setError('Failed to fetch leads')
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError('Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads(1)
  }, [])

  // Filter leads based on search (client-side filtering)
  const filteredLeads = leads.filter(l =>
    (l.name && l.name.toLowerCase().includes(search.toLowerCase())) ||
    (l.firstName && l.firstName.toLowerCase().includes(search.toLowerCase())) ||
    (l.lastName && l.lastName.toLowerCase().includes(search.toLowerCase())) ||
    (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
    (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
    (l.jobTitle && l.jobTitle.toLowerCase().includes(search.toLowerCase()))
  )

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchLeads(page)
    }
  }

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }
  // ---- End untouched logic ----

  return (
    <div className="relative min-h-screen">
      <NetworkBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
          >
            Leads
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#5B6478]">{totalLeads} total leads</span>
            <button
              onClick={() => fetchLeads(currentPage)}
              className="px-4 py-2 rounded-lg border border-white/15 text-sm text-white transition backdrop-blur"
              style={{ background: 'rgba(255,255,255,0.03)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-full max-w-md px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#5B6478] focus:outline-none focus:border-[#6C8BFF]/60 focus:ring-2 focus:ring-[#3457E0]/20 transition"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(18,23,43,0.4)' }} />
            ))}
          </div>
        ) : error ? (
          <div
            className="pl-4 pr-5 py-3 rounded-lg border-l-2 text-sm"
            style={{ borderColor: '#E24C4B', background: 'rgba(226,76,75,0.08)', color: '#F87171' }}
          >
            {error}
          </div>
        ) : (
          <>
            <GlassCard style={{ animation: 'fadeUp .4s ease both' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">#</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Job Title</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Company</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-sm" style={{ color: '#5B6478' }}>
                          {leads.length === 0 ? 'No leads found. Start by finding some leads on the Find Leads page.' : 'No leads match your search'}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead, index) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                        return (
                          <tr key={lead._id || index} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition">
                            <td className="py-3.5 px-5 text-xs" style={{ color: '#5B6478' }}>{globalIndex}</td>
                            <td className="py-3.5 px-5 text-white">{lead.name || lead.firstName + ' ' + lead.lastName || 'N/A'}</td>
                            <td className="py-3.5 px-5 text-[#8B93A7]">{lead.jobTitle || 'N/A'}</td>
                            <td className="py-3.5 px-5 text-[#8B93A7]">{lead.company || lead.companyDomain || 'N/A'}</td>
                            <td className="py-3.5 px-5 text-[#8B93A7]">{lead.email || 'N/A'}</td>
                            <td className="py-3.5 px-5">
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                                style={{
                                  color: statusColor(lead.emailStatus),
                                  background: `${statusColor(lead.emailStatus)}1A`,
                                  borderColor: `${statusColor(lead.emailStatus)}4D`,
                                }}
                              >
                                {lead.emailStatus || 'unknown'}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
                <PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  ←
                </PageButton>

                {getPageNumbers().map(page => (
                  <PageButton key={page} active={currentPage === page} onClick={() => handlePageChange(page)}>
                    {page}
                  </PageButton>
                ))}

                <PageButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  →
                </PageButton>

                <span className="text-sm text-[#5B6478] ml-4">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
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

export default Leads
