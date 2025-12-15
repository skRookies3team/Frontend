import React from 'react';
import { Calendar, Edit3, Loader2, Save } from 'lucide-react';
import { SelectedImage, LayoutStyle, TextAlign } from '../types/diary';

interface EditStepProps {
  selectedImages: SelectedImage[];
  editedDiary: string;
  setEditedDiary: (val: string) => void;
  layoutStyle: LayoutStyle;
  setLayoutStyle: (val: LayoutStyle) => void;
  textAlign: TextAlign;
  setTextAlign: (val: TextAlign) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  backgroundColor: string;
  setBackgroundColor: (val: string) => void;
  handleShareToFeed: () => void;
  isSubmitting: boolean;
}

const EditStep: React.FC<EditStepProps> = ({
  selectedImages, editedDiary, setEditedDiary,
  layoutStyle, setLayoutStyle, textAlign, setTextAlign,
  fontSize, setFontSize, backgroundColor, setBackgroundColor,
  handleShareToFeed, isSubmitting
}) => {
  const backgroundColors = ["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-24"
        style={{ backgroundColor }}>
        <div className={`p-8 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
          
          <div className={`mb-8 gap-2 ${
            layoutStyle === 'grid' ? 'grid grid-cols-2' : 
            layoutStyle === 'masonry' ? 'columns-2 space-y-2' : 
            layoutStyle === 'slide' ? 'flex overflow-x-auto pb-2 snap-x' : 
            'flex flex-col space-y-4'
          }`}>
            {selectedImages.map((img, idx) => (
              <img 
                key={idx} 
                src={img.imageUrl} 
                alt="diary" 
                className={`rounded-lg object-cover shadow-sm w-full ${layoutStyle === 'slide' ? 'min-w-[80%] snap-center' : ''}`} 
              />
            ))}
          </div>

          <textarea
            value={editedDiary}
            onChange={(e) => setEditedDiary(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed text-gray-700 placeholder-gray-300 outline-none p-0"
            style={{ fontSize: `${fontSize}px`, minHeight: '200px' }}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-pink-500" /> 스타일 편집
          </h3>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">레이아웃</label>
            <div className="grid grid-cols-4 gap-2">
              {['grid', 'masonry', 'slide', 'classic'].map((style) => (
                <button
                  key={style}
                  onClick={() => setLayoutStyle(style as LayoutStyle)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    layoutStyle === style 
                      ? 'bg-pink-50 text-pink-600 border border-pink-200 shadow-sm' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">정렬</label>
            <div className="flex bg-gray-50 rounded-lg p-1">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => setTextAlign(align as TextAlign)}
                  className={`flex-1 py-1.5 rounded-md text-sm transition-all ${
                    textAlign === align ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {align === 'left' ? 'L' : align === 'center' ? 'C' : 'R'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">글자 크기</label>
              <span className="text-xs font-medium text-pink-500">{fontSize}px</span>
            </div>
            <input 
              type="range" min="12" max="24" step="1" 
              value={fontSize} 
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-pink-500 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">배경 색상</label>
            <div className="grid grid-cols-5 gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`h-8 rounded-full border transition-all ${backgroundColor === color ? "border-pink-500 scale-110 ring-1 ring-pink-500" : "border-gray-200"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleShareToFeed}
          disabled={isSubmitting}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-pink-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>저장하고 공유하기</span>
        </button>
      </div>
    </div>
  );
};

export default EditStep;