import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [identifier, setIdentifier] = useState(""); // تم تغيير الاسم ليعبر عن (إيميل أو يوزر نيم)
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let loginEmail = identifier;

      // 1. فحص إذا كان المدخل اسم مستخدم (لا يحتوي على @)
      if (!identifier.includes("@")) {
        const { data, error: profileError } = await supabase
          .from("profiles") // تأكد أن اسم الجدول هو profiles
          .select("email")
          .eq("username", identifier)
          .single();

        if (profileError || !data) {
          setError(t("login.userNotFound") || "اسم المستخدم غير موجود");
          setIsLoading(false);
          return;
        }
        loginEmail = data.email;
      }

      // 2. محاولة تسجيل الدخول باستخدام البريد الإلكتروني الناتج
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (signInError) {
        setError(signInError.message || t("login.failed"));
        return;
      }

      // تحديث البيانات بعد تسجيل الدخول بنجاح
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <button onClick={() => navigate("/")}>
            <span className="inline-block"> 
              <Logo /> 
            </span>
          </button>
        </div>
        
        <Card className="border-card-border">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {t("login.welcomeBack")}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">{t("login.username")}</Label>
                <Input
                  id="identifier"
                  type="text" // تم تغيير النوع إلى text لدعم اليوزر نيم
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t("login.usernamePlaceholder")}
                  required
                  data-testid="input-login-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-login-password"
                />
              </div>

              {error && (
                <div className="text-sm text-destructive" data-testid="text-login-error">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-login-submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("common.signingIn")}
                  </>
                ) : (
                  t("common.signIn")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-3">
              <p>
                <button onClick={() => navigate("/forgot-password")} title={t("login.forgotPassword")} className="text-primary hover:underline">
                  {t("login.forgotPassword")}
                </button>
              </p>
              <p className="text-muted-foreground">
                {t("login.newHere")}{" "}
                <button onClick={() => navigate("/register")} className="text-primary hover:underline" data-testid="link-to-register">
                  {t("login.createAccountLink")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}