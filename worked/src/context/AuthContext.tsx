import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthContextType {
  userId: string | null;
  userEmail: string | null;
  isLoggedIn: boolean;
  login: (userId: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('auth_user_id');
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('auth_user_email');
  });

  const login = useCallback((userId: string, email: string) => {
    localStorage.setItem('auth_user_id', userId);
    localStorage.setItem('auth_user_email', email);
    setUserId(userId);
    setUserEmail(email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_user_email');
    setUserId(null);
    setUserEmail(null);
  }, []);

  const isLoggedIn = userId !== null;

  return (
    <AuthContext.Provider value={{ userId, userEmail, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
