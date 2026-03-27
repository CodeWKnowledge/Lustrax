import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import Button from './Button'
import { useModal } from '../../context/ModalContext'
import { motion } from 'framer-motion'

const GlobalModal = () => {
  const { modal, handleConfirm, handleCancel } = useModal()
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (modal.isOpen && modal.type === 'prompt') {
      setInputValue(modal.defaultValue || '')
    }
  }, [modal.isOpen, modal.type, modal.defaultValue])

  if (!modal.isOpen) return null

  return (
    <Modal 
      isOpen={modal.isOpen} 
      onClose={modal.type === 'alert' ? () => handleConfirm() : handleCancel}
      title={modal.title || 'System Notification'}
      maxWidth="max-w-md"
    >
      <div className="space-y-8">
        <p className="text-[11px] leading-relaxed text-gray-500 font-medium tracking-wide">
          {modal.message}
        </p>

        {modal.type === 'prompt' && (
          <div className="space-y-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              className="w-full bg-soft-bg border-b border-gray-100 py-3 px-4 outline-none font-bold text-[11px] text-charcoal uppercase tracking-widest focus:border-gold transition-luxury"
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm(inputValue)}
            />
          </div>
        )}

        <div className="flex items-center justify-end space-x-4 pt-4">
          {(modal.type === 'confirm' || modal.type === 'prompt') && (
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="px-8 h-12"
            >
              <span className="text-[9px]">{modal.cancelText || 'Cancel'}</span>
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={() => handleConfirm(modal.type === 'prompt' ? inputValue : true)}
            className="px-8 h-12"
          >
            <span className="text-[9px]">{modal.confirmText || 'OK'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GlobalModal
