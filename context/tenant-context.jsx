// Provider de tenant: sincroniza a lista/seleção de restaurantes com a sessão.
// As atualizações de estado no efeito abaixo são intencionais (fetch-on-mount e
// reset ao deslogar), por isso a regra set-state-in-effect é desabilitada aqui.
/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { restaurants as restaurantsApi } from "lib/api";
import { useAuth } from "context/auth-context";

const STORAGE_KEY = "reservas.tenant";
const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [tenant, setTenantState] = useState(null); // slug atual
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = (await restaurantsApi.list()) || [];
      setRestaurants(list);
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      const exists = list.some((r) => r.slug === saved);
      setTenantState(exists ? saved : (list[0]?.slug ?? null));
    } catch (err) {
      setError(err);
      setRestaurants([]);
      setTenantState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setRestaurants([]);
      setTenantState(null);
      setLoading(false);
    }
  }, [user, load]);

  const setTenant = useCallback((slug) => {
    setTenantState(slug);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, slug);
  }, []);

  const current = useMemo(
    () => restaurants.find((r) => r.slug === tenant) ?? null,
    [restaurants, tenant],
  );

  const value = useMemo(
    () => ({
      restaurants,
      tenant,
      current,
      setTenant,
      loading,
      error,
      refetch: load,
    }),
    [restaurants, tenant, current, setTenant, loading, error, load],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx)
    throw new Error("useTenant deve ser usado dentro de <TenantProvider>");
  return ctx;
}
