import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { StorageAdapter } from '@splitcheck/core';

const nativeStorageAdapter: StorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const webStorageAdapter: StorageAdapter = {
  getItem: async (key) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  setItem: async (key, value) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  },
};

export const secureStorageAdapter: StorageAdapter = Platform.OS === 'web' ? webStorageAdapter : nativeStorageAdapter;
