// 타이핑 인디케이터 - AI 응답 대기 중 표시
export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
        {/* 3개의 bounce dot */}
        <div className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          />
          <span
            className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce"
            style={{ animationDelay: '200ms', animationDuration: '1s' }}
          />
          <span
            className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce"
            style={{ animationDelay: '400ms', animationDuration: '1s' }}
          />
        </div>
        <span className="text-text-tertiary text-xs ml-1">AI가 생각하고 있어요...</span>
      </div>
    </div>
  );
}
