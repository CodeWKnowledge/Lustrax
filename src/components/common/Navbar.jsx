import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { 
  ShoppingBag02Icon, 
  FavouriteIcon, 
  Search01Icon,
  Cancel01Icon,
  Menu01Icon
} from 'hugeicons-react'
import Button from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileDropdown from '@/components/ui/ProfileDropdown'
import LogoImg from '@/assets/Logo.png'

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
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
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
    <>
      <header 
        className={`fixed top-0 w-full z-[100] transition-all duration-300 bg-white border-b border-neutral-border text-charcoal ${
          isScrolled 
            ? 'py-3 shadow-premium-sm' 
            : 'py-4 lg:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between relative">
          
          {/* Left: Editorial Navigation Links */}
          <div className="flex-1 flex items-center space-x-6 sm:space-x-8">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-charcoal hover:text-gold transition-luxury p-1"
              aria-label="Open navigation menu"
            >
              <Menu01Icon size={20} />
            </button>
            <nav className="hidden lg:flex items-center space-x-8">
            {/* Search Interaction */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-charcoal hover:text-gold transition-luxury p-1"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                <Search01Icon size={19} />
              </button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSearch}
                    className="ml-3 overflow-hidden"
                    role="search"
                  >
                    <input 
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="SEARCH PRODUCTS..."
                      aria-label="Search products"
                      className="w-full bg-stone border-b border-gold/40 py-1.5 px-3 text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal outline-none placeholder:text-gray-400"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            {user && (
              <Link 
                to="/dashboard/wishlist" 
                className="relative text-charcoal hover:text-gold transition-luxury p-1"
                aria-label={`View Wishlist (${wishlistCount} items)`}
              >
                <FavouriteIcon size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-inter shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            </nav>
          </div>

          {/* Center: Brand Identity */}
          <div className="flex items-center justify-center">
            <Link to="/home" className="flex items-center space-x-2.5 sm:space-x-3 group">
              <img 
                src={LogoImg} 
                alt="Lustrax Jewelries Insignia" 
                className="h-7 sm:h-8 lg:h-9 w-auto object-contain transition-luxury group-hover:scale-105" 
              />
              <span className="text-xl sm:text-2xl font-brand text-charcoal tracking-[0.28em]">
                LUSTRAX
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Wishlist, Bag, Profile) */}
          <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-5 lg:space-x-6">
            
            {/* Shopping Bag */}
            <Link 
              to="/cart" 
              className="relative text-charcoal hover:text-gold transition-luxury p-1"
              aria-label={`View Shopping Bag (${cartCount} items)`}
            >
              <ShoppingBag02Icon size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-charcoal text-gold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold font-inter shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile / Authentication Gate */}
            <div className="border-l border-neutral-border pl-3 sm:pl-5 flex items-center">
              {user ? (
                <ProfileDropdown user={user} profile={profile} onSignOut={signOut} />
              ) : (
                <Button 
                  onClick={() => openAuthModal('select')}
                  variant="gold"
                  className="!text-[9px] uppercase font-bold tracking-[0.2em] !px-4 !py-2 rounded-none hover:bg-gold-dark transition-luxury shadow-premium-sm"
                >
                  Sign In
                </Button>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Mobile Editorial Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-obsidian text-white z-[120] p-8 flex flex-col justify-between"
            >
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center space-x-2">
                    <img src={LogoImg} alt="Lustrax" className="h-6 w-auto brightness-200" />
                    <span className="text-lg font-brand text-white tracking-[0.3em]">LUSTRAX</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-white p-1"
                    aria-label="Close menu"
                  >
                    <Cancel01Icon size={20} />
                  </button>
                </div>

                <nav className="flex flex-col space-y-6">
                  <Link 
                    to="/home" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg uppercase font-bold tracking-[0.25em] text-white hover:text-gold transition-luxury"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg uppercase font-bold tracking-[0.25em] text-white hover:text-gold transition-luxury"
                  >
                    Shop All
                  </Link>
                  <Link 
                    to="/cart" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm uppercase font-bold tracking-[0.25em] text-gray-400 hover:text-gold transition-luxury flex items-center justify-between"
                  >
                    <span>Shopping Bag</span>
                    <span className="text-gold font-bold">({cartCount})</span>
                  </Link>
                  {user && (
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm uppercase font-bold tracking-[0.25em] text-gray-400 hover:text-gold transition-luxury"
                    >
                      My Account
                    </Link>
                  )}
                </nav>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold">Lustrax Jewelries</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Quality modern jewelry made to help you look your best every day.
                </p>
                {!user && (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); openAuthModal('select') }}
                    className="w-full py-3 border border-gold text-gold text-[10px] uppercase font-bold tracking-[0.25em] hover:bg-gold hover:text-black transition-luxury"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
