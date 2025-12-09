export function Logo({ className }: { className?: string }) {
    return (
        <div className={className}>
            <svg
                width="160"
                height="52"
                viewBox="0 0 160 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-auto"
            >
                <defs>
                    <linearGradient id="pawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF69B4" />
                        <stop offset="50%" stopColor="#FF85C0" />
                        <stop offset="100%" stopColor="#FFA0D2" />
                    </linearGradient>

                    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF69B4" />
                        <stop offset="100%" stopColor="#FF85C0" />
                    </linearGradient>

                    <filter id="sparkle">
                        <feGaussianBlur stdDeviation="0.5" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" />
                    </filter>
                </defs>

                <g transform="translate(0, 4)">
                    {/* 상단 왼쪽 발가락 - 통통한 느낌 */}
                    <ellipse
                        cx="14"
                        cy="12"
                        rx="5"
                        ry="7"
                        fill="url(#pawGradient)"
                        className="animate-float"
                        style={{ animationDelay: "0s" }}
                    />

                    {/* 상단 오른쪽 발가락 */}
                    <ellipse
                        cx="30"
                        cy="12"
                        rx="5"
                        ry="7"
                        fill="url(#pawGradient)"
                        className="animate-float"
                        style={{ animationDelay: "0.2s" }}
                    />

                    {/* 중간 왼쪽 발가락 */}
                    <ellipse
                        cx="9"
                        cy="23"
                        rx="4.5"
                        ry="6"
                        fill="url(#pawGradient)"
                        className="animate-float"
                        style={{ animationDelay: "0.4s" }}
                    />

                    {/* 중간 오른쪽 발가락 */}
                    <ellipse
                        cx="35"
                        cy="23"
                        rx="4.5"
                        ry="6"
                        fill="url(#pawGradient)"
                        className="animate-float"
                        style={{ animationDelay: "0.6s" }}
                    />

                    {/* 하트 모양 발바닥 - 더 귀엽게 */}
                    <path
                        d="M 22 26 
               C 17 26 14 28.5 14 32 
               C 14 35.5 16.5 39 22 40.5 
               C 27.5 39 30 35.5 30 32 
               C 30 28.5 27 26 22 26 Z"
                        fill="url(#pawGradient)"
                        className="animate-pulse-slow"
                    />

                    <ellipse cx="19" cy="30" rx="3" ry="2.5" fill="white" opacity="0.3" />

                    {/* 반짝임 효과 */}
                    <circle cx="12" cy="10" r="2" fill="white" opacity="0.6" filter="url(#sparkle)" />
                    <circle cx="32" cy="10" r="1.5" fill="white" opacity="0.5" filter="url(#sparkle)" />
                </g>

                <g transform="translate(48, 0)">
                    {/* Pet 텍스트 */}
                    <text
                        x="0"
                        y="28"
                        fontFamily="'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif"
                        fontSize="26"
                        fontWeight="700"
                        fill="url(#textGradient)"
                        letterSpacing="0.5"
                    >
                        Pet
                    </text>

                    {/* Log 텍스트 */}
                    <text
                        x="44"
                        y="28"
                        fontFamily="'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif"
                        fontSize="26"
                        fontWeight="700"
                        fill="url(#textGradient)"
                        letterSpacing="0.5"
                    >
                        Log
                    </text>

                    <g transform="translate(92, 8)">
                        <path
                            d="M 5 4 C 3 2 0 2 0 5 C 0 7 2 9 5 11 C 8 9 10 7 10 5 C 10 2 7 2 5 4 Z"
                            fill="#FF85C0"
                            opacity="0.8"
                            className="animate-pulse-slow"
                        />
                    </g>
                </g>
            </svg>
        </div>
    )
}