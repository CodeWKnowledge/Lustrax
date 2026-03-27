import React from 'react'

const AdminTable = ({ 
  headers, 
  children, 
  emptyMessage = "Manifest entries not found.",
  onSelectAll,
  isAllSelected = false
}) => {
  return (
    <div className="bg-white rounded-luxury shadow-premium border-subtle overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse block lg:table">
          <thead className="hidden lg:table-header-group">
            <tr className="bg-soft-bg/50 border-b border-gray-50 text-[9px] uppercase tracking-[0.5em] font-bold text-gray-400">
              {onSelectAll && (
                <th className="px-6 py-5 lg:px-10 lg:py-7 w-12">
                   <input 
                     type="checkbox" 
                     checked={isAllSelected}
                     onChange={(e) => onSelectAll(e.target.checked)}
                     className="w-4 h-4 accent-gold cursor-pointer border-gray-200 rounded-sm"
                   />
                </th>
              )}
              {headers.map((header, i) => (
                <th key={i} className={`px-6 py-5 lg:px-10 lg:py-7 ${header.align === 'center' ? 'text-center' : header.align === 'right' ? 'text-right' : ''}`}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 selection:bg-gold/10 block lg:table-row-group">
            {children}
          </tbody>
        </table>
        {!React.Children.count(children) && (
          <div className="py-32 text-center bg-white">
            <p className="text-gray-300 uppercase tracking-[0.5em] text-[10px] font-bold italic opacity-60">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTable
