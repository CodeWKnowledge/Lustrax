import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import { motion } from 'framer-motion'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { showAlert } = useModal()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length < 6) {
      showAlert('Security Requirement', 'Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    
    if (error) {
      showAlert('Registration Error', error.message)
    } else {
      await showAlert('Membership Request Received', 'A verification link has been sent to your email. Please activate it to complete your Lustrax membership.')
      navigate('/login')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-bg px-6 py-24">
      <div className="absolute inset-0 z-0 opacity-10">
         <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover grayscale" />
      </div>

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
           <h2 className="text-3xl font-bold tracking-tighter font-serif uppercase pt-4">Create Account</h2>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Sign up for a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Email Address</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-soft-bg border border-gray-100 rounded-luxury p-5 outline-none focus:border-gold transition-luxury font-medium text-sm shadow-sm"
               placeholder="your@email.com" required
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
             {loading ? 'SIGNING UP...' : 'SIGN UP'}
          </Button>
        </form>

        <p className="mt-12 text-center text-[10px] uppercase tracking-widest text-gray-400 font-bold">
           Already have an account? <Link to="/login" className="text-gold hover:text-gold-dark border-b border-gold-subtle pb-0.5 ml-2 transition-luxury">Sign In</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup
