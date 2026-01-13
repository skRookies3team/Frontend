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
  specialty?: string; // 진료과목 (예: '피부과,내과,응급')
  phone?: string;
  isEmergency?: boolean;
}

export interface Disease {
  id: string;
  name: string;
  symptoms: string[];
  description: string;
  prevention: string;
}

// Mock Data for Fallback - 각 지역당 3개 이상 병원
const MOCK_HOSPITALS: Hospital[] = [
  // === 동국대(서울) - 37.5582, 126.9982 ===
  { id: '1', name: '24시 충무로동물의료센터', address: '서울 중구 퇴계로 234', lat: 37.5610, lng: 126.9970, rating: 4.8, distance: 300, status: 'OPEN', specialty: '피부과,응급,내과', isEmergency: true },
  { id: '2', name: '을지로펫동물병원', address: '서울 중구 을지로 100', lat: 37.5660, lng: 126.9910, rating: 4.5, distance: 800, status: 'OPEN', specialty: '피부과,안과,치과' },
  { id: '3', name: '장충동물병원', address: '서울 중구 동호로 287', lat: 37.5615, lng: 127.0050, rating: 4.7, distance: 600, status: 'OPEN', specialty: '피부과,알러지,내과' },

  // === 강남역 - 37.4979, 127.0276 ===
  { id: '4', name: '강남 24시 미래동물병원', address: '서울 강남구 테헤란로 123', lat: 37.5012, lng: 127.0396, rating: 4.9, distance: 400, status: 'OPEN', specialty: '피부과,응급,수술', isEmergency: true },
  { id: '5', name: '역삼 펫클리닉', address: '서울 강남구 역삼로 200', lat: 37.4990, lng: 127.0300, rating: 4.6, distance: 500, status: 'OPEN', specialty: '피부과,치과,미용' },
  { id: '6', name: '강남피부전문동물병원', address: '서울 강남구 논현로 789', lat: 37.5050, lng: 127.0250, rating: 4.8, distance: 700, status: 'OPEN', specialty: '피부과,알러지,아토피' },

  // === 홍대입구 - 37.5575, 126.9245 ===
  { id: '7', name: '홍대 24시 사랑동물병원', address: '서울 마포구 양화로 156', lat: 37.5570, lng: 126.9240, rating: 4.7, distance: 350, status: 'OPEN', specialty: '응급,외과,피부과', isEmergency: true },
  { id: '8', name: '홍대 라이즈 펫 클리닉', address: '서울 마포구 홍익로 25', lat: 37.5580, lng: 126.9250, rating: 4.5, distance: 450, status: 'OPEN', specialty: '피부과,내과,예방접종' },
  { id: '9', name: '합정 동물의료센터', address: '서울 마포구 월드컵로 100', lat: 37.5510, lng: 126.9150, rating: 4.6, distance: 900, status: 'OPEN', specialty: '피부과,정형외과,재활' },

  // === 여의도 - 37.5217, 126.9242 ===
  { id: '10', name: '여의도 IFC 동물병원', address: '서울 영등포구 국제금융로 10', lat: 37.5250, lng: 126.9260, rating: 4.4, distance: 400, status: 'OPEN', specialty: '내과,검진,피부과' },
  { id: '11', name: '국회의사당 24시 펫케어', address: '서울 영등포구 의사당대로 1', lat: 37.5180, lng: 126.9220, rating: 4.6, distance: 600, status: 'OPEN', specialty: '응급,수술,피부과', isEmergency: true },
  { id: '12', name: '영등포 튼튼 동물병원', address: '서울 영등포구 당산로 50', lat: 37.5300, lng: 126.9100, rating: 4.5, distance: 1200, status: 'OPEN', specialty: '피부과,치과,노령견케어' },

  // === 분당(서현) - 37.3850, 127.1194 ===
  { id: '13', name: '분당 24시 리더스 동물의료원', address: '경기 성남시 분당구 황새울로 311', lat: 37.3840, lng: 127.1200, rating: 4.9, distance: 300, status: 'OPEN', specialty: '2차진료,MRI,피부과', isEmergency: true },
  { id: '14', name: '서현 아프리카 동물병원', address: '경기 성남시 분당구 서현로 210', lat: 37.3860, lng: 127.1180, rating: 4.7, distance: 450, status: 'OPEN', specialty: '고양이전문,치과,피부과' },
  { id: '15', name: '정자 펫클리닉', address: '경기 성남시 분당구 정자일로 100', lat: 37.3670, lng: 127.1080, rating: 4.5, distance: 2000, status: 'OPEN', specialty: '피부과,예방접종,미용' },

  // === 부산(해운대) - 35.1587, 129.1603 ===
  { id: '16', name: '해운대 센텀 24시 동물병원', address: '부산 해운대구 센텀남대로 35', lat: 35.1600, lng: 129.1620, rating: 4.8, distance: 400, status: 'OPEN', specialty: '응급,노령견,피부과', isEmergency: true },
  { id: '17', name: '마린시티 동물의료센터', address: '부산 해운대구 마린시티2로 33', lat: 35.1550, lng: 129.1580, rating: 4.6, distance: 500, status: 'OPEN', specialty: '피부과,안과,내과' },
  { id: '18', name: '광안리 펫클리닉', address: '부산 수영구 광안해변로 100', lat: 35.1530, lng: 129.1180, rating: 4.5, distance: 4000, status: 'OPEN', specialty: '피부과,치과,예방접종' },

  // === 대구(동성로) - 35.8714, 128.6014 ===
  { id: '19', name: '대구 중앙 24시 동물병원', address: '대구 중구 중앙대로 400', lat: 35.8700, lng: 128.6000, rating: 4.7, distance: 350, status: 'OPEN', specialty: '응급,외과,피부과', isEmergency: true },
  { id: '20', name: '반월당 튼튼 동물병원', address: '대구 중구 달구벌대로 2100', lat: 35.8680, lng: 128.5950, rating: 4.5, distance: 600, status: 'OPEN', specialty: '예방접종,중성화,피부과' },
  { id: '21', name: '동성로 펫케어', address: '대구 중구 동성로 50', lat: 35.8720, lng: 128.5980, rating: 4.6, distance: 450, status: 'OPEN', specialty: '피부과,내과,미용' },

  // === 대전(시청) - 36.3504, 127.3845 ===
  { id: '22', name: '대전 타임 24시 동물의료센터', address: '대전 서구 둔산로 100', lat: 36.3510, lng: 127.3850, rating: 4.8, distance: 300, status: 'OPEN', specialty: '응급,영상의학,피부과', isEmergency: true },
  { id: '23', name: '둔산 펫 클리닉', address: '대전 서구 대덕대로 200', lat: 36.3550, lng: 127.3800, rating: 4.5, distance: 600, status: 'OPEN', specialty: '내과,치과,피부과' },
  { id: '24', name: '유성 동물병원', address: '대전 유성구 대학로 100', lat: 36.3620, lng: 127.3560, rating: 4.6, distance: 3000, status: 'OPEN', specialty: '피부과,예방접종,건강검진' },

  // === 광주(터미널) - 35.1601, 126.8793 ===
  { id: '25', name: '광주 유스퀘어 24시 동물병원', address: '광주 서구 무진대로 904', lat: 35.1610, lng: 126.8800, rating: 4.7, distance: 400, status: 'OPEN', specialty: '응급,골절,피부과', isEmergency: true },
  { id: '26', name: '상무지구 닥터펫', address: '광주 서구 상무중앙로 50', lat: 35.1500, lng: 126.8500, rating: 4.5, distance: 3000, status: 'OPEN', specialty: '피부과,미용,건강검진' },
  { id: '27', name: '광주 중앙 동물병원', address: '광주 동구 충장로 100', lat: 35.1480, lng: 126.9150, rating: 4.6, distance: 4000, status: 'OPEN', specialty: '피부과,내과,치과' },
];

const MOCK_DISEASES: Disease[] = [
  { id: 'd1', name: '슬개골 탈구', symptoms: ['절뚝거림', '통증 호소', '걷기 거부'], description: '무릎 뼈가 원래 위치에서 벗어나는 질환입니다.', prevention: '미끄럼 방지 매트 사용, 체중 관리' },
  { id: 'd2', name: '피부염', symptoms: ['가려움', '붉은 발진', '털 빠짐'], description: '알레르기나 세균 감염으로 인한 피부 염증입니다.', prevention: '정기적인 목욕, 알레르기 유발 음식 피하기' },
];

// ==================== MOCK: 페르소나 챗봇 순차 응답 ====================
// WHY: Kafka 연동이 안 되어있어서 순차적인 목데이터 응답 제공
let personaChatCounter = 0; // 메시지 카운터

const PERSONA_MOCK_RESPONSES = [
  // 첫 번째 질문 응답: 어제 산책
  '어제 산책 괜찮았지! 🐕✨ 날씨도 좋았고 공원 잔디밭에서 뒹굴뒹굴했어! 바람 냄새도 맡고 나비도 쫓아다녔지. 너도 같이 있어서 더 좋았어! 멍멍!',
  
  // 두 번째 질문 응답: 친구들과 놀기
  '어제 친구들이 많아서 재밌게 놀았어! 🐶🐕‍🦺 골든이랑 비글이가 왔는데 같이 뛰고 냄새 맡고 진짜 신났어! 오늘은 집에서 쉬자~ 너무 많이 뛰어서 다리가 살짝 뻐근해 ㅎㅎ',
  
  // 세 번째 질문 응답: 내일 산책 약속
  '내일도 같이 산책하러 가자! 🐾💕 나 진짜 산책이 제일 좋아! 내일은 다른 코스로 가볼까? 맛있는 간식도 챙겨와! 내일이 기다려진다 멍멍~!'
];

// 페르소나 목 응답 반환 함수
const getPersonaMockResponse = (): string => {
  const response = PERSONA_MOCK_RESPONSES[personaChatCounter % PERSONA_MOCK_RESPONSES.length];
  personaChatCounter++;
  return response;
};

// 페르소나 채팅 카운터 리셋 (펫 변경 시 호출)
export const resetPersonaChatCounter = () => {
  personaChatCounter = 0;
};

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
            
            // ==================== MOCK: 페르소나 채팅 순차 응답 ====================
            // WHY: Kafka 연동이 안 되어있으므로 순차적인 목 응답 반환
            resolve({
              id: Date.now().toString(),
              sender: 'bot',
              content: getPersonaMockResponse(),
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
                // 타임아웃 시 순차적 목업 응답
                resolve({
                  id: Date.now().toString(),
                  sender: 'bot',
                  content: getPersonaMockResponse(),
                  timestamp: new Date()
                });
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
      // REAL BACKEND INTEGRATION
      // /api/healthcare/hospitals (HealthcareHospitalController)
      const token = localStorage.getItem('petlog_token');
      const headers = token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {};
      
      const response = await axios.get(`/api/healthcare/hospitals`, { 
        params: { lat, lng },
        headers 
      });
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((h: any) => ({
          id: h.id,
          name: h.name,
          address: h.address,
          lat: h.lat,
          lng: h.lng,
          rating: h.rating,
          distance: h.distance, // 이미 미터 단위
          status: h.status
        }));
      }
      return MOCK_HOSPITALS;
    } catch (error) {
      console.warn("Using mock hospitals due to error", error);
      return MOCK_HOSPITALS;
    }
  },

  // Search Diseases (Vet Knowledge RAG)
  searchDiseases: async (query: string): Promise<Disease[]> => {
    try {
      // REAL BACKEND INTEGRATION
      // /api/vet/knowledge/search (VetKnowledgeController)
      const token = localStorage.getItem('petlog_token');
      const headers = token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {};

      const response = await axios.post(`/api/vet/knowledge/search`, { 
        query,
        topK: 3 
      }, { headers });

      if (response.data && response.data.results) {
         return response.data.results.map((r: any) => ({
            id: r.id.toString(),
            name: r.disease || r.department || '상세 정보',
            symptoms: [r.question], // 질문 내용을 증상/상황으로 매핑
            description: r.answer,
            prevention: '수의사와 상담하여 정확한 진단을 받으세요.'
         }));
      }

      // 검색 결과가 없으면 Mock 데이터 필터링
      return MOCK_DISEASES.filter(d => 
        d.name.includes(query) || d.symptoms.some(s => s.includes(query))
      );
    } catch (error) {
      console.warn("Using mock diseases due to error", error);
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
