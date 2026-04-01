import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cancel01Icon, PlusSignIcon, ArrowDown01Icon } from 'hugeicons-react'

const TagInput = ({ label, placeholder, options = [], selectedValues = [], onChange, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const containerRef = useRef(null)

  // Filter out already selected values from suggestions
  const availableSuggestions = suggestions.filter(s => !selectedValues.includes(s))

  const handleAddValue = (val) => {
    const trimmed = val.trim()
    if (trimmed && !selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed])
    }
    setInputValue('')
    setIsDropdownOpen(false)
  }

  const handleRemoveValue = (val) => {
    onChange(selectedValues.filter(v => v !== val))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddValue(inputValue)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-3" ref={containerRef}>
      <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400 block px-1">{label}</label>
      
      <div className="space-y-4">
        {/* Input Area */}
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setIsDropdownOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-100 rounded-luxury p-4 pr-12 outline-none focus:border-gold transition-luxury text-[11px] font-bold uppercase tracking-widest text-charcoal shadow-sm"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {inputValue && (
              <button 
                type="button"
                onClick={() => handleAddValue(inputValue)}
                className="p-2 bg-gold/10 text-gold rounded-full hover:bg-gold hover:text-white transition-luxury shadow-sm"
                title="Add custom value"
              >
                <PlusSignIcon size={14} />
              </button>
            )}
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-gray-300 hover:text-gold transition-luxury"
            >
              <ArrowDown01Icon size={14} className={isDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </div>

          <AnimatePresence>
            {isDropdownOpen && availableSuggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-luxury shadow-premium z-50 max-h-48 overflow-y-auto overflow-x-hidden py-2"
              >
                {availableSuggestions
                  .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
                  .map(suggestion => (
                    <li 
                      key={suggestion}
                      onClick={() => handleAddValue(suggestion)}
                      className="px-4 py-2 hover:bg-soft-bg cursor-pointer text-[10px] font-bold uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-luxury border-l-2 border-transparent hover:border-gold"
                    >
                      {suggestion}
                    </li>
                  ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Values Area */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selectedValues.map(val => (
              <motion.span
                key={val}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center space-x-2 bg-charcoal text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-luxury border border-charcoal hover:bg-transparent hover:text-charcoal transition-luxury group"
              >
                <span>{val}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveValue(val)}
                  className="text-white/40 group-hover:text-red-400 transition-luxury"
                >
                  <Cancel01Icon size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default TagInput
