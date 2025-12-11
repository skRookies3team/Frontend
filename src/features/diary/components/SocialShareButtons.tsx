import React from 'react';

// --- SVG Icon Components for Social Share ---
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

// [추가/수정]: 카카오톡 아이콘 (SVG 경로 간소화 및 색상 관리)
const KakaoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect width="24" height="24" rx="4.8" fill="transparent"/>
        <path d="M12 4.5c-4.4 0-8 2.3-8 5.2 0 1.9 1.4 3.6 3.7 4.5l-.8 3.5c-.1.5.3.8.7.6l4.4-3.1c.4.1.8.1 1.2.1 4.4 0 8-2.3 8-5.2s-3.6-5.2-8-5.2z" fill="currentColor"/>
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L15.35 6"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L8.65 18"/></svg>
);

// Helper component for Icon span wrapper
const Icon: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;

/**
 * 소셜 공유 버튼 컴포넌트입니다. 툴팁과 클립보드 복사 기능을 포함합니다.
 */
const SocialShareButtons: React.FC = () => {
    const socialButtons = [
        // [수정]: 아이콘 컬러 클래스 추가 및 배경 컬러 코드 명시 (툴팁 꼬리 색상용)
        { icon: FacebookIcon, label: "Facebook", color: "hover:bg-[#1877F2]", iconColor: "text-slate-600 group-hover:text-white", bgColor: "#1877F2", strokeColor: "currentColor" },
        { icon: KakaoIcon, label: "카카오톡", color: "hover:bg-[#FEE500]", iconColor: "text-slate-600 group-hover:text-[#3C1E1E]", bgColor: "#FEE500", strokeColor: "none" }, 
        { icon: InstagramIcon, label: "Instagram", color: "hover:bg-[#E4405F]", iconColor: "text-slate-600 group-hover:text-white", bgColor: "#E4405F", strokeColor: "currentColor" }, 
        { icon: LinkIcon, label: "Copy Link", color: "hover:bg-slate-800", iconColor: "text-slate-600 group-hover:text-white", bgColor: "#475569", strokeColor: "currentColor" }, 
    ];

    const handleButtonClick = (label: string) => {
        if (label === "Copy Link") {
            const tempInput = document.createElement('input');
            tempInput.value = window.location.href;
            document.body.appendChild(tempInput);
            
            document.execCommand('copy'); 

            document.body.removeChild(tempInput);
            alert("링크가 복사되었습니다!");
        } else {
            alert(`${label} 공유 기능은 준비 중입니다.`);
        }
    };

    return (
        <div className="flex justify-center gap-4 py-2">
            {socialButtons.map((social, idx) => {
                const tooltipBgColor = social.bgColor || '#333';
                const tooltipTextColor = social.label === "카카오톡" ? "text-[#3C1E1E]" : "text-white"; 

                return (
                    <button
                        key={idx}
                        onClick={() => handleButtonClick(social.label)}
                        className={`group relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${social.color}`}
                    >
                        {/* 툴팁 구현: 뾰족한 꼬리 추가 */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none">
                            <div className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold shadow-sm ${tooltipTextColor}`} style={{ backgroundColor: tooltipBgColor }}>
                                {social.label}
                            </div>
                            {/* 툴팁 꼬리 */}
                            <div 
                                className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2"
                                style={{ 
                                    borderLeft: '6px solid transparent', 
                                    borderRight: '6px solid transparent', 
                                    borderTop: `6px solid ${tooltipBgColor}` 
                                }}
                            />
                        </div>

                        {/* 아이콘 렌더링 */}
                        <Icon className={`h-6 w-6 transition-colors duration-300 ${social.iconColor}`} >
                            <social.icon stroke={social.strokeColor} />
                        </Icon>
                    </button>
                );
            })}
        </div>
    );
};

export default SocialShareButtons;