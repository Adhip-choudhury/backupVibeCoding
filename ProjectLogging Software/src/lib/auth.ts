export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = "projectlog-users";
const SESSION_KEY = "projectlog-session";

export interface Session {
  userId: string;
  email: string;
  name: string;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(email: string, password: string, name: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const passwordHash = await hashPassword(password);
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return { ok: true };
}

export async function loginUser(email: string, password: string): Promise<{ ok: true; user: Session } | { ok: false; error: string }> {
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) {
    return { ok: false, error: "No account found with this email." };
  }
  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { ok: false, error: "Incorrect password." };
  }
  const session: Session = { userId: user.id, email: user.email, name: user.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, user: session };
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
