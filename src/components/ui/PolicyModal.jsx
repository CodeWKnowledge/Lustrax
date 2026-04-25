import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cancel01Icon } from 'hugeicons-react';

const PolicyModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-10">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 lg:p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-20">
            <h2 className="text-xl lg:text-2xl font-playfair font-bold text-charcoal uppercase tracking-tighter">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-charcoal"
            >
              <Cancel01Icon size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto p-6 lg:p-12 prose prose-sm max-w-none scrollbar-thin scrollbar-thumb-gray-200">
            {children}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all"
            >
              Understood
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PolicyModal;
