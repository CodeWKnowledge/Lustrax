import React from 'react'

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-inter font-bold tracking-[0.25em] uppercase transition-luxury rounded-luxury disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gold hover:shadow-premium border border-black hover:border-gold',
    secondary: 'bg-soft-bg text-charcoal border border-neutral-border hover:border-charcoal hover:shadow-premium-sm',
    gold: 'bg-gold text-white hover:bg-gold-dark hover:shadow-premium border border-gold hover:border-gold-dark',
    outline: 'bg-transparent border border-charcoal text-charcoal hover:bg-black hover:text-white',
    danger: 'bg-transparent border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'
  }

  const sizes = {
    sm: 'px-8 py-3 text-[9px]',
    md: 'px-12 py-4 text-[10px]',
    lg: 'px-16 py-5 text-[11px]'
  }

  return (
    <button 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} hover-scale`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
