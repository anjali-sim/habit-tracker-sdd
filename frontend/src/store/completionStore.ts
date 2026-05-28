import { create } from "zustand";
import type { CompletionRecord } from "../types";
import * as completionService from "../api/completionService";

interface CompletionState {
  completions: CompletionRecord;
  isLoading: boolean;
  error: string | null;
  loadCompletions: () => Promise<void>;
  toggleComplete: (habitId: string, date: string) => void;
  clearError: () => void;
}

export const useCompletionStore = create<CompletionState>((set, get) => ({
  completions: {},
  isLoading: false,
  error: null,

  async loadCompletions() {
    set({ isLoading: true, error: null });
    try {
      const completions = await completionService.getAll();
      set({ completions, isLoading: false });
    } catch {
      set({ isLoading: false, error: "Failed to load completions" });
    }
  },

  toggleComplete(habitId, date) {
    const prev = get().completions;
    const dates = prev[habitId] ?? [];
    const isNowComplete = !dates.includes(date);
    const nextDates = isNowComplete
      ? [...dates, date].sort()
      : dates.filter((d) => d !== date);
    // Optimistic update — revert on API failure
    set({ completions: { ...prev, [habitId]: nextDates } });
    const apiCall = isNowComplete
      ? completionService.markComplete(habitId, date)
      : completionService.markIncomplete(habitId, date);
    apiCall.catch(() => {
      set({ completions: prev, error: "Failed to save completion" });
    });
  },

  clearError() {
    set({ error: null });
  },
}));
