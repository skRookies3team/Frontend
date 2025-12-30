import React, { useState } from 'react';
import { X, Search, MapPin, Loader2 } from 'lucide-react';
import { petMateApi, SearchAddressResult } from '@/features/petmate/api/petmate-api';
// Use standard UI components if available, or fall back to standard HTML for simplicity if UI lib is complex to setup in a new file without checking all exports.
// GalleryModal used raw tailwind. I will use raw tailwind for speed and consistency with GalleryModal unless I see shared/ui usage is simpler.
// Actually, using the same style as GalleryModal (raw tailwind) is safer to avoid import errors of shared components I haven't fully verified.

interface LocationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (name: string, lat: number, lng: number) => void;
}

const LocationSearchModal = ({ isOpen, onClose, onSelectLocation }: LocationSearchModalProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchAddressResult[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        console.log(`[LocationSearch] Searching for: ${query}`);
        try {
            const data = await petMateApi.searchAddress(query);
            console.log("[LocationSearch] Results:", data);
            setResults(data);
        } catch (error) {
            console.error("[LocationSearch] Search failed:", error);
            // Optionally set empty results or error state
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (place: SearchAddressResult) => {
        const displayName = place.buildingName || place.roadAddress || place.addressName;
        onSelectLocation(displayName, place.latitude, place.longitude);
        onClose();
    };

    const handleCurrentLocation = async () => {
        setLoading(true);
        console.log("[LocationSearch] Getting current location directly...");
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocation not supported"));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            console.log(`[LocationSearch] GPS: ${latitude}, ${longitude}`);

            const addr = await petMateApi.getAddressFromCoords(longitude, latitude);
            const name = addr.buildingName || addr.fullAddress;
            console.log("[LocationSearch] Address found:", name);

            onSelectLocation(name, latitude, longitude);
            onClose();
        } catch (error) {
            console.error("[LocationSearch] Failed to get current location:", error);
            // Optionally show error toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
            <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden max-h-[80vh]">
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-pink-500" />
                        위치 검색
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-5 pb-0 space-y-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="건물명, 도로명, 지번으로 검색..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder:text-gray-400"
                            autoFocus
                        />
                        <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            검색
                        </button>
                    </form>

                    <button
                        onClick={handleCurrentLocation}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium border border-pink-100"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        현재 위치로 설정하기
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-2 mt-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                            <span className="text-sm">검색 중...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="space-y-1">
                            {results.map((place, idx) => (
                                <li key={idx}>
                                    <button
                                        onClick={() => handleSelect(place)}
                                        className="w-full text-left px-4 py-3 hover:bg-pink-50 rounded-xl transition-colors group"
                                    >
                                        <div className="font-bold text-gray-800 group-hover:text-pink-600">
                                            {place.buildingName || place.addressName}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-0.5 truncate">
                                            {place.roadAddress || place.addressName}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                            <MapPin className="w-8 h-8 text-gray-200" />
                            <span className="text-sm">검색 결과가 없습니다.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationSearchModal;
