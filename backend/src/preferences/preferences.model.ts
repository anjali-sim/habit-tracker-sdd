import { Schema, model } from "mongoose";

const preferencesSchema = new Schema({
  theme: { type: String, enum: ["dark", "light"], default: "light" },
});

export const Preferences = model("Preferences", preferencesSchema);
