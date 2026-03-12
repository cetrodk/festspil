import { createContext, useContext, useMemo } from "react";
import { getSessionId } from "@/lib/session";

const SessionContext = createContext<string>("");

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionId = useMemo(() => getSessionId(), []);
  return (
    <SessionContext.Provider value={sessionId}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionId(): string {
  const id = useContext(SessionContext);
  if (!id) throw new Error("useSessionId must be used within SessionProvider");
  return id;
}
