import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { BookOpen, Download } from "lucide-react";

export default function LibraryPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();

  // تعريف البيانات بشكل مؤقت لمنع أخطاء TypeScript
  const books: any[] = []; 
  const isLoading = false;

  const categories = useMemo(() => {
    if (!books) return [];
    return Array.from(new Set(books.map((b) => b.category)));
  }, [books]);

  const filtered = useMemo(() => {
    if (!books) return [];
    if (filter === "all") return books;
    return books.filter((b) => b.category === filter);
  }, [books, filter]);

  return (
    <AppLayout>
      <PageHeader
        title={t("library.title")}
        arabicLabel={t("ar.library")}
        subtitle={t("library.subtitle")}
      />
      
      <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            {t("common.all")}
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={filter === c ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b: any) => (
            <Card key={b.id} className="border-card-border h-full overflow-hidden flex flex-col">
              <div className="aspect-[3/2] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                <BookOpen className="h-12 w-12 text-primary/40" />
                <div className="absolute bottom-3 left-3 right-3 text-primary font-bold">
                  {b.author}
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-foreground mb-1 text-lg">
                  {b.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Badge variant="secondary">{b.category}</Badge>
                  <span>{b.language}</span>
                  {b.pages && <span>{b.pages} {t("common.pp")}</span>}
                </div>
                {b.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {b.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <button onClick={() => navigate(`/library/${b.id}`)}>
                      {t("common.details")}
                    </button>
                  </Button>
                  {b.fileUrl && (
                    <Button asChild size="sm" className="gap-1">
                      <a href={b.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <Card className="border-card-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              {t("library.empty")}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}