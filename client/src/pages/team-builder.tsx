import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiFetch } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { PlayerCard, FormationSlot } from "../components/player-card";
import { useClubLogos } from "../lib/clubLogosContext";
import type { Player, TeamWithPlayers, TransferWindow } from "@shared/schema";

const BUDGET = 250;
const CLUBS = [
  "Ajax", "PSV", "Feyenoord", "AZ", "FC Utrecht", "FC Twente",
  "NEC Nijmegen", "Sparta Rotterdam", "Go Ahead Eagles", "PEC Zwolle",
  "FC Groningen", "Excelsior", "Fortuna Sittard", "SC Cambuur",
  "ADO Den Haag", "Willem II", "SC Heerenveen", "SC Telstar",
];
const POSITIONS = ["GK", "DEF", "MID", "FWD"];

export default function TeamBuilder() {
  const { id: poolId } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const qc = useQueryClient();

  const { data: transferWindow } = useQuery<TransferWindow | null>({
    queryKey: ["/api/rounds/transfer-window"],
    queryFn: () => apiFetch("/api/rounds/transfer-window"),
  });

  const { data: existingTeam } = useQuery<TeamWithPlayers | null>({
    queryKey: ["/api/teams", poolId],
    queryFn: () => apiFetch(`/api/teams/${poolId}`),
  });

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    queryFn: () => apiFetch("/api/players"),
  });

  const [starterIds, setStarterIds] = useState<number[]>([]);
  const [subIds, setSubIds] = useState<number[]>([]);
  const [filterClub, setFilterClub] = useState("");
  const [filterPos, setFilterPos] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useState(() => {
    if (existingTeam) {
      setStarterIds(existingTeam.starters.map((p) => p.id));
      setSubIds(existingTeam.subs.map((p) => p.id));
    }
  });

  const selectedIds = useMemo(() => new Set([...starterIds, ...subIds]), [starterIds, subIds]);
  const selectedPlayers = useMemo(() => allPlayers.filter((p) => selectedIds.has(p.id)), [allPlayers, selectedIds]);
  const totalPrice = useMemo(() => selectedPlayers.reduce((s, p) => s + p.price, 0), [selectedPlayers]);

  const starters = useMemo(() => {
    const filled = starterIds.map((id) => allPlayers.find((p) => p.id === id) ?? null);
    while (filled.length < 11) filled.push(null);
    return filled;
  }, [starterIds, allPlayers]);

  const subs = useMemo(() => {
    const filled = subIds.map((id) => allPlayers.find((p) => p.id === id) ?? null);
    while (filled.length < 5) filled.push(null);
    return filled;
  }, [subIds, allPlayers]);

  const filteredPlayers = useMemo(() => {
    let list = allPlayers;
    if (filterClub) list = list.filter((p) => p.club === filterClub);
    if (filterPos) list = list.filter((p) => p.position === filterPos);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [allPlayers, filterClub, filterPos, search]);

  function togglePlayer(player: Player) {
    if (selectedIds.has(player.id)) {
      setStarterIds((ids) => ids.filter((id) => id !== player.id));
      setSubIds((ids) => ids.filter((id) => id !== player.id));
      return;
    }
    if (starterIds.length < 11) {
      setStarterIds((ids) => [...ids, player.id]);
    } else if (subIds.length < 5) {
      setSubIds((ids) => [...ids, player.id]);
    }
  }

  const saveMutation = useMutation({
    mutationFn: () => authFetch("POST", `/api/teams/${poolId}`, { starterIds, subIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/teams", poolId] });
      setError("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    },
    onError: (e: Error) => setError(e.message),
  });

  const budgetOk = totalPrice <= BUDGET;
  const teamComplete = starterIds.length === 11 && subIds.length === 5;
  const hasExistingTeam = !!existingTeam;
  const canSave = !hasExistingTeam || !!transferWindow;
  const budgetPct = Math.min((totalPrice / BUDGET) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="font-display text-4xl tracking-wider mb-5">Team Samenstellen</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">

        {/* ── LEFT: Pitch + Dugout ── */}
        <div className="space-y-4">

          {/* Budget bar */}
          <div className="bg-card border border-border/50 rounded-2xl px-5 py-3 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">Budget</span>
                <span className={`font-bold ${budgetOk ? "text-primary" : "text-destructive"}`}>
                  €{totalPrice.toFixed(1)}M / €{BUDGET}M
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${budgetOk ? "bg-primary" : "bg-destructive"}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">{starterIds.length}/11 basis · {subIds.length}/5 bank</p>
              <p className={`text-sm font-bold ${budgetOk ? "text-primary" : "text-destructive"}`}>
                €{(BUDGET - totalPrice).toFixed(1)}M over
              </p>
            </div>
          </div>

          {/* Pitch + Dugout side-by-side */}
          <div className="flex gap-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">

            {/* ─── PITCH ─── */}
            <div className="flex-1 pitch-bg relative min-h-[520px]">
              {/* SVG pitch markings */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 160" preserveAspectRatio="none">
                {/* Outer border */}
                <rect x="3" y="2" width="94" height="156" fill="none" stroke="white" strokeWidth="0.4" opacity="0.18"/>
                {/* Halfway line */}
                <line x1="3" y1="81" x2="97" y2="81" stroke="white" strokeWidth="0.4" opacity="0.18"/>
                {/* Center circle */}
                <circle cx="50" cy="81" r="13" fill="none" stroke="white" strokeWidth="0.4" opacity="0.18"/>
                <circle cx="50" cy="81" r="0.8" fill="white" opacity="0.25"/>
                {/* Top penalty area (attacking — FWD side) */}
                <rect x="22" y="2" width="56" height="22" fill="none" stroke="white" strokeWidth="0.35" opacity="0.15"/>
                {/* Top goal area */}
                <rect x="36" y="2" width="28" height="9" fill="none" stroke="white" strokeWidth="0.35" opacity="0.15"/>
                {/* Top goal */}
                <rect x="43" y="0.5" width="14" height="3" fill="rgba(255,255,255,0.06)" stroke="white" strokeWidth="0.3" opacity="0.2"/>
                {/* Bottom penalty area (defending — GK side) */}
                <rect x="22" y="136" width="56" height="22" fill="none" stroke="white" strokeWidth="0.35" opacity="0.15"/>
                {/* Bottom goal area */}
                <rect x="36" y="149" width="28" height="9" fill="none" stroke="white" strokeWidth="0.35" opacity="0.15"/>
                {/* Bottom goal */}
                <rect x="43" y="156.5" width="14" height="3" fill="rgba(255,255,255,0.06)" stroke="white" strokeWidth="0.3" opacity="0.2"/>
                {/* Top penalty spot */}
                <circle cx="50" cy="17" r="0.8" fill="white" opacity="0.2"/>
                {/* Bottom penalty spot */}
                <circle cx="50" cy="143" r="0.8" fill="white" opacity="0.2"/>
                {/* Top penalty arc */}
                <path d="M 35 24 A 13 13 0 0 1 65 24" fill="none" stroke="white" strokeWidth="0.35" opacity="0.12"/>
                {/* Bottom penalty arc */}
                <path d="M 35 136 A 13 13 0 0 0 65 136" fill="none" stroke="white" strokeWidth="0.35" opacity="0.12"/>
              </svg>

              {/* Formation rows — FWD at top, GK at bottom */}
              <div className="relative z-10 flex flex-col justify-between h-full py-5 px-3">
                {/* Aanvallers (top) */}
                <div>
                  <p className="text-center text-white/30 text-[9px] font-bold tracking-widest uppercase mb-2">Aanvallers</p>
                  <div className="flex justify-center gap-2">
                    {starters.slice(8, 11).map((p, i) => (
                      <FormationSlot key={i} player={p} isStarter />
                    ))}
                  </div>
                </div>

                {/* Middenvelders */}
                <div>
                  <p className="text-center text-white/30 text-[9px] font-bold tracking-widest uppercase mb-2">Middenvelders</p>
                  <div className="flex justify-center gap-2">
                    {starters.slice(5, 8).map((p, i) => (
                      <FormationSlot key={i} player={p} isStarter />
                    ))}
                  </div>
                </div>

                {/* Verdedigers */}
                <div>
                  <p className="text-center text-white/30 text-[9px] font-bold tracking-widest uppercase mb-2">Verdedigers</p>
                  <div className="flex justify-center gap-2">
                    {starters.slice(1, 5).map((p, i) => (
                      <FormationSlot key={i} player={p} isStarter />
                    ))}
                  </div>
                </div>

                {/* Keeper (bottom) */}
                <div>
                  <p className="text-center text-white/30 text-[9px] font-bold tracking-widest uppercase mb-2">Keeper</p>
                  <div className="flex justify-center">
                    <FormationSlot player={starters[0]} isStarter />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── DUGOUT / BANK ─── */}
            <div className="w-[88px] bg-black/60 border-l border-white/10 backdrop-blur-sm flex flex-col items-center py-5 px-2 gap-3">
              {/* Bench label */}
              <div className="text-center">
                <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase">Dug-out</p>
                <div className="mt-1 w-8 h-px bg-white/20 mx-auto" />
              </div>

              {/* Bench slats visual */}
              <div className="w-full space-y-2">
                {subs.map((p, i) => (
                  <div key={i} className="relative">
                    {/* Bench slat */}
                    <div className="h-px bg-white/10 mb-1" />
                    <FormationSlot player={p} isStarter={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status messages */}
          {hasExistingTeam && !transferWindow && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
              <span className="text-amber-400 text-base">🔒</span>
              <p className="text-sm text-amber-400 font-medium">Team vergrendeld. Transfers alleen tijdens een open transferwindow.</p>
            </div>
          )}
          {transferWindow && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
              <span className="text-primary text-base">🟢</span>
              <p className="text-sm text-primary font-medium">
                Transferwindow {transferWindow.windowNumber} open t/m {new Date(transferWindow.endDate).toLocaleDateString("nl-NL")}
              </p>
            </div>
          )}
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>}
          {success && <p className="text-sm text-primary bg-primary/10 rounded-xl px-4 py-2.5">✓ Team opgeslagen!</p>}

          <button
            onClick={() => saveMutation.mutate()}
            disabled={!teamComplete || !budgetOk || saveMutation.isPending || !canSave}
            className="w-full py-3.5 rounded-2xl bg-primary text-black font-bold text-sm tracking-wider disabled:opacity-30 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
          >
            {saveMutation.isPending ? "Opslaan…" : "⚽  Team Opslaan"}
          </button>
        </div>

        {/* ── RIGHT: Club browser ── */}
        <ClubBrowser
          allPlayers={allPlayers}
          selectedIds={selectedIds}
          starterIds={starterIds}
          onToggle={togglePlayer}
          filterPos={filterPos}
          setFilterPos={setFilterPos}
          search={search}
          setSearch={setSearch}
        />
      </div>
    </div>
  );
}

// ─── Club Browser Component ───────────────────────────────────────────────────

const POS_PILLS = [
  { key: "", label: "Alle" },
  { key: "GK", label: "GK", cls: "badge-gk" },
  { key: "DEF", label: "DEF", cls: "badge-def" },
  { key: "MID", label: "MID", cls: "badge-mid" },
  { key: "FWD", label: "FWD", cls: "badge-fwd" },
];

function ClubBrowser({
  allPlayers,
  selectedIds,
  starterIds,
  onToggle,
  filterPos,
  setFilterPos,
  search,
  setSearch,
}: {
  allPlayers: Player[];
  selectedIds: Set<number>;
  starterIds: number[];
  onToggle: (p: Player) => void;
  filterPos: string;
  setFilterPos: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const logos = useClubLogos();
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  // Players shown in list
  const visiblePlayers = useMemo(() => {
    let list = allPlayers;
    if (selectedClub) list = list.filter((p) => p.club === selectedClub);
    if (filterPos) list = list.filter((p) => p.position === filterPos);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [allPlayers, selectedClub, filterPos, search]);

  // Stats for selected club
  const clubPlayers = useMemo(
    () => (selectedClub ? allPlayers.filter((p) => p.club === selectedClub) : []),
    [allPlayers, selectedClub]
  );
  const selectedCount = useMemo(
    () => clubPlayers.filter((p) => selectedIds.has(p.id)).length,
    [clubPlayers, selectedIds]
  );

  return (
    <div
      className="bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 160px)", minHeight: 560 }}
    >
      {/* ── Club grid or Club hero ── */}
      {!selectedClub ? (
        /* Club selector grid */
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2 border-b border-border/50">
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3">
              Kies een club
            </p>
            <input
              className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Of zoek direct een speler…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {search ? (
            /* Search results across all clubs */
            <div className="p-3 space-y-1.5">
              <p className="text-xs text-muted-foreground px-1 mb-2">{visiblePlayers.length} spelers gevonden</p>
              {visiblePlayers.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  selected={selectedIds.has(p.id)}
                  isStarter={starterIds.includes(p.id)}
                  onToggle={() => onToggle(p)}
                  compact
                />
              ))}
            </div>
          ) : (
            /* 3-column club logo grid */
            <div className="p-3 grid grid-cols-3 gap-2">
              {CLUBS.map((club) => {
                const logo = logos[club];
                const count = allPlayers.filter((p) => p.club === club && selectedIds.has(p.id)).length;
                return (
                  <button
                    key={club}
                    onClick={() => setSelectedClub(club)}
                    className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40 bg-background/40 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    {count > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-primary text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {count}
                      </span>
                    )}
                    {logo ? (
                      <img
                        src={logo}
                        alt={club}
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {club.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[10px] font-semibold text-center text-muted-foreground group-hover:text-foreground leading-tight line-clamp-2 transition-colors">
                      {club}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Club detail view ── */
        <div className="flex flex-col flex-1 min-h-0">
          {/* Club hero */}
          <div className="relative shrink-0 overflow-hidden">
            <div className="pitch-bg absolute inset-0 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-card/95" />
            <div className="relative z-10 px-4 pt-5 pb-4">
              {/* Back button */}
              <button
                onClick={() => setSelectedClub(null)}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-4 transition-colors"
              >
                ← Alle clubs
              </button>

              {/* Logo + name */}
              <div className="flex items-center gap-4">
                {logos[selectedClub] ? (
                  <img
                    src={logos[selectedClub]}
                    alt={selectedClub}
                    className="w-20 h-20 object-contain drop-shadow-2xl"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center text-2xl font-bold text-white">
                    {selectedClub.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-display text-3xl tracking-wider text-white leading-tight">
                    {selectedClub}
                  </h2>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-xs text-white/50">{clubPlayers.length} spelers</span>
                    {selectedCount > 0 && (
                      <span className="text-xs text-primary font-semibold">{selectedCount} geselecteerd</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Position filter + search */}
          <div className="shrink-0 px-3 py-2.5 border-b border-border/50 space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              {POS_PILLS.map(({ key, label, cls }) => (
                <button
                  key={key}
                  onClick={() => setFilterPos(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterPos === key
                      ? cls
                        ? cls
                        : "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              className="w-full border border-input rounded-lg px-3 py-1.5 text-sm bg-background/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Zoek in selectie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {visiblePlayers.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                selected={selectedIds.has(p.id)}
                isStarter={starterIds.includes(p.id)}
                onToggle={() => onToggle(p)}
                compact
              />
            ))}
            {visiblePlayers.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">Geen spelers gevonden</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
