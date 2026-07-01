import { createContext, useContext, type ReactNode } from "react";
import { CLUB_LOGOS } from "./clubs";

const ClubLogosContext = createContext(CLUB_LOGOS);

export function ClubLogosProvider({ children }: { children: ReactNode }) {
  return (
    <ClubLogosContext.Provider value={CLUB_LOGOS}>
      {children}
    </ClubLogosContext.Provider>
  );
}

export function useClubLogos() {
  return useContext(ClubLogosContext);
}
