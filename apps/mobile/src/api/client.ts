import { ApiClient } from '@splitcheck/core';
import { secureStorageAdapter } from './storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = new ApiClient(API_URL, secureStorageAdapter);
