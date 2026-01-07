import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Search, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { petMateApi, SearchAddressResult } from "@/features/petmate/api/petmate-api";

interface LocationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (location: string, latitude?: number, longitude?: number) => void;
}

/**
 * 공유 위치 검색 모달
 * - 주소 검색 (Kakao Maps API 연동)
 * - 현재 위치 사용 (GPS + Reverse Geocoding)
 */
export function LocationSearchModal({
    isOpen,
    onClose,
    onSelectLocation,
}: LocationSearchModalProps) {
    const [locationSearch, setLocationSearch] = useState("");
    const [searchResults, setSearchResults] = useState<SearchAddressResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    // 주소 검색
    const handleAddressSearch = async () => {
        if (!locationSearch.trim()) return;

        setSearchLoading(true);
        try {
            const results = await petMateApi.searchAddress(locationSearch);
            setSearchResults(results);
        } catch (error) {
            console.error("Address search failed:", error);
            toast.error("주소 검색에 실패했습니다");
        } finally {
            setSearchLoading(false);
        }
    };

    // 검색 결과 선택
    const handleSelectSearchResult = (result: SearchAddressResult) => {
        const displayLocation = result.buildingName || result.addressName;
        onSelectLocation(displayLocation, result.latitude, result.longitude);
        handleClose();
        toast.success("위치가 설정되었습니다");
    };

    // 현재 위치 사용
    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
            return;
        }

        setIsLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // GPS 좌표 → 주소 변환
                    const addressInfo = await petMateApi.getAddressFromCoords(longitude, latitude);
                    if (addressInfo) {
                        const displayLocation = addressInfo.buildingName || addressInfo.fullAddress;
                        onSelectLocation(displayLocation, latitude, longitude);
                        handleClose();
                        toast.success("현재 위치로 설정되었습니다");
                    }
                } catch (error) {
                    console.error("Failed to get address:", error);
                    // 주소 변환 실패 시 좌표로 표시
                    onSelectLocation(`위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`, latitude, longitude);
                    handleClose();
                    toast.success("현재 위치로 설정되었습니다");
                } finally {
                    setIsLocationLoading(false);
                }
            },
            (error) => {
                setIsLocationLoading(false);
                console.error("Geolocation error:", error);
                toast.error("위치를 찾을 수 없습니다.");
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    // 모달 닫기 (상태 초기화)
    const handleClose = () => {
        setSearchResults([]);
        setLocationSearch("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>위치 설정</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* 주소 검색 입력 */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="주소 검색..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
                        />
                        <Button onClick={handleAddressSearch} disabled={searchLoading || !locationSearch}>
                            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* 검색 중 표시 */}
                    {searchLoading && <p className="text-center text-gray-500">검색 중...</p>}

                    {/* 검색 결과 목록 */}
                    {searchResults.length > 0 && (
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectSearchResult(result)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-pink-50 transition-colors border border-gray-100"
                                >
                                    <p className="font-medium text-gray-900">
                                        {result.buildingName || result.addressName}
                                    </p>
                                    {result.buildingName && (
                                        <p className="text-sm text-gray-500 mt-1">{result.addressName}</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 현재 위치 버튼 */}
                    <Button
                        variant="outline"
                        onClick={handleCurrentLocation}
                        disabled={isLocationLoading}
                        className="w-full"
                    >
                        <Navigation className={`mr-2 h-4 w-4 ${isLocationLoading ? "animate-spin" : ""}`} />
                        {isLocationLoading ? "위치 찾는 중..." : "현재 위치 사용"}
                    </Button>
                </div>

                {/* 닫기 버튼 */}
                <Button onClick={handleClose} className="w-full">
                    닫기
                </Button>
            </DialogContent>
        </Dialog>
    );
}
