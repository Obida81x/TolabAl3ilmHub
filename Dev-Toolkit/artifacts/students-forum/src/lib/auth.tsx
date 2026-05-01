import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { supabase } from "./supabase";

type CurrentUser = {
  displayName: string | number;
  isMainAdmin: any;
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    displayName?: string;
    gender?: "male" | "female";
    country?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    isAdmin?: boolean;
    isMainAdmin?: boolean;
    isActive?: boolean;
  };
} | null;

type AuthContextValue = {
  user: CurrentUser;
  isLoading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();
        setUser(supabaseUser as unknown as CurrentUser);
      } catch (err) {
        console.error("Failed to get current user:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? (session.user as unknown as CurrentUser) : null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const refresh = async () => {
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      setUser(supabaseUser as unknown as CurrentUser);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(): CurrentUser {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  if (!isLoading && !user) {
    setLocation("/login");
  }
  return user;
}
