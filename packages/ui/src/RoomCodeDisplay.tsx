import { memo } from "react";

interface RoomCodeDisplayProps {
  code: string;
}

export const RoomCodeDisplay = memo(function RoomCodeDisplay({
  code,
}: RoomCodeDisplayProps) {
  return (
    <div
      style={{
        fontSize: "4rem",
        fontWeight: 900,
        letterSpacing: "0.2em",
        textAlign: "center",
        fontFamily: "monospace",
      }}
    >
      {code}
    </div>
  );
});
