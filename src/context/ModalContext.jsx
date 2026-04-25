/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react'

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm' | 'prompt'
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    resolver: null,
    defaultValue: ''
  })

  const showAlert = useCallback((title, message) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmText: 'OK',
        resolver: resolve
      })
    })
  }, [])

  const showConfirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        resolver: resolve
      })
    })
  }, [])

  const showPrompt = useCallback((title, message, defaultValue = '') => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        defaultValue,
        confirmText: 'Submit',
        cancelText: 'Cancel',
        resolver: resolve
      })
    })
  }, [])

  const handleConfirm = (value) => {
    const { resolver } = modal
    setModal(prev => ({ ...prev, isOpen: false }))
    if (resolver) resolver(value !== undefined ? value : true)
  }

  const handleCancel = () => {
    const { resolver } = modal
    setModal(prev => ({ ...prev, isOpen: false }))
    if (resolver) resolver(false)
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt, modal, handleConfirm, handleCancel }}>
      {children}
    </ModalContext.Provider>
  )
}



