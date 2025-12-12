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

                // 거리순 정렬
                filtered.sort((a, b) => a.distance - b.distance);

                setCandidates(filtered);
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

