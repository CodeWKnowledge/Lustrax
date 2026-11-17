import { motion } from 'framer-motion'
import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient gold diffusion */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/[0.04] blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-12 relative z-10 max-w-md"
      >
        {/* Ghost numerals */}
        <div className="relative select-none leading-none">
          <p className="text-[160px] lg:text-[220px] font-display text-charcoal/[0.04] leading-none tracking-tighter">
            404
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <span className="text-subheading text-gold tracking-[0.5em]">LUST RAX</span>
            <h1 className="text-h2 text-charcoal text-xl lg:text-2xl tracking-tight uppercase">
              Page Not Found
            </h1>
          </div>
        </div>

        {/* Gold hairline */}
        <div className="flex items-center justify-center space-x-4">
          <span className="h-px w-10 bg-gold/40" />
          <span className="text-[8px] text-gold/60 tracking-[0.6em] uppercase font-normal">
            Lost in Transit
          </span>
          <span className="h-px w-10 bg-gold/40" />
        </div>

        {/* Body */}
        <p className="text-body text-gray-400 !text-sm leading-relaxed max-w-xs mx-auto font-light">
          The piece you are seeking may have been relocated, renamed, or retired from the collection.
        </p>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-10 bg-obsidian text-white text-[9px] font-normal uppercase tracking-[0.3em] hover:bg-charcoal-light transition-luxury"
          >
            Return to Boutique
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-10 border border-neutral-border text-charcoal text-[9px] font-normal uppercase tracking-[0.3em] hover:border-gold hover:text-gold transition-luxury"
          >
            Browse Collection
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
