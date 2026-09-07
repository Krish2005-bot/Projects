import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ResultsPage() {
  const { results, questions, answers, jobRole, difficulty, resetInterview } = useInterview()
  const navigate = useNavigate()

  if (!results) {
    return (
      <div style={s.empty}>
        <p style={s.emptyText}>No results found.</p>
        <button style={s.btn} onClick={() => navigate('/setup')}>Start an interview</button>
      </div>
    )
  }

  const score      = results.overall_score ?? 0
  const confidence = results.confidence_level ?? 'N/A'
  const feedback   = results.feedback ?? []
  const scoreColor = score >= 70 ? 'var(--green)' : score >= 40 ? '#F5A623' : '#FF5C5C'

  function handleDownload() {
    const lines = [
      `MockMind — Interview Report`,
      `Job Role   : ${jobRole}`,
      `Difficulty : ${difficulty}`,
      `Score      : ${score}%`,
      `Confidence : ${confidence}`,
      `\n--- Per Question Feedback ---`,
      ...feedback.map((f, i) => [
        `\nQ${i + 1}: ${questions[i]}`,
        `Your answer : ${answers[i]?.answer}`,
        `Score       : ${f.score}%`,
        `Feedback    : ${f.feedback}`,
      ].join('\n'))
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'MockMind_Report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleRetry() {
    resetInterview()
    navigate('/setup')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.container}>

          <h1 style={s.heading}>Your Results</h1>
          <p style={s.subtext}>{jobRole} · {difficulty} difficulty</p>

          {/* SCORE CARDS */}
          <div style={s.scoreRow}>
            <div style={s.scoreCard}>
              <div style={s.scoreLabel}>Overall Score</div>
              <div style={{ ...s.scoreNum, color: scoreColor }}>{score}%</div>
            </div>
            <div style={s.scoreCard}>
              <div style={s.scoreLabel}>Confidence Level</div>
              <div style={{ ...s.scoreNum, color: 'var(--indigo)' }}>{confidence}</div>
            </div>
            <div style={s.scoreCard}>
              <div style={s.scoreLabel}>Questions</div>
              <div style={{ ...s.scoreNum, color: 'var(--white)' }}>{questions.length}</div>
            </div>
          </div>

          {/* IMPROVEMENT AREAS */}
          {results.improvement_areas?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionLabel}>Areas to improve</div>
              <div style={s.tagRow}>
                {results.improvement_areas.map((area, i) => (
                  <span key={i} style={s.tag}>{area}</span>
                ))}
              </div>
            </div>
          )}

          {/* PER QUESTION FEEDBACK */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Per question breakdown</div>
            {feedback.map((f, i) => (
              <div key={i} style={s.feedbackCard}>
                <div style={s.feedbackTop}>
                  <span style={s.feedbackQ}>Q{i + 1}. {questions[i]}</span>
                  <span style={{
                    ...s.feedbackScore,
                    color: f.score >= 70 ? 'var(--green)' : f.score >= 40 ? '#F5A623' : '#FF5C5C'
                  }}>
                    {f.score}%
                  </span>
                </div>
                <div style={s.feedbackAnswer}>
                  <span style={s.feedbackAnswerLabel}>Your answer:</span> {answers[i]?.answer}
                </div>
                <div style={s.feedbackText}>💡 {f.feedback}</div>
              </div>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div style={s.actionRow}>
            <button style={s.btnGhost} onClick={handleRetry}>Try again</button>
            <button style={s.btnGhost} onClick={() => navigate('/history')}>View history</button>
            <button style={s.btn} onClick={handleDownload}>📥 Download report</button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

const s = {
  empty:              { minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' },
  emptyText:          { color:'var(--muted)', fontSize:'16px' },
  page:               { padding:'100px 24px 60px', display:'flex', justifyContent:'center' },
  container:          { width:'100%', maxWidth:'720px' },
  heading:            { fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:700, marginBottom:'6px' },
  subtext:            { color:'var(--muted)', fontSize:'14px', marginBottom:'32px', textTransform:'capitalize' },
  scoreRow:           { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' },
  scoreCard:          { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'24px', textAlign:'center' },
  scoreLabel:         { fontSize:'12px', color:'var(--muted)', fontWeight:'500', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px' },
  scoreNum:           { fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:700 },
  section:            { marginBottom:'32px' },
  sectionLabel:       { fontSize:'12px', fontWeight:'600', color:'var(--indigo)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' },
  tagRow:             { display:'flex', gap:'8px', flexWrap:'wrap' },
  tag:                { background:'rgba(255,92,92,0.1)', border:'1px solid rgba(255,92,92,0.25)', color:'#FF5C5C', fontSize:'12px', fontWeight:'500', padding:'4px 12px', borderRadius:'999px' },
  feedbackCard:       { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'20px', marginBottom:'14px' },
  feedbackTop:        { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', marginBottom:'10px' },
  feedbackQ:          { fontSize:'14px', fontWeight:'600', lineHeight:'1.5', flex:1 },
  feedbackScore:      { fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:700, whiteSpace:'nowrap' },
  feedbackAnswer:     { fontSize:'13px', color:'var(--muted)', marginBottom:'10px', lineHeight:'1.55' },
  feedbackAnswerLabel:{ fontWeight:'600', color:'var(--white)' },
  feedbackText:       { fontSize:'13px', color:'var(--muted)', lineHeight:'1.6', background:'var(--surface2)', borderRadius:'8px', padding:'10px 12px' },
  actionRow:          { display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'flex-end' },
  btn:                { background:'var(--indigo)', border:'none', color:'#fff', padding:'11px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'var(--font-body)' },
  btnGhost:           { background:'none', border:'1px solid var(--border)', color:'var(--muted)', padding:'11px 24px', borderRadius:'8px', fontSize:'14px', cursor:'pointer', fontFamily:'var(--font-body)' },
}