import { useState, createContext, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const ADMIN_PASSWORD = '1234';

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem('rd_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const login = useCallback((password: string) => {
    const normalizedPassword = password.trim();

    if (normalizedPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try { sessionStorage.setItem('rd_admin_auth', 'true'); } catch { /* */ }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    try { sessionStorage.removeItem('rd_admin_auth'); } catch { /* */ }
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
