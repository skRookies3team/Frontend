import httpClient from '@/shared/api/http-client';

// 로그인 응답 타입
interface LoginResponse {
    token: string;
    userId: number;
    role: string;
    email: string;
    username: string; // 사용자 이름 (Name)
    social: string;   // 소셜 ID/핸들 (Username)
}

// 회원가입 응답 타입
interface SignupResponse {
    message: string;
    user?: {
        id: string;
        email: string;
    };
}

// 로그인 (토큰 불필요 - 공개 API)
export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
    // URL 하드코딩 (8000 포트)
    const response = await httpClient.post<LoginResponse>('http://localhost:8000/api/users/login', {
        email,
        password
    }, { skipAuth: true });
    return response;
};

// 회원가입 (토큰 불필요 - 공개 API)
export const signupApi = async (email: string, password: string, name?: string): Promise<SignupResponse> => {
    const response = await httpClient.post<SignupResponse>('/auth/signup', {
        email,
        password,
        name
    }, { skipAuth: true });
    return response;
};

// 로그아웃
export const logoutApi = async (): Promise<void> => {
    await httpClient.post('/auth/logout');
};

// 현재 사용자 정보 조회 (토큰 필요)
export const getCurrentUserApi = async () => {
    const response = await httpClient.get('/auth/me');
    return response;
};

// Google 로그인
export const googleLoginApi = async (idToken: string): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>('/auth/google', {
        idToken
    }, { skipAuth: true });
    return response;
};
