import React from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Radio, Video, Calendar, Clock, ExternalLink } from "lucide-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

// دالة تحويل الروابط التي كتبتها يا هندسة
function videoEmbed(url: string): string {
  if (url.includes("youtube.com/embed/")) return url;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
}

export default function SessionDetailPage() {
  useRequireAuth();
  const { t, lang } = useTranslation();
  const params = useParams<{ id: string }>();
  
  // في الصور كان المتغير مسمى m، سنقوم بتعريفه هنا
  // ملاحظة: قمت بتعطيل جلب البيانات في السطر 23 في صورتك، لذا سنضع بيانات افتراضية للتجربة
  const m: any = null; 
  const isLoading = false;

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">
        <Link href="/sessions">
          <Button variant="ghost" size="sm" className="gap-1 mb-6">
            <BackIcon className="h-4 w-4" />
            {t("sessions.allSessions")}
          </Button>
        </Link>

        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : !m ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold">{t("sessions.notFound")}</h2>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant={m.kind === "live" ? "default" : "secondary"} className="gap-1">
                {m.kind === "live" ? <Radio className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                {t(`sessions.kind.${m.kind}`)}
              </Badge>
              
              {m.scheduledFor && (
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(m.scheduledFor, lang === "ar" ? "ar" : undefined, t("common.tba"))}
                </span>
              )}

              {m.durationMinutes && (
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {m.durationMinutes} {t("common.min")}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {m.title}
              </h1>
              <div className="text-secondary text-lg">{m.scholar}</div>
            </div>

            {/* عرض الفيديو إذا كانت المحاضرة مسجلة */}
            {m.kind === "recorded" && m.videoUrl && (
              <Card className="border-card-border overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    src={videoEmbed(m.videoUrl)}
                    title={m.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </Card>
            )}

            {/* عرض رابط الانضمام إذا كانت المحاضرة مباشرة */}
            {m.kind === "live" && m.liveUrl && (
              <Card className="border-card-border bg-primary/5">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary font-bold">
                    <Radio className="h-5 w-5" />
                    <span>{t("sessions.liveLink")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("sessions.liveHelp")}
                  </p>
                  <Button asChild size="lg" className="gap-2">
                    <a href={m.liveUrl} target="_blank" rel="noopener noreferrer">
                      {t("sessions.joinSitting")}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {m.description && (
              <Card className="border-card-border">
                <CardContent className="p-6">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {m.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}