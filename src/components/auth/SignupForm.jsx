import React, { useState, useEffect } from 'react'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'
import { EyeIcon, ViewOffIcon, CheckmarkCircle01Icon, Cancel01Icon } from 'hugeicons-react'

/**
 * SignupForm Component
 * Handles new user registration (Membership Requests).
 */
const SignupForm = ({ onToggleMode, onComplete }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [validation, setValidation] = useState({
    length: false,
    upper: false,
    number: false,
    special: false
  })

  const { signUp } = useAuth()
  const { showAlert } = useModal()

  useEffect(() => {
    setValidation({
      length: password.length >= 6,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"|<>?,.\/`~]/.test(password)
    })
  }, [password])

  const isFormValid = validation.length && validation.upper && validation.number && validation.special && fullName && email && phone

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) return
    
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
    <div className="space-y-6">
      <div className="text-center space-y-1">
         <h2 className="text-2xl font-bold tracking-tight text-charcoal uppercase">Create Account</h2>
         <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">New Identity Protocol</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
         {/* Row 1: COMPACT GRID */}
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400">Full Name</label>
                <input 
                  id="signup-name"
                  type="text"
                  name="name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-100 py-2 outline-none focus:border-charcoal transition-luxury font-medium text-[11px] placeholder:text-gray-200"
                  placeholder="Julian Blackwood"
                  required
                  autoComplete="name"
                  autoCorrect="on"
                  autoCapitalize="words"
                  spellCheck="true"
                  inputMode="text"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400">Email</label>
                <input 
                  id="signup-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-100 py-2 outline-none focus:border-charcoal transition-luxury font-medium text-[11px] placeholder:text-gray-200"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  inputMode="email"
                />
            </div>
         </div>

         <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400">Phone Number</label>
            <input 
              id="signup-phone"
              type="tel"
              name="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-transparent border-b border-gray-100 py-2 outline-none focus:border-charcoal transition-luxury font-medium text-[11px] placeholder:text-gray-200"
              placeholder="e.g. 08012345678"
              required
              autoComplete="tel"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="tel"
            />
         </div>

         <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400">Password</label>
            <div className="relative group">
              <input 
                id="signup-password"
                type={showPassword ? "text" : "password"} 
                name="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-100 py-2 pr-10 outline-none focus:border-charcoal transition-luxury font-medium text-[11px] placeholder:text-gray-200"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-gray-300 hover:text-gold transition-luxury px-2"
              >
                {showPassword ? <ViewOffIcon size={14} /> : <EyeIcon size={14} />}
              </button>
            </div>
            
            {/* LIVE VALIDATION LEDGER - COMPACT */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2">
               <div className={`flex items-center space-x-1.5 ${validation.length ? 'text-green-600' : 'text-gray-300'}`}>
                  {validation.length ? <CheckmarkCircle01Icon size={10} /> : <div className="w-2.5 h-2.5 border border-gray-100 rounded-full" />}
                  <span className="text-[7px] uppercase tracking-wider font-bold">6+ Chars</span>
               </div>
               <div className={`flex items-center space-x-1.5 ${validation.upper ? 'text-green-600' : 'text-gray-300'}`}>
                  {validation.upper ? <CheckmarkCircle01Icon size={10} /> : <div className="w-2.5 h-2.5 border border-gray-100 rounded-full" />}
                  <span className="text-[7px] uppercase tracking-wider font-bold">Uppercase</span>
               </div>
               <div className={`flex items-center space-x-1.5 ${validation.number ? 'text-green-600' : 'text-gray-300'}`}>
                  {validation.number ? <CheckmarkCircle01Icon size={10} /> : <div className="w-2.5 h-2.5 border border-gray-100 rounded-full" />}
                  <span className="text-[7px] uppercase tracking-wider font-bold">Number</span>
               </div>
               <div className={`flex items-center space-x-1.5 ${validation.special ? 'text-green-600' : 'text-gray-300'}`}>
                  {validation.special ? <CheckmarkCircle01Icon size={10} /> : <div className="w-2.5 h-2.5 border border-gray-100 rounded-full" />}
                  <span className="text-[7px] uppercase tracking-wider font-bold">Symbol</span>
               </div>
            </div>
         </div>
         
         <div className="pt-2">
           <Button type="submit" disabled={loading || !isFormValid} className="w-full h-12 text-[10px] tracking-[0.2em]" variant="primary">
              {loading ? 'INGESTING...' : 'INITIALIZE ACCOUNT'}
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
