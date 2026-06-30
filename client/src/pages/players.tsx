import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/queryClient";
import { PlayerCard } from "../components/player-card";
import type { Player } from "@shared/schema";

const CLUBS = ["Ajax", "PSV", "Feyenoord", "AZ", "FC Utrecht", "FC Twente"];
const POSITIONS = ["GK", "DEF", "MID", "FWD"];

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-display text-2xl font-bold">Spelersbrowser</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="border rounded-md px-3 py-2 text-sm bg-background w-48"
          placeholder="Zoek speler…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={club}
          onChange={(e) => setClub(e.target.value)}
        >
          <option value="">Alle clubs</option>
          {CLUBS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          <option value="">Alle posities</option>
          {POSITIONS.map((p) => <option key={p}>{p}</option>)}
        </select>
        {(club || position || search) && (
          <button
            onClick={() => { setClub(""); setPosition(""); setSearch(""); }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Wis filters
          </button>
        )}
      </div>

      {/* Stats bar */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Laden…" : `${players.length} spelers gevonden`}
      </p>

      {/* Grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>
    </div>
  );
}
