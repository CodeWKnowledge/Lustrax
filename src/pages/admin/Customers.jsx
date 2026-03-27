import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'
import AdminTable from '../../components/admin/ui/AdminTable'
import DetailsModal from '../../components/admin/ui/DetailsModal'
import { motion, AnimatePresence } from 'framer-motion'
import { formatLuxuryDate } from '../../utils/formatters'
import { toast } from 'react-hot-toast'
import { 
  ChampionIcon, 
  Shield01Icon,
  UserCircleIcon,
  ViewIcon,
  Search01Icon,
  ShieldEnergyIcon
} from 'hugeicons-react'

const PAGE_SIZE = 10

const Customers = () => {
  const { user } = useAuth()
  const { showConfirm } = useModal()
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    
    if (error) {
      toast.error('Failed to retrieve user directory')
    } else {
      setCustomers(data || [])
      setFilteredCustomers(data || [])
      setHasMore(data?.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    const term = searchTerm.toLowerCase()
    const result = customers.filter(c => 
      c.email.toLowerCase().includes(term) || 
      (c.full_name && c.full_name.toLowerCase().includes(term)) ||
      c.id.toLowerCase().includes(term)
    )
    setFilteredCustomers(result)
  }, [searchTerm, customers])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUserIds(filteredCustomers.map(c => c.id))
    } else {
      setSelectedUserIds([])
    }
  }

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, id])
    } else {
      setSelectedUserIds(prev => prev.filter(uid => uid !== id))
    }
  }

  const toggleRole = async (userId, currentRole) => {
    if (userId === user?.id) {
      toast.error('Self-revocation protocol denied. Another administrator must modify your clearance.')
      return
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const confirmed = await showConfirm('Change User Role', `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)
    if (confirmed) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) {
        toast.error('Identity update failed')
      } else {
        toast.success(`Role updated to ${newRole.toUpperCase()}`)
        fetchCustomers()
      }
    }
  }

  const handleBulkPromote = async () => {
    setIsBulkUpdating(true)
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .in('id', selectedUserIds)
    
    if (error) {
      toast.error('Bulk promotion failed')
    } else {
      toast.success(`Promoted ${selectedUserIds.length} users to Admin status`)
      setSelectedUserIds([])
      fetchCustomers()
    }
    setIsBulkUpdating(false)
  }

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const getModalSections = (customer) => {
    if (!customer) return []
    return [
      { label: 'Customer ID', value: customer.id },
      { label: 'Date Joined', value: formatLuxuryDate(customer.created_at) },
      { label: 'Full Name', value: customer.full_name || 'Anonymous' },
      { label: 'Email Address', value: customer.email },
      { label: 'Account Role', value: customer.role.toUpperCase() }
    ]
  }

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
       <p className="text-[10px] text-gold font-bold uppercase tracking-[0.5em] italic">Scanning User Directory...</p>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 md:space-y-16 lg:space-y-20 pb-20 relative"
    >
      <DetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customer Intelligence"
        sections={getModalSections(selectedCustomer)}
      />

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedUserIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white px-8 py-4 rounded-luxury shadow-2xl flex items-center space-x-8 border border-white/10 backdrop-blur-md"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
               {selectedUserIds.length} Users Selected
            </span>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button 
              disabled={isBulkUpdating}
              onClick={handleBulkPromote}
              className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest hover:text-gold transition-luxury disabled:opacity-50"
            >
              <ShieldEnergyIcon size={14} />
              <span>Make Admin</span>
            </button>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button 
              onClick={() => setSelectedUserIds([])}
              className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-luxury"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-50 pb-8 md:pb-12">
        <div className="space-y-4">
           <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-gold italic">User Directory</span>
           <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Customer Intelligence</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 w-full md:w-auto">
          <div className="flex items-center space-x-4 bg-soft-bg px-4 py-3 rounded-luxury border border-gray-50 focus-within:border-gold/30 transition-luxury min-w-[320px]">
            <Search01Icon size={14} className="text-gray-300" />
            <input 
              type="text"
              placeholder="SEARCH BY NAME, EMAIL, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal outline-none w-full placeholder:text-gray-200"
            />
          </div>
          <span className="hidden lg:block text-[9px] text-gray-300 font-bold uppercase tracking-[0.4em] pl-4 border-l border-gray-50 h-6 leading-6">
            {filteredCustomers.length} REGISTERED USERS
          </span>
        </div>
      </div>

      <AdminTable 
        onSelectAll={handleSelectAll}
        isAllSelected={selectedUserIds.length === filteredCustomers.length && filteredCustomers.length > 0}
        headers={[
          { label: 'Customer Identity' },
          { label: 'Security Role', align: 'center' },
          { label: 'Actions', align: 'right' }
        ]}
      >
        {filteredCustomers.map(client => (
          <tr key={client.id} className={`block lg:table-row text-sm border-b border-gray-50 last:border-0 group transition-luxury p-4 lg:p-0 ${selectedUserIds.includes(client.id) ? 'bg-gold/5' : 'hover:bg-soft-bg/20'}`}>
            <td className="px-6 py-5 lg:px-10 lg:py-8 w-12 hidden lg:table-cell">
               <input 
                 type="checkbox" 
                 checked={selectedUserIds.includes(client.id)}
                 onChange={(e) => handleSelectOne(client.id, e.target.checked)}
                 className="w-4 h-4 accent-gold cursor-pointer border-gray-200 rounded-sm"
               />
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-10 py-1 lg:py-8">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-soft-bg border-subtle flex items-center justify-center text-gray-200 group-hover:text-gold transition-luxury">
                  <UserCircleIcon size={16} />
                </div>
                <div className="flex flex-col space-y-0.5 lg:space-y-1">
                   <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">{client.full_name || 'Anonymous User'}</span>
                   <span className="text-[8px] font-mono text-gray-300 tracking-widest uppercase opacity-40 italic">{client.email}</span>
                </div>
              </div>
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-10 py-3 lg:py-8 lg:text-center">
               <span className="lg:hidden text-gray-400 mr-4 text-[9px] uppercase font-bold tracking-widest">Role:</span>
               <span className={`text-[8px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border ${
                 client.role === 'admin' ? 'bg-gold/5 text-gold border-gold/10' : 'bg-gray-50 text-gray-400 border-gray-100'
               }`}>
                  {client.role}
               </span>
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-10 py-4 lg:py-8 lg:text-right">
                <div className="flex items-center justify-between lg:justify-end lg:space-x-4">
                   <button 
                     onClick={() => toggleRole(client.id, client.role)}
                     disabled={client.id === user?.id}
                     className={`flex items-center space-x-3 text-[9px] font-bold uppercase tracking-[0.3em] transition-luxury py-2 px-4 border border-gray-50 lg:border-none rounded-luxury ${
                       client.id === user?.id ? 'opacity-20 cursor-not-allowed text-gray-400' : 'text-gray-300 hover:text-gold'
                     }`}
                   >
                      {client.role === 'admin' ? <Shield01Icon size={16} /> : <ChampionIcon size={16} />}
                      <span>{client.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}</span>
                   </button>
                   <button onClick={() => handleViewDetails(client)} className="text-gray-200 hover:text-gold transition-luxury p-2 border border-gray-50 lg:border-transparent rounded-luxury lg:rounded-none">
                       <ViewIcon size={18} />
                   </button>
                </div>
            </td>
          </tr>
        ))}
        {filteredCustomers.length === 0 && (
          <tr>
            <td colSpan={6} className="py-20 text-center">
               <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] italic">No users found in the luxury directory.</p>
            </td>
          </tr>
        )}
      </AdminTable>

      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
         <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300">
           Directory Page {page}
         </span>
         <div className="flex items-center space-x-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-[9px] font-black uppercase tracking-[0.4em] text-charcoal disabled:opacity-20 hover:text-gold transition-luxury px-4 py-2"
            >
              Previous
            </button>
            <div className="w-[1px] h-4 bg-gray-50"></div>
            <button 
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="text-[9px] font-black uppercase tracking-[0.4em] text-charcoal disabled:opacity-20 hover:text-gold transition-luxury px-4 py-2"
            >
              Next Protocol
            </button>
         </div>
      </div>
    </motion.div>
  )
}

export default Customers
