import { Card, CardContent } from '@/components/ui/card';

interface InfoCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function InfoCard({ label, value, sub }: InfoCardProps) {
  return (
    <Card className="rounded-[16px] py-0 gap-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <CardContent className="p-5">
        <div className="text-[0.72rem] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
          {label}
        </div>
        <div className="text-base font-semibold text-text">{value}</div>
        {sub && <div className="text-sm text-text-secondary mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
