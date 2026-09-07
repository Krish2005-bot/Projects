const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── HELPER ──────────────────────────────────────────────
// Sends request, parses JSON, throws error if status not ok
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('mm_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Request failed')
  }

  return data
}

// ── AUTH ─────────────────────────────────────────────────

export async function signupUser({ name, email, password }) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function loginUser({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ── RESUME ───────────────────────────────────────────────

export async function parseResume(file) {
  const token = localStorage.getItem('mm_token')
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/resume/parse`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Resume parsing failed')
  return data
}

// ── QUESTIONS ────────────────────────────────────────────

export async function generateQuestions({ jobRole, experience, difficulty, numQuestions, skills }) {
  return request('/interview/generate', {
    method: 'POST',
    body: JSON.stringify({ jobRole, experience, difficulty, numQuestions, skills }),
  })
}

// ── EVALUATION ───────────────────────────────────────────

export async function evaluateSession({ questions, answers, jobRole, difficulty, mode }) {
  return request('/interview/evaluate', {
    method: 'POST',
    body: JSON.stringify({ questions, answers, jobRole, difficulty, mode }),
  })
}

// ── HISTORY ──────────────────────────────────────────────

export async function getHistory() {
  return request('/interview/history')
}

export async function getSessionById(sessionId) {
  return request(`/interview/history/${sessionId}`)
}