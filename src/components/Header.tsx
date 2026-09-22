import { Activity, CircleDollarSign } from "lucide-react";

interface HeaderProps {
  lastUpdated: string | null;
}

export function Header({ lastUpdated }: HeaderProps) {
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

      <div className="status-pill">
        <Activity size={15} />
        <span>
          Updated {lastUpdated ? new Date(lastUpdated).toLocaleDateString("en-GB") : "—"}
        </span>
      </div>
    </header>
  );
}
