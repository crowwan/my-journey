'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, CalendarDays, LogOut } from 'lucide-react';
import { useAuth, useSignInWithKakao, useSignOut } from '@/hooks/useAuth';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showCalendar?: boolean;
}

export function Header({ title = 'My Journey', showBack = false, showCalendar = false }: HeaderProps) {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
  const signInWithKakao = useSignInWithKakao();
  const signOut = useSignOut();

  // 프로필 아바타 또는 이름 첫글자 표시
  function renderUserAvatar() {
    if (!user) return null;

    const displayName = user.user_metadata?.full_name
      ?? user.user_metadata?.name
      ?? '여행자';
    const avatarUrl = user.user_metadata?.avatar_url;
    const initial = displayName.charAt(0);

    return (
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="size-8 rounded-full object-cover border border-border-light"
          />
        ) : (
          <div className="size-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
        )}
        <button
          onClick={() => signOut.mutate()}
          className="w-8 h-8 flex items-center justify-center rounded-full text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary transition-colors"
          aria-label="로그아웃"
          disabled={signOut.isPending}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  // 로그인 버튼
  function renderLoginButton() {
    return (
      <button
        onClick={() => signInWithKakao.mutate()}
        className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-md hover:bg-primary-50"
        disabled={signInWithKakao.isPending}
      >
        로그인
      </button>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border-light px-5 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <h1 className="font-display text-lg font-bold text-text-primary tracking-wide flex-1">
        {title}
      </h1>
      {showCalendar && (
        <button
          onClick={() => router.push('/calendar')}
          className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          aria-label="캘린더"
        >
          <CalendarDays className="size-5" />
        </button>
      )}
      {/* 인증 영역: 로딩 중에는 표시하지 않음 */}
      {!isLoading && (user ? renderUserAvatar() : renderLoginButton())}
    </header>
  );
}
