export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  module?: string;
  durationMs?: number;
  provider?: string;
  model?: string;
  attempt?: number;
  [key: string]: unknown;
}

const REDACT_KEYS = ['api_key', 'apikey', 'key', 'password', 'token', 'secret', 'auth', 'authorization', 'smtp_pass'];

function redactSensitive(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(redactSensitive);

  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (REDACT_KEYS.some(secret => k.toLowerCase().includes(secret))) {
      cleaned[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      cleaned[k] = redactSensitive(v);
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

export class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const safeContext = context ? (redactSensitive(context) as LogContext) : {};
    const meta = {
      timestamp,
      level,
      module: this.module,
      ...safeContext,
    };

    const formattedMeta = Object.keys(meta).length > 3 ? ` ${JSON.stringify(meta)}` : '';
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.module}]`;

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`${prefix} ${message}${formattedMeta}`);
        }
        break;
      case 'info':
        console.info(`${prefix} ${message}${formattedMeta}`);
        break;
      case 'warn':
        console.warn(`⚠️ ${prefix} ${message}${formattedMeta}`);
        break;
      case 'error':
        console.error(`❌ ${prefix} ${message}${formattedMeta}`);
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const appLogger = new Logger('App');
