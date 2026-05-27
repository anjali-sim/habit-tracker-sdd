import { Schema, model } from "mongoose";

const habitSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: [
        "health",
        "fitness",
        "learning",
        "productivity",
        "mindfulness",
        "other",
      ],
    },
    colorTag: {
      type: String,
      required: true,
      enum: ["red", "orange", "yellow", "green", "blue", "purple"],
    },
    frequency: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "hourly", "monthly"],
    },
    reminder: { type: String },
    hourlyTarget: { type: Number },
  },
  { timestamps: true },
);

export const Habit = model("Habit", habitSchema);
