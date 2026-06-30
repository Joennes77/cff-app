import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  selected?: boolean;
  isStarter?: boolean;
  onToggle?: () => void;
  compact?: boolean;
}

const POSITION_LABELS: Record<string, string> = {
  GK: "Keeper",
  DEF: "Verdediger",
  MID: "Middenvelder",
  FWD: "Aanvaller",
};

const POSITION_BADGE: Record<string, string> = {
  GK: "badge-gk",
  DEF: "badge-def",
  MID: "badge-mid",
  FWD: "badge-fwd",
};

export function PlayerCard({ player, selected, isStarter, onToggle, compact }: PlayerCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`
        relative flex items-center gap-3 rounded-lg border p-3 transition-all
        ${onToggle ? "cursor-pointer hover:shadow-md" : ""}
        ${selected ? "border-primary bg-accent ring-1 ring-primary" : "border-border bg-card"}
        ${compact ? "py-2" : ""}
      `}
    >
      {/* Position badge */}
      <span
        className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${POSITION_BADGE[player.position] ?? ""}`}
      >
        {player.position}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{player.name}</p>
        {!compact && (
          <p className="text-xs text-muted-foreground truncate">{player.club}</p>
        )}
      </div>

      {/* Price */}
      <span className="shrink-0 text-sm font-semibold text-primary">
        €{player.price.toFixed(1)}M
      </span>

      {/* Starter / sub indicator */}
      {selected && isStarter !== undefined && (
        <span
          className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 rounded ${
            isStarter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {isStarter ? "BASIS" : "BANK"}
        </span>
      )}
    </div>
  );
}

/** Pitch formation slot — shows a player on the formation grid */
export function FormationSlot({
  player,
  isStarter,
  onClick,
}: {
  player: Player | null;
  isStarter: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg w-20 text-center transition-all
        ${player ? "bg-card border border-border shadow-sm" : "bg-muted/40 border border-dashed border-border"}
        ${onClick ? "hover:border-primary hover:shadow" : ""}
      `}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
          ${player ? "bg-primary/10" : "bg-muted"}
        `}
      >
        {player ? "👤" : "+"}
      </div>
      {player ? (
        <>
          <span className="text-[10px] font-semibold leading-tight line-clamp-2">{player.name}</span>
          <span className={`text-[9px] font-bold px-1 rounded ${POSITION_BADGE[player.position] ?? ""}`}>
            {player.position}
          </span>
        </>
      ) : (
        <span className="text-[10px] text-muted-foreground">{isStarter ? "Basis" : "Bank"}</span>
      )}
    </button>
  );
}
