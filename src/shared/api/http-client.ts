import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

// 환경변수에서 API URL 가져오기 (없으면 로컬 기본값)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// 토큰을 가져오는 함수 (외부에서 주입 가능하도록) - frontsample 패턴
let getTokenFunction: (() => string | null) | null = null;
let removeTokenFunction: (() => void) | null = null;

// 토큰 가져오기 함수 설정 (AuthContext에서 호출)
export const setTokenGetter = (fn: () => string | null) => {
    getTokenFunction = fn;
};

// 토큰 삭제 함수 설정 (AuthContext에서 호출)
export const setTokenRemover = (fn: () => void) => {
    removeTokenFunction = fn;
};

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터 - frontsample 패턴 참고
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
        // skipAuth가 true가 아닌 경우에만 토큰 추가
        if (!config.skipAuth) {
            // Context API에서 토큰 가져오기 (메모리 저장)
            if (getTokenFunction) {
                const token = getTokenFunction();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }

        console.log('요청 전:', config.url);
        return config;
    },
    (error) => {
        console.error('요청 에러:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - frontsample 패턴 참고
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('응답 성공:', response.config.url);
        return response;
    },
    (error) => {
        console.error('응답 에러:', error);

        // 401 에러 시 토큰 삭제
        if (error.response?.status === 401) {
            if (removeTokenFunction) {
                removeTokenFunction();
            }
        }

        return Promise.reject(error);
    }
);

// HTTP 클라이언트 객체
export const httpClient = {
    get: <T>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.get<T>(url, config).then((res) => res.data),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.post<T>(url, data, config).then((res) => res.data),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.put<T>(url, data, config).then((res) => res.data),
    delete: <T>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
        axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export default httpClient;
