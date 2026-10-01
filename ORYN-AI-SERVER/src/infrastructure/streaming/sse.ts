import { Response } from 'express';

export interface SSEMessage {
  type: 'text' | 'status' | 'done' | 'error';
  text?: string;
  message?: string;
  [key: string]: unknown;
}

export class SSEStream {
  private res: Response;
  private isClosed = false;

  constructor(res: Response) {
    this.res = res;
    this.init();
  }

  private init() {
    this.res.setHeader('Content-Type', 'text/event-stream');
    this.res.setHeader('Cache-Control', 'no-cache, no-transform');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering for nginx
    this.res.flushHeaders?.();
  }

  send(data: SSEMessage): boolean {
    if (this.isClosed || this.res.writableEnded) {
      return false;
    }
    this.res.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  }

  sendText(text: string): boolean {
    return this.send({ type: 'text', text });
  }

  sendStatus(text: string): boolean {
    return this.send({ type: 'status', text });
  }

  sendError(message: string): void {
    if (!this.isClosed && !this.res.writableEnded) {
      this.send({ type: 'error', message });
      this.close();
    }
  }

  sendDone(): void {
    if (!this.isClosed && !this.res.writableEnded) {
      this.send({ type: 'done' });
      this.close();
    }
  }

  close(): void {
    if (!this.isClosed) {
      this.isClosed = true;
      if (!this.res.writableEnded) {
        this.res.end();
      }
    }
  }

  get closed(): boolean {
    return this.isClosed || this.res.writableEnded;
  }
}
