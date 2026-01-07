import axios from 'axios';

const BASE_URL = '/api/chat'; // Proxy setup in package.json points execution to Gateway/Backend

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  type?: 'text' | 'map' | 'disease_list'; // For rich responses
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

export const chatbotApi = {
  // Send Message
  sendMessage: async (message: string, userId: string): Promise<ChatMessage> => {
    try {
      // TODO: Uncomment when backend is ready
      // const response = await axios.post(`${BASE_URL}/message`, { message, userId });
      // return response.data;
      
      // Mock Response Logic
      const isHospitalRequest = message.includes('병원');
      const isDiseaseRequest = message.includes('아파') || message.includes('병');
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate partial delay

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
              content: "관련된 질병 정보를 찾았습니다.",
              timestamp: new Date(),
              type: 'disease_list',
              data: MOCK_DISEASES
          };
      }

      return {
        id: Date.now().toString(),
        sender: 'bot',
        content: `"${message}"에 대해 확인해볼게요! 멍멍!`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Get Nearby Hospitals
  getNearbyHospitals: async (lat: number, lng: number): Promise<Hospital[]> => {
    try {
      // const response = await axios.get(`${BASE_URL}/hospitals`, { params: { lat, lng } });
      // return response.data;
      return MOCK_HOSPITALS;
    } catch (error) {
      console.warn("Using mock hospitals due to error", error);
      return MOCK_HOSPITALS;
    }
  },

  // Search Diseases
  searchDiseases: async (query: string): Promise<Disease[]> => {
    try {
      // const response = await axios.get(`${BASE_URL}/diseases`, { params: { query } });
      // return response.data;
      return MOCK_DISEASES.filter(d => d.name.includes(query) || d.symptoms.some(s => s.includes(query)));
    } catch (error) {
      return MOCK_DISEASES;
    }
  }
};
