import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  // Initialize directly from localStorage — no useEffect needed for initial read
  const [token, setToken] = useState(() => localStorage.getItem('mm_token') || null)
  const [user, setUser]   = useState(() => {
    const saved = localStorage.getItem('mm_user')
    return saved ? JSON.parse(saved) : null
  })

  function login(userData, jwtToken) {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('mm_token', jwtToken)
    localStorage.setItem('mm_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
  }

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}