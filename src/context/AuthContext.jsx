import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchProfile(currentUser.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      setProfile(data || null)
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (identifier, password) => {
    try {
      const isEmail = identifier.includes('@')
      const credentials = isEmail ? { email: identifier, password } : { phone: identifier, password }
      const { data, error } = await supabase.auth.signInWithPassword(credentials)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Your email/phone or password is incorrect.' } }
        }
        return { error }
      }
      if (data.user) await fetchProfile(data.user.id)
      return { data, error: null }
    } catch (err) {
      return { error: err }
    }
  }

  const signUp = async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { 
          full_name: fullName,
          phone: phone
        }
      }
    })
    return { data, error }
  }

  const signOut = () => supabase.auth.signOut()

  const refreshProfile = () => {
    if (user) return fetchProfile(user.id)
  }

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }
  const closeAuthModal = () => setIsAuthModalOpen(false)

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, 
      signIn, signUp, signOut, refreshProfile,
      isAuthModalOpen, openAuthModal, closeAuthModal, authMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
