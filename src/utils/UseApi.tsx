import axios, { type AxiosRequestConfig } from "axios";
import { useCookies } from "react-cookie";
import { useCallback, useMemo } from "react";

function detectBaseURL(): string {
    const viteEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
    const procEnv = typeof process !== 'undefined' && (process as any).env ? (process as any).env : {};

    let expo = viteEnv.VITE_BACKEND_URL || procEnv.EXPO_PUBLIC_BACKEND_URL;
    if (expo) {
        if (expo.endsWith('/')) {
            expo = expo.slice(0, -1);
        }
        if (expo.endsWith('/api')) {
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

    const guardHtml = (res: any) => {
        const contentType = (res && res.headers && res.headers['content-type']) || '';
        if (typeof contentType === 'string' && contentType.includes('text/html')) {
            const err = new Error('API returned HTML – check proxy / baseURL');
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
