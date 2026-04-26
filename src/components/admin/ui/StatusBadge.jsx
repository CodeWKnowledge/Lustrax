import React from 'react'

const StatusBadge = ({ status }) => {
  const getStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-gray-400 bg-gray-50'
      case 'confirmed':
        return 'text-blue-600 bg-blue-500/5'
      case 'processing':
        return 'text-purple-600 bg-purple-500/5'
      case 'paid':
      case 'success':
        return 'text-green-600 bg-green-500/5'
      case 'shipped':
        return 'text-gold bg-gold/5'
      case 'out_for_delivery':
        return 'text-orange-500 bg-orange-500/5'
      case 'delivered':
        return 'text-emerald-600 bg-emerald-500/10'
      case 'failed':
      case 'cancelled':
        return 'text-red-500 bg-red-500/5'
      default:
        return 'text-gray-400 bg-gray-50'
    }
  }

  return (
    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full ${getStyles(status)} transition-luxury flex-shrink-0 inline-block`}>
      {status || 'Unknown'}
    </span>
  )
}

export default StatusBadge


