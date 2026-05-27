import { Schema, model, Types } from "mongoose";

const completionSchema = new Schema(
  {
    habitId: { type: Types.ObjectId, ref: "Habit", required: true },
    date: { type: Date, required: true },
    count: { type: Number, default: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Completion = model("Completion", completionSchema);
