import React, { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import { ArabesqueDivider } from "@/components/Pattern";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface ProfileForm {
  displayName: string;
  country: string;
  bio: string;
}

export default function ProfilePage() {
  useRequireAuth();
  const { user: me } = useAuth();
  const { t, lang } = useTranslation();
  
  const user = me; 
  const isLoading = !me;
  const isMe = !!me && !!user && (me as any).id === (user as any).id;
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    displayName: "",
    country: "",
    bio: "",
  });

  useEffect(() => {
    if (open && user) {
      setForm({
        displayName: (user as any).displayName || "",
        country: (user as any).country || "",
        bio: (user as any).bio || "",
      });
    }
  }, [open, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving changes:", form);
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <Link href="/members">
          <Button variant="ghost" size="sm" className="gap-1 mb-6">
            <BackIcon className="h-4 w-4" />
            {t("members.allMembers")}
          </Button>
        </Link>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : user ? (
          <Card className="border-card-border shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <InitialsAvatar name={(user as any).displayName || ""} size="xl" />
                <h1 className="text-3xl font-bold mt-4" style={{ fontFamily: "var(--app-font-serif)" }}>
                  {(user as any).displayName}
                </h1>
                <div className="text-sm text-muted-foreground mt-1">
                  @{(user as any).username}
                </div>
                
                <Badge variant="secondary" className="mt-3">
                  {(user as any).gender === "male" ? t("common.brother") : t("common.sister")}
                </Badge>

                {isMe && (
                  <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => setOpen(true)}>
                    <Pencil className="h-3 w-3" />
                    {t("profile.editButton")}
                  </Button>
                )}
              </div>

              <ArabesqueDivider className="my-8 w-full max-w-xs mx-auto opacity-50" />

              <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
                {(user as any).country && (
                  <div className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {(user as any).country}
                  </div>
                )}
                <div className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t("profile.joined")}{" "}
                    {(user as any).createdAt ? formatDateTime(new Date((user as any).createdAt), lang === "ar" ? "ar" : undefined) : ""}
                  </span>
                </div>
              </div>

              {(user as any).bio && (
                <div className="mt-8 text-center px-4">
                  <p className="leading-relaxed text-lg text-foreground/90 italic" style={{ fontFamily: "var(--app-font-serif)" }}>
                    "{(user as any).bio}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md border-card-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{t("profile.editTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-displayName">{t("profile.fieldDisplayName")}</Label>
                <Input 
                  id="edit-displayName" 
                  value={form.displayName} 
                  onChange={(e) => setForm(prev => ({ ...prev, displayName: e.target.value }))} 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">{t("profile.fieldCountry")}</Label>
                <Input 
                  id="edit-country" 
                  value={form.country} 
                  onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))} 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bio">{t("profile.fieldBio")}</Label>
                <Textarea 
                  id="edit-bio" 
                  value={form.bio} 
                  onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))} 
                  className="bg-background min-h-[100px]"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">
                  {t("profile.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}