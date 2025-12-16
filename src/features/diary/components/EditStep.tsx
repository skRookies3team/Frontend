import React from 'react';
// import { motion } from 'framer-motion'; // [삭제]: 배포 오류 방지를 위해 삭제
// [수정]: SocialShareButtons.tsx의 확장자를 다시 명시하여 경로 문제 해결 시도
import SocialShareButtons from './SocialShareButtons.tsx';
// [수정]: types 경로의 확장자를 다시 명시하여 경로 문제 해결 시도
import { SelectedImage, LayoutStyle, TextAlign } from '../../diary/types/diary.ts';

interface EditStepProps {
    selectedImages: SelectedImage[];
    editedDiary: string;
    setEditedDiary: React.Dispatch<React.SetStateAction<string>>;
    layoutStyle: LayoutStyle;
    setLayoutStyle: React.Dispatch<React.SetStateAction<LayoutStyle>>;
    textAlign: TextAlign;
    setTextAlign: React.Dispatch<React.SetStateAction<TextAlign>>;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    backgroundColor: string;
    setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
    handleShareToFeed: () => void;
    isSubmitting: boolean;
}

// [수정 유지]: children prop의 타입을 명시적으로 React.ReactNode로 추가합니다.
const Icon: React.FC<{ className?: string, children: React.ReactNode }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;

export default function EditStep({
    selectedImages,
    editedDiary,
    setEditedDiary,
    layoutStyle,
    setLayoutStyle,
    textAlign,
    setTextAlign,
    fontSize,
    setFontSize,
    backgroundColor,
    setBackgroundColor,
    handleShareToFeed,
    isSubmitting,
}: EditStepProps) {
    const backgroundColors = ["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-balance text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리가 완성되었어요!</h2>
                <p className="mt-2 text-slate-500 md:text-lg">레이아웃과 스타일을 자유롭게 편집하세요</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                {/* Main editing area */}
                <div className="space-y-4">
                    <div className="border border-pink-100 shadow-xl rounded-2xl" style={{ backgroundColor }}>
                        <div className="space-y-4 p-6 md:p-8">
                            {/* Layout templates */}
                            <div className="rounded-xl bg-white/80 p-4 backdrop-blur">
                                <p className="mb-3 text-sm font-semibold text-pink-600">갤러리 스타일</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Layout buttons */}
                                    <button onClick={() => setLayoutStyle("grid")} className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "grid" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}><Icon className="mx-auto h-6 w-6 text-pink-600">{'#1'}</Icon><p className="mt-1 text-xs font-medium text-pink-600">그리드</p></button>
                                    <button onClick={() => setLayoutStyle("masonry")} className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "masonry" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}><Icon className="mx-auto h-6 w-6 text-pink-600">{'#2'}</Icon><p className="mt-1 text-xs font-medium text-pink-600">Masonry</p></button>
                                    <button onClick={() => setLayoutStyle("slide")} className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "slide" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}><Icon className="mx-auto h-6 w-6 text-pink-600">{'#3'}</Icon><p className="mt-1 text-xs font-medium text-pink-600">슬라이드</p></button>
                                    <button onClick={() => setLayoutStyle("classic")} className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "classic" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}><Icon className="mx-auto h-6 w-6 text-pink-600">{'#4'}</Icon><p className="mt-1 text-xs font-medium text-pink-600">클래식</p></button>
                                </div>
                            </div>

                            {/* Image gallery based on layout */}
                            <div
                                className={
                                    layoutStyle === "grid"
                                        ? "grid grid-cols-2 gap-3 md:grid-cols-3"
                                        : layoutStyle === "masonry"
                                            ? "columns-2 gap-3 md:columns-3"
                                            : layoutStyle === "slide"
                                                ? "flex gap-3 overflow-x-auto pb-2"
                                                : "grid grid-cols-4 gap-2"
                                }
                            >
                                {selectedImages.map((image, index) => (
                                    // [수정]: motion.div를 일반 div로 변경하고 transition 클래스 추가
                                    <div
                                        key={image.imageUrl}
                                        className={`overflow-hidden rounded-xl shadow-md transition-all duration-300 ease-in-out ${layoutStyle === "slide" ? "min-w-[250px]" : layoutStyle === "masonry" ? "mb-3" : ""
                                            }`}
                                    >
                                        <img
                                            src={image.imageUrl || "https://placehold.co/250x250/CCCCCC/000000?text=IMG"}
                                            alt={`Diary ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Text editor */}
                            <div className="rounded-xl bg-white/80 p-4 backdrop-blur">
                                <textarea
                                    value={editedDiary}
                                    onChange={(e) => setEditedDiary(e.target.value)}
                                    style={{
                                        textAlign,
                                        fontSize: `${fontSize}px`,
                                        lineHeight: "1.7",
                                    }}
                                    className="min-h-[250px] w-full resize-none border border-pink-200 p-4 rounded-lg focus:ring-pink-500 md:min-h-[300px]"
                                    placeholder="다이어리 내용을 입력하세요..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleShareToFeed}
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-bold shadow-lg py-3 px-4 transition-all hover:from-pink-600 hover:to-rose-600 md:text-lg text-white disabled:opacity-50"
                        >
                            <Icon className="mr-2 h-5 w-5">{'📤'}</Icon>
                            {isSubmitting ? '게시 중...' : '피드에 게시'}
                        </button>
                    </div>
                </div>

                <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
                    <div className="border border-pink-100 shadow-xl rounded-xl">
                        <div className="space-y-6 p-6">
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-pink-600">
                                    <Icon className="h-5 w-5">{'🎨'}</Icon>
                                    다이어리 스타일
                                </h3>

                                {/* Text alignment */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-500">텍스트 정렬</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => setTextAlign("left")} className={`rounded-lg border-2 p-2 transition-all ${textAlign === "left" ? "border-pink-500 bg-pink-50" : "border-pink-200 hover:border-pink-300"}`}><Icon className="mx-auto h-5 w-5 text-pink-600">{'L'}</Icon></button>
                                        <button onClick={() => setTextAlign("center")} className={`rounded-lg border-2 p-2 transition-all ${textAlign === "center" ? "border-pink-500 bg-pink-50" : "border-pink-200 hover:border-pink-300"}`}><Icon className="mx-auto h-5 w-5 text-pink-600">{'C'}</Icon></button>
                                        <button onClick={() => setTextAlign("right")} className={`rounded-lg border-2 p-2 transition-all ${textAlign === "right" ? "border-pink-500 bg-pink-50" : "border-pink-200 hover:border-pink-300"}`}><Icon className="mx-auto h-5 w-5 text-pink-600">{'R'}</Icon></button>
                                    </div>
                                </div>

                                {/* Font size */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-500">글자 크기</label>
                                    <input
                                        type="range"
                                        min="12"
                                        max="24"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>작게</span>
                                        <span className="font-medium text-pink-600">{fontSize}px</span>
                                        <span>크게</span>
                                    </div>
                                </div>

                                {/* Background color */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-500">배경 색상</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {backgroundColors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setBackgroundColor(color)}
                                                className={`h-10 rounded-lg border-2 transition-all ${backgroundColor === color ? "border-pink-500 scale-110" : "border-pink-200 hover:border-pink-300"}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Preset styles */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-500">프리셋</label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                setLayoutStyle("grid")
                                                setTextAlign("left")
                                                setFontSize(16)
                                                setBackgroundColor("#ffffff")
                                            }}
                                            className="w-full rounded-lg border-2 border-pink-200 p-3 text-left text-sm font-medium text-pink-600 transition-all hover:border-pink-500 hover:bg-pink-50"
                                        >
                                            기본 스타일
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLayoutStyle("masonry")
                                                setTextAlign("center")
                                                setFontSize(18)
                                                setBackgroundColor("#fef2f2")
                                            }}
                                            className="w-full rounded-lg border-2 border-pink-200 p-3 text-left text-sm font-medium text-pink-600 transition-all hover:border-pink-500 hover:bg-pink-50"
                                        >
                                            로맨틱 스타일
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLayoutStyle("slide")
                                                setTextAlign("left")
                                                setFontSize(14)
                                                setBackgroundColor("#f0f9ff")
                                            }}
                                            className="w-full rounded-lg border-2 border-pink-200 p-3 text-left text-sm font-medium text-pink-600 transition-all hover:border-pink-500 hover:bg-pink-50"
                                        >
                                            모던 스타일
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Buttons (Sharing) */}
                    <SocialShareButtons />
                </div>
            </div>
        </div>
    );
}