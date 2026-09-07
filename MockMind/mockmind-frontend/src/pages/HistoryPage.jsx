import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function HistoryPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getHistory()
      .then(data => setSessions(data.sessions || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function scoreColor(score) {
    if (score >= 70) return 'var(--green)'
    if (score >= 40) return '#F5A623'
    return '#FF5C5C'
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.container}>

          <div style={s.topRow}>
            <div>
              <h1 style={s.heading}>Interview History</h1>
              <p style={s.subtext}>All your past sessions in one place</p>
            </div>
            <button style={s.btn} onClick={() => navigate('/setup')}>
              + New Interview
            </button>
          </div>

          {loading && (
            <div style={s.stateBox}>
              <div style={s.stateIcon}>⏳</div>
              <div style={s.stateText}>Loading sessions...</div>
            </div>
          )}

          {error && (
            <div style={s.errorBox}>{error}</div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div style={s.stateBox}>
              <div style={s.stateIcon}>🎯</div>
              <div style={s.stateText}>No interviews yet</div>
              <div style={s.stateSub}>Complete your first session to see it here</div>
              <button style={s.btn} onClick={() => navigate('/setup')}>Start now →</button>
            </div>
          )}

          {!loading && sessions.map((session, i) => (
            <div key={session._id || i} style={{ ...s.card, cursor: 'pointer' }} onClick={() => navigate(`/history/${session._id}`)}>

              <div style={s.cardLeft}>
                <div style={s.cardTitle}>{session.job_role}</div>
                <div style={s.cardMeta}>
                  <span style={s.pill}>{session.mode}</span>
                  <span style={s.pill}>{session.difficulty}</span>
                  <span style={s.pill}>{session.num_questions} Qs</span>
                  <span style={s.dateText}>{formatDate(session.created_at)}</span>
                </div>
              </div>

              <div style={s.cardRight}>
                <div style={{ ...s.scoreNum, color: scoreColor(session.overall_score) }}>
                  {session.overall_score}%
                </div>
                <div style={s.confidenceBadge}>
                  {session.confidence_level}
                </div>
              </div>

            </div>
          ))}

        </div>
      </div>
      <Footer />
    </div>
  )
}

const s = {
  page: { padding: '100px 24px 60px', display: 'flex', justifyContent: 'center' },
  container: { width: '100%', maxWidth: '720px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  heading: { fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '6px' },
  subtext: { color: 'var(--muted)', fontSize: '14px' },
  btn: { background: 'var(--indigo)', border: 'none', color: '#fff', padding: '11px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  stateBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '64px 24px', textAlign: 'center' },
  stateIcon: { fontSize: '40px' },
  stateText: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 },
  stateSub: { color: 'var(--muted)', fontSize: '14px' },
  errorBox: { background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', color: '#FF5C5C', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  cardLeft: { flex: 1 },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, marginBottom: '10px' },
  cardMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  pill: { background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '999px', textTransform: 'capitalize' },
  dateText: { fontSize: '12px', color: 'var(--muted)' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  scoreNum: { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700 },
  confidenceBadge: { fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize' },
}