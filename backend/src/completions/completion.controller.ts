import { Request, Response, NextFunction } from "express";
import * as completionService from "./completion.service";

// Helper: format a Mongoose Date field as 'YYYY-MM-DD'
const toDateStr = (d: unknown): string =>
  (d instanceof Date ? d : new Date(d as string)).toISOString().slice(0, 10);

export const getAllCompletions = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const completions = await completionService.getAllCompletions();
    const record: Record<string, string[]> = {};
    for (const c of completions) {
      const habitIdStr = c.habitId.toString();
      const dateStr = toDateStr(c.date);
      if (!record[habitIdStr]) record[habitIdStr] = [];
      for (let i = 0; i < c.count; i++) record[habitIdStr].push(dateStr);
    }
    res.json(record);
  } catch (err) {
    next(err);
  }
};

export const getCompletionsByHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const completions = await completionService.getCompletionsByHabit(
      String(req.params.habitId),
    );
    const dates = completions.flatMap((c) =>
      Array<string>(c.count).fill(toDateStr(c.date)),
    );
    res.json(dates);
  } catch (err) {
    next(err);
  }
};

export const checkToday = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await completionService.checkToday(
      String(req.params.habitId),
      req.query.date as string | undefined,
    );
    res.json({ completed: result.done });
  } catch (err) {
    next(err);
  }
};

export const markComplete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await completionService.markComplete(
      String(req.params.habitId),
      req.body.date as string | undefined,
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const markIncomplete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await completionService.markIncomplete(
      String(req.params.habitId),
      req.body.date as string | undefined,
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const addCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const completion = await completionService.addCount(
      String(req.params.habitId),
    );
    res.json(completion);
  } catch (err) {
    next(err);
  }
};

export const removeLastCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await completionService.removeLastCount(String(req.params.habitId));
    res.json({ message: "Last count removed" });
  } catch (err) {
    next(err);
  }
};

export const countByDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const date = req.query.date
      ? new Date(req.query.date as string)
      : new Date();
    const count = await completionService.countByDay(
      String(req.params.habitId),
      date,
    );
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

export const countByMonth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const now = new Date();
    const year = req.query.year ? Number(req.query.year) : now.getUTCFullYear();
    const month = req.query.month
      ? Number(req.query.month)
      : now.getUTCMonth() + 1;
    const count = await completionService.countByMonth(
      String(req.params.habitId),
      year,
      month,
    );
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

export const deleteAllCompletions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await completionService.deleteAllForHabit(String(req.params.habitId));
    res.json({ message: "All completions deleted" });
  } catch (err) {
    next(err);
  }
};
