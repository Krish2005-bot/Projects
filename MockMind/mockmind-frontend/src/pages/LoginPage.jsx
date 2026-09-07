import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user, token } = await loginUser({ email, password })
      login(user, token)
      window.location.href='/'
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.logo}>
          Mock<span style={{ color: 'var(--indigo)' }}>Mind</span>
        </div>
        <h1 style={s.heading}>Welcome back</h1>
        <p style={s.subtext}>Log in to continue your interview prep</p>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={s.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Logging in...' : 'Log in →'}
          </button>

        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={s.link}>Sign up free</Link>
        </p>

      </div>
    </div>
  )
}

const s = {
  page:     { minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' },
  card:     { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'420px' },
  logo:     { fontFamily:'var(--font-display)', fontWeight:700, fontSize:'22px', marginBottom:'28px', textAlign:'center' },
  heading:  { fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:700, marginBottom:'6px', textAlign:'center' },
  subtext:  { color:'var(--muted)', fontSize:'14px', textAlign:'center', marginBottom:'28px' },
  errorBox: { background:'rgba(255,92,92,0.1)', border:'1px solid rgba(255,92,92,0.3)', color:'#FF5C5C', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', marginBottom:'16px' },
  form:     { display:'flex', flexDirection:'column', gap:'18px' },
  field:    { display:'flex', flexDirection:'column', gap:'6px' },
  label:    { fontSize:'13px', fontWeight:'500', color:'var(--muted)' },
  input:    { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'11px 14px', color:'var(--white)', fontSize:'14px', fontFamily:'var(--font-body)', outline:'none', width:'100%' },
  btn:      { background:'var(--indigo)', border:'none', color:'#fff', padding:'13px', borderRadius:'8px', fontSize:'15px', fontWeight:'600', fontFamily:'var(--font-body)', cursor:'pointer', marginTop:'4px' },
  footer:   { textAlign:'center', marginTop:'22px', fontSize:'14px', color:'var(--muted)' },
  link:     { color:'var(--indigo)', textDecoration:'none', fontWeight:'500' },
}