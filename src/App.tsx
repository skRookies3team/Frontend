import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { CartProvider } from "@/components/shop/cart-context"
import { WishlistProvider } from "@/components/shop/wishlist-context"
import { FloatingChatbotWidget } from "@/components/floating-chatbot-widget"

import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import FeedPage from "./pages/FeedPage"
import ExplorePage from "./pages/ExplorePage"
import CreatePage from "./pages/CreatePage"
import AiDiaryPage from "./pages/AiDiaryPage"
import AiStudioPage from "./pages/AiStudioPage"
import AiRecapPage from "./pages/AiRecapPage"
import AiBiographyPage from "./pages/AiBiographyPage"
import ChatbotPage from "./pages/ChatbotPage"
import GalleryPage from "./pages/GalleryPage"
import HealthcarePage from "./pages/HealthcarePage"
import MessagesPage from "./pages/MessagesPage"
import MissingPetRegisterPage from "./pages/MissingPetRegisterPage"
import OnboardingPage from "./pages/OnboardingPage"
import PetInfoPage from "./pages/PetInfoPage"
import PetMatePage from "./pages/PetMatePage"
import PortfolioPage from "./pages/PortfolioPage"
import ProfilePage from "./pages/ProfilePage"
import MileagePage from "./pages/MileagePage"
import PetProfilePage from "./pages/PetProfilePage"
import RegisterPetPage from "./pages/RegisterPetPage"
import PetEditPage from "./pages/PetEditPage"
import SettingsPage from "./pages/SettingsPage"
import ShopPage from "./pages/ShopPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import CheckoutCompletePage from "./pages/CheckoutCompletePage"
import SignupPage from "./pages/SignupPage"
import SignupInfoPage from "./pages/SignupInfoPage"
import SignupIndexPage from "./pages/SignupIndexPage"
import UserPage from "./pages/UserPage"
import UserInfoPage from "./pages/UserInfoPage"
import WalkMatePage from "./pages/WalkMatePage"
import WelcomePage from "./pages/WelcomePage"
import ProductDetailPage from "./pages/ProductDetailPage"
import WishlistPage from "./pages/WishlistPage"
import FeedAiRecommendPage from "./pages/FeedAiRecommendPage"
import FeedCreatePage from "./pages/FeedCreatePage"

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
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="feed" element={<FeedPage />} />
                  <Route path="feed/ai-recommend" element={<FeedAiRecommendPage />} />
                  <Route path="feed/create" element={<FeedCreatePage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="create" element={<CreatePage />} />
                  <Route path="ai-diary" element={<AiDiaryPage />} />
                  <Route path="ai-studio" element={<AiStudioPage />} />
                  <Route path="ai-studio/diary" element={<AiDiaryPage />} />
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
                  {/* Add other routes here */}
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/pet-info" element={<PetInfoPage />} />
                <Route path="/register-pet" element={<RegisterPetPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/signup" element={<SignupPage />}>
                  <Route index element={<SignupIndexPage />} />
                  <Route path="info" element={<SignupInfoPage />} />
                </Route>
                <Route path="/user-info" element={<UserInfoPage />} />
                <Route path="/walk-mate" element={<WalkMatePage />} />
                <Route path="/welcome" element={<WelcomePage />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
