import { memo } from "react";

interface PlayerAvatarProps {
  name: string;
  color: string;
  size?: number;
}

export const PlayerAvatar = memo(function PlayerAvatar({
  name,
  color,
  size = 48,
}: PlayerAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 700,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
});
