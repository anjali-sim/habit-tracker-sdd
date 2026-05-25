import { create } from "zustand";
import type {
  Habit,
  HabitOrder,
  CreateHabitInput,
  UpdateHabitInput,
} from "../types";
import * as habitService from "../api/habitService";
import * as completionService from "../api/completionService";
import * as orderService from "../api/orderService";

interface HabitState {
  habits: Habit[];
  order: HabitOrder;
  isLoading: boolean;
  error: string | null;
  loadHabits: () => void;
  addHabit: (input: CreateHabitInput) => void;
  updateHabit: (id: string, input: UpdateHabitInput) => void;
  removeHabit: (id: string) => void;
  reorderHabits: (newOrder: HabitOrder) => void;
  clearError: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  order: [],
  isLoading: false,
  error: null,

  loadHabits() {
    set({ isLoading: true, error: null });
    try {
      const habits = habitService.getAll();
      const persisted = orderService.getOrder();
      const habitIds = new Set(habits.map((h) => h.id));
      const validOrder = persisted.filter((id) => habitIds.has(id));
      const unordered = habits
        .filter((h) => !validOrder.includes(h.id))
        .map((h) => h.id);
      const order = [...validOrder, ...unordered];
      set({ habits, order, isLoading: false });
    } catch {
      set({ isLoading: false, error: "Failed to load habits" });
    }
  },

  addHabit(input) {
    try {
      const habit = habitService.create(input);
      orderService.append(habit.id);
      set((s) => ({
        habits: [...s.habits, habit],
        order: [...s.order, habit.id],
        error: null,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to add habit",
      });
    }
  },

  updateHabit(id, input) {
    try {
      const updated = habitService.update(id, input);
      set((s) => ({
        habits: s.habits.map((h) => (h.id === id ? updated : h)),
        error: null,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update habit",
      });
    }
  },

  removeHabit(id) {
    try {
      habitService.remove(id);
      completionService.deleteForHabit(id);
      orderService.remove(id);
      set((s) => ({
        habits: s.habits.filter((h) => h.id !== id),
        order: s.order.filter((oid) => oid !== id),
        error: null,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete habit",
      });
    }
  },

  reorderHabits(newOrder) {
    const previousOrder = get().order;
    set({ order: newOrder });
    try {
      orderService.setOrder(newOrder);
    } catch {
      set({ order: previousOrder, error: "Failed to save new order" });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
