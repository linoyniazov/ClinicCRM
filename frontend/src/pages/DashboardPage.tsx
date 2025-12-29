import DashboardCard from "../components/DashboardCard";
import { dashboardMock } from "../mocks/dashboardMock";
import NextClientCard from "../components/widgets/NextClientCard";

export default function DashboardPage() {
  const { nextClient } = dashboardMock;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <DashboardCard>
          <NextClientCard
            name={nextClient.name}
            service={nextClient.service}
            time={nextClient.time}
          />
        </DashboardCard>
        <div />
      </div>
    </div>
  );
}
