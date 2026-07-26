// Hook de leitura de dados com loading/erro e refetch. As atualizações de estado
// dentro do efeito são intencionais (padrão de data-fetching): sinalizam início do
// request e recebem o resultado/erro de forma assíncrona.
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";

// `deps` dispara nova busca ao mudar (ex.: slug do tenant). Requests obsoletos
// (troca de deps, desmontagem) são ignorados por comparação de id.
export function useQuery(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);

  const fetcherRef = useRef(fetcher);
  const reqId = useRef(0);
  const [tick, setTick] = useState(0);

  // Mantém a referência do fetcher atual sem re-disparar o efeito de busca.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    const id = ++reqId.current;
    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((res) => {
        if (id === reqId.current) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (id === reqId.current) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      reqId.current++;
    };
  }, [enabled, tick, ...deps]);

  // `loading` (estado) só é atualizado pelo efeito acima, que roda um tick depois
  // do render em que `enabled` vira `true` (ex.: router.query populado após a
  // hidratação). Nesse frame intermediário `loading` ainda reflete o valor antigo
  // mesmo com a busca prestes a começar — derivar aqui evita expor `loading=false`
  // com `data=null` para o consumidor.
  const effectiveLoading =
    enabled && (loading || (data === null && error === null));

  return { data, error, loading: effectiveLoading, refetch };
}
