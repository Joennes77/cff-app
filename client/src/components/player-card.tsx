import type { Player } from "@shared/schema";
import { clubAbbr } from "../lib/clubs";
import { useClubLogos } from "../lib/clubLogosContext";

interface PlayerCardProps {
  player: Player;
  selected?: boolean;
  isStarter?: boolean;
  onToggle?: () => void;
  compact?: boolean;
}

const POSITION_BADGE: Record<string, string> = {
  GK: "badge-gk",
  DEF: "badge-def",
  MID: "badge-mid",
  FWD: "badge-fwd",
};

function ClubLogo({ club, size = 24 }: { club: string; size?: number }) {
  const logos = useClubLogos();
  const url = logos[club];
  if (url) {
    return (
      <img
        src={url}
        alt={club}
        width={size}
        height={size}
        className="object-contain shrink-0"
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          if (el.nextSibling) (el.nextSibling as HTMLElement).style.display = "flex";
        }}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground"
    >
      {clubAbbr(club)}
    </div>
  );
}

export function PlayerCard({ player, selected, isStarter, onToggle, compact }: PlayerCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`
        relative flex items-center gap-3 rounded-xl border p-3 transition-all
        ${onToggle ? "cursor-pointer hover:shadow-lg hover:shadow-primary/5" : ""}
        ${selected
          ? "border-primary/60 bg-primary/10 ring-1 ring-primary/40"
          : "border-border/50 bg-card hover:border-border"}
        ${compact ? "py-2" : ""}
      `}
    >
      {/* Club logo */}
      <ClubLogo club={player.club} size={compact ? 20 : 24} />

      {/* Position badge */}
      <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${POSITION_BADGE[player.position] ?? ""}`}>
        {player.position}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{player.name}</p>
        {!compact && (
          <p className="text-xs text-muted-foreground truncate">{player.club}</p>
        )}
      </div>

      {/* Price */}
      <span className="shrink-0 text-sm font-bold text-primary">
        €{player.price.toFixed(1)}M
      </span>

      {/* Starter / sub indicator */}
      {selected && isStarter !== undefined && (
        <span
          className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            isStarter
              ? "bg-primary text-black"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isStarter ? "BASIS" : "BANK"}
        </span>
      )}
    </div>
  );
}

/** Pitch formation slot */
export function FormationSlot({
  player,
  isStarter,
  onClick,
}: {
  player: Player | null;
  isStarter: boolean;
  onClick?: () => void;
}) {
  const logos = useClubLogos();
  const logo = player ? logos[player.club] : null;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-xl w-[72px] text-center transition-all
        ${player
          ? "bg-black/30 border border-white/20 shadow-lg backdrop-blur-sm hover:border-primary/60"
          : "bg-white/5 border border-dashed border-white/15 hover:border-primary/40"}
        ${onClick ? "hover:scale-105" : ""}
      `}
    >
      {/* Avatar circle */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center relative
        ${player ? "bg-white/10 border border-white/20" : "bg-white/5"}
      `}>
        {player && logo ? (
          <img
            src={logo}
            alt={player.club}
            className="w-7 h-7 object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="text-lg">{player ? "👤" : "+"}</span>
        )}
      </div>

      {player ? (
        <>
          <span className="text-[10px] font-semibold leading-tight line-clamp-2 text-white">
            {player.name}
          </span>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${POSITION_BADGE[player.position] ?? ""}`}>
            {player.position}
          </span>
        </>
      ) : (
        <span className="text-[10px] text-white/40">{isStarter ? "Basis" : "Bank"}</span>
      )}
    </button>
  );
}
