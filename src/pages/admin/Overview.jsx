import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/admin/ui/StatCard'
import AdminTable from '../../components/admin/ui/AdminTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import DetailsModal from '../../components/admin/ui/DetailsModal'
import { motion } from 'framer-motion'
import { formatCurrency, formatLuxuryDate } from '../../utils/formatters'
import { 
  AnalyticsUpIcon, 
  ShoppingBag02Icon, 
  UserGroupIcon, 
  Clock01Icon,
  ViewIcon,
  ChartLineData01Icon
} from 'hugeicons-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const Overview = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    pendingOrders: 0,
    lowStock: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)

    try {
      // 1. Optimized Stats Fetching (Parallel Counts)
      const [revRes, ordersCount, profilesCount, productsCount, pendingCount, lowStockCount] = await Promise.all([
        supabase.from('orders').select('total_amount').in('status', ['paid', 'shipped', 'delivered']),
        supabase.from('orders').select('*', { count: 'exact', head: true }),

        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 3).gt('stock_quantity', 0)
      ])

      const revenue = revRes.data?.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0) || 0
      
      setStats({
        revenue,
        orders: ordersCount.count || 0,
        customers: profilesCount.count || 0,
        products: productsCount.count || 0,
        pendingOrders: pendingCount.count || 0,
        lowStock: lowStockCount.count || 0
      })

      // 2. Fetch Recent Orders (Limited)
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*, profiles(email, full_name), order_items(*)')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders(recentOrdersData || [])

      // 3. Process Chart Data (Last 7 Days) via Optimized RPC
      const { data: chartMetricData, error: chartError } = await supabase
        .rpc('get_revenue_metrics', { days_limit: 7 })

      if (chartError) throw chartError

      if (chartMetricData) {
        const dailyRevenue = chartMetricData.map(row => ({
          name: new Date(row.day).toLocaleDateString(undefined, { weekday: 'short' }),
          revenue: parseFloat(row.revenue) || 0
        }))
        setChartData(dailyRevenue)
      }
    } catch (err) {
      console.error('Business intelligence sync error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStatsSilent = async () => {
    try {
      const [revRes, ordersCount, profilesCount, productsCount, pendingCount, lowStockCount] = await Promise.all([
        supabase.from('orders').select('total_amount').in('status', ['paid', 'shipped', 'delivered']),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 3).gt('stock_quantity', 0)
      ])

      const revenue = revRes.data?.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0) || 0
      
      setStats({
        revenue,
        orders: ordersCount.count || 0,
        customers: profilesCount.count || 0,
        products: productsCount.count || 0,
        pendingOrders: pendingCount.count || 0,
        lowStock: lowStockCount.count || 0
      })

      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*, profiles(email, full_name), order_items(*)')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders(recentOrdersData || [])
    } catch (err) {
      console.error('Silent stats sync error:', err)
    }
  }

  useEffect(() => {
    fetchStats()

    const channelKey = `admin-overview-${Date.now()}`
    const channel = supabase
      .channel(channelKey)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStatsSilent)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchStatsSilent)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, fetchStatsSilent)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStats])

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const getModalSections = (order) => {
    if (!order) return []
    return [
      { label: 'Order ID', value: `#${order.id.slice(0,8).toUpperCase()}` },
      { label: 'Date', value: formatLuxuryDate(order.created_at) },
      { label: 'Customer Name', value: order.profiles?.full_name || 'Anonymous' },
      { label: 'Customer Email', value: order.profiles?.email || 'N/A' },
      { label: 'Total Amount', value: formatCurrency(order.total_amount) },
      { label: 'Current Status', value: <StatusBadge status={order.status} /> },
      { 
        label: 'Order Manifest', 
        fullWidth: true,
        value: (
          <div className="mt-2 space-y-3 border-t border-gray-50 pt-4">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase border-b border-gray-50/50 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-500">{item.quantity}x <span className="text-charcoal font-bold ml-2">{item.product_name}</span></span>
                <span className="font-bold text-charcoal">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        )
      }
    ]
  }

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
       <p className="text-[10px] text-gold font-bold uppercase tracking-[0.5em] italic">Synchronizing Intelligence...</p>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 md:space-y-16 lg:space-y-24 pb-20"
    >
      <DetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Intelligence"
        sections={getModalSections(selectedOrder)}
      />

      <div className="flex flex-col space-y-4">
         <span className="text-[11px] uppercase tracking-[0.6em] font-bold text-gold italic">Admin Intelligence</span>
         <h1 className="text-2xl lg:text-4xl font-serif text-charcoal uppercase tracking-[0.2em]">Business Overview</h1>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 lg:gap-8 transition-all duration-300">
        <StatCard 
          label="Estimated Revenue" 
          value={formatCurrency(stats.revenue)} 
          icon={<AnalyticsUpIcon />} 
          trend="up" 
          trendValue={12.5}
          color="gold"
        />
        <StatCard 
          label="Total Orders" 
          value={stats.orders} 
          icon={<ShoppingBag02Icon />} 
          color="charcoal"
        />
        <StatCard 
          label="Registered Users" 
          value={stats.customers} 
          icon={<UserGroupIcon />} 
          color="charcoal"
        />
        <StatCard 
          label="Pending Clearance" 
          value={stats.pendingOrders} 
          icon={<Clock01Icon />} 
          color="gold"
        />
      </div>

      {/* Chart & Activity Grid */}
      <div className="flex flex-wrap gap-12 lg:gap-16 w-full transition-all duration-300">
         {/* Financial Trend Chart */}
         <div className="flex-[3] min-w-[100%] lg:min-w-[500px] space-y-10 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-gray-50 pb-8">
               <div className="flex items-center space-x-4">
                  <ChartLineData01Icon size={20} className="text-gold" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-charcoal">Revenue Performance</h3>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Last 7 Cycles</span>
            </div>
            
            <div className="min-h-[400px] h-[400px] w-full bg-white rounded-luxury border border-gray-50/50 p-6 lg:p-10 shadow-premium">

               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 8, fontWeight: 700, fill: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 8, fontWeight: 700, fill: '#9ca3af', letterSpacing: '0.1em' }}
                      tickFormatter={(value) => `₦${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: 'none', 
                        borderRadius: '12px',
                        padding: '12px 20px',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
                      }}
                      itemStyle={{ color: '#D4AF37', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      labelStyle={{ color: '#ffffff', fontSize: '8px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5 }}
                      formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#D4AF37" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Sidebar Stats or Highlights */}
         <div className="flex-1 min-w-[100%] lg:min-w-[300px] space-y-12 transition-all duration-300">
            <div className="flex items-center space-x-4 border-b border-gray-50 pb-8">
               <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-charcoal">Inventory Health</h3>
            </div>
            
            <div className="space-y-8 bg-charcoal text-white p-10 lg:p-12 rounded-luxury relative overflow-hidden shadow-2xl border border-white/5">
               <div className="absolute top-0 right-0 w-full h-full bg-gold/5 blur-[100px] pointer-events-none"></div>
               <div className="space-y-2 relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-white/80 font-bold">Stock Intelligence</span>
                  <p className="text-4xl font-serif text-white tracking-widest">{stats.products}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold pt-2">Curated Pieces in Asset Book</p>
               </div>
               <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white">
                     <span>Low Stock Alert</span>
                     <span className={stats.lowStock > 0 ? 'text-orange-400' : 'text-green-400'}>
                       {stats.lowStock} Pieces
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white">
                     <span>Acquisition Velocity</span>
                     <span>Stable</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-gray-50 pb-8">
           <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-charcoal/80">Recent Clearances</h3>
           <button onClick={() => navigate('/admin/orders')} className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold hover:opacity-100 opacity-60 transition-luxury underline underline-offset-8">View Manifest Repository</button>
        </div>
        
        <AdminTable 
          headers={[
            { label: 'Client Identity' },
            { label: 'Value Transferred' },
            { label: 'Status Protocol', align: 'center' },
            { label: 'Inspect', align: 'right' }
          ]}
        >
          {recentOrders.map(order => (
            <tr key={order.id} className="block lg:table-row text-sm border border-gray-100 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:border-b lg:border-gray-50 rounded-xl mb-4 lg:mb-0 lg:rounded-none group hover:bg-soft-bg/20 transition-luxury p-5 lg:p-0">
              <td className="block lg:table-cell px-0 lg:px-10 py-1 lg:py-8">
                 <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">{order.profiles?.full_name || 'Anonymous User'}</span>
                    <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest opacity-40 italic">{order.profiles?.email || 'N/A'}</span>
                 </div>
              </td>
              <td className="block lg:table-cell px-0 lg:px-10 py-1 lg:py-8 font-bold text-charcoal text-[11px] tracking-widest">
                 <span className="lg:hidden text-gray-400 mr-2 font-normal">Amount:</span>
                 {formatCurrency(order.total_amount)}
              </td>
              <td className="block lg:table-cell px-0 lg:px-10 py-4 lg:py-8 lg:text-center">
                 <StatusBadge status={order.status} />
              </td>
              <td className="block lg:table-cell px-0 lg:px-10 py-4 lg:py-8 lg:text-right">
                 <button onClick={() => handleViewDetails(order)} className="text-gray-200 hover:text-gold transition-luxury p-2">
                    <ViewIcon size={18} />
                 </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </motion.div>
  )
}

export default Overview
