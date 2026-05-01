import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase"; // تأكد أن ملف supabase.ts موجود في نفس المجلد

// مفتاح الاستعلام الموحد للقصص
export const getListStoriesQueryKey = () => ["stories"];

// 1. دالة جلب القصص (Stories)
export function useListStories(options: any = {}) {
  return useQuery({
    queryKey: getListStoriesQueryKey(),
    queryFn: async () => {
      // هنا تضع منطق جلب البيانات من قاعدة البيانات (مثل Supabase)
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          user:profiles(id, displayName)
        `)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      
      // منطق تجميع القصص حسب المستخدم (Grouping)
      const groups = data.reduce((acc: any[], story: any) => {
        const userGroup = acc.find(g => g.user.id === story.user.id);
        if (userGroup) {
          userGroup.stories.push(story);
        } else {
          acc.push({
            user: story.user,
            stories: [story]
          });
        }
        return acc;
      }, []);

      return groups;
    },
    ...options.query,
  });
}

// 2. دالة إنشاء قصة جديدة
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: { data: { content: string; imageUrl?: string | null; videoUrl?: string | null } }) => {
      const { error } = await supabase
        .from("stories")
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      // تحديث البيانات تلقائياً بعد الإضافة
      queryClient.invalidateQueries({ queryKey: getListStoriesQueryKey() });
    },
  });
}