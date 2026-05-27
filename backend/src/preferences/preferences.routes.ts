import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as preferencesController from "./preferences.controller";

const router = Router();

const themeSchema = z.object({
  theme: z.enum(["dark", "light"]),
});

const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };

router.get("/theme", preferencesController.getTheme);
router.put("/theme", validate(themeSchema), preferencesController.setTheme);

export default router;
