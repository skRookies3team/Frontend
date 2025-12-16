// 일기 생성 단계
export type DiaryStep = 'upload' | 'generating' | 'edit' | 'complete';

// 레이아웃 스타일
export type LayoutStyle = 'grid' | 'masonry' | 'slide' | 'classic';

// 텍스트 정렬
export type TextAlign = 'left' | 'center' | 'right';

// 선택된 이미지 객체
export interface SelectedImage {
    imageUrl: string;
    source: 'GALLERY' | 'ARCHIVE';
}

// 백엔드 전송용 이미지 데이터 구조
export interface DiaryImageDTO {
    imageUrl: string;
    imgOrder: number;
    mainImage: boolean;
    source: 'GALLERY' | 'ARCHIVE';
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
export const ImageType = {
    GALLERY: 'GALLERY', // 로컬 PC에서 새로 업로드
    ARCHIVE: 'ARCHIVE', // 웹사이트 내부 보관함에서 선택
} as const;