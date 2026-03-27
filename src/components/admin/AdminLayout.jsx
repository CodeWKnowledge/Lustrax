import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  // Derive page title from path
  const getPageTitle = (pathname) => {
    if (pathname === '/admin') return 'Overview'
    if (pathname.includes('/admin/products/add')) return 'Initialize Asset'
    if (pathname.includes('/admin/products/edit')) return 'Modify Selection'
    
    const path = pathname.split('/').pop()
    if (!path) return 'Overview'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex inter-scope">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      
      <main 
        className="flex-1 min-w-0 flex flex-col transition-luxury"
      >
        <AdminTopbar 
          title={getPageTitle(location.pathname)} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <div className="p-4 md:p-8 lg:p-10 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
