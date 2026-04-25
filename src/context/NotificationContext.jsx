import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchNotifications = async () => {
    if (!profile || profile.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchNotifications();

      // Subscribe to real-time notifications with enhanced error handling
      const channel = supabase
        .channel('admin_notifications')
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast.success(`New Alert: ${payload.new.title}`, {
              duration: 5000,
              position: 'top-right',
            });
          }
        );

      channel.subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Notification subscription error:', err);
          // Fallback to immediate fetch
          fetchNotifications();
        }
      });

      // HEARTBEAT FALLBACK: Poll every 5 minutes in case RT is blocked by slow network
      const heartbeat = setInterval(() => {
         fetchNotifications();
      }, 300000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(heartbeat);
      };


    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [profile]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      markAsRead, 
      markAllAsRead,
      refresh: fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
