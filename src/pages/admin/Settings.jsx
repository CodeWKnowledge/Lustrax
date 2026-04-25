import { motion, AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

import { 
  Settings02Icon, 
  Shield01Icon, 
  UserCircleIcon,
  Logout01Icon,
  Key01Icon,
  CheckmarkCircle01Icon,
  AlertSquareIcon,
  Delete02Icon
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

  const [resetConfirm, setResetConfirm] = useState(null) // 'orders', 'notifications', 'wishlist', 'profiles', 'all'
  const [resetConfirmText, setResetConfirmText] = useState('')

  const handleReset = async (type) => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc('reset_system_data', { 
        target_tables: [type] 
      })

      if (error) throw error
      
      toast.success(`${type.toUpperCase()} data purge successful.`)
      setResetConfirm(null)
      setResetConfirmText('')
    } catch (err) {
      toast.error('Data reset protocol failed: ' + err.message)
    } finally {
      setLoading(false)
    }
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
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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

        {/* Maintenance & Data Management (N-2) */}
        <section className="space-y-12 pt-16 border-t border-gray-50 bg-red-50/10 -mx-6 px-6 py-12 lg:-mx-12 lg:px-12">
            <div className="flex items-center space-x-4 text-red-500">
               <AlertSquareIcon size={18} />
               <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Maintenance & Data Management</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Reset Buttons */}
                {[
                  { id: 'orders', label: 'Purge Orders & Finance', icon: <Delete02Icon size={14} />, tooltip: 'Affects Orders, Finance, and Transactions pages.' },
                  { id: 'profiles', label: 'Purge Customers', icon: <Delete02Icon size={14} />, tooltip: 'Affects Customers page.' },
                  { id: 'notifications', label: 'Clear Notifications', icon: <Delete02Icon size={14} />, tooltip: 'Affects Notifications page.' },
                  { id: 'wishlist', label: 'Reset All Wishlists', icon: <Delete02Icon size={14} />, tooltip: 'Affects Customer Wishlists.' }
                ].map(action => (
                  <div key={action.id} className="relative space-y-4 p-6 border border-red-100/20 rounded-luxury hover:bg-white transition-luxury group">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                        {action.tooltip}
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45"></div>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-charcoal transition-luxury">{action.label}</p>
                      {resetConfirm === action.id ? (
                        <div className="flex items-center gap-2">
                           <Button 
                             onClick={() => handleReset(action.id)} 
                             disabled={loading}
                             className="h-9 px-4 bg-red-600 border-red-600 text-[8px] flex-1"
                           >
                             Confirm Purge
                           </Button>
                           <button onClick={() => setResetConfirm(null)} className="text-[8px] uppercase tracking-widest font-bold text-gray-400 px-2">Cancel</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setResetConfirm(action.id)}
                          className="text-red-500 text-[8px] uppercase tracking-[0.2em] font-bold flex items-center hover:opacity-70 transition-luxury"
                        >
                          {action.icon}
                          <span className="ml-2">Initialize Reset</span>
                        </button>
                      )}
                  </div>
                ))}
            </div>

            <div className="pt-8 border-t border-red-100/10">
               <div className="bg-white p-8 border border-red-100 space-y-6 max-w-2xl">
                  <h4 className="text-sm font-playfair font-bold text-charcoal">Full System Reset Protocol</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    Execute a complete factory reset. This will permanently delete all orders, financial records, notifications, and user metadata across the entire platform. This action is irreversible.
                  </p>
                  
                  {resetConfirm === 'all' ? (
                    <div className="space-y-4">
                       <div className="space-y-2 max-w-sm">
                          <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-charcoal">Type "RESET" to confirm</label>
                          <input 
                            type="text" 
                            value={resetConfirmText}
                            onChange={(e) => setResetConfirmText(e.target.value)}
                            placeholder="RESET"
                            className="w-full bg-transparent border-b border-red-200 py-2 outline-none font-bold text-[11px] text-charcoal tracking-widest placeholder:text-gray-200"
                          />
                       </div>
                       <div className="flex items-center gap-6 pt-2">
                          <Button 
                            variant="primary" 
                            onClick={() => {
                              if (resetConfirmText === 'RESET') {
                                handleReset('all')
                              } else {
                                toast.error('Please type RESET to confirm full system wipe.')
                              }
                            }}
                            disabled={loading || resetConfirmText !== 'RESET'}
                            className="bg-red-600 border-red-600 px-12 h-12 text-[10px] disabled:opacity-50"
                          >
                            {loading ? 'RESETTING...' : 'EXECUTE FULL RESET'}
                          </Button>
                          <button onClick={() => { setResetConfirm(null); setResetConfirmText(''); }} className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Abort Protocol</button>
                       </div>
                    </div>
                  ) : (
                    <div className="relative group inline-block">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                        Affects Orders, Finance, Customers, Notifications, and Wishlist pages.
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45"></div>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => setResetConfirm('all')}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-10 h-14"
                      >
                        Initialize Full Reset
                      </Button>
                    </div>
                  )}
               </div>
            </div>
        </section>
    </motion.div>
  )
}

export default Settings




