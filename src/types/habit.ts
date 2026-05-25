export type Category =
  | "Health"
  | "Fitness"
  | "Learning"
  | "Mindfulness"
  | "Work"
  | "Personal";
export type ColorTag =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";
export type Frequency = "daily" | "weekly" | "hourly" | "monthly";

export interface Habit {
  id: string;
  name: string;
  category: Category;
  colorTag: ColorTag;
  frequency: Frequency;
  createdAt: string;
  hourlyTarget?: number;
  reminderTime?: string;
}

export type CreateHabitInput = Omit<Habit, "id" | "createdAt">;
export type UpdateHabitInput = Partial<CreateHabitInput>;
