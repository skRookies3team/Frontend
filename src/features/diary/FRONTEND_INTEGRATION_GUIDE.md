# 🐕 수의사 AI 챗봇 RAG - 프론트엔드 연동 가이드

## 1. API 엔드포인트

### 기본 정보

- **Base URL**: `https://d3uvkb1qxxcp2y.cloudfront.net` (또는 `http://localhost:8085`)
- **Gateway**: `http://localhost:8000/api`

---

## 2. 스마트 챗봇 API (메인)

### `POST /api/chat/smart`

**기존 스마트 챗봇 API가 자동으로 RAG를 사용합니다.**

```typescript
// Request
const response = await fetch('/api/chat/smart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "우리 강아지가 구토를 해요"
  })
});

// Response
{
  "success": true,
  "intent": "GENERAL_HEALTH",  // SKIN_DISEASE, HOSPITAL_SEARCH 등
  "response": "AI 전문 답변...",
  "ragUsed": true,              // ⭐ RAG 사용 여부
  "department": "내과"          // 감지된 진료과
}
```

---

## 3. 진료과별 RAG 동작

| 키워드                 | 진료과 | 예시 질문                   |
| ---------------------- | ------ | --------------------------- |
| 구토, 설사, 식욕, 소화 | 내과   | "강아지가 구토를 해요"      |
| 피부, 탈모, 가려움     | 피부과 | "피부에 붉은 반점이 있어요" |
| 눈, 눈물, 충혈         | 안과   | "눈에서 눈곱이 많이 나와요" |
| 이빨, 잇몸, 입냄새     | 치과   | "입냄새가 심해요"           |

---

## 4. React 컴포넌트 예시

```tsx
// HealthcareChatbot.tsx
import { useState } from "react";

interface ChatResponse {
  success: boolean;
  intent: string;
  response: string;
  ragUsed: boolean;
  department: string;
}

export function HealthcareChatbot() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<ChatResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/chat/smart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message }),
      });

      const data: ChatResponse = await res.json();
      setResponses((prev) => [...prev, data]);
      setMessage("");
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="healthcare-chatbot">
      <div className="chat-messages">
        {responses.map((res, i) => (
          <div key={i} className="message">
            <p>{res.response}</p>
            {res.ragUsed && (
              <span className="rag-badge">📚 {res.department} 지식 활용</span>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="반려동물 건강 질문을 입력하세요..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "답변 생성 중..." : "전송"}
        </button>
      </div>
    </div>
  );
}
```

---

## 5. RAG 상태 표시 UI

```tsx
// RAG 사용 여부 표시
{
  response.ragUsed && (
    <div className="rag-indicator">
      <span className="icon">📚</span>
      <span className="text">
        {response.department} 전문 지식 {getKnowledgeCount()}개 참조
      </span>
    </div>
  );
}
```

---

## 6. 수의사 지식 베이스 관리 API

### 통계 조회

```typescript
GET / api / vet / knowledge / stats;
```

### RAG 검색 테스트

```typescript
POST /api/vet/knowledge/search
{
  "query": "강아지가 구토를 해요",
  "department": "내과",  // optional
  "topK": 5
}
```

---

## 7. 연동 체크리스트

- [ ] API Gateway 통과 확인
- [ ] JWT 토큰 헤더 포함
- [ ] `ragUsed` 필드로 RAG 활용 여부 표시
- [ ] `department` 필드로 진료과 배지 표시
- [ ] 로딩 상태 처리 (RAG 검색에 2-3초 소요)

---

## 8. 예상 응답 시간

| 항목                 | 시간   |
| -------------------- | ------ |
| 일반 응답 (RAG 없음) | ~1초   |
| RAG 검색 + 응답      | ~2-3초 |
| 첫 요청 (Cold Start) | ~5초   |

---

## 9. 에러 처리

```typescript
if (!response.success) {
  // 에러 메시지 표시
  showError("AI 응답 생성에 실패했습니다.");
  return;
}

// RAG 실패해도 기본 응답은 제공
if (!response.ragUsed) {
  // 기본 수의사 모드로 응답
  console.log("RAG 비활용 - 기본 모드");
}
```
