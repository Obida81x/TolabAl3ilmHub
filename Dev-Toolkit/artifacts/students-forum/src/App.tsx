import { Routes, Route, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import HomePage from "@/pages/home";
import FeedPage from "@/pages/feed";
import HalaqahListPage from "@/pages/halaqah";
import HalaqahRoomPage from "@/pages/halaqah-room";
import SessionsPage from "@/pages/sessions";
import SessionDetailPage from "@/pages/session-detail";
import LibraryPage from "@/pages/library";
import BookDetailPage from "@/pages/book-detail";
import TestsPage from "@/pages/tests";
import TestDetailPage from "@/pages/test-detail";
import MembersPage from "@/pages/members";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/halaqah" element={<HalaqahListPage />} />
      <Route path="/halaqah/:id" element={<HalaqahRoomPage />} />
      <Route path="/sessions" element={<SessionsPage />} />
      <Route path="/sessions/:id" element={<SessionDetailPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/library/:id" element={<BookDetailPage />} />
      <Route path="/tests" element={<TestsPage />} />
      <Route path="/tests/:id" element={<TestDetailPage />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/profile/:id" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    supabase.auth.getSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        console.log("User:", session?.user?.email);
      });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}