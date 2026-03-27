import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import { motion } from 'framer-motion'
import { 
  Settings02Icon, 
  Shield01Icon, 
  UserCircleIcon,
  Logout01Icon,
  Key01Icon,
  CheckmarkCircle01Icon
} from 'hugeicons-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const Settings = () => {
  const { profile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('Security protocol requires a minimum of 6 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      toast.error('Credential synchronization failed: ' + error.message)
    } else {
      toast.success('Security credentials updated successfully.')
      setNewPassword('')
      setShowPasswordInput(false)
    }
    setLoading(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-12 md:space-y-16 lg:space-y-20 pb-20"
    >
      <div className="flex flex-col space-y-2 border-b border-gray-50 pb-8 md:pb-12">
         <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-gold italic">Admin Settings</span>
         <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Account & Security</h1>
      </div>

      {/* Curator Profile Section */}
      <section className="space-y-12">
          <div className="flex items-center space-x-4 text-gold">
             <UserCircleIcon size={18} />
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Profile Information</h3>
          </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-300">Email Address</label>
                <input 
                  type="text" value={profile?.email || ''} readOnly
                  className="w-full bg-transparent border-b border-gray-100 py-3 outline-none font-bold text-[11px] text-gray-400 cursor-not-allowed uppercase tracking-widest"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-300">Account Role</label>
                <input 
                  type="text" value={profile?.role || 'Admin'} readOnly
                  className="w-full bg-transparent border-b border-gray-100 py-3 outline-none font-bold text-[11px] text-gold cursor-not-allowed uppercase tracking-widest"
                />
             </div>
         </div>
      </section>

      {/* Security & Access Section */}
       <section className="space-y-12 pt-12 border-t border-gray-50">
          <div className="flex items-center space-x-4 text-gold">
             <Shield01Icon size={18} />
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Security Management</h3>
          </div>

          <div className="flex flex-col space-y-8 max-w-sm">
             {!showPasswordInput ? (
               <Button 
                 variant="outline" 
                 className="px-10 h-14 group"
                 onClick={() => setShowPasswordInput(true)}
               >
                 <Key01Icon size={16} className="mr-4 group-hover:rotate-12 transition-luxury" /> 
                 <span className="text-[9px]">Initiate Key Update</span>
               </Button>
             ) : (
               <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                 <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-300">New Access Key</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none font-bold text-[11px] text-charcoal tracking-widest placeholder:text-gray-100"
                      autoFocus
                    />
                 </div>
                 <div className="flex items-center gap-4">
                    <Button 
                      type="submit"
                      disabled={loading}
                      variant="primary" 
                      className="flex-1 h-12"
                    >
                      <CheckmarkCircle01Icon size={14} className="mr-2" />
                      <span className="text-[9px]">{loading ? 'Syncing...' : 'Confirm Update'}</span>
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setShowPasswordInput(false)}
                      className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-charcoal px-4"
                    >
                      Cancel
                    </button>
                 </div>
               </form>
             )}
             
             <Button 
               onClick={signOut}
               variant="outline" 
               className="px-10 h-14 border-red-500/10 text-red-500 hover:bg-red-500/5 group"
             >
                <Logout01Icon size={16} className="mr-4 group-hover:-translate-x-1 transition-luxury" />
                <span className="text-[9px]">Terminate Session</span>
             </Button>
          </div>
      </section>

      {/* Manifest Preferences */}
       <section className="space-y-10 pt-12 border-t border-gray-50">
          <div className="flex items-center space-x-4 text-gray-200">
             <Settings02Icon size={18} />
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Platform Info</h3>
          </div>
          <p className="text-gray-400 text-[11px] leading-loose italic font-light max-w-xl">
            This dashboard is fully optimized for mobile devices. More advanced administrative tools, including automated reporting and customer engagement insights, are currently being developed.
          </p>
       </section>
    </motion.div>
  )
}

export default Settings
