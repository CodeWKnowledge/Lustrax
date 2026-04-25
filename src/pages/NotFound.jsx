import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { Link } from 'react-router-dom'



const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background detail */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-10 relative z-10 max-w-lg"
      >
        {/* 404 Number */}
        <div className="space-y-2">
          <p className="text-[120px] lg:text-[180px] font-bold font-playfair text-charcoal/5 leading-none select-none">
            404
          </p>
          <div className="-mt-8 space-y-4">
            <h1 className="text-2xl lg:text-3xl font-playfair font-bold text-charcoal tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm text-gray-400 font-inter leading-relaxed max-w-xs mx-auto">
              The page you are looking for may have moved, been renamed, or no longer exists.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center space-x-4">
          <span className="h-px w-12 bg-gold/30" />
          <span className="text-gold text-xs font-inter tracking-[0.3em] uppercase">Lustrax</span>
          <span className="h-px w-12 bg-gold/30" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center h-13 px-10 bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-charcoal/80 transition-all duration-300"
          >
            Return to Boutique
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center h-13 px-10 border border-gray-100 text-charcoal text-[10px] font-bold uppercase tracking-[0.25em] hover:border-gold hover:text-gold transition-all duration-300"
          >
            Browse Collection
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound




