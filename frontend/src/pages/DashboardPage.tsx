import { useState, useEffect } from "react";
import DashboardCard from "../components/DashboardCard";
import { dashboardMock } from "../mocks/dashboardMock";
import NextClientCard from "../components/widgets/NextClientCard";
import KPICard from "../components/widgets/KPICard";
import { getDashboardStats } from "../services";
import type { DashboardStats } from "../services";

export default function DashboardPage() {
  const { nextClient } = dashboardMock;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
        {loading ? (
          <>
            <KPICard title="Appointments Today" value="..." />
            <KPICard title="Upcoming Appointments" value="..." />
            <KPICard title="Estimated Revenue" value="..." />
          </>
        ) : error ? (
          <div style={{ gridColumn: "1 / -1", color: "#ef4444" }}>
            Error: {error}
          </div>
        ) : stats ? (
          <>
            <KPICard 
              title="Appointments Today" 
              value={stats.appointmentsToday} 
              icon="📅"
              color="#6366f1"
            />
            <KPICard 
              title="Upcoming Appointments" 
              value={stats.upcomingAppointments} 
              icon="⏰"
              color="#10b981"
            />
            <KPICard 
              title="Estimated Revenue" 
              value={`₪${stats.estimatedRevenue.toLocaleString('he-IL')}`} 
              icon="💰"
              color="#f59e0b"
            />
          </>
        ) : null}
      </div>

      {/* Next Client Card */}
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
