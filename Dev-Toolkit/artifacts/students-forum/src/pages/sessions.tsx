import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Radio, Calendar, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequireAuth, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

type Meeting = {
  id: number;
  title: string;
  description: string | null;
  scholar: string;
  kind: "live" | "recorded";
  scheduledFor?: string | Date | null;
  durationMinutes: number | null;
};

function MeetingList({ items, isLoading }: { items: Meeting[]; isLoading: boolean }) {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  if (!items || items.length === 0) {
    return (
      <Card className="border-card-border">
        <CardContent className="p-8 text-center text-muted-foreground">
          {t("sessions.empty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((m) => (
        <button key={m.id} onClick={() => navigate(`/sessions/${m.id}`)}>
          <Card className="border-card-border hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={m.kind === "live" ? "default" : "secondary"}>
                  {m.kind === "live" ? <Radio className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
                  {t(`sessions.kind.${m.kind}`)}
                </Badge>
                {m.scheduledFor && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(m.scheduledFor, lang === "ar" ? "ar" : undefined, t("common.tba"))}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-foreground group-hover:text-primary transition-colors mb-1 font-bold">
                {m.title}
              </h3>
              <div className="text-sm text-muted-foreground mb-2">{m.scholar}</div>
              {m.description && (
                <p className="text-sm text-foreground/80 line-clamp-2">{m.description}</p>
              )}
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}

function CreateLiveBroadcastDialog() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scholar, setScholar] = useState(user?.displayName || "");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يتم ربط الـ Logic الخاص بـ Mutation لاحقاً
    console.log("Creating session:", { title, scholar, description });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("sessions.create.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("sessions.create.title")}</DialogTitle>
          <DialogDescription>{t("sessions.create.help")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("sessions.create.titleField")}</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scholar">{t("sessions.create.scholar")}</Label>
            <Input id="scholar" value={scholar} onChange={(e) => setScholar(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("sessions.create.description")}</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SessionsPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const { user } = useAuth();

  // محاكاة جلب البيانات لتجنب أخطاء undefined
  const live = { data: [], isLoading: false };
  const recorded = { data: [], isLoading: false };

  return (
    <AppLayout>
      <PageHeader 
        title={t("sessions.title")} 
        subtitle={t("sessions.subtitle")} 
      />
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        {user && (
          <div className="mb-6 flex justify-end">
            <CreateLiveBroadcastDialog />
          </div>
        )}
        <Tabs defaultValue="live">
          <TabsList className="mb-4">
            <TabsTrigger value="live">{t("sessions.tabs.live")}</TabsTrigger>
            <TabsTrigger value="recorded">{t("sessions.tabs.recorded")}</TabsTrigger>
          </TabsList>
          <TabsContent value="live">
            <MeetingList items={live.data as Meeting[]} isLoading={live.isLoading} />
          </TabsContent>
          <TabsContent value="recorded">
            <MeetingList items={recorded.data as Meeting[]} isLoading={recorded.isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}