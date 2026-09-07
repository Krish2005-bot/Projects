import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={styles.footer}>

      <div style={styles.logo}>
        Mock<span style={{ color: 'var(--indigo)' }}>Mind</span>
      </div>

      <div style={styles.center}>
        <span style={styles.text}>
          Built with React · FastAPI · MongoDB · Gemini API
        </span>
        <span style={styles.text}>
          L. J. Institute of Engineering & Technology · 2025
        </span>
      </div>

      <div style={styles.links}>
        <Link to="/"       style={styles.link}>Home</Link>
        <Link to="/login"  style={styles.link}>Login</Link>
        <Link to="/signup" style={styles.link}>Signup</Link>
      </div>

    </footer>
  )
}

const styles = {
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '28px 48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--white)',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  text: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
  links: {
    display: 'flex',
    gap: '16px',
  },
  link: {
    fontSize: '13px',
    color: 'var(--muted)',
    textDecoration: 'none',
  },
}