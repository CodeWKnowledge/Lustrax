import { motion, AnimatePresence } from 'framer-motion'
import React, { useState, useEffect, useRef } from 'react'
import { 
Link } from 'react-router-dom'

import { 

  UserCircleIcon, 
  Logout01Icon, 
  DashboardSquare01Icon,
  PackageIcon,
  Settings02Icon,
  Invoice01Icon
} from 'hugeicons-react'

const ProfileDropdown = ({ user, profile, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    { 
      label: profile?.role === 'admin' ? 'Admin Dashboard' : 'My Account', 
      icon: <DashboardSquare01Icon size={16} />, 
      link: profile?.role === 'admin' ? '/admin' : '/dashboard' 
    },
    { label: 'My Orders', icon: <PackageIcon size={16} />, link: '/dashboard/orders' },
    { label: 'Transactions', icon: <Invoice01Icon size={16} />, link: '/dashboard/transactions' },
    { label: 'Settings', icon: <Settings02Icon size={16} />, link: '/dashboard/settings' },
  ]

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-charcoal hover:text-gold transition-all flex items-center"
      >
        <UserCircleIcon size={22} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-50 overflow-hidden z-[110]"
          >
            {/* User Info Section */}
            <div className="p-5 bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                  {profile?.full_name?.charAt(0) || user.email.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-charcoal uppercase tracking-widest truncate">
                    {profile?.full_name || 'Valued Curator'}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate tracking-tight">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.link}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-charcoal hover:bg-gray-50 transition-all group"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-gray-300 group-hover:text-gold transition-colors">
                    {item.icon}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    {item.label}
                  </span>
                </Link>
              ))}

              <div className="my-1 border-t border-gray-50" />

              <button
                onClick={() => {
                  setIsOpen(false)
                  onSignOut()
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50/50 transition-all group"
              >
                <span className="text-red-200 group-hover:text-red-400 transition-colors">
                  <Logout01Icon size={16} />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Logout
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileDropdown




