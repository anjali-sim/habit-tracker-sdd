import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as habitController from "./habit.controller";

const router = Router();

const habitSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum([
    "health",
    "fitness",
    "learning",
    "productivity",
    "mindfulness",
    "other",
  ]),
  colorTag: z.enum(["red", "orange", "yellow", "green", "blue", "purple"]),
  frequency: z.enum(["daily", "weekly", "hourly", "monthly"]),
  reminder: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  hourlyTarget: z.number().positive().optional(),
});

const habitUpdateSchema = habitSchema.partial();

const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };

router.get("/", habitController.listHabits);
router.post("/", validate(habitSchema), habitController.createHabit);
router.get("/:id", habitController.getHabit);
router.put("/:id", validate(habitUpdateSchema), habitController.updateHabit);
router.delete("/:id", habitController.deleteHabit);

export default router;
