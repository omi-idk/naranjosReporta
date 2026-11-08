"use client";
import { createContext, useContext, useState } from "react";
type Session = {
  token: string | null;
  setToken: (token: string | null) => void;
};
const Context = createContext<Session>({ token: null, setToken: () => {} });
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  return (
    <Context.Provider value={{ token, setToken }}>{children}</Context.Provider>
  );
}
export const useSession = () => useContext(Context);
