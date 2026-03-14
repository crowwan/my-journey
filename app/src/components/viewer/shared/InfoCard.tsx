import { Card, CardContent } from '@/components/ui/card';

interface InfoCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function InfoCard({ label, value, sub }: InfoCardProps) {
  return (
    <Card className="rounded-lg py-0 gap-0 border-border-light shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4">
        <div className="text-[0.72rem] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
          {label}
        </div>
        <div className="text-base font-semibold text-text-primary">{value}</div>
        {sub && <div className="text-sm text-text-secondary mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
