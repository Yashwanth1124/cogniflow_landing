import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
  checkOnlineStatus,
  initOfflineSync,
  syncOfflineData,
  createOfflineTransaction,
  createOfflineInvoice,
  createOfflineMessage,
  getCombinedData
} from '@/lib/sync-service';
import { useToast } from '@/hooks/use-toast';

// Define the context type
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncNow: () => Promise<void>;
  createTransaction: (data: any) => Promise<any>;
  createInvoice: (data: any) => Promise<any>;
  createMessage: (data: any) => Promise<any>;
  getTransactions: () => Promise<any[]>;
  getInvoices: () => Promise<any[]>;
  getMessages: () => Promise<any[]>;
  getReports: () => Promise<any[]>;
  getNotifications: () => Promise<any[]>;
}

// Create the context with default values
export const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  pendingChanges: 0,
  syncNow: async () => {},
  createTransaction: async () => ({}),
  createInvoice: async () => ({}),
  createMessage: async () => ({}),
  getTransactions: async () => [],
  getInvoices: async () => [],
  getMessages: async () => [],
  getReports: async () => [],
  getNotifications: async () => [],
});

// Offline Provider component
export function OfflineProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  
  // Initialize offline functionality
  useEffect(() => {
    // Initialize the offline sync system
    initOfflineSync();
    
    // Update online status when it changes
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'You are back online',
        description: 'Your data will be synced automatically.',
        variant: 'default',
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'You are offline',
        description: 'You can continue working. Changes will be synced when you reconnect.',
        variant: 'destructive',
      });
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial status
    setIsOnline(navigator.onLine);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  
  // Check for pending changes periodically
  useEffect(() => {
    const checkPendingChanges = async () => {
      try {
        const combined = await getCombinedData('transactions');
        const offlineItems = combined.filter(item => item.createdOffline);
        setPendingChanges(offlineItems.length);
      } catch (error) {
        console.error('Failed to check pending changes:', error);
      }
    };
    
    // Check immediately and then every 30 seconds
    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Function to manually trigger sync
  const syncNow = async () => {
    if (!isOnline) {
      toast({
        title: 'Cannot sync while offline',
        description: 'Please check your internet connection and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSyncing(true);
      await syncOfflineData();
      setLastSyncTime(new Date());
      setPendingChanges(0);
      
      toast({
        title: 'Sync Completed',
        description: 'All your data has been synchronized with the server.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Manual sync failed:', error);
      
      toast({
        title: 'Sync Failed',
        description: 'There was a problem synchronizing your data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Create a transaction (works both online and offline)
  const createTransaction = async (data: any) => {
    try {
      if (!isOnline) {
        // If offline, create locally
        const result = await createOfflineTransaction(data);
        setPendingChanges(prev => prev + 1);
        
        toast({
          title: 'Transaction Created Offline',
          description: 'The transaction will be synced when you reconnect.',
          variant: 'default',
        });
        
        return result;
      }
      
      // If online, make a direct API call
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      // If the API call fails, fall back to offline mode
      const result = await createOfflineTransaction(data);
      setPendingChanges(prev => prev + 1);
      
      toast({
        title: 'Created Offline',
        description: 'Could not connect to the server. Transaction saved locally.',
        variant: 'destructive',
      });
      
      return result;
    }
  };
  
  // Create an invoice (works both online and offline)
  const createInvoice = async (data: any) => {
    try {
      if (!isOnline) {
        // If offline, create locally
        const result = await createOfflineInvoice(data);
        setPendingChanges(prev => prev + 1);
        
        toast({
          title: 'Invoice Created Offline',
          description: 'The invoice will be synced when you reconnect.',
          variant: 'default',
        });
        
        return result;
      }
      
      // If online, make a direct API call
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating invoice:', error);
      
      // If the API call fails, fall back to offline mode
      const result = await createOfflineInvoice(data);
      setPendingChanges(prev => prev + 1);
      
      toast({
        title: 'Created Offline',
        description: 'Could not connect to the server. Invoice saved locally.',
        variant: 'destructive',
      });
      
      return result;
    }
  };
  
  // Create a message (works both online and offline)
  const createMessage = async (data: any) => {
    try {
      if (!isOnline) {
        // If offline, create locally
        const result = await createOfflineMessage(data);
        setPendingChanges(prev => prev + 1);
        
        toast({
          title: 'Message Created Offline',
          description: 'The message will be synced when you reconnect.',
          variant: 'default',
        });
        
        return result;
      }
      
      // If online, make a direct API call
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create message');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating message:', error);
      
      // If the API call fails, fall back to offline mode
      const result = await createOfflineMessage(data);
      setPendingChanges(prev => prev + 1);
      
      toast({
        title: 'Created Offline',
        description: 'Could not connect to the server. Message saved locally.',
        variant: 'destructive',
      });
      
      return result;
    }
  };
  
  // Get combined data (both from API and offline storage)
  const getTransactions = async () => {
    return getCombinedData('transactions');
  };
  
  const getInvoices = async () => {
    return getCombinedData('invoices');
  };
  
  const getMessages = async () => {
    return getCombinedData('messages');
  };
  
  const getReports = async () => {
    return getCombinedData('reports');
  };
  
  const getNotifications = async () => {
    return getCombinedData('notifications');
  };
  
  // The context value
  const contextValue: OfflineContextType = {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingChanges,
    syncNow,
    createTransaction,
    createInvoice,
    createMessage,
    getTransactions,
    getInvoices,
    getMessages,
    getReports,
    getNotifications,
  };
  
  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

// Custom hook to use the offline context
export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  
  return context;
}