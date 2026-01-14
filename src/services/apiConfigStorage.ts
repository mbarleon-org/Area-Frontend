import { isWeb } from '../utils/IsWeb';

const STORAGE_KEY = 'AREA_API_BASE_URL';
const DEFAULT_URL = '';

// Lazy-load AsyncStorage for React Native
let AsyncStorage: any = null;
if (!isWeb) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    // Fallback if AsyncStorage is not available
    console.warn('AsyncStorage not available, using in-memory fallback');
  }
}

/**
 * Save the API base URL to persistent storage
 */
export const saveApiBaseUrl = async (url: string): Promise<void> => {
  const normalizedUrl = normalizeUrl(url);

  if (isWeb) {
    try {
      localStorage.setItem(STORAGE_KEY, normalizedUrl);
    } catch (error) {
      console.error('Failed to save API URL to localStorage:', error);
    }
  } else if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, normalizedUrl);
    } catch (error) {
      console.error('Failed to save API URL to AsyncStorage:', error);
    }
  }
};

/**
 * Load the API base URL from persistent storage
 */
export const loadApiBaseUrl = async (): Promise<string> => {
  if (isWeb) {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
    } catch (error) {
      console.error('Failed to load API URL from localStorage:', error);
      return DEFAULT_URL;
    }
  } else if (AsyncStorage) {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      return value || DEFAULT_URL;
    } catch (error) {
      console.error('Failed to load API URL from AsyncStorage:', error);
      return DEFAULT_URL;
    }
  }
  return DEFAULT_URL;
};

/**
 * Clear the stored API base URL
 */
export const clearApiBaseUrl = async (): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear API URL from localStorage:', error);
    }
  } else if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear API URL from AsyncStorage:', error);
    }
  }
};

/**
 * Normalize a URL: ensure proper format with protocol
 */
export const normalizeUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';

  let normalized = url.trim();

  // Remove trailing slashes
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // Add protocol if missing
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `http://${normalized}`;
  }

  return normalized;
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { valid: true }; // Empty is valid (will use env by default)
  }

  const normalized = normalizeUrl(url);

  try {
    const parsed = new URL(normalized);

    // Check for valid protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https protocol' };
    }

    // Check for valid hostname
    if (!parsed.hostname) {
      return { valid: false, error: 'URL must have a valid hostname' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Get the full API endpoint URL
 */
export const getApiEndpoint = (baseUrl: string): string => {
  if (!baseUrl || baseUrl.trim() === '') {
    return '/api';
  }

  let endpoint = normalizeUrl(baseUrl);

  // Append /api if not already present
  if (!endpoint.endsWith('/api')) {
    endpoint = `${endpoint}/api`;
  }

  return endpoint;
};
