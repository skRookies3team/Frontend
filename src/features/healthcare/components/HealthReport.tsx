import { useRef } from 'react';
import { Button } from "@/shared/ui/button";
import { Download, Play, Volume2, Heart, Activity, Weight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/features/auth/context/auth-context';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

/* 
  Matches "WithaPet" Report Final Design
  - Header: WithaPet Logo + Date
  - Profile: Table style
  - Dashboard: 4 summary cards
  - Analysis: MMVD Circles + Donut Chart
  - Charts: Heart & Respiratory with Waveform visualization
*/

export default function HealthReport({ analysisResult, onClose }: { analysisResult?: any, onClose: () => void }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const pet = user?.pets?.[0] || { name: 'test', breed: 'Beagle', age: '0년 1개월', gender: 'Male', birthday: '2025-05-20' };

  // Mock Data for Charts
  const heartData = [
    { time: '1', value: 85 }, { time: '2', value: 88 }, { time: '3', value: 82 }, { time: '4', value: 90 }, { time: '5', value: 86 }
  ];

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${pet.name}_건강보고서.pdf`);
    } catch (err) {
      console.error("PDF Fail:", err);
      alert("보고서 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/90 backdrop-blur-sm flex justify-center py-10">
      <div className="relative w-full max-w-[210mm] min-h-[297mm] flex flex-col">
        {/* Toolbar */}
        <div className="absolute top-0 right-0 -mr-16 md:-mr-20 flex flex-col gap-2 p-4 fixed z-50">
           <Button onClick={handleDownload} className="rounded-full bg-[#5b4dbb] hover:bg-[#4a3ea3] text-white shadow-lg w-12 h-12 p-0">
             <Download className="w-5 h-5" />
           </Button>
           <Button onClick={onClose} variant="secondary" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 w-12 h-12 p-0">
             X
           </Button>
        </div>

        {/* Report Content - A4 styled */}
        <div ref={reportRef} className="flex-1 bg-white p-[10mm] md:p-[15mm] text-[#333]">
          
          {/* 1. Header with Logo */}
          <header className="flex justify-between items-start mb-12 border-b-2 border-transparent">
             <div className="text-center w-full">
                <p className="text-sm font-bold text-[#5b4dbb] mb-1">WithaPet Report</p>
                <h1 className="text-5xl font-extrabold text-[#5b4dbb] tracking-tighter mb-2" style={{ fontFamily: 'sans-serif' }}>withapet™</h1>
                <p className="text-xs text-gray-500">스마트 청진기를 사용하여 측정한 건강 데이터 입니다.</p>
             </div>
             <div className="absolute top-[15mm] right-[15mm] text-right">
                <p className="text-[10px] text-gray-400">발급일</p>
                <p className="text-xs font-bold text-gray-600">{new Date().toLocaleDateString()}</p>
             </div>
          </header>

          {/* 2. Pet Profile */}
          <section className="mb-14">
             <h2 className="text-xl font-bold text-gray-800 mb-6">반려동물 프로필</h2>
             <div className="w-full">
                <div className="grid grid-cols-6 text-center text-xs font-bold text-gray-500 mb-2">
                   <div>이름</div>
                   <div>종류</div>
                   <div>나이</div>
                   <div>생년월일</div>
                   <div>품종</div>
                   <div>성별</div>
                </div>
                <div className="grid grid-cols-6 text-center text-sm font-bold text-gray-800 border-t border-b border-gray-100 py-4">
                   <div className="text-[#5b4dbb]">{pet.name}</div>
                   <div>Dog</div>
                   <div>{pet.age}</div>
                   <div>{pet.birthday || '2025-05-20'}</div>
                   <div>{pet.breed}</div>
                   <div>{pet.gender}</div>
                </div>
             </div>
          </section>

          {/* 3. Dashboard Summary */}
          <section className="mb-14">
             <h2 className="text-2xl font-bold text-[#5b4dbb] mb-2 flex items-center">
                {pet.name}의 건강 대쉬 보드
             </h2>
             <div className="flex items-center gap-2 mb-8">
                <span className="font-bold text-sm text-gray-800">대쉬보드 요약</span>
                <span className="text-xs text-gray-400">| 검사데이터 요약본</span>
             </div>

             <div className="grid grid-cols-4 gap-4">
                {/* Item 1 */}
                <div className="text-center">
                   <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-2 h-2 bg-[#5b4dbb]"></div>
                      <span className="text-xs font-bold">AI 분석결과</span>
                   </div>
                   <div className="text-sm font-bold text-gray-800">{analysisResult?.diagnosis || "이상 의심"}</div>
                </div>
                {/* Item 2 */}
                <div className="text-center">
                   <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-2 h-2 bg-[#ff6b6b]"></div>
                      <span className="text-xs font-bold">심박수</span>
                   </div>
                   <div className="text-sm font-bold text-gray-800">67</div>
                </div>
                {/* Item 3 */}
                <div className="text-center">
                   <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-2 h-2 bg-[#51cf66]"></div>
                      <span className="text-xs font-bold">호흡수</span>
                   </div>
                   <div className="text-sm font-bold text-gray-800">24</div>
                </div>
                {/* Item 4 */}
                <div className="text-center">
                   <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-2 h-2 bg-[#868e96]"></div>
                      <span className="text-xs font-bold">체중</span>
                   </div>
                   <div className="text-sm font-bold text-gray-800">0.0</div>
                </div>
             </div>
             <div className="mt-4 border-b border-gray-100"></div>
          </section>

          {/* 4. Analysis & MMVD */}
          <section className="mb-14">
             <div className="flex items-center gap-2 mb-6">
                <h3 className="font-bold text-sm text-gray-800">심장 AI 분석 결과 및 MMVD 단계</h3>
                <span className="text-xs text-gray-400">| 인공지능을 활용한 심장질환 진단</span>
             </div>

             <div className="grid grid-cols-2 gap-6">
                {/* Left: Diagnosis Result */}
                <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                   <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-red-500 mb-2">
                         <span className="text-3xl">❝</span> 이상 의심<span className="text-gray-800 font-medium text-lg">으로 추정됩니다.</span> <span className="text-3xl">❞</span>
                      </h4>
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                         정확한 분석을 위해 다시 측정해주세요.<br/>
                         정기적인 심장 청진과 세심한 관리가 필요합니다.<br/>
                         의심 증세가 있으면 전문 수의사님과 상의하세요.
                      </p>
                      
                      {/* Donut Chart Simulation */}
                      <div className="relative w-32 h-32 mx-auto">
                         <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="50" stroke="#fee2e2" strokeWidth="12" fill="transparent" />
                            <circle cx="64" cy="64" r="50" stroke="#ef4444" strokeWidth="12" fill="transparent" strokeDasharray={314} strokeDashoffset={314 * 0.29} strokeLinecap="round" />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-gray-400">비정상</span>
                            <span className="text-xl font-bold text-red-500">71%</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right: MMVD Stages */}
                <div className="border border-gray-200 rounded-xl p-6">
                   <div className="text-center mb-6">
                      <h5 className="text-xs font-bold text-gray-600 mb-1">MMVD(Myxomatous Mitral Valvular Disease)</h5>
                      <p className="text-[10px] text-gray-400">※ MMVD단계란 이첨판 폐쇄부전증의 분류기준 등급입니다.</p>
                   </div>
                   
                   <div className="flex items-center justify-center gap-2 mb-8">
                       {['N','B1','B2','C','D'].map((stage, i) => (
                          <div key={stage} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${
                             i === 0 ? 'bg-[#cdd3ff]' : 
                             i === 1 ? 'bg-[#ffc9c9]' : 
                             i === 2 ? 'bg-[#ff8787]' : 
                             i === 3 ? 'bg-[#fa5252]' : 'bg-[#c92a2a]'
                          }`}>
                             {stage}
                          </div>
                       ))}
                   </div>
                   
                   <div className="space-y-2 text-[10px] text-gray-500 pl-4">
                      <p><span className="font-bold text-[#5b4dbb]">N</span> 정상 건강합니다.</p>
                      <p><span className="font-bold text-[#5b4dbb]">B1</span> 이첨판의 변형으로 심잡음이 들립니다.</p>
                      <p><span className="font-bold text-[#5b4dbb]">B2</span> X-Ray로 확진 가능하며 관리를 시작해야 합니다.</p>
                      <p><span className="font-bold text-[#5b4dbb]">C</span> 기침, 헐떡임 등 증상이 나타납니다.</p>
                   </div>
                </div>
             </div>
          </section>

          {/* 5. Heart Rate Trend */}
          <section className="mb-14">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-gray-800">심박수 변화 추이</h3>
                  <span className="text-xs text-gray-400">| 심박수(HR) 데이터 5개의 추이</span>
               </div>
               <div className="flex gap-2">
                 <span className="text-[10px] border border-gray-300 px-2 py-0.5 rounded">기준: 67</span>
                 <span className="text-[10px] text-gray-500">최소: 67 | 최대: 67</span>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                {/* Chart */}
                <div className="h-40 border-l border-b border-gray-200 relative">
                   {/* Background Zones */}
                   <div className="absolute inset-0 flex flex-col opacity-10 pointer-events-none">
                      <div className="h-1/3 bg-red-500"></div>
                      <div className="h-1/3 bg-yellow-400"></div>
                      <div className="h-1/3 bg-blue-500"></div>
                   </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={heartData}>
                        <CartesianGrid vertical={false} stroke="#eee" />
                        <YAxis hide domain={[50, 100]} />
                        <Area type="monotone" dataKey="value" stroke="#2563eb" fill="none" strokeWidth={3} />
                        {/* Custom Reference Line Simulation */}
                        <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-gray-800 opacity-50"></div>
                      </AreaChart>
                    </ResponsiveContainer>
                    {/* Zones Legend */}
                    <div className="flex justify-between mt-2 px-4 text-[10px] text-gray-400 text-center">
                       <div><span className="text-blue-500 font-bold block">Blue Zone</span>정상 범위</div>
                       <div><span className="text-yellow-500 font-bold block">Yellow Zone</span>주의 요망</div>
                       <div><span className="text-red-500 font-bold block">Red Zone</span>병원 진료 권유</div>
                    </div>
                </div>

                {/* Right: Audio Visualizer & Summary */}
                <div>
                   <div className="flex items-center gap-2 mb-6">
                      <Heart className="w-8 h-8 text-[#5b4dbb]" />
                      <div>
                         <span className="text-xs text-gray-500 block">분당 심박수(HR)</span>
                         <span className="text-2xl font-bold text-gray-800">67</span>
                      </div>
                   </div>
                   
                   <p className="text-[10px] text-gray-400 mb-2">측정일시: 2025.05.20(화) 10:34:14</p>
                   
                   {/* Fake Audio Waveform */}
                   <div className="bg-gray-50 h-16 rounded mb-4 flex items-center justify-center gap-0.5 px-4 overflow-hidden">
                      {[...Array(40)].map((_, i) => (
                         <div key={i} className="w-1 bg-gray-400 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>
                      ))}
                   </div>

                   <div className="flex items-center gap-4">
                      <Button size="icon" className="rounded-full w-10 h-10 bg-[#5b4dbb]">
                         <Play className="w-4 h-4 text-white ml-1" />
                      </Button>
                      <div className="flex-1 flex items-center gap-2">
                         <Volume2 className="w-4 h-4 text-gray-400" />
                         <div className="h-1 bg-gray-200 flex-1 rounded-full relative">
                            <div className="absolute top-0 left-0 w-1/3 h-full bg-[#5b4dbb] rounded-full"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 6. Respiratory Trend */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-sm text-gray-800">호흡수 변화 추이</h3>
                  <span className="text-xs text-gray-400">| 호흡수(RR) 데이터 5개의 추이</span>
             </div>
             
             <div className="h-32 border-l border-b border-gray-200 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{v:24},{v:24},{v:24}]}>
                        <CartesianGrid vertical={false} stroke="#eee" />
                        <YAxis hide domain={[0, 40]} />
                        <Area type="monotone" dataKey="v" stroke="#2563eb" fill="none" strokeWidth={3} />
                      </AreaChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-white border-2 border-[#51cf66] w-3 h-3 rounded-full"></div>
                     <span className="text-xl font-bold text-gray-800 ml-2">24</span>
                  </div>
             </div>

          </section>

        </div>
      </div>
    </div>
  );
}
