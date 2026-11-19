import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import LogoImg from '@/assets/Logo.png'
import { toast } from 'react-hot-toast'
import { ArrowRight01Icon } from 'hugeicons-react'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please provide a valid email address.')
      return
    }
    setSubscribed(true)
    toast.success('Welcome to the Lustrax Inner Circle.')
    setEmail('')
  }

  return (
    <footer className="bg-obsidian text-white border-t border-white/10 pt-20 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Top Tier: Brand Editorial & Private Invitation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10">
          
          <div className="lg:col-span-5 space-y-6">
            <Link to="/home" className="flex items-center space-x-3 group inline-block">
              <img 
                src={LogoImg} 
                alt="Lustrax Jewelries Emblem" 
                className="h-8 lg:h-9 w-auto object-contain brightness-200 transition-luxury group-hover:scale-105" 
              />
              <span className="text-xl lg:text-2xl font-brand text-white tracking-[0.3em]">
                LUSTRAX
              </span>
            </Link>
            <p className="text-body text-gray-400 max-w-md text-sm leading-relaxed">
              Modern jewelry crafted with high standards. Solid chains, rings, and accessories made to help you look your best and wear with confidence.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold">Abuja</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">Nigeria</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">Nationwide Delivery</span>
            </div>
          </div>

          {/* Quick Links Hierarchy */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gold uppercase tracking-[0.35em]">
                Explore
              </p>
              <div className="flex flex-col space-y-3">
                <Link to="/home" className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-white transition-luxury">
                  Home
                </Link>
                <Link to="/" className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-white transition-luxury">
                  Shop All
                </Link>
                <Link to="/cart" className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-white transition-luxury">
                  Shopping Bag
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gold uppercase tracking-[0.35em]">
                Customer Care
              </p>
              <div className="flex flex-col space-y-3">
                <Link to="/terms-and-conditions" className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-white transition-luxury">
                  Terms of Service
                </Link>
                <Link to="/refund-policy" className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-white transition-luxury">
                  Returns & Refunds
                </Link>
                <a 
                  href="https://wa.me/2348126839505" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-white transition-luxury"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter / Inner Circle Invitation */}
          <div className="lg:col-span-4 space-y-4">
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.35em]">
              Stay Updated
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sign up for our newsletter to hear about new arrivals, discounts, and exclusive restocks.
            </p>
            {subscribed ? (
              <div className="p-3 border border-gold/30 bg-gold/5 text-gold text-xs uppercase tracking-widest font-bold">
                ✓ You're signed up!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex border-b border-white/20 focus-within:border-gold transition-luxury">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL..." 
                    className="w-full bg-transparent py-2.5 text-xs text-white uppercase tracking-widest outline-none placeholder:text-gray-500 font-medium"
                    aria-label="Email address for private ledger"
                  />
                  <button 
                    type="submit" 
                    className="text-gold hover:text-white transition-luxury px-3 flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    <ArrowRight01Icon size={16} />
                  </button>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-500 block">
                  We respect your privacy. No spam, ever.
                </span>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Tier: Legal & Credit */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.25em]">
            © {new Date().getFullYear()} LUSTRAX JEWELRIES. HANDCRAFTED LUXURY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">
              Paystack Certified Encrypted Checkout
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer


