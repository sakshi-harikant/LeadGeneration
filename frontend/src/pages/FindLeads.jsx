import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://leadgen-backend-04l6.onrender.com'

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

const Field = ({ label, required, ...props }) => (
  <div>
    <label className="block text-sm text-[#8B93A7] mb-1.5">
      {label}{required && <span className="text-[#6C8BFF]"> *</span>}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#5B6478] focus:outline-none focus:border-[#6C8BFF]/60 focus:ring-2 focus:ring-[#3457E0]/20 transition"
    />
  </div>
)

// Transparent/glass secondary button, shared by both export actions.
const GhostButton = ({ children, borderColor, bg, hoverBg, ...props }) => (
  <button
    {...props}
    className="px-4 py-2.5 rounded-lg border text-sm font-medium text-white transition backdrop-blur disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ borderColor, background: bg }}
    onMouseEnter={(e) => { if (!props.disabled) e.currentTarget.style.background = hoverBg }}
    onMouseLeave={(e) => { e.currentTarget.style.background = bg }}
  >
    {children}
  </button>
)

const statusColor = (status) => {
  if (status === 'valid' || status === 'verified') return '#17A34A'
  if (status === 'invalid') return '#E24C4B'
  if (status === 'risky') return '#D9A62B'
  return '#8B93A7'
}

const FindLeads = () => {
  // ---- All logic below is untouched from the original ----
  const [domain, setDomain] = useState('')
  const [company, setCompany] = useState('')
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [exportLoading, setExportLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!domain) {
      setError('Please enter a domain')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    setResults([])

    try {
      const token = localStorage.getItem('token')
      const payload = { domain }
      if (keyword) payload.keyword = keyword

      const response = await axios.post(`${API_URL}/api/leads/search/domain`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const data = response.data.data || []
        setResults(data)
        setMessage(`Found ${data.length} contacts`)
      } else {
        setError('No contacts found')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  // Export current results as CSV
  const exportCSV = () => {
    if (results.length === 0) {
      setError('No results to export')
      return
    }

    setExportLoading(true)
    try {
      // Define CSV headers
      const headers = ['Name', 'First Name', 'Last Name', 'Job Title', 'Company', 'Company Domain', 'Email', 'Email Status', 'Phone', 'LinkedIn URL', 'Location']

      // Create CSV rows
      const rows = results.map(lead => [
        lead.name || '',
        lead.firstName || '',
        lead.lastName || '',
        lead.jobTitle || '',
        lead.company || '',
        lead.companyDomain || '',
        lead.email || '',
        lead.emailStatus || '',
        lead.phone || '',
        lead.linkedinUrl || '',
        lead.location || ''
      ])

      // Build CSV content
      let csvContent = headers.join(',') + '\n'
      rows.forEach(row => {
        // Escape commas and quotes in values
        const escapedRow = row.map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        csvContent += escapedRow.join(',') + '\n'
      })

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `leads_${domain}_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage(`Exported ${results.length} contacts to CSV`)
    } catch (err) {
      setError('Failed to export CSV: ' + err.message)
    } finally {
      setExportLoading(false)
    }
  }

  // Export current results as Excel (using CSV with .xlsx extension - browser will handle as CSV)
  const exportExcel = () => {
    if (results.length === 0) {
      setError('No results to export')
      return
    }

    setExportLoading(true)
    try {
      // Define headers
      const headers = ['Name', 'First Name', 'Last Name', 'Job Title', 'Company', 'Company Domain', 'Email', 'Email Status', 'Phone', 'LinkedIn URL', 'Location']

      // Create rows
      const rows = results.map(lead => [
        lead.name || '',
        lead.firstName || '',
        lead.lastName || '',
        lead.jobTitle || '',
        lead.company || '',
        lead.companyDomain || '',
        lead.email || '',
        lead.emailStatus || '',
        lead.phone || '',
        lead.linkedinUrl || '',
        lead.location || ''
      ])

      // Build CSV content (Excel can open CSV files)
      let csvContent = headers.join(',') + '\n'
      rows.forEach(row => {
        const escapedRow = row.map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        csvContent += escapedRow.join(',') + '\n'
      })

      // Create download link as .xlsx (Excel will open it)
      const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `leads_${domain}_${new Date().toISOString().slice(0,10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage(`Exported ${results.length} contacts to Excel`)
    } catch (err) {
      setError('Failed to export Excel: ' + err.message)
    } finally {
      setExportLoading(false)
    }
  }
  // ---- End untouched logic ----

  return (
    <div className="relative min-h-screen">
      <NetworkBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        <div className="flex justify-between items-end mb-8 flex-wrap gap-3">
          <h1
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
          >
            Find Leads
          </h1>
          <p className="text-sm text-[#5B6478] max-w-xs text-right">
            Give LeadGen a company and domain — narrow it down with a keyword or location if you like.
          </p>
        </div>

        <GlassCard className="p-6 sm:p-8" style={{ animation: 'fadeUp .4s ease both' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Field
                label="Company Name"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Airbnb"
              />
              <Field
                label="Domain"
                required
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. airbnb.com"
              />
              <Field
                label="Keyword (optional)"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
              <Field
                label="Location (optional)"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco"
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
              {loading ? 'Searching…' : 'Find Contacts'}
            </button>
          </form>
        </GlassCard>

        {/* ---- Status messages ---- */}
        {message && (
          <div
            className="mt-5 pl-4 pr-5 py-3 rounded-lg border-l-2 text-sm"
            style={{ borderColor: '#17A34A', background: 'rgba(23,163,74,0.08)', color: '#4ADE80' }}
          >
            {message}
          </div>
        )}
        {error && (
          <div
            className="mt-5 pl-4 pr-5 py-3 rounded-lg border-l-2 text-sm"
            style={{ borderColor: '#E24C4B', background: 'rgba(226,76,75,0.08)', color: '#F87171' }}
          >
            {error}
          </div>
        )}

        {/* ---- Loading skeleton ---- */}
        {loading && (
          <div className="mt-8 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(18,23,43,0.4)' }} />
            ))}
          </div>
        )}

        {/* ---- Results ---- */}
        {!loading && results.length > 0 && (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GhostButton
                onClick={exportCSV}
                disabled={exportLoading}
                borderColor="rgba(23,163,74,0.4)"
                bg="rgba(23,163,74,0.12)"
                hoverBg="rgba(23,163,74,0.22)"
              >
                {exportLoading ? 'Exporting…' : 'Export CSV'}
              </GhostButton>
              <GhostButton
                onClick={exportExcel}
                disabled={exportLoading}
                borderColor="rgba(108,139,255,0.4)"
                bg="rgba(52,87,224,0.12)"
                hoverBg="rgba(52,87,224,0.22)"
              >
                {exportLoading ? 'Exporting…' : 'Export Excel'}
              </GhostButton>
              <span className="text-sm text-[#5B6478]">{results.length} contacts found</span>
            </div>

            <GlassCard className="mt-4" style={{ animation: 'fadeUp .4s ease both' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Job Title</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-3.5 px-5 text-[#5B6478] font-medium text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((lead, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-5 text-white">{lead.name || 'N/A'}</td>
                        <td className="py-3.5 px-5 text-[#8B93A7]">{lead.jobTitle || 'N/A'}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        )}

        {/* ---- Empty state before first search ---- */}
        {results.length === 0 && !loading && !error && (
          <div className="mt-8 text-center py-12 text-sm rounded-xl border border-white/10" style={{ color: '#5B6478' }}>
            Enter a domain above and run your first search — results will show up here.
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

export default FindLeads
