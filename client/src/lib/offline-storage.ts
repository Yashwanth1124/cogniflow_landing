// Offline storage system to enable offline functionality
// This provides local caching and synchronization when back online

// Database name and version for IndexedDB
const DB_NAME = 'cogniflow_offline_db';
const DB_VERSION = 1;

// Store names for different data types
const STORES = {
  TRANSACTIONS: 'transactions',
  INVOICES: 'invoices',
  MESSAGES: 'messages',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  PENDING_ACTIONS: 'pendingActions'
};

// Initialize and open the database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Failed to open offline database:', event);
      reject(new Error('Failed to open offline database'));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for each data type
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.INVOICES)) {
        db.createObjectStore(STORES.INVOICES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.REPORTS)) {
        db.createObjectStore(STORES.REPORTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id' });
      }
      
      // Create a store for actions that need to be synced when back online
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const pendingStore = db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id', autoIncrement: true });
        pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        pendingStore.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Generic save item function
async function saveItem<T>(storeName: string, item: T): Promise<T> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onerror = (event) => {
      console.error(`Failed to save item in ${storeName}:`, event);
      reject(new Error(`Failed to save item in ${storeName}`));
    };
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Generic get all items function
async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = (event) => {
      console.error(`Failed to get items from ${storeName}:`, event);
      reject(new Error(`Failed to get items from ${storeName}`));
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Generic get item by ID function
async function getItemById<T>(storeName: string, id: number): Promise<T | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onerror = (event) => {
      console.error(`Failed to get item by id from ${storeName}:`, event);
      reject(new Error(`Failed to get item by id from ${storeName}`));
    };
    
    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result as T;
      resolve(result || null);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Generic delete item function
async function deleteItem(storeName: string, id: number): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = (event) => {
      console.error(`Failed to delete item from ${storeName}:`, event);
      reject(new Error(`Failed to delete item from ${storeName}`));
    };
    
    request.onsuccess = () => {
      resolve();
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Clear a specific store
async function clearStore(storeName: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = (event) => {
      console.error(`Failed to clear store ${storeName}:`, event);
      reject(new Error(`Failed to clear store ${storeName}`));
    };
    
    request.onsuccess = () => {
      resolve();
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Save a pending action to be synced when back online
async function savePendingAction(
  type: 'create' | 'update' | 'delete',
  storeName: string,
  data: any
): Promise<void> {
  const pendingAction = {
    type,
    storeName,
    data,
    timestamp: new Date(),
    attempts: 0
  };
  
  await saveItem(STORES.PENDING_ACTIONS, pendingAction);
}

// Get all pending actions
async function getPendingActions(): Promise<any[]> {
  return getAllItems(STORES.PENDING_ACTIONS);
}

// Remove a pending action after it's been processed
async function removePendingAction(id: number): Promise<void> {
  await deleteItem(STORES.PENDING_ACTIONS, id);
}

// Public API
export const offlineStorage = {
  // Transactions
  saveTransaction: async (transaction: any) => {
    return saveItem(STORES.TRANSACTIONS, transaction);
  },
  
  getTransactions: async () => {
    return getAllItems(STORES.TRANSACTIONS);
  },
  
  getTransactionById: async (id: number) => {
    return getItemById(STORES.TRANSACTIONS, id);
  },
  
  deleteTransaction: async (id: number) => {
    return deleteItem(STORES.TRANSACTIONS, id);
  },
  
  // Invoices
  saveInvoice: async (invoice: any) => {
    return saveItem(STORES.INVOICES, invoice);
  },
  
  getInvoices: async () => {
    return getAllItems(STORES.INVOICES);
  },
  
  getInvoiceById: async (id: number) => {
    return getItemById(STORES.INVOICES, id);
  },
  
  deleteInvoice: async (id: number) => {
    return deleteItem(STORES.INVOICES, id);
  },
  
  // Messages
  saveMessage: async (message: any) => {
    return saveItem(STORES.MESSAGES, message);
  },
  
  getMessages: async () => {
    return getAllItems(STORES.MESSAGES);
  },
  
  getMessageById: async (id: number) => {
    return getItemById(STORES.MESSAGES, id);
  },
  
  deleteMessage: async (id: number) => {
    return deleteItem(STORES.MESSAGES, id);
  },
  
  // Reports
  saveReport: async (report: any) => {
    return saveItem(STORES.REPORTS, report);
  },
  
  getReports: async () => {
    return getAllItems(STORES.REPORTS);
  },
  
  getReportById: async (id: number) => {
    return getItemById(STORES.REPORTS, id);
  },
  
  deleteReport: async (id: number) => {
    return deleteItem(STORES.REPORTS, id);
  },
  
  // Notifications
  saveNotification: async (notification: any) => {
    return saveItem(STORES.NOTIFICATIONS, notification);
  },
  
  getNotifications: async () => {
    return getAllItems(STORES.NOTIFICATIONS);
  },
  
  getNotificationById: async (id: number) => {
    return getItemById(STORES.NOTIFICATIONS, id);
  },
  
  deleteNotification: async (id: number) => {
    return deleteItem(STORES.NOTIFICATIONS, id);
  },
  
  // Pending Actions
  savePendingAction,
  getPendingActions,
  removePendingAction,
  
  // Clear stores
  clearTransactions: async () => {
    return clearStore(STORES.TRANSACTIONS);
  },
  
  clearInvoices: async () => {
    return clearStore(STORES.INVOICES);
  },
  
  clearMessages: async () => {
    return clearStore(STORES.MESSAGES);
  },
  
  clearReports: async () => {
    return clearStore(STORES.REPORTS);
  },
  
  clearNotifications: async () => {
    return clearStore(STORES.NOTIFICATIONS);
  },
  
  clearPendingActions: async () => {
    return clearStore(STORES.PENDING_ACTIONS);
  },
  
  // Clear all data
  clearAll: async () => {
    await clearStore(STORES.TRANSACTIONS);
    await clearStore(STORES.INVOICES);
    await clearStore(STORES.MESSAGES);
    await clearStore(STORES.REPORTS);
    await clearStore(STORES.NOTIFICATIONS);
    await clearStore(STORES.PENDING_ACTIONS);
  }
};