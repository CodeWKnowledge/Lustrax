import { formatCurrency } from '../../utils/formatters';
﻿import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  ShoppingBag02Icon, 
  FavouriteIcon, 
  PackageIcon,
  ArrowRight01Icon,
  Activity04Icon
} from 'hugeicons-react'

import Button from '../../components/ui/Button'

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 md:p-6 lg:p-8 rounded-luxury border border-gray-50 shadow-sm flex items-center justify-between group hover:border-gold transition-luxury">
    <div className="space-y-0.5 md:space-y-1">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 group-hover:text-gold transition-luxury">
        {title}
      </p>
      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tighter text-charcoal">{value}</h3>
    </div>
    <div className={`p-3 md:p-4 rounded-full bg-soft-bg group-hover:bg-white transition-luxury ${color}`}>
      {React.cloneElement(icon, { size: 18 })}
    </div>
  </div>
)

const Overview = () => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, wishlist: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [ordersRes, wishlistRes] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('wishlist').select('count', { count: 'exact' }).eq('user_id', user.id)
    ])

    if (ordersRes.data) {
      const orders = ordersRes.data
      setRecentOrders(orders.slice(0, 5))
      setStats({
        total: orders.length,
        pending: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
        completed: orders.filter(o => o.status === 'delivered').length,
        wishlist: wishlistRes.count || 0
      })
    }
    setLoading(false)
  }

  const fetchDataSilent = async () => {
    try {
      const [ordersRes, wishlistRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('wishlist').select('count', { count: 'exact' }).eq('user_id', user.id)
      ])

      if (ordersRes.data) {
        const orders = ordersRes.data
        setRecentOrders(orders.slice(0, 5))
        setStats({
          total: orders.length,
          pending: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
          completed: orders.filter(o => o.status === 'delivered').length,
          wishlist: wishlistRes.count || 0
        })
      }
    } catch (err) {
      console.error('Silent dashboard sync error:', err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()

      const channelKey = `customer-overview-${user.id}-${Date.now()}`
      const channel = supabase
        .channel(channelKey)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, fetchDataSilent)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist', filter: `user_id=eq.${user.id}` }, fetchDataSilent)
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header Snippet */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1 lg:space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tight">
            Hello, {profile?.full_name?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            Member since {new Date(profile?.created_at).getFullYear()}
          </p>
        </div>
        <div className="flex items-center space-x-3 lg:space-x-4 w-full md:w-auto">
           <Link to="/" className="flex-1 md:flex-none">
              <Button size="sm" variant="outline" className="text-[9px] lg:text-[10px] w-full">Storefront</Button>
           </Link>
           <Link to="/dashboard/wishlist" className="flex-1 md:flex-none">
              <Button size="sm" className="text-[9px] lg:text-[10px] w-full">Wishlist</Button>
           </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Orders" 
          value={stats.total} 
          icon={<ShoppingBag02Icon size={24} />} 
          color="text-charcoal"
        />
        <StatCard 
          title="Processing" 
          value={stats.pending} 
          icon={<Activity04Icon size={24} />} 
          color="text-gold"
        />
        <StatCard 
          title="Delivered" 
          value={stats.completed} 
          icon={<PackageIcon size={24} />} 
          color="text-green-500"
        />
        <StatCard 
          title="Wishlist" 
          value={stats.wishlist} 
          icon={<FavouriteIcon size={24} />} 
          color="text-red-400"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 bg-white rounded-luxury border border-gray-50 shadow-sm overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-[10px] lg:text-sm font-bold uppercase tracking-[0.3em] text-charcoal">Recent Orders</h3>
            <Link to="/dashboard/orders" className="text-[9px] lg:text-[10px] text-gold font-bold uppercase tracking-widest hover:translate-x-1 transition-all flex items-center">
              View All <ArrowRight01Icon size={12} className="ml-2" />
            </Link>
          </div>
          <div className="p-0 overflow-x-auto no-scrollbar">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left block lg:table">
                <thead className="bg-gray-50/50 hidden lg:table-header-group">
                  <tr>
                    <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Order ID</th>
                    <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Status</th>
                    <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Price</th>
                    <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 block lg:table-row-group">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="block lg:table-row group hover:bg-soft-bg/30 transition-luxury p-4 lg:p-0">
                      <td className="block lg:table-cell px-0 lg:px-8 py-1 lg:py-6">
                        <p className="text-[10px] font-bold text-charcoal tracking-widest uppercase">#{order.id.slice(0,8)}</p>
                        <p className="text-[8px] text-gray-400 uppercase tracking-tighter mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="block lg:table-cell px-0 lg:px-8 py-3 lg:py-6">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                          order.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="block lg:table-cell px-0 lg:px-8 py-1 lg:py-6">
                        <p className="text-sm font-bold text-charcoal">â‚¦{order.total_amount.toLocaleString()}</p>
                      </td>
                      <td className="block lg:table-cell px-0 lg:px-8 py-4 lg:py-6 lg:text-right">
                        <div className="flex items-center justify-between lg:justify-end">
                           <span className="lg:hidden text-gray-400 text-[8px] font-bold uppercase tracking-widest">Reference</span>
                           <Link to="/dashboard/orders">
                              <Button size="sm" variant="outline" className="text-[8px] h-8 px-4">VIEW</Button>
                           </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 italic">You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info / Quick Links */}
        <div className="space-y-8">
           <div className="bg-charcoal p-8 md:p-10 rounded-luxury shadow-premium text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-luxury duration-700"></div>
              <h3 className="text-xl font-serif uppercase tracking-widest relative z-10">Lustrax Rewards</h3>
              <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-8 relative z-10">Loyalty Program</p>
              <div className="space-y-4 relative z-10">
                 <p className="text-[11px] text-gray-400 leading-relaxed italic">
                   Our exclusive loyalty program is coming soon. Every purchase earns points redeemable for discounts on future orders.
                 </p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gold italic">Launching Soon</p>
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-luxury border border-gray-50 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-charcoal mb-6">Need Assistance?</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-8"> Our team is here to help with your orders.</p>
              <Link to="/contact" className="text-[10px] text-gold font-bold uppercase tracking-widest hover:translate-x-1 transition-all flex items-center">
                 Contact Support <ArrowRight01Icon size={12} className="ml-2" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}

export default Overview


