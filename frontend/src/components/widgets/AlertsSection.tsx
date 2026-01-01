import DashboardCard from "../DashboardCard";
import { AlertTriangleIcon, AlertCircleIcon, InfoIcon } from "../icons/Icons";

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
}

interface AlertsSectionProps {
  alerts?: Alert[];
}

export default function AlertsSection({ alerts = [] }: AlertsSectionProps) {
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangleIcon size={18} color="#f59e0b" />;
      case "error":
        return <AlertCircleIcon size={18} color="#ef4444" />;
      case "info":
        return <InfoIcon size={18} color="#3b82f6" />;
      default:
        return <InfoIcon size={18} color="#3b82f6" />;
    }
  };

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "rgba(245, 158, 11, 0.15)";
      case "error":
        return "rgba(239, 68, 68, 0.15)";
      case "info":
        return "rgba(59, 130, 246, 0.15)";
      default:
        return "rgba(0,0,0,0.05)";
    }
  };

  const getAlertBorderColor = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      case "info":
        return "#3b82f6";
      default:
        return "rgba(0,0,0,0.2)";
    }
  };

  return (
    <DashboardCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Alerts</h3>
        {alerts.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "rgba(0,0,0,0.5)",
              fontSize: 14,
            }}
          >
            No alerts at this time. All systems operational.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: getAlertColor(alert.type),
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderLeft: `3px solid ${getAlertBorderColor(alert.type)}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {getAlertIcon(alert.type)}
                </div>
                <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)", fontWeight: 400 }}>
                  {alert.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

