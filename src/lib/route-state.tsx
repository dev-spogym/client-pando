import { createContext, useContext, type PropsWithChildren } from 'react';

const RouteStateContext = createContext<string>('/');

export function RouteStateProvider({
  initialUrl,
  children,
}: PropsWithChildren<{ initialUrl: string }>) {
  return (
    <RouteStateContext.Provider value={initialUrl || '/'}>
      {children}
    </RouteStateContext.Provider>
  );
}

export function useInitialUrl() {
  return useContext(RouteStateContext);
}
