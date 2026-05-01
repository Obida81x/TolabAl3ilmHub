import React, { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Award } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArabesqueDivider } from "@/components/Pattern";
import { useTranslation } from "@/lib/i18n";

export default function TestDetailPage() {
  useRequireAuth();
  const { t, lang } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = params.id ? parseInt(params.id) : 0;
  const queryClient = useQueryClient();

  // تعريف بيانات افتراضية لتجنب أخطاء TypeScript حتى يتم تفعيل جلب البيانات
  const test: any = null; 
  const isLoading = false;
  const submit_mutate = (data: any, options: any) => {}; 
  const submit = { isPending: false };

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = test?.questions?.length || 0;
  const progress = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;

  const handleSubmit = () => {
    if (!test) return;
    const orderedAnswers = test.questions.map((_: any, idx: number) => answers[idx] ?? -1);
    
    // محاكاة الإرسال
    console.log("Submitting answers:", orderedAnswers);
  };

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <Link href="/tests">
          <Button variant="ghost" size="sm" className="gap-1 mb-6">
            <BackIcon className="h-4 w-4" />
            {t("tests.allTests")}
          </Button>
        </Link>

        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : !test && !result ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">{t("tests.testNotFound")}</h2>
            <Link href="/tests">
              <Button>{t("tests.backToTests")}</Button>
            </Link>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <Card className="border-card-border bg-primary/5">
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto text-secondary mb-3" />
                <h2 className="text-2xl font-bold mb-2">{t("tests.yourResult")}</h2>
                <div className="text-4xl font-bold text-primary mb-1">
                  {result.score} / {result.totalQuestions}
                </div>
                <div className="text-lg text-muted-foreground">
                  {result.percentage}%
                </div>
                <ArabesqueDivider className="mt-6" />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {result.results.map((r: any, idx: number) => (
                <Card key={idx} className={`border-2 ${r.isCorrect ? 'border-primary/20' : 'border-destructive/20'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {r.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-1" />
                      )}
                      <div>
                        <p className="font-medium mb-2">{r.prompt}</p>
                        {r.explanation && (
                          <div className="text-sm bg-muted p-3 rounded-md mt-2">
                            <span className="font-bold">{t("common.explanation")}: </span>
                            {r.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => setResult(null)}>
                {t("tests.retake")}
              </Button>
              <Link href="/tests" className="flex-1">
                <Button className="w-full">{t("tests.backToTests")}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{t(`tests.level.${test.level}`)}</Badge>
              <h1 className="text-3xl font-bold mb-2">{test.title}</h1>
              <p className="text-muted-foreground">{test.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("tests.answered", { answered: totalAnswered, total: totalQuestions })}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="space-y-4">
              {test.questions.map((q: any, qIdx: number) => (
                <Card key={qIdx} className="border-card-border">
                  <CardContent className="p-6">
                    <p className="font-bold mb-4">{qIdx + 1}. {q.prompt}</p>
                    <div className="space-y-2">
                      {q.options.map((opt: string, oIdx: number) => (
                        <Button
                          key={oIdx}
                          variant={answers[qIdx] === oIdx ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto py-3 px-4"
                          onClick={() => setAnswers({ ...answers, [qIdx]: oIdx })}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full mt-8"
              onClick={handleSubmit}
              disabled={totalAnswered < totalQuestions || submit.isPending}
            >
              {submit.isPending ? t("tests.grading") : t("tests.submit")}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}