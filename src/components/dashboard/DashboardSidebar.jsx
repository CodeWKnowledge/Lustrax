import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { 
Link, useLocation } from 'react-router-dom'
import { 

  Home01Icon, 
  ShoppingBag02Icon, 
  FavouriteIcon, 
  UserSettings01Icon,
  Logout01Icon,
  Archive01Icon,
  Invoice01Icon,
  ConversationIcon
} from 'hugeicons-react'


const DashboardSidebar = ({ isCollapsed, isSidebarOpen, onClose }) => {
  const location = useLocation()

  const menuItems = [
    { name: 'Overview', icon: <Home01Icon size={18} />, path: '/dashboard' },
    { name: 'Orders', icon: <Archive01Icon size={18} />, path: '/dashboard/orders' },
    { name: 'Wishlist', icon: <FavouriteIcon size={18} />, path: '/dashboard/wishlist' },
    { name: 'Transactions', icon: <Invoice01Icon size={18} />, path: '/dashboard/transactions' },
    { name: 'Account Settings', icon: <UserSettings01Icon size={18} />, path: '/dashboard/settings' },
  ]

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:sticky left-0 top-0 h-screen bg-white border-r border-gray-100 transition-luxury z-[70] 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72 flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-24 flex items-center px-8 border-b border-gray-50/50">
            <Link to="/" className="flex flex-col">
              <span className={`text-xl font-serif text-charcoal uppercase tracking-[0.4em] transition-all ${isCollapsed ? 'lg:scale-0' : 'scale-100'}`}>
                Lustrax
              </span>
              <span className={`text-[7px] text-gold font-bold tracking-[0.4em] uppercase opacity-60 transition-all ${isCollapsed ? 'lg:scale-0' : 'scale-100'}`}>
                Dashboard
              </span>
              {isCollapsed && <span className="absolute left-1/2 -translate-x-1/2 text-xl font-serif text-gold hidden lg:block">L</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-12 px-4 space-y-1 overflow-y-auto no-scrollbar">
            {menuItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center space-x-4 px-5 py-3.5 rounded-luxury transition-all relative group ${
                    active 
                    ? 'bg-gray-50 text-charcoal' 
                    : 'text-gray-400 hover:text-charcoal hover:bg-gray-50/50'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 w-1 h-4 bg-gold rounded-full" />
                  )}
                  <div className={`${active ? 'text-gold' : 'group-hover:text-gold transition-luxury'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                    {item.name}
                  </span>
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-4 py-2 bg-charcoal text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-premium opacity-0 lg:group-hover:opacity-100 transition-luxury pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-50">
             <Link to="/" className="w-full flex items-center space-x-4 px-5 py-4 rounded-luxury text-gray-400 hover:text-charcoal transition-luxury group">
                <ShoppingBag02Icon size={18} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                  Storefront
                </span>
             </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

export default DashboardSidebar




