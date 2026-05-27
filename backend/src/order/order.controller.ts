import { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";

export const getOrder = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await orderService.getOrder();
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const setOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await orderService.setOrder(req.body.order);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const appendToOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await orderService.appendToOrder(String(req.params.habitId));
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const removeFromOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await orderService.removeFromOrder(
      String(req.params.habitId),
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
};
