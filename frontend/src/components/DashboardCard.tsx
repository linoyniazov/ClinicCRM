import type { ReactNode } from "react";

export default function DashboardCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 20,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.4)",
      }}
    >
      {children}
    </div>
  );
}
