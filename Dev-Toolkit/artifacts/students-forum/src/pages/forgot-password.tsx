import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArabesqueDivider, GeometricPattern } from "@/components/Pattern";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/i18n";
import { useForgotPassword, useResetPassword } from "../lib/auth";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // إصلاح: تعريف الـ Hooks بشكل صحيح
  const forgot = useForgotPassword();
  const reset = useResetPassword();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "done">("request");
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // استخدام mutation من Hook الـ forgot
    (forgot as any).mutate(
      { email: email.trim() },
      {
        onSuccess: (resp: any) => {
          setEmailConfigured(resp.emailConfigured);
          setStep("verify");
        },
        onError: (err: any) => {
          setError(err instanceof Error ? err.message : t("forgot.failed"));
        },
      }
    );
  };

  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // استخدام mutation من Hook الـ reset
    (reset as any).mutate(
      {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      },
      {
        onSuccess: () => setStep("done"),
        onError: (err: any) => {
          setError(err instanceof Error ? err.message : t("forgot.failed"));
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <GeometricPattern opacity={0.06} />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="outline" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <button onClick={() => navigate("/")}>
            <div className="inline-block cursor-pointer">
              <Logo />
            </div>
          </button>
        </div>

        <Card className="border-card-border">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>
                {t("forgot.title")}
              </h2>
              <ArabesqueDivider className="mt-4" />
            </div>

            {step === "request" && (
              <form onSubmit={submitRequest} className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("forgot.intro")}</p>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("forgot.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={(forgot as any).isPending}
                >
                  {(forgot as any).isPending ? t("forgot.sending") : t("forgot.send")}
                </Button>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={submitReset} className="space-y-4">
                <div className="rounded-md border border-card-border bg-muted/30 p-3 text-sm">
                  {emailConfigured ? t("forgot.sentNotice") : t("forgot.notConfiguredNotice")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">{t("forgot.code")}</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("forgot.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={(reset as any).isPending}
                >
                  {(reset as any).isPending ? t("forgot.resetting") : t("forgot.reset")}
                </Button>
              </form>
            )}

            {step === "done" && (
              <div className="text-center space-y-4">
                <p className="text-foreground">{t("forgot.success")}</p>
                <button onClick={() => navigate("/login")}>
                  <Button className="w-full">{t("common.signIn")}</Button>
                </button>
              </div>
            )}

            {step !== "done" && (
              <p className="mt-6 text-sm text-center">
                <button onClick={() => navigate("/login")}>
                  <span className="text-primary hover:underline cursor-pointer">
                    {t("forgot.backToLogin")}
                  </span>
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}