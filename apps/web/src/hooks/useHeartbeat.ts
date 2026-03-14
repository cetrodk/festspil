import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

export function useHeartbeat(sessionId: string) {
  const heartbeat = useMutation(api.players.heartbeat);

  useEffect(() => {
    // Send immediately on mount
    heartbeat({ sessionId }).catch(() => {});

    const id = setInterval(() => {
      heartbeat({ sessionId }).catch(() => {});
    }, HEARTBEAT_INTERVAL);

    // Mark disconnected on page unload
    return () => clearInterval(id);
  }, [sessionId, heartbeat]);
}
