import axios, { type AxiosRequestConfig } from "axios";
import { useCookies } from "react-cookie";
import { useCallback, useMemo } from "react";

export function useApi() {
    const [cookies] = useCookies(['token']);
    const token = cookies.token;

    const api = useMemo(() => {
        return axios.create({
            baseURL: "/api",
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
    }, [token]);

    const get = useCallback(
        async (url: string, config?: AxiosRequestConfig) => api.get(url, config).then(res => res.data), [api]
    );

    const post = useCallback(
        async (url: string, payload: any) => api.post(url, payload).then(res => res.data), [api]
    );

    const put = useCallback(
        async (url: string, payload: any) => api.put(url, payload).then(res => res.data), [api]
    );

    const del = useCallback(
        async (url: string) => api.delete(url).then(res => res.data), [api]
    );

    return { get, post, put, del, api };
}
