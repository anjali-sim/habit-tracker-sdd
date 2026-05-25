import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import { getTheme, setTheme } from "./api/themeService";
import DashboardPage from "./pages/DashboardPage";
import HabitDetailPage from "./pages/HabitDetailPage";

function App() {
  const [theme, setReactTheme] = useState<"dark" | "light">(() => getTheme());

  function handleToggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setReactTheme(next);
  }

  return (
    <>
      <nav className="flex items-center justify-end px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <ThemeToggle theme={theme} onToggle={handleToggle} />
      </nav>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/habit/:id" element={<HabitDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
