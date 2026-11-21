import { Router, Request, Response } from 'express';
import { bookingStore, BookingStartTime } from '../services/bookingStore.js';
import { googleDbService } from '../services/googleDbService.js';
import { requireAuth, requireAdmin, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/bookings?weekStart=YYYY-MM-DD&force=true
 * Returns bookings for the specified week (or all if not specified)
 */
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.query.force === 'true') {
      await googleDbService.syncFromGoogleDb(true);
    }
    const weekStart = req.query.weekStart as string | undefined;
    const bookings = weekStart
      ? bookingStore.getBookingsForWeek(weekStart)
      : bookingStore.getAllBookings();

    return res.status(200).json({
      status: 'ok',
      total: bookings.length,
      bookings,
      googleDbStatus: googleDbService.getStatus(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/bookings Error]:', msg);
    return res.status(500).json({ error: 'Internal server error fetching bookings' });
  }
});

/**
 * POST /api/bookings
 * Body: { date, startTime, learningGoal }
 * Strictly authenticated; authoritatively binds to the logged-in student.
 */
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { date, startTime, learningGoal } = req.body || {};

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Valid date (YYYY-MM-DD) is required.',
        errorEs: 'Se requiere una fecha válida (AAAA-MM-DD).',
        errorEn: 'Valid date (YYYY-MM-DD) is required.',
      });
    }
    if (!startTime) {
      return res.status(400).json({
        error: 'Class start time is required.',
        errorEs: 'La hora de inicio de la clase es requerida.',
        errorEn: 'Class start time is required.',
      });
    }

    // Determine weekly quota authoritatively from user record (ignore untrusted client body parameters)
    const plan = user.plan || (user.role === 'admin' ? 'executive' : 'free');
    let maxWeeklyClasses = 0;
    if (user.role === 'admin') {
      maxWeeklyClasses = 99;
    } else if (plan === 'pro') {
      maxWeeklyClasses = 3;
    } else if (plan === 'executive') {
      maxWeeklyClasses = 5;
    } else {
      maxWeeklyClasses = 0;
    }

    if (maxWeeklyClasses === 0) {
      const quotaMessage =
        plan === 'essential'
          ? 'El Plan Essential (300 BOB) es 100% autónomo (Laboratorio de Voz 24/7 y Recursos Ilimitados). Para agendar clases en vivo 1 a 1, actualiza al Plan Pro (580 BOB — 3 clases/sem) o Executive (850 BOB — 5 clases/sem).'
          : 'El plan Gratuito no incluye clases en vivo 1 a 1. Por favor activa el Plan Pro (580 BOB — 3 clases/sem) o Executive (850 BOB — 5 clases/sem) por WhatsApp para agendar.';
      return res.status(403).json({
        error: quotaMessage,
        errorEs: quotaMessage,
        errorEn: 'Live 1-on-1 classes require an active Pro or Executive plan.',
      });
    }

    const booking = bookingStore.createBooking({
      studentId: user.id,
      studentName: user.fullName,
      studentEmail: user.email,
      studentCountry: user.country || 'Bolivia',
      date,
      startTime: startTime as BookingStartTime,
      learningGoal: learningGoal || user.learningGoals?.primaryGoal || 'Daily Conversational Fluency',
      maxWeeklyClasses,
    });

    googleDbService.upsertBookingInGoogleDb(booking).catch((dbErr) => {
      console.warn('[Google DB] Async upsert booking notice:', dbErr);
    });

    return res.status(201).json({
      status: 'ok',
      booking,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/bookings Error]:', msg);

    // Conflict if double booked
    if (msg.includes('already booked')) {
      return res.status(409).json({ error: msg });
    }
    // Limit reached
    if (msg.includes('límite') || msg.includes('limit') || msg.includes('already have a class')) {
      return res.status(403).json({ error: msg });
    }

    return res.status(400).json({ error: msg });
  }
});

/**
 * DELETE /api/bookings/:id
 * Enforces ownership: only the student who owns the booking or an admin can delete.
 */
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const booking = bookingStore.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const isOwner =
      booking.studentId === user.id ||
      booking.studentEmail.toLowerCase() === user.email.toLowerCase();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden: You cannot cancel another student booking.',
        errorEs: 'Acceso denegado: No puedes cancelar la clase de otro estudiante.',
        errorEn: 'Forbidden: You cannot cancel another student booking.',
      });
    }

    const success = bookingStore.deleteBooking(id, booking.studentId);
    if (!success) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    googleDbService.deleteBookingInGoogleDb(id).catch((dbErr) => {
      console.warn('[Google DB] Async cancel booking notice:', dbErr);
    });

    return res.status(200).json({
      status: 'ok',
      deletedId: id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[DELETE /api/bookings/:id Error]:', msg);
    return res.status(400).json({ error: msg });
  }
});

/**
 * GET /api/bookings/export
 * Admin overview of all booked classes
 */
router.get('/export', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const all = bookingStore.getAllBookings();
    return res.status(200).json({
      status: 'ok',
      total: all.length,
      bookings: all,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/bookings/export Error]:', msg);
    return res.status(500).json({ error: 'Internal server error exporting bookings' });
  }
});

export default router;
