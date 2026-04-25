import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

import { Delete02Icon, InformationCircleIcon, CheckmarkCircle01Icon, Alert01Icon } from 'hugeicons-react'
import { calculateAutoPrice } from '../../../utils/variantEditor'


const VariantTable = ({ variants, setVariants, basePrice, priceRules }) => {
  const attributeNames = variants.length > 0 ? Object.keys(variants[0].attributes) : []
  const [bulkPrice, setBulkPrice] = React.useState('')
  const [bulkStock, setBulkStock] = React.useState('')

  const handleBulkApply = (field) => {
    const value = field === 'price' ? bulkPrice : bulkStock
    // If field is price and value is empty, it means we are clearing it for "Request Only"
    if (field === 'stock_quantity' && value === '') return

    const newVariants = variants.map(v => ({
      ...v,
      [field]: value === '' ? null : value,
      is_overridden: field === 'price' ? (value !== '') : v.is_overridden
    }))
    setVariants(newVariants)
    if (field === 'price') setBulkPrice('')
    else setBulkStock('')
  }

  const handleResetOverrides = () => {
    const newVariants = variants.map(v => ({
      ...v,
      is_overridden: false,
      price: calculateAutoPrice(basePrice, v.attributes, priceRules)
    }))
    setVariants(newVariants)
  }

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants]
    newVariants[index][field] = value === '' ? null : value
    
    if (field === 'price') {
      newVariants[index].is_overridden = value !== ''
    }
    
    setVariants(newVariants)
  }

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 pt-10 border-t border-gray-50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.4em] text-charcoal">Generated Combinations</h3>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Review and customize individual variants</p>
        </div>
        
        {/* Bulk Toolset */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-soft-bg rounded-luxury border border-gray-100">
           <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mr-2">Bulk Actions:</span>
           
           <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded border border-gray-50 focus-within:border-gold transition-luxury">
              <input 
                type="number" 
                placeholder="Bulk Price" 
                value={bulkPrice}
                onChange={e => setBulkPrice(e.target.value)}
                onFocus={e => e.target.select()}
                className="w-20 bg-transparent text-[10px] font-bold outline-none"
              />
              <button 
                type="button"
                onClick={() => handleBulkApply('price')}
                className="text-[8px] font-bold uppercase text-gold hover:text-charcoal transition-luxury"
              >Apply</button>
           </div>

           <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded border border-gray-50 focus-within:border-gold transition-luxury">
              <input 
                type="number" 
                placeholder="Bulk Stock" 
                value={bulkStock}
                onChange={e => setBulkStock(e.target.value)}
                onFocus={e => e.target.select()}
                className="w-20 bg-transparent text-[10px] font-bold outline-none"
              />
              <button 
                type="button"
                onClick={() => handleBulkApply('stock_quantity')}
                className="text-[8px] font-bold uppercase text-gold hover:text-charcoal transition-luxury"
              >Apply</button>
           </div>
           
           <div className="h-4 w-px bg-gray-100 mx-2"></div>

           <button 
              type="button"
              onClick={handleResetOverrides}
              className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-luxury"
           >
              Reset All
           </button>
        </div>

        <div className="hidden lg:flex items-center space-x-6">
           <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gold shadow-sm"></div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Auto</span>
           </div>
           <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm"></div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Fixed</span>
           </div>
           <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 border border-gray-200 rounded-full bg-white shadow-sm"></div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Request</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-luxury border border-neutral-border overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-soft-bg border-b border-gray-100">
                {attributeNames.map(name => (
                  <th key={name} className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">{name}</th>
                ))}
                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Price (â‚¦)</th>
                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Stock</th>
                <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {variants.map((variant, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group hover:bg-gray-50/50 transition-luxury"
                  >
                    {attributeNames.map(name => (
                      <td key={name} className="px-6 py-5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">{variant.attributes[name]}</span>
                      </td>
                    ))}
                    
                    <td className="px-6 py-5">
                      <div className="relative flex items-center group/price">
                        <input
                          type="number"
                          value={variant.price === null ? '' : variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          onFocus={e => e.target.select()}
                          placeholder="Quote req."
                          className={`bg-transparent border-b w-32 py-1 outline-none font-bold text-[11px] transition-luxury placeholder:text-gray-200 placeholder:italic placeholder:font-normal ${
                            variant.price === null 
                              ? 'border-dashed border-gray-200 text-gray-400'
                              : variant.is_overridden 
                                ? 'border-blue-200 text-blue-600 focus:border-blue-500' 
                                : 'border-gray-100 text-gold focus:border-gold'
                          }`}
                        />
                        {variant.is_overridden && (
                          <div className="absolute -right-6 group-hover/price:block hidden">
                             <div className="relative group/tooltip">
                                <Alert01Icon size={12} className="text-blue-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-charcoal text-white text-[8px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-luxury pointer-events-none z-50 uppercase tracking-widest text-center shadow-luxury">
                                   Fixed price active
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <input
                        type="number"
                        min="0"
                        value={variant.stock_quantity === null ? '' : variant.stock_quantity}
                        onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value === '' ? null : Math.max(0, parseInt(e.target.value) || 0))}
                        onFocus={e => e.target.select()}
                        className="bg-transparent border-b border-gray-100 w-20 py-1 outline-none text-[11px] font-bold text-charcoal focus:border-gold transition-luxury"
                      />
                    </td>

                    <td className="px-6 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-luxury"
                      >
                        <Delete02Icon size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {variants.length === 0 && (
          <div className="py-12 text-center text-gray-400 italic text-[10px] uppercase tracking-widest">
             No variants generated for this configuration
          </div>
        )}
      </div>
      
      <div className="p-4 bg-soft-bg rounded-luxury border border-gray-100 flex items-start space-x-4">
         <InformationCircleIcon size={18} className="text-gold shrink-0 mt-0.5" />
         <div className="space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal">Artisanal Workflow</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest opacity-80 leading-relaxed">
              Leaving a price empty (<b>"Quote req."</b>) will switch this variant to <b>Request Price</b> mode for customers.
            </p>
         </div>
      </div>
    </div>
  )
}

export default VariantTable




