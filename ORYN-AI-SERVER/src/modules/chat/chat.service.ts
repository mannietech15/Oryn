import { ChatRequestDto } from './chat.types';
import { InferenceService, defaultInferenceService } from '../inference/inference.service';
import { RoutingStrategy } from '../inference/strategies/routing.strategy';
import { InferenceMessage, StreamChunk } from '../inference/inference.types';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('ChatService');

export class ChatService {
  constructor(private inference: InferenceService = defaultInferenceService) {}

  buildSystemPrompt(options: { webSearch?: boolean; taskExtract?: boolean; language?: string }): string {
    const { webSearch, taskExtract, language } = options;
    return `You are Oryn (pronounced "Orine"), a sleek futuristic business AI assistant. Your name is Oryn — always write it as "Oryn" (never spell it out letter by letter). You are professional, insightful, and concise.
You help with business strategy, productivity, data analysis, drafting, and decision-making.
${webSearch ? 'You have web search capabilities — mention relevant current data when helpful.' : ''}
EMAIL SENDING PROTOCOL (HUMAN-IN-THE-LOOP): When the user asks you to draft or send an email:
1. Provide a professional, concise summary and display the draft in your response.
2. The UI features a dedicated Human-in-the-Loop approval card with an interactive "Confirm & Send via SMTP" button. Do NOT instruct the user to type "yes" or "send it" in chat — they will review and authorize the draft via the UI card.
3. At the very end of your response on a new line, append the structured JSON payload containing the complete email details:
{"email_action": "send", "to": ["recipient@example.com"], "subject": "Specific Subject", "body": "Complete email body text without placeholders"}
CRITICAL: Never output placeholder dots "..." in body or subject. Always provide the full, real text. The UI automatically strips the JSON block from view and renders the interactive proposal card.
1. ALWAYS write production-ready, highly functional code.
2. For UIs, prefer writing a single standalone React component (JSX/JS) using Tailwind CSS for styling. The system automatically compiles React, JSX, and Tailwind. 
3. Include real functional state management (React.useState, useEffect) and interactive elements (working buttons, forms, dynamic data) so the UI is fully operational.
4. Do not just build static mocks. Handle state, clicks, and basic logic.
5. Ensure the code is complete and handles edge cases elegantly. Use modern, sleek, and premium design patterns (vibrant colors, smooth transitions, subtle shadows, clean typography).
Keep responses focused and powerful. Use **bold** for key numbers or insights. Max 3-4 sentences unless detail is needed (except for code blocks).
IMPORTANT: You MUST respond entirely in the following language: ${language || 'English'}.`;
  }

  detectImageIntent(prompt: string): string | null {
    return RoutingStrategy.detectImageIntent(prompt);
  }

  generateImage(prompt: string) {
    return this.inference.generateImage({ prompt });
  }

  async *streamChat(
    dto: ChatRequestDto,
    signal?: AbortSignal,
    onStatus?: (status: string) => void
  ): AsyncIterable<StreamChunk> {
    const { messages, webSearch, taskExtract, model, language } = dto;
    const systemPrompt = this.buildSystemPrompt({ webSearch, taskExtract, language });

    const inferenceMessages: InferenceMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (language && language !== 'English') {
      let langInstruction = `Please reply entirely in ${language}.`;
      if (language.toLowerCase() === 'yoruba' || language.toLowerCase() === 'pidgin') {
        langInstruction += ` Ensure the tone and vocabulary sound highly native, conversational, and culturally fluent to a Nigerian speaker.`;
      }
      inferenceMessages.push({ role: 'system', content: langInstruction });
    }

    for (const msg of messages) {
      inferenceMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    }

    logger.info('Initiating chat stream', {
      messageCount: messages.length,
      modelTier: model || 'default',
      language: language || 'English',
    });

    yield* this.inference.streamText(
      {
        model,
        messages: inferenceMessages,
      },
      signal,
      onStatus
    );
  }
}

export const defaultChatService = new ChatService();
