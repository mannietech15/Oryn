import { Request, Response } from 'express';

export class DownloadController {
  static async download(req: Request, res: Response) {
    try {
      const targetUrl = req.query.url as string;
      const filename = (req.query.filename as string) || 'image.jpg';
      if (!targetUrl) {
        res.status(400).send('No URL provided');
        return;
      }

      const imageRes = await fetch(targetUrl);
      if (!imageRes.ok) throw new Error('Failed to fetch image');

      res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const buffer = await imageRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error('Download Proxy Error:', err);
      res.status(500).send('Download Error');
    }
  }
}
