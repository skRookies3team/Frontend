import { useEffect, useState } from 'react';
import { Calendar, MapPin, Sun, Smile, Edit3, Save, Loader2, LayoutGrid, Layers, Columns, Grid, Maximize2, Minimize2, Type, Palette, Sparkles } from 'lucide-react';
import KakaoMap from './KakaoMap';

interface StyleStepProps {
    selectedImages: any[];
    editedDiary: string;
    weather: string;
    mood: string;
    locationName: string;
    locationCoords: { lat: number, lng: number } | null;
    selectedDate: string;
    title: string; // [NEW]

    // Style Props
    layoutStyle: string;
    setLayoutStyle: (style: string) => void;
    textAlign: string;
    setTextAlign: (align: string) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;

    // New Advanced Props
    sizeOption: string;
    setSizeOption: (size: string) => void;
    themeStyle: string;
    setThemeStyle: (style: string) => void;
    preset: string | null;
    setPreset: (preset: string | null) => void;

    handleShareToFeed: () => void;
    isSubmitting: boolean;
    onBack: () => void;
}

const StyleStep = ({
    selectedImages, editedDiary, weather, mood, locationName, locationCoords, selectedDate,
    layoutStyle, setLayoutStyle, textAlign, setTextAlign, fontSize, setFontSize, backgroundColor, setBackgroundColor,
    sizeOption, setSizeOption, themeStyle, setThemeStyle, preset, setPreset,
    handleShareToFeed, isSubmitting, onBack, title
}: StyleStepProps) => {

    const backgroundColors = ["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"];
    const [activeTab, setActiveTab] = useState<'layout' | 'detail'>('layout');

    // 프리셋/테마 변경 시 스타일 적용 로직
    useEffect(() => {
        if (!preset) return;

        switch (preset) {
            case 'cozy_morning': // 빈티지/코지
                setBackgroundColor('#fdf6e3'); // Warm beige
                setThemeStyle('romantic');
                setLayoutStyle('grid');
                break;
            case 'city_night': // 다크 모드
                setBackgroundColor('#1a1a2e');
                setThemeStyle('modern');
                setLayoutStyle('classic');
                break;
            case 'romantic_picnic': // 핑크 로맨틱
                setBackgroundColor('#fff0f5');
                setThemeStyle('romantic');
                setLayoutStyle('slide');
                break;
            case 'minimal_white': // 미니멀
                setBackgroundColor('#ffffff');
                setThemeStyle('basic');
                setLayoutStyle('masonry');
                break;
            case 'vintage_scrapbook': // 빈티지 스크랩북 (New)
                setBackgroundColor('#fdfbf7');
                setThemeStyle('vintage');
                setLayoutStyle('masonry');
                break;
        }
    }, [preset, setBackgroundColor, setThemeStyle, setLayoutStyle]);

    const getPreviewContainerStyle = () => {
        let baseStyle = "w-full lg:flex-1 rounded-2xl shadow-xl overflow-y-auto border border-gray-100 sticky top-24 max-h-[calc(100vh-8rem)] transition-all duration-300 relative";

        if (themeStyle === 'vintage') {
            return `${baseStyle} border-4 border-[#d4c5b0]`;
        }
        return baseStyle;
    };

    const getBackgroundStyle = () => {
        // 프리셋/테마에 따른 배경 패턴 처리
        if (themeStyle === 'vintage' || preset === 'cozy_morning' || preset === 'vintage_scrapbook') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `
                    linear-gradient(#e5e7eb 1px, transparent 1px),
                    linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
            };
        }
        return { backgroundColor };
    };

    const TapeDecoration = () => (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-yellow-100/80 rotate-2 shadow-sm z-10 opacity-90 backdrop-blur-sm border-l border-r border-white/50" />
    );

    const StickerDecoration = ({ type }: { type: string }) => {
        if (type === 'heart') return <div className="absolute -bottom-4 -right-4 text-4xl opacity-90 rotate-12 drop-shadow-md z-20">💖</div>;
        if (type === 'star') return <div className="absolute -top-4 -left-4 text-4xl opacity-90 -rotate-12 drop-shadow-md z-20">⭐</div>;
        if (type === 'pin') return <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl drop-shadow-md z-20">📍</div>;
        return null;
    };

    const layoutOptions = [
        { id: 'grid', label: '그리드', icon: <Grid className="w-5 h-5" />, desc: '기본 정렬' },
        { id: 'masonry', label: 'Masonry', icon: <Layers className="w-5 h-5" />, desc: '빈틈없는 배치' },
        { id: 'slide', label: '슬라이드', icon: <Columns className="w-5 h-5" />, desc: '가로 스크롤' },
        { id: 'classic', label: '클래식', icon: <LayoutGrid className="w-5 h-5" />, desc: '세로 나열' },
    ];

    const sizeOptions = [
        { id: 'small', label: 'Small', icon: <Minimize2 className="w-4 h-4" /> },
        { id: 'medium', label: 'Medium', icon: <span>M</span> },
        { id: 'large', label: 'Large', icon: <Maximize2 className="w-4 h-4" /> },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
            {/* Left Panel: Preview */}
            <div className={getPreviewContainerStyle()} style={getBackgroundStyle()}>

                {/* Vintage Texture Overlay */}
                {(themeStyle === 'vintage' || preset === 'vintage_scrapbook') && (
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-repeat z-0 mix-blend-multiply"
                        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
                    </div>
                )}

                <div className={`p-8 relative z-10 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>

                    {/* [NEW] Title Display (Moved to Top) */}
                    <h2 className={`text-2xl font-bold mb-4
                        ${themeStyle === 'vintage' ? 'font-serif text-amber-900 border-b-2 border-amber-900/10 pb-2' : 'text-gray-800'}
                        ${themeStyle === 'romantic' ? 'font-serif text-pink-600' : ''}
                        ${themeStyle === 'modern' ? 'tracking-tight' : ''}
                    `}>
                        {title}
                    </h2>

                    {/* Header Info */}
                    <div className={`flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 
                        ${themeStyle === 'vintage' ? 'border-b-2 border-dashed border-gray-400/50' : 'border-b border-gray-100'}`}
                    >
                        <div className="flex items-center gap-2">
                            {themeStyle === 'vintage' ? (
                                <div className="bg-[#fcf8e3] px-4 py-2 rounded shadow-sm text-amber-900 font-bold font-serif border border-amber-200/50 flex items-center gap-2 transform -rotate-1">
                                    <Calendar className="w-4 h-4 text-amber-700" />
                                    <span>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50/50 px-3 py-1 rounded-full">
                                    <Calendar className="w-4 h-4 text-pink-400" />
                                    {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {locationName && (
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm
                                    ${themeStyle === 'vintage'
                                        ? 'bg-orange-50 text-orange-800 border border-orange-200 font-serif rotate-1'
                                        : 'bg-green-50 text-green-600'}
                                `}>
                                    <MapPin className="w-3 h-3" />
                                    <span>{locationName}</span>
                                </div>
                            )}
                            {weather && (
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm
                                     ${themeStyle === 'vintage'
                                        ? 'bg-blue-50 text-blue-800 border border-blue-200 font-serif'
                                        : 'bg-blue-50 text-blue-600'}
                                `}>
                                    <Sun className="w-3 h-3" />
                                    <span>{weather}</span>
                                </div>
                            )}
                            {mood && (
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm
                                     ${themeStyle === 'vintage'
                                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 font-serif -rotate-1'
                                        : 'bg-yellow-50 text-yellow-600'}
                                `}>
                                    <Smile className="w-3 h-3" />
                                    <span>{mood}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map */}
                    {locationCoords && (
                        <div className={`mb-8 p-1 bg-white shadow-md rounded-lg overflow-hidden
                            ${themeStyle === 'vintage' ? 'rotate-1 border-4 border-white' : ''}
                        `}>
                            <div className="relative">
                                {(themeStyle === 'vintage') && <TapeDecoration />}
                                <KakaoMap lat={locationCoords.lat} lng={locationCoords.lng} />
                            </div>
                        </div>
                    )}

                    {/* Images with Layout Preview */}
                    <div className={`mb-10 gap-4 transition-all duration-500
                        ${layoutStyle === 'grid' ? 'grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3' : ''}
                        ${layoutStyle === 'masonry' ? 'columns-2 md:columns-3 gap-6 space-y-6' : ''}
                        ${layoutStyle === 'slide' ? 'flex overflow-x-auto pb-8 snap-x scrollbar-hide px-2' : ''}
                        ${layoutStyle === 'classic' ? 'flex flex-col space-y-8' : ''}
                    `}>
                        {selectedImages.map((img: any, idx: number) => (
                            <div key={idx} className={`relative group transition-transform hover:scale-[1.02] duration-300
                                ${layoutStyle === 'slide' ? 'min-w-[80%] md:min-w-[70%] snap-center' : 'w-full'}
                                ${sizeOption === 'small' ? 'aspect-[3/4]' : sizeOption === 'large' ? 'aspect-video' : 'aspect-square'}
                                ${themeStyle === 'vintage'
                                    ? 'bg-white p-3 shadow-lg rotate-1 even:-rotate-2 border border-gray-100/50'
                                    : 'rounded-2xl overflow-hidden shadow-md border border-gray-100'}
                            `}>
                                {(themeStyle === 'vintage' || preset === 'cozy_morning' || preset === 'vintage_scrapbook') && (idx % 2 === 0 || idx === 0) && <TapeDecoration />}

                                {themeStyle === 'romantic' && idx === 0 && <StickerDecoration type="heart" />}
                                {themeStyle === 'vintage' && idx === 1 && <StickerDecoration type="pin" />}

                                <img src={img.imageUrl} alt="diary" className={`w-full h-full object-cover shadow-inner
                                    ${themeStyle === 'vintage' ? '' : 'rounded-lg'}
                                `} />

                                {(themeStyle === 'vintage' || preset === 'vintage_scrapbook') && idx === selectedImages.length - 1 && <StickerDecoration type="star" />}
                            </div>
                        ))}
                    </div>



                    {/* Text Content */}
                    <div className={`whitespace-pre-wrap leading-loose p-4 rounded-xl
                        ${themeStyle === 'vintage' || themeStyle === 'romantic'
                            ? 'font-serif text-gray-800'
                            : 'text-gray-700 font-medium'}
                    `} style={{ fontSize: `${fontSize}px` }}>
                        {editedDiary}
                    </div>
                </div>
            </div>

            {/* Right Panel: Style Controls */}
            <div className="w-full lg:w-96 space-y-6 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Edit3 className="w-4 h-4 text-pink-500" /> 디자인 편집</h3>
                        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                            <button onClick={() => setActiveTab('layout')} className={`p-1.5 rounded transition-colors ${activeTab === 'layout' ? 'bg-pink-100 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setActiveTab('detail')} className={`p-1.5 rounded transition-colors ${activeTab === 'detail' ? 'bg-pink-100 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Type className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Tab: Layout */}
                        {activeTab === 'layout' && (
                            <div className="space-y-6 animate-fade-in">
                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">갤러리 레이아웃</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {layoutOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setLayoutStyle(opt.id)}
                                                className={`group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                                                    ${layoutStyle === opt.id
                                                        ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm scale-[1.02]'
                                                        : 'border-gray-100 bg-white text-gray-500 hover:border-pink-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`mb-2 p-2 rounded-full ${layoutStyle === opt.id ? 'bg-pink-200' : 'bg-gray-100 group-hover:bg-white'}`}>
                                                    {opt.icon}
                                                </div>
                                                <span className="text-sm font-bold">{opt.label}</span>
                                                <span className="text-[10px] opacity-70">{opt.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">이미지 크기 옵션</label>
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        {sizeOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSizeOption(opt.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                                                    ${sizeOption === opt.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}
                                                `}
                                            >
                                                {opt.icon} {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Tab: Detail Style (Text, Color, Theme, Preset) */}
                        {activeTab === 'detail' && (
                            <div className="space-y-6 animate-fade-in overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                                {/* Preset */}
                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3 text-yellow-500" /> 프리셋 테마</label>
                                    <select
                                        value={preset || ''}
                                        onChange={(e) => setPreset(e.target.value || null)}
                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-white font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <option value="">프리셋 선택 안함 (사용자 정의)</option>
                                        <option value="cozy_morning">🧸 포근한 아침 (Grid + Vintage)</option>
                                        <option value="vintage_scrapbook">📸 빈티지 스크랩북 (Masonry + Tape)</option>
                                        <option value="romantic_picnic">🌸 로맨틱 피크닉 (Pink + Slide)</option>
                                        <option value="city_night">🌃 도시의 밤 (Dark + Classic)</option>
                                        <option value="minimal_white">🏳️ 미니멀 화이트 (Clean)</option>
                                    </select>
                                </section>

                                {/* Theme Style */}
                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">스타일 무드</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'basic', label: 'Basic', desc: '심플' },
                                            { id: 'romantic', label: 'Romantic', desc: '러블리' },
                                            { id: 'vintage', label: 'Vintage', desc: '레트로' },
                                            { id: 'modern', label: 'Modern', desc: '모던' }
                                        ].map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setThemeStyle(theme.id)}
                                                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all
                                                    ${themeStyle === theme.id
                                                        ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold">{theme.label}</span>
                                                <span className="text-[10px] text-gray-400">{theme.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Background Color */}
                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Palette className="w-3 h-3" /> 배경 색상</label>
                                    <div className="flex flex-wrap gap-2">
                                        {backgroundColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setBackgroundColor(color)}
                                                className={`w-10 h-10 rounded-full border shadow-sm transition-transform hover:scale-110 ${backgroundColor === color ? "border-pink-500 ring-2 ring-pink-200 ring-offset-2" : "border-gray-200"}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">텍스트 크기</label>
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <span className="text-xs text-gray-400">Aa</span>
                                        <input
                                            type="range" min="12" max="24" step="1"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(Number(e.target.value))}
                                            className="flex-1 h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                        <span className="text-lg font-bold text-gray-600">Aa</span>
                                    </div>
                                    <div className="text-right mt-1 text-xs text-gray-400">{fontSize}px</div>
                                </section>

                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">텍스트 정렬</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['left', 'center', 'right'].map(align => (
                                            <button
                                                key={align}
                                                onClick={() => setTextAlign(align)}
                                                className={`py-2 rounded-lg border text-sm transition-colors
                                                    ${textAlign === align ? 'border-pink-500 bg-pink-50 text-pink-600 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}
                                                `}
                                            >
                                                {align === 'left' ? '왼쪽' : align === 'center' ? '가운데' : '오른쪽'}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions - Fixed at Bottom */}
                <div className="sticky bottom-0 pt-4 pb-4 space-y-3">
                    <button onClick={handleShareToFeed} disabled={isSubmitting} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all transform hover:-translate-y-0.5">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} <span>일기 저장하고 공유하기</span>
                    </button>
                    <button onClick={onBack} className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-3 rounded-xl border border-gray-200 transition-colors">
                        이전으로 (내용 수정)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StyleStep;
