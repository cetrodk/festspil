const avatarModules = import.meta.glob("@/assets/avatars/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const AVATARS: Array<{ name: string; src: string }> = Object.entries(
  avatarModules,
).map(([path, src]) => ({
  name: path.replace(/.*\/(.+)\.png$/, "$1"),
  src,
}));

export function getAvatarSrc(name: string | undefined): string | undefined {
  return AVATARS.find((a) => a.name === name)?.src;
}
