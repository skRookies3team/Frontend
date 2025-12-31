import { httpClient } from '@/shared/api/http-client';

// 펫 등록 요청 DTO
export interface CreatePetDto {
    petName: string;
    breed: string;
    genderType: "MALE" | "FEMALE" | "NONE";
    birth: string; // LocalDate yyyy-MM-dd
    species: 'CAT' | 'DOG' | 'RABBIT' | 'HAMSTER'| 'BIRD'|'GUINEAPIG'|'REPTILE'|'FISH'|'ETC';
    neutered: boolean;
    vaccinated: boolean;
}

// 펫 등록 응답 DTO (UpdatePetDto definition from request)
export interface PetResponseDto {
    petId: number;
    petName: string;
    species: 'CAT' | 'DOG' | 'RABBIT' | 'HAMSTER'| 'BIRD'|'GUINEAPIG'|'REPTILE'|'FISH'|'ETC';
    breed: string;
    genderType: "MALE" | "FEMALE" | "NONE";
    is_neutered: boolean;
    profileImage: string;
    age: number;
    birth: string;
    status: string;
}

export const createPetApi = async (request: CreatePetDto, file: File | null): Promise<PetResponseDto> => {
    const formData = new FormData();

    if (file) {
        formData.append("multipartFile", file);
    }

    formData.append("request", new Blob([JSON.stringify(request)], {
        type: "application/json"
    }));

    const response = await httpClient.post<PetResponseDto>(`/pets/create`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response;
};


// 펫 정보 조회 응답 DTO
export interface GetPetDto {
    petId: number;
    petName: string;
    species: 'CAT' | 'DOG' | 'RABBIT' | 'HAMSTER'| 'BIRD'|'GUINEAPIG'|'REPTILE'|'FISH'|'ETC';
    breed: string;
    genderType: "MALE" | "FEMALE";
    neutered: boolean;
    profileImage: string;
    age: number;
    birth: string; // LocalDate format yyyy-MM-dd
    status: string;
    vaccinated: boolean;
}

// 펫 정보 조회 API
export const getPetApi = async (petId: number): Promise<GetPetDto> => {
    const response = await httpClient.get<GetPetDto>(`/pets/${petId}`);
    return response;
};

// 펫 정보 수정 요청 DTO
export interface UpdatePetDto {
    petName: string;
    breed: string;
    genderType: "MALE" | "FEMALE" | "NONE";
    age: number;
    birth: string; // LocalDate yyyy-MM-dd
    species: 'CAT' | 'DOG' | 'RABBIT' | 'HAMSTER'| 'BIRD'|'GUINEAPIG'|'REPTILE'|'FISH'|'ETC';
    neutered: boolean;
    vaccinated: boolean;
}

// 펫 정보 수정 API
export const updatePetApi = async (petId: number, request: UpdatePetDto, file: File | null): Promise<PetResponseDto> => {
    const formData = new FormData();

    if (file) {
        formData.append("multipartFile", file);
    }

    formData.append("request", new Blob([JSON.stringify(request)], {
        type: "application/json"
    }));

    const response = await httpClient.patch<PetResponseDto>(`/pets/${petId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response;
};
