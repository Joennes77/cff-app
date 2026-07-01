import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiFetch } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { PlayerCard, FormationSlot } from "../components/player-card";
import type { Player, TeamWithPlayers, TransferWindow } from "@shared/schema";

const BUDGET = 250;
const CLUBS = ["Ajax", "PSV", "Feyenoord", "AZ", "FC Utrecht", "FC Twente"];
const POSITIONS = ["GK", "DEF", "MID", "FWD"];

export default function TeamBuilder() {
  const { id: poolId } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const qc = useQueryClient();

  // Active transfer window
  const { data: transferWindow } = useQuery<TransferWindow | null>({
    queryKey: ["/api/rounds/transfer-window"],
    queryFn: () => apiFetch("/api/rounds/transfer-window"),
  });

  // Current team from server
  const { data: existingTeam } = useQuery<TeamWithPlayers | null>({
    queryKey: ["/api/teams", poolId],
    queryFn: () => apiFetch(`/api/teams/${poolId}`),
  });

  // All players
  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    queryFn: () => apiFetch("/api/players"),
  });

  // Local selection state
  const [starterIds, setStarterIds] = useState<number[]>([]);
  const [subIds, setSubIds] = useState<number[]>([]);
  const [filterClub, setFilterClub] = useState("");
  const [filterPos, setFilterPos] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load existing team on first mount
  useState(() => {
    if (existingTeam) {
      setStarterIds(existingTeam.starters.map((p) => p.id));
      setSubIds(existingTeam.subs.map((p) => p.id));
    }
  });

  const selectedIds = useMemo(() => new Set([...starterIds, ...subIds]), [starterIds, subIds]);

  const selectedPlayers = useMemo(
    () => allPlayers.filter((p) => selectedIds.has(p.id)),
    [allPlayers, selectedIds]
  );

  const totalPrice = useMemo(
    () => selectedPlayers.reduce((s, p) => s + p.price, 0),
    [selectedPlayers]
  );

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
      // Remove
      setStarterIds((ids) => ids.filter((id) => id !== player.id));
      setSubIds((ids) => ids.filter((id) => id !== player.id));
      return;
    }
    // Add: first fill starters (need 11), then subs (need 5)
    if (starterIds.length < 11) {
      setStarterIds((ids) => [...ids, player.id]);
    } else if (subIds.length < 5) {
      setSubIds((ids) => [...ids, player.id]);
    }
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      authFetch("POST", `/api/teams/${poolId}`, { starterIds, subIds }),
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Team samenstellen</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: Formation + selected */}
        <div className="space-y-6">
          {/* Budget bar */}
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Budget</span>
              <span className={`text-sm font-bold ${budgetOk ? "text-primary" : "text-destructive"}`}>
                €{totalPrice.toFixed(1)}M / €{BUDGET}M
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${budgetOk ? "bg-primary" : "bg-destructive"}`}
                style={{ width: `${Math.min((totalPrice / BUDGET) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{starterIds.length}/11 basisspelers · {subIds.length}/5 reserves</span>
              <span>€{(BUDGET - totalPrice).toFixed(1)}M over</span>
            </div>
          </div>

          {/* Formation — simplified 4-3-3 layout */}
          <div className="bg-gradient-to-b from-green-800 to-green-700 rounded-xl p-4">
            <p className="text-center text-white/60 text-xs mb-4 font-medium tracking-widest uppercase">
              Formatie
            </p>

            {/* GK */}
            <div className="flex justify-center mb-4">
              {[starters[0]].map((p, i) => (
                <FormationSlot key={i} player={p} isStarter />
              ))}
            </div>

            {/* DEF row: slots 1-4 */}
            <div className="flex justify-center gap-2 mb-4">
              {starters.slice(1, 5).map((p, i) => (
                <FormationSlot key={i} player={p} isStarter />
              ))}
            </div>

            {/* MID row: slots 5-7 */}
            <div className="flex justify-center gap-2 mb-4">
              {starters.slice(5, 8).map((p, i) => (
                <FormationSlot key={i} player={p} isStarter />
              ))}
            </div>

            {/* FWD row: slots 8-10 */}
            <div className="flex justify-center gap-2">
              {starters.slice(8, 11).map((p, i) => (
                <FormationSlot key={i} player={p} isStarter />
              ))}
            </div>

            {/* Subs */}
            <div className="border-t border-white/20 mt-4 pt-3 text-center text-white/50 text-xs mb-3 tracking-widest uppercase">
              Bank
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {subs.map((p, i) => (
                <FormationSlot key={i} player={p} isStarter={false} />
              ))}
            </div>
          </div>

          {/* Save */}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-primary">Team opgeslagen!</p>}
          {hasExistingTeam && !transferWindow && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Je team is vergrendeld. Transfers zijn alleen mogelijk tijdens een open transferwindow.
            </p>
          )}
          {transferWindow && (
            <p className="text-sm text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              Transferwindow {transferWindow.windowNumber} is open t/m {new Date(transferWindow.endDate).toLocaleDateString("nl-NL")}.
            </p>
          )}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!teamComplete || !budgetOk || saveMutation.isPending || !canSave}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {saveMutation.isPending ? "Opslaan…" : "Team opslaan"}
          </button>
        </div>

        {/* Right: Player picker */}
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-[80vh]">
          <div className="p-3 border-b space-y-2">
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              placeholder="Zoek speler…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded-md px-2 py-1.5 text-xs bg-background"
                value={filterClub}
                onChange={(e) => setFilterClub(e.target.value)}
              >
                <option value="">Alle clubs</option>
                {CLUBS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                className="flex-1 border rounded-md px-2 py-1.5 text-xs bg-background"
                value={filterPos}
                onChange={(e) => setFilterPos(e.target.value)}
              >
                <option value="">Alle posities</option>
                {POSITIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredPlayers.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                selected={selectedIds.has(p.id)}
                isStarter={starterIds.includes(p.id)}
                onToggle={() => togglePlayer(p)}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
