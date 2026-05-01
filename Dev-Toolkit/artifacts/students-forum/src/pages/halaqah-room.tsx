import React, { useState, useRef } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function HalaqahRoomPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

  // بيانات تجريبية لتعريف المتغيرات المفقودة في الصورة
  const user = { id: "1", gender: "male" }; 
  const group = { name: "الحلقة العلمية", description: "وصف الحلقة" };
  const messages: any[] = [];
  const isLoading = false;
  const isPending = false;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending:", content);
    setContent("");
  };

  return (
    <AppLayout>
      <Card className={`mb-4 border-t-4 ${user.gender === "male" ? "border-blue-500" : "border-pink-500"}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              user.gender === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
            }`}>
              {user.gender === "male" ? t("common.brothers") : t("common.sisters")}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{group.name || t("halaqah.fallbackName")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
        </CardContent>
      </Card>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 p-4 border rounded-lg min-h-[400px]"
      >
        {isLoading && <Skeleton className="h-20 w-full" />}
        
        {messages?.map((m: any) => {
          const isMine = m.userId === user.id;
          return (
            <div key={m.id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
              <InitialsAvatar name={m.author?.displayName || "?"} size="sm" />
              <div className={`max-w-[75%] ${isMine ? "items-end" : ""}`}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span>{m.author?.displayName}</span>
                </div>
                <div className={`p-3 rounded-lg ${
                  isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t mt-4">
        <Input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("halaqah.messagePlaceholder")}
          maxLength={1000}
        />
        <Button type="submit" disabled={!content.trim() || isPending}>
          <Send className="h-4 w-4 mr-2" />
          <span>{t("common.send")}</span>
        </Button>
      </form>
    </AppLayout>
  );
}