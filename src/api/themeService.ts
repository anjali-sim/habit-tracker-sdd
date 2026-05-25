const KEY = "hf_theme";

export function getTheme(): "dark" | "light" {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function setTheme(theme: "dark" | "light"): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // persist failure is non-fatal
  }
  try {
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {
    // DOM update failure is non-fatal
  }
}
