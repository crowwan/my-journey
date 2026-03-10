'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f97316]/10">
          <svg
            className="h-8 w-8 text-[#f97316]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          문제가 발생했습니다
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.
        </p>

        <button
          onClick={reset}
          className="rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
