import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/shared/components/logo";
import { Button } from "@/shared/ui/button";
import { Menu, X, MessageSquare, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/context/auth-context";
import { Badge } from "@/shared/ui/badge";
import { NotificationsDropdown } from "@/features/social/components/notifications-dropdown";
import { UserSearchModal } from "@/features/social/components/user-search-modal";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user } = useAuth();

  const [currentPetIndex, setCurrentPetIndex] = useState(0);

  const hasFinalConsonant = (name: string) => {
    if (!name || name.length === 0) return false;
    const lastChar = name.charAt(name.length - 1);
    const code = lastChar.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return false;
    return (code - 0xac00) % 28 !== 0;
  };

  const pets = user?.pets || [];

  const getChatbotLabel = () => {
    if (pets.length === 0) {
      return "펫 대화하기";
    }
    const currentPet = pets[currentPetIndex];
    const particle = hasFinalConsonant(currentPet.name) ? "이와" : "와";
    return `${currentPet.name}${particle} 대화하기`;
  };

  const getChatbotHref = () => {
    if (pets.length === 0) {
      return "/chatbot";
    }
    const currentPet = pets[currentPetIndex];
    return `/chatbot?petId=${currentPet.id}`;
  };

  useEffect(() => {
    if (pets.length > 1) {
      const interval = setInterval(() => {
        setCurrentPetIndex((prevIndex) => (prevIndex + 1) % pets.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [pets.length]);

  const navItems = [
    ...(user ? [{ href: "/dashboard", label: "홈" }] : []),
    { href: "/feed", label: "소셜 피드" },
    ...(user ? [{ href: "/pet-mate", label: "펫메이트" }] : []),
    ...(user ? [{ href: "/healthcare", label: "헬스케어" }] : []),
    { href: "/ai-studio", label: "AI 스튜디오" },
    { href: getChatbotHref(), label: getChatbotLabel(), animated: true },
    { href: "/shop", label: "쇼핑" },
    ...(user ? [{ href: "/portfolio", label: "포토갤러리" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center">
          <Logo />
        </Link>

        {user && (
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) =>
              item.animated ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary overflow-hidden inline-block",
                    location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentPetIndex}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="inline-block"
                    >
                      {item.label}
                    </motion.span>
                  </AnimatePresence>
                </Link>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        )}

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => setSearchModalOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <NotificationsDropdown />
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-0 text-xs flex items-center justify-center">
                    3
                  </Badge>
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" className="flex items-center gap-2">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span>{user.name}</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 모바일용 아이콘 바 + 햄버거 메뉴 */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <>
              <Button variant="ghost" size="icon" onClick={() => setSearchModalOpen(true)} className="h-9 w-9">
                <Search className="h-5 w-5" />
              </Button>
              <NotificationsDropdown />
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <MessageSquare className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-0 text-[10px] flex items-center justify-center">
                    3
                  </Badge>
                </Button>
              </Link>
              <Link to="/profile">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border-2 border-pink-200"
                />
              </Link>
            </>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-6">
            {user &&
              navItems.map((item) =>
                item.animated ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary overflow-hidden inline-block",
                      location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentPetIndex}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="inline-block"
                      >
                        {item.label}
                      </motion.span>
                    </AnimatePresence>
                  </Link>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            <div className="flex flex-col gap-2 pt-4">
              {!user && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full bg-transparent">
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      <UserSearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </header>
  );
}