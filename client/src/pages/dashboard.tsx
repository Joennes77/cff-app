import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiFetch } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import type { Pool } from "@shared/schema";

export default function Dashboard() {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [poolName, setPoolName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");

  const { data: pools = [], isLoading } = useQuery<Pool[]>({
    queryKey: ["/api/pools"],
    queryFn: () => apiFetch("/api/pools"),
  });

  const createPool = useMutation({
    mutationFn: (name: string) =>
      authFetch("POST", "/api/pools", { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pools"] });
      setShowCreate(false);
      setPoolName("");
      setError("");
    },
    onError: (e: Error) => setError(e.message),
  });

  const joinPool = useMutation({
    mutationFn: (code: string) =>
      authFetch("POST", "/api/pools/join", { accessCode: code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pools"] });
      setShowJoin(false);
      setAccessCode("");
      setError("");
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Mijn pools</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); setError(""); }}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
          >
            Pool joinen
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); setError(""); }}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Pool aanmaken
          </button>
        </div>
      </div>

      {/* Create / Join form */}
      {(showCreate || showJoin) && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-sm">
            {showCreate ? "Nieuwe pool aanmaken" : "Pool joinen"}
          </h2>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {showCreate ? (
            <form
              onSubmit={(e) => { e.preventDefault(); createPool.mutate(poolName); }}
              className="flex gap-2"
            >
              <input
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="Poolnaam"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={createPool.isPending}
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                {createPool.isPending ? "…" : "Aanmaken"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); joinPool.mutate(accessCode); }}
              className="flex gap-2"
            >
              <input
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-background uppercase"
                placeholder="Toegangscode (bijv. A1B2C3)"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={joinPool.isPending}
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                {joinPool.isPending ? "…" : "Joinen"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Pools grid */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Laden…</p>
      ) : pools.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🏟️</div>
          <p className="font-medium">Je hebt nog geen pools.</p>
          <p className="text-sm mt-1">Maak een pool aan of join er één met een toegangscode.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <Link key={pool.id} href={`/pools/${pool.id}`}>
              <div className="bg-card border rounded-xl p-4 hover:shadow-md hover:border-primary transition-all cursor-pointer">
                <h3 className="font-semibold">{pool.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{pool.accessCode}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  Aangemaakt {new Date(pool.createdAt).toLocaleDateString("nl-NL")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
