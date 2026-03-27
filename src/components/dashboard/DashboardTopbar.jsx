import { 
  Notification01Icon, 
  Search01Icon,
  Menu01Icon
} from 'hugeicons-react'
import { useAuth } from '../../context/AuthContext'
import ProfileDropdown from '../ui/ProfileDropdown'

const DashboardTopbar = ({ title, onMenuClick }) => {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-gray-50 sticky top-0 z-40 flex items-center justify-between px-4 lg:px-10">
      <div className="flex items-center space-x-4 lg:space-x-12">
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
            placeholder="Search your curation..." 
            className="bg-transparent border-none outline-none ml-4 text-[10px] font-bold tracking-[0.2em] uppercase text-charcoal placeholder:text-gray-200 w-48"
          />
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <button className="relative text-gray-300 hover:text-gold transition-luxury p-2">
          <Notification01Icon size={20} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-gold rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center border-l border-gray-50 pl-4 lg:pl-10 h-8">
           <ProfileDropdown user={user} profile={profile} onSignOut={signOut} />
        </div>
      </div>
    </header>
  )
}

export default DashboardTopbar
