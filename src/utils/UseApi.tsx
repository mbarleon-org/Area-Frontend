import axios, { type AxiosRequestConfig } from "axios";
import { useCookies } from "react-cookie";
import { useCallback, useMemo } from "react";

function detectBaseURL(): string {
    // Priority:
    // 1. Vite (import.meta.env.VITE_API_URL)
    // 2. Expo / CRA style env vars (EXPO_PUBLIC_API_URL | REACT_APP_API_URL)
    // 3. Fallback to '/api' (assumes dev server proxy)
    try {
        // vite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vite = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_URL : undefined) as string | undefined;
        if (vite) return vite;
    } catch (e) {
        // ignore
    }

    const procEnv = typeof process !== 'undefined' && (process as any).env ? (process as any).env : {};
    const expo = procEnv.BACKEND_URL || procEnv.REACT_APP_API_URL || procEnv.VITE_API_URL;
    if (expo) {
        console.log('expo', expo);
        if (expo.endsWith('/api') || expo.endsWith('/api/')) {
            return expo;
        }
        return expo + '/api';
    }

    return '/api';
}

export function useApi() {
    const [cookies] = useCookies(['token']);
    const token = cookies?.token;

    const baseURL = useMemo(() => detectBaseURL(), []);

    const api = useMemo(() => {
        return axios.create({
            baseURL,
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
    }, [baseURL, token]);

    // helper to guard against HTML responses (index.html) being returned instead of JSON
    const guardHtml = (res: any) => {
        const contentType = (res && res.headers && res.headers['content-type']) || '';
        if (typeof contentType === 'string' && contentType.includes('text/html')) {
            const err = new Error('API returned HTML – check proxy / baseURL');
            // attach response for debugging
            (err as any).response = res;
            throw err;
        }
        return res;
    };

    const get = useCallback(
        async (url: string, config?: AxiosRequestConfig) => api.get(url, config).then(guardHtml).then((res: any) => res.data), [api]
    );

    const post = useCallback(
        async (url: string, payload: any, config?: AxiosRequestConfig) => api.post(url, payload, config).then(guardHtml).then((res: any) => res.data), [api]
    );

    const put = useCallback(
        async (url: string, payload: any) => api.put(url, payload).then(guardHtml).then((res: any) => res.data), [api]
    );

    const del = useCallback(
        async (url: string) => api.delete(url).then(guardHtml).then((res: any) => res.data), [api]
    );

    return { get, post, put, del, api, baseURL };
}
