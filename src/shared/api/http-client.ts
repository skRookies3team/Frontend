import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 환경변수에서 API URL 가져오기 (없으면 로컬 기본값)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: 토큰 자동 주입
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && !config.headers['No-Auth']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (config.headers['No-Auth']) {
            delete config.headers['No-Auth'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: 에러 공통 처리
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized: 토큰 만료됨');
            // 필요 시 로그아웃 로직 추가
        }
        return Promise.reject(error);
    }
);

export const httpClient = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        axiosInstance.get<T>(url, config).then((res) => res.data),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        axiosInstance.post<T>(url, data, config).then((res) => res.data),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        axiosInstance.put<T>(url, data, config).then((res) => res.data),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export default httpClient;
