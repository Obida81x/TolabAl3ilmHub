import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Newspaper, BookOpen, Video, ArrowRight } from "lucide-react";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/PostCard";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";


export default function HomePage() {
  useRequireAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useTranslation();

  // تفعيل البيانات بقيم افتراضية لمنع الأخطاء في السطر 44
  const data = {
    membersCount: 0,
    postsCount: 0,
    booksCount: 0,
    meetingsCount: 0,
    recentPosts: [],
    upcomingMeetings: []
  };
  const isLoading = false;

  const stats = [
    { icon: Users, labelKey: "home.stat.members", value: data?.membersCount ?? 0, key: "members" },
    { icon: Newspaper, labelKey: "home.stat.posts", value: data?.postsCount ?? 0, key: "posts" },
    { icon: BookOpen, labelKey: "home.stat.books", value: data?.booksCount ?? 0, key: "books" },
    { icon: Video, labelKey: "home.stat.meetings", value: data?.meetingsCount ?? 0, key: "meetings" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={
          user ? t("home.greeting", { name: user.displayName }) : t("common.welcome")
        }
        arabicLabel={t("ar.main")}
        subtitle={t("home.subtitle")}
      />
        <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.key} className="border-card-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-semibold">
                          {isLoading ? "..." : s.value}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {t(s.labelKey)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{t("home.recentPosts")}</h3>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <button onClick={() => navigate("/feed")}>
                  {t("home.viewFeed")}
                  <ArrowRight className={`h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                </button>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : data.recentPosts.length === 0 ? (
              <Card className="border-card-border p-8 text-center text-muted-foreground">
                {t("home.noPostsYet")}
              </Card>
            ) : (
              data.recentPosts.map((post: any) => {
                const Component = PostCard as any;
                return <Component key={post.id} data={post} post={post} {...post} />;
              })
            )}
          

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{t("home.upcomingMeetings")}</h3>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : data.upcomingMeetings.length === 0 ? (
              <Card className="border-card-border p-6 text-center text-muted-foreground">
                {t("home.noMeetingsScheduled")}
              </Card>
            ) : (
              data.upcomingMeetings.map((meeting: any) => (
                <Card key={meeting.id} className="border-card-border">
                  <CardContent className="p-4">
                    <div className="text-xs text-secondary font-medium mb-1">
                      {formatDateTime(meeting.scheduledFor, lang)}
                    </div>
                    <div className="font-medium">{meeting.title}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}