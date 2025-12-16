export type DiaryStep = 'upload' | 'generating' | 'edit' | 'complete';
export type LayoutStyle = 'grid' | 'masonry' | 'slide' | 'classic';
export type TextAlign = 'left' | 'center' | 'right';

export enum ImageType {
  GALLERY = 'GALLERY',
  ARCHIVE = 'ARCHIVE'
}

export interface SelectedImage {
  imageUrl: string;
  source: ImageType;
}

export interface DiaryImageRequest {
  imageUrl: string;
  imgOrder: number;
  mainImage: boolean;
  source: ImageType;
}

export interface DiaryRequest {
  userId: number;
  petId: number;
  content: string;
  visibility: string;
  isAiGen: boolean;
  weather: string | null;
  mood: string | null;
  images: DiaryImageRequest[];
}

export interface CreateDiaryResponse {
  diaryId: number;
  message: string;
}