/**
 * Account + storage backend.
 *
 * `LocalBackend` keeps accounts and creations in this browser (IndexedDB), with passwords
 * hashed using PBKDF2-SHA256. Nothing leaves the device.
 *
 * To move to a real server (e.g. ASP.NET Web API + SQL Server), implement the same `Backend`
 * interface with fetch() calls and swap the export at the bottom of this file. The UI only
 * talks to this interface.
 */
import type { Design } from '../store';

export interface User { id: string; name: string; email: string; created: number }
export interface SavedCreation {
  id: string; userId: string; date: number;
  theme: string; filter: string; layout: string;
  url: string; backUrl?: string; thumb: string;
  design?: Design; shots?: { id: string; data: string }[];
}
export interface Backend {
  readonly kind: 'device' | 'cloud';
  me(): Promise<User | null>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  listCreations(userId: string): Promise<SavedCreation[]>;
  saveCreation(c: SavedCreation): Promise<void>;
  deleteCreation(id: string): Promise<void>;
  deleteAccount(userId: string): Promise<void>;
  usage(userId: string): Promise<number>;
}

/* ---------------- tiny IndexedDB helper ---------------- */
const DB_NAME = 'snap-and-stick', DB_VER = 1;
let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('users')) d.createObjectStore('users', { keyPath: 'id' }).createIndex('email', 'email', { unique: true });
      if (!d.objectStoreNames.contains('creations')) d.createObjectStore('creations', { keyPath: 'id' }).createIndex('userId', 'userId');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
function req<T>(r: IDBRequest<T>): Promise<T> { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function store(name: string, mode: IDBTransactionMode = 'readonly') { return (await db()).transaction(name, mode).objectStore(name); }

/* ---------------- password hashing ---------------- */
const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
async function hash(password: string, saltHex: string) {
  const salt = new Uint8Array(saltHex.match(/../g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256));
}
const rid = () => hex(crypto.getRandomValues(new Uint8Array(12)).buffer);
const SESSION = 'snapstick.session';

interface UserRow extends User { salt: string; hash: string }
const pub = (u: UserRow): User => ({ id: u.id, name: u.name, email: u.email, created: u.created });

class LocalBackend implements Backend {
  readonly kind = 'device' as const;
  async me() {
    let id: string | null = null;
    try { id = localStorage.getItem(SESSION); } catch { /* storage blocked */ }
    if (!id) return null;
    const u = await req((await store('users')).get(id)) as UserRow | undefined;
    return u ? pub(u) : null;
  }
  async signUp(name: string, email: string, password: string) {
    email = email.trim().toLowerCase(); name = name.trim();
    if (!name) throw new Error('Please tell us your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('That email doesn’t look right.');
    if (password.length < 6) throw new Error('Use at least 6 characters for your password.');
    const existing = await req((await store('users')).index('email').get(email));
    if (existing) throw new Error('An account with this email already exists — try signing in.');
    const salt = rid() + rid();
    const row: UserRow = { id: rid(), name, email, created: Date.now(), salt, hash: await hash(password, salt) };
    await req((await store('users', 'readwrite')).add(row));
    try { localStorage.setItem(SESSION, row.id); } catch { /* ignore */ }
    return pub(row);
  }
  async signIn(email: string, password: string) {
    email = email.trim().toLowerCase();
    const u = await req((await store('users')).index('email').get(email)) as UserRow | undefined;
    if (!u || (await hash(password, u.salt)) !== u.hash) throw new Error('Email or password is incorrect.');
    try { localStorage.setItem(SESSION, u.id); } catch { /* ignore */ }
    return pub(u);
  }
  async signOut() { try { localStorage.removeItem(SESSION); } catch { /* ignore */ } }
  async listCreations(userId: string) {
    const all = await req((await store('creations')).index('userId').getAll(userId)) as SavedCreation[];
    return all.sort((a, b) => b.date - a.date);
  }
  async saveCreation(c: SavedCreation) { await req((await store('creations', 'readwrite')).put(c)); }
  async deleteCreation(id: string) { await req((await store('creations', 'readwrite')).delete(id)); }
  async deleteAccount(userId: string) {
    const list = await this.listCreations(userId);
    const cs = await store('creations', 'readwrite');
    await Promise.all(list.map((c) => req(cs.delete(c.id))));
    await req((await store('users', 'readwrite')).delete(userId));
    await this.signOut();
  }
  async usage(userId: string) {
    const list = await this.listCreations(userId);
    return list.reduce((n, c) => n + c.url.length + (c.backUrl?.length ?? 0) + c.thumb.length + (c.shots ?? []).reduce((m, s) => m + s.data.length, 0), 0) * .75;
  }
}

export const backend: Backend = new LocalBackend();
