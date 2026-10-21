import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  country: string;
  authProvider: 'email' | 'google';
  cefrLevel?: string;
  lastScore?: number;
  createdAt: string;
}

export class UserStore {
  private dataFilePath: string;
  private users: Map<string, User> = new Map(); // key = normalized email
  private isLoaded: boolean = false;

  constructor(customPath?: string) {
    if (customPath) {
      this.dataFilePath = customPath;
    } else {
      const dataDir = path.resolve(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.dataFilePath = path.join(dataDir, 'users.json');
    }
    this.loadFromDisk();
  }

  private normalizeEmail(email: string): string {
    return email ? email.trim().toLowerCase() : '';
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        if (raw.trim()) {
          const list: User[] = JSON.parse(raw);
          this.users.clear();
          for (const u of list) {
            if (u && u.email) {
              this.users.set(this.normalizeEmail(u.email), u);
            }
          }
        }
      } else {
        // Initialize empty file
        this.saveToDisk();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('[UserStore] Error loading users from disk:', err);
      this.users = new Map();
      this.isLoaded = true;
    }
  }

  public saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.users.values());
      fs.writeFileSync(this.dataFilePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[UserStore] Error writing users to disk:', err);
    }
  }

  public findByEmail(email: string): User | undefined {
    return this.users.get(this.normalizeEmail(email));
  }

  public findById(id: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return undefined;
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public upsertUser(data: {
    fullName: string;
    email: string;
    dateOfBirth?: string;
    country?: string;
    authProvider?: 'email' | 'google';
    cefrLevel?: string;
    lastScore?: number;
  }): User {
    const normEmail = this.normalizeEmail(data.email);
    const existing = this.users.get(normEmail);

    if (existing) {
      const updated: User = {
        ...existing,
        fullName: data.fullName ? data.fullName.trim() : existing.fullName,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.trim() : existing.dateOfBirth,
        country: data.country ? data.country.trim() : existing.country,
        authProvider: data.authProvider || existing.authProvider,
        cefrLevel: data.cefrLevel !== undefined ? data.cefrLevel : existing.cefrLevel,
        lastScore: data.lastScore !== undefined ? data.lastScore : existing.lastScore,
      };
      this.users.set(normEmail, updated);
      this.saveToDisk();
      return updated;
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      fullName: data.fullName ? data.fullName.trim() : 'Student',
      email: normEmail,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.trim() : '',
      country: data.country ? data.country.trim() : '',
      authProvider: data.authProvider || 'email',
      cefrLevel: data.cefrLevel,
      lastScore: data.lastScore,
      createdAt: new Date().toISOString(),
    };

    this.users.set(normEmail, newUser);
    this.saveToDisk();
    return newUser;
  }

  public createSessionToken(userId: string): string {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    return Buffer.from(`${userId}:${timestamp}:${nonce}`).toString('base64');
  }
}

export const userStore = new UserStore();
