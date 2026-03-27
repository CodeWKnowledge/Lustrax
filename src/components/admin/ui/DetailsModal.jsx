import React from 'react'
import Modal from '../../ui/Modal'

const DetailsModal = ({ isOpen, onClose, title, sections, maxWidth = 'max-w-2xl' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
        {sections?.map((section, idx) => (
          <div key={idx} className={section.fullWidth ? 'md:col-span-2' : ''}>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">{section.label}</p>
            <div className="text-[12px] text-charcoal font-medium leading-relaxed">{section.value || '-'}</div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default DetailsModal
