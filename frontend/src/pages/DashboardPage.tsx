import { useEffect, useState } from "react";
import { getDashboardStats, type DashboardStats } from "../services/api";
import KPICard from "../components/widgets/KPICard";
import NextClientCard from "../components/widgets/NextClientCard";
import QuickActions from "../components/widgets/QuickActions";
import AlertsSection from "../components/widgets/AlertsSection";
import { CalendarIcon, CalendarWeekIcon, CurrencyIcon } from "../components/icons/Icons";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
        <div style={{ textAlign: "center", padding: 48, color: "rgba(0,0,0,0.5)" }}>
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
        <div style={{ textAlign: "center", padding: 48, color: "rgba(220, 53, 69, 0.8)" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      {/* KPI Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <KPICard
          title="Appointments Today"
          value={stats.appointmentsToday}
          icon={<CalendarIcon color="#667eea" />}
          subtitle="Scheduled for today"
          accentColor="rgba(102, 126, 234, 0.1)"
        />
        <KPICard
          title="Upcoming (7 Days)"
          value={stats.upcomingAppointments}
          icon={<CalendarWeekIcon color="#764ba2" />}
          subtitle="Next week"
          accentColor="rgba(118, 75, 162, 0.1)"
        />
        <KPICard
          title="Est. Revenue"
          value={formatCurrency(stats.estimatedRevenue)}
          icon={<CurrencyIcon color="#10b981" />}
          subtitle="From upcoming appointments"
          accentColor="rgba(16, 185, 129, 0.1)"
        />
      </div>

      {/* Next Client & Quick Actions Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {stats.nextClient ? (
          <NextClientCard
            name={stats.nextClient.name}
            service={stats.nextClient.service}
            time={stats.nextClient.time}
            patientId={stats.nextClient.patientId}
          />
        ) : (
          <div
            style={{
              padding: 24,
              borderRadius: 20,
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.4)",
              textAlign: "center",
              color: "rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Next Client
            </h3>
            <p style={{ margin: 0 }}>No upcoming appointments</p>
          </div>
        )}
        <QuickActions />
      </div>

      {/* Alerts Section */}
      <AlertsSection alerts={[]} />
    </div>
  );
}
