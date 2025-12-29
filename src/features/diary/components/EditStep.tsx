import React from 'react';
import { Calendar, MapPin, Sun, Smile, Edit3, Save, Loader2 } from 'lucide-react';
import KakaoMap from './KakaoMap';

interface EditStepProps {
    selectedImages: any[];
    editedDiary: string;
    setEditedDiary: (diary: string) => void;
    weather: string;
    setWeather: (weather: string) => void;
    mood: string;
    setMood: (mood: string) => void;
    locationName: string;
    setLocationName: (name: string) => void;
    locationCoords: { lat: number, lng: number } | null;
    selectedDate: string;
    layoutStyle: string;
    setLayoutStyle: (style: string) => void;
    textAlign: string;
    setTextAlign: (align: string) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    handleShareToFeed: () => void;
    isSubmitting: boolean;
}

const EditStep = ({
    selectedImages, editedDiary, setEditedDiary, weather, setWeather, mood, setMood, locationName, setLocationName, locationCoords,
    selectedDate, layoutStyle, setLayoutStyle, textAlign, fontSize, backgroundColor, setBackgroundColor,
    handleShareToFeed, isSubmitting
}: EditStepProps) => {
    const backgroundColors = ["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"];

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
            <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-24" style={{ backgroundColor }}>
                <div className={`p-8 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-pink-400" />
                            {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-600 text-sm">
                                <MapPin className="w-3 h-3" />
                                <input value={locationName} onChange={(e) => setLocationName(e.target.value)} className="bg-transparent w-48 outline-none text-center truncate" />
                            </div>
                            <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-600 text-sm">
                                <Sun className="w-3 h-3" />
                                <input value={weather} onChange={(e) => setWeather(e.target.value)} className="bg-transparent w-12 outline-none text-center" />
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 text-sm">
                                <Smile className="w-3 h-3" />
                                <input value={mood} onChange={(e) => setMood(e.target.value)} className="bg-transparent w-12 outline-none text-center" />
                            </div>
                        </div>
                    </div>

                    {locationCoords && <div className="mb-6"><KakaoMap lat={locationCoords.lat} lng={locationCoords.lng} /></div>}

                    <div className={`mb-8 gap-2 ${layoutStyle === 'grid' ? 'grid grid-cols-2' : layoutStyle === 'slide' ? 'flex overflow-x-auto pb-2 snap-x' : 'flex flex-col space-y-4'}`}>
                        {selectedImages.map((img: any, idx: number) => (
                            <img key={idx} src={img.imageUrl} alt="diary" className={`rounded-lg object-cover shadow-sm w-full ${layoutStyle === 'slide' ? 'min-w-[80%] snap-center' : ''}`} />
                        ))}
                    </div>

                    <textarea
                        value={editedDiary} onChange={(e) => setEditedDiary(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed text-gray-700 outline-none p-0"
                        style={{ fontSize: `${fontSize}px`, minHeight: '200px' }}
                    />
                </div>
            </div>

            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Edit3 className="w-4 h-4 text-pink-500" /> 스타일 편집</h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">레이아웃</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['grid', 'slide', 'classic'].map(style => (
                                <button key={style} onClick={() => setLayoutStyle(style)} className={`p-2 rounded text-xs ${layoutStyle === style ? 'bg-pink-100 text-pink-600' : 'bg-gray-50'}`}>{style}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">배경 색상</label>
                        <div className="grid grid-cols-5 gap-2">
                            {backgroundColors.map(color => (
                                <button key={color} onClick={() => setBackgroundColor(color)} className={`h-8 rounded-full border ${backgroundColor === color ? "border-pink-500 ring-1 ring-pink-500" : "border-gray-200"}`} style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </div>
                </div>

                <button onClick={handleShareToFeed} disabled={isSubmitting} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} <span>저장하고 공유하기</span>
                </button>
            </div>
        </div>
    );
};

export default EditStep;