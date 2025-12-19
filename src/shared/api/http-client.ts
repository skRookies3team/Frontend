import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosError } from 'axios';


// 환경변수에서 API URL 가져오기 (없으면 로컬 기본값)
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};
const BASE_URL = getBaseUrl();

let getTokenFunction: (() => string | null) | null = null;
let removeTokenFunction: (() => void) | null = null;

export const setTokenGetter = (fn: () => string | null) => {
    getTokenFunction = fn;
};

export const setTokenRemover = (fn: () => void) => {
    removeTokenFunction = fn;
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

// import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

// // 환경변수에서 API URL 가져오기 (없으면 로컬 기본값)
// const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // 토큰을 가져오는 함수 (외부에서 주입 가능하도록) - frontsample 패턴
// let getTokenFunction: (() => string | null) | null = null;
// // let removeTokenFunction: (() => void) | null = null; // 사용되지 않음 (주석 처리됨)

// // 토큰 가져오기 함수 설정 (AuthContext에서 호출)
// export const setTokenGetter = (fn: () => string | null) => {
//     getTokenFunction = fn;
// };

// // 토큰 삭제 함수 설정 (AuthContext에서 호출)
// export const setTokenRemover = (_fn: () => void) => {
//     // removeTokenFunction = fn;
// };

// /*
// // 토큰 갱신 중인지 확인하는 플래그
// let isRefreshing = false;
// // 갱신 동안 대기 중인 요청들을 담을 배열
// let failedQueue: { resolve: (token: string | null) => void; reject: (error: any) => void }[] = [];

// const processQueue = (error: any, token: string | null = null) => {
//     failedQueue.forEach(prom => {
//         if (error) {
//             prom.reject(error);
//         } else {
//             prom.resolve(token);
//         }
//     });
//     failedQueue = [];
// };
// */

// // Axios 인스턴스 생성
// const axiosInstance: AxiosInstance = axios.create({
//     baseURL,
//     timeout: 10000,
//     headers: { 'Content-Type': 'application/json' },
// });

// // 요청 인터셉터 - frontsample 패턴 참고
// axiosInstance.interceptors.request.use(
//     (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
//         // skipAuth가 true가 아닌 경우에만 토큰 추가
//         if (!config.skipAuth) {
//             // Context API에서 토큰 가져오기 (메모리 저장)
//             if (getTokenFunction) {
//                 const token = getTokenFunction();
//                 if (token) {
//                     config.headers.Authorization = `Bearer ${token}`;
//                 }
//             }
//         }

//         console.log('요청 전:', config.url);
//         return config;
//     },
//     (error) => {
//         console.error('요청 에러:', error);
//         return Promise.reject(error);
//     }
// );

// /* 응답 인터셉터 - 토큰 자동 갱신(Refresh) 로직 추가
// axiosInstance.interceptors.response.use(
//     (response) => {
//         console.log('응답 성공:', response.config.url);
//         return response;
//     },
//     async (error: AxiosError) => {
//         const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; skipAuth?: boolean };

//         // 401 에러이고, 아직 재시도하지 않은 요청이라면
//         if (error.response?.status === 401 && !originalRequest._retry) {

//             // 이미 갱신 중이라면 큐에 넣고 대기
//             if (isRefreshing) {
//                 return new Promise<string | null>((resolve, reject) => {
//                     failedQueue.push({ resolve, reject });
//                 })
//                     .then((token) => {
//                         if (token) {
//                             originalRequest.headers.Authorization = `Bearer ${token}`;
//                         }
//                         return axiosInstance(originalRequest);
//                     })
//                     .catch((err) => Promise.reject(err));
//             }

//             originalRequest._retry = true;
//             isRefreshing = true;

//             try {
//                 // 1. 로컬 스토리지에서 리프레시 토큰 가져오기
//                 const refreshToken = localStorage.getItem('petlog_refresh_token');

//                 if (!refreshToken) {
//                     throw new Error('No refresh token');
//                 }

//                 // 2. 재발급 API 호출 (주의: 이 요청은 httpClient가 아닌 쌩 axios로 보내야 루프 안 돔)
//                 const { data } = await axios.post(`${baseURL}/auth/reissue`, {
//                     refreshToken: refreshToken
//                 });

//                 const newAccessToken = data.data.accessToken;

//                 // 3. 새 토큰 저장
//                 localStorage.setItem('petlog_token', newAccessToken);

//                 // 4. axios 기본 헤더 업데이트
//                 axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

//                 // 5. 대기 중이던 요청들 처리
//                 processQueue(null, newAccessToken);

//                 // 6. 현재 요청 재시도
//                 originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//                 return axiosInstance(originalRequest);

//             } catch (err) {
//                 // 갱신 실패 시 로그아웃
//                 processQueue(err, null);
//                 localStorage.removeItem('petlog_token');
//                 localStorage.removeItem('petlog_refresh_token');
//                 if (removeTokenFunction) removeTokenFunction();
//                 window.location.href = '/login';
//                 return Promise.reject(err);
//             } finally {
//                 isRefreshing = false;
//             }
//         }
        

//         return Promise.reject(error);
//     }
// );*/

// // HTTP 클라이언트 객체
// export const httpClient = {
//     get: <T>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
//         axiosInstance.get<T>(url, config).then((res) => res.data),
//     post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
//         axiosInstance.post<T>(url, data, config).then((res) => res.data),
//     put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
//         axiosInstance.put<T>(url, data, config).then((res) => res.data),
//     delete: <T>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
//         axiosInstance.delete<T>(url, config).then((res) => res.data),
// };

// export default httpClient;
