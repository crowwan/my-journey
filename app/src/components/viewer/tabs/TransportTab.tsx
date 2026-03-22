import type { TransportSection, TransportPass } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';
import { Tip } from '../shared/Tip';

interface TransportTabProps {
  transport: TransportSection;
}

function getPassColor(recommendation: TransportPass['recommendation']) {
  switch (recommendation) {
    case 'recommended':
      return { border: 'border-trip-green/25', bg: 'bg-trip-green/5', text: 'text-trip-green', badge: 'bg-trip-green/10 text-trip-green border-trip-green/15' };
    case 'neutral':
      return { border: 'border-accent/25', bg: 'bg-accent/5', text: 'text-accent', badge: 'bg-accent/10 text-accent border-accent/15' };
    case 'not-recommended':
      return { border: 'border-border', bg: 'bg-surface-sunken', text: 'text-text-tertiary', badge: 'bg-surface-sunken text-text-tertiary border-border' };
  }
}

export function TransportTab({ transport }: TransportTabProps) {
  const homeToHotel = transport.homeToHotel ?? [];
  const intercityRoutes = transport.intercityRoutes ?? [];
  const passes = transport.passes ?? [];
  const icocaGuide = transport.icocaGuide ?? [];
  const tips = transport.tips ?? [];

  if (homeToHotel.length === 0 && intercityRoutes.length === 0 && passes.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-16 text-text-tertiary">
          <div className="text-4xl mb-3">🚃</div>
          <p className="text-sm font-medium">AI가 이 섹션을 아직 생성하지 않았습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* 집 -> 호텔 경로 */}
      {homeToHotel.length > 0 && (
        <>
          <SectionTitle icon="🛫" bgColor="#3b82f6">
            집 → 호텔 경로
          </SectionTitle>
          <div className="bg-surface-elevated border border-border rounded-2xl p-5 mb-3 shadow-[var(--shadow-sm)]">
            <div className="flex flex-wrap items-center gap-2">
              {homeToHotel.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="bg-surface-sunken rounded-xl px-4 py-3 text-center min-w-[90px] border border-border">
                    <div className="text-lg mb-0.5">{step.icon}</div>
                    <div className="text-sm font-bold text-text">{step.title}</div>
                    <div className="text-xs text-text-secondary">{step.subtitle}</div>
                  </div>
                  {idx < homeToHotel.length - 1 && (
                    <span className="text-trip-blue text-lg font-bold">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 도시간 노선 */}
      {intercityRoutes.length > 0 && (
        <>
          <SectionTitle icon="🚃" bgColor="#3b82f6">
            도시간 노선
          </SectionTitle>
          <div className="bg-surface-elevated border border-border rounded-2xl overflow-hidden mb-3 shadow-[var(--shadow-sm)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-sunken text-text-tertiary text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-bold">출발</th>
                  <th className="text-left px-4 py-3 font-bold">도착</th>
                  <th className="text-left px-4 py-3 font-bold">교통편</th>
                  <th className="text-left px-4 py-3 font-bold">소요</th>
                  <th className="text-right px-4 py-3 font-bold">요금</th>
                </tr>
              </thead>
              <tbody>
                {intercityRoutes.map((route, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border last:border-b-0 hover:bg-surface-sunken/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-text font-semibold">{route.from}</td>
                    <td className="px-4 py-3 text-text font-semibold">{route.to}</td>
                    <td className="px-4 py-3 text-trip-blue font-medium">{route.method}</td>
                    <td className="px-4 py-3 text-text-secondary">{route.duration}</td>
                    <td className="px-4 py-3 text-accent text-right font-bold">{route.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 패스 비교 */}
      {passes.length > 0 && (
        <>
          <SectionTitle icon="🎫" bgColor="#a78bfa">
            패스 비교
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 mb-4">
            {passes.map((pass) => {
              const color = getPassColor(pass.recommendation);
              return (
                <div
                  key={pass.name}
                  className={`${color.bg} border ${color.border} rounded-2xl p-5 shadow-[var(--shadow-sm)]`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[15px] font-bold text-text">{pass.name}</h4>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${color.badge}`}>
                      {pass.recommendation === 'recommended'
                        ? '추천'
                        : pass.recommendation === 'neutral'
                          ? '보통'
                          : '비추천'}
                    </span>
                  </div>
                  <div className={`text-lg font-black mb-1.5 ${color.text}`}>{pass.price}</div>
                  <p className="text-sm text-text-secondary leading-relaxed">{pass.reason}</p>
                </div>
              );
            })}
          </div>
          {transport.passVerdict && (
            <Tip>{transport.passVerdict}</Tip>
          )}
        </>
      )}

      {/* ICOCA 가이드 */}
      {icocaGuide.length > 0 && (
        <>
          <SectionTitle icon="💳" bgColor="#22d3ee">
            ICOCA 가이드
          </SectionTitle>
          <div className="bg-surface-elevated border border-border rounded-2xl p-5 mb-3 shadow-[var(--shadow-sm)]">
            <ul className="space-y-3">
              {icocaGuide.map((guide, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-trip-cyan/10 text-trip-cyan font-bold text-xs flex items-center justify-center shrink-0 border border-trip-cyan/15">
                    {idx + 1}
                  </span>
                  <span className="text-text-secondary leading-relaxed">{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* 교통 팁 */}
      {tips.length > 0 && (
        <>
          <SectionTitle icon="💡" bgColor="#f97316">
            교통 팁
          </SectionTitle>
          <div className="space-y-2">
            {tips.map((tip) => (
              <Tip key={tip}>{tip}</Tip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
