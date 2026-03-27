import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  UserCircleIcon, 
  Shield01Icon, 
  Key01Icon,
  CheckmarkCircle02Icon,
  Alert01Icon
} from 'hugeicons-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  
  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      await refreshProfile()
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      return setError('New passwords do not match.')
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: passwords.new 
      })

      if (updateError) throw updateError
      
      setSuccess('Password updated successfully.')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-12 md:space-y-16 lg:space-y-20 pb-20">
      <div className="flex flex-col space-y-2 border-b border-gray-50 pb-8">
         <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Account Settings</h1>
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Update your profile and password</p>
      </div>

      <AnimatePresence>
        {(success || error) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-6 rounded-luxury border flex items-center space-x-4 ${
              success ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            {success ? <CheckmarkCircle02Icon size={18} /> : <Alert01Icon size={18} />}
            <p className="text-[10px] font-bold uppercase tracking-widest">{success || error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Section */}
      <section className="space-y-10">
         <div className="flex items-center space-x-4 text-gold">
            <UserCircleIcon size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Profile Information</h3>
         </div>
         
         <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Full Name</label>
               <input 
                 type="text" 
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 placeholder="Your full name"
                 className="w-full bg-white border-b border-gray-100 py-3 outline-none font-bold text-[11px] text-charcoal focus:border-gold transition-all"
               />
            </div>
            <div className="space-y-3">
               <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Email Address</label>
               <input 
                 type="text" 
                 value={user?.email || ''} 
                 readOnly
                 className="w-full bg-transparent border-b border-gray-100 py-3 outline-none font-bold text-[11px] text-gray-300 cursor-not-allowed"
               />
            </div>
            <div className="md:col-span-2 pt-4">
               <Button type="submit" loading={loading} className="text-[9px] px-10 h-10">
                  Update Profile
               </Button>
            </div>
         </form>
      </section>

      {/* Security Section */}
      <section className="space-y-10 pt-16 border-t border-gray-50">
         <div className="flex items-center space-x-4 text-gold">
            <Shield01Icon size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Security</h3>
         </div>

         <form onSubmit={handleUpdatePassword} className="space-y-10 max-w-xl">
            <div className="space-y-3">
               <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">New Password</label>
               <div className="relative">
                  <Key01Icon size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-200" />
                  <input 
                    type="password" 
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    placeholder="Min 6 characters"
                    className="w-full bg-white border-b border-gray-100 py-3 pl-8 outline-none font-bold text-[11px] text-charcoal focus:border-gold transition-all"
                    required
                  />
               </div>
            </div>
            <div className="space-y-3">
               <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Confirm New Password</label>
               <div className="relative">
                  <Key01Icon size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-200" />
                  <input 
                    type="password" 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    placeholder="Verify new password"
                    className="w-full bg-white border-b border-gray-100 py-3 pl-8 outline-none font-bold text-[11px] text-charcoal focus:border-gold transition-all"
                    required
                  />
               </div>
            </div>
            <div className="pt-4">
               <Button type="submit" loading={loading} variant="outline" className="text-[9px] px-10 h-10">
                  Update Password
               </Button>
            </div>
         </form>
      </section>
    </div>
  )
}

export default Settings
