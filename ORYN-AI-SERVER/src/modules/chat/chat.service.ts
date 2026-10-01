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
${taskExtract ? 'After your response, if there are clear action items, append a JSON block on a new line: {"tasks":["task1","task2"]} — only if tasks genuinely exist.' : ''}
EMAIL SENDING PROTOCOL: If the user asks you to send an email, YOU MUST FIRST draft the email and ask the user for permission to send it. DO NOT send it immediately. Wait for the user to explicitly say 'yes', 'send it', or confirm in some way. NEVER output the JSON block until the user has explicitly confirmed. Do not even show them the JSON block as an example. ONLY AFTER the user confirms, you should trigger the email sending by appending a JSON block on a new line at the very end of your response: {"email_action": "send", "to": ["email@example.com"], "subject": "...", "body": "..."}
CODING PROTOCOL: When asked to write code, build UI, or create components:
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
