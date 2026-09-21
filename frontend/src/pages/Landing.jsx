import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Landing = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const radarCanvasRef = useRef(null)

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Network background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, nodes
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let mouse = { x: null, y: null, active: false }

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      const count = Math.min(90, Math.floor((w * h) / 16000))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6
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
            const dx = n.x - mouse.x,
              dy = n.y - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 140) {
              const f = (140 - dist) / 140 * 0.03
              n.x += dx * f
              n.y += dy * f
            }
          }
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j]
          const dx = a.x - b.x,
            dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.strokeStyle = `rgba(140,165,255,${(1 - dist / 150) * 0.22})`
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
        ctx.fillStyle = 'rgba(150,175,255,0.75)'
        ctx.shadowColor = 'rgba(108,139,255,0.8)'
        ctx.shadowBlur = 4
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      if (!reduceMotion) requestAnimationFrame(step)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    })
    window.addEventListener('mouseleave', () => { mouse.active = false })

    resize()
    step()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', () => {})
      window.removeEventListener('mouseleave', () => {})
    }
  }, [])

  // Radar animation
  useEffect(() => {
    const canvas = radarCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const W = canvas.width,
      H = canvas.height
    const cx = W / 2,
      cy = H / 2
    const maxR = Math.min(W, H) / 2 - 8

    const contacts = [
      { name: 'Aylin Orakcal', status: 'invalid', angle: 0.3, radius: maxR * 0.55 },
      { name: 'Jake Sinsheimer', status: 'valid', angle: 1.0, radius: maxR * 0.85 },
      { name: 'Will Nichols', status: 'valid', angle: 1.9, radius: maxR * 0.4 },
      { name: 'Kevin Bognar', status: 'valid', angle: 2.6, radius: maxR * 0.95 },
      { name: 'Molly Gray', status: 'valid', angle: 3.4, radius: maxR * 0.6 },
      { name: 'Brian Jansen', status: 'valid', angle: 4.3, radius: maxR * 0.78 },
      { name: 'Annie Bohlander', status: 'invalid', angle: 5.2, radius: maxR * 0.5 },
    ]

    let sweep = 0
    let resetPending = false
    const speed = 0.012
    const nameEl = document.getElementById('radar-name')
    const statusEl = document.getElementById('radar-status')
    const countEl = document.getElementById('radar-count')

    const resetContacts = () => {
      contacts.forEach(c => { c.revealed = false; c.revealTime = 0 })
      if (countEl) countEl.textContent = '0 / 7 verified'
    }
    resetContacts()

    const updateReadout = (c) => {
      if (nameEl) nameEl.innerHTML = c.name + '<span style="color:#8B93A7;font-weight:400;"> — ' + (c.status === 'valid' ? 'inbox confirmed' : 'bounced') + '</span>'
      if (statusEl) {
        statusEl.textContent = c.status
        statusEl.className = 'status status-' + c.status
      }
      const verified = contacts.filter(c => c.revealed && c.status === 'valid').length
      if (countEl) countEl.textContent = verified + ' / 7 verified'
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      ctx.strokeStyle = 'rgba(108,139,255,0.12)'
      ctx.lineWidth = 1
      ;[0.35, 0.65, 1].forEach(f => {
        ctx.beginPath()
        ctx.arc(cx, cy, maxR * f, 0, Math.PI * 2)
        ctx.stroke()
      })

      const trailSteps = 46
      for (let i = 0; i < trailSteps; i++) {
        const a = sweep - i * 0.035
        const alpha = (1 - i / trailSteps) * 0.16
        ctx.strokeStyle = `rgba(108,139,255,${alpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR)
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(160,180,255,0.75)'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR)
      ctx.stroke()

      const now = performance.now()
      const sweepMod = ((sweep % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

      contacts.forEach(c => {
        const diff = ((sweepMod - c.angle) + Math.PI * 2) % (Math.PI * 2)
        if (!c.revealed && diff < speed * 1.5) {
          c.revealed = true
          c.revealTime = now
          updateReadout(c)
        }

        const nx = cx + Math.cos(c.angle) * c.radius
        const ny = cy + Math.sin(c.angle) * c.radius
        const color = !c.revealed ? '84,100,150' : (c.status === 'valid' ? '23,163,74' : '226,76,75')
        const age = c.revealed ? Math.min(1, (now - c.revealTime) / 500) : 0
        const pulse = c.revealed ? (1 - age) * 4 : 0
        const baseR = c.revealed ? 3.4 : 2.4
        const alpha = c.revealed ? 0.55 + (1 - age) * 0.4 : 0.35

        if (c.revealed && age < 1) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(${color},${(1 - age) * 0.35})`
          ctx.arc(nx, ny, baseR + pulse * 3, 0, Math.PI * 2)
          ctx.lineWidth = 1.2
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.fillStyle = `rgba(${color},${alpha})`
        ctx.arc(nx, ny, baseR + pulse, 0, Math.PI * 2)
        ctx.fill()
      })

      if (!reduceMotion) {
        sweep += speed
        if (sweepMod < speed * 2 && sweep > 1) {
          if (!resetPending) {
            resetPending = true
            setTimeout(resetContacts, 500)
          }
        } else if (sweepMod > speed * 6) {
          resetPending = false
        }
        requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {}
  }, [])

  // Icons for the "What It Does" cards — drawn in the same line/circle
  // language as the brand mark, rather than a generic icon set.
  const SearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="#6C8BFF" strokeWidth="1.6" />
      <line x1="15.3" y1="15.3" x2="20.5" y2="20.5" stroke="#6C8BFF" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10.5" cy="10.5" r="2" fill="#6C8BFF" opacity="0.5" />
    </svg>
  )

  const VerifyIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#17A34A" strokeWidth="1.6" />
      <path d="M7.5 12.5L10.3 15.3L16.5 9" stroke="#17A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const ManageIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="4.5" rx="1.3" stroke="#9B6BFF" strokeWidth="1.6" />
      <rect x="3.5" y="11" width="10.5" height="4.5" rx="1.3" stroke="#9B6BFF" strokeWidth="1.6" />
      <rect x="3.5" y="17.5" width="14" height="4.5" rx="1.3" stroke="#9B6BFF" strokeWidth="1.6" opacity="0.55" />
    </svg>
  )

  const whatItDoes = [
    { tag: 'Search', title: 'Find contacts anywhere', desc: 'Give LeadGen a company, a domain, a keyword, or a location — it pulls matching people and their job titles from across the web, not just one platform.', Icon: SearchIcon, glow: 'rgba(108,139,255,0.35)' },
    { tag: 'Verify', title: 'Every email gets checked', desc: 'Before a contact lands in your list, its email is tested for deliverability. You\'ll see valid, invalid, risky, or unknown — never a guess dressed up as a fact.', Icon: VerifyIcon, glow: 'rgba(23,163,74,0.35)' },
    { tag: 'Manage', title: 'One dashboard, not five spreadsheets', desc: 'Every search adds to a single, searchable leads table. Filter by status, track companies, and see your verification rate at a glance.', Icon: ManageIcon, glow: 'rgba(155,107,255,0.35)' }
  ]

  return (
    <div style={{ background: '#0A0D16', color: '#F5F6FA', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <canvas ref={canvasRef} id="network-bg" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }}></canvas>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse 900px 600px at 18% 8%, rgba(30,45,110,0.10), transparent 60%), linear-gradient(180deg, rgba(10,13,22,0) 0%, rgba(10,13,22,0.65) 55%, #0A0D16 100%)' }}></div>

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 0' }}>
          <div style={{ maxWidth: '1500px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
            <div style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(18,23,43,0.55)',
              backdropFilter: 'blur(18px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative'
            }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: '#F5F6FA', textDecoration: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="5.5" y1="18.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55"/>
                  <line x1="18.5" y1="5.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55"/>
                  <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" stroke="#6C8BFF" strokeWidth="1" opacity="0.25"/>
                  <circle cx="5.5" cy="18.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3"/>
                  <circle cx="18.5" cy="5.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3"/>
                  <circle cx="12" cy="12" r="3" fill="#3457E0"/>
                </svg>
                LeadGen
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                <a href="#what" onClick={(e) => { e.preventDefault(); scrollToSection('what'); }} style={{ fontSize: '14px', color: '#8B93A7', textDecoration: 'none', cursor: 'pointer' }}>Product</a>
                <a href="#how" onClick={(e) => { e.preventDefault(); scrollToSection('how'); }} style={{ fontSize: '14px', color: '#8B93A7', textDecoration: 'none', cursor: 'pointer' }}>How it works</a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" style={{ padding: '9px 18px', fontSize: '13.5px', fontWeight: 600, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#F5F6FA', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to="/" onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }} style={{ padding: '9px 18px', fontSize: '13.5px', fontWeight: 600, borderRadius: '10px', border: '1px solid rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)', color: '#F5F6FA', textDecoration: 'none' }}>Logout</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" style={{ padding: '9px 18px', fontSize: '13.5px', fontWeight: 600, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#F5F6FA', textDecoration: 'none' }}>Log in</Link>
                    <Link to="/signup" style={{ padding: '9px 18px', fontSize: '13.5px', fontWeight: 600, borderRadius: '10px', border: '1px solid rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)', color: '#F5F6FA', textDecoration: 'none' }}>Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header style={{ maxWidth: '1180px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px', paddingTop: '48px', paddingBottom: '120px', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8B93A7', fontSize: '13.5px', marginBottom: '26px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#17A34A', boxShadow: '0 0 8px rgba(23,163,74,0.8)', display: 'inline-block' }}></span>
              Verifying emails right now
            </div>
            <h1 style={{ fontSize: '56px', lineHeight: '1.08', fontWeight: 600, color: '#F5F6FA', margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>Find people. Verify their inbox exists.</h1>
            <p style={{ marginTop: '24px', fontSize: '17px', lineHeight: '1.6', color: '#8B93A7', maxWidth: '480px' }}>LeadGen searches for contacts by company, domain, keyword, and location — then checks every email so you never send to a dead address.</p>
            <div style={{ marginTop: '38px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 26px', fontFamily: 'Inter, sans-serif', fontSize: '14.5px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)', color: '#F5F6FA', textDecoration: 'none' }}>Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 26px', fontFamily: 'Inter, sans-serif', fontSize: '14.5px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)', color: '#F5F6FA', textDecoration: 'none' }}>Get Started</Link>
                  <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 26px', fontFamily: 'Inter, sans-serif', fontSize: '14.5px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#F5F6FA', textDecoration: 'none' }}>Log in</Link>
                </>
              )}
            </div>
            <p style={{ marginTop: '20px', fontSize: '13px', color: '#5B6478' }}>No credit card required · Set up a search in under a minute</p>
          </div>

          <div style={{ position: 'relative', padding: 0, minHeight: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '22px' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '440px', height: '440px', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(52,87,224,0.22) 0%, rgba(52,87,224,0.08) 40%, transparent 70%)', filter: 'blur(6px)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', fontSize: '12.5px', color: '#5B6478', width: '100%', maxWidth: '340px', position: 'relative', zIndex: 1 }}>
              <span>Live verification — stripe.com</span>
              <span id="radar-count" style={{ color: '#8B93A7', fontVariantNumeric: 'tabular-nums' }}>0 / 7 verified</span>
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <canvas ref={radarCanvasRef} id="radar-canvas" width="360" height="360" style={{ display: 'block', maxWidth: '100%', height: 'auto' }}></canvas>
            </div>
            <div style={{ width: '100%', maxWidth: '340px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', position: 'relative', zIndex: 1 }}>
              <span id="radar-name" style={{ color: '#F5F6FA', fontWeight: 500 }}>Scanning<span style={{ color: '#8B93A7', fontWeight: 400 }}> for contacts…</span></span>
              <span id="radar-status" style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', border: '1px solid transparent', whiteSpace: 'nowrap' }}>—</span>
            </div>
          </div>
        </header>

        {/* What It Does */}
        <section id="what" style={{ maxWidth: '1180px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px', paddingTop: '100px', paddingBottom: '100px', scrollMarginTop: '80px' }}>
          <div style={{ maxWidth: '640px', marginBottom: '56px' }}>
            <p style={{ fontSize: '22px', lineHeight: '1.5', color: '#F5F6FA', fontWeight: 400 }}>Most lead lists are guesses. LeadGen only gives you contacts it has actually confirmed you can reach.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {whatItDoes.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '32px 28px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(18,23,43,0.5)',
                  backdropFilter: 'blur(14px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: item.glow, filter: 'blur(30px)', pointerEvents: 'none' }}></div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                  <item.Icon />
                </div>
                <span style={{ color: '#5B6478', fontSize: '13px', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.tag}</span>
                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', color: '#F5F6FA' }}>{item.title}</h3>
                <p style={{ color: '#8B93A7', fontSize: '14.5px', lineHeight: '1.6', position: 'relative' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how" style={{ maxWidth: '1180px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px', paddingTop: '100px', paddingBottom: '100px', scrollMarginTop: '80px' }}>
          <div style={{ maxWidth: '640px', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '34px', fontWeight: 600, lineHeight: '1.2', color: '#F5F6FA', fontFamily: 'Space Grotesk, sans-serif' }}>How it works</h2>
            <p style={{ marginTop: '16px', fontSize: '16px', color: '#8B93A7', lineHeight: '1.65' }}>From a blank search box to a verified contact list, in four steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, position: 'relative' }}>
            {[
              { num: '1', title: 'Set your criteria', desc: 'Enter a company name, domain, keyword, or location — as little or as much as you know.' },
              { num: '2', title: 'LeadGen finds contacts', desc: 'It matches people to your criteria and pulls their name, title, and company.' },
              { num: '3', title: 'Emails get verified', desc: 'Each address is tested automatically and labeled valid, invalid, risky, or unknown.' },
              { num: '4', title: 'Review in your dashboard', desc: 'Search, filter, and manage every lead you\'ve found in one place.' }
            ].map((step, i) => (
              <div key={i} style={{ padding: '0 22px 0 0', position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', top: '16px', right: '0', width: '22px', height: '1px', background: 'rgba(255,255,255,0.16)' }}></div>}
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: '#6C8BFF', border: '1px solid rgba(255,255,255,0.16)', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>{step.num}</div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 600, marginBottom: '10px', color: '#F5F6FA' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: '#8B93A7', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Band */}
        <section style={{ maxWidth: '1180px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px', paddingTop: '0', paddingBottom: '100px' }}>
          <div style={{
            borderRadius: '20px',
            padding: '64px 56px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '32px',
            flexWrap: 'wrap',
            background: 'rgba(18,23,43,0.55)',
            backdropFilter: 'blur(18px) saturate(140%)',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative'
          }}>
            <div>
              <h2 style={{ fontSize: '30px', fontWeight: 600, maxWidth: '440px', color: '#F5F6FA', fontFamily: 'Space Grotesk, sans-serif' }}>Stop guessing which emails work.</h2>
              <p style={{ marginTop: '12px', color: '#8B93A7', fontSize: '15px', maxWidth: '420px' }}>Create an account and run your first verified search in under a minute.</p>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 26px', fontFamily: 'Inter, sans-serif', fontSize: '14.5px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)', color: '#F5F6FA', textDecoration: 'none' }}>Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 26px', fontFamily: 'Inter, sans-serif', fontSize: '14.5px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)', color: '#F5F6FA', textDecoration: 'none' }}>Get Started</Link>
                  <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 26px', fontFamily: 'Inter, sans-serif', fontSize: '14.5px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#F5F6FA', textDecoration: 'none' }}>Log in</Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '56px 0 48px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '20px' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F5F6FA', textDecoration: 'none' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <line x1="5.5" y1="18.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55"/>
                <line x1="18.5" y1="5.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55"/>
                <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" stroke="#6C8BFF" strokeWidth="1" opacity="0.25"/>
                <circle cx="5.5" cy="18.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3"/>
                <circle cx="18.5" cy="5.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3"/>
                <circle cx="12" cy="12" r="3" fill="#3457E0"/>
              </svg>
              LeadGen
            </Link>
            <div style={{ display: 'flex', gap: '28px', listStyle: 'none', padding: 0, margin: 0 }}>
              <a href="#what" onClick={(e) => { e.preventDefault(); scrollToSection('what'); }} style={{ fontSize: '13.5px', color: '#8B93A7', textDecoration: 'none', cursor: 'pointer' }}>Product</a>
              <a href="#how" onClick={(e) => { e.preventDefault(); scrollToSection('how'); }} style={{ fontSize: '13.5px', color: '#8B93A7', textDecoration: 'none', cursor: 'pointer' }}>How it works</a>
              <Link to="/login" style={{ fontSize: '13.5px', color: '#8B93A7', textDecoration: 'none' }}>Log in</Link>
            </div>
            <span style={{ fontSize: '13px', color: '#5B6478' }}>© 2026 LeadGen</span>
          </div>
        </footer>

      </div>
    </div>
  )
}

export default Landing
