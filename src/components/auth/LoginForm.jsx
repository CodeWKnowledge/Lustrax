import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'
import { useState } from 'react'
import Button from '../ui/Button'
import { EyeIcon, ViewOffIcon } from 'hugeicons-react'

/**
 * LoginForm Component
 * Handles user authentication via email/password.
 */
const LoginForm = ({ onToggleMode, onComplete }) => {
  const { signIn } = useAuth()
  const { showAlert } = useModal()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(identifier, password)
    if (error) showAlert('Login Failed', error.message)
    else onComplete()
    setLoading(false)
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
         <h2 className="text-2xl font-bold tracking-tight text-charcoal uppercase">Sign In</h2>
         <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">Protocol Access Required</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
         <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400">Email or Phone Number</label>
            <input 
              id="login-identifier"
              type="email"
              name="email"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-charcoal transition-luxury font-medium text-sm placeholder:text-gray-200"
              placeholder="your@email.com"
              required
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="email"
            />
         </div>
         <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400">Password</label>
            <div className="relative group">
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} 
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-100 py-3 pr-10 outline-none focus:border-charcoal transition-luxury font-medium text-sm placeholder:text-gray-200"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                required
                autoComplete="current-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-3 text-gray-300 hover:text-gold transition-luxury px-2"
              >
                {showPassword ? <ViewOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
         </div>
         
         <Button type="submit" disabled={loading} className="w-full h-14" variant="primary">
            {loading ? 'Signing you in...' : 'Sign In'}
         </Button>
      </form>

      <div className="text-center pt-4">
         <button 
           onClick={onToggleMode}
           className="text-[9px] uppercase tracking-widest text-gray-400 font-bold hover:text-charcoal transition-luxury"
         >
           Don't have an account? Sign Up
         </button>
      </div>
    </div>
  )
}

export default LoginForm


