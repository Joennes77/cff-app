import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./lib/auth";
import AuthPage from "./pages/auth";
import Dashboard from "./pages/dashboard";
import PoolPage from "./pages/pool";
import TeamBuilder from "./pages/team-builder";
import PlayersPage from "./pages/players";
import RoundPage from "./pages/round";
import AdminPage from "./pages/admin";
import NotFound from "./pages/not-found";
import Navbar from "./components/navbar";

function AppRouter() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/pools/:id" component={PoolPage} />
          <Route path="/pools/:id/team" component={TeamBuilder} />
          <Route path="/players" component={PlayersPage} />
          <Route path="/rounds/active" component={RoundPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function Shell() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <AuthPage />;
  return <AppRouter />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </QueryClientProvider>
  );
}
