import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AuthModal from './AuthModal'
import WhatsAppConcierge from './ui/WhatsAppConcierge'

const Layout = ({ children }) => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/dashboard')

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isDashboard && <Navbar />}
      <AuthModal />
      <main className="flex-grow">
        {children}
      </main>
      <WhatsAppConcierge />
      {!isDashboard && <Footer />}
    </div>
  )
}

export default Layout
