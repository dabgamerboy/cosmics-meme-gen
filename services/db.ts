import { Meme } from '../types';

const DB_NAME = 'CosmicMemeDB';
const DB_VERSION = 1;
const STORE_NAME = 'memes';

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('title', 'title', { unique: false });
      }
    };
  });
};

export const dbService = {
  async saveMeme(meme: Meme): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(meme);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async updateMeme(meme: Meme): Promise<void> {
    return this.saveMeme(meme);
  },

  async getAllMemes(): Promise<Meme[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      // Get all
      const request = index.getAll();
      
      request.onsuccess = () => {
        // Reverse to show newest first
        resolve(request.result.reverse());
      };
      request.onerror = () => reject(request.error);
    });
  },

  async deleteMeme(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async searchMemes(query: string): Promise<Meme[]> {
    const lowerQuery = query.toLowerCase();
    const allMemes = await this.getAllMemes();

    return allMemes.filter(meme => 
      meme.title.toLowerCase().includes(lowerQuery) || 
      meme.prompt.toLowerCase().includes(lowerQuery) ||
      (meme.description && meme.description.toLowerCase().includes(lowerQuery))
    );
  }
};