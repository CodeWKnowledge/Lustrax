import React, { useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const location = useLocation()

  // Protect the route
  if (!loading && !user) {
    return <Navigate to="/" replace />
  }

  // Derive page title from path
  const getPageTitle = (pathname) => {
    const segments = pathname.split('/')
    const last = segments[segments.length - 1]
    
    if (last === 'dashboard' || !last) return 'Overview'
    
    // Mapping for specific paths
    const titles = {
      'orders': 'Orders',
      'wishlist': 'Wishlist',
      'transactions': 'Transactions',
      'settings': 'Settings'
    }
    
    return titles[last] || last.charAt(0).toUpperCase() + last.slice(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex inter-scope">
      <DashboardSidebar 
        isCollapsed={isCollapsed} 
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main 
        className="flex-1 min-w-0 flex flex-col transition-luxury"
      >
        <DashboardTopbar 
          title={getPageTitle(location.pathname)} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <div className="p-4 md:p-8 lg:p-10 flex-1 max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
