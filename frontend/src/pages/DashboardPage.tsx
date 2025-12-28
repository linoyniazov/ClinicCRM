export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        <div>LEFT COLUMN</div>
        <div>RIGHT COLUMN</div>
      </div>
    </div>
  );
}
