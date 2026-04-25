import { 
  Notification01Icon, 
  Search01Icon, 
  UserCircleIcon,
  Menu01Icon,
  CheckmarkCircle01Icon,
  ShoppingBag01Icon,
  TruckDeliveryIcon,
  PackageIcon
} from 'hugeicons-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useDebounce } from '../../hooks/useDebounce'
import { supabase } from '../../lib/supabase'

const isValidUUID = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)

const AdminTopbar = ({ title, onMenuClick }) => {
  const { profile } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [searchResults, setSearchResults] = useState({ products: [], orders: [] })
  const [isSearching, setIsSearching] = useState(false)
  
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 2) {
      setSearchResults({ products: [], orders: [] })
      setIsSearching(false)
      setShowSearchDropdown(false)
      return
    }

    const performSearch = async () => {
      setIsSearching(true)
      setShowSearchDropdown(true)
      
      try {
        const productUUIDFilter = isValidUUID(debouncedSearchTerm) ? `,id.eq.${debouncedSearchTerm}` : ''
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, image_url, category')
          .or(`name.ilike.%${debouncedSearchTerm}%,category.ilike.%${debouncedSearchTerm}%${productUUIDFilter}`)
          .limit(3)

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .or(`full_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%`)
          .limit(20)
        
        const profileIds = profiles?.map(p => p.id) || []
        const orderUUIDFilter = isValidUUID(debouncedSearchTerm) ? `,id.eq.${debouncedSearchTerm}` : ''
        const orderOrFilter = `payment_reference.ilike.%${debouncedSearchTerm}%${orderUUIDFilter}`
        
        let orderQuery = supabase
          .from('orders')
          .select('id, status, total_amount, payment_reference, profiles(full_name)')
          
        if (profileIds.length > 0) {
          orderQuery = orderQuery.or(`user_id.in.(${profileIds.join(',')}),${orderOrFilter}`)
        } else {
          orderQuery = orderQuery.or(orderOrFilter)
        }
        
        const { data: ordersData } = await orderQuery.limit(3)

        setSearchResults({
          products: productsData || [],
          orders: ordersData || []
        })
      } catch (err) {
        console.error('Search error', err)
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm])

  const navigateToSearch = (e) => {
    if (e.key === 'Enter' && searchTerm) {
       setShowSearchDropdown(false)
       navigate(`/admin/products?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-gray-50 sticky top-0 z-40 flex items-center justify-between px-4 lg:px-10">
      <div className="flex items-center space-x-4 lg:space-x-16 w-full max-w-2xl">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-400 hover:text-gold transition-luxury lg:hidden"
        >
          <Menu01Icon size={20} />
        </button>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-charcoal truncate max-w-[120px] sm:max-w-[150px] shrink-0">{title || 'Overview'}</h2>
        
        <div ref={searchRef} className="hidden lg:block relative w-full max-w-md">
          <div className={`flex items-center border-b transition-luxury group py-1 ${showSearchDropdown ? 'border-gold' : 'border-transparent focus-within:border-gold'}`}>
            <Search01Icon size={18} className={`transition-luxury ${showSearchDropdown ? 'text-gold' : 'text-gray-400 group-focus-within:text-gold'}`} />
            <input 
              type="text" 
              placeholder="Search manifest..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if (searchTerm.length >= 2) setShowSearchDropdown(true) }}
              onKeyDown={navigateToSearch}
              className="bg-transparent border-none outline-none ml-4 text-[11px] font-bold tracking-[0.2em] uppercase text-charcoal placeholder:text-gray-400 w-full"
            />
          </div>

          {/* Global Search Autocomplete Dropdown */}
          {showSearchDropdown && (
             <div className="absolute top-full left-0 mt-4 w-96 bg-white border border-gray-100 shadow-premium rounded-luxury overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                {isSearching ? (
                  <div className="p-6 text-center">
                    <div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-[9px] text-gold uppercase tracking-[0.3em] font-bold">Querying...</span>
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto">
                    {/* Products Results */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-soft-bg/30 border-b border-gray-50 flex items-center space-x-2">
                          <ShoppingBag01Icon size={12} className="text-gray-400" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal">Products</span>
                        </div>
                        {searchResults.products.map(product => (
                          <button 
                            key={product.id}
                            onClick={() => { setShowSearchDropdown(false); navigate(`/admin/products/edit/${product.id}`) }}
                            className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gold/5 transition-luxury flex items-center space-x-3 group"
                          >
                            <div className="w-8 h-8 rounded-md overflow-hidden bg-soft-bg shrink-0">
                               {product.image_url ? (
                                 <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <PackageIcon size={14} className="m-auto mt-1.5 text-gray-300" />
                               )}
                            </div>
                            <div className="flex flex-col truncate">
                               <span className="text-[10px] font-bold text-charcoal truncate group-hover:text-gold transition-luxury">{product.name}</span>
                               <span className="text-[8px] text-gray-400 uppercase tracking-widest truncate">{product.category}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Orders Results */}
                    {searchResults.orders.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-soft-bg/30 border-b border-gray-50 flex items-center space-x-2">
                          <TruckDeliveryIcon size={12} className="text-gray-400" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal">Orders</span>
                        </div>
                        {searchResults.orders.map(order => (
                          <button 
                            key={order.id}
                            onClick={() => { setShowSearchDropdown(false); navigate(`/admin/orders?search=${order.id}`) }}
                            className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gold/5 transition-luxury flex flex-col space-y-1 group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-charcoal truncate group-hover:text-gold transition-luxury">
                                {order.profiles?.full_name || 'Anonymous User'}
                              </span>
                              <span className="text-[8px] uppercase tracking-widest text-gray-400 font-bold px-1.5 py-0.5 border border-gray-100 rounded-sm">
                                {order.status}
                              </span>
                            </div>
                            <span className="text-[8px] text-gray-400 uppercase tracking-widest truncate">
                              REF: {order.payment_reference || `#${order.id.split('-')[0]}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.products.length === 0 && searchResults.orders.length === 0 && (
                      <div className="p-6 text-center">
                        <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em]">No manifestations found</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Advanced Search Footer */}
                <div className="p-3 bg-charcoal text-center group cursor-pointer" onClick={() => navigateToSearch({key: 'Enter'})}>
                  <span className="text-[9px] text-gold uppercase tracking-[0.3em] font-bold group-hover:text-white transition-luxury">
                    View All Results &rarr;
                  </span>
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-10 shrink-0">
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
                              <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal group-hover:text-gold transition-luxury">{notif.title}</p>
                              <p className="text-[10px] text-gray-500 line-clamp-1">{notif.message}</p>
                              <p className="text-[9px] text-gray-400 uppercase tracking-tighter">
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-charcoal leading-none mb-1">
               {profile?.full_name || 'Administrator'}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Admin Access</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-soft-bg border border-gray-50 flex items-center justify-center group-hover:border-gold transition-luxury overflow-hidden shrink-0">
            <UserCircleIcon size={20} className="text-gray-300 group-hover:text-gold transition-luxury" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminTopbar



