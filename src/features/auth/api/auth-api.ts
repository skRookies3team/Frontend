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

// 펫 정보 타입
export interface GetPetDto {
    petId: number;
    petName: string;
    species: 'DOG' | 'CAT';
    breed: string;
    genderType: 'MALE' | 'FEMALE';
    is_neutered: boolean;
    profileImage: string;
    age: number;
    birth: string; // LocalDate as string (YYYY-MM-DD)
    status: string;
    vaccinated: boolean;
}

// 사용자 정보 조회 응답 타입
export interface GetUserDto {
    username: string; // 사용자 이름(닉네임)
    genderType: 'MALE' | 'FEMALE';
    profileImage: string;
    social: string; // 소셜
    statusMessage: string;
    age: number;
    birth: string; // LocalDate as string (YYYY-MM-DD)
    currentLat: number;
    currentLng: number;
    petCoin: number;
    pets: GetPetDto[];
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

// 사용자 정보 조회 (ID로 조회)
export const getUserApi = async (userId: number): Promise<GetUserDto> => {
    const response = await httpClient.get<GetUserDto>(`/users/${userId}`);
    return response;
};

// Google 로그인
export const googleLoginApi = async (idToken: string): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>('/users/google', {
        idToken
    }, { skipAuth: true });
    return response;
};

// 프로필 수정 요청 DTO
export interface UpdateProfileRequestDto {
    username: string; // 이름
    social: string;   // 사용자 이름
}

// 프로필 수정 응답 DTO
export interface UpdateProfileResponseDto {
    username: string;
    profileImage: string;
    social: string;
}

// 프로필 수정 API
export const updateProfileApi = async (userId: number, request: UpdateProfileRequestDto, userProfile: File | null): Promise<UpdateProfileResponseDto> => {
    const formData = new FormData();

    if (userProfile) {
        formData.append("userProfile", userProfile);
    }

    formData.append("request", new Blob([JSON.stringify(request)], {
        type: "application/json"
    }));

    const response = await httpClient.patch<UpdateProfileResponseDto>(`/users/me`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response;
};

