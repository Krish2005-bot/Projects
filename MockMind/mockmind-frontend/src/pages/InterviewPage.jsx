import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { evaluateSession } from '../services/api'
import Navbar from '../components/Navbar'

const TIMER_SECONDS = 180

export default function InterviewPage() {
  const {
    questions: ctxQuestions, answers, currentIndex,
    submitAnswer, setResults, jobRole, setQuestions,
    difficulty, mode,
  } = useInterview()

  const navigate = useNavigate()

  // Fallback: read from sessionStorage if context is empty after navigation
  useEffect(() => {
    if (!ctxQuestions || ctxQuestions.length === 0) {
      const saved = sessionStorage.getItem('mm_questions')
      if (saved) {
        setQuestions(JSON.parse(saved))
      } else {
        navigate('/setup')
      }
    }
  }, [])

  const questions = ctxQuestions

  const [answerText, setAnswerText] = useState('')
  const [answerMode, setAnswerMode] = useState('type')
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [isListening, setIsListening] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  const timerRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    setAnswerText('')
    setTimeLeft(TIMER_SECONDS)
    setStartTime(Date.now())
    stopListening()
    setAnswerMode('type')
  }, [currentIndex])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentIndex])

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Use Chrome.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ')
      setAnswerText(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  function toggleVoice() {
    isListening ? stopListening() : startListening()
  }

  async function handleSubmit(autoSubmit = false) {
    clearInterval(timerRef.current)
    stopListening()
    const secondsTaken = Math.round((Date.now() - startTime) / 1000)
    const finalAnswer = answerText.trim() || '[No answer provided]'

    const updatedAnswers = submitAnswer(finalAnswer, secondsTaken)

    if (currentIndex + 1 >= questions.length) {
      setEvaluating(true)
      try {
        const allAnswers = updatedAnswers

        const result = await evaluateSession({
          questions,
          answers: allAnswers,
          jobRole,
          difficulty,
          mode
        })
        setResults(result)
        navigate('/results')
      } catch (err) {
        console.error('Evaluation failed:', err)
        alert('Something went wrong while evaluating your answers. Please try again.')
        navigate('/setup')
      } finally {
        setEvaluating(false)
      }
    }
  }

  if (evaluating) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.loadingIcon}>✅</div>
        <div style={s.loadingTitle}>Evaluating your answers...</div>
        <div style={s.loadingSubtext}>Gemini is reviewing your session</div>
      </div>
    )
  }

  if (!questions || questions.length === 0) return null

  const question = questions[currentIndex]
  const isCodeQuestion = question ? /sql|query|queries|code|select|insert|update|delete|table|database|schema|develop|implement|program|function|method|class|script/i.test(question) : false;
  const progress = ((currentIndex) / questions.length) * 100
  const timerColor = timeLeft <= 10 ? '#FF5C5C' : timeLeft <= 20 ? '#F5A623' : 'var(--green)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* PROGRESS BAR */}
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>

      <div style={s.page}>
        <div style={s.container}>

          {/* HEADER ROW */}
          <div style={s.headerRow}>
            <span style={s.qCounter}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ ...s.timer, color: timerColor }}>
              ⏱ {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>

          {/* QUESTION CARD */}
          <div style={s.questionCard}>
            <div style={s.questionLabel}>Question</div>
            <p style={s.questionText}>{question}</p>
          </div>

          {/* ANSWER INPUT */}
          {isCodeQuestion ? (
            <div style={s.consoleContainer}>
              <div style={s.consoleHeader}>
                <div style={s.consoleDots}>
                  <span style={{ ...s.consoleDot, background: '#FF5F56' }} />
                  <span style={{ ...s.consoleDot, background: '#FFBD2E' }} />
                  <span style={{ ...s.consoleDot, background: '#27C93F' }} />
                </div>
                <span style={s.consoleTitle}>Code & SQL Console</span>
                <span style={s.consoleLang}>Monospace</span>
              </div>
              <div style={s.consoleBody}>
                <div style={s.consoleLines}>
                  {Array.from({ length: Math.max(answerText.split('\n').length, 8) }, (_, i) => i + 1).map(n => (
                    <div key={n} style={s.lineNumber}>{n}</div>
                  ))}
                </div>
                <textarea
                  style={s.consoleTextarea}
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  placeholder="-- Write your SQL query or code here...&#10;-- Example: SELECT * FROM users;"
                />
              </div>
            </div>
          ) : (
            <>
              {/* ANSWER MODE TOGGLE */}
              <div style={s.modeToggle}>
                <button
                  onClick={() => { setAnswerMode('type'); stopListening() }}
                  style={{ ...s.toggleBtn, ...(answerMode === 'type' ? s.toggleActive : {}) }}
                >
                  ⌨️ Type
                </button>
                <button
                  onClick={() => setAnswerMode('voice')}
                  style={{ ...s.toggleBtn, ...(answerMode === 'voice' ? s.toggleActive : {}) }}
                >
                  🎙️ Voice
                </button>
              </div>

              {answerMode === 'type' ? (
                <textarea
                  style={s.textarea}
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                />
              ) : (
                <div style={s.voiceBox}>
                  <button
                    onClick={toggleVoice}
                    style={{ ...s.micBtn, ...(isListening ? s.micBtnActive : {}) }}
                  >
                    {isListening ? '🔴 Stop' : '🎙️ Start speaking'}
                  </button>
                  {answerText ? (
                    <div style={s.transcript}>
                      <div style={s.transcriptLabel}>Transcript</div>
                      <p style={s.transcriptText}>{answerText}</p>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                      Click the button above and start speaking your answer.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* SUBMIT BUTTON */}
          <div style={s.submitRow}>
            <span style={s.skipText}>
              Timer auto-submits at 00:00
            </span>
            <button
              onClick={() => handleSubmit(false)}
              style={s.submitBtn}
            >
              {currentIndex + 1 === questions.length ? 'Finish Interview →' : 'Next Question →'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

const s = {
  loadingScreen: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' },
  loadingIcon: { fontSize: '48px', marginBottom: '8px' },
  loadingTitle: { fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700 },
  loadingSubtext: { color: 'var(--muted)', fontSize: '15px' },
  progressTrack: { position: 'fixed', top: '64px', left: 0, right: 0, height: '3px', background: 'var(--surface2)', zIndex: 99 },
  progressFill: { height: '100%', background: 'var(--indigo)', transition: 'width .4s ease' },
  page: { padding: '100px 24px 60px', display: 'flex', justifyContent: 'center' },
  container: { width: '100%', maxWidth: '680px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  qCounter: { fontSize: '13px', color: 'var(--muted)', fontWeight: '500' },
  timer: { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, transition: 'color .3s' },
  questionCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', marginBottom: '24px' },
  questionLabel: { fontSize: '11px', fontWeight: '600', color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' },
  questionText: { fontSize: '18px', lineHeight: '1.65', fontWeight: '500' },
  consoleContainer: { background: '#11121e', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' },
  consoleHeader: { background: '#17192b', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' },
  consoleDots: { display: 'flex', gap: '8px' },
  consoleDot: { width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' },
  consoleTitle: { fontSize: '13px', color: 'var(--muted)', fontWeight: '600', fontFamily: 'var(--font-body)' },
  consoleLang: { fontSize: '11px', color: 'var(--indigo)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },
  consoleBody: { display: 'flex', minHeight: '220px' },
  consoleLines: { padding: '16px 12px', background: '#0a0b12', borderRight: '1px solid var(--border)', color: '#4a4a6a', textAlign: 'right', userSelect: 'none', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Consolas, Monaco, "Andale Mono", monospace', minWidth: '40px' },
  lineNumber: { height: '22.4px' },
  consoleTextarea: { flex: 1, background: 'transparent', border: 'none', padding: '16px', color: '#e0e0ed', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Consolas, Monaco, "Andale Mono", monospace', resize: 'vertical', outline: 'none', width: '100%', minHeight: '220px' },
  modeToggle: { display: 'flex', gap: '10px', marginBottom: '16px' },
  toggleBtn: { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  toggleActive: { border: '1px solid var(--indigo)', color: 'var(--indigo)', background: 'rgba(108,99,255,0.1)' },
  textarea: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--white)', fontSize: '15px', fontFamily: 'var(--font-body)', lineHeight: '1.65', resize: 'vertical', outline: 'none', marginBottom: '20px' },
  voiceBox: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '20px' },
  micBtn: { background: 'var(--indigo)', border: 'none', color: '#fff', padding: '14px 32px', borderRadius: '999px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  micBtnActive: { background: '#FF5C5C' },
  transcript: { width: '100%', background: 'var(--surface2)', borderRadius: '8px', padding: '14px' },
  transcriptLabel: { fontSize: '11px', fontWeight: '600', color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  transcriptText: { fontSize: '14px', color: 'var(--muted)', lineHeight: '1.65' },
  submitRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  skipText: { fontSize: '13px', color: 'var(--muted)' },
  submitBtn: { background: 'var(--indigo)', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' },
}