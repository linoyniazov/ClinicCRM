import { useNavigate } from "react-router-dom";
import DashboardCard from "../DashboardCard";
import { CalendarIcon, SparklesIcon, DocumentIcon } from "../icons/Icons";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
}

const actions: QuickAction[] = [
  { label: "New Appointment", icon: <CalendarIcon size={18} color="#667eea" />, path: "/book", color: "#667eea" },
  { label: "New AI Scan", icon: <SparklesIcon size={18} color="#764ba2" />, path: "/ai-analysis", color: "#764ba2" },
  { label: "New Intake Form", icon: <DocumentIcon size={18} color="#ec4899" />, path: "/patients", color: "#ec4899" },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <DashboardCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Quick Actions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {actions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: "none",
                background: `${action.color}15`,
                color: "rgba(0,0,0,0.85)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${action.color}25`;
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${action.color}15`;
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {action.icon}
              </div>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

