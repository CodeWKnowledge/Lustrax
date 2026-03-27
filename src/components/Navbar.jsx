import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { 
  ShoppingBag02Icon, 
  FavouriteIcon, 
  UserCircleIcon, 
  Menu01Icon, 
  Cancel01Icon,
  Search01Icon,
  PackageIcon,
  Settings02Icon,
  Logout01Icon,
  DashboardSquare01Icon
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
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }


  return (
    <header className="fixed top-0 w-full z-[100] bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 lg:h-16 flex justify-between items-center">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center space-x-6 lg:space-x-12 h-full">
          <Link to="/" className="flex items-center space-x-3 group h-full">
             <img src={LogoImg} alt="Lustrax Logo" className="h-8 lg:h-10 w-auto object-contain transition-luxury group-hover:scale-105" />
             <span className="text-xl lg:text-2xl font-brand text-charcoal">Lustrax</span>
          </Link>
          
          <nav className="flex items-center h-full pt-1">
             <Link to="/products" className="text-ui text-charcoal hover:text-gold transition-luxury">Shop</Link>
          </nav>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.form 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="absolute right-full mr-4 overflow-hidden"
                >
                  <input 
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH COLLECTIONS..."
                    className="w-full bg-soft-bg border-b border-gold/30 py-1 px-2 text-[10px] font-bold tracking-widest text-charcoal outline-none placeholder:text-gray-200"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-charcoal hover:text-gold transition-all"
            >
              <Search01Icon size={20} />
            </button>
          </div>
          
          <Link to="/dashboard/wishlist" className="relative text-charcoal hover:text-gold transition-all">

            <FavouriteIcon size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-inter">
                {wishlistCount}
              </span>
            )}
          </Link>
          
          <Link to="/cart" className="relative text-charcoal hover:text-gold transition-all">
            <ShoppingBag02Icon size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-inter">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="border-l border-gray-50 pl-4 sm:pl-6">
            {user ? (
              <ProfileDropdown user={user} profile={profile} onSignOut={signOut} />
            ) : (
              <Button 
                onClick={openAuthModal}
                variant="gold"
                className="text-[10px] uppercase font-bold tracking-widest px-6 py-2 rounded-luxury shadow-premium-sm"
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
