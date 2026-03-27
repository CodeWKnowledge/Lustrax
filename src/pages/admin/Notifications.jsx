import React from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { 
  Notification01Icon, 
  CheckmarkCircle01Icon,
  Clock01Icon,
  InformationCircleIcon,
  ShoppingBag01Icon,
  Delete02Icon
} from 'hugeicons-react'
import { formatDistanceToNow } from 'date-fns'
import Button from '../../components/ui/Button'

const AdminNotifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications()

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag01Icon size={18} className="text-gold" />
      case 'inventory': return <InformationCircleIcon size={18} className="text-orange-500" />
      default: return <InformationCircleIcon size={18} className="text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-h2 !text-2xl text-charcoal mb-2">Security Manifest</h1>
          <p className="text-ui text-gray-400">System-wide alerts and acquisition protocols</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.is_read).length === 0}
            className="text-[10px] h-10 px-6"
          >
            <CheckmarkCircle01Icon size={14} className="mr-2" />
            Mark All as Read
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-luxury border border-gray-50 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-soft-bg rounded-full flex items-center justify-center mx-auto text-gray-200">
              <Notification01Icon size={24} />
            </div>
            <p className="text-subheading text-gray-300 italic">No protocols found in the manifest</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 lg:p-10 flex items-start gap-6 hover:bg-soft-bg/5 transition-luxury ${!notif.is_read ? 'bg-gold/5' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!notif.is_read ? 'bg-gold/10' : 'bg-gray-50'}`}>
                  {getTypeIcon(notif.type)}
                </div>
                
                <div className="flex-grow space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-[11px] font-bold uppercase tracking-wider ${!notif.is_read ? 'text-charcoal' : 'text-gray-400'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-200 flex items-center">
                      <Clock01Icon size={12} className="mr-2" />
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-body text-gray-500 !text-xs leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                  
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline mt-4 block"
                    >
                      Acknowledge Protocol
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-10 border-t border-gray-50 flex justify-between items-center opacity-40">
        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Lustrax Internal Security</p>
        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Protocol Version 4.2.0</p>
      </div>
    </div>
  )
}

export default AdminNotifications
