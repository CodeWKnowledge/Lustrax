import React, { useState } from 'react'
import { Cancel01Icon } from 'hugeicons-react'

const AttributeInput = ({ label, values, onChange, placeholder = "Add value..." }) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      removeTag(values.length - 1)
    }
  }

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/,$/, '')
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
      setInputValue('')
    }
  }

  const removeTag = (index) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">{label}</label>
      <div className="flex flex-wrap gap-2 p-3 bg-soft-bg/50 rounded-lg border border-gray-100 focus-within:border-gold transition-luxury">
        {values.map((tag, index) => (
          <span 
            key={index} 
            className="flex items-center space-x-2 bg-charcoal text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
          >
            <span>{tag}</span>
            <button 
              type="button" 
              onClick={() => removeTag(index)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <Cancel01Icon size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={values.length === 0 ? placeholder : ""}
          className="flex-grow bg-transparent outline-none text-xs font-bold uppercase tracking-widest text-charcoal min-w-[100px]"
        />
      </div>
    </div>
  )
}

export default AttributeInput
