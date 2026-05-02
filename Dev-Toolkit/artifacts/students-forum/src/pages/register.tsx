import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArabesqueDivider, GeometricPattern } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/i18n";

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // الحالة الخاصة بالنموذج كما في تصميمك
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    gender: "",
    country: "",
    bio: "",
  });

  const [error, setError] = useState<string | null>(null);

  // ملاحظة: قمت بتعطيل hook التسجيل في صورتك، سنقوم بمحاكاة الحالة
  const register = { 
    mutate: (data: any, options: any) => {
        console.log("Registering user:", data);
        // هنا يتم استدعاء الـ API لاحقاً
    },
    isPending: false 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.gender !== "male" && form.gender !== "female") {
      setError(t("register.selectGender"));
      return;
    }

    register.mutate(form, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        navigate("/home");
      },
      onError: (err: Error) => {
        setError(err.message || t("register.failed"));
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 py-10 relative overflow-hidden">
      <GeometricPattern opacity={0.05} />
      
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="outline" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <button onClick={() => navigate("/")}>
            {/* غلفنا الشعار بـ div ليقبل التنسيق بدلاً منه */}
            <div className="inline-block">
              <Logo />
            </div>
          </button>
        </div>

        <Card className="border-card-border">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-secondary text-lg mb-1" style={{ fontFamily: "var(--app-font-serif)" }}>
                {t("ar.joinMajlis")}
              </div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--app-font-serif)" }}>
                {t("register.title")}
              </h1>
              <ArabesqueDivider className="mt-4" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* اسم المستخدم */}
                <div className="space-y-2">
                  <Label htmlFor="username">{t("register.username")}</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="abu_abdallah"
                    required
                  />
                </div>

                {/* الاسم التعريفي */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t("register.displayName")}</Label>
                  <Input
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="Abdallah"
                    required
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("register.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                {/* كلمة المرور */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t("register.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                {/* اختيار الجنس */}
                <div className="space-y-2">
                  <Label>{t("register.gender")}</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setForm({ ...form, gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("register.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("common.brother")}</SelectItem>
                      <SelectItem value="female">{t("common.sister")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* الدولة والنبذة */}
                <div className="space-y-2">
                  <Label htmlFor="country">{t("register.country")}</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("register.bio")}</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    maxLength={200}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive font-medium mt-2">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-4" disabled={register.isPending}>
                {register.isPending ? t("common.creatingAccount") : t("common.createAccount")}
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-muted-foreground">
              {t("register.alreadyMember")}{" "}
              <button onClick={() => navigate("/login")} className="text-primary hover:underline font-bold">
                {t("common.signIn")}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}