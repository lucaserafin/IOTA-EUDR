import { Router, Request, Response } from 'express';
import { getNotarization, getExplorerUrl } from '../services/iota';

export const verifyRouter = Router();

verifyRouter.get('/verify/:notarizationId', async (req: Request, res: Response) => {
  try {
    const { notarizationId } = req.params;

    if (!notarizationId) {
      res.status(400).json({ found: false, error: 'Notarization ID is required' });
      return;
    }

    const result = await getNotarization(notarizationId);

    if (!result.found) {
      res.status(404).json({ found: false, error: 'Notarization not found on IOTA' });
      return;
    }

    res.json({
      found: true,
      notarization_id: notarizationId,
      claim_hash: result.contentHash,
      description: result.description,
      timestamp: result.createdAt
        ? new Date(Number(result.createdAt) * 1000).toISOString()
        : undefined,
      explorer_url: getExplorerUrl(notarizationId),
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ found: false, error: 'Failed to verify notarization' });
  }
});
