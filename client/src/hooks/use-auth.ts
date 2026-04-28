import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { type User } from "@shared/schema";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["/api/auth/users"],
  });
}

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["/api/auth/me"],
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (payload: { username: string; password: string; name: string; role: string }) => {
      const res = await apiRequest("POST", "/api/auth/signup", payload);
      return res.json();
    },
    // Removed auto-login on success — the page component handles
    // redirect to login form + shows success toast
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}
