import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Activity, AlertCircle, ChevronRight } from 'lucide-react';
import { Input } from "@/shared/ui/input";
import { chatbotApi, Disease } from '../api/chatbotApi';

interface DiseaseSearchProps {
  onClose: () => void;
  initialQuery?: string;
}

export default function DiseaseSearch({ onClose, initialQuery = '' }: DiseaseSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
          setResults([]);
          return;
      }
      setIsLoading(true);
      try {
        const data = await chatbotApi.searchDiseases(query);
        setResults(data);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-3xl h-[80vh] bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="증상이나 질병명을 검색해보세요 (예: 다리를 절어)"
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-pink-500/50"
                autoFocus
              />
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
            {/* List */}
            <div className={`p-6 overflow-y-auto transition-all ${selectedDisease ? 'w-1/3 hidden md:block' : 'w-full'}`}>
               <h3 className="text-sm font-medium text-white/50 mb-4">검색 결과</h3>
               {isLoading ? (
                  <div className="text-center text-white/30 py-10">검색중...</div>
               ) : results.length > 0 ? (
                  <div className="space-y-3">
                     {results.map(disease => (
                        <motion.div 
                          layoutId={`card-${disease.id}`}
                          key={disease.id}
                          onClick={() => setSelectedDisease(disease)}
                          className={`p-4 rounded-xl border cursor-pointer group transition-all ${
                            selectedDisease?.id === disease.id 
                            ? 'bg-pink-500/20 border-pink-500/50' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                           <div className="flex justify-between items-center">
                              <h4 className="text-white font-medium group-hover:text-pink-400 transition-colors">{disease.name}</h4>
                              <ChevronRight className="w-4 h-4 text-white/30" />
                           </div>
                           <p className="text-white/50 text-xs mt-2 line-clamp-2">{disease.description}</p>
                           <div className="flex gap-2 mt-3 flex-wrap">
                              {disease.symptoms.slice(0, 3).map(s => (
                                 <span key={s} className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-white/40">#{s}</span>
                              ))}
                           </div>
                        </motion.div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center text-white/30 py-10">
                     <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p>검색 결과가 없습니다.</p>
                  </div>
               )}
            </div>

            {/* Detail View */}
            <AnimatePresence>
               {selectedDisease && (
                  <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="flex-1 bg-gray-800/50 backdrop-blur border-l border-white/5 p-8 overflow-y-auto"
                  >
                     <div className="max-w-xl mx-auto">
                        <button onClick={() => setSelectedDisease(null)} className="md:hidden text-white/50 mb-4 hover:text-white">
                           ← 목록으로
                        </button>
                        <h2 className="text-3xl font-bold text-white mb-6">{selectedDisease.name}</h2>
                        
                        <div className="space-y-8">
                           <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                              <h3 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                                 <Activity className="w-5 h-5" /> 주요 증상
                              </h3>
                              <ul className="grid grid-cols-2 gap-2">
                                 {selectedDisease.symptoms.map(s => (
                                    <li key={s} className="flex items-center gap-2 text-white/80">
                                       <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                       {s}
                                    </li>
                                 ))}
                              </ul>
                           </div>

                           <div>
                              <h3 className="text-lg font-medium text-white mb-3">설명</h3>
                              <p className="text-white/70 leading-relaxed bg-white/5 p-4 rounded-xl">
                                 {selectedDisease.description}
                              </p>
                           </div>

                           <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                              <h3 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                                 <AlertCircle className="w-5 h-5" /> 예방 및 관리
                              </h3>
                              <p className="text-white/80">
                                 {selectedDisease.prevention}
                              </p>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
