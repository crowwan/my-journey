'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { X, Download, Share2, Link, LinkIcon, Loader2, Check, Unlink } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { downloadTripHtml, shareTripHtml, copyShareUrl, canShareFiles } from '@/lib/share-utils';
import { createShareLink, getShareToken, deleteShareLink } from '@/lib/supabase/trip-api';

// File 공유 지원 여부를 SSR 안전하게 확인하는 훅
function useCanShareFiles(): boolean {
  return useSyncExternalStore(
    () => () => {}, // subscribe (변경되지 않는 값)
    () => canShareFiles(), // 클라이언트 값
    () => false, // 서버 값
  );
}

interface ShareModalProps {
  trip: Trip;
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ trip, open, onClose }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const supportsFileShare = useCanShareFiles();

  // 모달 열릴 때 기존 공유 토큰 조회
  useEffect(() => {
    if (!open) {
      setTokenChecked(false);
      return;
    }

    let cancelled = false;
    async function checkToken() {
      try {
        const token = await getShareToken(trip.id);
        if (!cancelled) {
          setShareToken(token);
          setTokenChecked(true);
        }
      } catch {
        if (!cancelled) setTokenChecked(true);
      }
    }
    checkToken();
    return () => { cancelled = true; };
  }, [open, trip.id]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // 토스트 자동 숨김
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 공유 링크 생성 + 클립보드 복사
  const handleCreateShareLink = useCallback(async () => {
    setLinkLoading(true);
    try {
      const token = await createShareLink(trip.id);
      setShareToken(token);
      const shareUrl = `${window.location.origin}/shared/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setToast('공유 링크가 복사되었습니다');
    } catch {
      setToast('공유 링크 생성에 실패했습니다');
    } finally {
      setLinkLoading(false);
    }
  }, [trip.id]);

  // 기존 공유 링크 복사
  const handleCopyShareLink = useCallback(async () => {
    if (!shareToken) return;
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast('공유 링크가 복사되었습니다');
    } catch {
      setToast('복사에 실패했습니다');
    }
  }, [shareToken]);

  // 공유 해제
  const handleDeleteShareLink = useCallback(async () => {
    setLinkLoading(true);
    try {
      await deleteShareLink(trip.id);
      setShareToken(null);
      setToast('공유가 해제되었습니다');
    } catch {
      setToast('공유 해제에 실패했습니다');
    } finally {
      setLinkLoading(false);
    }
  }, [trip.id]);

  // HTML 파일 다운로드
  const handleDownload = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const result = downloadTripHtml(trip);
      setLoading(false);
      if (result.success) {
        setToast('HTML 파일이 다운로드되었습니다');
      } else {
        setToast('다운로드에 실패했습니다');
      }
    }, 50);
  }, [trip]);

  // Web Share API로 공유
  const handleShare = useCallback(async () => {
    setLoading(true);
    const result = await shareTripHtml(trip);
    setLoading(false);
    if (result.success) {
      setToast('공유 완료!');
      onClose();
    }
  }, [trip, onClose]);

  // URL 클립보드 복사
  const handleCopyUrl = useCallback(async () => {
    const result = await copyShareUrl(trip);
    if (result.success) {
      setToast('링크가 복사되었습니다');
    } else {
      setToast('복사에 실패했습니다');
    }
  }, [trip]);

  if (!open) return null;

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-surface rounded-2xl shadow-lg w-full max-w-sm pointer-events-auto animate-fade-up"
          role="dialog"
          aria-modal="true"
          aria-label="여행 공유"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h3 className="text-lg font-semibold text-text-primary">공유하기</h3>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-8 rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              aria-label="닫기"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* 옵션 목록 */}
          <div className="px-6 pb-6 space-y-2">
            {/* 링크 공유 — 최상단 */}
            {tokenChecked && (
              shareToken ? (
                // 이미 공유 중 — 링크 복사 + 공유 해제
                <div className="space-y-2">
                  <button
                    onClick={handleCopyShareLink}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors hover:bg-bg-secondary border border-primary-200 bg-primary-50"
                  >
                    <LinkIcon className="size-5 text-primary-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">공유 링크 복사</div>
                      <div className="text-xs text-text-tertiary mt-0.5">누구나 이 링크로 여행을 볼 수 있어요</div>
                    </div>
                  </button>
                  <button
                    onClick={handleDeleteShareLink}
                    disabled={linkLoading}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors hover:bg-bg-secondary border border-border-light disabled:opacity-50"
                  >
                    {linkLoading ? (
                      <Loader2 className="size-4 text-error animate-spin shrink-0" />
                    ) : (
                      <Unlink className="size-4 text-error shrink-0" />
                    )}
                    <span className="text-xs font-medium text-error">공유 해제</span>
                  </button>
                </div>
              ) : (
                // 공유 안 됨 — 링크 생성 버튼
                <button
                  onClick={handleCreateShareLink}
                  disabled={linkLoading}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors hover:bg-bg-secondary border border-border-light disabled:opacity-50"
                >
                  {linkLoading ? (
                    <Loader2 className="size-5 text-primary-500 animate-spin shrink-0" />
                  ) : (
                    <LinkIcon className="size-5 text-primary-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary">링크 공유</div>
                    <div className="text-xs text-text-tertiary mt-0.5">공유 링크를 만들어 누구에게나 보여줄 수 있어요</div>
                  </div>
                </button>
              )
            )}

            {/* 구분선 */}
            {tokenChecked && (
              <div className="h-px bg-border-light" />
            )}

            {/* HTML 파일 다운로드 -- 항상 표시 */}
            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors hover:bg-bg-secondary border border-border-light disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-5 text-primary animate-spin shrink-0" />
              ) : (
                <Download className="size-5 text-primary shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">HTML 파일 다운로드</div>
                <div className="text-xs text-text-tertiary mt-0.5">오프라인에서도 볼 수 있는 파일로 저장</div>
              </div>
            </button>

            {/* Web Share API (File) -- 지원 시에만 표시 */}
            {supportsFileShare && (
              <button
                onClick={handleShare}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors hover:bg-bg-secondary border border-border-light disabled:opacity-50"
              >
                <Share2 className="size-5 text-cat-transport shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">공유하기</div>
                  <div className="text-xs text-text-tertiary mt-0.5">카카오톡, 에어드롭 등으로 바로 전송</div>
                </div>
              </button>
            )}

            {/* URL 클립보드 복사 -- 보조 옵션 */}
            <button
              onClick={handleCopyUrl}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors hover:bg-bg-secondary border border-border-light"
            >
              <Link className="size-5 text-text-secondary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">앱 링크 복사</div>
                <div className="text-xs text-text-tertiary mt-0.5">앱 페이지 링크를 클립보드에 복사</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-text-primary text-white text-sm px-4 py-2 rounded-full shadow-lg">
          <Check className="size-4" />
          {toast}
        </div>
      )}
    </>
  );
}
