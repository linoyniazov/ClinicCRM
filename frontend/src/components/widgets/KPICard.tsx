import DashboardCard from "../DashboardCard";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  accentColor?: string;
}

const IconWrapper = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      background: color || "rgba(102, 126, 234, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

export default function KPICard({ title, value, icon, subtitle, accentColor }: KPICardProps) {
  return (
    <DashboardCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(0,0,0,0.65)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </h3>
          {icon && <IconWrapper color={accentColor}>{icon}</IconWrapper>}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "rgba(0,0,0,0.95)",
            lineHeight: 1.1,
            fontFeatureSettings: '"tnum"',
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 12,
              color: "rgba(0,0,0,0.55)",
              fontWeight: 400,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

