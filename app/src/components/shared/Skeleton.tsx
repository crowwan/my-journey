import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

// 기본 스켈레톤 빌딩 블록 — animate-pulse 회색 박스
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-bg-tertiary animate-pulse rounded-md', className)} />
  );
}

// 홈 페이지용 TripCard 스켈레톤
export function TripCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="rounded-xl bg-surface border border-border-light p-4 animate-stagger-reveal"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3">
        {/* 아이콘 자리 */}
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        {/* 텍스트 자리 */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-2.5 w-1/4" />
        </div>
        {/* 뱃지 자리 */}
        <Skeleton className="h-5 w-12 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

// 상세 페이지용 HeroSection 스켈레톤
function HeroSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto px-5 pt-4 pb-4">
      {/* 뒤로가기 */}
      <Skeleton className="h-4 w-10 mb-3" />
      {/* 제목 + 뱃지 */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      {/* 날짜 + 인원 */}
      <Skeleton className="h-4 w-56 mt-2" />
      {/* 진행률 바 */}
      <Skeleton className="h-1 w-full mt-3 rounded-full" />
    </div>
  );
}

// 상세 페이지용 TabBar 스켈레톤
function TabBarSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto px-5 border-b border-border-light">
      <div className="flex gap-6 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-12" />
        ))}
      </div>
    </div>
  );
}

// 상세 페이지용 콘텐츠 영역 스켈레톤
function ContentSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto px-5 pt-6 space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}

// 상세 페이지 전체 스켈레톤 (Hero + TabBar + Content)
export function TripDetailSkeleton() {
  return (
    <div>
      <HeroSkeleton />
      <TabBarSkeleton />
      <ContentSkeleton />
    </div>
  );
}
