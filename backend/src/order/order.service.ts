import { Types } from "mongoose";
import { Order } from "./order.model";

export const getOrder = async () => {
  const doc = await Order.findOne();
  return doc ? doc.habitIds : [];
};

export const setOrder = async (ids: string[]) => {
  const objectIds = ids.map((id) => new Types.ObjectId(id));
  const doc = await Order.findOneAndUpdate(
    {},
    { habitIds: objectIds },
    { upsert: true, new: true },
  );
  return doc.habitIds;
};

export const appendToOrder = async (habitId: string) => {
  const doc = await Order.findOneAndUpdate(
    {},
    { $push: { habitIds: new Types.ObjectId(habitId) } },
    { upsert: true, new: true },
  );
  return doc.habitIds;
};

export const removeFromOrder = async (habitId: string) => {
  const doc = await Order.findOneAndUpdate(
    {},
    { $pull: { habitIds: new Types.ObjectId(habitId) } },
    { new: true },
  );
  return doc ? doc.habitIds : [];
};
