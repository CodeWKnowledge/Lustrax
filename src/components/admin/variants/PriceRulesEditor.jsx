import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusSignIcon, Delete02Icon } from 'hugeicons-react'

const PriceRulesEditor = ({ options, priceRules, setPriceRules }) => {
  const handleAddRule = (variantName, value) => {
    setPriceRules([...priceRules, { variant_name: variantName, value, price_adjustment: 0 }])
  }

  const handleUpdateRule = (index, field, value) => {
    const newRules = [...priceRules]
    newRules[index][field] = value
    setPriceRules(newRules)
  }

  const handleRemoveRule = (index) => {
    setPriceRules(priceRules.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 pt-10 border-t border-gray-50">
      <div>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.4em] text-charcoal">Price Modifiers</h3>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Define global price adjustments for specific values</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceRules.map((rule, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-white border border-gray-100 rounded-luxury flex items-center justify-between group shadow-sm hover:shadow-md transition-all"
          >
            <div className="space-y-1">
              <span className="text-[8px] uppercase font-bold tracking-widest text-gray-400">{rule.variant_name}</span>
              <p className="text-[10px] font-bold text-charcoal uppercase">{rule.value}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gold">+</span>
                <input 
                  type="number"
                  value={rule.price_adjustment}
                  onChange={(e) => handleUpdateRule(index, 'price_adjustment', e.target.value)}
                  className="w-20 pl-5 pr-2 py-1.5 border-b border-gray-100 outline-none focus:border-gold text-[11px] font-bold text-gold bg-transparent"
                  placeholder="0"
                />
              </div>
              <button 
                type="button"
                onClick={() => handleRemoveRule(index)}
                className="text-gray-300 hover:text-red-500 transition-luxury"
              >
                <Delete02Icon size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Rule Selector */}
      <div className="flex flex-wrap gap-2 pt-2">
        {options.map(option => (
          <div key={option.name} className="flex flex-wrap gap-2 items-center">
            {option.values.map(val => {
              const hasRule = priceRules.some(r => r.variant_name === option.name && r.value === val)
              if (hasRule) return null
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddRule(option.name, val)}
                  className="px-3 py-1.5 border border-gray-100 rounded-full text-[8px] font-bold uppercase tracking-widest text-gray-400 hover:border-gold hover:text-gold transition-luxury flex items-center space-x-1"
                >
                  <PlusSignIcon size={10} />
                  <span>{option.name}: {val}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PriceRulesEditor
