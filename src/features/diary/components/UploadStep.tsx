import React from 'react';
import { Camera, Calendar, PawPrint, Upload, Image as ImageIcon, X, Edit3 } from 'lucide-react';

const Icon = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

interface UploadStepProps {
    selectedImages: any[];
    isSubmitting: boolean;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGenerate: () => void;
    setSelectedImages: (images: any[]) => void;
    setShowGallery: (show: boolean) => void;
    pets: any[];
    selectedPetId: number | null;
    setSelectedPetId: (id: number) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

const UploadStep = ({
    selectedImages, isSubmitting, handleImageUpload, handleGenerate, setSelectedImages, setShowGallery,
    pets, selectedPetId, setSelectedPetId, selectedDate, setSelectedDate
}: UploadStepProps) => (
    <div className="space-y-6 animate-fade-in">
        <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl">
                <Icon className="h-10 w-10 text-white"><Camera className="w-full h-full" /></Icon>
            </div>
            <h2 className="text-2xl font-bold text-pink-600">AI 다이어리 작성하기</h2>
            <p className="mt-2 text-slate-500">언제, 어떤 아이의 하루였나요?</p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-full max-w-xs">
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-gray-700">날짜 선택</span>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border border-pink-200 rounded-xl text-center focus:border-pink-500 outline-none"
                />
            </div>

            <div className="w-full max-w-xs">
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <PawPrint className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-gray-700">주인공 선택하기</span>
                </div>
                <select
                    value={selectedPetId || ''}
                    onChange={(e) => setSelectedPetId(Number(e.target.value))}
                    className="w-full p-3 border border-pink-200 rounded-xl focus:border-pink-500 outline-none bg-white"
                >
                    <option value="" disabled>주인공을 선택해주세요</option>
                    {pets && pets.length > 0 ? (
                        pets.map((pet: any) => (
                            <option key={pet.id || pet.petId} value={pet.id || pet.petId}>
                                {pet.name || pet.petName} ({pet.species})
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>등록된 반려동물이 없습니다.</option>
                    )}
                </select>
            </div>
        </div>

        <div className="border border-pink-100 shadow-xl rounded-xl bg-white p-6 md:p-8">
            {selectedImages.length === 0 ? (
                <div className="space-y-4">
                    <label className="flex w-full cursor-pointer flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-pink-300 bg-pink-50 p-16 hover:bg-white transition-all">
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSubmitting} />
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                            <Icon className="h-10 w-10 text-white"><Upload /></Icon>
                        </div>
                        <p className="text-xl font-bold text-pink-600">{isSubmitting ? '업로드 중...' : '사진 선택하기'}</p>
                    </label>
                    <button onClick={() => setShowGallery(true)} disabled={isSubmitting} className="w-full border-2 border-pink-300 text-pink-600 py-3 rounded-full font-bold hover:bg-pink-50 flex items-center justify-center gap-2">
                        <Icon className="w-5 h-5"><ImageIcon /></Icon> 보관함에서 선택하기
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-2xl bg-pink-50 p-4 grid grid-cols-3 gap-3 md:grid-cols-5">
                        {selectedImages.map((image: any, index: number) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                <img src={image.imageUrl} alt="upload" className="w-full h-full object-cover" />
                                <button onClick={() => setSelectedImages(selectedImages.filter((_: any, i: number) => i !== index))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <label className="flex items-center justify-center border-2 border-dashed border-pink-300 rounded-xl cursor-pointer hover:bg-white">
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <Upload className="text-pink-400" />
                        </label>
                    </div>
                    <button onClick={handleGenerate} disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-full shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                        <Edit3 /> AI 다이어리 생성하기
                    </button>
                </div>
            )}
        </div>
    </div>
);

export default UploadStep;