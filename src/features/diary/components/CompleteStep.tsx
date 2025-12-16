import React from 'react';
import { Check, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompleteStep: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
      <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce-short">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">일기 작성이 완료되었어요!</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        소중한 추억이 안전하게 저장되었습니다.<br/>
        이제 피드에서 친구들과 공유해보세요.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/feed')}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          내 다이어리 보기
        </button>
        <button className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-md transition-colors flex items-center gap-2">
          <Share2 className="w-4 h-4" /> 피드 공유하기
        </button>
      </div>
    </div>
  );
};

export default CompleteStep;