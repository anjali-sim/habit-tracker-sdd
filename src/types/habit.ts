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
export type Frequency = "daily" | "weekly";

export interface Habit {
  id: string;
  name: string;
  category: Category;
  colorTag: ColorTag;
  frequency: Frequency;
  createdAt: string;
}

export type CreateHabitInput = Omit<Habit, "id" | "createdAt">;
export type UpdateHabitInput = Partial<CreateHabitInput>;
