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
          
          <div className="flex space-x-8">
            <Link to="/" className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-charcoal transition-luxury">
              Shop Collection
            </Link>
          </div>

          <div className="w-12 h-[1px] bg-gray-100"></div>

          <p className="text-[9px] text-gray-300 uppercase tracking-widest font-medium">
            Â© {new Date().getFullYear()} LUSTRAX JEWELRIES. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


