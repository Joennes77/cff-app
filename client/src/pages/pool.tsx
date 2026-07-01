import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiFetch } from "../lib/queryClient";
import type { Pool, StandingsEntry } from "@shared/schema";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function PoolPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<{ pool: Pool; memberCount: number }>({
    queryKey: ["/api/pools", id],
    queryFn: () => apiFetch(`/api/pools/${id}`),
  });

  const { data: standings = [] } = useQuery<StandingsEntry[]>({
    queryKey: ["/api/pools", id, "standings"],
    queryFn: () => apiFetch(`/api/pools/${id}/standings`),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground text-sm">Laden…</div>;
  if (!data) return <div className="p-8 text-destructive text-sm">Pool niet gevonden.</div>;

  const { pool } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Stadium hero header */}
      <div className="relative rounded-2xl overflow-hidden border border-border/50">
        <div className="pitch-bg absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        {/* Stadium arc lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 140" preserveAspectRatio="none">
          <ellipse cx="350" cy="70" rx="200" ry="120" fill="none" stroke="white" strokeWidth="0.5" opacity="0.06"/>
          <ellipse cx="350" cy="70" rx="140" ry="80" fill="none" stroke="white" strokeWidth="0.5" opacity="0.06"/>
          <line x1="0" y1="70" x2="400" y2="70" stroke="white" strokeWidth="0.4" opacity="0.06"/>
        </svg>
        <div className="relative z-10 px-8 py-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Eredivisie Fantasy</p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wider text-white">{pool.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5">
                <span className="text-xs text-white/50 font-medium">Code</span>
                <span className="font-mono font-bold text-sm tracking-widest text-white">{pool.accessCode}</span>
              </div>
              <span className="text-sm text-white/50">{data.memberCount} deelnemers</span>
            </div>
          </div>
          <Link
            href={`/pools/${id}/team`}
            className="shrink-0 px-5 py-2.5 text-sm rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Mijn team →
          </Link>
        </div>
      </div>

      {/* Standings */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <h2 className="font-display text-2xl tracking-wider">Klassement</h2>
        </div>

        {standings.length === 0 ? (
          <div className="px-5 py-12 text-center text-muted-foreground">
            <div className="text-4xl mb-3">📊</div>
            <p className="font-medium">Nog geen punten gescoord.</p>
            <p className="text-sm mt-1">Punten verschijnen hier zodra een speelronde is afgerond.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {standings.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20 ${
                  idx === 0 ? "bg-gold/5" : ""
                }`}
              >
                {/* Rank */}
                <div className="w-8 shrink-0 text-center">
                  {idx < 3 ? (
                    <span className="text-xl">{MEDALS[idx]}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{entry.rank}</span>
                  )}
                </div>

                {/* Avatar placeholder */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${
                  idx === 0
                    ? "bg-gold/20 border-gold/30 text-gold"
                    : "bg-muted border-border/50 text-muted-foreground"
                }`}>
                  {entry.username?.[0]?.toUpperCase() ?? "?"}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${idx === 0 ? "text-gold" : "text-foreground"}`}>
                    {entry.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.hasTeam ? "Team aangemeld" : "Geen team"}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <p className={`text-xl font-bold ${idx === 0 ? "text-gold" : "text-foreground"}`}>
                    {entry.points}
                  </p>
                  <p className="text-xs text-muted-foreground">punten</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
