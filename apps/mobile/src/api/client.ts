import { File, UploadType } from 'expo-file-system';
import { ApiClient } from '@splitcheck/core';
import { secureStorageAdapter } from './storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = new ApiClient(API_URL, secureStorageAdapter);

// Neither RN's classic `{ uri, name, type }` FormData shorthand nor Expo's
// fetch()-based Blob construction from a local file work reliably here, so
// file uploads go through expo-file-system's native multipart upload task
// instead of fetch/FormData.
async function doUpload<T>(path: string, uri: string, mimeType: string): Promise<{ status: number; payload: unknown }> {
  const tokens = await api.getTokens();
  const file = new File(uri);
  const task = file.createUploadTask(`${API_URL}${path}`, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType,
    headers: tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {},
  });

  const result = await task.uploadAsync();
  if (!result) throw new Error('Upload was cancelled');

  let payload: unknown;
  try {
    payload = JSON.parse(result.body);
  } catch {
    payload = undefined;
  }

  return { status: result.status, payload };
}

export async function uploadFile<T>(path: string, uri: string, mimeType: string): Promise<T> {
  let { status, payload } = await doUpload<T>(path, uri, mimeType);

  if (status === 401) {
    const refreshed = await api.refreshAccessToken();
    if (refreshed) {
      ({ status, payload } = await doUpload<T>(path, uri, mimeType));
    }
  }

  if (status < 200 || status >= 300) {
    throw new Error((payload as { message?: string })?.message ?? 'Upload failed');
  }

  return payload as T;
}
