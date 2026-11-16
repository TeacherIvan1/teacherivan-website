import { Router, Request, Response } from 'express';
import { sheetsService } from '../services/sheetsService.js';
import { userStore } from '../services/userStore.js';

const router = Router();

/**
 * GET /api/sheets/status
 * Returns current Google Sheets connection status
 */
router.get('/status', (_req: Request, res: Response) => {
  try {
    const status = sheetsService.getStatus();
    return res.status(200).json({
      status: 'ok',
      ...status,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/sheets/status Error]:', msg);
    return res.status(500).json({ error: 'Failed to retrieve Google Sheets status' });
  }
});

/**
 * POST /api/sheets/sync
 * Manually trigger full sync of student database to Google Sheets
 */
router.post('/sync', async (_req: Request, res: Response) => {
  try {
    const allUsers = userStore.getAllUsers();
    // Exclude admin if desired, or include all registered students
    const students = allUsers.filter((u) => u.role !== 'admin');
    const result = await sheetsService.syncAllStudents(students.length > 0 ? students : allUsers);

    return res.status(200).json({
      status: 'ok',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/sheets/sync Error]:', msg);
    return res.status(500).json({ error: 'Failed to sync with Google Sheets' });
  }
});

export default router;
