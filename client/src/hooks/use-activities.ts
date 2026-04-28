import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertActivity, type Activity } from "@shared/schema";
import { useToast } from "./use-toast";
import { apiRequest } from "../lib/queryClient";

export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertActivity) => {
      const res = await apiRequest("POST", "/api/activities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: "Activity created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create activity", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertActivity> }) => {
      const res = await apiRequest("PATCH", `/api/activities/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: "Activity updated successfully" });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      toast({ title: "Activity deleted successfully" });
    },
  });
}
