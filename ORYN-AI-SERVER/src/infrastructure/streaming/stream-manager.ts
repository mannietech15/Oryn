import { Request, Response } from 'express';
import { SSEStream, SSEMessage } from './sse';
import { Logger } from '../logging/logger';

const logger = new Logger('StreamManager');

export class StreamManager {
  public readonly sse: SSEStream;
  public readonly abortController: AbortController;
  private cleanupHooks: Array<() => void> = [];

  constructor(req: Request, res: Response) {
    this.abortController = new AbortController();
    this.sse = new SSEStream(res);

    req.on('close', () => {
      if (!this.sse.closed) {
        logger.info('Client closed connection prematurely');
        this.abortController.abort();
        this.cleanup();
        this.sse.close();
      }
    });

    req.on('error', (err) => {
      logger.error('Stream request error', { error: err.message });
      this.abortController.abort();
      this.cleanup();
      this.sse.close();
    });
  }

  onCleanup(fn: () => void): void {
    this.cleanupHooks.push(fn);
  }

  private cleanup(): void {
    while (this.cleanupHooks.length > 0) {
      const hook = this.cleanupHooks.pop();
      try {
        hook?.();
      } catch (err: any) {
        logger.error('Error during stream cleanup', { error: err.message });
      }
    }
  }

  send(data: SSEMessage): boolean {
    return this.sse.send(data);
  }

  sendText(text: string): boolean {
    return this.sse.sendText(text);
  }

  sendStatus(text: string): boolean {
    return this.sse.sendStatus(text);
  }

  sendError(message: string): void {
    this.sse.sendError(message);
    this.cleanup();
  }

  sendDone(): void {
    this.sse.sendDone();
    this.cleanup();
  }

  get isAborted(): boolean {
    return this.abortController.signal.aborted;
  }
}
