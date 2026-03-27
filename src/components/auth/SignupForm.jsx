import React, { useState } from 'react'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'

/**
 * SignupForm Component
 * Handles new user registration (Membership Requests).
 */
const SignupForm = ({ onToggleMode, onComplete }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { showAlert } = useModal()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(email, password, fullName, phone)
    if (error) showAlert('Registration Error', error.message)
    else {
      await showAlert('Account Created', 'Successfully registered. Please verify your email before signing in.')
      onComplete()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
         <h2 className="text-2xl font-bold tracking-tight text-charcoal">Create Account</h2>
         <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Create a new account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400">Full Name</label>
            <input 
              type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-charcoal transition-luxury font-medium text-sm placeholder:text-gray-200"
              placeholder="Julian Blackwood" required
            />
         </div>
         <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400">Email</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-charcoal transition-luxury font-medium text-sm placeholder:text-gray-200"
              placeholder="your@email.com" required
            />
         </div>
         <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400">Phone Number</label>
            <input 
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-charcoal transition-luxury font-medium text-sm placeholder:text-gray-200"
              placeholder="+234..." required
            />
         </div>
         <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400">Password</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-charcoal transition-luxury font-medium text-sm placeholder:text-gray-200"
              placeholder="••••••••" required
            />
         </div>
         
         <div className="pt-4">
           <Button type="submit" disabled={loading} className="w-full h-14" variant="primary">
              {loading ? 'Creating your account...' : 'Create Account'}
           </Button>
         </div>
      </form>

      <div className="text-center pt-4">
         <button 
           onClick={onToggleMode}
           className="text-[9px] uppercase tracking-widest text-gray-400 font-bold hover:text-charcoal transition-luxury"
         >
           Already have an account? Sign In
         </button>
      </div>
    </div>
  )
}

export default SignupForm
