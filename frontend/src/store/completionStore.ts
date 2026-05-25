import { create } from "zustand";
import type { CompletionRecord } from "../types";
import * as completionService from "../api/completionService";

interface CompletionState {
  completions: CompletionRecord;
  isLoading: boolean;
  error: string | null;
  loadCompletions: () => void;
  toggleComplete: (habitId: string, date: string) => void;
  clearError: () => void;
}

export const useCompletionStore = create<CompletionState>((set, get) => ({
  completions: {},
  isLoading: false,
  error: null,

  loadCompletions() {
    set({ isLoading: true, error: null });
    try {
      const completions = completionService.getAll();
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
    set({ completions: { ...prev, [habitId]: nextDates } });
    try {
      if (isNowComplete) {
        completionService.markComplete(habitId, date);
      } else {
        completionService.markIncomplete(habitId, date);
      }
    } catch {
      set({ completions: prev, error: "Failed to save completion" });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
