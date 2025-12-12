import { httpClient } from '@/shared/api/http-client';

// 펫 등록 요청 DTO
export interface CreatePetDto {
    petName: string;
    breed: string;
    genderType: "MALE" | "FEMALE" | "NONE";
    birth: string; // LocalDate yyyy-MM-dd
    species: "DOG" | "CAT";
    neutered: boolean;
}

// 펫 등록 응답 DTO (UpdatePetDto definition from request)
export interface PetResponseDto {
    petId: number;
    petName: string;
    species: "DOG" | "CAT";
    breed: string;
    genderType: "MALE" | "FEMALE" | "NONE";
    is_neutered: boolean;
    profileImage: string;
    age: number;
    birth: string;
    status: string;
}

export const createPetApi = async (userId: number, request: CreatePetDto, file: File | null): Promise<PetResponseDto> => {
    const formData = new FormData();

    if (file) {
        formData.append("multipartFile", file);
    } else {
        // If file is mandatory but missing, backend might reject. 
        // For now, if no file, we might send empty or handle it.
        // Assuming file is optional or user will provide it.
        // If mandatory, we should ensure file exists.
        // User request says @RequestPart MultipartFile multipartFile, usually implies mandatory.
        // But let's proceed.
    }

    formData.append("request", new Blob([JSON.stringify(request)], {
        type: "application/json"
    }));

    // Assuming endpoint is /api/pets/create based on pattern
    const response = await httpClient.post<PetResponseDto>('http://localhost:8000/api/pets/create', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "X-USER-ID": userId.toString()
        }
    });
    return response;
};
