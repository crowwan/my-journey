interface InfoCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function InfoCard({ label, value, sub }: InfoCardProps) {
  return (
    <div className="bg-card border border-border rounded-[14px] p-[18px] transition-all duration-300 hover:border-border hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="text-[0.72rem] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
        {label}
      </div>
      <div className="text-base font-semibold text-text">{value}</div>
      {sub && <div className="text-sm text-text-secondary mt-1">{sub}</div>}
    </div>
  );
}
