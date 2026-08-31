import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.analytics(),
    staleTime: 30_000,
  });
}

export function useViolations() {
  return useQuery({
    queryKey: ["violations"],
    queryFn: () => api.violations(),
    staleTime: 30_000,
  });
}

export function usePolicyVersions() {
  return useQuery({
    queryKey: ["policyVersions"],
    queryFn: () => api.policyVersions(),
    staleTime: 60_000,
  });
}

export function useAiAnalyze() {
  return useMutation({
    mutationFn: (text: string) => api.aiAnalyze(text),
  });
}

export function useAiAuthor() {
  return useMutation({
    mutationFn: (text: string) => api.aiAuthor(text),
  });
}

