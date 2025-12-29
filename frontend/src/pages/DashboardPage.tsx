  import DashboardCard from "../components/DashboardCard";
  import { dashboardMock } from "../mocks/dashboardMock";

  export default function DashboardPage() {
    const { nextClient } = dashboardMock;
    return (
      <div>
        <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <DashboardCard>
            <h3>Next Client</h3>
            <p>
              <strong>{nextClient.name}</strong>
            </p>
            <p>{nextClient.service}</p>
            <p>{nextClient.time}</p>
          </DashboardCard>
          <div />
        </div>
      </div>
    );
  }
