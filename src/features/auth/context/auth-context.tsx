import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setTokenGetter, setTokenRemover, setUserIdGetter } from "@/shared/api/http-client"; // [수정] setUserIdGetter 추가
import { loginApi, signupApi, getUserCoinApi } from "@/features/auth/api/auth-api";
import { createPetApi } from "@/features/healthcare/api/pet-api";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  birthday?: string;
  gender?: string;
  petCoin: number;
  withapetConnected: boolean;
  profileCompleted: boolean;
  pets: {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number | string;
    photo: string;
    gender: string;
    neutered: boolean;
    birthday?: string;
    emoji?: string;
    personality?: string;
    healthStatus?: {
      lastCheckup: string;
      vaccination: string;
      weight: string;
    };
    stats?: {
      walks: number;
      friends: number;
      photos: number;
    };
    isMemorial?: boolean;
  }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userDto: any, petDto: any, petFile: File | null) => Promise<void>;
  googleLogin: () => Promise<void>;
  googleSignup: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  hasToken: () => boolean;
  connectWithapet: () => void;
  addPetCoin: (amount: number) => void;
  refreshPetCoin: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addPet: (petDto: any, file: File | null) => Promise<void>;
  updatePet: (petId: string, updates: Partial<User['pets'][0]>) => void;
  deletePet: (petId: string) => void;
  signupUserFile: File | null;
  setSignupUserFile: (file: File | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  id: "1",
  name: "김우빈",
  username: "woobin_kim",
  email: "user@petlog.com",
  avatar: "/placeholder-user.jpg",
  bio: "반려동물과 함께하는 행복한 일상 🐾",
  petCoin: 1250,
  withapetConnected: false,
  profileCompleted: true,
  pets: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signupUserFile, setSignupUserFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 토큰을 메모리(상태)와 로컬스토리지에 저장
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("petlog_token"));

  // 토큰 설정 (메모리 및 로컬스토리지 동기화)
  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('petlog_token', newToken); // 토큰 저장
    } else {
      localStorage.removeItem('petlog_token'); // 토큰 삭제
    }
    setTokenState(newToken);
    // 즉시 axios 인터셉터에 토큰 반영
    setTokenGetter(() => newToken);
  };

  // 토큰 존재 여부 확인
  const hasToken = () => {
    return !!token;
  };

  // axios에 토큰 및 유저 ID 가져오기 함수 등록
  useEffect(() => {
    // 1. 토큰 Getter 설정
    setTokenGetter(() => token);

    // 2. [수정] User ID Getter 설정 (API 요청 헤더 X-USER-ID 설정용)
    setUserIdGetter(() => {
      // (1) 현재 상태(state)에 user 정보가 있으면 ID 반환
      if (user?.id) return user.id;

      // (2) 상태에 없다면(새로고침 직후 등), 로컬 스토리지에서 복구 시도
      const storedUser = localStorage.getItem("petlog_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          return parsed.id ? String(parsed.id) : null;
        } catch (e) {
          return null;
        }
      }
      return null;
    });

    setTokenRemover(() => {
      setTokenState(null);
      setUser(null);
      localStorage.removeItem("petlog_user"); // 로그아웃 시 사용자 정보도 로컬스토리지에서 삭제
    });
  }, [token, user]); // [수정] user가 변경될 때마다 Getter가 최신 ID를 참조하도록 의존성 추가

  useEffect(() => {
    // 개발용: localStorage에서 사용자 정보 복원
    const storedUser = localStorage.getItem("petlog_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/login",
      "/onboarding",
      "/register-pet",
      "/welcome",
      "/signup",
      "/user-info",
      "/pet-info",
      "/signup/info",
    ];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!isLoading && !user && !isPublicRoute) {
      navigate("/login");
    }
  }, [user, location.pathname, isLoading, navigate]);

  // 로그인
  const login = async (email: string, password: string) => {
    try {
      // 백엔드 API 호출
      const response = await loginApi(email, password);

      // 토큰 저장 (메모리)
      setToken(response.token);

      // 코인 정보 가져오기
      const coinDto = await getUserCoinApi(response.userId);

      // 사용자 정보 저장
      const userData: User = {
        ...mockUser,
        id: response.userId.toString(),
        name: response.username,
        username: response.social,
        email: response.email,
        petCoin: coinDto.petCoin, // 실시간 코인 정보 반영
        profileCompleted: true
      };

      setUser(userData);
      // 로컬 스토리지에도 저장 (새로고침 시 유지용)
      localStorage.setItem("petlog_user", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userDto: any, petDto: any, petFile: File | null) => {
    try {
      const requestDto = {
        user: userDto,
        pet: petDto
      };

      await signupApi(signupUserFile, petFile, requestDto);

      // 회원가입 성공 후 로그인 페이지로 이동
      navigate("/login");

    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const googleLogin = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUser = { ...mockUser, profileCompleted: true };
    setUser(newUser);
    localStorage.setItem("petlog_user", JSON.stringify(newUser));
    navigate("/dashboard");
  };

  const googleSignup = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    navigate("/signup/info");
  };

  const connectWithapet = () => {
    if (user) {
      const updatedUser = { ...user, withapetConnected: true, petCoin: user.petCoin + 100 };
      setUser(updatedUser);
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
    }
  };

  const addPetCoin = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, petCoin: user.petCoin + amount };
      setUser(updatedUser);
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
    }
  };

  const refreshPetCoin = async () => {
    if (user) {
      try {
        const coinDto = await getUserCoinApi(parseInt(user.id));
        const updatedUser = { ...user, petCoin: coinDto.petCoin };
        setUser(updatedUser);
        localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Failed to refresh pet coin:", error);
      }
    }
  };

  // 로그아웃 - 토큰 삭제
  const logout = () => {
    localStorage.removeItem('petlog_token'); // 토큰 삭제
    setTokenState(null);
    setUser(null);
    localStorage.removeItem("petlog_user"); // 유저 정보 삭제
    navigate("/");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
    }
  };

  const addPet = async (petDto: any, file: File | null) => {
    console.log("AuthContext: addPet called", { user, petDto, file });
    if (!user) {
      console.log("AuthContext: addPet aborted - no user");
      return;
    }

    try {
      // Call Backend API
      const response = await createPetApi(petDto, file);

      // Verify response structure matches expected local state
      const newPet = {
        id: response.petId.toString(),
        name: response.petName,
        species: response.species === "DOG" ? "강아지" : "고양이",
        breed: response.breed,
        age: response.age,
        photo: response.profileImage || "/placeholder-pet.jpg",
        gender: response.genderType === "MALE" ? "수컷" : response.genderType === "FEMALE" ? "암컷" : "알 수 없음",
        neutered: response.is_neutered,
        birthday: response.birth,
        healthStatus: {
          lastCheckup: "",
          vaccination: "",
          weight: ""
        },
        stats: {
          walks: 0,
          friends: 0,
          photos: 0
        }
      };

      const updatedPets = [...user.pets, newPet];
      const updatedUser = { ...user, pets: updatedPets };
      setUser(updatedUser);
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to add pet:", error);
      throw error;
    }
  };

  const updatePet = (petId: string, updates: Partial<User['pets'][0]>) => {
    if (user) {
      const updatedPets = user.pets.map(pet =>
        pet.id === petId ? { ...pet, ...updates } : pet
      );
      const updatedUser = { ...user, pets: updatedPets };
      setUser(updatedUser);
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
    }
  };

  const deletePet = (petId: string) => {
    if (user) {
      const updatedPets = user.pets.filter(pet => pet.id !== petId);
      const updatedUser = { ...user, pets: updatedPets };
      setUser(updatedUser);
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      signup,
      googleLogin,
      googleSignup,
      logout,
      isLoading,
      setToken,
      hasToken,
      connectWithapet,
      addPetCoin,
      refreshPetCoin,
      updateUser,
      addPet,
      updatePet,
      deletePet,
      signupUserFile,
      setSignupUserFile
    }}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}