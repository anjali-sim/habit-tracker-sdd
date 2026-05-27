import { Request, Response, NextFunction } from "express";
import * as preferencesService from "./preferences.service";

export const getTheme = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theme = await preferencesService.getTheme();
    res.json({ theme });
  } catch (err) {
    next(err);
  }
};

export const setTheme = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theme = await preferencesService.setTheme(req.body.theme);
    res.json({ theme });
  } catch (err) {
    next(err);
  }
};
