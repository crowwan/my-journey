'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily:
            "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#fafafa',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '24rem' }}>
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1.5rem',
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '0.5rem',
              }}
            >
              앱에 문제가 발생했습니다
            </h1>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1.5rem',
              }}
            >
              예상치 못한 오류가 발생했습니다. 새로고침을 시도해 주세요.
            </p>

            <button
              onClick={reset}
              style={{
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              새로고침
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
