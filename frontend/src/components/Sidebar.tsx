import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "black",
  background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
  marginBottom: 6,
});

export default function Sidebar() {
  return (
    <aside style={{ width: 240, padding: 16, borderRight: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 800, marginBottom: 16 }}>Clinic Crm</div>

      <nav>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/schedule" style={linkStyle}>Schedule</NavLink>
        <NavLink to="/patients" style={linkStyle}>Patients</NavLink>
        <NavLink to="/ai-analysis" style={linkStyle}>✨ AI Analysis</NavLink>
        <NavLink to="/finance" style={linkStyle}>💳 Finance</NavLink>
        <NavLink to="/inventory" style={linkStyle}>Inventory</NavLink>
        <NavLink to="/book" style={linkStyle}>Book Appointment</NavLink>
      </nav>
    </aside>
  );
}
