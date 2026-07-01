import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/queryClient";
import { PlayerCard } from "../components/player-card";
import { getClubLogo, clubAbbr } from "../lib/clubs";
import type { Player } from "@shared/schema";

const CLUBS = [
  "Ajax", "PSV", "Feyenoord", "AZ", "FC Utrecht", "FC Twente",
  "NEC Nijmegen", "Sparta Rotterdam", "Go Ahead Eagles", "PEC Zwolle",
  "FC Groningen", "Excelsior", "Fortuna Sittard", "SC Cambuur",
  "ADO Den Haag", "Willem II", "SC Heerenveen", "SC Telstar",
];

const POSITIONS = [
  { key: "GK", label: "Keeper", color: "badge-gk" },
  { key: "DEF", label: "Verdediger", color: "badge-def" },
  { key: "MID", label: "Middenvelder", color: "badge-mid" },
  { key: "FWD", label: "Aanvaller", color: "badge-fwd" },
];

export default function PlayersPage() {
  const [club, setClub] = useState("");
  const [position, setPosition] = useState("");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (club) params.set("club", club);
  if (position) params.set("position", position);
  if (search) params.set("search", search);

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players", club, position, search],
    queryFn: () => apiFetch(`/api/players?${params}`),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border border-border/50">
        <div className="pitch-bg absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="relative z-10 px-8 py-8">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Eredivisie 2026/27</p>
          <h1 className="font-display text-5xl tracking-wider text-white">Spelers</h1>
          <p className="text-sm text-white/50 mt-1">
            {isLoading ? "Laden…" : `${players.length} spelers beschikbaar`}
          </p>
        </div>
      </div>

      {/* Position filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPosition("")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
            position === ""
              ? "bg-foreground text-background border-foreground"
              : "border-border/50 text-muted-foreground hover:border-border"
          }`}
        >
          Alle
        </button>
        {POSITIONS.map((pos) => (
          <button
            key={pos.key}
            onClick={() => setPosition(position === pos.key ? "" : pos.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
              position === pos.key
                ? `${pos.color} border-transparent`
                : "border-border/50 text-muted-foreground hover:border-border"
            }`}
          >
            {pos.label}
          </button>
        ))}
      </div>

      {/* Club logo filter */}
      <div>
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3">Club</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setClub("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              club === ""
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border/50 text-muted-foreground hover:border-border"
            }`}
          >
            Alle clubs
          </button>
          {CLUBS.map((c) => {
            const logo = getClubLogo(c);
            const isActive = club === c;
            return (
              <button
                key={c}
                onClick={() => setClub(club === c ? "" : c)}
                title={c}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isActive
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={c}
                    className="w-4 h-4 object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-[9px] font-bold w-4 text-center">{clubAbbr(c)}</span>
                )}
                <span className="hidden sm:inline">{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          className="border border-input rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all w-64"
          placeholder="Zoek speler…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(club || position || search) && (
          <button
            onClick={() => { setClub(""); setPosition(""); setSearch(""); }}
            className="text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-xl px-3 py-2.5 transition-all"
          >
            Wis filters
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>

      {!isLoading && players.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">Geen spelers gevonden.</p>
          <p className="text-sm mt-1">Pas je filters aan.</p>
        </div>
      )}
    </div>
  );
}
