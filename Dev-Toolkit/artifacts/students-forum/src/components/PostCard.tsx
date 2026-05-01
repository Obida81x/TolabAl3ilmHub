// قم بإضافة هذه الاستيرادات في أعلى الملف إذا كانت ناقصة
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom"; // أو حسب المكتبة المستخدمة لديك
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils"; // تأكد من مكان وجود دالة الوقت

// تأكد من استيراد هذه الـ Hooks من ملفات الـ lib الخاصة بك
// مثال: import { useDeletePost, useToggleLike } from "@/lib/posts";

export function PostCard({ post, user, t, queryClient, adminDelete, toggle }: any) {
  
  const handleLike = () => {
    toggle.mutate({ postId: post.id });
  };

  const handleDelete = () => {
    if (!window.confirm(t("admin.confirmDeletePost"))) return;
    adminDelete.mutate(
      { id: post.id },
      {
        onSettled: () => {
          // تحديث البيانات بعد الحذف
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        },
      }
    );
  };

  return (
    <Card data-testid={`card-post-${post.id}`} className="border-card-border overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Link to={`/profile/${post.author.id}`}>
            <InitialsAvatar name={post.author.displayName} size="md" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link 
              to={`/profile/${post.author.id}`} 
              data-testid={`link-post-author-${post.id}`}
              className="font-medium text-foreground hover:text-primary transition-colors block"
            >
              {post.author.displayName}
            </Link>
            <div className="text-xs text-muted-foreground">
              @{post.author.username} • {timeAgo(post.createdAt, t)}
            </div>
          </div>
          
          {user?.isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={adminDelete.isPending}
              data-testid={`button-admin-delete-post-${post.id}`}
              className="text-muted-foreground hover:text-destructive"
              title={t("admin.deletePost")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p 
          className="text-foreground whitespace-pre-wrap leading-relaxed"
          data-testid={`text-post-content-${post.id}`}
          style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.05rem" }}
        >
          {post.content}
        </p>

        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt=""
            className="mt-4 rounded-md border border-card-border max-h-[480px] w-auto object-contain bg-muted"
            data-testid={`img-post-${post.id}`}
          />
        )}

        {post.videoUrl && (
          <video 
            src={post.videoUrl} 
            controls
            playsInline
            className="mt-4 rounded-md border border-card-border max-h-[480px] w-full bg-black"
            data-testid={`video-post-${post.id}`}
          />
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={toggle.isPending}
            data-testid={`button-like-${post.id}`}
            className={cn(
              "gap-2",
              post.likedByMe && "text-primary"
            )}
          >
            <Heart 
              className={cn("h-4 w-4", post.likedByMe && "fill-primary")} 
            />
            <span data-testid={`text-likes-${post.id}`}>{post.likeCount}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}