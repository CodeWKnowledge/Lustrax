import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

import { PlusSignIcon, Delete02Icon, Settings02Icon } from 'hugeicons-react'
import TagInput from './TagInput'
import { CATEGORY_VARIANTS } from '../../../constants/variantConfig'


const VariantOptionManager = ({ category, options, setOptions, onGenerate }) => {
  const suggestedVariants = CATEGORY_VARIANTS[category] || []

  const handleAddOption = (suggested = null) => {
    const newName = suggested ? suggested.label : `New Variant ${options.length + 1}`
    const newValues = suggested ? suggested.options : []
    
    // Prevent duplicate columns
    if (options.some(o => o.name.toLowerCase() === newName.toLowerCase())) return
    
    setOptions([...options, { name: newName, values: newValues }])
  }

  const handleUpdateOption = (index, field, value) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.4em] text-charcoal">Variant Configuration</h3>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Define attributes and values for this product</p>
        </div>
        
        <button
          type="button"
          onClick={() => handleAddOption()}
          className="flex items-center space-x-2 text-[9px] uppercase font-bold tracking-widest text-charcoal hover:text-gold transition-luxury border border-gray-100 px-5 py-2.5 rounded-luxury"
        >
          <PlusSignIcon size={14} />
          <span>Add Custom Attribute</span>
        </button>
      </div>

      {/* Suggested Variants Chips */}
      {suggestedVariants.length > 0 && (
        <div className="space-y-3">
          <span className="text-[8px] uppercase font-bold tracking-[0.3em] text-gray-300 block">Suggested for {category}</span>
          <div className="flex flex-wrap gap-2">
            {suggestedVariants.map(s => {
              const isAdded = options.some(o => o.name.toLowerCase() === s.label.toLowerCase())
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={isAdded}
                  onClick={() => handleAddOption(s)}
                  className={`px-4 py-2 border rounded-full text-[9px] font-bold uppercase tracking-widest transition-luxury ${
                    isAdded ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-500 border-gray-200 hover:border-gold hover:text-gold'
                  }`}
                >
                  + {s.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-soft-bg rounded-luxury border border-neutral-border space-y-6 relative group"
            >
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-luxury"
              >
                <Delete02Icon size={16} />
              </button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-bold tracking-widest text-gray-400 px-1">Attribute Name</label>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => handleUpdateOption(index, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-100 py-2 outline-none focus:border-gold transition-luxury font-bold text-[11px] uppercase tracking-widest text-charcoal"
                    placeholder="e.g. Color"
                  />
                </div>

                <TagInput
                  label="Values"
                  placeholder="Type and press Enter..."
                  selectedValues={option.values}
                  onChange={(newVals) => handleUpdateOption(index, 'values', newVals)}
                  suggestions={suggestedVariants.find(s => s.label.toLowerCase() === option.name.toLowerCase())?.options || []}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {options.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onGenerate}
            className="flex items-center space-x-3 bg-charcoal text-white px-10 py-4 rounded-luxury text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-luxury shadow-premium group"
          >
            <Settings02Icon size={16} className="group-hover:rotate-180 transition-luxury duration-700" />
            <span>Generate Combinations</span>
          </button>
        </div>
      )}

      {options.length === 0 && (
        <div className="py-16 border border-dashed border-gray-200 rounded-luxury flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
            <Settings02Icon size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-charcoal opacity-40">No Variants Defined</p>
            <p className="text-[9px] text-gray-300 uppercase tracking-widest">Start by adding attributes like Size, Color, or Material</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VariantOptionManager




