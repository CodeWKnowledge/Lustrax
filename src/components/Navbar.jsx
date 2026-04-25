import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { 
  ShoppingBag02Icon, 
  FavouriteIcon, 
  Search01Icon,
  Menu01Icon
} from 'hugeicons-react'
import Button from './ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileDropdown from './ui/ProfileDropdown'
import LogoImg from '../assets/Logo.png'

const Navbar = () => {
  const { user, profile, signOut, openAuthModal } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="fixed top-0 w-full z-[100] bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 lg:h-16 flex items-center relative">
        
        {/* Left: Shop Navigation */}
        <div className="flex-1 flex items-center justify-start">
           <nav className="flex items-center h-full pt-1">
             <Link to="/" className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-charcoal hover:text-gold transition-luxury">Shop</Link>
           </nav>
        </div>

        {/* Center: Logo & Brand Name */}
        <div className="absolute inset-x-0 flex items-center justify-center h-full pointer-events-none mr-10">
          <Link to="/home" className="flex items-center space-x-1.5 sm:space-x-3 group h-full pointer-events-auto">
             <img src={LogoImg} alt="Lustrax Logo" className="h-6 sm:h-8 lg:h-10 w-auto object-contain transition-luxury group-hover:scale-105" />
             <span className="text-lg sm:text-xl lg:text-2xl font-brand text-charcoal">Lustrax</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex flex-nowrap items-center justify-end space-x-1.5 xs:space-x-2 sm:space-x-4 lg:space-x-6">
          <div className="relative flex items-center hidden sm:flex">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.form 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="absolute right-full mr-4 overflow-hidden"
                  role="search"
                >
                  <input 
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH..."
                    aria-label="Search products"
                    className="w-full bg-soft-bg border-b border-gold/30 py-1 px-2 text-[9px] font-bold tracking-widest text-charcoal outline-none placeholder:text-gray-400"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-charcoal hover:text-gold transition-all"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <Search01Icon size={18} className="sm:w-[20px] sm:h-[20px]" />
            </button>
          </div>
          
          {user && (
            <>
              <Link 
                to="/dashboard/wishlist" 
                className="relative text-charcoal hover:text-gold transition-all"
                aria-label={`View Wishlist (${wishlistCount} items)`}
              >
                <FavouriteIcon size={18} className="sm:w-[20px] sm:h-[20px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-inter">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              <Link 
                to="/cart" 
                className="relative text-charcoal hover:text-gold transition-all"
                aria-label={`View Cart (${cartCount} items)`}
              >
                <ShoppingBag02Icon size={18} className="sm:w-[20px] sm:h-[20px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-inter">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <div className="border-l border-gray-100 pl-2 sm:pl-4 lg:pl-6 flex items-center">
            {user ? (
              <ProfileDropdown user={user} profile={profile} onSignOut={signOut} />
            ) : (
              <Button 
                onClick={() => openAuthModal('select')}
                variant="gold"
                className="!text-[8px] sm:!text-[9px] lg:!text-[10px] uppercase font-bold tracking-wider !px-3 !py-1 sm:!px-4 lg:!px-6 sm:!py-2 rounded-sm sm:rounded-luxury shadow-premium-sm whitespace-nowrap flex-shrink-0"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}

export default Navbar
