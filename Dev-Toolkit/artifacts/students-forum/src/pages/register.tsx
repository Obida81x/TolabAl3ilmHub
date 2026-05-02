import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanUsername = form.username.replace(/\s/g, "_");

      // 🟡 1. تحقق إذا المستخدم موجود (بدون .single لتجنب error)
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("username", cleanUsername);

      if (checkError) {
        setError(checkError.message);
        setIsLoading(false);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        setError("Username already exists");
        setIsLoading(false);
        return;
      }

      // 🟢 2. تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(form.password, 10);

      // 🟢 3. إدخال المستخدم
      const { data, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            username: cleanUsername,
            display_name: form.displayName,
            email: form.email,
            password: hashedPassword,
            gender: form.gender,
            country: form.country,
            bio: form.bio,
          },
        ])
        .select()
        .single();

      if (insertError || !data) {
        setError(insertError?.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      console.log("User registered:", data);

      queryClient.setQueryData(["user"], data);

      navigate("/login");

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
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
            <Logo />
          </button>
        </div>

        <Card>
          <CardContent className="p-8">

            <div className="text-center mb-6">
              <ArabesqueDivider />
              <h1 className="text-2xl font-bold mt-4">
                {t("register.title")}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <Input
                placeholder="username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
              />

              <Input
                placeholder="display name"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                required
              />

              <Input
                type="email"
                placeholder="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />

              <Input
                type="password"
                placeholder="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />

              <Select
                value={form.gender}
                onValueChange={(v) =>
                  setForm({ ...form, gender: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="country"
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value })
                }
              />

              <Textarea
                placeholder="bio"
                value={form.bio}
                onChange={(e) =>
                  setForm({ ...form, bio: e.target.value })
                }
                maxLength={200}
              />

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Account"}
              </Button>

            </form>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}