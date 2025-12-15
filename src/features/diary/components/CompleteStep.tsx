import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const CompleteStep: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">일기가 저장되었습니다!</h2>
            <p className="text-gray-500">잠시 후 피드로 이동합니다...</p>
        </div>
    );
};

export default CompleteStep;