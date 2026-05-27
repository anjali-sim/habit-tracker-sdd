import { Types } from "mongoose";
import { Completion } from "./completion.model";
import { Habit } from "../habits/habit.model";

export const toUTCMidnight = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const todayUTC = () => toUTCMidnight(new Date());

export const getAllCompletions = () => Completion.find();

export const getCompletionsByHabit = (habitId: string) =>
  Completion.find({ habitId: new Types.ObjectId(habitId) });

export const checkToday = async (habitId: string) => {
  const habit = await Habit.findById(habitId);
  if (!habit) return { done: false };

  const today = todayUTC();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const completions = await Completion.find({
    habitId: new Types.ObjectId(habitId),
    date: { $gte: today, $lt: tomorrow },
  });

  const total = completions.reduce((sum, c) => sum + c.count, 0);

  if (habit.frequency === "hourly" && habit.hourlyTarget) {
    return { done: total >= habit.hourlyTarget };
  }
  return { done: total >= 1 };
};

export const markComplete = async (habitId: string) => {
  const today = todayUTC();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const existing = await Completion.findOne({
    habitId: new Types.ObjectId(habitId),
    date: { $gte: today, $lt: tomorrow },
  });

  if (existing) return existing;
  return Completion.create({
    habitId: new Types.ObjectId(habitId),
    date: today,
    count: 1,
  });
};

export const markIncomplete = async (habitId: string) => {
  const today = todayUTC();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  await Completion.deleteMany({
    habitId: new Types.ObjectId(habitId),
    date: { $gte: today, $lt: tomorrow },
  });
};

export const addCount = (habitId: string) => {
  const today = todayUTC();
  return Completion.create({
    habitId: new Types.ObjectId(habitId),
    date: today,
    count: 1,
  });
};

export const removeLastCount = async (habitId: string) => {
  const today = todayUTC();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const last = await Completion.findOne({
    habitId: new Types.ObjectId(habitId),
    date: { $gte: today, $lt: tomorrow },
  }).sort({ createdAt: -1 });

  if (last) await last.deleteOne();
};

export const countByDay = async (habitId: string, date: Date) => {
  const start = toUTCMidnight(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const completions = await Completion.find({
    habitId: new Types.ObjectId(habitId),
    date: { $gte: start, $lt: end },
  });
  return completions.reduce((sum, c) => sum + c.count, 0);
};

export const countByMonth = async (
  habitId: string,
  year: number,
  month: number,
) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const completions = await Completion.find({
    habitId: new Types.ObjectId(habitId),
    date: { $gte: start, $lt: end },
  });
  return completions.reduce((sum, c) => sum + c.count, 0);
};

export const deleteAllForHabit = (habitId: string) =>
  Completion.deleteMany({ habitId: new Types.ObjectId(habitId) });
