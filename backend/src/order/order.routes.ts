import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as orderController from "./order.controller";

const router = Router();

const setOrderSchema = z.object({
  order: z.array(z.string()),
});

const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };

router.get("/", orderController.getOrder);
router.put("/", validate(setOrderSchema), orderController.setOrder);
router.post("/append/:habitId", orderController.appendToOrder);
router.delete("/:habitId", orderController.removeFromOrder);

export default router;
