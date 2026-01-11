import axios from 'axios';

// Gateway URL (Proxied via vite.config.ts or package.json 'proxy' field)
const BASE_URL = '/api/chat'; 
const HEALTH_URL = '/api/health'; // Assumption for hospital search

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  type?: 'text' | 'map' | 'disease_list' | 'vital_analysis'; // For rich responses
  data?: any; // Extra data for maps or lists
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  distance?: number; // in meters
  status?: 'OPEN' | 'CLOSED';
}

export interface Disease {
  id: string;
  name: string;
  symptoms: string[];
  description: string;
  prevention: string;
}

// Mock Data for Fallback
const MOCK_HOSPITALS: Hospital[] = [
  { id: '1', name: '바른 동물병원', address: '서울 강남구 역삼동 123-4', lat: 37.5665, lng: 126.9780, rating: 4.8, distance: 300, status: 'OPEN' },
  { id: '2', name: '사랑 펫 클리닉', address: '서울 강남구 논현동 55-2', lat: 37.5655, lng: 126.9770, rating: 4.5, distance: 800, status: 'OPEN' },
  { id: '3', name: '24시 응급 센터', address: '서울 강남구 삼성동 11', lat: 37.5675, lng: 126.9790, rating: 4.9, distance: 1200, status: 'OPEN' },
];

const MOCK_DISEASES: Disease[] = [
  { id: 'd1', name: '슬개골 탈구', symptoms: ['절뚝거림', '통증 호소', '걷기 거부'], description: '무릎 뼈가 원래 위치에서 벗어나는 질환입니다.', prevention: '미끄럼 방지 매트 사용, 체중 관리' },
  { id: 'd2', name: '피부염', symptoms: ['가려움', '붉은 발진', '털 빠짐'], description: '알레르기나 세균 감염으로 인한 피부 염증입니다.', prevention: '정기적인 목욕, 알레르기 유발 음식 피하기' },
];

// ==================== MOCK: 구토 관련 응답 ====================
const MOCK_VOMITING_RESPONSE = `강아지의 구토는 다양한 원인으로 발생할 수 있습니다. 일반적으로 일시적인 소화 불량이나 이물질 섭취로 인한 경우도 있지만, 지속적인 구토는 심각한 건강 문제를 나타낼 수 있습니다.

구토가 계속된다면 다음과 같은 조치를 취해주세요:

1. 물과 음식을 잠시 중단하고 2-3시간 정도 위를 쉬게 해주세요.
2. 이후 소량의 물을 조금씩 주면서 상태를 지켜봐 주세요.
3. 구토가 멈추면 소화가 쉬운 음식(삶은 닭고기와 흰 쌀)을 소량씩 주세요.

하지만 다음과 같은 경우에는 즉시 병원 방문이 필요합니다:

- 구토가 24시간 이상 지속될 때
- 구토물에 혈액이나 이상한 물질이 섞여 있을 때
- 식욕 감퇴, 무기력함, 설사 등 다른 증상이 동반될 때
- 강아지가 어리거나 노령인 경우`;

// ==================== MOCK: 바이탈 트렌드 분석 ====================
export interface VitalTrend {
  date: string;
  heartRate: number;      // 심박수 (bpm)
  temperature: number;    // 체온 (°C)
  respiratoryRate: number; // 호흡수 (/min)
  weight: number;         // 체중 (kg)
  activityLevel: number;  // 활동량 (0-100)
}

export interface VitalAnalysis {
  trends: VitalTrend[];
  summary: string;
  alerts: string[];
  recommendations: string[];
}

const MOCK_VITAL_TRENDS: VitalTrend[] = [
  { date: '2026-01-02', heartRate: 95, temperature: 38.5, respiratoryRate: 22, weight: 7.2, activityLevel: 78 },
  { date: '2026-01-03', heartRate: 98, temperature: 38.6, respiratoryRate: 24, weight: 7.2, activityLevel: 72 },
  { date: '2026-01-04', heartRate: 102, temperature: 38.8, respiratoryRate: 26, weight: 7.1, activityLevel: 65 },
  { date: '2026-01-05', heartRate: 108, temperature: 39.1, respiratoryRate: 28, weight: 7.0, activityLevel: 55 },
  { date: '2026-01-06', heartRate: 105, temperature: 38.9, respiratoryRate: 25, weight: 7.0, activityLevel: 60 },
  { date: '2026-01-07', heartRate: 100, temperature: 38.7, respiratoryRate: 23, weight: 7.1, activityLevel: 70 },
  { date: '2026-01-08', heartRate: 96, temperature: 38.5, respiratoryRate: 22, weight: 7.2, activityLevel: 75 },
];

const MOCK_VITAL_ANALYSIS: VitalAnalysis = {
  trends: MOCK_VITAL_TRENDS,
  summary: '지난 7일간 바이탈 분석 결과, 1월 4-5일 사이 체온 상승과 심박수 증가가 관찰되었습니다. 현재는 정상 범위로 회복 중입니다.',
  alerts: [
    '⚠️ 1월 5일 체온이 39.1°C로 정상 범위(38.0-39.0°C)를 초과했습니다.',
    '⚠️ 같은 날 활동량이 평소 대비 30% 감소했습니다.'
  ],
  recommendations: [
    '체온이 일시적으로 상승했다가 회복되었습니다. 현재 상태를 지속 관찰해주세요.',
    '활동량이 감소한 날 식욕이나 배변 상태도 함께 체크해주세요.',
    '증상이 재발하거나 지속되면 수의사 상담을 권장합니다.'
  ]
};

export const chatbotApi = {
  // Send Message (Real Backend Integration with SSE Streaming)
  sendMessage: async (message: string, userId: string, petId?: string): Promise<ChatMessage> => {
    try {
      // ⭐ REAL BACKEND INTEGRATION - Persona Chat SSE Streaming
      if (petId) {
        // SSE 스트리밍 방식 (Persona Chat)
        return new Promise((resolve, reject) => {
          const eventSource = new EventSource(
            `${BASE_URL}/stream/persona/${petId}?message=${encodeURIComponent(message)}`
          );
          
          let fullContent = '';
          let hasReceivedData = false;
          
          eventSource.addEventListener('message', (e) => {
            hasReceivedData = true;
            const data = JSON.parse(e.data);
            fullContent += data.chunk || '';
          });
          
          eventSource.addEventListener('complete', () => {
            eventSource.close();
            resolve({
              id: Date.now().toString(),
              sender: 'bot',
              content: fullContent,
              timestamp: new Date()
            });
          });
          
          eventSource.onerror = () => {
            eventSource.close();
            
            // ==================== MOCK: 페르소나 채팅 즉시 응답 ====================
            // WHY: 백엔드가 없을 때 즉시 목업 응답 반환
            const lowerMessage = message.toLowerCase();
            
            // 어제 어땠어?
            if (lowerMessage.includes('어제') || lowerMessage.includes('어땠')) {
              resolve({
                id: Date.now().toString(),
                sender: 'bot',
                content: '어제? 어제 산책해서 기분 좋았어! 🐕✨ 공원에서 다른 강아지 친구들도 만났고, 맛있는 간식도 먹었어! 너는 어제 뭐 했어?',
                timestamp: new Date()
              });
              return;
            }
            
            // 기본 페르소나 응답
            resolve({
              id: Date.now().toString(),
              sender: 'bot',
              content: `${message}? 멍멍! 🐶 나도 그거 좋아해! 같이 놀자~!`,
              timestamp: new Date()
            });
          };
          
          // 3초 타임아웃 (빠른 폴백)
          setTimeout(() => {
            if (eventSource.readyState !== EventSource.CLOSED) {
              eventSource.close();
              if (fullContent) {
                resolve({
                  id: Date.now().toString(),
                  sender: 'bot',
                  content: fullContent,
                  timestamp: new Date()
                });
              } else {
                // 타임아웃 시 목업 응답
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('어제') || lowerMessage.includes('어땠')) {
                  resolve({
                    id: Date.now().toString(),
                    sender: 'bot',
                    content: '어제? 어제 산책해서 기분 좋았어! 🐕✨ 공원에서 다른 강아지 친구들도 만났고, 맛있는 간식도 먹었어!',
                    timestamp: new Date()
                  });
                } else {
                  resolve({
                    id: Date.now().toString(),
                    sender: 'bot',
                    content: `${message}? 멍멍! 🐶 나도 그거 좋아해! 같이 놀자~!`,
                    timestamp: new Date()
                  });
                }
              }
            }
          }, 3000);
        });
      }
      
      // 일반 채팅 (REST API)
      // [FIX] JWT 토큰 추가하여 Gateway 인증 통과
      const token = localStorage.getItem('petlog_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${BASE_URL}/smart`, { 
        message, 
        userId 
      }, { headers });
      
      return {
        id: response.data.id || Date.now().toString(),
        sender: 'bot',
        content: response.data.response || response.data.message,
        timestamp: new Date(),
        type: response.data.type,
        data: response.data.data
      };
      
    } catch (error) {
      console.error("API Error:", error);
      // Fallback to mock if backend unavailable
      const lowerMessage = message.toLowerCase();
      const isHospitalRequest = message.includes('병원') || message.includes('찾아');
      const isDiseaseRequest = message.includes('아파') || message.includes('증상') || message.includes('병');
      const isVomitingRequest = message.includes('토') || message.includes('구토') || message.includes('게워');
      const isVitalRequest = message.includes('바이탈') || message.includes('건강') || message.includes('트렌드') || message.includes('상태');
      const isYesterdayRequest = lowerMessage.includes('어제') || lowerMessage.includes('어땠');
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // ==================== 어제 어땠어? 페르소나 목업 응답 ====================
      if (isYesterdayRequest) {
          return {
              id: Date.now().toString(),
              sender: 'bot',
              content: '어제? 어제 산책해서 기분 좋았어! 🐕✨ 공원에서 다른 강아지 친구들도 만났고, 맛있는 간식도 먹었어! 너는 어제 뭐 했어?',
              timestamp: new Date(),
              type: 'text'
          };
      }

      // ==================== 구토 관련 목업 응답 ====================
      if (isVomitingRequest) {
          return {
              id: Date.now().toString(),
              sender: 'bot',
              content: MOCK_VOMITING_RESPONSE,
              timestamp: new Date(),
              type: 'text',
              data: { category: 'health_advice', symptom: 'vomiting' }
          };
      }

      // ==================== 바이탈 트렌드 분석 목업 응답 ====================
      if (isVitalRequest) {
          return {
              id: Date.now().toString(),
              sender: 'bot',
              content: `📊 **바이탈 트렌드 분석 결과**\n\n${MOCK_VITAL_ANALYSIS.summary}\n\n**⚠️ 주의사항:**\n${MOCK_VITAL_ANALYSIS.alerts.join('\n')}\n\n**💡 권장사항:**\n${MOCK_VITAL_ANALYSIS.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
              timestamp: new Date(),
              type: 'vital_analysis',
              data: MOCK_VITAL_ANALYSIS
          };
      }

      if (isHospitalRequest) {
          return {
              id: Date.now().toString(),
              sender: 'bot',
              content: "근처 동물병원을 찾아드릴까요? 지도를 확인해보세요.",
              timestamp: new Date(),
              type: 'map',
              data: { center: { lat: 37.5665, lng: 126.9780 } }
          };
      }
      
      if (isDiseaseRequest) {
           return {
              id: Date.now().toString(),
              sender: 'bot',
              content: "이런 증상이 의심되는군요. 상세 정보를 확인해보세요.",
              timestamp: new Date(),
              type: 'disease_list',
              data: MOCK_DISEASES
          };
      }

      return {
        id: Date.now().toString(),
        sender: 'bot',
        content: `"${message}".. 멍멍! (백엔드 연결 확인 필요)`,
        timestamp: new Date()
      };
    }
  },

  // Get Nearby Hospitals
  getNearbyHospitals: async (lat: number, lng: number): Promise<Hospital[]> => {
    try {
      // ---------------------------------------------------------
      // REAL BACKEND INTEGRATION
      // ---------------------------------------------------------
      /*
      const response = await axios.get(`${HEALTH_URL}/hospitals`, { params: { lat, lng } });
      return response.data;
      */
      
      // Dynamic Mock Data Generation
      const generateRandomHospital = (id: string, name: string, baseLat: number, baseLng: number) => ({
        id,
        name,
        address: `${name} 근처 도로명 주소`,
        lat: baseLat + (Math.random() - 0.5) * 0.01,
        lng: baseLng + (Math.random() - 0.5) * 0.01,
        rating: 4.0 + Number((Math.random()).toFixed(1)),
        distance: Math.floor(Math.random() * 1000) + 100,
        status: Math.random() > 0.3 ? 'OPEN' : 'CLOSED' as const
      });

      return [
        generateRandomHospital('1', '행복한 동물병원', lat, lng),
        generateRandomHospital('2', '24시 케어 센터', lat, lng),
        generateRandomHospital('3', '사랑 펫 클리닉', lat, lng),
        generateRandomHospital('4', '우리동네 동물병원', lat, lng),
        generateRandomHospital('5', '서울 종합 동물병원', lat, lng),
      ];
    } catch (error) {
      console.warn("Using mock hospitals due to error", error);
      return MOCK_HOSPITALS;
    }
  },

  // Search Diseases
  searchDiseases: async (query: string): Promise<Disease[]> => {
    try {
      // ---------------------------------------------------------
      // REAL BACKEND INTEGRATION
      // ---------------------------------------------------------
      // const response = await axios.get(`${HEALTH_URL}/diseases`, { params: { query } });
      // return response.data;

      return MOCK_DISEASES.filter(d => 
        d.name.includes(query) || d.symptoms.some(s => s.includes(query))
      );
    } catch (error) {
      return MOCK_DISEASES;
    }
  },

  // ====================== 3D MODEL API (Meshy AI) ======================
  
  /**
   * 펫 3D 모델 생성 요청
   * @param petId 펫 ID
   * @param authorization JWT 토큰 (옵션 - 없으면 localStorage에서 자동 로드)
   */
  generate3DModel: async (petId: string, authorization?: string) => {
    const token = authorization || localStorage.getItem('petlog_token');
    const response = await axios.post(`/api/model/pet/${petId}`, null, {
      headers: token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}
    });
    return response.data;
  },

  /**
   * 3D 모델 생성 상태 조회
   * @param taskId Meshy Task ID
   */
  get3DModelStatus: async (taskId: string) => {
    const token = localStorage.getItem('petlog_token');
    const response = await axios.get(`/api/model/status/${taskId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  /**
   * 펫의 저장된 3D 모델 조회
   * @param petId 펫 ID
   */
  getSavedPetModel: async (petId: string) => {
    try {
      const token = localStorage.getItem('petlog_token');
      const response = await axios.get(`/api/model/pet/${petId}/saved`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      return null; // 저장된 모델 없음
    }
  },

  /**
   * 펫에 3D 모델이 있는지 확인
   * @param petId 펫 ID
   */
  checkPetModelExists: async (petId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('petlog_token');
      const response = await axios.get(`/api/model/pet/${petId}/exists`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data.hasModel;
    } catch (error) {
      return false;
    }
  }
};
