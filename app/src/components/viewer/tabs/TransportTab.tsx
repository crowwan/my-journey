import type { TransportSection, TransportPass } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';
import { Tip } from '../shared/Tip';

interface TransportTabProps {
  transport: TransportSection;
}

// 패스 추천 상태별 색상 매핑
function getPassColor(recommendation: TransportPass['recommendation']) {
  switch (recommendation) {
    case 'recommended':
      return { border: 'border-trip-green/40', bg: 'bg-trip-green/10', text: 'text-trip-green', badge: 'bg-trip-green/20 text-trip-green' };
    case 'neutral':
      return { border: 'border-accent/40', bg: 'bg-accent/10', text: 'text-accent', badge: 'bg-accent/20 text-accent' };
    case 'not-recommended':
      return { border: 'border-text-tertiary/40', bg: 'bg-glass', text: 'text-text-tertiary', badge: 'bg-glass text-text-tertiary' };
  }
}

export function TransportTab({ transport }: TransportTabProps) {
  const homeToHotel = transport.homeToHotel ?? [];
  const intercityRoutes = transport.intercityRoutes ?? [];
  const passes = transport.passes ?? [];
  const icocaGuide = transport.icocaGuide ?? [];
  const tips = transport.tips ?? [];

  // 교통 데이터가 전혀 없으면 빈 상태 표시
  if (homeToHotel.length === 0 && intercityRoutes.length === 0 && passes.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-12 text-text-tertiary">
          <div className="text-3xl mb-2">🚃</div>
          <p className="text-sm">AI가 이 섹션을 아직 생성하지 않았습니다</p>
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
          <div className="bg-card border border-border rounded-[14px] p-5 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {homeToHotel.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="bg-card-secondary rounded-xl px-4 py-3 text-center min-w-[90px]">
                    <div className="text-lg mb-0.5">{step.icon}</div>
                    <div className="text-sm font-semibold text-text">{step.title}</div>
                    <div className="text-xs text-text-secondary">{step.subtitle}</div>
                  </div>
                  {idx < homeToHotel.length - 1 && (
                    <span className="text-trip-blue text-lg">→</span>
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
          <div className="bg-card border border-border rounded-[14px] overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-tertiary text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">출발</th>
                  <th className="text-left px-4 py-3 font-semibold">도착</th>
                  <th className="text-left px-4 py-3 font-semibold">교통편</th>
                  <th className="text-left px-4 py-3 font-semibold">소요</th>
                  <th className="text-right px-4 py-3 font-semibold">요금</th>
                </tr>
              </thead>
              <tbody>
                {intercityRoutes.map((route, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border last:border-b-0 hover:bg-glass transition-colors"
                  >
                    <td className="px-4 py-3 text-text font-medium">{route.from}</td>
                    <td className="px-4 py-3 text-text font-medium">{route.to}</td>
                    <td className="px-4 py-3 text-trip-blue">{route.method}</td>
                    <td className="px-4 py-3 text-text-secondary">{route.duration}</td>
                    <td className="px-4 py-3 text-accent text-right font-semibold">{route.cost}</td>
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 mb-3">
            {passes.map((pass) => {
              const color = getPassColor(pass.recommendation);
              return (
                <div
                  key={pass.name}
                  className={`${color.bg} border ${color.border} rounded-[14px] p-5`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-text">{pass.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${color.badge}`}>
                      {pass.recommendation === 'recommended'
                        ? '추천'
                        : pass.recommendation === 'neutral'
                          ? '보통'
                          : '비추천'}
                    </span>
                  </div>
                  <div className={`text-lg font-bold mb-1 ${color.text}`}>{pass.price}</div>
                  <p className="text-sm text-text-secondary">{pass.reason}</p>
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
          <div className="bg-card border border-border rounded-[14px] p-5 mb-3">
            <ul className="space-y-2">
              {icocaGuide.map((guide, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-trip-cyan font-bold shrink-0">{idx + 1}.</span>
                  <span className="text-text-secondary">{guide}</span>
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
          {tips.map((tip) => (
            <div key={tip} className="mb-2">
              <Tip>{tip}</Tip>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
