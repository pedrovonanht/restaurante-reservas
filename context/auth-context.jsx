import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const me = await auth.me();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carrega o usuário atual na montagem (data-fetching; estado atualizado após o fetch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const login = useCallback(async (email, password) => {
    await auth.login(email, password);
    const me = await auth.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    await auth.register({ username, email, password });
    // O registro já emite o cookie de sessão; logamos por garantia.
    await auth.login(email, password);
    const me = await auth.me();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
