import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface StoredUser {
  id: string;
  username: string;
  password: string;
  passkeyCredentialId?: string;
}

interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  signup: (username: string, password: string) => Promise<string | null>;
  loginWithPasskey: () => Promise<string | null>;
  registerPasskey: (username: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem('sf_users') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem('sf_users', JSON.stringify(users));
}

function generateId(): string {
  return crypto.randomUUID();
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function decodeCredentialId(credential: PublicKeyCredential): string {
  const rawId = credential.rawId;
  return btoa(String.fromCharCode(...new Uint8Array(rawId)));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sf_session');
    if (stored) {
      try {
        const users = getUsers();
        const found = users.find(u => u.id === stored);
        if (found) setUser(found);
      } catch {
        localStorage.removeItem('sf_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === hashPassword(password));
    if (!found) return 'Invalid username or password';
    setUser(found);
    localStorage.setItem('sf_session', found.id);
    return null;
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<string | null> => {
    const users = getUsers();
    if (users.find(u => u.username === username)) return 'Username already exists';
    const newUser: StoredUser = {
      id: generateId(),
      username,
      password: hashPassword(password),
    };
    saveUsers([...users, newUser]);
    setUser(newUser);
    localStorage.setItem('sf_session', newUser.id);
    return null;
  }, []);

  const registerPasskey = useCallback(async (username: string): Promise<string | null> => {
    if (!window.PublicKeyCredential) return 'Passkeys not supported in this browser';

    try {
      const users = getUsers();
      const existing = users.find(u => u.username === username);
      if (existing && existing.passkeyCredentialId) return 'Passkey already registered for this user';

      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const creationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: 'ShopFloor', id: window.location.hostname },
        user: {
          id: userId,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: creationOptions,
      }) as PublicKeyCredential | null;

      if (!credential) return 'Passkey creation cancelled';

      const credentialId = decodeCredentialId(credential);
      let updatedUsers = [...users];
      const idx = updatedUsers.findIndex(u => u.username === username);

      if (idx >= 0) {
        updatedUsers[idx] = { ...updatedUsers[idx], passkeyCredentialId: credentialId };
      } else {
        updatedUsers.push({
          id: generateId(),
          username,
          password: '',
          passkeyCredentialId: credentialId,
        });
      }

      saveUsers(updatedUsers);
      const loggedInUser = updatedUsers.find(u =>
        u.username === username || (idx >= 0 && u.id === updatedUsers[idx].id)
      );
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('sf_session', loggedInUser.id);
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Passkey registration failed';
      return msg;
    }
  }, []);

  const loginWithPasskey = useCallback(async (): Promise<string | null> => {
    if (!window.PublicKeyCredential) return 'Passkeys not supported in this browser';

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const requestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: 'required',
      };

      const credential = await navigator.credentials.get({
        publicKey: requestOptions,
      }) as PublicKeyCredential | null;

      if (!credential) return 'Passkey authentication cancelled';

      const credentialId = decodeCredentialId(credential);
      const users = getUsers();
      const found = users.find(u => u.passkeyCredentialId === credentialId);

      if (!found) return 'No user found for this passkey';

      setUser(found);
      localStorage.setItem('sf_session', found.id);
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Passkey authentication failed';
      return msg;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sf_session');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      loginWithPasskey,
      registerPasskey,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
