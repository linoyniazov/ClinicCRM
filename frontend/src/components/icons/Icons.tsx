export const CalendarIcon = ({ size = 20, color = "#667eea" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M3 10h18" stroke={color} strokeWidth="2"/>
    <path d="M8 2v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 2v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CalendarWeekIcon = ({ size = 20, color = "#764ba2" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M3 10h18" stroke={color} strokeWidth="2"/>
    <path d="M8 2v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 2v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 14h8" stroke={color} strokeWidth="1.5"/>
    <path d="M8 18h5" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const CurrencyIcon = ({ size = 20, color = "#10b981" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 6v12M9 9h6M9 15h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const PlusIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const SparklesIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M19 19L20 21L22 20L21 18L19 19Z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M2 2L3 4L5 3L4 1L2 2Z" stroke={color} strokeWidth="1.5" fill="none"/>
  </svg>
);

export const DocumentIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 13h4M10 17h4" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const AlertTriangleIcon = ({ size = 18, color = "#f59e0b" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const AlertCircleIcon = ({ size = 18, color = "#ef4444" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const InfoIcon = ({ size = 18, color = "#3b82f6" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

