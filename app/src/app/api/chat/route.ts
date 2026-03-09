// ============================================================
// Chat API Route Handler
// geminiApi 호출 + 에러 처리만 담당하는 얇은 핸들러
// ============================================================

import { geminiApi } from '@/api/gemini';
import type { ChatMessage, Trip } from '@/types/trip';
import { NextResponse } from 'next/server';

interface ChatRequest {
  messages: ChatMessage[];
  mode: 'chat' | 'create' | 'edit';
  tripContext?: Trip;
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, mode, tripContext } = body;

    if (mode === 'create') {
      const result = await geminiApi.createTrip(messages);
      return NextResponse.json({ success: true, ...result });
    }

    if (mode === 'edit' && tripContext) {
      const result = await geminiApi.editTrip(messages, tripContext);
      return NextResponse.json({ success: true, ...result });
    }

    // 일반 대화 모드
    const reply = await geminiApi.chat(messages);
    return NextResponse.json({ success: true, message: reply });
  } catch (error) {
    console.error('Chat API error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Rate limit
    if (message.includes('429')) {
      return NextResponse.json(
        { success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 },
      );
    }

    // JSON 파싱 실패
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'AI 응답을 처리하지 못했습니다. 다시 시도해주세요.' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    );
  }
}
