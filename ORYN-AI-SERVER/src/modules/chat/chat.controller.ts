import { Request, Response } from 'express';
import { ChatService, defaultChatService } from './chat.service';
import { ChatRequestDto } from './chat.types';
import { StreamManager } from '../../infrastructure/streaming/stream-manager';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('ChatController');

export class ChatController {
  constructor(private chatService: ChatService = defaultChatService) {}

  handleChat = async (req: Request, res: Response): Promise<void> => {
    const stream = new StreamManager(req, res);
    const body = req.body as ChatRequestDto;

    try {
      const lastMessage = body.messages[body.messages.length - 1];
      const imagePrompt = this.chatService.detectImageIntent(lastMessage.content);

      if (imagePrompt) {
        logger.info('Handling image intent generation', { promptSnippet: imagePrompt.slice(0, 30) });
        const imageResult = this.chatService.generateImage(imagePrompt);
        stream.sendText(imageResult.htmlMarkup);
        stream.sendDone();
        return;
      }

      const chunkStream = this.chatService.streamChat(
        body,
        stream.abortController.signal,
        (statusText) => {
          stream.sendStatus(statusText);
        }
      );

      for await (const chunk of chunkStream) {
        if (stream.isAborted) break;
        if (chunk.text) {
          stream.sendText(chunk.text);
        }
      }

      if (!stream.isAborted) {
        stream.sendDone();
      }
    } catch (err: any) {
      if (stream.isAborted) return;
      logger.error('Streaming chat failed', { error: err.message });
      stream.sendError(err.message || 'An error occurred during inference generation.');
    }
  };
}

export const defaultChatController = new ChatController();
