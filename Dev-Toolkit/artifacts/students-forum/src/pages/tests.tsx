import React from "react";
import { Link } from "wouter";import { useRequireAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { GraduationCap, ChevronRight, Trophy } from "lucide-react"; // مكتبة الأيقونات

export default function TextsPage() {
  useRequireAuth();
  const { t } = useTranslation();

  // بيانات تجريبية لضمان عمل الصفحة حتى تربطها بقاعدة البيانات
  const texts: any[] = []; 
  const leaderboard: any[] = [];
  const isLoading = false;

  return (
    <AppLayout>
      <PageHeader
        title={t("texts.title")}
        arabicLabel={t("ar.tests")}
        subtitle={t("texts.subtitle")}
      />
      
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-3">
          {isLoading && <Skeleton className="h-32 w-full" />}
          
          {texts?.map((txt: any) => (
            <Link key={txt.id} href={`/texts/${txt.id}`} className="block group">
              <Card className="border-card-border hover:border-primary transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs">
                        {t(`texts.level.${txt.level}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {txt.questionCount} {t("common.questions")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {txt.title}
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <aside>
          <Card className="border-card-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-secondary" />
                <h3 className="text-lg font-semibold">{t("texts.leaderboard")}</h3>
              </div>

              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("texts.leaderboardEmpty")}</p>
              ) : (
                <ol className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry: any, idx: number) => (
                    <li key={entry.user.id} className="flex items-center gap-3">
                      <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <InitialsAvatar name={entry.user.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{entry.user.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.bestPercentage}% - {entry.attemptsCount} {t("common.attempts")}
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{entry.totalScore}</span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}