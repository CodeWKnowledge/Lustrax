import { supabase } from '@/lib/supabase'

/**
 * Dispatches order notifications via Supabase Edge Functions with client-side fallback.
 * Sends customer order confirmations, admin purchase alerts, and customer status updates.
 */

/**
 * Notify customer & admin when a new order is placed
 */
export async function notifyOrderPlaced({ order, items, customer, shippingAddress }) {
  try {
    const customerEmail = customer?.email || order?.profiles?.email
    const customerName = customer?.full_name || customer?.name || order?.profiles?.full_name || 'Valued Client'
    const customerPhone = customer?.phone || order?.profiles?.phone || ''

    // Query active admin emails to notify
    let adminEmails = []
    try {
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')

      if (adminProfiles && adminProfiles.length > 0) {
        adminEmails = adminProfiles.map(p => p.email).filter(Boolean)
      }
    } catch (e) {
      console.warn('Could not query admin emails:', e)
    }

    const payload = {
      type: 'order_placed',
      order,
      items: items || [],
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress: shippingAddress || order?.shipping_address,
      adminEmails
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: payload
    })

    if (error) {
      console.warn('Edge function send-order-notification error:', error)
    }

    // Also record admin in-app notification in notifications table
    try {
      const orderRef = (order.payment_reference || order.id || '').toString().slice(0, 10).toUpperCase()
      const totalFormatted = '₦' + Number(order.total_amount || 0).toLocaleString()

      await supabase.from('notifications').insert([{
        type: 'order',
        title: `New Order Placed (#${orderRef})`,
        message: `${customerName} placed an order for ${totalFormatted}. Status: Confirmed.`,
        is_read: false,
        created_at: new Date().toISOString()
      }])
    } catch (notifErr) {
      console.warn('Could not record database notification:', notifErr)
    }

    return { success: true, data }
  } catch (err) {
    console.error('Error sending order placed notification:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Notify customer when admin changes order status
 */
export async function notifyOrderStatusUpdate({ order, newStatus, items }) {
  try {
    if (!order) return { success: false, error: 'No order provided' }

    const customerEmail = order.profiles?.email
    const customerName = order.profiles?.full_name || 'Valued Client'
    const customerPhone = order.profiles?.phone || ''
    const shippingAddress = order.shipping_address

    const payload = {
      type: 'status_updated',
      order: {
        ...order,
        status: newStatus
      },
      items: items || order.order_items || [],
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      previousStatus: order.status
    }

    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: payload
    })

    if (error) {
      console.warn('Edge function send-order-notification (status update) error:', error)
    }

    return { success: true, data }
  } catch (err) {
    console.error('Error sending status update notification:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Send a test notification to verify Resend and Supabase integration
 */
export async function sendTestNotification({ targetEmail, notificationType = 'order_placed', statusStep = 'confirmed' }) {
  try {
    const testOrderRef = 'TEST-' + Math.floor(100000 + Math.random() * 900000)
    const testOrder = {
      id: 'test-order-preview-' + Date.now(),
      payment_reference: testOrderRef,
      total_amount: 185000,
      status: statusStep,
      created_at: new Date().toISOString()
    }

    const testItems = [
      { product_name: 'Bespoke Diamond Encrusted Cuban Link', quantity: 1, price: 185000, variant_name: '18k Yellow Gold' }
    ]

    const testAddress = {
      street: '15 Admiralty Way, Lekki Phase 1',
      landmark: 'Near Ebeano Supermarket',
      city: 'Lagos',
      state: 'Lagos'
    }

    const payload = {
      type: notificationType,
      order: testOrder,
      items: testItems,
      customerEmail: targetEmail,
      customerName: 'Test Customer',
      customerPhone: '+234 812 345 6789',
      shippingAddress: testAddress,
      adminEmails: [targetEmail]
    }

    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: payload
    })

    if (error) {
      throw error
    }

    // Also insert test notification in database
    await supabase.from('notifications').insert([{
      type: 'order',
      title: `Test Alert: #${testOrderRef}`,
      message: `System test notification sent to ${targetEmail} (${notificationType}).`,
      is_read: false,
      created_at: new Date().toISOString()
    }])

    return { success: true, data }
  } catch (err) {
    console.error('Error sending test notification:', err)
    return { success: false, error: err.message }
  }
}
