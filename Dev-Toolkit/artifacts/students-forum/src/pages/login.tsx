import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanUsername = identifier.replace(/\s/g, "_");

      const { data, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("username", cleanUsername)
        .single();

      if (dbError || !data) {
        setError("User not found");
        return;
      }

      if (data.password !== password) {
        setError("Wrong password");
        return;
      }

      console.log("Login success:", data);

      // 🟢 حفظ المستخدم في النظام الجديد
      setUser(data);

      navigate("/");

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <Logo />
        </div>

        <Card>
          <CardContent className="p-6">

            <h2 className="text-2xl font-bold text-center mb-6">
              {t("login.welcomeBack")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

            </form>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}