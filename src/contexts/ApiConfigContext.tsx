import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  loadApiBaseUrl,
  saveApiBaseUrl,
  clearApiBaseUrl,
  validateUrl,
  getApiEndpoint,
  normalizeUrl,
} from '../services/apiConfigStorage';

interface ApiConfigContextType {
  baseUrl: string;
  apiEndpoint: string;
  isLoading: boolean;
  isConfigured: boolean;
  setBaseUrl: (url: string) => Promise<{ success: boolean; error?: string }>;
  resetBaseUrl: () => Promise<void>;
  validateBaseUrl: (url: string) => { valid: boolean; error?: string };
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

/**
 * Detect the default base URL from environment variables
 */
function detectDefaultBaseURL(): string {
  const viteEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' && (process as any).env ? (process as any).env : {};
  const runtimeEnv = typeof globalThis !== 'undefined' && (globalThis as any).RUNTIME_CONFIG ? (globalThis as any).RUNTIME_CONFIG : {};

  const envUrl = runtimeEnv.BACKEND_URL || viteEnv.VITE_BACKEND_URL || procEnv.EXPO_PUBLIC_BACKEND_URL;

  if (envUrl) {
    let url = envUrl;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    if (url.endsWith('/api')) {
      return url.slice(0, -4); // Remove /api suffix to get base URL
    }
    return url;
  }

  return '';
}

interface ApiConfigProviderProps {
  children: ReactNode;
}

export const ApiConfigProvider: React.FC<ApiConfigProviderProps> = ({ children }) => {
  const [baseUrl, setBaseUrlState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const defaultUrl = useMemo(() => detectDefaultBaseURL(), []);

  // Load stored URL on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const storedUrl = await loadApiBaseUrl();
        if (mounted) {
          // Use stored URL if available, otherwise use default from env
          setBaseUrlState(storedUrl || defaultUrl);
        }
      } catch (error) {
        console.error('Failed to load API base URL:', error);
        if (mounted) {
          setBaseUrlState(defaultUrl);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [defaultUrl]);

  const setBaseUrl = useCallback(async (url: string): Promise<{ success: boolean; error?: string }> => {
    const validation = validateUrl(url);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const normalizedUrl = normalizeUrl(url);
      await saveApiBaseUrl(normalizedUrl);
      setBaseUrlState(normalizedUrl);
      return { success: true };
    } catch (error) {
      console.error('Failed to save API base URL:', error);
      return { success: false, error: 'Failed to save URL' };
    }
  }, []);

  const resetBaseUrl = useCallback(async () => {
    try {
      await clearApiBaseUrl();
      setBaseUrlState(defaultUrl);
    } catch (error) {
      console.error('Failed to reset API base URL:', error);
    }
  }, [defaultUrl]);

  const validateBaseUrl = useCallback((url: string) => {
    return validateUrl(url);
  }, []);

  // Compute the full API endpoint
  const apiEndpoint = useMemo(() => {
    return getApiEndpoint(baseUrl);
  }, [baseUrl]);

  const isConfigured = useMemo(() => {
    return baseUrl.trim() !== '';
  }, [baseUrl]);

  const contextValue = useMemo<ApiConfigContextType>(() => ({
    baseUrl,
    apiEndpoint,
    isLoading,
    isConfigured,
    setBaseUrl,
    resetBaseUrl,
    validateBaseUrl,
  }), [baseUrl, apiEndpoint, isLoading, isConfigured, setBaseUrl, resetBaseUrl, validateBaseUrl]);

  return (
    <ApiConfigContext.Provider value={contextValue}>
      {children}
    </ApiConfigContext.Provider>
  );
};

/**
 * Hook to access the API configuration context
 */
export const useApiConfig = (): ApiConfigContextType => {
  const context = useContext(ApiConfigContext);

  if (context === undefined) {
    throw new Error('useApiConfig must be used within an ApiConfigProvider');
  }

  return context;
};

export const getCurrentApiEndpoint = async (): Promise<string> => {
  const storedUrl = await loadApiBaseUrl();

  if (storedUrl) {
    return getApiEndpoint(storedUrl);
  }

  const defaultUrl = detectDefaultBaseURL();
  return getApiEndpoint(defaultUrl);
};
