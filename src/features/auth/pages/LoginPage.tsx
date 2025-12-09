import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAuth } from "@/features/auth/context/auth-context";

// Google Icon SVG Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// A temporary fix for the animation until the real CSS is loaded
const animationStyles = `
  .right-panel-active .sign-in-container {
    transform: translateX(100%);
  }
  .right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 50;
    animation: show 0.6s;
  }
  @keyframes show {
    0%, 49.99% {
      opacity: 0;
      z-index: 1;
    }
    50%, 100% {
      opacity: 1;
      z-index: 50;
    }
  }
  .right-panel-active .overlay-container {
    transform: translateX(-100%);
  }
  .right-panel-active .overlay {
    transform: translateX(50%);
  }
  .right-panel-active .overlay-left {
    transform: translateX(0);
  }
  .right-panel-active .overlay-right {
    transform: translateX(20%);
  }
`;

export default function LoginPage() {
  const { login, googleLogin, googleSignup } = useAuth();
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Signup State
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [isGoogleSignupLoading, setIsGoogleSignupLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      // login function handles navigation
    } catch (error) {
      console.error("로그인 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setPasswordError("");
    console.log("회원가입:", { signupEmail, signupPassword });
    navigate("/signup/info");
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await googleLogin();
    } catch (error) {
      console.error("Google 로그인 실패", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleSignupLoading(true);
    try {
      await googleSignup();
    } catch (error) {
      console.error("Google 회원가입 실패", error);
    } finally {
      setIsGoogleSignupLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50/50 to-white px-4 py-12">
      <style>{animationStyles}</style>
      <div
        className={`relative overflow-hidden w-[768px] max-w-full min-h-[480px] bg-white rounded-[20px] shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] ${isRightPanelActive ? "right-panel-active" : ""}`}
        id="container"
      >
        {/* Sign Up Container */}
        <div className={`sign-up-container absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 opacity-0 z-10 ${isRightPanelActive ? "translate-x-full opacity-100 z-50 animate-show" : ""}`}>
          <form onSubmit={handleSignup} className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
            <h1 className="font-bold text-3xl mb-4 text-slate-800">회원가입</h1>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-slate-200 hover:bg-slate-50 transition-colors my-4"
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleSignupLoading}
            >
              <GoogleIcon className="w-5 h-5" />
              <span className="text-slate-700 font-medium">
                {isGoogleSignupLoading ? "연결 중..." : "Google로 회원가입"}
              </span>
            </Button>
            <div className="flex items-center gap-3 w-full my-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-500">또는 이메일</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            <Input
              type="email"
              placeholder="이메일"
              className="bg-slate-100 border-none my-2 py-3 px-4 w-full"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호"
              className="bg-slate-100 border-none my-2 py-3 px-4 w-full"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호 확인"
              className={`bg-slate-100 border-none my-2 py-3 px-4 w-full ${passwordError ? 'ring-2 ring-red-400' : ''}`}
              value={signupConfirmPassword}
              onChange={(e) => {
                setSignupConfirmPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              required
            />
            {passwordError && (
              <span className="text-xs text-red-500 mt-1">{passwordError}</span>
            )}
            <Button className="mt-4 rounded-full bg-[#FF4B2B] hover:bg-[#FF416C] text-white font-bold py-3 px-11 uppercase tracking-wider transition-transform active:scale-95">
              회원가입
            </Button>
          </form>
        </div>

        {/* Sign In Container */}
        <div className={`sign-in-container absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-20 ${isRightPanelActive ? "translate-x-full" : ""}`}>
          <form onSubmit={handleLogin} className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
            <h1 className="font-bold text-3xl mb-4 text-slate-800">로그인</h1>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-slate-200 hover:bg-slate-50 transition-colors my-4"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <GoogleIcon className="w-5 h-5" />
              <span className="text-slate-700 font-medium">
                {isGoogleLoading ? "로그인 중..." : "Google로 로그인"}
              </span>
            </Button>
            <div className="flex items-center gap-3 w-full my-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-500">또는 이메일</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            <Input
              type="email"
              placeholder="이메일"
              className="bg-slate-100 border-none my-2 py-3 px-4 w-full"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호"
              className="bg-slate-100 border-none my-2 py-3 px-4 w-full"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <a href="#" className="text-xs text-slate-500 my-4 hover:text-slate-800">비밀번호를 잃어버리셨나요?</a>
            <Button
              disabled={isLoading}
              className="rounded-full bg-[#FF4B2B] hover:bg-[#FF416C] text-white font-bold py-3 px-11 uppercase tracking-wider transition-transform active:scale-95"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className={`overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-[100] ${isRightPanelActive ? "-translate-x-full" : ""}`}>
          <div className={`overlay bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] text-white relative -left-full h-full w-[200%] transform transition-transform duration-600 ease-in-out ${isRightPanelActive ? "translate-x-1/2" : "translate-x-0"}`}>

            {/* Overlay Left (Visible when Right Panel Active / Sign Up Mode) */}
            <div className={`overlay-left absolute flex flex-col items-center justify-center top-0 h-full w-1/2 px-10 text-center transform transition-transform duration-600 ease-in-out ${isRightPanelActive ? "translate-x-0" : "-translate-x-[20%]"}`}>
              <h1 className="font-bold text-3xl mb-4">환영합니다!</h1>
              <p className="text-sm font-light leading-6 mb-8">
                다시 돌아와서 반가워요.
              </p>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white rounded-full font-bold py-3 px-11 uppercase tracking-wider hover:bg-white/20 hover:text-white"
                onClick={() => setIsRightPanelActive(false)}
              >
                로그인
              </Button>
            </div>

            {/* Overlay Right (Visible when Default / Sign In Mode) */}
            <div className={`overlay-right absolute right-0 flex flex-col items-center justify-center top-0 h-full w-1/2 px-10 text-center transform transition-transform duration-600 ease-in-out ${isRightPanelActive ? "translate-x-[20%]" : "translate-x-0"}`}>
              <h1 className="font-bold text-3xl mb-4">환영합니다!</h1>
              <p className="text-sm font-light leading-6 mb-8">
                새로운 계정을 만들어서 시작해보세요.
              </p>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white rounded-full font-bold py-3 px-11 uppercase tracking-wider hover:bg-white/20 hover:text-white"
                onClick={() => setIsRightPanelActive(true)}
              >
                회원가입
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

