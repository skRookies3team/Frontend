import { Calendar, MapPin, Sun, Smile } from 'lucide-react';
import KakaoMap from './KakaoMap';

interface DiaryPreviewProps {
    title: string;
    selectedImages: any[];
    editedDiary: string;
    weather: string;
    mood: string;
    locationName: string;
    locationCoords: { lat: number, lng: number } | null;
    selectedDate: string;

    // Style Settings
    layoutStyle: string;
    textAlign: string;
    fontSize: number;
    backgroundColor: string;
    sizeOption: string;
    themeStyle: string;
    preset: string | null;
    fontFamily?: string; // [NEW]
}

const DiaryPreview = ({
    title, selectedImages, editedDiary, weather, mood, locationName, locationCoords, selectedDate,
    layoutStyle, textAlign, fontSize, backgroundColor, sizeOption, themeStyle, preset, fontFamily // [NEW]
}: DiaryPreviewProps) => {

    const getPreviewContainerStyle = () => {
        let baseStyle = "w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 relative";
        if (themeStyle === 'vintage') {
            return `${baseStyle} border-4 border-[#d4c5b0]`;
        }
        return baseStyle;
    };

    const getBackgroundStyle = () => {
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

    return (
        <div className={getPreviewContainerStyle()} style={getBackgroundStyle()}>
            {/* Vintage Texture Overlay */}
            {(themeStyle === 'vintage' || preset === 'vintage_scrapbook') && (
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-repeat z-0 mix-blend-multiply"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
                </div>
            )}

            <div className={`p-8 relative z-10 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>

                {/* Title */}
                <h2 className={`text-2xl font-bold mb-4
                    ${themeStyle === 'vintage' ? 'font-serif text-amber-900 border-b-2 border-amber-900/10 pb-2' : 'text-gray-800'}
                    ${themeStyle === 'romantic' ? 'font-serif text-pink-600' : ''}
                    ${themeStyle === 'modern' ? 'tracking-tight' : ''}
                `} style={{ fontFamily: fontFamily }}>
                    {title}
                </h2>

                {/* Header Info */}
                <div className={`flex flex-col gap-4 mb-8 pb-4 
                    ${themeStyle === 'vintage' ? 'border-b-2 border-dashed border-gray-400/50' : 'border-b border-gray-100'}`}
                >
                    <div className="flex items-center gap-2">
                        {themeStyle === 'vintage' ? (
                            <div className="bg-[#fcf8e3] px-4 py-2 rounded shadow-sm text-amber-900 font-bold font-serif border border-amber-200/50 flex items-center gap-2 transform -rotate-1">
                                <Calendar className="w-4 h-4 text-amber-700" />
                                <span style={{ fontFamily: 'inherit' }}>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
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
                            <div className={`flex items-start gap-1 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm
                                ${themeStyle === 'vintage'
                                    ? 'bg-orange-50 text-orange-800 border border-orange-200 font-serif rotate-1'
                                    : 'bg-green-50 text-green-600'}
                            `}>
                                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                <span className="whitespace-normal break-words leading-tight">{locationName}</span>
                            </div>
                        )}
                        {weather && (
                            <div className={`flex items-start gap-1 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm
                                 ${themeStyle === 'vintage'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200 font-serif'
                                    : 'bg-blue-50 text-blue-600'}
                            `}>
                                <Sun className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                <span className="whitespace-normal break-words leading-tight">{weather}</span>
                            </div>
                        )}
                        {mood && (
                            <div className={`flex items-start gap-1 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm
                                 ${themeStyle === 'vintage'
                                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 font-serif -rotate-1'
                                    : 'bg-yellow-50 text-yellow-600'}
                            `}>
                                <Smile className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                <span className="whitespace-normal break-words leading-tight">{mood}</span>
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

                {/* Images with Layout */}
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
                `} style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}>
                    {editedDiary}
                </div>
            </div>
        </div>
    );
};

export default DiaryPreview;
