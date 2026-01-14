import axios, { type AxiosRequestConfig } from "axios";
import { useCallback, useMemo } from "react";
import { useToken } from "../hooks/useToken";
import { useApiConfig } from "../contexts/ApiConfigContext";

export function useApi() {
    const { token } = useToken();
    const { apiEndpoint } = useApiConfig();

    // Use the dynamic apiEndpoint from context (includes /api suffix)
    const baseURL = useMemo(() => apiEndpoint, [apiEndpoint]);

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
