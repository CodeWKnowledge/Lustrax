import React from 'react'
import { ArrowUp01Icon, ArrowDown01Icon } from 'hugeicons-react'

const StatCard = ({ label, value, icon, trend, trendValue, color = 'gold' }) => {
  return (
    <div className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl border border-gray-100 lg:border-subtle flex flex-col justify-between group hover:shadow-premium-hover transition-luxury">
      <div className="flex justify-between items-start mb-3 lg:mb-8">
        <div className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-subtle transition-luxury group-hover:border-gold/30 ${color === 'gold' ? 'text-gold bg-gold/5' : 'text-charcoal bg-soft-bg'}`}>
          {React.cloneElement(icon, { size: 16 })}
        </div>
        {trend && (
           <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest ${trend === 'up' ? 'text-green-600 bg-green-500/5' : 'text-red-500 bg-red-500/5'}`}>
              {trend === 'up' ? <ArrowUp01Icon size={8} /> : <ArrowDown01Icon size={8} />}
              <span>{trendValue}%</span>
           </div>
        )}
      </div>

      <div className="space-y-0.5 lg:space-y-2">
        <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">{label}</p>
        <p className="text-xl md:text-2xl lg:text-4xl font-serif font-bold tracking-tighter text-charcoal">{value}</p>
      </div>
    </div>
  )
}

export default StatCard


