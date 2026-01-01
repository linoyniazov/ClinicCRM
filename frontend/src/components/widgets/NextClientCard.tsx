import DashboardCard from "../DashboardCard";

type NextClientCardProps = {
  name: string;
  service: string;
  time: string;
  patientId?: number;
};

export default function NextClientCard({ name, service, time, patientId }: NextClientCardProps) {
  return (
    <DashboardCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Next Client</h3>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {name}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(0,0,0,0.6)", marginBottom: 4 }}>
              {service}
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.8)" }}>
              {time}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
