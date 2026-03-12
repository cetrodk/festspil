/** 12 distinct avatar colors, assigned in join order */
export const AVATAR_COLORS = [
  "#e74c3c", // red
  "#3498db", // blue
  "#2ecc71", // green
  "#f39c12", // orange
  "#9b59b6", // purple
  "#1abc9c", // teal
  "#e91e63", // pink
  "#00bcd4", // cyan
  "#ff9800", // amber
  "#8bc34a", // lime
  "#ff5722", // deep orange
  "#607d8b", // blue grey
] as const;

export function getAvatarColor(playerIndex: number): string {
  return AVATAR_COLORS[playerIndex % AVATAR_COLORS.length];
}
