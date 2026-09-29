import { Request, Response } from 'express';
import { openai, openaiLogic, openaiApex } from '../config/nvidia';
import { ENV } from '../config/env';
import { ChatRequestBody } from '../types';

export class ChatController {
  static async handleChat(req: Request, res: Response) {
    const { messages, webSearch, taskExtract, model, language } = req.body as ChatRequestBody;

    const isLogic = model === 'logic';
    const isApex = model === 'apex';
    let currentModelName = model === 'pro' ? ENV.PRO_MODEL : ENV.DEFAULT_MODEL;
    let currentClient = isLogic ? openaiLogic : isApex ? openaiApex : openai;

    const systemInstruction = `You are Oryn (pronounced "Orine"), a sleek futuristic business AI assistant. Your name is Oryn — always write it as "Oryn" (never spell it out letter by letter). You are professional, insightful, and concise.
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

    const lastMsgContent = messages[messages.length - 1].content.trim();
    const lowerMsg = lastMsgContent.toLowerCase();
    const imageMatch = lowerMsg.match(/^(?:\/imagine\s+|(?:please\s+)?(?:generate|create|make|draw)\s+(?:(?:an?\s+|the\s+)?(?:image|picture)s?(?:\s+of)?\s+))(.+)/);

    if (imageMatch) {
      const prompt = imageMatch[1].trim();
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}`;
      const filename = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) + '.jpg';
      
      const responseText = `Generating your vision for **"${prompt}"**...\n\n<style>
        @keyframes shimmerGen {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      </style>
      <div style="margin-top: 16px; position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--card-border); box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 400px; aspect-ratio: 1/1; background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%); background-size: 200% 100%; animation: shimmerGen 2s infinite linear;">
        <button onclick="const a=document.createElement('a'); a.href='/api/download?url='+encodeURIComponent('${imageUrl}')+'&filename=${filename}'; a.click();" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; font-family: var(--font-sans); font-size: 11px; font-weight: 500; padding: 6px 12px; border-radius: 6px; transition: opacity 0.2s, background 0.2s; z-index: 10; opacity: 0;" onmouseover="this.style.background='rgba(0,0,0,0.8)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'">Download</button>
        <img onload="this.style.opacity=1; this.previousElementSibling.style.opacity=1;" src="${imageUrl}" alt="${prompt}" style="width: 100%; height: 100%; display: block; object-fit: cover; opacity: 0; transition: opacity 0.8s ease;" />
      </div>`.replace(/\n/g, ' ');

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ type: 'text', text: responseText })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const maxRetries = 3;
    const retryDelays = [2000, 5000, 10000];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`💬 Chat request: "${messages[messages.length - 1].content.slice(0, 30)}..." (attempt ${attempt + 1})`);
        const msgs: any[] = [{ role: 'system', content: systemInstruction }];
        
        if (language && language !== 'English') {
          let langInstruction = `Please reply entirely in ${language}.`;
          if (language.toLowerCase() === 'yoruba' || language.toLowerCase() === 'pidgin') {
            langInstruction += ` Ensure the tone and vocabulary sound highly native, conversational, and culturally fluent to a Nigerian speaker.`;
          }
          msgs.push({ role: 'system', content: langInstruction });
        }

        const response = await currentClient.chat.completions.create({
          model: currentModelName,
          messages: [
            ...msgs,
            ...messages.map(m => ({
              role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
              content: m.content
            }))
          ],
          stream: true,
        });

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
          }
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
        return;
      } catch (err: any) {
        const is410 = err.message?.includes('410') || err.status === 410;
        const is404 = err.message?.includes('404') || err.status === 404;
        const is429 = err.message?.includes('429') || err.status === 429 || err.message?.includes('rate-limit') || err.message?.includes('rate_limit');
        
        if ((is410 || is404 || is429) && currentModelName !== ENV.DEFAULT_MODEL) {
          console.log(`⏳ Model ${currentModelName} unavailable, falling back to ${ENV.DEFAULT_MODEL}...`);
          currentModelName = ENV.DEFAULT_MODEL;
          currentClient = openai;
          continue;
        }

        if (is429 && attempt < maxRetries) {
          console.log(`⏳ Rate limited, retrying in ${retryDelays[attempt] / 1000}s...`);
          res.write(`data: ${JSON.stringify({ type: 'status', text: 'Thinking...' })}\n\n`);
          await new Promise(r => setTimeout(r, retryDelays[attempt]));
          continue;
        }

        console.error('❌ Chat Error:', err.message);
        const userMessage = is429
          ? 'The AI model is temporarily rate-limited on the free tier. Please wait a moment and try again.'
          : is410 || is404
            ? 'The requested model endpoint was updated. Please refresh and try again.'
            : 'An unexpected error occurred while generating the response. Please try again.';
        res.write(`data: ${JSON.stringify({ type: 'error', message: userMessage })}\n\n`);
        res.end();
        return;
      }
    }
  }
}
