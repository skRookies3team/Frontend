// 일기 생성 단계
export type DiaryStep = 'upload' | 'generating' | 'edit' | 'style' | 'complete';

// 레이아웃 스타일
export type LayoutStyle = 'grid' | 'masonry' | 'slide' | 'classic';

// 텍스트 정렬
export type TextAlign = 'left' | 'center' | 'right';

// 이미지 크기 옵션
export type SizeOption = 'small' | 'medium' | 'large';

// 테마 스타일
export type ThemeStyle = 'basic' | 'romantic' | 'modern';

// 선택된 이미지 객체
export interface SelectedImage {
    imageUrl: string;
    source: 'GALLERY' | 'ARCHIVE';
    archiveId?: number | null;
    metadata?: Record<string, any>; // EXIF 데이터 등 비정형 메타데이터
}

// 백엔드 전송용 이미지 데이터 구조
export interface DiaryImageDTO {
    imageUrl: string;
    imgOrder: number;
    mainImage: boolean;
    source: 'GALLERY' | 'ARCHIVE';
    archiveId?: number | null;
    metadata?: Record<string, any>; // EXIF 데이터 등 비정형 메타데이터
}

// 일기 생성 응답 DTO
export interface CreateDiaryResponse {
    diaryId: number;
    message: string;
}

// 다이어리 스타일 요청 DTO
export interface DiaryStyleRequest {
    galleryType: string;   // grid, masonry, slider, classic
    textAlignment: string; // left, center, right
    fontSize: number;
    sizeOption: string;    // small, medium, large
    backgroundColor: string;
    preset: string | null;
    themeStyle: string;    // basic, romantic, modern
    petId: number | null;
    diaryId: number;       // [NEW] 다이어리 ID (개별 다이어리 스타일 적용)
    fontFamily?: string;   // [NEW] 폰트 스타일
}

// [추가] 일기 생성 요청 DTO (프론트엔드에서 백엔드로 보낼 때 사용)
// [추가] 일기 생성 요청 DTO (프론트엔드에서 백엔드로 보낼 때 사용)
export interface DiaryRequest {
    userId: number;
    petId: number;
    content: string;
    visibility: string;
    isAiGen: boolean;
    weather: string | null;
    mood: string | null;
    latitude?: number | null;
    longitude?: number | null;
    locationName?: string; // [New]
    date?: string; // [New] yyyy-MM-dd
    title?: string; // [New]

    // Legacy image objects (optional if we use imageUrls/archiveIds)
    images?: DiaryImageDTO[];

    // [New] Preview result based IDs (for final save)
    imageUrls?: string[];
    archiveIds?: number[];
}

// [New] AI Diary Preview Response
export interface AiDiaryResponse {
    title: string; // [NEW]
    content: string;
    weather: string;
    mood: string;
    locationName: string;
    latitude: number;
    longitude: number;
    imageUrls: string[];
    archiveIds: number[];
}

// [NEW] 백엔드 DiaryResponse (조회용)
export interface DiaryResponse {
    diaryId: number;
    userId: number;
    petId: number;
    title: string;
    content: string;
    weather: string;
    mood: string;
    date: string; // LocalDate -> string
    images: DiaryImage[]; // ✅ imageUrls 대신 images 사용
    isAiGen: boolean;
    createdAt: string;
    visibility?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    updatedAt?: string;
    style?: DiaryStyleRequest; // [NEW] 스타일 정보 포함
}

// 백엔드 이미지 객체 구조
export interface DiaryImage {
    imageId: number;
    imageUrl: string;
    imgOrder: number;
    mainImage: boolean;
}

// Mock 데이터 상수
export const GALLERY_IMAGES: string[] = [
    'https://placehold.co/200x150/5B3B8D/ffffff?text=ARCHIVE+1',
    'https://placehold.co/200x250/7A5E9E/ffffff?text=ARCHIVE+2',
    'https://placehold.co/200x200/9C89B8/ffffff?text=ARCHIVE+3',
    'https://placehold.co/200x150/B8AAD3/ffffff?text=ARCHIVE+4',
    'https://placehold.co/200x220/8D86C9/ffffff?text=ARCHIVE+5',
    'https://placehold.co/200x180/7F5A89/ffffff?text=ARCHIVE+6',
    'https://placehold.co/200x300/4F3A59/ffffff?text=ARCHIVE+7',
    'https://placehold.co/200x200/2F1F3D/ffffff?text=ARCHIVE+8',
];

// 이미지 출처 타입
export enum ImageSource {
    GALLERY = 'GALLERY', // 외부 갤러리 (새로 업로드) -> 외부 서비스 전송 O
    ARCHIVE = 'ARCHIVE'  // 내부 보관함 (기존 사진 선택) -> 외부 서비스 전송 X
}

export const ImageType = {
    GALLERY: ImageSource.GALLERY,
    ARCHIVE: ImageSource.ARCHIVE,
} as const;

// 3D/2D 포트폴리오 다이어리 객체
export interface PortfolioDiary {
    id: number;
    src: string;
    title: string;
    date: string;
    location: string;
    content: string;
    likes: number;
    weather: string;
    images?: any[];
    isPlaceholder?: boolean;
    color?: string; // 카드의 테마 색상 (파스텔 톤)
}