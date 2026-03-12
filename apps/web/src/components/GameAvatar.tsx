import { getAvatarSrc } from "@/lib/avatars";

interface GameAvatarProps {
  name: string;
  avatarColor: string;
  avatarImage?: string;
  className?: string;
}

export function GameAvatar({
  name,
  avatarColor,
  avatarImage,
  className = "h-10 w-10",
}: GameAvatarProps) {
  const src = getAvatarSrc(avatarImage);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${className} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: avatarColor }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
