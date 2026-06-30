import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiFetch } from "../lib/queryClient";
import type { Pool, StandingsEntry } from "@shared/schema";

export default function PoolPage() {
  const { id } = useParams<{ id: string }>();
  const poolId = parseInt(id);

  const { data, isLoading } = useQuery<{ pool: Pool; memberCount: number }>({
    queryKey: ["/api/pools", id],
    queryFn: () => apiFetch(`/api/pools/${id}`),
  });

  const { data: standings = [] } = useQuery<StandingsEntry[]>({
    queryKey: ["/api/pools", id, "standings"],
    queryFn: () => apiFetch(`/api/pools/${id}/standings`),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Laden…</div>;
  if (!data) return <div className="p-8 text-destructive">Pool niet gevonden.</div>;

  const { pool } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{pool.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Code: <span className="font-mono font-semibold">{pool.accessCode}</span>
            {" · "}{data.memberCount} deelnemers
          </p>
        </div>
        <Link
          href={`/pools/${id}/team`}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Mijn team
        </Link>
      </div>

      {/* Standings */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Klassement</h2>
        </div>
        {standings.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nog geen punten gescoord.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground w-10">#</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Speler</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Team</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Punten</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {standings.map((entry) => (
                <tr key={entry.userId} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 text-muted-foreground">{entry.rank}</td>
                  <td className="px-4 py-2.5 font-medium">{entry.username}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {entry.hasTeam ? "✓" : <span className="text-destructive/70">Geen team</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
