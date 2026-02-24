import type { Trip } from '@/types/trip';

interface HeroSectionProps {
  trip: Trip;
}

export function HeroSection({ trip }: HeroSectionProps) {
  return (
    <div className="relative min-h-[320px] flex items-center justify-center text-center overflow-hidden px-5 py-14">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-[#1e1b4b] via-60% to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(249,115,22,0.15)_0%,transparent_60%),radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.12)_0%,transparent_50%)]" />

      {/* 콘텐츠 */}
      <div className="relative z-10">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,3.4rem)] font-black bg-gradient-to-br from-white via-accent to-accent-light bg-clip-text text-transparent tracking-tight mb-2">
          {trip.title}
        </h1>
        <p className="text-base text-text-secondary font-light tracking-wider">
          {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')} ·{' '}
          {trip.travelers === 1 ? '혼자 여행' : `${trip.travelers}명`}
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap mt-4">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="bg-accent/10 border border-accent/25 text-accent-light px-3.5 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
