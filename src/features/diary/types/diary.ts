// 일기 생성 단계
export type DiaryStep = 'upload' | 'generating' | 'edit' | 'complete';

// 레이아웃 스타일
export type LayoutStyle = 'grid' | 'masonry' | 'slide' | 'classic';

// 텍스트 정렬
export type TextAlign = 'left' | 'center' | 'right';

// 이미지 출처 타입 (백엔드 Enum 매핑)
export enum ImageType {
    GALLERY = 'GALLERY',
    ARCHIVE = 'ARCHIVE'
}

// 프론트엔드 State용 이미지 타입
export interface SelectedImage {
    imageUrl: string;
    source: ImageType;
}

// [Request DTO] Java: DiaryRequest.Create 대응
export interface DiaryRequest {
    userId: number;
    petId: number;
    content: string;
    visibility: string; // "PUBLIC", "PRIVATE", "FOLLOWER"
    isAiGen: boolean;
    weather: string | null;
    mood: string | null;
    images: {
        imageUrl: string;
        imgOrder: number;
        mainImage: boolean;
        source: ImageType;
    }[];
}

// 백엔드 컨트롤러의 POST 응답 구조
export interface CreateDiaryResponse {
    diaryId: number;
    message: string;
}

export interface UpdateDiaryRequest extends Partial<DiaryRequest> { }

export interface DiaryResponse extends DiaryRequest {
    diaryId: number;
    createdAt: string;
    updatedAt: string;
}