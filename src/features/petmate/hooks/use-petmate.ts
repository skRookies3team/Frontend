import { useState, useEffect, useCallback } from 'react';
import { petMateApi, PetMateCandidate, PetMateFilter, MatchResult, PendingRequest } from '../api/petmate-api';

interface UsePetMateOptions {
    userId: number;
    initialFilter?: PetMateFilter;
}

interface ToggleLikeResult {
    action: 'liked' | 'unliked' | 'matched';
    matchResult?: MatchResult;
}

export function usePetMate({ userId, initialFilter }: UsePetMateOptions) {
    const [candidates, setCandidates] = useState<PetMateCandidate[]>([]);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [likedUserIds, setLikedUserIds] = useState<Set<number>>(new Set());
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFilter, setCurrentFilter] = useState<PetMateFilter | undefined>(initialFilter);

    // Fetch candidates from API
    const fetchCandidates = useCallback(async (filter?: PetMateFilter) => {
        setLoading(true);
        setError(null);

        try {
            const data = await petMateApi.getCandidates(userId, filter);
            setCandidates(data);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
            setError('후보자 목록을 불러오는데 실패했습니다.');
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch liked user IDs from API
    const fetchLikedUsers = useCallback(async () => {
        try {
            const ids = await petMateApi.getLikedUserIds(userId);
            setLikedUserIds(new Set(ids));
        } catch (err) {
            console.error('Failed to fetch liked users:', err);
            setLikedUserIds(new Set());
        }
    }, [userId]);

    // Toggle like (like/unlike)
    const toggleLike = useCallback(async (toUserId: number): Promise<ToggleLikeResult | null> => {
        try {
            const isLiked = likedUserIds.has(toUserId);

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
                    setLikedUserIds(prev => new Set(prev).add(toUserId));
                    return { action: 'liked' };
                }

                setLikedUserIds(prev => new Set(prev).add(toUserId));

                if (result.isMatched) {
                    return { action: 'matched', matchResult: result };
                }
                return { action: 'liked' };
            }
        } catch (err) {
            console.error('Failed to toggle like:', err);
            setError('좋아요 처리에 실패했습니다.');
            return null;
        }
    }, [userId, likedUserIds]);

    // Legacy likeUser (for backward compat, calls toggleLike internally)
    const likeUser = useCallback(async (toUserId: number): Promise<MatchResult | null> => {
        const result = await toggleLike(toUserId);
        if (result?.action === 'matched' && result.matchResult) {
            return result.matchResult;
        }
        return null;
    }, [toggleLike]);

    // Fetch matches from API
    const fetchMatches = useCallback(async () => {
        try {
            const data = await petMateApi.getMatches(userId);
            setMatches(data);
        } catch (err) {
            console.error('Failed to fetch matches:', err);
            setMatches([]);
        }
    }, [userId]);

    // Update online status
    const updateOnlineStatus = useCallback(async (isOnline: boolean) => {
        try {
            await petMateApi.updateOnlineStatus(userId, isOnline);
        } catch (err) {
            console.error('Failed to update online status:', err);
        }
    }, [userId]);

    // Check if a user is liked
    const isUserLiked = useCallback((targetUserId: number) => {
        return likedUserIds.has(targetUserId);
    }, [likedUserIds]);

    // Update filter and refetch candidates
    const updateFilter = useCallback((newFilter: PetMateFilter) => {
        setCurrentFilter(newFilter);
        fetchCandidates(newFilter);
    }, [fetchCandidates]);

    // Fetch pending requests from API
    const fetchPendingRequests = useCallback(async () => {
        try {
            const data = await petMateApi.getPendingRequests(userId);
            setPendingRequests(data);
            setPendingCount(data.length);
        } catch (err) {
            console.error('Failed to fetch pending requests:', err);
            setPendingRequests([]);
            setPendingCount(0);
        }
    }, [userId]);

    // Accept a pending request
    const acceptRequest = useCallback(async (matchId: number): Promise<MatchResult | null> => {
        try {
            const result = await petMateApi.respondToRequest(matchId, userId, true);
            // Refresh pending requests after accepting
            await fetchPendingRequests();
            // Refresh matches as we now have a new match
            await fetchMatches();
            return result;
        } catch (err) {
            console.error('Failed to accept request:', err);
            setError('요청 수락에 실패했습니다.');
            return null;
        }
    }, [userId, fetchPendingRequests, fetchMatches]);

    // Reject a pending request
    const rejectRequest = useCallback(async (matchId: number): Promise<boolean> => {
        try {
            await petMateApi.respondToRequest(matchId, userId, false);
            // Refresh pending requests after rejecting
            await fetchPendingRequests();
            return true;
        } catch (err) {
            console.error('Failed to reject request:', err);
            setError('요청 거절에 실패했습니다.');
            return false;
        }
    }, [userId, fetchPendingRequests]);

    // Initial fetch
    useEffect(() => {
        fetchCandidates(currentFilter);
        fetchMatches();
        fetchLikedUsers();
        fetchPendingRequests();
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
        pendingRequests,
        pendingCount,
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
        fetchPendingRequests,
        acceptRequest,
        rejectRequest,
    };
}
