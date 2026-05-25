const KEY = "hf_order";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(order: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    throw new Error("Failed to save habit order");
  }
}

export function getOrder(): string[] {
  return read();
}

export function setOrder(ids: string[]): void {
  write(ids);
}

export function append(habitId: string): void {
  const order = read();
  if (!order.includes(habitId)) {
    write([...order, habitId]);
  }
}

export function remove(habitId: string): void {
  write(read().filter((id) => id !== habitId));
}
