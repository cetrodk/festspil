import { useConvex } from "convex/react";
import { useState, useEffect } from "react";
import { da } from "@/lib/da";

export function ConnectionBanner() {
  const convex = useConvex();
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    return convex.subscribeToConnectionState((state) => {
      setConnected(state.isWebSocketConnected);
    });
  }, [convex]);

  if (connected) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-[var(--color-danger)] px-4 py-2 text-center text-sm font-bold text-white animate-gentle-pulse">
      {da.connectionLost}
    </div>
  );
}
