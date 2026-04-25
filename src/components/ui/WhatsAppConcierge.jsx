import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

import { WhatsappIcon } from 'hugeicons-react'


const WhatsAppConcierge = () => {
  // Replace with the business's actual WhatsApp number
  const WHATSAPP_NUMBER = '2348126839505' 
  const MESSAGE = encodeURIComponent("Hello Lustrax, I'm interested in a piece from your collection.")
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`

  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] flex items-center justify-center w-14 h-14 bg-charcoal text-gold rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.3)] border border-gold/20 backdrop-blur-sm group"
      title="Concierge Support"
    >
       <div className="absolute inset-0 bg-gold/5 rounded-full animate-ping group-hover:bg-gold/10 transition-luxury" />
       <WhatsappIcon size={24} className="relative z-10 transition-luxury group-hover:rotate-12" />
       
       <span className="absolute right-full mr-4 bg-charcoal text-gold text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-luxury opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap border border-gold/10 pointer-events-none shadow-xl">
          Concierge Access
       </span>
    </motion.a>
  )
}

export default WhatsAppConcierge




