import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { format } from 'date-fns';
import { ImageSource } from "../types/diary";
import {
    getLocationHistory,
    createAiDiaryApi,
    getDiary
} from "../api/diary-api";

import { petMateApi } from "@/features/petmate/api/petmate-api";
import UploadStep from '../components/UploadStep';
import GeneratingStep from '../components/GeneratingStep';
import GalleryModal from '../components/GalleryModal';
import { getAllArchivesApi } from "@/features/auth/api/auth-api";

const DiaryUploadPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useDiaryAuth();

    const STORAGE_KEY = 'ai_diary_backup';

    // --- Session Storage Helper ---
    const getSavedState = (key: string, defaultVal: any) => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed[key] !== undefined ? parsed[key] : defaultVal;
            }
        } catch (e) {
            console.error("Failed to parse session state", e);
        }
        return defaultVal;
    };

    // --- States ---
    const [step, setStep] = useState<string>("upload");

    // Date: Priority -> Navigation State -> Session Storage -> Today
    const [selectedDate, setSelectedDate] = useState(() => {
        if (location.state?.date) return location.state.date;
        return getSavedState('selectedDate', format(new Date(), 'yyyy-MM-dd'));
    });

    const [selectedImages, setSelectedImages] = useState<any[]>(() => getSavedState('selectedImages', []));
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState<number>(0);

    const [pets, setPets] = useState<any[]>([]);
    const [selectedPetId, setSelectedPetId] = useState<number | null>(() => getSavedState('selectedPetId', null));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const [archiveImages, setArchiveImages] = useState<{ archiveId: number, url: string }[]>([]);

    // Load Pets
    useEffect(() => {
        if (user) {
            const userPets = user.pets || [];
            const mappedPets = userPets.map((p: any) => ({
                petId: Number(p.petId || p.id),
                petName: p.petName || p.name,
                species: (p.species === 'CAT' || p.species === '고양이') ? 'CAT' : 'DOG',
            }));
            setPets(mappedPets);
            if (mappedPets.length > 0 && !selectedPetId) {
                setSelectedPetId(mappedPets[0].petId);
            }
        }
    }, [user]);

    // Load Archive
    useEffect(() => {
        if (user && showGallery) {
            getAllArchivesApi()
                .then((res) => {
                    if (res && res.archives) {
                        setArchiveImages(res.archives.map((a: any) => ({
                            archiveId: a.archiveId,
                            url: a.url
                        })));
                    }
                })
                .catch(err => console.error("보관함 로드 실패:", err));
        }
    }, [user, showGallery]);

    // Persist State
    useEffect(() => {
        const stateToSave = {
            step, // Should be 'upload' or 'generating' (but generating isn't usually persisted safely, we'll see)
            selectedDate,
            selectedPetId,
            selectedImages: selectedImages.filter(img => img.source !== 'GALLERY' || img.imageUrl.startsWith('http')),
            // We persist these too so the next page can pick them up? 
            // Actually, the next page needs 'createdDiaryId', 'editedDiary' etc.
            // We will save them ON SUCCESS before navigating.
        };
        // We update session storage with current selections so if they refresh they stay here
        // But we don't want to overwrite the 'edit' page data if we are just here.
        // Ideally we merge? Simple setItem overwrites.

        // For now, simple save.
        const current = sessionStorage.getItem(STORAGE_KEY);
        const parsed = current ? JSON.parse(current) : {};

        // Determine what to save. We only want to save inputs.
        const newState = {
            ...parsed,
            step: step === 'generating' ? 'upload' : step, // Don't save 'generating'
            selectedDate,
            selectedPetId,
            selectedImages: selectedImages.filter(img => img.source !== 'GALLERY' || img.imageUrl.startsWith('http')),
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }, [step, selectedDate, selectedPetId, selectedImages]);


    // --- Handlers ---
    const handleBack = () => {
        navigate('/ai-studio/diary/calendar');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (imageFiles.length + files.length > 10) {
            alert("최대 10장까지 업로드 가능합니다.");
            return;
        }
        setImageFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(file => ({
            imageUrl: URL.createObjectURL(file),
            source: ImageSource.GALLERY,
            archiveId: null
        }));
        setSelectedImages(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const handleSelectFromGallery = (image: { archiveId: number, url: string }) => {
        const isSelected = selectedImages.some(img => img.imageUrl === image.url);
        if (isSelected) {
            setSelectedImages(prev => prev.filter(img => img.imageUrl !== image.url));
        } else if (selectedImages.length < 10) {
            setSelectedImages(prev => [...prev, {
                imageUrl: image.url,
                source: ImageSource.ARCHIVE,
                archiveId: image.archiveId
            }]);
        }
    };

    const handleGenerate = async () => {
        if (imageFiles.length === 0 && selectedImages.length === 0) {
            alert("최소 1장의 사진을 선택해주세요.");
            return;
        }
        if (!selectedPetId) {
            alert("반려동물을 선택해주세요.");
            return;
        }
        if (!user) {
            alert("로그인 정보가 없습니다.");
            return;
        }

        setStep("generating");

        const getCurrentPosition = () => {
            return new Promise<{ lat: number, lng: number } | null>((resolve) => {
                if (!navigator.geolocation) { resolve(null); return; }
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (_err) => resolve(null),
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            });
        };

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 5;
            if (currentProgress < 90) setProgress(currentProgress);
        }, 200);

        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            let location: { lat: number, lng: number } | null = null;
            let resolvedLocationName = "위치 정보 없음";

            // 1. Try Saved Location (User Default)
            try {
                const savedLoc = await petMateApi.getSavedLocation(Number(user.id));
                if (savedLoc) {
                    location = { lat: savedLoc.latitude, lng: savedLoc.longitude };
                    resolvedLocationName = savedLoc.location || "저장된 위치";
                }
            } catch (e) {
                console.warn("Saved Location Check Failed", e);
            }

            // 2. If 'Selected Date' is today or no saved location, try GPS? 
            // Using GPS only if we didn't find a Saved Location?
            // Or maybe we prefer GPS for Today?
            // User said: "It should use the saved location... default is receiving lat/lng from saved... but now it stuck"
            // So if we found savedLoc, we are good.

            // If NO saved location, fallback to GPS
            if (!location) {
                location = await getCurrentPosition();
            }

            // 3. Reverse Geocoding to get Address String
            if (location) {
                try {
                    const addrInfo = await petMateApi.getAddressFromCoords(location.lng, location.lat);
                    if (addrInfo) {
                        resolvedLocationName = addrInfo.fullAddress || addrInfo.roadAddress || resolvedLocationName;
                    }
                } catch (e) {
                    console.warn("Reverse Geocoding Failed", e);
                    // resolvedLocationName remains whatever it was (or "위치 정보 없음")
                }
            }

            const formData = new FormData();
            imageFiles.forEach((file) => formData.append("imageFiles", file));
            if (imageFiles.length === 0) formData.append("imageFiles", new Blob([], { type: 'application/octet-stream' }), "");

            const requestData = {
                userId: Number(user.id),
                petId: selectedPetId,
                photoArchiveId: null,
                content: "",
                visibility: "PRIVATE",
                isAiGen: true,
                weather: "",
                mood: "",
                date: selectedDate,
                latitude: location ? location.lat : null,
                longitude: location ? location.lng : null,
                locationName: resolvedLocationName,
                images: selectedImages.map((img, index) => ({
                    imageUrl: img.imageUrl || "",
                    imgOrder: index + 1,
                    mainImage: index === mainImageIndex,
                    source: img.source,
                    archiveId: img.archiveId || null
                }))
            };
            formData.append("request", new Blob([JSON.stringify(requestData)], { type: "application/json" }));

            // API Call
            const response = await createAiDiaryApi(formData);
            const diaryId = response.diaryId;
            const diaryDetail = await getDiary(diaryId); // Get full details

            clearInterval(interval);
            setProgress(100);

            // --- Prepare Next State & Navigate ---
            // We strictly overwrite the session storage with the RESULT now
            const nextState = {
                step: 'edit',
                selectedDate, // Persist date
                selectedPetId,
                createdDiaryId: diaryId,
                editedDiary: diaryDetail.content || "AI가 일기를 생성하지 못했습니다.",
                weather: diaryDetail.weather || "맑음",
                mood: diaryDetail.mood || "행복",
                locationName: diaryDetail.locationName || "위치 정보 없음",
                locationCoords: location ? { lat: location.lat, lng: location.lng } : null,
                selectedImages: diaryDetail.images ? diaryDetail.images.map((img: any) => ({
                    imageUrl: img.imageUrl,
                    source: 'GALLERY'
                })) : [],
                // Default styles
                layoutStyle: "grid",
                textAlign: "left",
                fontSize: 16,
                sizeOption: "medium",
                themeStyle: "basic",
                preset: null,
                backgroundColor: "#ffffff",
                earnedReward: null
            };

            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

            // Navigate to Edit Page
            setTimeout(() => {
                navigate('/ai-studio/diary/edit');
            }, 500);

        } catch (error: any) {
            clearInterval(interval);
            console.error("Diary Generation Error", error);
            alert(`일기 생성 실패: ${error.message || "오류가 발생했습니다"
                }`);
            setStep("upload");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 font-sans text-gray-800">
            <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <button onClick={handleBack} className="text-pink-600 hover:text-pink-700 transition-colors p-1"><ChevronLeft className="w-6 h-6" /></button>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#FF6B8B] font-['Jua'] tracking-wider flex items-center gap-3">
                        <PawPrint className="w-6 h-6 animate-bounce text-[#FF8FAB] delay-100" />
                        <span>너와 나의 이야기</span>
                        <PawPrint className="w-6 h-6 animate-bounce text-[#FF8FAB] delay-300" />
                    </h1>
                    <div className="flex items-center gap-2"></div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 md:p-6">
                {step === 'upload' && (
                    <UploadStep
                        selectedImages={selectedImages}
                        isSubmitting={isSubmitting}
                        handleImageUpload={handleImageUpload}
                        handleGenerate={handleGenerate}
                        setSelectedImages={setSelectedImages}
                        setShowGallery={setShowGallery}
                        pets={pets}
                        selectedPetId={selectedPetId}
                        setSelectedPetId={setSelectedPetId}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        mainImageIndex={mainImageIndex}
                        setMainImageIndex={setMainImageIndex}
                    />
                )}
                {step === 'generating' && <GeneratingStep progress={progress} />}
            </main>

            <GalleryModal
                showGallery={showGallery}
                setShowGallery={setShowGallery}
                selectedImages={selectedImages}
                handleSelectFromGallery={handleSelectFromGallery}
                archiveImages={archiveImages}
            />
        </div>
    );
};

export default DiaryUploadPage;
