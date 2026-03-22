import type { PreTodoItem } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';
import { Badge } from '@/components/ui/badge';

interface PreTodoTabProps {
  preTodos: PreTodoItem[];
}

export function PreTodoTab({ preTodos }: PreTodoTabProps) {
  if (!preTodos || preTodos.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-16 text-text-tertiary">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm font-medium">AI가 이 섹션을 아직 생성하지 않았습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle icon="✅" bgColor="#10b981">
        출발 전 할 일
      </SectionTitle>
      <div className="space-y-3">
        {preTodos.map((todo) => (
          <div
            key={todo.order}
            className="bg-surface-elevated border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)] hover:border-trip-green/20 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <Badge
                variant="secondary"
                className="w-8 h-8 rounded-lg bg-trip-green/10 text-sm font-black text-trip-green shrink-0 p-0 border border-trip-green/15"
              >
                {todo.order}
              </Badge>
              <div>
                <h4 className="text-sm font-bold text-text mb-1">{todo.title}</h4>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {todo.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
