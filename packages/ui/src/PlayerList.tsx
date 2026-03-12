import { memo } from "react";
import { PlayerAvatar } from "./PlayerAvatar";

interface PlayerListItem {
  _id: string;
  name: string;
  avatarColor: string;
  score: number;
  isConnected: boolean;
}

interface PlayerListProps {
  players: PlayerListItem[];
}

export const PlayerList = memo(function PlayerList({
  players,
}: PlayerListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {players.map((player) => (
        <li
          key={player._id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
            opacity: player.isConnected ? 1 : 0.5,
          }}
        >
          <PlayerAvatar name={player.name} color={player.avatarColor} size={36} />
          <span style={{ flex: 1, fontWeight: 600 }}>{player.name}</span>
          <span>{player.score}</span>
        </li>
      ))}
    </ul>
  );
});
