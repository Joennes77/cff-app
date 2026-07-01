import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "./queryClient";

type LogoMap = Record<string, string>;

const ClubLogosContext = createContext<LogoMap>({});

export function ClubLogosProvider({ children }: { children: ReactNode }) {
  const [logos, setLogos] = useState<LogoMap>({});

  useEffect(() => {
    apiFetch("/api/club-logos")
      .then((data: LogoMap) => setLogos(data))
      .catch(() => { /* logos stay empty — components show initials */ });
  }, []);

  return (
    <ClubLogosContext.Provider value={logos}>
      {children}
    </ClubLogosContext.Provider>
  );
}

export function useClubLogos(): LogoMap {
  return useContext(ClubLogosContext);
}
