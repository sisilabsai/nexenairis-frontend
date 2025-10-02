'use client';

interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

interface CachedData {
  [key: string]: {
    data: any;
    timestamp: number;
    expiry: number;
  };
}

class OfflineManager {
  private dbName = 'nexen-offline-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline operations
        if (!db.objectStoreNames.contains('operations')) {
          const operationsStore = db.createObjectStore('operations', { keyPath: 'id' });
          operationsStore.createIndex('status', 'status');
          operationsStore.createIndex('entity', 'entity');
        }

        // Store for cached data
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp');
        }

        // Store for inventory items
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
          inventoryStore.createIndex('sku', 'sku');
          inventoryStore.createIndex('category', 'category');
        }

        // Store for scan results
        if (!db.objectStoreNames.contains('scans')) {
          const scansStore = db.createObjectStore('scans', { keyPath: 'id' });
          scansStore.createIndex('timestamp', 'timestamp');
          scansStore.createIndex('synced', 'synced');
        }
      };
    });
  }

  // Cache management
  async cacheData(key: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    await store.put({
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  // Offline operations
  async queueOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullOperation: OfflineOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    const transaction = this.db.transaction(['operations'], 'readwrite');
    const store = transaction.objectStore('operations');
    await store.put(fullOperation);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncOperations();
    }

    return id;
  }

  async getPendingOperations(): Promise<OfflineOperation[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['operations'], 'readonly');
    const store = transaction.objectStore('operations');
    const index = store.index('status');
    
    return new Promise((resolve) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async syncOperations(): Promise<void> {
    const operations = await this.getPendingOperations();
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        await this.markOperationCompleted(operation.id);
      } catch (error) {
        await this.markOperationFailed(operation.id);
        console.error('Failed to sync operation:', operation.id, error);
      }
    }
  }

  private async executeOperation(operation: OfflineOperation): Promise<void> {
    const baseUrl = 'https://nexenairis.com/api';
    let url = `${baseUrl}/${operation.entity}`;
    let method = 'POST';

    switch (operation.type) {
      case 'CREATE':
        method = 'POST';
        break;
      case 'UPDATE':
        method = 'PUT';
        url += `/${operation.data.id}`;
        break;
      case 'DELETE':
        method = 'DELETE';
        url += `/${operation.data.id}`;
        break;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: operation.type !== 'DELETE' ? JSON.stringify(operation.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async markOperationCompleted(id: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['operations'], 'readwrite');
    const store = transaction.objectStore('operations');
    
    const operation = await this.getOperation(id);
    if (operation) {
      operation.status = 'completed';
      await store.put(operation);
    }
  }

  private async markOperationFailed(id: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['operations'], 'readwrite');
    const store = transaction.objectStore('operations');
    
    const operation = await this.getOperation(id);
    if (operation) {
      operation.status = 'failed';
      operation.retryCount++;
      await store.put(operation);
    }
  }

  private async getOperation(id: string): Promise<OfflineOperation | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['operations'], 'readonly');
    const store = transaction.objectStore('operations');
    
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  // Inventory specific methods
  async cacheInventoryItem(item: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['inventory'], 'readwrite');
    const store = transaction.objectStore('inventory');
    await store.put(item);
  }

  async getCachedInventoryItem(id: string): Promise<any | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['inventory'], 'readonly');
    const store = transaction.objectStore('inventory');
    
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async searchCachedInventory(query: string): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['inventory'], 'readonly');
    const store = transaction.objectStore('inventory');
    
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        const filtered = items.filter(item => 
          item.name?.toLowerCase().includes(query.toLowerCase()) ||
          item.sku?.toLowerCase().includes(query.toLowerCase()) ||
          item.barcode?.includes(query)
        );
        resolve(filtered);
      };
      request.onerror = () => resolve([]);
    });
  }

  // Scan results
  async saveScanResult(scanData: any): Promise<void> {
    if (!this.db) return;

    const scan = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...scanData,
      timestamp: Date.now(),
      synced: navigator.onLine
    };

    const transaction = this.db.transaction(['scans'], 'readwrite');
    const store = transaction.objectStore('scans');
    await store.put(scan);

    // Queue for sync if offline
    if (!navigator.onLine) {
      await this.queueOperation({
        type: 'CREATE',
        entity: 'scans',
        data: scan
      });
    }
  }

  async getUnsyncedScans(): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['scans'], 'readonly');
    const store = transaction.objectStore('scans');
    
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const scans = request.result || [];
        const unsynced = scans.filter(scan => !scan.synced);
        resolve(unsynced);
      };
      request.onerror = () => resolve([]);
    });
  }

  // Cleanup expired cache
  async cleanupExpiredCache(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    const index = store.index('timestamp');
    
    const now = Date.now();
    const request = index.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const data = cursor.value;
        if (data.expiry < now) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}

// Singleton instance
const offlineManager = new OfflineManager();

// Initialize on load
if (typeof window !== 'undefined') {
  offlineManager.init().catch(console.error);
  
  // Cleanup expired cache every hour
  setInterval(() => {
    offlineManager.cleanupExpiredCache();
  }, 3600000);

  // Sync when coming back online
  window.addEventListener('online', () => {
    offlineManager.syncOperations();
  });
}

export default offlineManager;