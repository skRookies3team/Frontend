import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { format } from 'date-fns';
import { ImageSource } from "../types/diary";
import exifr from 'exifr';
import {
    // createAiDiaryApi, // [REMOVED] Not used here anymore
    generateAiDiaryPreview,
    // getDiary // [REMOVED] Not used here anymore
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

    const [isSubmitting] = useState(false);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (imageFiles.length + files.length > 6) {
            alert("최대 6장까지 업로드 가능합니다.");
            return;
        }
        setImageFiles(prev => [...prev, ...files]);

        // EXIF 데이터 추출 및 이미지 미리보기 생성
        const newPreviewsPromises = files.map(async (file) => {
            let metadata: Record<string, any> | undefined = undefined;

            try {
                // EXIF 데이터 추출
                const exifData = await exifr.parse(file, {
                    gps: true,
                    pick: ['Make', 'Model', 'DateTime', 'GPSLatitude', 'GPSLongitude', 'GPSAltitude']
                });

                if (exifData) {
                    metadata = {
                        cameraMake: exifData.Make,
                        cameraModel: exifData.Model,
                        dateTime: exifData.DateTime,
                        gpsLatitude: exifData.GPSLatitude,
                        gpsLongitude: exifData.GPSLongitude,
                        gpsAltitude: exifData.GPSAltitude
                    };
                    console.log('[EXIF] 메타데이터 추출 성공:', metadata);
                }
            } catch (error) {
                console.warn('[EXIF] 메타데이터 추출 실패 (선택사항):', error);
            }

            return {
                imageUrl: URL.createObjectURL(file),
                source: ImageSource.GALLERY,
                archiveId: null,
                metadata
            };
        });

        const newPreviews = await Promise.all(newPreviewsPromises);
        console.log('[handleImageUpload] Adding GALLERY images with metadata:', newPreviews);
        setSelectedImages(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const handleSelectFromGallery = (image: { archiveId: number, url: string }) => {
        const isSelected = selectedImages.some(img => img.imageUrl === image.url);
        if (isSelected) {
            setSelectedImages(prev => prev.filter(img => img.imageUrl !== image.url));
        } else if (selectedImages.length < 6) {
            const newArchiveImage = {
                imageUrl: image.url,
                source: ImageSource.ARCHIVE,
                archiveId: image.archiveId
            };
            console.log('[handleSelectFromGallery] Adding ARCHIVE image:', newArchiveImage);
            setSelectedImages(prev => [...prev, newArchiveImage]);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        // Remove the image
        setSelectedImages(prev => prev.filter((_, i) => i !== indexToRemove));

        // Adjust mainImageIndex
        if (indexToRemove === mainImageIndex) {
            // If removing the main image, set the first remaining image as main
            setMainImageIndex(0);
        } else if (indexToRemove < mainImageIndex) {
            // If removing an image before the main image, decrement mainImageIndex
            setMainImageIndex(mainImageIndex - 1);
        }
        // If removing an image after mainImageIndex, no adjustment needed
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

            let location: { lat: number, lng: number } | null = null;
            let resolvedLocationName = "위치 정보 없음";

            // Parse selected date
            const diaryDate = selectedDate ? new Date(selectedDate) : new Date();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            diaryDate.setHours(0, 0, 0, 0);

            const isPastDate = diaryDate < today;

            // [CHANGED] 과거 날짜인 경우 위치를 전송하지 않음 (백엔드가 DB에서 조회)
            if (!isPastDate) {
                // 오늘 날짜인 경우에만 GPS 위치 조회

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

                // 2. If NO saved location, fallback to GPS
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
                    }
                }
            } else {
                console.log('[DiaryUpload] 과거 날짜 - GPS 위치 전송 스킵 (백엔드가 DB에서 조회)');
            }

            const formData = new FormData();
            imageFiles.forEach((file) => formData.append("imageFiles", file));
            if (imageFiles.length === 0) {
                formData.append("imageFiles", new Blob([], { type: 'application/octet-stream' }), "");
            }

            // [FIX] Backend expects individual parts: userId, petId, images
            formData.append("userId", new Blob([String(user.id)], { type: "application/json" }));
            formData.append("petId", new Blob([String(selectedPetId)], { type: "application/json" }));

            // [CHANGED] 오늘 날짜인 경우에만 GPS 위치 전송
            if (!isPastDate && location) {
                formData.append("latitude", new Blob([String(location.lat)], { type: "application/json" }));
                formData.append("longitude", new Blob([String(location.lng)], { type: "application/json" }));
                console.log('[DiaryUpload] 오늘 날짜 - GPS 위치 전송:', location);
            }

            if (selectedDate) {
                formData.append("date", new Blob([String(selectedDate)], { type: "application/json" }));
            }

            // "images" part
            const imagesDto = selectedImages.map((img, index) => ({
                imageUrl: img.imageUrl || "",
                imgOrder: index + 1,
                mainImage: index === mainImageIndex,
                source: img.source,
                archiveId: img.archiveId || null,
                metadata: img.metadata || null // ✅ EXIF 메타데이터 포함
            }));

            console.log('=== [DiaryUploadPage] 백엔드로 전송할 이미지 데이터 ===');
            console.log('[DiaryUploadPage] mainImageIndex:', mainImageIndex);
            console.log('[DiaryUploadPage] totalImages:', selectedImages.length);
            console.log('[DiaryUploadPage] imagesDto:', JSON.stringify(imagesDto, null, 2));

            // 메타데이터가 있는 이미지만 별도 로그
            const imagesWithMetadata = imagesDto.filter(img => img.metadata);
            if (imagesWithMetadata.length > 0) {
                console.log('=== [METADATA] 메타데이터가 포함된 이미지 ===');
                imagesWithMetadata.forEach((img, idx) => {
                    console.log(`[METADATA] Image ${idx + 1}:`, {
                        imageUrl: img.imageUrl.substring(0, 50) + '...',
                        metadata: img.metadata
                    });
                });
            } else {
                console.log('[METADATA] ⚠️ 메타데이터가 포함된 이미지가 없습니다.');
            }

            formData.append("images", new Blob([JSON.stringify(imagesDto)], { type: "application/json" }));

            // API Call
            // [CHANGED] Call Preview API instead of Create API
            const previewData = await generateAiDiaryPreview(formData);

            clearInterval(interval);
            setProgress(100);

            // --- Prepare Next State & Navigate ---
            // We strictly overwrite the session storage with the RESULT now

            // [CHANGED] 과거 날짜인 경우 백엔드가 반환한 위치 사용
            const finalLocationCoords = isPastDate && previewData.latitude && previewData.longitude
                ? { lat: previewData.latitude, lng: previewData.longitude }
                : (location ? { lat: location.lat, lng: location.lng } : null);

            const finalLocationName = isPastDate && previewData.locationName
                ? previewData.locationName
                : (resolvedLocationName || previewData.locationName);

            console.log('[DiaryUpload] Final Location:', {
                isPastDate,
                coords: finalLocationCoords,
                name: finalLocationName
            });

            const nextState = {
                step: 'edit',
                selectedDate, // Persist date
                selectedPetId,
                createdDiaryId: null, // [CHANGED] No diaryId yet!
                title: previewData.title || "제목 없음", // [NEW] Capture Title
                editedDiary: previewData.content || "AI가 일기를 생성하지 못했습니다.",
                weather: previewData.weather || "맑음",
                mood: previewData.mood || "행복",
                locationName: finalLocationName,
                locationCoords: finalLocationCoords,
                selectedImages: selectedImages, // Keep original images for display
                mainImageIndex: mainImageIndex, // ✅ 대표 이미지 인덱스 저장

                // [NEW] Persist Backend-generated IDs for final save
                previewImageUrls: previewData.imageUrls || [],
                previewArchiveIds: previewData.archiveIds || [],

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
                        handleRemoveImage={handleRemoveImage}
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
