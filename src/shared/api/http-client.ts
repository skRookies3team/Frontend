import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosError } from 'axios';


// 환경변수에서 API URL 가져오기 (없으면 로컬 기본값)
const baseURL = import.meta.env.VITE_API_URL || '/api';

let getTokenFunction: (() => string | null) | null = null;
// let removeTokenFunction: (() => void) | null = null;

export const setTokenGetter = (fn: () => string | null) => {
    getTokenFunction = fn;
};

export const setTokenRemover = (_fn: () => void) => {
    // removeTokenFunction = fn;
};

const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
        if (!config.skipAuth && getTokenFunction) {
            const token = getTokenFunction();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // 401 에러가 나도 로그인 페이지로 튕기지 않도록 수정
        // 회원 서비스 연동 전까지는 에러를 그냥 던져서 컴포넌트나 API 함수에서 처리하게 함

        /* // 기존: 401 발생 시 로그인 페이지 이동 (현재는 주석 처리)
        if (error.response?.status === 401) {
            if (removeTokenFunction) removeTokenFunction();
            // window.location.href = '/login'; // 🚫 이 부분을 막아야 함
        }
        */

        return Promise.reject(error);
    }
);

export const httpClient = {
    get: <T>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.get<T>(url, config).then((res) => res.data),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.post<T>(url, data, config).then((res) => res.data),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.put<T>(url, data, config).then((res) => res.data),
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.patch<T>(url, data, config).then((res) => res.data),
    delete: <T>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export default httpClient;
