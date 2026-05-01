import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase"; // تأكد أن ملف supabase.ts موجود بجانبه

// --- مפתيح الاستعلام (Query Keys) ---
export const getAdminListUsersQueryKey = () => ["admin", "users"];
export const getGetCurrentUserQueryKey = () => ["auth", "user"];
export const getListMeetingsQueryKey = (params?: any) => ["meetings", params];
export const getListBooksQueryKey = () => ["books"];

// --- Hooks المصادقة والإدارة ---
export function useAdminLogin() {
  return useMutation({
    mutationFn: async ({ data }: { data: { password: string } }) => {
      // هنا تضع منطق التحقق من كلمة السر الخاصة بالمسؤول
      if (data.password !== "كلمة_السر_الخاصة_بك") throw new Error("كلمة السر خاطئة");
      return { success: true };
    }
  });
}

export function useAdminListUsers(options?: any) {
  return useQuery({
    queryKey: getAdminListUsersQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    }
  });
}

export function useAdminSetAdmin() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { value: boolean } }) => {
      const { error } = await supabase.from("profiles").update({ isAdmin: data.value }).eq("id", id);
      if (error) throw error;
    }
  });
}

export function useAdminSetActive() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { value: boolean } }) => {
      const { error } = await supabase.from("profiles").update({ isActive: data.value }).eq("id", id);
      if (error) throw error;
    }
  });
}

// --- Hooks الاجتماعات/الدروس (Meetings) ---
export function useListMeetings(params: { kind: string }) {
  return useQuery({
    queryKey: getListMeetingsQueryKey(params),
    queryFn: async () => {
      const { data, error } = await supabase.from("meetings").select("*").eq("kind", params.kind);
      if (error) throw error;
      return data;
    }
  });
}

export function useAdminCreateMeeting() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const { error } = await supabase.from("meetings").insert(data);
      if (error) throw error;
    }
  });
}

export function useAdminUpdateMeeting() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { error } = await supabase.from("meetings").update(data).eq("id", id);
      if (error) throw error;
    }
  });
}

export function useAdminDeleteMeeting() {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    }
  });
}

// --- Hooks الكتب (Books) ---
export function useListBooks() {
  return useQuery({
    queryKey: getListBooksQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*");
      if (error) throw error;
      return data;
    }
  });
}

export function useAdminCreateBook() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const { error } = await supabase.from("books").insert(data);
      if (error) throw error;
    }
  });
}

export function useAdminUpdateBook() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { error } = await supabase.from("books").update(data).eq("id", id);
      if (error) throw error;
    }
  });
}

export function useAdminDeleteBook() {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    }
  });
}