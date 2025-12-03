import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  id: string;
  name: string;
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
    age: number;
    photo: string;
    gender: string;
    neutered: boolean;
    birthday?: string;
    emoji?: string;
    personality?: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  connectWithapet: () => void;
  addPetCoin: (amount: number) => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  id: "1",
  name: "김우빈",
  email: "user@petlog.com",
  avatar: "/placeholder-user.jpg",
  bio: "반려동물과 함께하는 행복한 일상 🐾",
  petCoin: 1250,
  withapetConnected: false,
  profileCompleted: true,
  pets: [
    {
      id: "1",
      name: "몽치",
      species: "강아지",
      breed: "골든 리트리버",
      age: 3,
      photo: "/golden-retriever.png",
      gender: "남아",
      neutered: true,
      birthday: "2022-03-15",
    },
    {
      id: "2",
      name: "코코",
      species: "고양이",
      breed: "스코티시 폴드",
      age: 2,
      photo: "/cat-portrait.png",
      gender: "여아",
      neutered: true,
      birthday: "2023-05-20",
    },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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

  const login = async (_email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newUser = { ...mockUser, profileCompleted: true };
    setUser(newUser);
    localStorage.setItem("petlog_user", JSON.stringify(newUser));
    navigate("/dashboard");
  };

  const signup = async (userData: Partial<User>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newUser = {
      ...mockUser,
      ...userData,
      profileCompleted: true
    };
    setUser(newUser);
    localStorage.setItem("petlog_user", JSON.stringify(newUser));
    // Navigation is handled by the calling component (PetInfoPage)
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("petlog_user");
    navigate("/");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("petlog_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, connectWithapet, addPetCoin, updateUser }}>
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