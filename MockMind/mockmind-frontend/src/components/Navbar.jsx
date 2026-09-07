import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useInterview } from '../context/InterviewContext'

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth()
  const { resetInterview } = useInterview()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    resetInterview()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>

      <Link to="/" style={styles.logo}>
        Mock<span style={{ color: 'var(--indigo)' }}>Mind</span>
      </Link>

      <div style={styles.links}>
        {isLoggedIn ? (
          <>
            <Link to="/setup"   style={styles.link}>New Interview</Link>
            <Link to="/history" style={styles.link}>History</Link>
            <span style={styles.username}>Hi, {user?.name}</span>
            <button onClick={handleLogout} style={styles.btnGhost}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/#features" style={styles.link}>Features</Link>
            <Link to="/login"    style={styles.btnGhost}>Log in</Link>
            <Link to="/signup"   style={styles.btnPrimary}>Get started</Link>
          </>
        )}
      </div>

    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 48px',
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    background: 'rgba(10,15,30,0.85)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '22px',
    color: 'var(--white)',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  link: {
    color: 'var(--muted)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  username: {
    fontSize: '14px',
    color: 'var(--muted)',
  },
  btnGhost: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--muted)',
    padding: '7px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  btnPrimary: {
    background: 'var(--indigo)',
    border: 'none',
    color: '#fff',
    padding: '7px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
}