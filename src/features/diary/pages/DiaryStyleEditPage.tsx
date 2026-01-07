import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { getDiary, saveDiaryStyleApi } from "../api/diary-api";

import StyleStep from '../components/StyleStep';

const DiaryStyleEditPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useDiaryAuth();

    // --- States ---
    const [diary, setDiary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Style States
    const [layoutStyle, setLayoutStyle] = useState("grid");
    const [textAlign, setTextAlign] = useState("left");
    const [fontSize, setFontSize] = useState(16);
    const [sizeOption, setSizeOption] = useState("medium");
    const [themeStyle, setThemeStyle] = useState("basic");
    const [preset, setPreset] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    // Fetch diary and style data
    useEffect(() => {
        const fetchData = async () => {
            if (!id || !user) return;

            try {
                setIsLoading(true);

                console.log("=== 🎨 스타일 편집 페이지 로드 ===");
                console.log("Diary ID:", id);

                // Fetch diary details
                const diaryData = await getDiary(Number(id));
                console.log("✅ 다이어리 데이터:", diaryData);
                setDiary(diaryData);

                // ✅ Use style from diary response (backend includes it now)
                if (diaryData.style) {
                    console.log("🎨 다이어리에서 스타일 로드됨:", diaryData.style);
                    setLayoutStyle(diaryData.style.galleryType || "grid");
                    setTextAlign(diaryData.style.textAlignment || "left");
                    setFontSize(diaryData.style.fontSize || 16);
                    setSizeOption(diaryData.style.sizeOption || "medium");
                    setThemeStyle(diaryData.style.themeStyle || "basic");
                    setPreset(diaryData.style.preset || null);
                    setBackgroundColor(diaryData.style.backgroundColor || "#ffffff");
                } else {
                    console.log("ℹ️ 저장된 스타일 없음 - 기본값 사용");
                }

                console.log("=== 스타일 편집 페이지 로드 완료 ===");
            } catch (error) {
                console.error('❌ 다이어리 로드 실패:', error);
                alert('다이어리를 불러오는데 실패했습니다.');
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, user, navigate]);

    const handleBack = () => {
        navigate(`/diary/${id}`);
    };

    const handleSaveStyle = async () => {
        if (!user || !diary) return;

        setIsSubmitting(true);
        try {
            await saveDiaryStyleApi(Number(user.id), {
                diaryId: Number(id),
                galleryType: layoutStyle,
                textAlignment: textAlign,
                fontSize: fontSize,
                sizeOption: sizeOption,
                backgroundColor: backgroundColor,
                preset: preset,
                themeStyle: themeStyle,
                petId: diary.petId
            });

            alert('스타일이 저장되었습니다.');
            navigate(`/diary/${id}`);
        } catch (error) {
            console.error('스타일 저장 실패:', error);
            alert('스타일 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!diary) return null;

    // Prepare images for StyleStep
    const selectedImages = diary.images || diary.imageUrls?.map((url: string) => ({ imageUrl: url })) || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 font-sans text-gray-800">
            <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <button onClick={handleBack} className="text-pink-600 hover:text-pink-700 transition-colors p-1">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#FF6B8B] font-['Jua'] tracking-wider flex items-center gap-3">
                        <PawPrint className="w-6 h-6 animate-bounce text-[#FF8FAB] delay-100" />
                        <span>스타일 편집</span>
                        <PawPrint className="w-6 h-6 animate-bounce text-[#FF8FAB] delay-300" />
                    </h1>
                    <div className="flex items-center gap-2"></div>
                </div>
            </header>

            <main className="w-[98%] max-w-[1920px] mx-auto p-4 md:p-6">
                <StyleStep
                    selectedImages={selectedImages}
                    editedDiary={diary.content}
                    weather={diary.weather}
                    mood={diary.mood}
                    locationName={diary.locationName}
                    locationCoords={diary.latitude && diary.longitude ? { lat: diary.latitude, lng: diary.longitude } : null}
                    selectedDate={diary.date}
                    layoutStyle={layoutStyle}
                    setLayoutStyle={setLayoutStyle}
                    textAlign={textAlign}
                    setTextAlign={setTextAlign}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    backgroundColor={backgroundColor}
                    setBackgroundColor={setBackgroundColor}
                    sizeOption={sizeOption}
                    setSizeOption={setSizeOption}
                    themeStyle={themeStyle}
                    setThemeStyle={setThemeStyle}
                    preset={preset}
                    setPreset={setPreset}
                    handleShareToFeed={handleSaveStyle}
                    isSubmitting={isSubmitting}
                    onBack={handleBack}
                    title={diary.title}
                />
            </main>
        </div>
    );
};

export default DiaryStyleEditPage;
