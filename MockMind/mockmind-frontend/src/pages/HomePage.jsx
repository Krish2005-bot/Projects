import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function useTypingEffect(texts, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[idx]
    let timeout

    if (!deleting && charIdx <= current.length) {
      setDisplayed(current.slice(0, charIdx))
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed)
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), 2500)
    } else if (deleting && charIdx >= 0) {
      setDisplayed(current.slice(0, charIdx))
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2)
    } else {
      setDeleting(false)
      setIdx(i => (i + 1) % texts.length)
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, idx])

  return displayed
}

const FEATURES = [
  {
    icon: '📄', title: 'Resume-Based Questions',
    desc: 'Upload your PDF and we extract your skills and projects to generate questions that match your actual background.'
  },
  {
    icon: '🎙️', title: 'Type or Speak Answers',
    desc: 'Use the text box or speak your answer — we transcribe it live using the Web Speech API.'
  },
  {
    icon: '⏱️', title: '60-Second Timer',
    desc: 'Each question comes with a countdown. Think fast, stay sharp — just like the real thing.'
  },
  {
    icon: '✅ ', title: 'Answer Evaluation',
    desc: 'Identifying gaps, missing concepts and strong points.'
  },
  {
    icon: '📊', title: 'Confidence Score',
    desc: 'NLP engine analyses response depth, timing, and keyword usage to compute a real confidence level.'
  },
  {
    icon: '📥', title: 'Downloadable Report',
    desc: 'Every session produces a PDF with full score breakdown, per-question feedback, and improvement areas.'
  },
]

const STEPS = [
  {
    num: '01', title: 'Upload resume or enter role',
    desc: 'Drop your PDF or manually enter your target job role and years of experience.'
  },
  {
    num: '02', title: 'Pick difficulty & question count',
    desc: 'Easy, Medium, Hard, or Random. Choose 5, 10, or 15 questions per session.'
  },
  {
    num: '03', title: 'Answer with the clock running',
    desc: 'Type or speak — 60 seconds per question. Same pressure, none of the real stakes.'
  },
  {
    num: '04', title: 'Get your report',
    desc: 'AI evaluates every answer. See your score, confidence level, and what to study next.'
  },
]

export default function HomePage() {
  const typedText = useTypingEffect([
    'Overfitting happens when a model learns noise in training data...',
    'I would use L2 regularization and cross-validation to detect it...',
    'Dropout layers in neural networks also help prevent overfitting...',
  ])
  const { isLoggedIn } = useAuth()
  const [secs, setSecs] = useState(42)
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 60), 1000)
    return () => clearInterval(t)
  }, [])

  const timerStr = `00:${String(secs).padStart(2, '0')}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroLeft}>
          <h1 style={s.h1}>
            Crack any interview.<br />
            <span style={{ color: 'var(--indigo)' }}>Before</span> the real one.
          </h1>
          <p style={s.heroSub}>
            MockMind generates personalised interview questions from your resume,
            runs a timed mock session, and tells you exactly where to improve.
          </p>
          <div style={s.heroActions}>
            <Link to={isLoggedIn ? "/setup" : "/signup"} style={s.btnLgPrimary}>Start practising free →</Link>
            <a href="#features" style={s.btnLgGhost}>Features</a>
          </div>
          <div style={s.stats}>
            {[['2', 'Interview modes'], ['60s', 'Per question']]
              .map(([n, l]) => (
                <div key={l} style={s.stat}>
                  <span style={s.statNum}>{n}</span>
                  <span style={s.statLabel}>{l}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Interview Card */}
        <div style={s.card}>
          <div style={s.cardTop}>
            <div style={s.dots}>
              <div style={{ ...s.dot, background: '#FF5C5C' }} />
              <div style={{ ...s.dot, background: '#F5A623' }} />
              <div style={{ ...s.dot, background: '#3DEBA0' }} />
            </div>
            <span style={s.cardTitle}>MockMind — Live Session</span>
            <span style={s.cardMeta}>Medium · Q 3/10</span>
          </div>
          <div style={s.cardBody}>
            <div style={s.cardRow}>
              <span style={s.badge}>DATA SCIENCE</span>
              <span style={s.timer}>⏱ {timerStr}</span>
            </div>
            <p style={s.question}>
              "Explain the difference between overfitting and underfitting.
              How would you detect and handle overfitting in a model?"
            </p>
            <div style={s.answerBox}>
              <span style={s.answerText}>{typedText}</span>
              <span style={s.cursor}>|</span>
            </div>
            <div style={{ ...s.cardRow, marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <span style={s.voiceBadge}>🎙 Voice mode</span>
              <button style={s.submitBtn}>Submit →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={s.section}>
        <p style={s.sectionTag}>Features</p>
        <h2 style={s.h2}>Everything you need to walk in confident</h2>
        <p style={s.sectionSub}>From resume parsing to downloadable reports — the full interview prep loop in one platform.</p>
        <div style={s.featGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.featCard}>
              <div style={s.featIcon}>{f.icon}</div>
              <div style={s.featTitle}>{f.title}</div>
              <div style={s.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={s.howSection}>
        <div style={s.section}>
          <p style={s.sectionTag}>How it works</p>
          <h2 style={s.h2}>Four steps to interview-ready</h2>
          <div style={s.stepsRow}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={s.step}>
                <div style={s.stepNum}>{step.num}</div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
                {i < STEPS.length - 1 && <span style={s.stepArrow}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERVIEW MODES ── */}
      <section id="modes" style={s.section}>
        <p style={s.sectionTag}>Interview Modes</p>
        <h2 style={s.h2}>Two ways to start</h2>
        <p style={s.sectionSub}>No resume yet? No problem. Both paths generate smart, role-specific questions.</p>
        <div style={s.modesRow}>
          <div style={s.modeCard}>
            <div style={s.modeIcon}>📋</div>
            <div style={s.modeTitle}>Resume Mode</div>
            <div style={s.modeDesc}>
              Upload your PDF and our NLP engine extracts your skills and projects.
              Gemini then crafts questions based on what's actually on your resume —
              targeting gaps between what you claim and what you can explain.
            </div>
            <div style={s.tagRow}>
              {['PDF upload', 'Skill extraction', 'Project parsing', 'Skill-gap report'].map(t => (
                <span key={t} style={s.tag}>{t}</span>
              ))}
            </div>
          </div>
          <div style={s.modeCard}>
            <div style={s.modeIcon}>🎯</div>
            <div style={s.modeTitle}>Quick Start Mode</div>
            <div style={s.modeDesc}>
              Enter a job role and your years of experience. We skip the resume entirely
              and generate targeted questions for that domain and seniority level —
              useful for exploring new roles or quick daily practice.
            </div>
            <div style={s.tagRow}>
              {['No upload needed', 'Any job role', 'Experience-aware', 'Instant start'].map(t => (
                <span key={t} style={s.tag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaH2}>Ready to stop guessing<br />and start preparing?</h2>
        <p style={s.ctaSub}>
          Your next interview is closer than you think. MockMind gives you
          a structured, measurable way to be ready for it.
        </p>
        <div style={s.ctaActions}>
          <Link to={isLoggedIn ? "/setup" : "/signup"} style={s.btnLgPrimary}>
            {isLoggedIn ? "Start new interview →" : "Create free account →"}
          </Link>
          <Link to="/login" style={s.btnLgGhost}>Already have an account</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

const s = {
  hero: { display: 'flex', alignItems: 'center', gap: '48px', maxWidth: '1200px', margin: '0 auto', padding: '130px 48px 80px', flexWrap: 'wrap' },
  heroLeft: { flex: '1', minWidth: '300px' },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(108,99,255,0.12)', border: '1px solid var(--border)', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', fontWeight: '600', color: 'var(--indigo)', marginBottom: '22px', letterSpacing: '.6px', textTransform: 'uppercase' },
  eyebrowDot: { width: '6px', height: '6px', background: 'var(--indigo)', borderRadius: '50%' },
  h1: { fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,60px)', fontWeight: '700', lineHeight: '1.08', letterSpacing: '-1.5px', marginBottom: '20px' },
  heroSub: { color: 'var(--muted)', fontSize: '17px', lineHeight: '1.65', maxWidth: '480px', marginBottom: '32px' },
  heroActions: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  stats: { display: 'flex', gap: '32px', marginTop: '40px' },
  stat: { display: 'flex', flexDirection: 'column', gap: '3px' },
  statNum: { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: 'var(--muted)' },
  card: { flex: '0 0 400px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.5)' },
  cardTop: { background: 'var(--surface2)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' },
  dots: { display: 'flex', gap: '6px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  cardTitle: { fontSize: '12px', color: 'var(--muted)' },
  cardMeta: { fontSize: '11px', color: 'var(--muted)' },
  cardBody: { padding: '20px' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  badge: { background: 'rgba(108,99,255,0.12)', border: '1px solid var(--border)', color: 'var(--indigo)', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px' },
  timer: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--green)' },
  question: { fontSize: '14px', lineHeight: '1.6', marginBottom: '16px', fontWeight: '500' },
  answerBox: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', minHeight: '80px' },
  answerText: { fontSize: '13px', color: 'var(--muted)', lineHeight: '1.65' },
  cursor: { display: 'inline-block', color: 'var(--indigo)', fontWeight: '700', marginLeft: '2px' },
  voiceBadge: { fontSize: '12px', color: 'var(--muted)' },
  submitBtn: { background: 'var(--indigo)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  section: { maxWidth: '1200px', margin: '0 auto', padding: '80px 48px' },
  sectionTag: { fontSize: '11px', fontWeight: '600', color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  h2: { fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: '700', letterSpacing: '-1px', marginBottom: '12px' },
  sectionSub: { color: 'var(--muted)', fontSize: '16px', lineHeight: '1.6', maxWidth: '520px', marginBottom: '40px' },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' },
  featCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '24px' },
  featIcon: { fontSize: '26px', marginBottom: '14px' },
  featTitle: { fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '600', marginBottom: '8px' },
  featDesc: { color: 'var(--muted)', fontSize: '13px', lineHeight: '1.65' },
  howSection: { background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' },
  stepsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px', position: 'relative' },
  step: { position: 'relative' },
  stepNum: { fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '700', color: 'var(--border)', marginBottom: '12px' },
  stepTitle: { fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600', marginBottom: '8px' },
  stepDesc: { color: 'var(--muted)', fontSize: '13px', lineHeight: '1.65' },
  stepArrow: { position: 'absolute', right: '-16px', top: '20px', color: 'var(--border)', fontSize: '18px' },
  modesRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  modeCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '30px' },
  modeIcon: { fontSize: '30px', marginBottom: '14px' },
  modeTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '10px' },
  modeDesc: { color: 'var(--muted)', fontSize: '14px', lineHeight: '1.65', marginBottom: '18px' },
  tagRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tag: { background: 'rgba(108,99,255,0.1)', border: '1px solid var(--border)', color: 'var(--indigo)', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px' },
  ctaSection: { maxWidth: '680px', margin: '0 auto', padding: '80px 48px', textAlign: 'center' },
  ctaH2: { fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,4vw,44px)', fontWeight: '700', letterSpacing: '-1px', marginBottom: '16px' },
  ctaSub: { color: 'var(--muted)', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' },
  ctaActions: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' },
  btnLgPrimary: { background: 'var(--indigo)', border: 'none', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', fontFamily: 'var(--font-body)', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  btnLgGhost: { background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '13px 28px', borderRadius: '10px', fontSize: '15px', fontFamily: 'var(--font-body)', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
}