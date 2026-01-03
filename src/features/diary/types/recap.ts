// Recap status enum
export enum RecapStatus {
    GENERATED = 'GENERATED',
    WAITING = 'WAITING'
}

// Auto generation request (matches backend /generate/auto endpoint)
export interface RecapAutoGenerateRequest {
    petId: number;
    userId: number;
    petName?: string;    // Optional, for AI prompt optimization
}

// Manual generation request (matches backend RecapRequest.Generate for /generate/manual)
export interface RecapManualGenerateRequest {
    petId: number;
    userId: number;
    periodStart: string; // yyyy-MM-dd format
    periodEnd: string;   // yyyy-MM-dd format
    petName?: string;    // Optional, for AI prompt optimization
}

// Recap highlight (matches backend RecapHighlight and response HighlightDto)
export interface RecapHighlight {
    title: string;
    content: string;
}

// Recap detail response (matches backend RecapResponse.Detail)
export interface RecapDetailResponse {
    recapId: number;
    petId: number;
    title: string;
    summary: string;
    periodStart: string; // yyyy-MM-dd
    periodEnd: string;   // yyyy-MM-dd
    imageUrls: string[]; // Changed from mainImageUrl to imageUrls list (max 8)
    momentCount: number;
    status: RecapStatus;
    createdAt: string;   // ISO 8601 datetime
    updatedAt: string;   // ISO 8601 datetime
    highlights: RecapHighlight[];
}

// Recap simple response for list view (matches backend RecapResponse.Simple)
export interface RecapSimpleResponse {
    recapId: number;
    title: string;
    mainImageUrl: string | null; // First image from imageUrls list for thumbnail
    momentCount: number;
    status: RecapStatus;
    periodStart: string; // yyyy-MM-dd
    periodEnd: string;   // yyyy-MM-dd
    createdAt: string;   // ISO 8601 datetime
    updatedAt: string;   // ISO 8601 datetime
}

// AI analysis response (internal, matches backend RecapAiResponse)
export interface RecapAiResponse {
    title: string;
    summary: string;
    highlights: {
        title: string;
        content: string;
    }[];
}

// API response for recap generation
export interface GenerateRecapResponse {
    recapId: number;
    message: string;
}
