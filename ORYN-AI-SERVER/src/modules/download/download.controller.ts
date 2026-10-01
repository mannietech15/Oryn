import { Request, Response, NextFunction } from 'express';
import { validateSafeDownloadUrl, sanitizeFilename } from '../../shared/utils/sanitize';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('DownloadController');

export class DownloadController {
  download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawUrl = req.query.url as string;
      const rawFilename = (req.query.filename as string) || 'image.jpg';

      // Validate URL against SSRF and allowed domain whitelist
      const safeUrl = validateSafeDownloadUrl(rawUrl);
      const safeFilename = sanitizeFilename(rawFilename);

      logger.info('Proxying image download', {
        domain: safeUrl.hostname,
        filename: safeFilename,
      });

      const imageRes = await fetch(safeUrl.toString());
      if (!imageRes.ok) {
        res.status(502).json({ error: 'Failed to retrieve image from upstream provider' });
        return;
      }

      res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

      const buffer = await imageRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      next(err);
    }
  };
}

export const defaultDownloadController = new DownloadController();
