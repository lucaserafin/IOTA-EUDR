import { Router, Request, Response } from 'express';
import { getAllNotarizations, getExplorerUrl } from '../services/iota';

export const historyRouter = Router();

historyRouter.get('/notarizations', async (req: Request, res: Response) => {
  try {
    const notarizations = await getAllNotarizations();

    const records = notarizations.map((n) => ({
      notarization_id: n.id,
      claim_hash: n.contentHash,
      description: n.description,
      method: n.method,
      timestamp: n.createdAt
        ? new Date(Number(n.createdAt) * 1000).toISOString()
        : undefined,
      explorer_url: getExplorerUrl(n.id),
    }));

    res.json({ notarizations: records, count: records.length });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ notarizations: [], count: 0, error: 'Failed to fetch notarizations' });
  }
});
