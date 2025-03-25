import { offlineStorage } from './offline-storage';
import { apiRequest } from './queryClient';
import { queryClient } from './queryClient';
import { useToast } from '@/hooks/use-toast';

// Network status tracking
let isOnline = navigator.onLine;
let syncInProgress = false;
let syncInterval: NodeJS.Timeout | null = null;

// Function to check if we're connected to the internet
export function checkOnlineStatus(): boolean {
  return isOnline;
}

// Start monitoring network status
export function initNetworkMonitoring(): void {
  // Listen for online status changes
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initialize based on current status
  if (navigator.onLine) {
    handleOnline();
  } else {
    handleOffline();
  }
}

// Stop monitoring network status
export function stopNetworkMonitoring(): void {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

// Handle going online
function handleOnline(): void {
  console.log('Application is online, starting sync');
  isOnline = true;
  document.body.classList.remove('offline-mode');
  
  // Try to sync immediately when we come back online
  syncOfflineData();
  
  // Set up periodic sync in case the first one fails
  if (!syncInterval) {
    syncInterval = setInterval(syncOfflineData, 60000); // Try every minute
  }
}

// Handle going offline
function handleOffline(): void {
  console.log('Application is offline, activating offline mode');
  isOnline = false;
  document.body.classList.add('offline-mode');
  
  // Stop any sync attempts
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

// Synchronize offline data with the server
export async function syncOfflineData(): Promise<void> {
  if (!isOnline || syncInProgress) {
    return;
  }
  
  try {
    syncInProgress = true;
    console.log('Starting data synchronization');
    
    const pendingActions = await offlineStorage.getPendingActions();
    
    if (pendingActions.length === 0) {
      console.log('No pending actions to sync');
      syncInProgress = false;
      return;
    }
    
    console.log(`Found ${pendingActions.length} pending actions to sync`);
    
    // Process each pending action in order
    for (const action of pendingActions) {
      try {
        await processPendingAction(action);
        await offlineStorage.removePendingAction(action.id);
      } catch (error) {
        console.error(`Failed to process action ${action.id}:`, error);
        // Update attempts count for retrying later
        action.attempts = (action.attempts || 0) + 1;
        await offlineStorage.savePendingAction(action.type, action.storeName, action.data);
        
        // If we've tried too many times, we might want to give up
        if (action.attempts >= 5) {
          console.log(`Giving up on action ${action.id} after ${action.attempts} attempts`);
          await offlineStorage.removePendingAction(action.id);
          
          // Notify the user that some changes couldn't be saved
          const { toast } = useToast();
          toast({
            title: 'Sync Failed',
            description: `Some changes couldn't be synchronized. Please try again later.`,
            variant: 'destructive',
          });
        }
      }
    }
    
    console.log('Sync completed successfully');
    
    // Notify the user that sync is complete
    const { toast } = useToast();
    toast({
      title: 'Sync Complete',
      description: `Your offline changes have been synchronized.`,
      variant: 'default',
    });
    
    // Refresh data from server
    await refreshAllData();
  } catch (error) {
    console.error('Sync process failed:', error);
  } finally {
    syncInProgress = false;
  }
}

// Process a single pending action
async function processPendingAction(action: any): Promise<void> {
  const { type, storeName, data } = action;
  
  switch (storeName) {
    case 'transactions':
      return processTransactionAction(type, data);
    
    case 'invoices':
      return processInvoiceAction(type, data);
    
    case 'messages':
      return processMessageAction(type, data);
    
    case 'reports':
      return processReportAction(type, data);
    
    case 'notifications':
      return processNotificationAction(type, data);
    
    default:
      console.warn(`Unknown store type: ${storeName}`);
  }
}

// Process transaction actions
async function processTransactionAction(type: string, data: any): Promise<void> {
  switch (type) {
    case 'create':
      await apiRequest('POST', '/api/transactions', data);
      break;
    
    case 'update':
      await apiRequest('PATCH', `/api/transactions/${data.id}`, data);
      break;
    
    case 'delete':
      await apiRequest('DELETE', `/api/transactions/${data.id}`);
      break;
  }
  
  // Invalidate transactions cache to refresh data
  queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
}

// Process invoice actions
async function processInvoiceAction(type: string, data: any): Promise<void> {
  switch (type) {
    case 'create':
      await apiRequest('POST', '/api/invoices', data);
      break;
    
    case 'update':
      await apiRequest('PATCH', `/api/invoices/${data.id}`, data);
      break;
    
    case 'delete':
      await apiRequest('DELETE', `/api/invoices/${data.id}`);
      break;
  }
  
  // Invalidate invoices cache to refresh data
  queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
}

// Process message actions
async function processMessageAction(type: string, data: any): Promise<void> {
  switch (type) {
    case 'create':
      await apiRequest('POST', '/api/messages', data);
      break;
    
    case 'update':
      await apiRequest('PATCH', `/api/messages/${data.id}`, data);
      break;
    
    case 'delete':
      await apiRequest('DELETE', `/api/messages/${data.id}`);
      break;
  }
  
  // Invalidate messages cache to refresh data
  queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
}

// Process report actions
async function processReportAction(type: string, data: any): Promise<void> {
  switch (type) {
    case 'create':
      await apiRequest('POST', '/api/reports', data);
      break;
    
    case 'update':
      await apiRequest('PATCH', `/api/reports/${data.id}`, data);
      break;
    
    case 'delete':
      await apiRequest('DELETE', `/api/reports/${data.id}`);
      break;
  }
  
  // Invalidate reports cache to refresh data
  queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
}

// Process notification actions
async function processNotificationAction(type: string, data: any): Promise<void> {
  switch (type) {
    case 'create':
      await apiRequest('POST', '/api/notifications', data);
      break;
    
    case 'update':
      await apiRequest('PATCH', `/api/notifications/${data.id}`, data);
      break;
    
    case 'delete':
      await apiRequest('DELETE', `/api/notifications/${data.id}`);
      break;
  }
  
  // Invalidate notifications cache to refresh data
  queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
}

// Refresh all data from the server
async function refreshAllData(): Promise<void> {
  queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
  queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
  queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
  queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
  queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
}

// Create a local transaction when offline
export async function createOfflineTransaction(data: any): Promise<any> {
  // Generate a temporary ID (negative to avoid conflicts with server IDs)
  const tempId = -Math.floor(Math.random() * 1000000);
  
  const transaction = {
    ...data,
    id: tempId,
    createdOffline: true,
    timestamp: new Date()
  };
  
  // Save locally
  await offlineStorage.saveTransaction(transaction);
  
  // Create a pending action to sync later
  await offlineStorage.savePendingAction('create', 'transactions', data);
  
  return transaction;
}

// Create a local invoice when offline
export async function createOfflineInvoice(data: any): Promise<any> {
  // Generate a temporary ID (negative to avoid conflicts with server IDs)
  const tempId = -Math.floor(Math.random() * 1000000);
  
  const invoice = {
    ...data,
    id: tempId,
    createdOffline: true,
    timestamp: new Date()
  };
  
  // Save locally
  await offlineStorage.saveInvoice(invoice);
  
  // Create a pending action to sync later
  await offlineStorage.savePendingAction('create', 'invoices', data);
  
  return invoice;
}

// Create a local message when offline
export async function createOfflineMessage(data: any): Promise<any> {
  // Generate a temporary ID (negative to avoid conflicts with server IDs)
  const tempId = -Math.floor(Math.random() * 1000000);
  
  const message = {
    ...data,
    id: tempId,
    createdOffline: true,
    timestamp: new Date()
  };
  
  // Save locally
  await offlineStorage.saveMessage(message);
  
  // Create a pending action to sync later
  await offlineStorage.savePendingAction('create', 'messages', data);
  
  return message;
}

// Get combined data (both from server and local storage)
export async function getCombinedData(type: 'transactions' | 'invoices' | 'messages' | 'reports' | 'notifications'): Promise<any[]> {
  let onlineData: any[] = [];
  let offlineData: any[] = [];
  
  // Try to get online data if connected
  if (isOnline) {
    try {
      switch (type) {
        case 'transactions':
          const transactionsResponse = await apiRequest('GET', '/api/transactions');
          onlineData = await transactionsResponse.json();
          break;
        
        case 'invoices':
          const invoicesResponse = await apiRequest('GET', '/api/invoices');
          onlineData = await invoicesResponse.json();
          break;
        
        case 'messages':
          const messagesResponse = await apiRequest('GET', '/api/messages');
          onlineData = await messagesResponse.json();
          break;
        
        case 'reports':
          const reportsResponse = await apiRequest('GET', '/api/reports');
          onlineData = await reportsResponse.json();
          break;
        
        case 'notifications':
          const notificationsResponse = await apiRequest('GET', '/api/notifications');
          onlineData = await notificationsResponse.json();
          break;
      }
    } catch (error) {
      console.error(`Failed to get online ${type}:`, error);
    }
  }
  
  // Get offline data
  try {
    switch (type) {
      case 'transactions':
        offlineData = await offlineStorage.getTransactions();
        break;
      
      case 'invoices':
        offlineData = await offlineStorage.getInvoices();
        break;
      
      case 'messages':
        offlineData = await offlineStorage.getMessages();
        break;
      
      case 'reports':
        offlineData = await offlineStorage.getReports();
        break;
      
      case 'notifications':
        offlineData = await offlineStorage.getNotifications();
        break;
    }
  } catch (error) {
    console.error(`Failed to get offline ${type}:`, error);
  }
  
  // Filter out offline items that have a positive ID (already synced)
  const filteredOfflineData = offlineData.filter(item => item.id < 0 || item.createdOffline);
  
  // Combine data, with offline taking precedence for duplicates
  const combined = [...onlineData];
  
  for (const offlineItem of filteredOfflineData) {
    // Check if this item already exists in combined array
    const existingIndex = combined.findIndex(item => item.id === offlineItem.id);
    
    if (existingIndex >= 0) {
      // Replace the existing item
      combined[existingIndex] = offlineItem;
    } else {
      // Add as a new item
      combined.push(offlineItem);
    }
  }
  
  return combined;
}

// Initialize the offline sync system
export function initOfflineSync(): void {
  console.log('Initializing offline sync system');
  
  // Add styles for offline mode
  const style = document.createElement('style');
  style.textContent = `
    .offline-mode {
      --offline-indicator: '🔄 Offline Mode';
    }
    
    .offline-mode::before {
      content: var(--offline-indicator);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 8px;
      background-color: #f8d7da;
      color: #721c24;
      text-align: center;
      z-index: 9999;
      font-weight: bold;
    }
    
    .offline-mode .offline-badge::after {
      content: '(Offline)';
      margin-left: 5px;
      background-color: #ffc107;
      color: #000;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 0.75rem;
    }
  `;
  document.head.appendChild(style);
  
  // Start network monitoring
  initNetworkMonitoring();
}