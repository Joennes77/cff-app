import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import type { Round, Player } from "@shared/schema";

export default function AdminPage() {
  const { authFetch, user } = useAuth();
  const qc = useQueryClient();

  // Round management
  const [roundNumber, setRoundNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [makeActive, setMakeActive] = useState(false);
  const [roundMsg, setRoundMsg] = useState("");

  // Stats entry
  const [statsRoundId, setStatsRoundId] = useState<number | "">("");
  const [statsPlayerRows, setStatsPlayerRows] = useState<
    { playerId: number; goals: number; minutesPlayed: number; cleanSheet: boolean; teamResult: "W" | "D" | "L" }[]
  >([]);
  const [statsMsg, setStatsMsg] = useState("");

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ["/api/rounds"],
    queryFn: () => apiFetch("/api/rounds"),
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    queryFn: () => apiFetch("/api/players"),
  });

  const createRound = useMutation({
    mutationFn: () =>
      authFetch("POST", "/api/admin/rounds", {
        roundNumber: parseInt(roundNumber),
        startDate,
        endDate,
        isActive: makeActive,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rounds"] });
      setRoundMsg("Ronde opgeslagen!");
      setTimeout(() => setRoundMsg(""), 2000);
    },
    onError: (e: Error) => setRoundMsg(e.message),
  });

  const activateRound = useMutation({
    mutationFn: (id: number) => authFetch("PATCH", `/api/admin/rounds/${id}/activate`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rounds"] });
    },
  });

  const enterStats = useMutation({
    mutationFn: () =>
      authFetch("POST", "/api/admin/stats", {
        roundId: statsRoundId,
        stats: statsPlayerRows.map((r) => ({
          ...r,
          assists: 0,
        })),
      }),
    onSuccess: () => {
      setStatsMsg("Stats opgeslagen!");
      setTimeout(() => setStatsMsg(""), 2000);
    },
    onError: (e: Error) => setStatsMsg(e.message),
  });

  function addPlayerRow(playerId: number) {
    if (statsPlayerRows.some((r) => r.playerId === playerId)) return;
    setStatsPlayerRows((rows) => [
      ...rows,
      { playerId, goals: 0, minutesPlayed: 90, cleanSheet: false, teamResult: "W" },
    ]);
  }

  function updateRow(
    playerId: number,
    field: "goals" | "minutesPlayed" | "cleanSheet" | "teamResult",
    value: number | boolean | string
  ) {
    setStatsPlayerRows((rows) =>
      rows.map((r) => (r.playerId === playerId ? { ...r, [field]: value } : r))
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Geen beheerderstoegang.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="font-display text-2xl font-bold">Admin</h1>

      {/* Rounds */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Speelronden beheren</h2>

        {/* Existing rounds */}
        {rounds.length > 0 && (
          <table className="w-full text-sm mb-4">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2 font-medium text-muted-foreground">Ronde</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Start</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Einde</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Actief</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rounds.map((r) => (
                <tr key={r.id}>
                  <td className="py-2">{r.roundNumber}</td>
                  <td className="py-2 text-muted-foreground">{r.startDate}</td>
                  <td className="py-2 text-muted-foreground">{r.endDate}</td>
                  <td className="py-2">
                    {r.isActive ? (
                      <span className="text-primary font-semibold">✓</span>
                    ) : (
                      <button
                        onClick={() => activateRound.mutate(r.id)}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        Activeren
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Create round form */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium block mb-1 text-muted-foreground">Rondenummer</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={roundNumber}
              onChange={(e) => setRoundNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1 text-muted-foreground">Startdatum</label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1 text-muted-foreground">Einddatum</label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                className="accent-primary"
              />
              Direct activeren
            </label>
          </div>
        </div>
        {roundMsg && <p className="text-sm text-primary">{roundMsg}</p>}
        <button
          onClick={() => createRound.mutate()}
          disabled={createRound.isPending || !roundNumber || !startDate || !endDate}
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-40"
        >
          {createRound.isPending ? "Opslaan…" : "Ronde opslaan"}
        </button>
      </section>

      {/* Stats entry */}
      <section className="bg-card border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Speeldata invoeren</h2>

        <div>
          <label className="text-xs font-medium block mb-1 text-muted-foreground">Ronde</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={statsRoundId}
            onChange={(e) => setStatsRoundId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">— kies een ronde —</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>Ronde {r.roundNumber}</option>
            ))}
          </select>
        </div>

        {/* Player selector */}
        <div>
          <label className="text-xs font-medium block mb-1 text-muted-foreground">
            Speler toevoegen
          </label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background w-full"
            onChange={(e) => { if (e.target.value) addPlayerRow(Number(e.target.value)); e.target.value = ""; }}
          >
            <option value="">— selecteer een speler —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.club} — {p.position})
              </option>
            ))}
          </select>
        </div>

        {/* Stats rows */}
        {statsPlayerRows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="text-left py-2">Speler</th>
                <th className="py-2">Goals</th>
                <th className="py-2">Min.</th>
                <th className="py-2">Clean</th>
                <th className="py-2">Result</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {statsPlayerRows.map((row) => {
                const player = players.find((p) => p.id === row.playerId);
                return (
                  <tr key={row.playerId}>
                    <td className="py-2 font-medium">{player?.name}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        className="w-14 border rounded px-2 py-1 text-center bg-background"
                        value={row.goals}
                        onChange={(e) => updateRow(row.playerId, "goals", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        className="w-16 border rounded px-2 py-1 text-center bg-background"
                        value={row.minutesPlayed}
                        onChange={(e) => updateRow(row.playerId, "minutesPlayed", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.cleanSheet}
                        onChange={(e) => updateRow(row.playerId, "cleanSheet", e.target.checked)}
                        className="accent-primary"
                      />
                    </td>
                    <td className="py-2">
                      <select
                        className="border rounded px-2 py-1 bg-background text-sm"
                        value={row.teamResult}
                        onChange={(e) => updateRow(row.playerId, "teamResult", e.target.value as "W" | "D" | "L")}
                      >
                        <option value="W">W</option>
                        <option value="D">D</option>
                        <option value="L">L</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => setStatsPlayerRows((r) => r.filter((x) => x.playerId !== row.playerId))}
                        className="text-destructive/60 hover:text-destructive text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {statsMsg && <p className="text-sm text-primary">{statsMsg}</p>}
        <button
          onClick={() => enterStats.mutate()}
          disabled={enterStats.isPending || !statsRoundId || statsPlayerRows.length === 0}
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-40"
        >
          {enterStats.isPending ? "Opslaan…" : "Stats opslaan"}
        </button>
      </section>
    </div>
  );
}
