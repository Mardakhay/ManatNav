import { Activity, CircleDollarSign, Moon, Sun } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface HeaderProps {
  lastUpdated: string | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Header({ lastUpdated, theme, onToggleTheme }: HeaderProps) {
  const { language, t, toggleLanguage } = useLanguage();
  const nextLanguage = language === "en" ? t("azerbaijani") : t("english");
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <CircleDollarSign size={24} strokeWidth={2.2} />
        </div>
        <div>
          <div className="brand-name">ManatNav</div>
          <div className="brand-subtitle">{t("brandSubtitle")}</div>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="status-pill" role="status">
          <Activity size={15} aria-hidden="true" />
          <span>
            {t("updated", { value: lastUpdated ? new Date(lastUpdated).toLocaleDateString(language === "az" ? "az-AZ" : "en-GB") : "—" })}
          </span>
        </div>
        <button
          className="language-button"
          onClick={toggleLanguage}
          aria-label={t("switchLanguage", { value: nextLanguage })}
          title={t("switchLanguage", { value: nextLanguage })}
        >
          {language === "en" ? "AZ" : "EN"}
        </button>
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
