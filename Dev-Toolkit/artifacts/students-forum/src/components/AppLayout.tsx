import { useNavigate } from "react-router-dom";
import {
  Home,
  MessagesSquare,
  Users,
  BookOpen,
  GraduationCap,
  Video,
  Newspaper,
  LogOut,
  Shield,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Button } from "@/components/ui/button";
import { GeometricPattern } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = window.location.pathname;

  const { user, signOut } = useAuth() as any;
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const navItems = [
    { path: "/home", labelKey: "nav.dashboard", icon: Home },
    { path: "/feed", labelKey: "nav.feed", icon: Newspaper },
    { path: "/halaqah", labelKey: "nav.halaqah", icon: MessagesSquare },
    { path: "/sessions", labelKey: "nav.sessions", icon: Video },
    { path: "/library", labelKey: "nav.library", icon: BookOpen },
    { path: "/tests", labelKey: "nav.tests", icon: GraduationCap },
    { path: "/members", labelKey: "nav.members", icon: Users },
    ...(user?.isAdmin
      ? [{ path: "/admin", labelKey: "nav.admin", icon: Shield }]
      : []),
  ];

  const handleLogout = async () => {
    await signOut();
    queryClient.invalidateQueries();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-sidebar relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <GeometricPattern opacity={0.05} />
          </div>

          <div className="relative px-6 pt-6 pb-4 border-b flex justify-between items-center">
            <button onClick={() => navigate(user ? "/home" : "/")}>
              <Logo size="md" />
            </button>
            <LanguageToggle />
          </div>

          <nav className="relative flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                location === item.path ||
                location.startsWith(item.path + "/");

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="border-t p-3">
            {user ? (
              <div className="space-y-2">
                <button onClick={() => navigate(`/profile/${user.id}`)}>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <InitialsAvatar
                      name={user.displayName || ""}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {user.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  {t("common.signOut")}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => navigate("/login")}
              >
                {t("common.signIn")}
              </Button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}