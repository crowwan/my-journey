export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-surface-elevated border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 bg-accent/40 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          />
          <span
            className="w-2 h-2 bg-accent/40 rounded-full animate-bounce"
            style={{ animationDelay: '200ms', animationDuration: '1s' }}
          />
          <span
            className="w-2 h-2 bg-accent/40 rounded-full animate-bounce"
            style={{ animationDelay: '400ms', animationDuration: '1s' }}
          />
        </div>
        <span className="text-text-tertiary text-xs font-medium">AI가 생각하고 있어요...</span>
      </div>
    </div>
  );
}
