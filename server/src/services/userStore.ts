import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface LearningGoals {
  targetLevel: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1 / IELTS'
  primaryGoal: string; // 'Tech & Job Interviews' | 'University Scholarship' | 'IELTS Exam Prep' | 'Business & Executive English' | 'Daily Conversational Fluency'
  focusSkill: string;  // 'Speaking Fluency & Pronunciation' | 'Grammar & Syntax Accuracy' | 'Professional Vocabulary & Collocations' | 'Listening Comprehension'
  personalObjective: string;
}

export type StudentPlan = 'free' | 'essential' | 'pro' | 'executive';

export interface PlanDefaults {
  maxWeeklyClasses: number;
  maxDailySessions: number; // -1 for unlimited
}

export function getPlanDefaults(plan: StudentPlan = 'free'): PlanDefaults {
  switch (plan) {
    case 'essential':
      return { maxWeeklyClasses: 1, maxDailySessions: 10 };
    case 'pro':
      return { maxWeeklyClasses: 2, maxDailySessions: -1 };
    case 'executive':
      return { maxWeeklyClasses: 3, maxDailySessions: -1 };
    case 'free':
    default:
      return { maxWeeklyClasses: 0, maxDailySessions: 5 };
  }
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  country: string;
  authProvider: 'email' | 'google';
  role?: 'student' | 'admin';
  plan?: StudentPlan;
  planUpdatedAt?: string;
  maxWeeklyClasses?: number;
  maxDailySessions?: number;
  dailySessionsUsed?: number;
  lastSessionDate?: string; // YYYY-MM-DD
  profileCompleted?: boolean;
  learningGoals?: LearningGoals;
  cefrLevel?: string;
  lastScore?: number;
  createdAt: string;
}

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'ivan@teacherivan.com').trim().toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'IvanAdmin2026!';

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
    this.seedAdminUser();
  }

  public normalizeEmail(email: string): string {
    return email ? email.trim().toLowerCase() : '';
  }

  private seedAdminUser(): void {
    const normAdminEmail = this.normalizeEmail(ADMIN_EMAIL);
    if (!this.users.has(normAdminEmail)) {
      const todayIso = new Date().toISOString().split('T')[0];
      const adminUser: User = {
        id: 'usr_admin_ivan',
        fullName: 'Teacher Ivan (Admin)',
        email: normAdminEmail,
        phoneNumber: '+591 72878330',
        dateOfBirth: '1990-01-01',
        country: 'Bolivia',
        authProvider: 'email',
        role: 'admin',
        plan: 'executive',
        planUpdatedAt: new Date().toISOString(),
        maxWeeklyClasses: 99,
        maxDailySessions: -1,
        dailySessionsUsed: 0,
        lastSessionDate: todayIso,
        profileCompleted: true,
        learningGoals: {
          targetLevel: 'C1 / IELTS',
          primaryGoal: 'Business & Executive English',
          focusSkill: 'Speaking Fluency & Pronunciation',
          personalObjective: 'Lead international English tutoring & AI immersion',
        },
        cefrLevel: 'C2',
        lastScore: 100,
        createdAt: new Date().toISOString(),
      };
      this.users.set(normAdminEmail, adminUser);
      this.saveToDisk();
    }
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
    phoneNumber?: string;
    dateOfBirth?: string;
    country?: string;
    authProvider?: 'email' | 'google';
    role?: 'student' | 'admin';
    plan?: StudentPlan;
    profileCompleted?: boolean;
    learningGoals?: LearningGoals;
    cefrLevel?: string;
    lastScore?: number;
  }): User {
    const normEmail = this.normalizeEmail(data.email);
    const existing = this.users.get(normEmail);
    const isAdmin = normEmail === this.normalizeEmail(ADMIN_EMAIL) || data.role === 'admin';
    const todayIso = new Date().toISOString().split('T')[0];

    if (existing) {
      const plan = data.plan || existing.plan || (isAdmin ? 'executive' : 'free');
      const planDefaults = getPlanDefaults(plan);
      const updated: User = {
        ...existing,
        fullName: data.fullName ? data.fullName.trim() : existing.fullName,
        phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : (existing.phoneNumber || ''),
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.trim() : existing.dateOfBirth,
        country: data.country ? data.country.trim() : existing.country,
        authProvider: data.authProvider || existing.authProvider,
        role: isAdmin ? 'admin' : (existing.role || 'student'),
        plan,
        maxWeeklyClasses: existing.maxWeeklyClasses !== undefined ? existing.maxWeeklyClasses : (isAdmin ? 99 : planDefaults.maxWeeklyClasses),
        maxDailySessions: existing.maxDailySessions !== undefined ? existing.maxDailySessions : (isAdmin ? -1 : planDefaults.maxDailySessions),
        dailySessionsUsed: existing.dailySessionsUsed !== undefined ? existing.dailySessionsUsed : 0,
        lastSessionDate: existing.lastSessionDate || todayIso,
        profileCompleted: data.profileCompleted !== undefined ? data.profileCompleted : existing.profileCompleted,
        learningGoals: data.learningGoals || existing.learningGoals,
        cefrLevel: data.cefrLevel !== undefined ? data.cefrLevel : existing.cefrLevel,
        lastScore: data.lastScore !== undefined ? data.lastScore : existing.lastScore,
      };
      this.users.set(normEmail, updated);
      this.saveToDisk();
      return updated;
    }

    const userPlan: StudentPlan = isAdmin ? 'executive' : (data.plan || 'free');
    const planDefaults = getPlanDefaults(userPlan);

    const newUser: User = {
      id: isAdmin ? 'usr_admin_ivan' : `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      fullName: data.fullName ? data.fullName.trim() : (isAdmin ? 'Teacher Ivan (Admin)' : 'Student'),
      email: normEmail,
      phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : '',
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.trim() : '',
      country: data.country ? data.country.trim() : '',
      authProvider: data.authProvider || 'email',
      role: isAdmin ? 'admin' : 'student',
      plan: userPlan,
      planUpdatedAt: new Date().toISOString(),
      maxWeeklyClasses: isAdmin ? 99 : planDefaults.maxWeeklyClasses,
      maxDailySessions: isAdmin ? -1 : planDefaults.maxDailySessions,
      dailySessionsUsed: 0,
      lastSessionDate: todayIso,
      profileCompleted: isAdmin ? true : (data.profileCompleted || false),
      learningGoals: data.learningGoals,
      cefrLevel: data.cefrLevel,
      lastScore: data.lastScore,
      createdAt: new Date().toISOString(),
    };

    this.users.set(normEmail, newUser);
    this.saveToDisk();
    return newUser;
  }

  public updateUserPlan(userIdOrEmail: string, newPlan: StudentPlan): User | null {
    let user: User | undefined = this.findById(userIdOrEmail);
    if (!user) {
      user = this.findByEmail(userIdOrEmail);
    }
    if (!user) return null;

    const planDefaults = getPlanDefaults(newPlan);
    const normEmail = this.normalizeEmail(user.email);
    const updated: User = {
      ...user,
      plan: newPlan,
      planUpdatedAt: new Date().toISOString(),
      maxWeeklyClasses: user.role === 'admin' ? 99 : planDefaults.maxWeeklyClasses,
      maxDailySessions: user.role === 'admin' ? -1 : planDefaults.maxDailySessions,
    };

    this.users.set(normEmail, updated);
    this.saveToDisk();
    return updated;
  }

  public getDailyQuota(userIdOrEmail: string): { used: number; max: number; plan: StudentPlan } {
    let user: User | undefined = this.findById(userIdOrEmail);
    if (!user) {
      user = this.findByEmail(userIdOrEmail);
    }
    if (!user) {
      return { used: 0, max: 5, plan: 'free' };
    }

    const todayIso = new Date().toISOString().split('T')[0];
    const plan = user.plan || (user.role === 'admin' ? 'executive' : 'free');
    const defaults = getPlanDefaults(plan);
    const max = user.role === 'admin' ? -1 : (user.maxDailySessions !== undefined ? user.maxDailySessions : defaults.maxDailySessions);

    if (user.lastSessionDate !== todayIso) {
      user.dailySessionsUsed = 0;
      user.lastSessionDate = todayIso;
      this.saveToDisk();
    }

    return {
      used: user.dailySessionsUsed || 0,
      max,
      plan,
    };
  }

  public checkAndIncrementDailyQuota(userIdOrEmail: string): {
    allowed: boolean;
    reason?: string;
    quota: { used: number; max: number; plan: StudentPlan };
  } {
    let user: User | undefined = this.findById(userIdOrEmail);
    if (!user) {
      user = this.findByEmail(userIdOrEmail);
    }

    if (!user) {
      // Unregistered guest fallback: allowed with 5 max
      return {
        allowed: true,
        quota: { used: 1, max: 5, plan: 'free' },
      };
    }

    const todayIso = new Date().toISOString().split('T')[0];
    const plan = user.plan || (user.role === 'admin' ? 'executive' : 'free');
    const defaults = getPlanDefaults(plan);
    const max = user.role === 'admin' ? -1 : (user.maxDailySessions !== undefined ? user.maxDailySessions : defaults.maxDailySessions);

    if (user.lastSessionDate !== todayIso) {
      user.dailySessionsUsed = 0;
      user.lastSessionDate = todayIso;
    }

    const currentUsed = user.dailySessionsUsed || 0;

    // max === -1 means unlimited
    if (max !== -1 && currentUsed >= max) {
      return {
        allowed: false,
        reason: `Has alcanzado tu límite diario de ${max} sesiones con tu plan ${plan.toUpperCase()}.`,
        quota: { used: currentUsed, max, plan },
      };
    }

    user.dailySessionsUsed = currentUsed + 1;
    this.saveToDisk();

    return {
      allowed: true,
      quota: { used: user.dailySessionsUsed, max, plan },
    };
  }

  public updateUserProfile(
    identifier: { id?: string; email?: string },
    updates: {
      learningGoals?: LearningGoals;
      cefrLevel?: string;
      fullName?: string;
      phoneNumber?: string;
      country?: string;
      dateOfBirth?: string;
      profileCompleted?: boolean;
    }
  ): User | null {
    let user: User | undefined;
    if (identifier.email) {
      user = this.findByEmail(identifier.email);
    } else if (identifier.id) {
      user = this.findById(identifier.id);
    }

    if (!user) return null;

    const normEmail = this.normalizeEmail(user.email);
    const updated: User = {
      ...user,
      fullName: updates.fullName ? updates.fullName.trim() : user.fullName,
      phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber.trim() : user.phoneNumber,
      country: updates.country ? updates.country.trim() : user.country,
      dateOfBirth: updates.dateOfBirth ? updates.dateOfBirth.trim() : user.dateOfBirth,
      learningGoals: updates.learningGoals || user.learningGoals,
      cefrLevel: updates.cefrLevel !== undefined ? updates.cefrLevel : user.cefrLevel,
      profileCompleted: updates.profileCompleted !== undefined ? updates.profileCompleted : true,
    };

    this.users.set(normEmail, updated);
    this.saveToDisk();
    return updated;
  }

  public createSessionToken(userId: string, role: 'student' | 'admin' = 'student'): string {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    return Buffer.from(`${userId}:${role}:${timestamp}:${nonce}`).toString('base64');
  }

  public verifyAdminCredentials(email: string, password?: string): boolean {
    if (!password) return false;
    const normEmail = this.normalizeEmail(email);
    const normAdmin = this.normalizeEmail(ADMIN_EMAIL);
    return normEmail === normAdmin && password === ADMIN_PASSWORD;
  }
}

export const userStore = new UserStore();
