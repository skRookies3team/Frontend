import React from 'react';

// --- SVG Icon Components for Social Share ---
// SVG 정의는 간결성을 위해 생략하고, 동일한 JSX 구조를 유지합니다.
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.7 2 3c2 1 4.2 1.7 6 1.7 3.3-3.6 8-4.6 12-3z"/></svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L15.35 6"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L8.65 18"/></svg>
);

// Helper component for Icon span wrapper
const Icon: React.FC<{ className?: string }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;

/**
 * 소셜 공유 버튼 컴포넌트입니다. 툴팁과 클립보드 복사 기능을 포함합니다.
 */
const SocialShareButtons: React.FC = () => {
    const socialButtons = [
        { label: "Facebook", icon: FacebookIcon, color: "hover:bg-[#1877F2]", text: "group-hover:text-white" }, 
        { label: "Twitter", icon: TwitterIcon, color: "hover:bg-[#1DA1F2]", text: "group-hover:text-white" }, 
        { label: "Instagram", icon: InstagramIcon, color: "hover:bg-[#E4405F]", text: "group-hover:text-white" }, 
        { label: "Copy Link", icon: LinkIcon, color: "hover:bg-slate-800", text: "group-hover:text-white" }, 
    ];

    const handleButtonClick = (label: string) => {
        if (label === "Copy Link") {
            const tempInput = document.createElement('input');
            tempInput.value = window.location.href;
            document.body.appendChild(tempInput);
            
            document.execCommand('copy'); 

            document.body.removeChild(tempInput);
            // [UX 개선] 팝업 대신 alert 사용
            alert("링크가 복사되었습니다!");
        } else {
            alert(`${label} 공유 기능은 준비 중입니다.`);
        }
    };

    return (
        <div className="flex justify-center gap-4 py-2">
            {socialButtons.map((social, idx) => (
                <button
                    key={idx}
                    onClick={() => handleButtonClick(social.label)}
                    className={`group relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${social.color}`}
                >
                    {/* 툴팁 구현 */}
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 scale-0 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 opacity-0 whitespace-nowrap z-10`}>
                        {social.label}
                    </div>
                    
                    {/* 아이콘 렌더링 */}
                    <Icon className={`h-6 w-6 text-slate-600 transition-colors duration-300 ${social.text}`}>
                        <social.icon />
                    </Icon>
                </button>
            ))}
        </div>
    );
};

export default SocialShareButtons;