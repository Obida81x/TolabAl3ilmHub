import { Link, useLocation } from "wouter";
import {
  Home,
  MessagesSquare,
  Users,
  BookOpen,
  GraduationCap,
  Video,
  Newspaper,
  LogOut,
  UserCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth"; // احذف الدالة التي تسبب الخطأ مؤقتاً
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
  const [location, setLocation] = useLocation();
  const { user, signOut: logout } = useAuth() as any;  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const navItems = [
    { path: "/home", labelKey: "nav.dashboard", icon: Home, testId: "link-nav-home" },
    { path: "/feed", labelKey: "nav.feed", icon: Newspaper, testId: "link-nav-feed" },
    { path: "/halaqah", labelKey: "nav.halaqah", icon: MessagesSquare, testId: "link-nav-halaqah" },
    { path: "/sessions", labelKey: "nav.sessions", icon: Video, testId: "link-nav-sessions" },
    { path: "/library", labelKey: "nav.library", icon: BookOpen, testId: "link-nav-library" },
    { path: "/tests", labelKey: "nav.tests", icon: GraduationCap, testId: "link-nav-tests" },
    { path: "/members", labelKey: "nav.members", icon: Users, testId: "link-nav-members" },
    ...(user?.isAdmin ? [{ path: "/admin", labelKey: "nav.admin", icon: Shield, testId: "link-nav-admin" }] : []),
  ];

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
      queryClient.invalidateQueries(); // سيقوم بتحديث كل البيانات كحل بديل
        setLocation("/");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <GeometricPattern opacity={0.05} />
          </div>
          <div className="relative px-6 pt-6 pb-4 border-b border-sidebar-border flex items-center justify-between gap-2">
            <Link href={user ? "/home" : "/"} data-testid="link-home-logo">
              <Logo size="md" />
            </Link>
            <LanguageToggle />
          </div>
          <nav className="relative flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.path || location.startsWith(item.path + "/");
              return (
                <Link key={item.path} href={item.path} data-testid={item.testId}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer",
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}>
                    <Icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          
          <div className="relative border-t border-sidebar-border p-3">
            {user ? (
              <div className="space-y-2">
                <Link href={`/profile/${user.id}`} data-testid="link-current-profile">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
                    <InitialsAvatar name={user.displayName || ""} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{user.displayName}</div>
                      <div className="truncate text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout} disabled={logout.isPending}>
                  <LogOut className="h-4 w-4" />
                  {t("common.signOut")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login">
                  <Button className="w-full">{t("common.signIn")}</Button>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex items-center justify-between border-b border-border px-4 py-3 bg-card">
            <Link href={user ? "/home" : "/"}><Logo size="sm" showWordmark={false} /></Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              {user && (
                <Link href={`/profile/${user.id}`}>
                  <InitialsAvatar name={user.displayName || ""} size="sm" />
                </Link>
              )}
            </div>
          </header>

          <main className="flex-1 pb-20 lg:pb-0">{children}</main>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = location === item.path || location.startsWith(item.path + "/");
              return (
                <Link key={item.path} href={item.path} data-testid={`mobile-${item.testId}`}>
                  <div className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] cursor-pointer",
                    active ? "text-primary" : "text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                    <span>{t(item.labelKey)}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}