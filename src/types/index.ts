export type {
  Habit,
  Category,
  ColorTag,
  Frequency,
  CreateHabitInput,
  UpdateHabitInput,
} from "./habit";
export type { CompletionRecord } from "./completion";

export type HabitOrder = string[];

export interface StreakData {
  current: number;
  longest: number;
}

export type HeatmapCellState = "completed" | "missed" | "empty";

export interface HeatmapCell {
  date: string;
  state: HeatmapCellState;
}

export interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}

export type ModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; habitId: string }
  | { type: "confirm-delete"; habitId: string };
