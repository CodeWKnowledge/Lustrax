import React from 'react'

const StatusBadge = ({ status }) => {
  const getStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'success':
      case 'delivered':
        return 'text-green-600 bg-green-500/5'
      case 'pending':
      case 'processing':
        return 'text-gold bg-gold/5'
      case 'failed':
      case 'cancelled':
        return 'text-red-500 bg-red-500/5'
      case 'shipped':
        return 'text-blue-500 bg-blue-500/5'
      default:
        return 'text-gray-400 bg-gray-50'
    }
  }

  return (
    <span className={`text-[8px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full ${getStyles(status)} transition-luxury flex-shrink-0 inline-block`}>
      {status || 'Unknown'}
    </span>
  )
}

export default StatusBadge
