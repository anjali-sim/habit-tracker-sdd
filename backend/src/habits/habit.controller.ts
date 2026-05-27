import { Request, Response, NextFunction } from "express";
import * as habitService from "./habit.service";

export const listHabits = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const habits = await habitService.getAllHabits();
    res.json(habits);
  } catch (err) {
    next(err);
  }
};

export const getHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const habit = await habitService.getHabitById(String(req.params.id));
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  } catch (err) {
    next(err);
  }
};

export const createHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const habit = await habitService.createHabit(req.body);
    res.status(201).json(habit);
  } catch (err) {
    next(err);
  }
};

export const updateHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const habit = await habitService.updateHabit(
      String(req.params.id),
      req.body as Record<string, unknown>,
    );
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  } catch (err) {
    next(err);
  }
};

export const deleteHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const habit = await habitService.deleteHabit(String(req.params.id));
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json({ message: "Habit deleted" });
  } catch (err) {
    next(err);
  }
};
