import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { createNotarization, getExplorerUrl } from '../services/iota';

export const notarizeRouter = Router();

const VALID_COMMODITIES = ['cocoa', 'coffee', 'palm_oil', 'soy', 'wood', 'rubber', 'cattle'] as const;
type Commodity = typeof VALID_COMMODITIES[number];

interface NotarizeRequest {
  parcel_id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  commodity: Commodity;
  area_hectares: number;
  assessment_date: string;
}

function validateRequest(body: unknown): { valid: boolean; error?: string; data?: NotarizeRequest } {
  const req = body as NotarizeRequest;

  if (!req.parcel_id || typeof req.parcel_id !== 'string') {
    return { valid: false, error: 'Parcel ID is required' };
  }

  if (!req.coordinates || typeof req.coordinates.latitude !== 'number' || typeof req.coordinates.longitude !== 'number') {
    return { valid: false, error: 'Valid coordinates are required' };
  }

  if (req.coordinates.latitude < -90 || req.coordinates.latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (req.coordinates.longitude < -180 || req.coordinates.longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  if (!VALID_COMMODITIES.includes(req.commodity)) {
    return { valid: false, error: `Invalid commodity. Must be one of: ${VALID_COMMODITIES.join(', ')}` };
  }

  if (typeof req.area_hectares !== 'number' || req.area_hectares <= 0) {
    return { valid: false, error: 'Area must be a positive number' };
  }

  if (!req.assessment_date) {
    return { valid: false, error: 'Assessment date is required' };
  }

  return { valid: true, data: req };
}

notarizeRouter.post('/notarize', async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(req.body);
    if (!validation.valid || !validation.data) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    const claim = {
      ...validation.data,
      declaration: {
        deforestation_free_since: '2020-12-31',
        declared_at: new Date().toISOString(),
      },
    };

    // Create deterministic hash
    const claimJson = JSON.stringify(claim, Object.keys(claim).sort());
    const claimHash = '0x' + crypto.createHash('sha256').update(claimJson).digest('hex');

    // Submit to IOTA as Locked Notarization
    const description = `EUDR claim for parcel ${validation.data.parcel_id}`;
    const result = await createNotarization(claimHash, description);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const verificationUrl = `${baseUrl}/verify?id=${result.notarizationId}`;
    const explorerUrl = getExplorerUrl(result.notarizationId);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(verificationUrl);

    const timestamp = new Date().toISOString();

    res.status(201).json({
      success: true,
      claim_hash: claimHash,
      notarization_id: result.notarizationId,
      transaction_digest: result.digest,
      timestamp,
      verification_url: verificationUrl,
      explorer_url: explorerUrl,
      qr_code: qrCode,
    });
  } catch (error) {
    console.error('Notarization error:', error);
    res.status(500).json({ success: false, error: 'Failed to notarize claim' });
  }
});
