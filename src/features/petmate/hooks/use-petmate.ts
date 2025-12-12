import { useState, useEffect, useCallback } from 'react';
import { petMateApi, PetMateCandidate, PetMateFilter, MatchResult } from '../api/petmate-api';

// Haversine 거리 계산 함수
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 지구 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // 소수점 2자리
}

// Mock data for fallback when API is unavailable
// 서울 강남구 역삼역 기준 좌표: 37.5007, 127.0365
const MOCK_CANDIDATES: (PetMateCandidate & { latitude: number; longitude: number })[] = [
    {
        id: 1,
        userId: 1,
        userName: "포메사랑",
        userAvatar: "/woman-profile.png",
        userGender: "여성",
        petName: "뭉치",
        petBreed: "포메라니안",
        petAge: 3,
        petGender: "남아",
        petPhoto: "/cute-pomeranian.png",
        distance: 0,  // 동적 계산
        location: "서울 중구 동호로",
        latitude: 37.5562,   // 역삼역 근처
        longitude: 127.0054,
        bio: "매일 저녁 7시에 한강공원에서 산책해요! 같은 포메 친구 찾아요",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 85,
        commonInterests: ["한강 산책", "소형견 모임", "미용 정보"],
        matchScore: 95,
        isOnline: true,
    },
    {
        id: 2,
        userId: 2,
        userName: "골댕이집사",
        userAvatar: "/man-profile.png",
        userGender: "남성",
        petName: "해피",
        petBreed: "골든 리트리버",
        petAge: 2,
        petGender: "여아",
        petPhoto: "/happy-golden-retriever.png",
        distance: 0,
        location: "서울 강남구 삼성동",
        latitude: 37.5088,   // 삼성역 근처
        longitude: 127.0631,
        bio: "활발한 골댕이와 함께 공원 러닝 즐겨요! 대형견 친구 환영합니다",
        bioIcon: "/icons/running.svg",
        activityLevel: 95,
        commonInterests: ["러닝", "프리스비", "수영"],
        matchScore: 88,
        isOnline: true,
    },
    {
        id: 3,
        userId: 3,
        userName: "닥스훈트맘",
        userAvatar: "/diverse-woman-smiling.png",
        userGender: "여성",
        petName: "소시지",
        petBreed: "닥스훈트",
        petAge: 5,
        petGender: "남아",
        petPhoto: "/dachshund-dog.png",
        distance: 0,
        location: "서울 서초구 서초동",
        latitude: 37.4923,   // 서초역 근처
        longitude: 127.0276,
        bio: "느긋하게 산책 좋아하는 소형견이에요. 주말 아침 산책 메이트 구해요!",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 60,
        commonInterests: ["느긋한 산책", "카페 투어", "사진 찍기"],
        matchScore: 82,
        isOnline: false,
    },
    {
        id: 4,
        userId: 4,
        userName: "시바견주인",
        userAvatar: "/casual-man.png",
        userGender: "남성",
        petName: "코코",
        petBreed: "시바견",
        petAge: 4,
        petGender: "여아",
        petPhoto: "/shiba-inu.png",
        distance: 0,
        location: "서울 송파구 잠실동",
        latitude: 37.5133,   // 잠실역 근처
        longitude: 127.1001,
        bio: "산책 좋아하는 시바견이에요. 평일 저녁 함께 산책하실 분!",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 75,
        commonInterests: ["산책", "간식", "놀이터"],
        matchScore: 78,
        isOnline: true,
    },
    {
        id: 5,
        userId: 5,
        userName: "비글사랑",
        userAvatar: "/woman-with-stylish-glasses.png",
        userGender: "여성",
        petName: "바니",
        petBreed: "비글",
        petAge: 3,
        petGender: "여아",
        petPhoto: "/beagle-puppy.png",
        distance: 0,
        location: "서울 강남구 논현동",
        latitude: 37.5115,   // 논현역 근처
        longitude: 127.0215,
        bio: "에너지 넘치는 비글이에요! 주말 공원 런 같이 하실 분 찾아요",
        bioIcon: "/icons/running.svg",
        activityLevel: 90,
        commonInterests: ["달리기", "공놀이", "간식 탐험"],
        matchScore: 91,
        isOnline: true,
    },
    {
        id: 6,
        userId: 6,
        userName: "말티즈엄마",
        userAvatar: "/woman-friendly.jpg",
        userGender: "여성",
        petName: "뽀미",
        petBreed: "말티즈",
        petAge: 2,
        petGender: "여아",
        petPhoto: "/white-maltese-dog.jpg",
        distance: 0,
        location: "서울 강남구 신사동",
        latitude: 37.5165,   // 신사역 근처
        longitude: 127.0203,
        bio: "조용하고 착한 말티즈예요. 카페 투어 좋아하는 분 환영해요",
        bioIcon: "/icons/cafe.svg",
        activityLevel: 50,
        commonInterests: ["카페", "미용", "사진"],
        matchScore: 87,
        isOnline: true,
    },
    {
        id: 7,
        userId: 7,
        userName: "푸들아빠",
        userAvatar: "/man-profile.png",
        userGender: "남성",
        petName: "몽이",
        petBreed: "푸들",
        petAge: 3,
        petGender: "남아",
        petPhoto: "/poodle-dog.png",
        distance: 0,
        location: "서울 마포구 상암동",
        latitude: 37.5789,
        longitude: 126.8892,
        bio: "활발한 푸들과 함께 놀아요! 평일 오후 시간 있으신 분",
        bioIcon: "/icons/running.svg",
        activityLevel: 80,
        commonInterests: ["놀이터", "훈련", "친구 만들기"],
        matchScore: 84,
        isOnline: true,
    },
    {
        id: 8,
        userId: 8,
        userName: "웰시코기맘",
        userAvatar: "/woman-friendly.jpg",
        userGender: "여성",
        petName: "버터",
        petBreed: "웰시코기",
        petAge: 2,
        petGender: "남아",
        petPhoto: "/welsh-corgi.png",
        distance: 0,
        location: "서울 용산구 한남동",
        latitude: 37.5345,
        longitude: 127.0010,
        bio: "귀여운 웰시코기와 함께해요! 같은 코기 친구 찾습니다",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 70,
        commonInterests: ["산책", "간식", "사진"],
        matchScore: 89,
        isOnline: false,
    },
    {
        id: 9,
        userId: 9,
        userName: "허스키러버",
        userAvatar: "/casual-man.png",
        userGender: "남성",
        petName: "눈이",
        petBreed: "시베리안 허스키",
        petAge: 4,
        petGender: "여아",
        petPhoto: "/siberian-husky.png",
        distance: 0,
        location: "서울 성북구 정릉동",
        latitude: 37.6034,
        longitude: 126.9563,
        bio: "활동량 많은 허스키예요! 함께 달리실 분 환영",
        bioIcon: "/icons/running.svg",
        activityLevel: 95,
        commonInterests: ["달리기", "등산", "수영"],
        matchScore: 76,
        isOnline: true,
    },
    {
        id: 10,
        userId: 10,
        userName: "치와와집사",
        userAvatar: "/diverse-woman-smiling.png",
        userGender: "여성",
        petName: "콩이",
        petBreed: "치와와",
        petAge: 5,
        petGender: "남아",
        petPhoto: "/chihuahua.png",
        distance: 0,
        location: "서울 강동구 천호동",
        latitude: 37.5387,
        longitude: 127.1234,
        bio: "작지만 용감한 치와와! 소형견 모임 좋아해요",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 55,
        commonInterests: ["실내 놀이", "간식", "옷 입히기"],
        matchScore: 80,
        isOnline: true,
    },
    {
        id: 11,
        userId: 11,
        userName: "래브라도러버",
        userAvatar: "/man-profile.png",
        userGender: "남성",
        petName: "초코",
        petBreed: "래브라도 리트리버",
        petAge: 3,
        petGender: "남아",
        petPhoto: "/labrador.png",
        distance: 0,
        location: "서울 영등포구 여의도동",
        latitude: 37.5267,
        longitude: 126.9246,
        bio: "친근한 래브라도와 함께해요! 수영 좋아하는 친구 찾아요",
        bioIcon: "/icons/running.svg",
        activityLevel: 88,
        commonInterests: ["수영", "공놀이", "산책"],
        matchScore: 92,
        isOnline: true,
    },
    {
        id: 12,
        userId: 12,
        userName: "프렌치불독맘",
        userAvatar: "/woman-with-stylish-glasses.png",
        userGender: "여성",
        petName: "두부",
        petBreed: "프렌치 불독",
        petAge: 4,
        petGender: "여아",
        petPhoto: "/french-bulldog.png",
        distance: 0,
        location: "서울 종로구 삼청동",
        latitude: 37.5825,
        longitude: 126.9824,
        bio: "느긋한 프렌치불독이에요. 같이 카페 투어 하실 분!",
        bioIcon: "/icons/cafe.svg",
        activityLevel: 45,
        commonInterests: ["카페", "낮잠", "간식"],
        matchScore: 83,
        isOnline: false,
    },
    {
        id: 13,
        userId: 13,
        userName: "진돗개주인",
        userAvatar: "/casual-man.png",
        userGender: "남성",
        petName: "백구",
        petBreed: "진돗개",
        petAge: 5,
        petGender: "남아",
        petPhoto: "/jindo-dog.png",
        distance: 0,
        location: "서울 노원구 상계동",
        latitude: 37.6543,
        longitude: 127.0654,
        bio: "충성스러운 진돗개와 함께합니다. 산책 메이트 구해요",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 75,
        commonInterests: ["산책", "훈련", "자연"],
        matchScore: 77,
        isOnline: true,
    },
    {
        id: 14,
        userId: 14,
        userName: "슈나우저맘",
        userAvatar: "/woman-friendly.jpg",
        userGender: "여성",
        petName: "소금이",
        petBreed: "미니어처 슈나우저",
        petAge: 3,
        petGender: "여아",
        petPhoto: "/schnauzer.png",
        distance: 0,
        location: "서울 관악구 신림동",
        latitude: 37.4844,
        longitude: 126.9297,
        bio: "똑똑한 슈나우저예요! 중소형견 친구 찾습니다",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 65,
        commonInterests: ["산책", "훈련", "사회화"],
        matchScore: 86,
        isOnline: true,
    },
    {
        id: 15,
        userId: 15,
        userName: "불독파파",
        userAvatar: "/man-profile.png",
        userGender: "남성",
        petName: "땅콩",
        petBreed: "잉글리시 불독",
        petAge: 6,
        petGender: "남아",
        petPhoto: "/english-bulldog.png",
        distance: 0,
        location: "서울 동작구 사당동",
        latitude: 37.4764,
        longitude: 126.9816,
        bio: "느긋하고 귀여운 불독! 저녁 짧은 산책 함께해요",
        bioIcon: "/icons/cafe.svg",
        activityLevel: 35,
        commonInterests: ["짧은 산책", "낮잠", "간식"],
        matchScore: 79,
        isOnline: false,
    },
    {
        id: 16,
        userId: 16,
        userName: "보더콜리맘",
        userAvatar: "/diverse-woman-smiling.png",
        userGender: "여성",
        petName: "별이",
        petBreed: "보더콜리",
        petAge: 2,
        petGender: "여아",
        petPhoto: "/border-collie.png",
        distance: 0,
        location: "서울 은평구 불광동",
        latitude: 37.6123,
        longitude: 126.9287,
        bio: "에너지 넘치는 보더콜리! 같이 뛰어놀 친구 찾아요",
        bioIcon: "/icons/running.svg",
        activityLevel: 98,
        commonInterests: ["프리스비", "달리기", "민첩성 훈련"],
        matchScore: 94,
        isOnline: true,
    },
    {
        id: 17,
        userId: 17,
        userName: "요크셔파파",
        userAvatar: "/casual-man.png",
        userGender: "남성",
        petName: "밤이",
        petBreed: "요크셔테리어",
        petAge: 4,
        petGender: "남아",
        petPhoto: "/yorkshire.png",
        distance: 0,
        location: "서울 서대문구 연희동",
        latitude: 37.5678,
        longitude: 126.9345,
        bio: "귀염둥이 요키예요! 소형견 모임 참여하고 싶어요",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 60,
        commonInterests: ["미용", "패션", "카페"],
        matchScore: 81,
        isOnline: true,
    },
    {
        id: 18,
        userId: 18,
        userName: "사모예드맘",
        userAvatar: "/woman-with-stylish-glasses.png",
        userGender: "여성",
        petName: "구름이",
        petBreed: "사모예드",
        petAge: 3,
        petGender: "여아",
        petPhoto: "/samoyed.png",
        distance: 0,
        location: "서울 광진구 건대입구",
        latitude: 37.5401,
        longitude: 127.0688,
        bio: "하얀 구름같은 사모예드! 대형견 친구 환영해요",
        bioIcon: "/icons/running.svg",
        activityLevel: 85,
        commonInterests: ["산책", "놀이", "그루밍"],
        matchScore: 90,
        isOnline: true,
    },
    {
        id: 19,
        userId: 19,
        userName: "비숑집사",
        userAvatar: "/woman-friendly.jpg",
        userGender: "여성",
        petName: "솜이",
        petBreed: "비숑 프리제",
        petAge: 2,
        petGender: "남아",
        petPhoto: "/bichon.png",
        distance: 0,
        location: "서울 중랑구 면목동",
        latitude: 37.5889,
        longitude: 127.0923,
        bio: "귀여운 비숑이에요! 소형견 친구들과 놀고 싶어요",
        bioIcon: "/icons/paw-print.svg",
        activityLevel: 70,
        commonInterests: ["놀이", "미용", "산책"],
        matchScore: 88,
        isOnline: false,
    },
    {
        id: 20,
        userId: 20,
        userName: "도베르만주인",
        userAvatar: "/man-profile.png",
        userGender: "남성",
        petName: "제우스",
        petBreed: "도베르만",
        petAge: 4,
        petGender: "남아",
        petPhoto: "/doberman.png",
        distance: 0,
        location: "서울 강북구 수유동",
        latitude: 37.6387,
        longitude: 127.0254,
        bio: "훈련된 도베르만이에요! 규칙적인 산책 파트너 구합니다",
        bioIcon: "/icons/running.svg",
        activityLevel: 90,
        commonInterests: ["훈련", "달리기", "경비"],
        matchScore: 75,
        isOnline: true,
    },
];

interface UsePetMateOptions {
    userId: number;
    useMockData?: boolean;
    initialFilter?: PetMateFilter;
}

interface ToggleLikeResult {
    action: 'liked' | 'unliked' | 'matched';
    matchResult?: MatchResult;
}

export function usePetMate({ userId, useMockData = true, initialFilter }: UsePetMateOptions) {
    const [candidates, setCandidates] = useState<PetMateCandidate[]>([]);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [likedUserIds, setLikedUserIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFilter, setCurrentFilter] = useState<PetMateFilter | undefined>(initialFilter);

    // Fetch candidates
    const fetchCandidates = useCallback(async (filter?: PetMateFilter) => {
        setLoading(true);
        setError(null);

        try {
            if (useMockData) {
                // 사용자 좌표가 있으면 실제 거리 계산
                let filtered = MOCK_CANDIDATES.map(c => {
                    if (filter?.latitude && filter?.longitude) {
                        const dist = calculateDistance(
                            filter.latitude, filter.longitude,
                            c.latitude, c.longitude
                        );
                        return { ...c, distance: dist };
                    }
                    return c;
                });

                // 거리 필터링
                if (filter?.radiusKm && filter?.latitude && filter?.longitude) {
                    filtered = filtered.filter(c => c.distance <= filter.radiusKm!);
                }
                if (filter?.userGender && filter.userGender !== 'all') {
                    const genderMap: Record<string, string> = { male: '남성', female: '여성' };
                    filtered = filtered.filter(c => c.userGender === genderMap[filter.userGender!]);
                }
                if (filter?.petBreed && filter.petBreed !== 'all') {
                    filtered = filtered.filter(c => c.petBreed === filter.petBreed);
                }

                // 랜덤 셔플 후 10명만 선택
                const shuffled = filtered.sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 10);

                // 선택된 후보 중에서 거리순 정렬
                selected.sort((a, b) => a.distance - b.distance);

                setCandidates(selected);
            } else {
                const data = await petMateApi.getCandidates(userId, filter);
                setCandidates(data);
            }
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
            setError('후보자 목록을 불러오는데 실패했습니다.');
            setCandidates(MOCK_CANDIDATES);
        } finally {
            setLoading(false);
        }
    }, [userId, useMockData]);

    // Fetch liked user IDs
    const fetchLikedUsers = useCallback(async () => {
        try {
            if (useMockData) {
                // Mock: empty set initially
                setLikedUserIds(new Set());
            } else {
                const ids = await petMateApi.getLikedUserIds(userId);
                setLikedUserIds(new Set(ids));
            }
        } catch (err) {
            console.error('Failed to fetch liked users:', err);
        }
    }, [userId, useMockData]);

    // Toggle like (like/unlike)
    const toggleLike = useCallback(async (toUserId: number): Promise<ToggleLikeResult | null> => {
        try {
            const isLiked = likedUserIds.has(toUserId);

            if (useMockData) {
                if (isLiked) {
                    // Unlike
                    setLikedUserIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(toUserId);
                        return newSet;
                    });
                    return { action: 'unliked' };
                } else {
                    // Like - simulate 30% match chance
                    setLikedUserIds(prev => new Set(prev).add(toUserId));
                    const isMatch = Math.random() > 0.7;
                    const matchedCandidate = candidates.find(c => c.userId === toUserId);

                    if (isMatch) {
                        return {
                            action: 'matched',
                            matchResult: {
                                matchId: Date.now(),
                                matchedUserId: toUserId,
                                matchedUserName: matchedCandidate?.userName || '',
                                matchedUserAvatar: matchedCandidate?.userAvatar || '',
                                petName: matchedCandidate?.petName || '',
                                petPhoto: matchedCandidate?.petPhoto || '',
                                isMatched: true,
                                matchedAt: new Date().toISOString(),
                                chatRoomId: Date.now(),
                            },
                        };
                    }
                    return { action: 'liked' };
                }
            } else {
                if (isLiked) {
                    // Unlike via API
                    const success = await petMateApi.unlike({ fromUserId: userId, toUserId });
                    if (success) {
                        setLikedUserIds(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(toUserId);
                            return newSet;
                        });
                        return { action: 'unliked' };
                    }
                    return null;
                } else {
                    // Like via API
                    const result = await petMateApi.like({ fromUserId: userId, toUserId });

                    if (result.alreadyLiked) {
                        // Already liked - shouldn't happen but handle it
                        setLikedUserIds(prev => new Set(prev).add(toUserId));
                        return { action: 'liked' };
                    }

                    setLikedUserIds(prev => new Set(prev).add(toUserId));

                    if (result.isMatched) {
                        return { action: 'matched', matchResult: result };
                    }
                    return { action: 'liked' };
                }
            }
        } catch (err) {
            console.error('Failed to toggle like:', err);
            setError('좋아요 처리에 실패했습니다.');
            return null;
        }
    }, [userId, useMockData, likedUserIds, candidates]);

    // Legacy likeUser (for backward compat, calls toggleLike internally)
    const likeUser = useCallback(async (toUserId: number): Promise<MatchResult | null> => {
        const result = await toggleLike(toUserId);
        if (result?.action === 'matched' && result.matchResult) {
            return result.matchResult;
        }
        return null;
    }, [toggleLike]);

    // Fetch matches
    const fetchMatches = useCallback(async () => {
        try {
            if (useMockData) {
                setMatches([]);
            } else {
                const data = await petMateApi.getMatches(userId);
                setMatches(data);
            }
        } catch (err) {
            console.error('Failed to fetch matches:', err);
        }
    }, [userId, useMockData]);

    // Update online status
    const updateOnlineStatus = useCallback(async (isOnline: boolean) => {
        if (!useMockData) {
            try {
                await petMateApi.updateOnlineStatus(userId, isOnline);
            } catch (err) {
                console.error('Failed to update online status:', err);
            }
        }
    }, [userId, useMockData]);

    // Check if a user is liked
    const isUserLiked = useCallback((targetUserId: number) => {
        return likedUserIds.has(targetUserId);
    }, [likedUserIds]);

    // Update filter and refetch candidates
    const updateFilter = useCallback((newFilter: PetMateFilter) => {
        setCurrentFilter(newFilter);
        fetchCandidates(newFilter);
    }, [fetchCandidates]);

    // Initial fetch
    useEffect(() => {
        fetchCandidates(currentFilter);
        fetchMatches();
        fetchLikedUsers();
    }, []);  // Only run once on mount

    // Refetch when initialFilter changes from parent
    useEffect(() => {
        if (initialFilter) {
            setCurrentFilter(initialFilter);
            fetchCandidates(initialFilter);
        }
    }, [initialFilter?.latitude, initialFilter?.longitude, initialFilter?.radiusKm]);

    return {
        candidates,
        matches,
        likedUserIds,
        loading,
        error,
        currentFilter,
        fetchCandidates,
        updateFilter,
        likeUser,
        toggleLike,
        isUserLiked,
        fetchMatches,
        updateOnlineStatus,
    };
}

