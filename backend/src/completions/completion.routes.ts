import { Router } from "express";
import * as completionController from "./completion.controller";

const router = Router();

router.get("/", completionController.getAllCompletions);
router.get("/:habitId/check", completionController.checkToday);
router.get("/:habitId/count-day", completionController.countByDay);
router.get("/:habitId/count-month", completionController.countByMonth);
router.get("/:habitId", completionController.getCompletionsByHabit);
router.post("/:habitId/mark-complete", completionController.markComplete);
router.post("/:habitId/mark-incomplete", completionController.markIncomplete);
router.post("/:habitId/add", completionController.addCount);
router.post("/:habitId/remove-last", completionController.removeLastCount);
router.delete("/:habitId", completionController.deleteAllCompletions);

export default router;
