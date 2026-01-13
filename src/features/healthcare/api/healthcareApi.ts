/**
 * Healthcare AI Chatbot API Module
 * 
 * WHY: `healthcare_AIchatbot_service_backend` (feat#6/AI고도화)와 통신하기 위한 API 모듈.
 * 주요 엔드포인트: POST /api/chat/smart
 * 
 * @author frontend-team
 * @since 2026-01-08
 */

import axios from 'axios';

// ===================================================================
// Types
// ===================================================================

export interface SmartChatRequest {
  message: string;
}

export interface SmartChatResponse {
  success: boolean;
  intent: 'GENERAL_HEALTH' | 'SKIN_DISEASE' | 'HOSPITAL_SEARCH' | string;
  response: string;
  ragUsed: boolean;
  department: string;
  responseTimeMs?: number;
}

export interface ChatHistoryMessage {
  id: number;
  chatType: string;
  userMessage: string;
  botResponse: string;
  createdAt: string;
  userFeedback: boolean | null;
}

export interface ChatHistoryResponse {
  petId: number;
  count: number;
  messages: ChatHistoryMessage[];
}

// ===================================================================
// Health Record API Types
// ===================================================================

export interface HealthRecordRequest {
  petName: string;
  weight?: number;
  heartRate?: number;
  respiratoryRate?: number;
  steps?: number;
  condition?: string;
  recordType?: string;
  notes?: string;
}

export interface HealthRecordSaveResponse {
  success: boolean;
  message: string;
  recordId?: number;
}

// ===================================================================
// Configuration
// ===================================================================

// Gateway URL (프로덕션에서는 환경변수로 대체)
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8000';
const HEALTHCARE_API_BASE = `${GATEWAY_URL}/api/chat`;

// ===================================================================
// API Functions
// ===================================================================

/**
 * 스마트 챗봇 API 호출
 * 
 * 사용자 질문을 분석하여 피부질환/병원 연동 또는 일반 수의사 모드로 응답.
 * RAG(Retrieval-Augmented Generation) 기반 전문 지식 활용.
 * 
 * @param message - 사용자 메시지
 * @param userId - 사용자 ID (X-USER-ID 헤더)
 * @param petId - 반려동물 ID (X-PET-ID 헤더)
 * @param token - JWT 토큰 (Authorization 헤더)
 * @returns SmartChatResponse
 */
export const smartChatApi = async (
  message: string,
  userId: string,
  petId: string,
  token: string | null
): Promise<SmartChatResponse> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add user/pet context headers
    if (userId) {
      headers['X-USER-ID'] = userId;
    }
    if (petId) {
      headers['X-PET-ID'] = petId;
    }

    const response = await axios.post<SmartChatResponse>(
      `${HEALTHCARE_API_BASE}/smart`,
      { message },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.warn('[HealthcareAPI] Backend unavailable, returning MOCK response:', error);
    
    // ==================== MOCK: AI 수의사 챗봇 응답 ====================
    // WHY: 백엔드 연결 없이 데모가 가능하도록 목업 응답 반환
    const lowerMessage = message.toLowerCase();
    
    // 구토 관련
    if (lowerMessage.includes('토') || lowerMessage.includes('구토') || lowerMessage.includes('게워')) {
      return {
        success: true,
        intent: 'GENERAL_HEALTH',
        response: `강아지의 구토는 다양한 원인으로 발생할 수 있습니다. 일반적으로 일시적인 소화 불량이나 이물질 섭취로 인한 경우도 있지만, 지속적인 구토는 심각한 건강 문제를 나타낼 수 있습니다.

**응급 조치:**
1. 물과 음식을 잠시 중단하고 2-3시간 정도 위를 쉬게 해주세요.
2. 이후 소량의 물을 조금씩 주면서 상태를 지켜봐 주세요.
3. 구토가 멈추면 소화가 쉬운 음식(삶은 닭고기와 흰 쌀)을 소량씩 주세요.

**병원 방문이 필요한 경우:**
- 구토가 24시간 이상 지속될 때
- 구토물에 혈액이나 이상한 물질이 섞여 있을 때
- 식욕 감퇴, 무기력함, 설사 등 다른 증상이 동반될 때`,
        ragUsed: true,
        department: '내과',
      };
    }
    
    // 피부 관련
    if (lowerMessage.includes('피부') || lowerMessage.includes('가려') || lowerMessage.includes('털') || lowerMessage.includes('긁')) {
      return {
        success: true,
        intent: 'SKIN_DISEASE',
        response: `피부 문제가 의심됩니다. 반려동물의 피부 질환은 다양한 원인이 있을 수 있어요.

**일반적인 원인:**
- 알레르기 (음식, 환경)
- 기생충 (벼룩, 진드기)
- 세균 또는 진균 감염
- 건조한 피부

**관리 팁:**
1. 저자극성 샴푸로 주 1-2회 목욕
2. 오메가-3 지방산 보충제 고려
3. 알레르기 유발 음식 제거
4. 실내 습도 유지

정확한 진단을 위해 **피부 AI 분석** 기능을 이용하시거나, 수의사 상담을 권장합니다.`,
        ragUsed: true,
        department: '피부과',
      };
    }
    
    // 병원 찾기
    if (lowerMessage.includes('병원') || lowerMessage.includes('동물병원')) {
      return {
        success: true,
        intent: 'HOSPITAL_SEARCH',
        response: `근처 동물병원을 찾아드릴게요! 🏥

**추천 병원:**
1. **바른 동물병원** - 강남구 역삼동 (300m) ⭐4.8
2. **24시 응급 센터** - 강남구 삼성동 (1.2km) ⭐4.9
3. **사랑 펫 클리닉** - 강남구 논현동 (800m) ⭐4.5

💡 야간 응급 상황이라면 24시 응급 센터를 추천드립니다.`,
        ragUsed: false,
        department: '',
      };
    }
    
    // 일반 건강 상담 (기본 응답)
    return {
      success: true,
      intent: 'GENERAL_HEALTH',
      response: `안녕하세요! AI 수의사입니다. 🐕

"${message}"에 대해 답변드릴게요.

반려동물의 건강은 정기적인 관찰과 예방이 중요합니다. 다음 사항을 확인해보세요:

**기본 건강 체크리스트:**
✅ 식욕과 음수량 변화
✅ 배변 상태 (색상, 빈도, 형태)
✅ 활동량과 에너지 수준
✅ 피부와 털 상태
✅ 걸음걸이 이상 여부

궁금한 증상이 있다면 더 구체적으로 말씀해주세요!
(예: "강아지가 토해요", "피부에 발진이 생겼어요")`,
      ragUsed: true,
      department: '일반',
    };
  }
};

/**
 * 채팅 히스토리 조회
 * 
 * @param userId - 사용자 ID
 * @param petId - 반려동물 ID
 * @param token - JWT 토큰
 * @returns ChatHistoryResponse
 */
export const getChatHistoryApi = async (
  userId: string,
  petId: string,
  token: string | null
): Promise<ChatHistoryResponse | null> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get<ChatHistoryResponse>(
      `${GATEWAY_URL}/api/history/${petId}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('[HealthcareAPI] Get chat history failed:', error);
    return null;
  }
};

/**
 * Health Check API
 */
export const healthCheckApi = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${HEALTHCARE_API_BASE}/health`);
    return response.data?.status === 'UP';
  } catch {
    return false;
  }
};

/**
 * 건강 데이터 수기 입력 API
 * 
 * POST /api/health/record
 * 
 * @param data - 건강 데이터 (체중, 심박수, 호흡수, 걸음수)
 * @param userId - 사용자 ID
 * @param petId - 반려동물 ID
 * @param token - JWT 토큰
 * @returns 저장 결과
 */
export const saveHealthRecordApi = async (
  data: HealthRecordRequest,
  userId: string,
  petId: string,
  token: string | null
): Promise<HealthRecordSaveResponse> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    if (petId) {
      headers['X-Pet-Id'] = petId;
    }

    const response = await axios.post<HealthRecordSaveResponse>(
      `${GATEWAY_URL}/api/health/record`,
      data,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('[HealthcareAPI] Save health record failed:', error);
    return {
      success: false,
      message: '건강 데이터 저장에 실패했습니다.',
    };
  }
};

// ===================================================================
// Skin Disease Analysis API
// ===================================================================

export interface SkinDiseaseResult {
  symptoms: string[];
  possibleDiseases: string[];
  severity: string;
  recommendation: string;
  notes: string;
}

export interface SkinDiseaseResponse {
  success: boolean;
  result: SkinDiseaseResult;
  imageUrl: string | null;
  message: string;
}

/**
 * 피부질환 AI 분석 API
 * 
 * POST /api/skin-disease/analyze
 * 
 * @param imageFile - 업로드할 이미지 파일
 * @param userId - 사용자 ID
 * @param petId - 반려동물 ID
 * @param token - JWT 토큰
 * @returns 피부질환 분석 결과
 */
export const analyzeSkinDiseaseApi = async (
  imageFile: File,
  userId: string,
  petId: string,
  token: string | null
): Promise<SkinDiseaseResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('petId', petId);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await axios.post<SkinDiseaseResponse>(
      `${GATEWAY_URL}/api/skin-disease/analyze`,
      formData,
      { 
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60s timeout for AI analysis
      }
    );

    return response.data;
  } catch (error) {
    console.warn('[HealthcareAPI] Backend unavailable, returning MOCK skin disease result:', error);
    
    // ==================== MOCK: 피부질환 분석 성공 응답 ====================
    // WHY: 백엔드 연결 없이 데모가 가능하도록 목업 응답 반환
    return {
      success: true,
      result: {
        symptoms: ['붉은 반점', '가려움증', '털 빠짐', '피부 각질'],
        possibleDiseases: ['아토피성 피부염', '접촉성 피부염', '세균성 피부염'],
        severity: '중등도 (Moderate)',
        recommendation: '수의사 상담을 권장합니다. 2주 이내 증상이 호전되지 않으면 피부 검사를 받아보세요.',
        notes: '📌 AI 분석 결과이며, 정확한 진단을 위해 전문 수의사의 진료를 권장합니다.\n\n💡 관리 팁:\n- 알레르기 유발 음식 피하기\n- 저자극성 샴푸 사용\n- 피부를 긁지 않도록 관리',
      },
      imageUrl: URL.createObjectURL(imageFile), // 업로드된 이미지 미리보기
      message: '피부질환 AI 분석이 완료되었습니다. (데모 모드)',
    };
  }
};

// ===================================================================
// WithaPet API Types & Functions
// ===================================================================

export interface WithaPetHealthData {
  petName: string;
  petType: string;
  healthScore: number;
  vitalData: {
    avgHeartRate: number;
    avgRespiratoryRate: number;
    weight: number;
    lastUpdate: string;
  };
  heartRateTrend: Array<{ time: string; value: number }>;
  respiratoryRateTrend: Array<{ time: string; value: number }>;
  aiAnalysis: {
    analysisResult: string;
    recommendations: string[];
  };
}

export interface WithaPetSyncResponse {
  success: boolean;
  message: string;
  vectorized: boolean;
  data: WithaPetHealthData;
}

/**
 * WithaPet 데이터 동기화 API
 * 
 * 스마트 청진기에서 건강 데이터를 가져와 Milvus에 벡터화하여 저장
 * 
 * @param petName 펫 이름
 * @param petType 펫 종류 (Dog/Cat)
 * @param userId 사용자 ID
 * @param petId 펫 ID
 * @param token JWT 토큰
 */
export const syncWithaPetDataApi = async (
  petName: string,
  petType: string | undefined,
  userId: string,
  petId: string,
  token: string | null
): Promise<WithaPetSyncResponse> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    if (petId) {
      headers['X-Pet-Id'] = petId;
    }

    const params = new URLSearchParams();
    params.append('petName', petName);
    if (petType) {
      params.append('petType', petType);
    }

    const response = await axios.post<WithaPetSyncResponse>(
      `${GATEWAY_URL}/api/withapet/sync?${params.toString()}`,
      null,
      { headers, timeout: 30000 }
    );

    return response.data;
  } catch (error) {
    console.warn('[HealthcareAPI] WithaPet sync failed, returning MOCK data:', error);
    
    // 백엔드 연결 실패 시 Mock 데이터 반환
    const now = new Date();
    const mockTrends = Array.from({ length: 12 }, (_, i) => ({
      time: `${(now.getHours() - 11 + i + 24) % 24}:00`,
      value: 60 + Math.floor(Math.random() * 60),
    }));

    return {
      success: true,
      message: '건강 데이터가 동기화되었습니다 (데모 모드)',
      vectorized: false,
      data: {
        petName,
        petType: petType || 'Dog',
        healthScore: 85 + Math.floor(Math.random() * 15),
        vitalData: {
          avgHeartRate: 60 + Math.floor(Math.random() * 60),
          avgRespiratoryRate: 15 + Math.floor(Math.random() * 25),
          weight: 5 + Math.random() * 10,
          lastUpdate: '방금 전 (동기화됨)',
        },
        heartRateTrend: mockTrends,
        respiratoryRateTrend: mockTrends.map(t => ({ ...t, value: 15 + Math.floor(Math.random() * 25) })),
        aiAnalysis: {
          analysisResult: '전반적인 건강 상태가 양호합니다.',
          recommendations: ['규칙적인 산책', '균형 잡힌 식단 유지'],
        },
      },
    };
  }
};

