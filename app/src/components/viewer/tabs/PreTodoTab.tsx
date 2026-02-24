import type { PreTodoItem } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';

interface PreTodoTabProps {
  preTodos: PreTodoItem[];
}

export function PreTodoTab({ preTodos }: PreTodoTabProps) {
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
                <h4 className="text-sm font-bold text-white mb-1">{todo.title}</h4>
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
