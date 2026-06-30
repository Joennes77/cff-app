import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">🤷</div>
      <h1 className="font-display text-2xl font-bold mb-2">Pagina niet gevonden</h1>
      <p className="text-muted-foreground text-sm mb-6">
        De pagina die je zoekt bestaat niet of is verplaatst.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Terug naar dashboard
      </Link>
    </div>
  );
}
