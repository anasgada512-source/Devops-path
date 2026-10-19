import { useEffect, useState } from 'react';
import { api } from './api.js';

// Loads data from the API. Re-runs when `path` changes.
export default function useFetch(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    if (!path) return undefined;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => {
      alive = false;
    };
  }, [path]);

  return state;
}
