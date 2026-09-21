import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ---------- Brand mark (same glyph used across the site) ----------
const BrandMark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(108,139,255,0.55))' }}>
    <line x1="5.5" y1="18.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55" />
    <line x1="18.5" y1="5.5" x2="12" y2="12" stroke="#6C8BFF" strokeWidth="1.3" opacity="0.55" />
    <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" stroke="#6C8BFF" strokeWidth="1" opacity="0.25" />
    <circle cx="5.5" cy="18.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3" />
    <circle cx="18.5" cy="5.5" r="2.3" fill="#0A0D16" stroke="#6C8BFF" strokeWidth="1.3" />
    <circle cx="12" cy="12" r="3" fill="#3457E0" />
  </svg>
)

const Navbar = () => {
  // ---- All routing/auth logic below is untouched from the original ----
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }
  // ---- End untouched logic ----

  const linkStyle = (path) => ({
    color: isActive(path) ? '#6C8BFF' : '#8B93A7',
  })

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/10 backdrop-blur-xl"
      style={{ background: 'rgba(10,13,22,0.6)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span
            className="text-lg font-semibold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            LeadGen
          </span>
        </Link>

        <div className="flex items-center gap-7">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm transition hover:text-white"
                style={linkStyle('/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                to="/find-leads"
                className="text-sm transition hover:text-white"
                style={linkStyle('/find-leads')}
              >
                Find Leads
              </Link>
              <Link
                to="/leads"
                className="text-sm transition hover:text-white"
                style={linkStyle('/leads')}
              >
                Leads
              </Link>
              <Link
                to="/change-password"
                className="text-sm transition hover:text-white"
                style={linkStyle('/change-password')}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-white/15 text-sm text-white transition backdrop-blur"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#8B93A7] hover:text-white transition">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg border text-sm text-white font-medium transition backdrop-blur"
                style={{ borderColor: 'rgba(108,139,255,0.5)', background: 'rgba(52,87,224,0.16)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,87,224,0.3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,87,224,0.16)' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
