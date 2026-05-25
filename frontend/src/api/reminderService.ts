export function getPermissionStatus(): NotificationPermission {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export function canNotify(): boolean {
  return getPermissionStatus() === "granted";
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export function sendNotification(habitName: string): void {
  if (!canNotify()) return;
  new Notification(habitName, {
    body: "Time to complete your habit!",
    tag: habitName,
  });
}
