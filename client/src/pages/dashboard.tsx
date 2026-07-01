import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiFetch } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import type { Pool } from "@shared/schema";

export default function Dashboard() {
  const { authFetch, user } = useAuth();
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
    mutationFn: (name: string) => authFetch("POST", "/api/pools", { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pools"] });
      setShowCreate(false);
      setPoolName("");
      setError("");
    },
    onError: (e: Error) => setError(e.message),
  });

  const joinPool = useMutation({
    mutationFn: (code: string) => authFetch("POST", "/api/pools/join", { accessCode: code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pools"] });
      setShowJoin(false);
      setAccessCode("");
      setError("");
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden border border-border/50">
        <div className="pitch-bg absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        <div className="relative z-10 px-8 py-10">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Seizoen 2026/27</p>
          <h1 className="font-display text-5xl sm:text-6xl tracking-wider text-white mb-2">
            Welkom,<br />{user?.username}
          </h1>
          <p className="text-muted-foreground text-sm">Eredivisie fantasy football</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl tracking-wider text-foreground">Mijn Pools</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); setError(""); }}
            className="px-4 py-2 text-sm rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-medium"
          >
            Pool joinen
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); setError(""); }}
            className="px-4 py-2 text-sm rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            + Nieuwe pool
          </button>
        </div>
      </div>

      {/* Create / Join form */}
      {(showCreate || showJoin) && (
        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-sm text-foreground">
            {showCreate ? "Nieuwe pool aanmaken" : "Pool joinen met code"}
          </h3>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {showCreate ? (
            <form onSubmit={(e) => { e.preventDefault(); createPool.mutate(poolName); }} className="flex gap-2">
              <input
                className="flex-1 border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Naam van je pool"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={createPool.isPending}
                className="px-4 py-2.5 text-sm rounded-xl bg-primary text-black font-bold disabled:opacity-50"
              >
                {createPool.isPending ? "…" : "Aanmaken"}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); joinPool.mutate(accessCode); }} className="flex gap-2">
              <input
                className="flex-1 border border-input rounded-xl px-3 py-2.5 text-sm bg-background uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Toegangscode (bijv. A1B2C3)"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={joinPool.isPending}
                className="px-4 py-2.5 text-sm rounded-xl bg-primary text-black font-bold disabled:opacity-50"
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
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-2xl">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="font-display text-2xl tracking-wider text-foreground mb-2">Geen pools gevonden</p>
          <p className="text-sm">Maak een pool aan of join er één met een toegangscode.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <Link key={pool.id} href={`/pools/${pool.id}`}>
              <div className="group bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                    {pool.accessCode}
                  </span>
                </div>
                <h3 className="font-display text-xl tracking-wider text-foreground group-hover:text-primary transition-colors">
                  {pool.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Aangemaakt {new Date(pool.createdAt).toLocaleDateString("nl-NL")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
