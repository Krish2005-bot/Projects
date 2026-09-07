import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { parseResume, generateQuestions } from '../services/api'
import Navbar from '../components/Navbar'

const DIFFICULTIES = ['easy', 'medium', 'hard', 'random']
const Q_COUNTS     = [5, 10, 15]

export default function SetupPage() {
  const {
    mode, setMode,
    jobRole, setJobRole,
    experience, setExperience,
    difficulty, setDifficulty,
    numQuestions, setNumQuestions,
    setQuestions, resetInterview,
  } = useInterview()

  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const navigate                    = useNavigate()

  async function handleStart() {
  setError('')

  if (!mode) { setError('Please select an interview mode'); return }
  if (mode === 'resume' && !resumeFile) { setError('Please upload your resume'); return }
  if (mode === 'manual' && !jobRole.trim()) { setError('Please enter a job role'); return }

  setLoading(true)
  try {
    let skills = []
    let role   = jobRole

    if (mode === 'resume') {
      const parsed = await parseResume(resumeFile)
      skills = parsed.skills?.all_skills || []
      role   = parsed.job_role || jobRole || 'Software Engineer'
    }

    const { questions } = await generateQuestions({
      jobRole: role, experience, difficulty, numQuestions, skills,
    })

    setQuestions(questions)

    // Store in sessionStorage so InterviewPage can access after navigation
    sessionStorage.setItem('mm_questions', JSON.stringify(questions))
    sessionStorage.setItem('mm_job_role', role)
    sessionStorage.setItem('mm_difficulty', difficulty)

    window.location.href = '/interview'

  } catch (err) {
    setError(err.message || 'Failed to generate questions. Try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={s.page}>
        <div style={s.container}>

          <h1 style={s.heading}>Set up your interview</h1>
          <p style={s.subtext}>Configure your session before we generate your questions</p>

          {error && <div style={s.errorBox}>{error}</div>}

          {/* STEP 1 — MODE */}
          <div style={s.section}>
            <div style={s.stepLabel}>Step 1 — Choose interview mode</div>
            <div style={s.modeRow}>

              <div
                style={{ ...s.modeCard, ...(mode === 'resume' ? s.modeCardActive : {}) }}
                onClick={() => { setMode('resume'); resetInterview(); setMode('resume') }}
              >
                <div style={s.modeIcon}>📋</div>
                <div style={s.modeTitle}>Resume Mode</div>
                <div style={s.modeDesc}>Upload PDF — we extract your skills and tailor questions to your background</div>
              </div>

              <div
                style={{ ...s.modeCard, ...(mode === 'manual' ? s.modeCardActive : {}) }}
                onClick={() => { resetInterview(); setMode('manual') }}
              >
                <div style={s.modeIcon}>🎯</div>
                <div style={s.modeTitle}>Quick Start Mode</div>
                <div style={s.modeDesc}>Enter job role and experience — instant questions, no resume needed</div>
              </div>

            </div>
          </div>

          {/* STEP 2 — RESUME UPLOAD or MANUAL FIELDS */}
          {mode === 'resume' && (
            <div style={s.section}>
              <div style={s.stepLabel}>Step 2 — Upload your resume</div>
              <label style={s.uploadBox}>
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => setResumeFile(e.target.files[0])}
                />
                <div style={s.uploadIcon}>📄</div>
                <div style={s.uploadText}>
                  {resumeFile ? resumeFile.name : 'Click to upload PDF resume'}
                </div>
                <div style={s.uploadHint}>PDF only · Max 5MB</div>
              </label>
            </div>
          )}

          {mode === 'manual' && (
            <div style={s.section}>
              <div style={s.stepLabel}>Step 2 — Enter your details</div>
              <div style={s.fieldsRow}>
                <div style={s.field}>
                  <label style={s.label}>Job Role</label>
                  <input
                    style={s.input}
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    placeholder="e.g. Data Scientist, Frontend Developer"
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Years of Experience</label>
                  <input
                    style={s.input}
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    placeholder="e.g. 0, 1, 2"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — DIFFICULTY */}
          {mode && (
            <div style={s.section}>
              <div style={s.stepLabel}>Step 3 — Select difficulty</div>
              <div style={s.pillRow}>
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{ ...s.pill, ...(difficulty === d ? s.pillActive : {}) }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — QUESTION COUNT */}
          {mode && (
            <div style={s.section}>
              <div style={s.stepLabel}>Step 4 — Number of questions</div>
              <div style={s.pillRow}>
                {Q_COUNTS.map(n => (
                  <button
                    key={n}
                    onClick={() => setNumQuestions(n)}
                    style={{ ...s.pill, ...(numQuestions === n ? s.pillActive : {}) }}
                  >
                    {n} Questions
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* START BUTTON */}
          {mode && (
            <button
              onClick={handleStart}
              disabled={loading}
              style={{ ...s.startBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Generating questions...' : 'Start Interview →'}
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

const s = {
  page:          { padding:'100px 24px 60px', display:'flex', justifyContent:'center' },
  container:     { width:'100%', maxWidth:'720px' },
  heading:       { fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:700, marginBottom:'8px' },
  subtext:       { color:'var(--muted)', fontSize:'15px', marginBottom:'36px' },
  errorBox:      { background:'rgba(255,92,92,0.1)', border:'1px solid rgba(255,92,92,0.3)', color:'#FF5C5C', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', marginBottom:'20px' },
  section:       { marginBottom:'32px' },
  stepLabel:     { fontSize:'12px', fontWeight:'600', color:'var(--indigo)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' },
  modeRow:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  modeCard:      { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'24px', cursor:'pointer', transition:'all .2s' },
  modeCardActive:{ border:'1px solid var(--indigo)', boxShadow:'0 0 0 1px var(--indigo)' },
  modeIcon:      { fontSize:'28px', marginBottom:'10px' },
  modeTitle:     { fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:700, marginBottom:'6px' },
  modeDesc:      { color:'var(--muted)', fontSize:'13px', lineHeight:'1.55' },
  uploadBox:     { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'2px dashed var(--border)', borderRadius:'12px', padding:'40px', cursor:'pointer', gap:'8px', background:'var(--surface)' },
  uploadIcon:    { fontSize:'32px' },
  uploadText:    { fontSize:'14px', fontWeight:'500', color:'var(--white)' },
  uploadHint:    { fontSize:'12px', color:'var(--muted)' },
  fieldsRow:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  field:         { display:'flex', flexDirection:'column', gap:'6px' },
  label:         { fontSize:'13px', fontWeight:'500', color:'var(--muted)' },
  input:         { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'11px 14px', color:'var(--white)', fontSize:'14px', fontFamily:'var(--font-body)', outline:'none', width:'100%' },
  pillRow:       { display:'flex', gap:'10px', flexWrap:'wrap' },
  pill:          { background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted)', padding:'9px 22px', borderRadius:'999px', fontSize:'14px', fontWeight:'500', cursor:'pointer', fontFamily:'var(--font-body)' },
  pillActive:    { border:'1px solid var(--indigo)', color:'var(--indigo)', background:'rgba(108,99,255,0.1)' },
  startBtn:      { width:'100%', background:'var(--indigo)', border:'none', color:'#fff', padding:'15px', borderRadius:'10px', fontSize:'16px', fontWeight:'600', fontFamily:'var(--font-body)', cursor:'pointer', marginTop:'8px' },
}