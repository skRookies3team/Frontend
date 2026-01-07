import React from 'react';
import { Camera, Calendar as CalendarIcon, PawPrint, Upload, Image as ImageIcon, X, Edit3, Star, Heart, Cloud, Sun } from 'lucide-react';
import { format } from "date-fns"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

const Icon = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

interface UploadStepProps {
    selectedImages: any[];
    isSubmitting: boolean;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGenerate: () => void;
    handleRemoveImage: (index: number) => void;
    setShowGallery: (show: boolean) => void;
    pets: any[];
    selectedPetId: number | null;
    setSelectedPetId: (id: number) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    mainImageIndex: number;
    setMainImageIndex: (index: number) => void;
}

const UploadStep = ({
    selectedImages, isSubmitting, handleImageUpload, handleGenerate, handleRemoveImage, setShowGallery,
    pets, selectedPetId, setSelectedPetId, selectedDate, setSelectedDate, mainImageIndex, setMainImageIndex
}: UploadStepProps) => (
    <div className="space-y-12 animate-fade-in pb-12">
        {/* Page Title with Sticker Decor */}
        <div className="text-center relative">
            <div className="inline-block relative z-10">
                <div className="absolute -top-6 -right-8 transform rotate-12 animate-pulse-slow">
                    <Sun className="w-10 h-10 text-yellow-400 fill-yellow-200" />
                </div>
                <div className="absolute top-0 -left-10 transform -rotate-12">
                    <Cloud className="w-8 h-8 text-blue-200 fill-blue-50" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-pink-500 font-['Jua'] drop-shadow-sm tracking-tight">오늘의 추억 기록하기</h2>
                <div className="mt-2 inline-block bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full border border-white/50 shadow-sm transform rotate-1">
                    <p className="text-pink-400 font-bold">언제, 어떤 아이와 함께했나요? 🐾</p>
                </div>
            </div>
        </div>

        {/* Input Section - Yellow Sticky Note */}
        <div className="relative bg-[#fff9c4] p-8 md:p-10 rounded-[2.5rem] shadow-[8px_8px_0px_rgba(0,0,0,0.05)] border-2 border-white/60 transform -rotate-1 mx-auto max-w-3xl transition-transform hover:rotate-0 hover:scale-[1.01] duration-300">
            {/* Tape Decoration */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 rotate-2 backdrop-blur-sm shadow-sm z-10"></div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-center relative z-10">
                {/* Date Input */}
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex items-center gap-2 mb-1 pl-1">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            <CalendarIcon className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="font-bold text-gray-700 font-['Jua'] text-lg">날짜 선택</span>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-[60px] justify-start text-left font-bold text-lg rounded-2xl border-2 border-yellow-200 bg-white hover:bg-yellow-50 hover:text-gray-900 focus:ring-2 focus:ring-yellow-400 text-gray-600 shadow-inner",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                {selectedDate ? format(new Date(selectedDate), "yyyy년 MM월 dd일") : <span>YYYY-MM-DD</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-2 border-pink-200 bg-white shadow-xl" align="center">
                            <Calendar
                                mode="single"
                                selected={selectedDate ? new Date(selectedDate) : undefined}
                                onSelect={(date) => date && setSelectedDate(format(date, "yyyy-MM-dd"))}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                                className="p-4 bg-white rounded-2xl [&_.day-selected]:bg-pink-500 [&_.day-selected]:text-white [&_.day-today]:text-pink-600 [&_.day-today]:font-bold"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="hidden md:block w-px h-16 bg-yellow-200/50"></div>

                {/* Pet Select */}
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex items-center gap-2 mb-1 pl-1">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            <PawPrint className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="font-bold text-gray-700 font-['Jua'] text-lg">주인공 선택</span>
                    </div>
                    <Select
                        value={selectedPetId ? String(selectedPetId) : ""}
                        onValueChange={(val) => setSelectedPetId(Number(val))}
                    >
                        <SelectTrigger className="w-full h-[60px] rounded-2xl border-2 border-yellow-200 bg-white hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 font-bold text-lg text-gray-600 shadow-inner">
                            <SelectValue placeholder="주인공을 선택해주세요" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 border-yellow-200 bg-white shadow-xl max-h-[300px]">
                            {pets && pets.length > 0 ? (
                                pets.map((pet: any) => (
                                    <SelectItem
                                        key={pet.id || pet.petId}
                                        value={String(pet.id || pet.petId)}
                                        className="font-medium text-gray-700 py-3 cursor-pointer focus:bg-yellow-50 focus:text-yellow-700 rounded-xl m-1 text-base"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{pet.name || pet.petName}</span>
                                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-normal">{pet.species}</span>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">등록된 반려동물이 없습니다 🥲</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        {/* Upload Section - Pink Sticky Note */}
        <div className="relative bg-[#ffdde1] p-8 md:p-10 rounded-[2.5rem] shadow-[8px_8px_0px_rgba(0,0,0,0.05)] border-2 border-white/60 transform rotate-1 mx-auto max-w-4xl mt-8 transition-transform hover:rotate-0 hover:scale-[1.01] duration-300">
            {/* Tape Decoration */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-white/40 -rotate-1 backdrop-blur-sm shadow-sm z-10 w-32"></div>

            {/* Sticker Decor */}
            <div className="absolute -top-6 -right-4 transform rotate-12 bg-white p-2 rounded-full shadow-md z-20">
                <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
            </div>

            <div className="relative z-10">
                {selectedImages.length === 0 ? (
                    <div className="space-y-6">
                        <label className="flex w-full cursor-pointer flex-col items-center gap-6 rounded-[2rem] border-4 border-dashed border-pink-300/60 bg-white/50 p-16 hover:bg-white/80 transition-all group">
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSubmitting} />
                            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md border-2 border-pink-100 group-hover:scale-110 transition-transform">
                                <Icon className="h-10 w-10 text-pink-400"><Camera className="w-full h-full" /></Icon>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-pink-500 mb-2 font-['Jua']">{isSubmitting ? '업로드 중...' : '사진 올리기'}</p>
                                <p className="text-gray-500 font-medium bg-white/50 px-4 py-1 rounded-full inline-block">최대 6장 • JPG, PNG</p>
                            </div>
                        </label>
                        <button onClick={() => setShowGallery(true)} disabled={isSubmitting} className="w-full bg-white border-2 border-pink-200 text-pink-500 py-4 rounded-2xl font-bold hover:bg-pink-50 hover:border-pink-300 flex items-center justify-center gap-2 transition-all shadow-sm text-lg">
                            <Icon className="w-6 h-6"><ImageIcon /></Icon> 보관함에서 선택하기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Selected Images Header */}
                        <div className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border border-white/50">
                            <div className="flex items-center gap-2">
                                <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {selectedImages.length} / 6
                                </span>
                                <p className="text-pink-600 font-bold font-['Jua'] text-lg">
                                    선택한 사진
                                </p>
                            </div>
                            <button
                                onClick={() => setShowGallery(true)}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-green-200 text-green-600 rounded-xl font-bold hover:bg-green-50 hover:border-green-300 transition-all shadow-sm"
                            >
                                <ImageIcon className="w-5 h-5" />
                                보관함 추가
                            </button>
                        </div>

                        {/* Image Grid */}
                        <div className="bg-white/50 p-6 rounded-[2rem] border-2 border-dashed border-pink-200">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {selectedImages.map((image: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`relative aspect-square rounded-2xl overflow-hidden group shadow-md transition-all hover:scale-105 hover:z-10 bg-white
                                            ${mainImageIndex === index ? 'ring-4 ring-yellow-400 scale-[1.02] z-10' : 'ring-2 ring-white'}
                                        `}
                                    >
                                        <img src={image.imageUrl} alt="upload" className="w-full h-full object-cover" />

                                        {/* Source Badge */}
                                        <div className={`absolute top-2 left-2 px-2 py-1 text-[10px] font-bold text-white rounded-lg shadow-sm backdrop-blur-md ${image.source === 'GALLERY' ? 'bg-blue-400/80' : 'bg-green-500/80'}`}>
                                            {image.source === 'GALLERY' ? 'GALLERY' : 'ARCHIVE'}
                                        </div>

                                        {/* Main Image Star */}
                                        <button
                                            onClick={() => setMainImageIndex(index)}
                                            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all shadow-sm ${mainImageIndex === index ? 'bg-yellow-400 text-white scale-110' : 'bg-black/20 text-white/80 hover:bg-yellow-400 hover:text-white backdrop-blur-md'}`}
                                            title="대표 이미지로 설정"
                                        >
                                            <Star className={`w-4 h-4 ${mainImageIndex === index ? 'fill-current' : ''}`} />
                                        </button>

                                        {/* Delete Button */}
                                        <button onClick={() => handleRemoveImage(index)} className="absolute bottom-2 right-2 bg-red-400/90 text-white rounded-full p-1.5 shadow-sm hover:bg-red-500 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Main Image Label */}
                                        {mainImageIndex === index && (
                                            <div className="absolute bottom-0 inset-x-0 bg-yellow-400/90 text-white text-xs font-bold text-center py-1">
                                                대표 이미지 ⭐
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add More Button (Small) */}
                                {selectedImages.length < 6 && (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/50 cursor-pointer hover:bg-white transition-all group">
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-pink-400" />
                                        </div>
                                        <span className="text-xs font-bold text-pink-400">더 추가하기</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <button onClick={handleGenerate} disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-5 rounded-2xl shadow-lg hover:scale-[1.01] hover:shadow-xl transition-all flex items-center justify-center gap-3 text-xl border-b-4 border-pink-700 active:border-b-0 active:translate-y-1">
                            <Edit3 className="w-6 h-6" />
                            <span className="font-['Jua'] pt-1">AI 다이어리 생성하기</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default UploadStep;