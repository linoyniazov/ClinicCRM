import DashboardCard from '../DashboardCard';

interface KPICardProps {
  title: string;
  value: number | string;
  icon?: string;
  color?: string;
}

export default function KPICard({ title, value, icon, color = '#6366f1' }: KPICardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('he-IL');
    }
    return val;
  };

  return (
    <DashboardCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#64748b' }}>
            {title}
          </h3>
          {icon && (
            <span style={{ fontSize: 20 }}>{icon}</span>
          )}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color }}>
          {formatValue(value)}
        </div>
      </div>
    </DashboardCard>
  );
}


