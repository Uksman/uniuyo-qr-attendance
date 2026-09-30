import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  login as loginRequest,
  storeSession,
  type User,
} from "./api";

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  setSessionState: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      login: async (email, password) => {
        const result = await loginRequest(email, password);
        storeSession(result.token, result.user);
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      setSessionState: (token: string, user: User) => {
        storeSession(token, user);
        setToken(token);
        setUser(user);
      },
      logout: () => {
        clearSession();
        setToken(null);
        setUser(null);
      },
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
