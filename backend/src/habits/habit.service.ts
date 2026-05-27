import { Habit } from "./habit.model";

export const getAllHabits = () => Habit.find();

export const getHabitById = (id: string) => Habit.findById(id);

export const createHabit = (data: Record<string, unknown>) =>
  Habit.create(data);

export const updateHabit = (id: string, data: Record<string, unknown>) =>
  Habit.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteHabit = (id: string) => Habit.findByIdAndDelete(id);
