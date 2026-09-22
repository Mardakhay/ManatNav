import { Activity, CircleDollarSign, Moon, Sun } from "lucide-react";

interface HeaderProps {
  lastUpdated: string | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Header({ lastUpdated, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <CircleDollarSign size={24} strokeWidth={2.2} />
        </div>
        <div>
          <div className="brand-name">ManatNav</div>
          <div className="brand-subtitle">AZN Smart Dashboard</div>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="status-pill" role="status">
          <Activity size={15} aria-hidden="true" />
          <span>
            Updated {lastUpdated ? new Date(lastUpdated).toLocaleDateString("en-GB") : "—"}
          </span>
        </div>
        <button
          className="theme-button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
