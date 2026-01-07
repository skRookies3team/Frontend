import { useEffect, useState } from 'react';
import { Calendar, MapPin, Sun, Smile, Edit3, Save, Loader2, Layers, Grid, Maximize2, Minimize2, Type, Palette, Sparkles, ImageIcon, ArrowUpRight, LayoutGrid } from 'lucide-react';
import KakaoMap from './KakaoMap';

interface StyleStepProps {
    selectedImages: any[];
    editedDiary: string;
    weather: string;
    mood: string;
    locationName: string;
    locationCoords: { lat: number, lng: number } | null;
    selectedDate: string;
    title: string;
    fontFamily: string; // [NEW]
    setFontFamily: (font: string) => void; // [NEW]

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
    handleShareToFeed, isSubmitting, onBack, title, fontFamily, setFontFamily // [NEW]
}: StyleStepProps) => {

    // 확장된 배경 색상 팔레트
    const backgroundColors = [
        "#ffffff", // 화이트
        "#fff5f5", // 연핑크
        "#fef2f2", // 로즈
        "#fdf4ff", // 라벤더
        "#f0f9ff", // 스카이블루
        "#fdf6e3", // 웜베이지
        "#f5f9f0", // 민트그린
        "#fef9e7", // 레몬옐로우
        "#f8f0ff", // 드림퍼플
        "#f7f3e9", // 빈티지아이보리
        "#f0f8ff", // 오션블루
        "#e0f7fa", // 아이스블루
        "#fbe9e7", // 피치 (코랄)
        "#fff8e1", // 크림
        "#f3e5f5", // 라이트퍼플
        "#e8f5e9", // 페일그린
        "#1a1a2e", // 다크모드
    ];

    const [activeTab, setActiveTab] = useState<'layout' | 'detail'>('layout');

    // [NEW] Theme/Preset to Font Mapping
    const getFontForTheme = (theme: string, preset: string | null) => {
        if (preset === 'cute_planner') return 'Jua';
        if (preset === 'romantic_picnic') return 'Hi Melody';
        if (preset === 'vintage_scrapbook') return 'Nanum Myeongjo';
        if (preset === 'abstract_organic') return 'Song Myung';
        if (preset === 'memphis_pop') return 'Dongle';
        if (preset === 'dreamy_pastel') return 'Hi Melody';
        if (preset === 'ocean_breeze') return 'Gaegu';

        switch (theme) {
            case 'kawaii': return 'Jua';
            case 'romantic': return 'Hi Melody';
            case 'vintage': return 'Nanum Myeongjo';
            case 'modern': return 'Gowun Dodum';
            case 'artistic': return 'Song Myung';
            case 'playful': return 'Dongle';
            case 'retro': return 'Nanum Myeongjo';
            case 'natural': return 'Gowun Dodum';
            case 'dreamy': return 'Hi Melody';
            case 'fresh': return 'Gaegu';
            default: return 'Noto Sans KR';
        }
    };

    // 프리셋/테마 변경 시 스타일 적용 로직
    useEffect(() => {
        // [NEW] Auto-update font based on theme/preset
        const newFont = getFontForTheme(themeStyle, preset);
        setFontFamily(newFont);

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
                setLayoutStyle('grid');
                break;
            case 'romantic_picnic': // 핑크 로맨틱
                setBackgroundColor('#fff0f5');
                setThemeStyle('romantic');
                setLayoutStyle('masonry');
                break;
            case 'minimal_white': // 미니멀
                setBackgroundColor('#ffffff');
                setThemeStyle('basic');
                setLayoutStyle('masonry');
                break;
            case 'vintage_scrapbook': // 빈티지 스크랩북
                setBackgroundColor('#fdfbf7');
                setThemeStyle('vintage');
                setLayoutStyle('masonry');
                break;
            // 새로운 프리셋 테마들
            case 'cute_planner': // 큐트 플래너
                setBackgroundColor('#fff5f8');
                setThemeStyle('kawaii');
                setLayoutStyle('grid');
                break;
            case 'abstract_organic': // 추상 오가닉
                setBackgroundColor('#fdf2f0');
                setThemeStyle('artistic');
                setLayoutStyle('masonry');
                break;
            case 'memphis_pop': // 멤피스 팝
                setBackgroundColor('#fef9e7');
                setThemeStyle('playful');
                setLayoutStyle('grid');
                break;
            case 'botanical_calm': // 보타니컬
                setBackgroundColor('#f5f9f0');
                setThemeStyle('natural');
                setLayoutStyle('masonry');
                break;
            case 'dreamy_pastel': // 몽환 파스텔
                setBackgroundColor('#f8f0ff');
                setThemeStyle('dreamy');
                setLayoutStyle('masonry');
                break;
            case 'retro_film': // 레트로 필름
                setBackgroundColor('#f7f3e9');
                setThemeStyle('retro');
                setLayoutStyle('grid');
                break;
            case 'ocean_breeze': // 오션 브리즈
                setBackgroundColor('#f0f8ff');
                setThemeStyle('fresh');
                setLayoutStyle('masonry');
                break;
        }
    }, [preset, setBackgroundColor, setThemeStyle, setLayoutStyle, setFontFamily, themeStyle]); // Added themeStyle dependency

    const getPreviewContainerStyle = () => {
        let baseStyle = "w-full flex-1 rounded-2xl shadow-xl overflow-y-auto border border-gray-100 relative h-full transition-all duration-300";

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
        // 카와이 스타일 - 도트 패턴
        if (themeStyle === 'kawaii') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `radial-gradient(circle, #ffb6c1 1px, transparent 1px)`,
                backgroundSize: '15px 15px'
            };
        }
        // 아티스틱 스타일 - 추상 블롭
        if (themeStyle === 'artistic') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `
                    radial-gradient(ellipse at 20% 30%, rgba(255,182,193,0.3) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 70%, rgba(173,216,230,0.3) 0%, transparent 50%)
                `
            };
        }
        // 플레이풀 스타일 - 기하학 패턴
        if (themeStyle === 'playful') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `
                    linear-gradient(135deg, rgba(255,215,0,0.1) 25%, transparent 25%),
                    linear-gradient(225deg, rgba(255,105,180,0.1) 25%, transparent 25%)
                `,
                backgroundSize: '30px 30px'
            };
        }
        // 자연 스타일 - 부드러운 그라데이션
        if (themeStyle === 'natural') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `linear-gradient(180deg, rgba(144,238,144,0.1) 0%, transparent 100%)`
            };
        }
        // 몽환 스타일 - 드리미 글로우
        if (themeStyle === 'dreamy') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `
                    radial-gradient(circle at 30% 20%, rgba(199,125,255,0.15) 0%, transparent 40%),
                    radial-gradient(circle at 70% 80%, rgba(255,182,255,0.15) 0%, transparent 40%)
                `
            };
        }
        // 레트로 스타일 - 필름 그레인
        if (themeStyle === 'retro') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `
                    repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 2px)
                `
            };
        }
        // 프레쉬 스타일 - 파도 패턴
        if (themeStyle === 'fresh') {
            return {
                backgroundColor: backgroundColor,
                backgroundImage: `
                    linear-gradient(180deg, rgba(135,206,250,0.15) 0%, transparent 30%),
                    linear-gradient(0deg, rgba(135,206,250,0.1) 0%, transparent 20%)
                `
            };
        }
        return { backgroundColor };
    };

    const TapeDecoration = () => (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-yellow-100/80 rotate-2 shadow-sm z-10 opacity-90 backdrop-blur-sm border-l border-r border-white/50" />
    );

    const layoutOptions = [
        { id: 'grid', label: '그리드', icon: <Grid className="w-5 h-5" />, desc: '기본 정렬' },
        { id: 'masonry', label: 'Masonry', icon: <Layers className="w-5 h-5" />, desc: '빈틈없는 배치' },
        { id: 'collage', label: '콜라주', icon: <ImageIcon className="w-5 h-5" />, desc: '자유 배치' },
        { id: 'bricks', label: 'Bricks', icon: <LayoutGrid className="w-5 h-5" />, desc: '벽돌 스타일' },
    ];

    const sizeOptions = [
        { id: 'small', label: 'Small', icon: <Minimize2 className="w-5 h-5" />, desc: '작게' },
        { id: 'medium', label: 'Medium', icon: <span>M</span>, desc: '중간' },
        { id: 'large', label: 'Large', icon: <Maximize2 className="w-5 h-5" />, desc: '크게' },
        { id: 'full', label: 'Full', icon: <ArrowUpRight className="w-5 h-5" />, desc: '꽉찬 화면' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-stretch animate-fade-in h-[calc(100vh-120px)]">
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
                    `} style={{ fontFamily: fontFamily }}>
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
                        ${(layoutStyle === 'grid' || layoutStyle === 'collage')
                            ? (sizeOption === 'large' || sizeOption === 'full')
                                ? 'grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2' // Large/Full: 1-2 columns (Bigger items)
                                : 'grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3' // Normal: 2-3 columns
                            : ''}
                        ${layoutStyle === 'masonry'
                            ? (sizeOption === 'large' || sizeOption === 'full')
                                ? 'columns-1 md:columns-2 gap-6 space-y-6'
                                : 'columns-2 md:columns-3 gap-6 space-y-6'
                            : ''}
                        ${layoutStyle === 'bricks'
                            ? 'grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px] grid-flow-dense' // Bricks Layout
                            : ''}
                        ${layoutStyle === 'collage'
                            ? 'columns-2 md:columns-3 gap-3 space-y-3' // [NEW] Dense Masonry for Collage
                            : ''}
                    `}>
                        {selectedImages.map((img: any, idx: number) => (
                            <div key={idx} className={`relative group transition-all duration-300
                                ${layoutStyle === 'bricks' && (idx % 3 === 0) ? 'col-span-2 row-span-2' : ''} // Featured Brick for Bricks
                                ${layoutStyle === 'collage' ? 'break-inside-avoid mb-3' : ''} // Masonry Item for Collage
                                ${sizeOption === 'small' ? 'aspect-video' : sizeOption === 'large' ? 'aspect-auto min-h-[400px]' : sizeOption === 'full' ? 'aspect-[9/16]' : 'aspect-square'}
                                ${(layoutStyle === 'bricks') ? 'aspect-auto w-full h-full' : ''} // Reset aspect for Bricks
                                ${(layoutStyle === 'collage') ? 'aspect-auto w-full h-auto' : ''} // [NEW] Reset aspect for Collage (Height Auto)
                                ${themeStyle === 'vintage'
                                    ? 'bg-white p-3 shadow-lg rotate-1 even:-rotate-2 border border-gray-100/50'
                                    : 'rounded-2xl overflow-hidden shadow-md border border-gray-100'}
                            `}>
                                {(themeStyle === 'vintage' || preset === 'cozy_morning' || preset === 'vintage_scrapbook') && (idx % 2 === 0 || idx === 0) && <TapeDecoration />}

                                <img src={img.imageUrl} alt="diary" className={`w-full h-full shadow-inner transition-all duration-300
                                    ${layoutStyle === 'collage' ? 'object-cover w-full h-auto' : 'object-cover'}
                                    ${themeStyle === 'vintage' ? '' : 'rounded-lg'}
                                `} />
                            </div>
                        ))}
                    </div>



                    {/* Text Content */}
                    <div className={`whitespace-pre-wrap leading-loose p-4 rounded-xl
                        ${themeStyle === 'vintage' || themeStyle === 'romantic'
                            ? 'font-serif text-gray-800'
                            : 'text-gray-700 font-medium'}
                    `} style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}>
                        {editedDiary}
                    </div>
                </div>
            </div>

            {/* Right Panel: Style Controls */}
            <div className="w-[450px] flex-shrink-0 flex flex-col h-full">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0 z-10">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Edit3 className="w-4 h-4 text-pink-500" /> 디자인 편집</h3>
                        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                            <button onClick={() => setActiveTab('layout')} className={`p-1.5 rounded transition-colors ${activeTab === 'layout' ? 'bg-pink-100 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setActiveTab('detail')} className={`p-1.5 rounded transition-colors ${activeTab === 'detail' ? 'bg-pink-100 text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Type className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
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
                                    <div className="grid grid-cols-2 gap-3">
                                        {sizeOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSizeOption(opt.id)}
                                                className={`group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                                                    ${sizeOption === opt.id
                                                        ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm scale-[1.02]'
                                                        : 'border-gray-100 bg-white text-gray-500 hover:border-pink-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`mb-2 p-2 rounded-full ${sizeOption === opt.id ? 'bg-pink-200' : 'bg-gray-100 group-hover:bg-white'}`}>
                                                    {opt.icon}
                                                </div>
                                                <span className="text-sm font-bold">{opt.label}</span>
                                                <span className="text-[10px] opacity-70">{opt.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Tab: Detail Style (Text, Color, Theme, Preset) */}
                        {activeTab === 'detail' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Preset */}
                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3 text-yellow-500" /> 프리셋 테마</label>
                                    <select
                                        value={preset || ''}
                                        onChange={(e) => setPreset(e.target.value || null)}
                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none bg-white font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <option value="">프리셋 선택 안함 (사용자 정의)</option>
                                        <optgroup label="✨ 인기 테마">
                                            <option value="cozy_morning">🧸 포근한 아침</option>
                                            <option value="romantic_picnic">🌸 로맨틱 피크닉</option>
                                            <option value="minimal_white">🏳️ 미니멀 화이트</option>
                                        </optgroup>
                                        <optgroup label="🎨 아티스틱">
                                            <option value="vintage_scrapbook">📸 빈티지 스크랩북</option>
                                            <option value="abstract_organic">🌀 추상 오가닉</option>
                                            <option value="retro_film">🎬 레트로 필름</option>
                                        </optgroup>
                                        <optgroup label="🎈 플레이풀">
                                            <option value="cute_planner">🐰 큐트 플래너</option>
                                            <option value="memphis_pop">🎉 멤피스 팝</option>
                                            <option value="dreamy_pastel">🪄 몽환 파스텔</option>
                                        </optgroup>
                                        <optgroup label="🌿 자연">
                                            <option value="botanical_calm">🪴 보타니컬 카페</option>
                                            <option value="ocean_breeze">🌊 오션 브리즈</option>
                                            <option value="city_night">🌃 도시의 밤</option>
                                        </optgroup>
                                    </select>
                                </section>

                                {/* Theme Style */}
                                <section>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">스타일 무드</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'basic', label: 'Basic', desc: '심플', emoji: '⬜' },
                                            { id: 'romantic', label: 'Romantic', desc: '러블리', emoji: '💗' },
                                            { id: 'vintage', label: 'Vintage', desc: '빈티지', emoji: '📜' },
                                            { id: 'modern', label: 'Modern', desc: '모던', emoji: '🔳' },
                                            { id: 'kawaii', label: 'Kawaii', desc: '귀여움', emoji: '🐰' },
                                            { id: 'artistic', label: 'Artistic', desc: '예술적', emoji: '🎨' },
                                            { id: 'playful', label: 'Playful', desc: '유쾌', emoji: '🎈' },
                                            { id: 'natural', label: 'Natural', desc: '자연', emoji: '🌿' },
                                            { id: 'dreamy', label: 'Dreamy', desc: '몽환', emoji: '✨' },
                                            { id: 'retro', label: 'Retro', desc: '레트로', emoji: '📼' },
                                            { id: 'fresh', label: 'Fresh', desc: '상쾌', emoji: '🌊' },
                                        ].map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setThemeStyle(theme.id)}
                                                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all
                                                    ${themeStyle === theme.id
                                                        ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="text-base">{theme.emoji}</span>
                                                <span className="text-[10px] font-bold">{theme.label}</span>
                                                <span className="text-[8px] text-gray-400">{theme.desc}</span>
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

                {/* Actions - Floating Footer Outside Panel */}
                <div className="pt-2 space-y-3 flex-shrink-0 z-10">
                    <button onClick={handleShareToFeed} disabled={isSubmitting} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-70 transition-all active:scale-[0.98]">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />} <span>일기 저장하고 공유하기</span>
                    </button>
                    <button onClick={onBack} className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-3 rounded-xl border border-gray-200 transition-colors shadow-sm">
                        이전으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StyleStep;
