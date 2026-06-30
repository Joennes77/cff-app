import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import type { Round, Player, RoundPrediction, Pool } from "@shared/schema";

export default function RoundPage() {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [topscorerId, setTopscorerId] = useState<number | "">("");
  const [goalscorerIds, setGoalscorerIds] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { data: round } = useQuery<Round | null>({
    queryKey: ["/api/rounds/active"],
    queryFn: () => apiFetch("/api/rounds/active"),
  });

  const { data: pools = [] } = useQuery<Pool[]>({
    queryKey: ["/api/pools"],
    queryFn: () => apiFetch("/api/pools"),
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    queryFn: () => apiFetch("/api/players"),
  });

  const { data: existingPrediction } = useQuery<RoundPrediction | null>({
    queryKey: ["/api/rounds", round?.id, "predictions", selectedPoolId],
    queryFn: () =>
      round && selectedPoolId
        ? apiFetch(`/api/rounds/${round.id}/predictions/${selectedPoolId}`)
        : null,
    enabled: !!round && !!selectedPoolId,
  });

  const savePrediction = useMutation({
    mutationFn: () =>
      authFetch("POST", `/api/rounds/${round!.id}/predictions`, {
        poolId: selectedPoolId,
        predictedTopscorerId: topscorerId || null,
        predictedGoalscorerIds: goalscorerIds,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rounds"] });
      setSaved(true);
      setError("");
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e: Error) => setError(e.message),
  });

  function toggleGoalscorer(id: number) {
    setGoalscorerIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  if (!round) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">⏳</div>
        <h1 className="font-display text-xl font-bold">Geen actieve speelronde</h1>
        <p className="text-muted-foreground text-sm mt-2">Er is momenteel geen actieve ronde. Kom later terug.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Speelronde {round.roundNumber}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(round.startDate).toLocaleDateString("nl-NL")} –{" "}
          {new Date(round.endDate).toLocaleDateString("nl-NL")}
        </p>
      </div>

      {/* Pool selector */}
      <div>
        <label className="text-sm font-medium block mb-1">Kies je pool</label>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background w-full"
          value={selectedPoolId ?? ""}
          onChange={(e) => setSelectedPoolId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— kies een pool —</option>
          {pools.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedPoolId && (
        <div className="space-y-6">
          {/* Topscorer prediction */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Topscorer van de ronde (+5 pt)</h2>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background w-full"
              value={topscorerId}
              onChange={(e) => setTopscorerId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">— kies een speler —</option>
              {players
                .filter((p) => p.position !== "GK")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.club})
                  </option>
                ))}
            </select>
          </div>

          {/* Goalscorer predictions */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Doelpuntenmakers (+2 pt per correcte gok)</h2>
            <p className="text-xs text-muted-foreground">Selecteer alle spelers van wie jij denkt dat ze scoren.</p>
            <div className="grid gap-1.5 sm:grid-cols-2 max-h-64 overflow-y-auto">
              {players
                .filter((p) => p.position !== "GK")
                .map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 cursor-pointer rounded-md px-3 py-2 border text-sm transition-colors ${
                      goalscorerIds.includes(p.id)
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={goalscorerIds.includes(p.id)}
                      onChange={() => toggleGoalscorer(p.id)}
                    />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-muted-foreground text-xs">{p.club}</span>
                  </label>
                ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-primary">Voorspelling opgeslagen!</p>}

          <button
            onClick={() => savePrediction.mutate()}
            disabled={savePrediction.isPending}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {savePrediction.isPending ? "Opslaan…" : "Voorspelling opslaan"}
          </button>
        </div>
      )}
    </div>
  );
}
