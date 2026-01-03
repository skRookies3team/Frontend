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
    species: 'DOG' | 'CAT' | 'RABBIT' | 'HAMSTER' | 'BIRD' | 'GUINEAPIG' | 'REPTILE' | 'FISH' | 'ETC';
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
    // console.log("signupApi start");
    // console.log(userProfile);
    if (userProfile) {
        // console.log("userProfile append");
        formData.append('userProfile', userProfile);
    }

    // Add pet profile if provided
    // console.log(petProfile);
    if (petProfile) {
        // console.log("petProfile append");
        formData.append('petProfile', petProfile);
    }

    // console.log(request);

    // console.log("///////////////////////////");

    // Add request DTO as JSON blob
    formData.append('request', new Blob([JSON.stringify(request)], {
        type: 'application/json'
    }));

    // console.log("=== FormData entries ===");
    // for (const [key, value] of formData.entries()) {
    //     console.log(key, value);
    // }


    // console.log(formData)
    // alert(formData);


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
export const updateProfileApi = async (request: UpdateProfileRequestDto, userProfile: File | null): Promise<UpdateProfileResponseDto> => {
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

// 코인 정보 DTO
export interface UserCoinDto {
    userId: number;
    petCoin: number;
}

// 코인 수량 조회 API
export const getUserCoinApi = async (userId: number): Promise<UserCoinDto> => {
    const response = await httpClient.get<UserCoinDto>(`/users/${userId}/coin`);
    return response;
};

// 동물 사진 분석 응답 DTO
export interface AnalyzeAnimalDto {
    species: 'CAT' | 'DOG' | 'RABBIT' | 'HAMSTER' | 'BIRD' | 'GUINEAPIG' | 'REPTILE' | 'FISH' | 'ETC';
    breed: string;
}

// 동물 사진 분석 API
export const analyzeAnimalApi = async (photo: File): Promise<AnalyzeAnimalDto> => {
    const formData = new FormData();
    formData.append("photo", photo);

    const response = await httpClient.post<AnalyzeAnimalDto>('/users/ai', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};


// 사진 보관함 DTO
export interface CreateArchiveDto {
    archiveId: number;
    url: string;
    uploadTime: string; // LocalDateTime string
}

export interface CreateArchiveDtoList {
    archives: CreateArchiveDto[];
}

// 사진 보관함 저장 API
export const createArchiveApi = async (images: File[]): Promise<CreateArchiveDtoList> => {
    const formData = new FormData();
    images.forEach((image) => {
        formData.append("images", image);
    });

    const response = await httpClient.post<CreateArchiveDtoList>('/archives', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

// 내 모든 사진 조회 API
export const getAllArchivesApi = async (): Promise<CreateArchiveDtoList> => {
    const response = await httpClient.get<CreateArchiveDtoList>('/archives/me');
    return response;
};


// 알람 DTO
export interface GetNotificationDto {
    notificationId: number;
    userNotificationId: number;
    senderId: number;
    receiverId: number;
    content: string;
    title: string;
    time: string; // LocalDateTime string
    targetId: number;
    isRead?: boolean; // May be serialized as 'read' by some libraries
    read?: boolean;   // Standard Jackson serialization for boolean isRead
    alarmType: 'FOLLOW' | 'LIKE' | 'MATCH' | 'COMMENT' | 'DIARY' | 'RECAP' | 'COIN';
}

export interface GetNotificationListDto {
    isEmpty: boolean;
    notifications: GetNotificationDto[];
}

// 알람 조회 API
export const getNotificationsApi = async (): Promise<GetNotificationListDto> => {
    return await httpClient.get<GetNotificationListDto>('/notifications');
};

// 알람 읽음 처리 API
export const readNotificationApi = async (userNotificationId: number): Promise<GetNotificationDto> => {
    return await httpClient.patch<GetNotificationDto>(`/notifications/${userNotificationId}`, {});
};

// 마일리지 내역 타입
export type CoinType = 'WRITEDIARY' | 'WIRTEFEED' | 'BUY';

// 마일리지 내역 DTO
export interface CreateCoinLogDto {
    type: CoinType;
    amount: number;
    createdAt: string; // LocalDateTime string
}

export interface CreateCoinLogDtoList {
    coins: CreateCoinLogDto[];
}

// 마일리지 전체 내역 조회 API
export const getCoinLogsApi = async (): Promise<CreateCoinLogDtoList> => {
    return await httpClient.get<CreateCoinLogDtoList>('/coinlogs');
};

// 마일리지 적립 내역 조회 API
export const getCoinAddLogsApi = async (): Promise<CreateCoinLogDtoList> => {
    return await httpClient.get<CreateCoinLogDtoList>('/coinlogs/add');
};

// 마일리지 사용 내역 조회 API
export const getCoinUseLogsApi = async (): Promise<CreateCoinLogDtoList> => {
    return await httpClient.get<CreateCoinLogDtoList>('/coinlogs/redeem');
};
