import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  DashboardSquare03Icon, 
  ShoppingBag02Icon, 
  Package01Icon, 
  UserGroupIcon, 
  Payment02Icon, 
  Analytics01Icon, 
  FavouriteIcon, 
  Settings02Icon,
  Logout01Icon,
  Menu01Icon,
  Notification01Icon,
  ConversationIcon
} from 'hugeicons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../context/NotificationContext'

const AdminSidebar = ({ isCollapsed, isSidebarOpen, onClose, toggleCollapse }) => {
  const location = useLocation()
  const { unreadCount } = useNotifications()

  const menuItems = [
    { name: 'Overview', icon: <DashboardSquare03Icon size={18} />, path: '/admin' },
    { name: 'Notifications', icon: <Notification01Icon size={18} />, path: '/admin/notifications', badge: unreadCount },
    { name: 'Orders', icon: <ShoppingBag02Icon size={18} />, path: '/admin/orders' },
    { name: 'Products', icon: <Package01Icon size={18} />, path: '/admin/products' },
    { name: 'Customers', icon: <UserGroupIcon size={18} />, path: '/admin/customers' },
    { name: 'Wishlist', icon: <FavouriteIcon size={18} />, path: '/admin/wishlist' },
    { name: 'Payments', icon: <Payment02Icon size={18} />, path: '/admin/payments' },
    { name: 'Transactions', icon: <Analytics01Icon size={18} />, path: '/admin/transactions' },
    { name: 'Settings', icon: <Settings02Icon size={18} />, path: '/admin/settings' },
  ]


  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:sticky left-0 top-0 h-screen bg-[#0A0A0A] border-r border-white/5 transition-luxury z-[70] 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72 flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`h-24 flex items-center transition-all overflow-hidden ${isCollapsed ? 'lg:justify-center lg:flex-col lg:px-0 lg:pt-4 lg:gap-2' : 'justify-between px-8'}`}>
            <Link to="/" className={`flex flex-col items-center justify-center ${isCollapsed ? '' : 'items-start'}`}>
              <span className={`text-xl font-serif text-white uppercase tracking-[0.4em] transition-all ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>Lustrax</span>
              <span className={`text-[9px] text-gold font-bold tracking-[0.4em] uppercase transition-all ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>Admin</span>
              {isCollapsed && <span className="text-xl font-serif text-gold hidden lg:block">L</span>}
            </Link>
            <button 
              onClick={toggleCollapse}
              className={`text-gray-400 hover:text-white transition-luxury hidden lg:block ${isCollapsed ? 'm-0' : ''}`}
            >
              <Menu01Icon size={20} />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-luxury lg:hidden"
            >
              <Menu01Icon size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-8 space-y-1.5 overflow-y-auto no-scrollbar ${isCollapsed ? 'lg:px-3 px-4' : 'px-4'}`}>
            {menuItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center transition-luxury relative group rounded-luxury 
                    ${isCollapsed ? 'lg:justify-center lg:px-0 lg:py-4 px-5 py-3.5 space-x-4 lg:space-x-0' : 'space-x-4 px-5 py-3.5'}
                    ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}
                  `}
                >
                  {active && (
                    <div className="absolute left-0 w-1 h-4 bg-gold rounded-full" />
                  )}
                  <div className={`${active ? 'text-gold' : 'group-hover:text-gold transition-luxury'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-between flex-grow ${isCollapsed ? 'lg:opacity-0 lg:hidden lg:w-0' : 'opacity-100'}`}>
                    <span>{item.name}</span>
                    {item.badge > 0 && !isCollapsed && (
                      <span className="bg-gold text-white text-[8px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {isCollapsed && item.badge > 0 && (
                     <div className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border border-black animate-pulse" />
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#0A0A0A] border border-white/5 text-white text-[8px] font-bold uppercase tracking-widest rounded-luxury shadow-premium opacity-0 lg:group-hover:opacity-100 transition-luxury pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-white/10 transition-all ${isCollapsed ? 'lg:p-4 p-6' : 'p-6'}`}>
             <button className={`w-full flex items-center rounded-luxury text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-luxury group ${isCollapsed ? 'lg:justify-center lg:px-0 lg:py-4 px-5 py-4 space-x-4 lg:space-x-0' : 'space-x-4 px-5 py-4'}`}>
                <Logout01Icon size={20} />
                <span className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                  Logout
                </span>
             </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
