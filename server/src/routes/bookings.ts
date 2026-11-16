import { Router, Request, Response } from 'express';
import { bookingStore, BookingStartTime } from '../services/bookingStore.js';

const router = Router();

/**
 * GET /api/bookings?weekStart=YYYY-MM-DD
 * Returns bookings for the specified week (or all if not specified)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const weekStart = req.query.weekStart as string | undefined;
    const bookings = weekStart
      ? bookingStore.getBookingsForWeek(weekStart)
      : bookingStore.getAllBookings();

    return res.status(200).json({
      status: 'ok',
      total: bookings.length,
      bookings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/bookings Error]:', msg);
    return res.status(500).json({ error: 'Internal server error fetching bookings' });
  }
});

/**
 * POST /api/bookings
 * Body: { studentId, studentName, studentEmail, studentCountry, date, startTime, learningGoal }
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { studentId, studentName, studentEmail, studentCountry, date, startTime, learningGoal } = req.body || {};

    if (!studentId || !studentName || !studentEmail) {
      return res.status(400).json({ error: 'Student information (ID, name, email) is required.' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Valid date (YYYY-MM-DD) is required.' });
    }
    if (!startTime) {
      return res.status(400).json({ error: 'Class start time is required.' });
    }

    const booking = bookingStore.createBooking({
      studentId,
      studentName,
      studentEmail,
      studentCountry: studentCountry || 'Bolivia',
      date,
      startTime: startTime as BookingStartTime,
      learningGoal,
    });

    return res.status(201).json({
      status: 'ok',
      booking,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/bookings Error]:', msg);
    return res.status(400).json({ error: msg });
  }
});

/**
 * DELETE /api/bookings/:id
 * Optional body/query: studentIdOrEmail for ownership verification
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const studentIdOrEmail = (req.body?.studentId || req.query.studentId || req.body?.studentEmail || req.query.studentEmail) as string | undefined;

    const success = bookingStore.deleteBooking(id, studentIdOrEmail);
    if (!success) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

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
router.get('/export', (_req: Request, res: Response) => {
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
