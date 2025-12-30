import {
    BrowserRouter as Router,
    Routes,
    Route,
    Outlet,
} from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Shared Components
import { ThemeProvider } from "@/shared/components/theme-provider"
import { Header } from "@/shared/components/header"

// Feature: Auth
import { AuthProvider } from "@/features/auth/context/auth-context"
import LoginPage from "@/features/auth/pages/LoginPage"
import SignupPage from "@/features/auth/pages/SignupPage"
import SignupIndexPage from "@/features/auth/pages/SignupIndexPage"
import SignupInfoPage from "@/features/auth/pages/SignupInfoPage"
import OnboardingPage from "@/features/auth/pages/OnboardingPage"
import WelcomePage from "@/features/auth/pages/WelcomePage"
import UserInfoPage from "@/features/auth/pages/UserInfoPage"
import SettingsPage from "@/features/auth/pages/SettingsPage"
import PhotoPage from "@/features/auth/pages/PhotoPage"



// Feature: Shop
import { CartProvider } from "@/features/shop/context/cart-context"
import { WishlistProvider } from "@/features/shop/context/wishlist-context"
import ShopPage from "@/features/shop/pages/ShopPage"
import CartPage from "@/features/shop/pages/CartPage"
import CheckoutPage from "@/features/shop/pages/CheckoutPage"
import CheckoutCompletePage from "@/features/shop/pages/CheckoutCompletePage"
import ProductDetailPage from "@/features/shop/pages/ProductDetailPage"
import WishlistPage from "@/features/shop/pages/WishlistPage"
import MileagePage from "@/features/shop/pages/MileagePage"

// Feature: Healthcare
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import HealthcarePage from "@/features/healthcare/pages/HealthcarePage"
import PetInfoPage from "@/features/healthcare/pages/PetInfoPage"
import PetProfilePage from "@/features/healthcare/pages/PetProfilePage"
import PetEditPage from "@/features/healthcare/pages/PetEditPage"
import RegisterPetPage from "@/features/healthcare/pages/RegisterPetPage"

// Feature: Diary
import DiaryCalendarPage from "@/features/diary/pages/DiaryCalendarPage"
import DiaryUploadPage from "@/features/diary/pages/DiaryUploadPage"
import DiaryEditPage from "@/features/diary/pages/DiaryEditPage"
import DiaryStylePage from "@/features/diary/pages/DiaryStylePage"
import AiStudioPage from "@/features/diary/pages/AiStudioPage"
import AiRecapPage from "@/features/diary/pages/AiRecapPage"
import AiBiographyPage from "@/features/diary/pages/AiBiographyPage"
import GalleryPage from "@/features/diary/pages/GalleryPage"
import PortfolioPage from "@/features/diary/pages/PortfolioPage"

// Feature: PetMate
import PetMatePage from "@/features/petmate/pages/PetMatePage"
import MissingPetRegisterPage from "@/features/petmate/pages/MissingPetRegisterPage"
import MessagesPage from "@/features/petmate/pages/MessagesPage"

// Feature: Social
import FeedPage from "@/features/social/pages/FeedPage"
import UserPage from "@/features/social/pages/UserPage"
import ProfilePage from "@/features/user/pages/ProfilePage"

// Feature: Chatbot
import { FloatingChatbotWidget } from "@/features/chatbot/components/floating-chatbot-widget"
import ChatbotPage from "@/features/chatbot/pages/ChatbotPage"

// Feature: Home
import HomePage from "@/features/home/components/HomePage"
import LocationTracker from "@/features/diary/components/LocationTracker"

const queryClient = new QueryClient();

const AppLayout = () => {
    return (
        <>
            <Header />
            <main className="bg-background text-foreground">
                <Outlet />
            </main>
            <FloatingChatbotWidget />
        </>
    );
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <ThemeProvider>
                    <AuthProvider>
                        <LocationTracker />
                        <CartProvider>
                            <WishlistProvider>
                                <Routes>
                                    <Route path="/" element={<AppLayout />}>
                                        <Route index element={<HomePage />} />
                                        <Route path="dashboard" element={<DashboardPage />} />
                                        <Route path="feed" element={<FeedPage />} />
                                        <Route path="ai-studio" element={<AiStudioPage />} />
                                        {/* <Route path="ai-diary" element={<AiDiaryPage />} /> Removed legacy */}
                                        <Route path="ai-studio/diary/calendar" element={<DiaryCalendarPage />} />
                                        <Route path="ai-studio/diary/upload" element={<DiaryUploadPage />} />
                                        <Route path="ai-studio/diary/edit" element={<DiaryEditPage />} />
                                        <Route path="ai-studio/diary/style-edit" element={<DiaryStylePage />} />
                                        <Route path="ai-studio/recap" element={<AiRecapPage />} />
                                        <Route
                                            path="ai-studio/biography"
                                            element={<AiBiographyPage />}
                                        />
                                        <Route path="chatbot" element={<ChatbotPage />} />
                                        <Route path="gallery" element={<GalleryPage />} />
                                        <Route path="healthcare" element={<HealthcarePage />} />
                                        <Route path="messages" element={<MessagesPage />} />
                                        <Route
                                            path="missing-pet/register"
                                            element={<MissingPetRegisterPage />}
                                        />
                                        <Route path="pet-mate" element={<PetMatePage />} />
                                        <Route path="portfolio" element={<PortfolioPage />} />
                                        <Route path="profile" element={<ProfilePage />}>
                                            <Route path="mileage" element={<MileagePage />} />
                                        </Route>
                                        <Route path="profile/pet/:id" element={<PetProfilePage />} />
                                        <Route path="profile/pet/:id/edit" element={<PetEditPage />} />
                                        <Route path="shop" element={<ShopPage />}>
                                            <Route path="cart" element={<CartPage />} />
                                            <Route path="wishlist" element={<WishlistPage />} />
                                            <Route path="product/:id" element={<ProductDetailPage />} />
                                            <Route path="checkout" element={<CheckoutPage />}>
                                                <Route
                                                    path="complete"
                                                    element={<CheckoutCompletePage />}
                                                />
                                            </Route>
                                        </Route>
                                        <Route path="user/:id" element={<UserPage />} />
                                    </Route>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/onboarding" element={<OnboardingPage />} />
                                    <Route path="/photo/upload" element={<PhotoPage />} />
                                    <Route path="/pet-info" element={<PetInfoPage />} />
                                    <Route path="/register-pet" element={<RegisterPetPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/signup" element={<SignupPage />}>
                                        <Route index element={<SignupIndexPage />} />
                                        <Route path="info" element={<SignupInfoPage />} />
                                    </Route>
                                    <Route path="/user-info" element={<UserInfoPage />} />
                                    <Route path="/welcome" element={<WelcomePage />} />
                                </Routes>
                            </WishlistProvider>
                        </CartProvider>
                    </AuthProvider>
                </ThemeProvider>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
