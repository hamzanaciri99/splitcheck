import { ApiClient } from '@splitcheck/core';
import { localStorageAdapter } from './storage';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const api = new ApiClient(API_URL, localStorageAdapter);
