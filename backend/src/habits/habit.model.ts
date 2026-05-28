import { Schema, model } from "mongoose";

const habitSchema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Health",
        "Fitness",
        "Learning",
        "Mindfulness",
        "Work",
        "Personal",
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
    reminderTime: { type: String },
    hourlyTarget: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v; // eslint-disable-line @typescript-eslint/no-dynamic-delete
        return ret;
      },
    },
  },
);

export const Habit = model("Habit", habitSchema);
