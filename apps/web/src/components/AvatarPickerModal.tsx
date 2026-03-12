import { motion } from "framer-motion";
import { AVATARS } from "@/lib/avatars";

interface AvatarPickerModalProps {
  selected: string | null | undefined;
  onSelect: (name: string | null) => void;
  onClose: () => void;
}

export function AvatarPickerModal({
  selected,
  onSelect,
  onClose,
}: AvatarPickerModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card-glow w-full max-w-sm rounded-2xl bg-[var(--color-bg-warm)] p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">Vælg avatar</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.name}
              type="button"
              onClick={() => {
                onSelect(selected === avatar.name ? null : avatar.name);
                onClose();
              }}
              className={`rounded-xl p-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                avatar.name === selected
                  ? "ring-2 ring-[var(--color-primary)] bg-[var(--color-primary)]/20 scale-105"
                  : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)]"
              }`}
            >
              <img
                src={avatar.src}
                alt={avatar.name}
                className="w-full aspect-square rounded-lg object-cover"
              />
            </button>
          ))}
        </div>
        {selected ? (
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="mt-4 w-full text-center text-sm text-[var(--color-text-muted)] underline underline-offset-4 cursor-pointer"
          >
            Fjern avatar
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
