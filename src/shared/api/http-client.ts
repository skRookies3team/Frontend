import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosError } from 'axios';

// 환경변수에서 API URL 가져오기 (없으면 로컬 기본값)
const baseURL = import.meta.env.VITE_API_URL || '/api';

let getTokenFunction: (() => string | null) | null = null;
// [수정] User ID를 가져오는 함수 변수 추가
let getUserIdFunction: (() => string | null) | null = null;

export const setTokenGetter = (fn: () => string | null) => {
    getTokenFunction = fn;
};

// [수정] User ID Getter 설정 함수 추가
export const setUserIdGetter = (fn: () => string | null) => {
    getUserIdFunction = fn;
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
        // [수정] headers 객체 안전성 보장
        if (!config.headers) {
            config.headers = {} as any;
        }

        if (!config.skipAuth) {
            // 토큰 설정
            if (getTokenFunction) {
                const token = getTokenFunction();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            
            // [수정] X-USER-ID 헤더 설정
            if (getUserIdFunction) {
                const userId = getUserIdFunction();
                if (userId) {
                    config.headers['X-USER-ID'] = userId;
                }
            }

            // 로그 출력 (디버깅)
            const tokenLog = config.headers.Authorization 
                ? `Bearer ${String(config.headers.Authorization).substring(7, 17)}...` 
                : 'No Token';
            console.log(`[API Request] ${config.url} | Auth: ${tokenLog} | X-USER-ID: ${config.headers['X-USER-ID']}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // 401 에러 처리 로직 (필요시 주석 해제하여 사용)
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