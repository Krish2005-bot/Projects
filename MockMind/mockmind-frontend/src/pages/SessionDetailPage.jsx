import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSessionById } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function SessionDetailPage() {
  const { id }                    = useParams()
  const navigate                  = useNavigate()
  const [session, setSession]     = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getSessionById(id)
      .then(data => setSession(data))
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={s.loading}>
      <div style={s.loadingIcon}>⏳</div>
      <div style={s.loadingText}>Loading session...</div>
    </div>
  )

  if (!session) return null

  const scoreColor = session.overall_score >= 70 ? 'var(--green)'
    : session.overall_score >= 40 ? '#F5A623' : '#FF5C5C'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.container}>

          <button style={s.back} onClick={() => navigate('/history')}>← Back to History</button>

          <h1 style={s.heading}>{session.job_role}</h1>
          <p style={s.subtext}>{session.difficulty} · {session.mode} · {session.num_questions} questions</p>

          <div style={s.scoreRow}>
            <div style={s.scoreCard}>
              <div style={s.scoreLabel}>Overall Score</div>
              <div style={{ ...s.scoreNum, color: scoreColor }}>{session.overall_score}%</div>
            </div>
            <div style={s.scoreCard}>
              <div style={s.scoreLabel}>Confidence</div>
              <div style={{ ...s.scoreNum, color: 'var(--indigo)' }}>{session.confidence_level}</div>
            </div>
            <div style={s.scoreCard}>
              <div style={s.scoreLabel}>Date</div>
              <div style={{ ...s.scoreNum, fontSize: '16px', color: 'var(--white)' }}>
                {new Date(session.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </div>
            </div>
          </div>

          {session.improvement_areas?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionLabel}>Areas to improve</div>
              <div style={s.tagRow}>
                {session.improvement_areas.map((area, i) => (
                  <span key={i} style={s.tag}>{area}</span>
                ))}
              </div>
            </div>
          )}

          <div style={s.section}>
            <div style={s.sectionLabel}>Question breakdown</div>
            {session.questions.map((q, i) => (
              <div key={i} style={s.feedbackCard}>
                <div style={s.feedbackTop}>
                  <span style={s.feedbackQ}>Q{i + 1}. {q}</span>
                  <span style={{
                    ...s.feedbackScore,
                    color: session.feedback?.[i]?.score >= 70 ? 'var(--green)'
                      : session.feedback?.[i]?.score >= 40 ? '#F5A623' : '#FF5C5C'
                  }}>
                    {session.feedback?.[i]?.score ?? 'N/A'}%
                  </span>
                </div>
                <div style={s.feedbackAnswer}>
                  <span style={s.answerLabel}>Your answer:</span> {session.answers?.[i]?.answer}
                </div>
                <div style={s.feedbackText}>
                  💡 {session.feedback?.[i]?.feedback ?? 'No feedback available'}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

const s = {
  loading:      { minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' },
  loadingIcon:  { fontSize:'40px' },
  loadingText:  { color:'var(--muted)', fontSize:'16px' },
  page:         { padding:'100px 24px 60px', display:'flex', justifyContent:'center' },
  container:    { width:'100%', maxWidth:'720px' },
  back:         { background:'none', border:'none', color:'var(--muted)', fontSize:'14px', cursor:'pointer', marginBottom:'24px', fontFamily:'var(--font-body)', padding:'0' },
  heading:      { fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:700, marginBottom:'6px' },
  subtext:      { color:'var(--muted)', fontSize:'14px', marginBottom:'32px', textTransform:'capitalize' },
  scoreRow:     { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' },
  scoreCard:    { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'24px', textAlign:'center' },
  scoreLabel:   { fontSize:'12px', color:'var(--muted)', fontWeight:'500', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px' },
  scoreNum:     { fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:700 },
  section:      { marginBottom:'32px' },
  sectionLabel: { fontSize:'12px', fontWeight:'600', color:'var(--indigo)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' },
  tagRow:       { display:'flex', gap:'8px', flexWrap:'wrap' },
  tag:          { background:'rgba(255,92,92,0.1)', border:'1px solid rgba(255,92,92,0.25)', color:'#FF5C5C', fontSize:'12px', fontWeight:'500', padding:'4px 12px', borderRadius:'999px' },
  feedbackCard: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'20px', marginBottom:'14px' },
  feedbackTop:  { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', marginBottom:'10px' },
  feedbackQ:    { fontSize:'14px', fontWeight:'600', lineHeight:'1.5', flex:1 },
  feedbackScore:{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:700, whiteSpace:'nowrap' },
  feedbackAnswer:{ fontSize:'13px', color:'var(--muted)', marginBottom:'10px', lineHeight:'1.55' },
  answerLabel:  { fontWeight:'600', color:'var(--white)' },
  feedbackText: { fontSize:'13px', color:'var(--muted)', lineHeight:'1.6', background:'var(--surface2)', borderRadius:'8px', padding:'10px 12px' },
}