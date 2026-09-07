import { createContext, useContext, useState } from 'react'

const InterviewContext = createContext(null)

export function InterviewProvider({ children }) {

  // Setup config — filled in SetupPage
  const [mode, setMode]             = useState(null)   // 'resume' | 'manual'
  const [jobRole, setJobRole]       = useState('')
  const [experience, setExperience] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(10)

  // Interview session — filled in InterviewPage
  const [questions, setQuestions]   = useState([])
  const [answers, setAnswers]       = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeTaken, setTimeTaken]   = useState([])  // seconds per question

  // Results — filled after evaluation
  const [results, setResults]       = useState(null)

  // Save one answer and move to next question
  function submitAnswer(answerText, secondsTaken) {
    const updated = [...answers, { answer: answerText, timeTaken: secondsTaken }]
    setAnswers(updated)
    setCurrentIndex(prev => prev + 1)
    return updated
  }

  // Reset everything — called when starting a new session
  function resetInterview() {
    setMode(null)
    setJobRole('')
    setExperience('')
    setDifficulty('medium')
    setNumQuestions(10)
    setQuestions([])
    setAnswers([])
    setCurrentIndex(0)
    setTimeTaken([])
    setResults(null)
  }

  const isFinished = questions.length > 0 && currentIndex >= questions.length

  return (
    <InterviewContext.Provider value={{
      // config
      mode, setMode,
      jobRole, setJobRole,
      experience, setExperience,
      difficulty, setDifficulty,
      numQuestions, setNumQuestions,
      // session
      questions, setQuestions,
      answers,
      currentIndex,
      timeTaken, setTimeTaken,
      isFinished,
      submitAnswer,
      // results
      results, setResults,
      // reset
      resetInterview,
    }}>
      {children}
    </InterviewContext.Provider>
  )
}

// Custom hook — use this in any component
export function useInterview() {
  return useContext(InterviewContext)
}