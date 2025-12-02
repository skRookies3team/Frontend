import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { Facebook, Linkedin, Mail } from 'lucide-react';

// A temporary fix for the animation until the real CSS is loaded
const animationStyles = `
  .right-panel-active .sign-in-container {
    transform: translateX(100%);
  }
  .right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show 0.6s;
  }
  @keyframes show {
    0%, 49.99% {
      opacity: 0;
      z-index: 1;
    }
    50%, 100% {
      opacity: 1;
      z-index: 5;
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
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Signup State
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

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
    console.log("회원가입:", { signupEmail, signupPassword });
    navigate("/signup/info");
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
            <div className="flex gap-4 my-4">
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 w-10 h-10" type="button">
                <Facebook className="w-4 h-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 w-10 h-10" type="button">
                <Mail className="w-4 h-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 w-10 h-10" type="button">
                <Linkedin className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
            <span className="text-xs text-slate-500 mb-4">또는 이메일</span>
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
            <Button className="mt-4 rounded-full bg-[#FF4B2B] hover:bg-[#FF416C] text-white font-bold py-3 px-11 uppercase tracking-wider transition-transform active:scale-95">
              회원가입
            </Button>
          </form>
        </div>

        {/* Sign In Container */}
        <div className={`sign-in-container absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-20 ${isRightPanelActive ? "translate-x-full" : ""}`}>
          <form onSubmit={handleLogin} className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
            <h1 className="font-bold text-3xl mb-4 text-slate-800">로그인</h1>
            <div className="flex gap-4 my-4">
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 w-10 h-10" type="button">
                <Facebook className="w-4 h-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 w-10 h-10" type="button">
                <Mail className="w-4 h-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 w-10 h-10" type="button">
                <Linkedin className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
            <span className="text-xs text-slate-500 mb-4">계정으로 로그인</span>
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
        <div className={`overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-100 ${isRightPanelActive ? "-translate-x-full" : ""}`}>
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
