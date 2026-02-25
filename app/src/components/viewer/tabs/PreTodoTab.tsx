import type { PreTodoItem } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';

interface PreTodoTabProps {
  preTodos: PreTodoItem[];
}

export function PreTodoTab({ preTodos }: PreTodoTabProps) {
  // 빈 상태 처리
  if (!preTodos || preTodos.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-12 text-text-tertiary">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm">AI가 이 섹션을 아직 생성하지 않았습니다</p>
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
            className="bg-card border border-border rounded-[14px] p-5 hover:border-trip-green/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* 번호 뱃지 */}
              <div className="w-8 h-8 rounded-lg bg-trip-green/20 flex items-center justify-center text-sm font-black text-trip-green shrink-0">
                {todo.order}
              </div>
              <div>
                <h4 className="text-sm font-bold text-text mb-1">{todo.title}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
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
