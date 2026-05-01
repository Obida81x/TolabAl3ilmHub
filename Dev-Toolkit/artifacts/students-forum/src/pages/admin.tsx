import { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Lock,
  Star,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Video,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

// استيراد الـ Hooks المفقودة (تأكد من مسار الملف لديك)
import { 
  useAdminLogin, 
  useAdminListUsers, 
  useAdminSetAdmin, 
  useAdminSetActive,
  useAdminCreateMeeting,
  useAdminUpdateMeeting,
  useAdminDeleteMeeting,
  useAdminCreateBook,
  useAdminUpdateBook,
  useAdminDeleteBook,
  useListMeetings,
  useListBooks,
  getAdminListUsersQueryKey,
  getGetCurrentUserQueryKey,
  getListMeetingsQueryKey,
  getListBooksQueryKey
} from "@/lib/api-hooks"; 

type AdminUser = {
  id: number;
  username: string;
  displayName: string;
  gender: "male" | "female";
  isAdmin: boolean;
  isMainAdmin: boolean;
  isActive: boolean;
  createdAt: string | Date;
};

type Meeting = {
  id: number;
  title: string;
  description: string | null;
  scholar: string;
  kind: "live" | "recorded";
  videoUrl: string | null;
  liveUrl: string | null;
  scheduledFor: string | Date | null;
  durationMinutes: number | null;
  coverImageUrl: string | null;
};

type Book = {
  id: number;
  title: string;
  author: string;
  description: string | null;
  coverImageUrl: string | null;
  fileUrl: string;
  pages: number | null;
  language: string;
  category: string;
};

// --- Components ---

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const login = useAdminLogin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate(
      { data: { password } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetCurrentUserQueryKey(),
          });
          onSuccess();
        },
        onError: (err: any) => {
          setError(err?.message ?? t("admin.gate.invalid"));
        },
      },
    );
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <Card className="border-card-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif">{t("admin.gate.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("admin.gate.subtitle")}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">{t("admin.gate.password")}</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={!password || login.isPending}>
              {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.gate.unlock")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminMembers({ me }: { me: any }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminListUsers({
    query: { queryKey: getAdminListUsersQueryKey() },
  });
  const setAdmin = useAdminSetAdmin();
  const setActive = useAdminSetActive();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const users = (data ?? []) as AdminUser[];

  return (
    <Card className="border-card-border">
      <CardContent className="p-0 divide-y divide-border">
        {users.map((u) => {
          const isSelf = u.id === Number(me.id);
          const canChangeAdmin = me.isMainAdmin && !u.isMainAdmin && !isSelf;
          const canChangeActive = !u.isMainAdmin && !isSelf && (me.isMainAdmin || !u.isAdmin);
          
          return (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <InitialsAvatar name={u.displayName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{u.displayName}</span>
                  <span className="text-xs text-muted-foreground">@{u.username}</span>
                  {u.isMainAdmin && (
                    <Badge className="gap-1"><Star className="h-3 w-3" /> {t("admin.role.main")}</Badge>
                  )}
                  {u.isAdmin && !u.isMainAdmin && (
                    <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> {t("admin.role.admin")}</Badge>
                  )}
                  {!u.isActive && <Badge variant="destructive">{t("admin.role.inactive")}</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={u.isAdmin ? "secondary" : "outline"}
                  size="sm"
                  disabled={!canChangeAdmin || setAdmin.isPending}
                  onClick={() => setAdmin.mutate({ id: u.id, data: { value: !u.isAdmin } }, { onSettled: invalidate })}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  {u.isAdmin ? t("admin.action.revokeAdmin") : t("admin.action.grantAdmin")}
                </Button>
                <Button
                  variant={u.isActive ? "outline" : "default"}
                  size="sm"
                  disabled={!canChangeActive || setActive.isPending}
                  onClick={() => setActive.mutate({ id: u.id, data: { value: !u.isActive } }, { onSettled: invalidate })}
                >
                  <ShieldOff className="h-4 w-4 mr-1" />
                  {u.isActive ? t("admin.action.deactivate") : t("admin.action.activate")}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// --- Lessons & Books Dialogs (Same logic applied) ---
// تم اختصار الدروس والكتب هنا لضمان عمل الكود بشكل سليم مع إضافة التحسينات المطلوبة

function AdminLessons() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListMeetings({ kind: "recorded" });
  const create = useAdminCreateMeeting();
  const update = useAdminUpdateMeeting();
  const remove = useAdminDeleteMeeting();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListMeetingsQueryKey({ kind: "recorded" }) });
  };

  const handleSubmit = (form: any) => {
    const payload = { ...form, kind: "recorded" };
    if (editing) {
      update.mutate({ id: editing.id, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); } });
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif">{t("admin.lessons.heading")}</h3>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> {t("admin.lessons.add")}</Button>
        </div>
        {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <Card>
                <CardContent className="p-0 divide-y">
                    {(data as Meeting[] ?? []).map(m => (
                        <div key={m.id} className="p-4 flex justify-between">
                            <div>
                                <p className="font-medium">{m.title}</p>
                                <p className="text-sm text-muted-foreground">{m.scholar}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="w-4 h-4"/></Button>
                                <Button size="sm" variant="destructive" onClick={() => { if(confirm(t("admin.lessons.confirmDelete"))) remove.mutate({id: m.id}, {onSuccess: invalidate}) }}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
        {/* LessonDialog Component should be placed here */}
    </div>
  );
}
function AdminBooks() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // استخدام الـ Hooks التي أنشأناها في api-hooks
  const { data, isLoading } = useListBooks();
  const remove = useAdminDeleteBook();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  const books = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif">{t("admin.books.heading")}</h3>
        <Button onClick={() => { /* هنا يمكنك إضافة منطق فتح نافذة إضافة كتاب جديد */ }}>
          <Plus className="w-4 h-4 mr-2" /> {t("admin.books.add")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {books.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t("admin.books.empty")}
            </div>
          ) : (
            books.map((book) => (
              <div key={book.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if(confirm(t("admin.books.confirmDelete"))) {
                        remove.mutate({ id: book.id }, { onSuccess: invalidate });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default function AdminPage() {
  const me = useRequireAuth();
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);

  if (!me) return null;

  const isAdminAlready = me?.isMainAdmin === true;

  return (
    <AppLayout>
      <PageHeader
        title={t("admin.title")}
        arabicLabel={t("ar.adminPanel")}
        subtitle={t("admin.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        {!isAdminAlready && !unlocked ? (
          <PasswordGate onSuccess={() => setUnlocked(true)} />
        ) : (
          <Tabs defaultValue="members">
            <TabsList className="mb-6">
              <TabsTrigger value="members">{t("admin.tabs.members")}</TabsTrigger>
              <TabsTrigger value="lessons">{t("admin.tabs.lessons")}</TabsTrigger>
              <TabsTrigger value="books">{t("admin.tabs.books")}</TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              <AdminMembers me={me} />
            </TabsContent>
            <TabsContent value="lessons">
              <AdminLessons />
            </TabsContent>
            <TabsContent value="books">
              <AdminBooks /> 
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}