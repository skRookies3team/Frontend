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

    const response = await httpClient.post<LoginResponse>('/users/login', {
        email,
        password
    }, { skipAuth: true });
    return response;
};

// 회원가입 (토큰 불필요 - 공개 API)
export const signupApi = async (
    userProfile: File | null,
    petProfile: File | null,
    request: { user: any; pet: any }
): Promise<SignupResponse> => {
    const formData = new FormData();

    // Add user profile if provided
    if (userProfile) {
        formData.append('userProfile', userProfile);
    }

    // Add pet profile if provided
    if (petProfile) {
        formData.append('petProfile', petProfile);
    }

    // Add request DTO as JSON blob
    formData.append('request', new Blob([JSON.stringify(request)], {
        type: 'application/json'
    }));

    const response = await httpClient.post<SignupResponse>('/users/signup', formData, {
        skipAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

// 로그아웃
export const logoutApi = async (): Promise<void> => {
    await httpClient.post('/users/logout');
};

// 현재 사용자 정보 조회 (토큰 필요)
export const getCurrentUserApi = async () => {
    const response = await httpClient.get('/users/me');
    return response;
};

// Google 로그인
export const googleLoginApi = async (idToken: string): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>('/users/google', {
        idToken
    }, { skipAuth: true });
    return response;
};
