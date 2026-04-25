import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

import { Cancel01Icon } from 'hugeicons-react'


const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`bg-white rounded-luxury shadow-2xl overflow-hidden relative z-10 w-full ${maxWidth} border border-gray-100 flex flex-col max-h-[90vh]`}
          >
             {/* Header */}
             <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-charcoal">{title}</h2>
                <button 
                  onClick={onClose}
                  className="text-gray-300 hover:text-gold transition-luxury p-2"
                >
                   <Cancel01Icon size={20} />
                </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                {children}
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal




