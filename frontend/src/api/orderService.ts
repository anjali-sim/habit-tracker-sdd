import { api } from "./apiClient";

export async function getOrder(): Promise<string[]> {
  const { order } = await api.get<{ order: string[] }>("/api/order");
  return order;
}

export async function setOrder(ids: string[]): Promise<void> {
  await api.put("/api/order", { order: ids });
}

export function append(habitId: string): Promise<void> {
  return api.post(`/api/order/append/${habitId}`);
}

export function remove(habitId: string): Promise<void> {
  return api.delete(`/api/order/${habitId}`);
}
