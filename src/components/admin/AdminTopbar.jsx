import { 
  Notification01Icon, 
  Search01Icon, 
  UserCircleIcon,
  Menu01Icon,
  CheckmarkCircle01Icon
} from 'hugeicons-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

const AdminTopbar = ({ title, onMenuClick }) => {
  const { profile } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-gray-50 sticky top-0 z-40 flex items-center justify-between px-4 lg:px-10">
      <div className="flex items-center space-x-4 lg:space-x-16">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-400 hover:text-gold transition-luxury lg:hidden"
        >
          <Menu01Icon size={20} />
        </button>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-charcoal truncate max-w-[150px] sm:max-w-none">{title || 'Overview'}</h2>
        
        <div className="hidden lg:flex items-center border-b border-transparent focus-within:border-gold transition-luxury group py-1">
          <Search01Icon size={16} className="text-gray-200 group-focus-within:text-gold transition-luxury" />
          <input 
            type="text" 
            placeholder="Search manifest..." 
            className="bg-transparent border-none outline-none ml-4 text-[10px] font-bold tracking-[0.2em] uppercase text-charcoal placeholder:text-gray-200 w-48"
          />
        </div>
      </div>

      <div className="flex items-center space-x-10">
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative text-gray-300 hover:text-gold transition-luxury ${showDropdown ? 'text-gold' : ''}`}
          >
            <Notification01Icon size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[8px] font-black flex items-center justify-center rounded-full animate-pulse border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* QUICK DROPDOWN */}
          {showDropdown && (
            <div className="absolute right-0 mt-6 w-80 bg-white border border-gray-100 shadow-premium rounded-luxury overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
               <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-soft-bg/20">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Recent Protocols</h3>
                  <Link 
                    to="/admin/notifications" 
                    onClick={() => setShowDropdown(false)}
                    className="text-[8px] font-bold uppercase tracking-widest text-gold hover:underline"
                  >
                    View All
                  </Link>
               </div>
               
               <div className="max-h-96 overflow-y-auto">
                 {notifications.length === 0 ? (
                   <div className="p-12 text-center">
                      <p className="text-[10px] text-gray-200 font-medium uppercase tracking-widest italic">No New Alerts</p>
                   </div>
                 ) : (
                   notifications.slice(0, 5).map(notif => (
                     <div 
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id)
                        setShowDropdown(false)
                      }}
                      className={`p-6 border-b border-gray-50 hover:bg-soft-bg/10 transition-luxury cursor-pointer group ${!notif.is_read ? 'bg-gold/5' : ''}`}
                    >
                        <div className="flex items-start gap-4">
                           <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-gray-100'}`}></div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-charcoal group-hover:text-gold transition-luxury">{notif.title}</p>
                              <p className="text-[9px] text-gray-400 line-clamp-1 opacity-80">{notif.message}</p>
                              <p className="text-[8px] text-gray-200 uppercase tracking-tighter">
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                              </p>
                           </div>
                        </div>
                     </div>
                   ))
                 )}
               </div>
               
               <div className="p-4 bg-gray-50/30 text-center">
                  <p className="text-[8px] text-gray-300 uppercase tracking-widest font-medium">Lustrax Security Protocol IX</p>
               </div>
            </div>
          )}

          {/* Click shadow to close */}
          {showDropdown && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
          )}
        </div>

        <div className="flex items-center space-x-3 lg:space-x-4 group cursor-pointer border-l border-gray-50 pl-4 lg:pl-10">

          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal leading-none mb-1">
               {profile?.first_name || 'Administrator'}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold opacity-60">Admin Access</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-soft-bg border border-gray-50 flex items-center justify-center group-hover:border-gold transition-luxury overflow-hidden">
            <UserCircleIcon size={20} className="text-gray-300 group-hover:text-gold transition-luxury" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminTopbar
