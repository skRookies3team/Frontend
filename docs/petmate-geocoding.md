# 펫메이트 위치 기반 기능 (지오코딩/역지오코딩)

## 기능 설명
- 펫메이트 서비스에서 사용자의 **위치 기반 매칭**을 위한 **GPS 좌표 ↔ 주소 변환** 기능
- 사용자의 현재 위치를 자동으로 감지하거나, 주소 검색을 통해 위치를 설정하여 근처 펫메이트를 찾을 수 있도록 지원

## 상세 내용

### 역지오코딩 (GPS → 주소)
- [x] 브라우저 `navigator.geolocation` API로 사용자 GPS 좌표 획득
- [x] `petMateApi.getAddressFromCoords(longitude, latitude)` 함수로 좌표를 주소로 변환
- [x] 백엔드 API 엔드포인트: `GET /api/geocoding/reverse?x={longitude}&y={latitude}`
- [x] 반환 타입 `AddressInfo`: `fullAddress`, `roadAddress`, `region1/2/3`, `zoneNo`, `buildingName`

### 지오코딩 (주소 → GPS)
- [x] 주소 검색 입력창에서 사용자가 검색어 입력
- [x] `petMateApi.searchAddress(query)` 함수로 주소 검색 및 좌표 반환
- [x] 백엔드 API 엔드포인트: `GET /api/geocoding/search?query={검색어}`
- [x] 반환 타입 `SearchAddressResult`: `addressName`, `roadAddress`, `latitude`, `longitude`, `region1/2/3`

### UI 적용
- [x] 페이지 로드 시 자동으로 현재 위치 감지 및 주소 표시
- [x] 위치 설정 모달에서 주소 검색 기능 제공
- [x] "현재 위치 사용" 버튼으로 GPS 위치 재설정
- [x] 설정된 좌표 기반으로 펫메이트 거리 필터링 적용

## 참고 사항

### 관련 파일
| 파일 | 설명 |
|------|------|
| `petmate-api.ts` | API 함수 및 타입 정의 |
| `PetMatePage.tsx` | 위치 설정 UI 및 상태 관리 |
| `use-petmate.ts` | 거리 계산 (Haversine 공식) |

### 데이터 흐름
```
[사용자] → navigator.geolocation
    ↓
[GPS 좌표] → /api/geocoding/reverse
    ↓
[주소 표시] → setCurrentLocation(fullAddress)
    ↓
[필터 적용] → updateFilter({latitude, longitude, radiusKm})
    ↓
[거리 계산 후 매칭] → Haversine 공식으로 후보자 거리 계산
```

### 백엔드 연동
- Kakao Maps Geocoding API 사용 예정
- 현재 mock 데이터로 테스트 중
