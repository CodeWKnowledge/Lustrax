import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import { motion } from 'framer-motion'

const Login = () => {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, profile } = useAuth()
  const { showAlert } = useModal()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!identifier.trim() || !password.trim()) {
      showAlert('Input Required', 'Please enter your credentials.')
      return
    }

    setLoading(true)
    const { error } = await signIn(identifier, password)
    
    if (error) {
      showAlert('Login Failed', error.message)
    } else {
      // The profile might not be immediate in state, but AuthContext handles typical flow.
      // However, we can trust the AuthContext to handle the redirect or check here if ready.
      if (profile?.role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-bg px-6 py-24">

      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 rounded-luxury shadow-premium border border-gold-subtle relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
           <Link to="/" className="inline-flex flex-col items-center">
              <span className="text-2xl font-bold tracking-[0.5em] text-charcoal font-serif">LUSTRAX.</span>
              <span className="text-[10px] tracking-[0.4em] text-gold font-bold">JEWELRIES</span>
           </Link>
           <h2 className="text-3xl font-bold tracking-tighter font-serif uppercase pt-4">Welcome Back</h2>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Email or Phone Number</label>
            <input 
              type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
              className="w-full bg-soft-bg border border-gray-100 rounded-luxury p-5 outline-none focus:border-gold transition-luxury font-medium text-sm shadow-sm"
               placeholder="your@email.com or +234..." required
            />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Password</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-soft-bg border border-gray-100 rounded-luxury p-5 outline-none focus:border-gold transition-luxury font-medium text-sm shadow-sm"
              placeholder="••••••••" required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-16" variant="gold">
             {loading ? 'Signing you in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-12 text-center text-[10px] uppercase tracking-widest text-gray-400 font-bold">
           Don't have an account? <Link to="/signup" className="text-gold hover:text-gold-dark border-b border-gold-subtle pb-0.5 ml-2 transition-luxury">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
