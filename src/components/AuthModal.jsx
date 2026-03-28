import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Cancel01Icon } from 'hugeicons-react'
import Button from './ui/Button'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/SignupForm'

/**
 * AuthModal Container
 * Manages the high-impact authentication modal state and sub-components.
 */
const AuthModal = () => {

  const { isAuthModalOpen, closeAuthModal, authMode } = useAuth()
  const [mode, setMode] = useState(authMode || 'login')

  useEffect(() => {
    if (authMode) setMode(authMode)
  }, [authMode, isAuthModalOpen])

  const toggleMode = () => setMode(prev => prev === 'login' ? 'signup' : 'login')

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop - High Contrast */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="absolute inset-0 bg-black/20 backdrop-blur-md"
          />

          

          {/* Modal Content - Ultra Compact */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative max-h-[90vh] w-full max-w-[380px] bg-white p-6 lg:p-10 rounded-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-gray-100 overflow-y-auto no-scrollbar"
          >
            <button 
              onClick={closeAuthModal}
              className="absolute top-5 right-5 text-gray-300 hover:text-gold transition-all p-1.5"
            >
               <Cancel01Icon size={18} />
            </button>


            {mode === 'select' ? (
              <div className="text-center space-y-6 py-8">
                 <h2 className="text-2xl font-serif text-charcoal tracking-wide">Welcome</h2>
                 <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Gain access to the exclusive collection.</p>
                 <div className="flex flex-col space-y-4 pt-4">
                    <Button onClick={() => setMode('signup')} variant="gold" className="w-full h-12 text-[10px] tracking-widest shadow-premium-sm">Create Account</Button>
                    <Button onClick={() => setMode('login')} variant="outline" className="w-full h-12 text-[10px] tracking-widest">Sign In</Button>
                 </div>
              </div>
            ) : mode === 'login' ? (
              <LoginForm onToggleMode={toggleMode} onComplete={closeAuthModal} />
            ) : (
              <SignupForm onToggleMode={toggleMode} onComplete={closeAuthModal} />
            )}
            
            <p className="mt-8 text-[7px] text-gray-300 text-center uppercase tracking-[0.4em] italic opacity-30">
               Secure Payment • Lustrax
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal
