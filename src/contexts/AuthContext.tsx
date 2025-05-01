import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async (email: string, password: string) => false,
  register: async (name: string, email: string, password: string, password_confirmation: string) => false,
  logout: async () => {}
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const { data } = await axios.get('/api/user')
          setUser(data)
        }
      } catch (err) {
        console.error('Failed to load user', err)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email, password) => {
    try {
      // First get CSRF cookie
      await axios.get('/sanctum/csrf-cookie')
      
      // Then login
      const { data } = await axios.post('/api/login', { email, password })
      localStorage.setItem('token', data.access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
      
      // Get user data
      const userResponse = await axios.get('/api/user')
      setUser(userResponse.data)
      
      return true
    } catch (err) {
      console.error('Login failed', err)
      return false
    }
  }

  const register = async (name, email, password, password_confirmation) => {
    try {
      await axios.get('/sanctum/csrf-cookie')
      const { data } = await axios.post('/api/register', { 
        name, 
        email, 
        password, 
        password_confirmation 
      })
      localStorage.setItem('token', data.access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
      
      const userResponse = await axios.get('/api/user')
      setUser(userResponse.data)
      
      return true
    } catch (err) {
      console.error('Registration failed', err)
      return false
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/logout')
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)