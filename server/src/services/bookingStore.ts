import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { userStore } from './userStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type BookingStartTime = '14:00' | '15:00' | '16:00' | '17:00' | '18:00' | '19:00';
export type BookingEndTime = '15:00' | '16:00' | '17:00' | '18:00' | '19:00' | '20:00';

export const VALID_SLOTS: { start: BookingStartTime; end: BookingEndTime }[] = [
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
  { start: '19:00', end: '20:00' },
];

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCountry: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: BookingStartTime;
  endTime: BookingEndTime;
  learningGoal: string;
  createdAt: string;
}

export class BookingStore {
  private dataFilePath: string;
  private bookings: Map<string, Booking> = new Map(); // key = id

  constructor(customPath?: string) {
    if (customPath) {
      this.dataFilePath = customPath;
    } else {
      const dataDir = path.resolve(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.dataFilePath = path.join(dataDir, 'bookings.json');
    }
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        if (raw.trim()) {
          const list: Booking[] = JSON.parse(raw);
          this.bookings.clear();
          for (const b of list) {
            if (b && b.id) {
              this.bookings.set(b.id, b);
            }
          }
        }
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.error('[BookingStore] Error loading bookings from disk:', err);
      this.bookings = new Map();
    }
  }

  public saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.bookings.values());
      const tmpPath = `${this.dataFilePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(list, null, 2), 'utf8');
      fs.renameSync(tmpPath, this.dataFilePath);
    } catch (err) {
      console.error('[BookingStore] Error writing bookings to disk:', err);
    }
  }

  public rehydrateBookings(incomingBookings: Booking[]): Booking[] {
    if (!Array.isArray(incomingBookings) || incomingBookings.length === 0) {
      return this.getAllBookings();
    }

    for (const b of incomingBookings) {
      if (b && b.id && !this.bookings.has(b.id)) {
        this.bookings.set(b.id, b);
      }
    }

    this.saveToDisk();
    return this.getAllBookings();
  }

  public getAllBookings(): Booking[] {
    return Array.from(this.bookings.values()).sort((a, b) => {
      const cmpDate = a.date.localeCompare(b.date);
      if (cmpDate !== 0) return cmpDate;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  public getBookingsForStudent(studentIdOrEmail: string): Booking[] {
    if (!studentIdOrEmail) return [];
    const norm = studentIdOrEmail.trim().toLowerCase();
    return this.getAllBookings().filter(
      (b) => b.studentId === studentIdOrEmail || (b.studentEmail && b.studentEmail.toLowerCase() === norm)
    );
  }

  public getBookingsForWeek(weekStartIso: string): Booking[] {
    // Calculate week start and week end (7 days)
    const startDate = new Date(weekStartIso);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    return this.getAllBookings().filter((b) => {
      const bDate = new Date(`${b.date}T00:00:00`);
      return bDate >= startDate && bDate < endDate;
    });
  }

  public getBookingById(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  public getDayOfWeek(dateStr: string): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | null {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const day = date.getDay(); // 0 = Sun, 1 = Mon, ... 5 = Fri, 6 = Sat
    switch (day) {
      case 1: return 'Monday';
      case 2: return 'Tuesday';
      case 3: return 'Wednesday';
      case 4: return 'Thursday';
      case 5: return 'Friday';
      default: return null;
    }
  }

  public getWeekStart(dateStr: string): string {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const day = date.getDay(); // 0 is Sun, 1 is Mon
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  public createBooking(data: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentCountry: string;
    date: string; // YYYY-MM-DD
    startTime: BookingStartTime;
    learningGoal?: string;
    maxWeeklyClasses?: number;
  }): Booking {
    // 1. Verify Day of Week (Monday to Friday only)
    const dayOfWeek = this.getDayOfWeek(data.date);
    if (!dayOfWeek) {
      throw new Error('Classes can only be scheduled Monday through Friday.');
    }

    // 2. Verify Valid Time Slot
    const slot = VALID_SLOTS.find((s) => s.start === data.startTime);
    if (!slot) {
      throw new Error('Invalid class time slot. Available hours are 14:00 to 20:00.');
    }

    // 3. Prevent Double Booking of the exact slot by another student
    for (const b of this.bookings.values()) {
      if (b.date === data.date && b.startTime === data.startTime) {
        throw new Error(`The slot on ${data.date} at ${data.startTime} is already booked.`);
      }
    }

    // 4. Verify Student Plan & Weekly Limit
    const user = userStore.findById(data.studentId) || userStore.findByEmail(data.studentEmail);
    const plan = user?.plan;
    let allowedWeekly = data.maxWeeklyClasses;

    if (allowedWeekly === undefined) {
      if (user) {
        if (user.role === 'admin') {
          allowedWeekly = 99;
        } else if (plan === 'free' || !plan) {
          allowedWeekly = 0;
        } else if (plan === 'essential') {
          allowedWeekly = 1;
        } else if (plan === 'pro') {
          allowedWeekly = 2;
        } else if (plan === 'executive') {
          allowedWeekly = 3;
        } else {
          allowedWeekly = user.maxWeeklyClasses ?? 1;
        }
      } else {
        // Fallback for tests or direct calls
        allowedWeekly = 1;
      }
    }

    if (allowedWeekly === 0) {
      throw new Error(
        'El plan Gratuito no incluye clases en vivo 1 a 1. Por favor activa un plan (Essential, Pro o Executive) por WhatsApp para agendar.'
      );
    }

    // 5. Limit active bookings per student per week according to plan
    const targetWeekStart = this.getWeekStart(data.date);
    const existingInWeek = Array.from(this.bookings.values()).filter(
      (b) =>
        (b.studentId === data.studentId || b.studentEmail.toLowerCase() === data.studentEmail.toLowerCase()) &&
        this.getWeekStart(b.date) === targetWeekStart
    );

    if (existingInWeek.length >= allowedWeekly) {
      if (allowedWeekly === 1) {
        throw new Error(
          `You already have a class scheduled on ${existingInWeek[0].date} at ${existingInWeek[0].startTime}. Please reschedule or cancel it first.`
        );
      } else {
        throw new Error(
          `Has alcanzado el límite de ${allowedWeekly} clases para esta semana con tu plan actual. Por favor reprograma o cancela una clase previa.`
        );
      }
    }

    const newBooking: Booking = {
      id: `bkg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      studentId: data.studentId,
      studentName: data.studentName.trim(),
      studentEmail: data.studentEmail.trim().toLowerCase(),
      studentCountry: data.studentCountry || 'Bolivia',
      date: data.date,
      dayOfWeek,
      startTime: slot.start,
      endTime: slot.end,
      learningGoal: data.learningGoal ? data.learningGoal.trim() : 'General Fluency & Pronunciation',
      createdAt: new Date().toISOString(),
    };

    this.bookings.set(newBooking.id, newBooking);
    this.saveToDisk();
    return newBooking;
  }

  public deleteBooking(id: string, studentIdOrEmail?: string): boolean {
    const booking = this.bookings.get(id);
    if (!booking) return false;

    // Optional student ownership check if provided
    if (studentIdOrEmail) {
      const match =
        booking.studentId === studentIdOrEmail ||
        booking.studentEmail.toLowerCase() === studentIdOrEmail.toLowerCase();
      if (!match) {
        throw new Error('Unauthorized to cancel this booking.');
      }
    }

    this.bookings.delete(id);
    this.saveToDisk();
    return true;
  }
}

export const bookingStore = new BookingStore();
