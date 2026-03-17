// 뷰어 전역 상태 Context — readOnly 등 TripViewer 하위 전체에 공유
'use client';

import { createContext, useContext } from 'react';

interface ViewerContextValue {
  readOnly: boolean;
}

const ViewerContext = createContext<ViewerContextValue>({ readOnly: false });

export function ViewerProvider({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return (
    <ViewerContext.Provider value={{ readOnly }}>
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewerContext(): ViewerContextValue {
  return useContext(ViewerContext);
}
