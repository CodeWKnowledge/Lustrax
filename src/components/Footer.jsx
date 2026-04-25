import React from 'react'
import { Link } from 'react-router-dom'
import LogoImg from '../assets/Logo.png'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-50 pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center space-y-10 text-center">
          
          <Link to="/" className="flex items-center space-x-3 group">
             <img src={LogoImg} alt="Lustrax Logo" className="h-8 lg:h-10 w-auto object-contain transition-luxury grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0" />
             <span className="text-xl lg:text-2xl font-brand text-charcoal tracking-widest">LUSTRAX</span>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.3em]">Acquisition</p>
              <Link to="/" className="block text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-charcoal transition-luxury">
                Shop Collection
              </Link>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.3em]">Legal protocol</p>
              <div className="flex flex-col space-y-3">
                <Link to="/terms-and-conditions" className="block text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-charcoal transition-luxury">
                  Terms & Conditions
                </Link>
                <Link to="/refund-policy" className="block text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-charcoal transition-luxury">
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="w-12 h-[1px] bg-gray-100"></div>

          <p className="text-[9px] text-gray-300 uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} LUSTRAX JEWELRIES. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


