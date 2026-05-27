import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema({
  habitIds: [{ type: Types.ObjectId, ref: "Habit" }],
});

export const Order = model("Order", orderSchema);
