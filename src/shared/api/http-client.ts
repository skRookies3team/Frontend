import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosError,
} from "axios";

// 환경변수에서 API URL 가져오기 (없으면 로컬 기본값)
const baseURL = import.meta.env.VITE_API_URL || "/api";

let getTokenFunction: (() => string | null) | null = null;
let getUserIdFunction: (() => string | null) | null = null;

// [기존 유지] 외부에서 함수 주입
export const setTokenGetter = (fn: () => string | null) => {
  getTokenFunction = fn;
};

export const setUserIdGetter = (fn: () => string | null) => {
  getUserIdFunction = fn;
};

export const setTokenRemover = (_fn: () => void) => {
  // removeTokenFunction = fn;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
    if (!config.headers) {
      config.headers = {} as any;
    }

    if (!config.skipAuth) {
      // [수정] 1. 토큰 설정 로직 강화 (함수 -> 로컬스토리지 순서)
      let token: string | null = null;

      // 1-1. 주입된 함수가 있으면 시도
      if (getTokenFunction) {
        token = getTokenFunction();
      }

      // 1-2. 함수가 없거나 토큰을 못 찾았으면 localStorage 직접 확인 (새로고침 직후 대비)
      // [수정] petlog_token을 우선 확인 (auth-context.tsx에서 petlog_token으로 저장함)
      if (!token) {
        token =
          localStorage.getItem("petlog_token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // [수정] 2. User ID 설정 로직 강화
      let userId: string | null = null;

      if (getUserIdFunction) {
        userId = getUserIdFunction();
      }

      // 함수 실패 시 localStorage 확인
      if (!userId) {
        userId = localStorage.getItem("userId");
      }

      if (userId) {
        config.headers["X-USER-ID"] = userId;
      }

      // 로그 출력 (디버깅)
      const tokenLog = config.headers.Authorization
        ? `Bearer ${String(config.headers.Authorization).substring(7, 17)}...`
        : "No Token";

      // 개발 환경에서만 로그 출력 권장 (선택사항)
      console.log(
        `[API Request] ${config.url} | Auth: ${tokenLog} | X-USER-ID: ${
          config.headers["X-USER-ID"] || "None"
        }`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 에러 로그 강화
    if (error.response) {
      console.error(
        `[API Error] ${error.response.status} ${error.config?.url}`,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

export const httpClient = {
  get: <T>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean }) =>
    axiosInstance.get<T>(url, config).then((res) => res.data),
  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { skipAuth?: boolean }
  ) => axiosInstance.post<T>(url, data, config).then((res) => res.data),
  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { skipAuth?: boolean }
  ) => axiosInstance.put<T>(url, data, config).then((res) => res.data),
  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { skipAuth?: boolean }
  ) => axiosInstance.patch<T>(url, data, config).then((res) => res.data),
  delete: <T>(
    url: string,
    config?: AxiosRequestConfig & { skipAuth?: boolean }
  ) => axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export default httpClient;
