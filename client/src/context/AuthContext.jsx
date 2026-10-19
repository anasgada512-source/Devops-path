import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(!!getToken());

  // Restore session on page load
  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => {
        setUser(d.user);
        setCompleted(d.completed);
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    setToken(d.token);
    setUser(d.user);
    const me = await api('/auth/me');
    setCompleted(me.completed);
    return d.user;
  }, []);

  const login = useCallback((email, password) => authenticate('/auth/login', { email, password }), [authenticate]);
  const register = useCallback(
    (name, email, password) => authenticate('/auth/register', { name, email, password }),
    [authenticate]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setCompleted([]);
  }, []);

  const isDone = useCallback(
    (topic, lesson) => completed.some((c) => c.topic === topic && c.lesson === lesson),
    [completed]
  );

  const setLessonDone = useCallback(async (topic, lesson, done) => {
    const list = await api('/progress', { method: 'POST', body: { topic, lesson, done } });
    setCompleted(list);
  }, []);

  const value = useMemo(
    () => ({ user, loading, completed, login, register, logout, isDone, setLessonDone }),
    [user, loading, completed, login, register, logout, isDone, setLessonDone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
