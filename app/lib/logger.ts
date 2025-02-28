type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  private output(entry: LogEntry) {
    const logString = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    if (this.isDevelopment) {
      switch (entry.level) {
        case 'error':
          console.error(logString, entry.data || '');
          break;
        case 'warn':
          console.warn(logString, entry.data || '');
          break;
        case 'info':
          console.info(logString, entry.data || '');
          break;
        case 'debug':
          console.debug(logString, entry.data || '');
          break;
      }
    } else {
      // In production, you might want to send logs to a service like CloudWatch, Datadog, etc.
      // For now, we'll just use console.log for all levels in production
      console.log(logString, entry.data ? JSON.stringify(entry.data) : '');
    }
  }

  public info(message: string, data?: any) {
    this.output(this.formatLog('info', message, data));
  }

  public warn(message: string, data?: any) {
    this.output(this.formatLog('warn', message, data));
  }

  public error(message: string, data?: any) {
    this.output(this.formatLog('error', message, data));
  }

  public debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.output(this.formatLog('debug', message, data));
    }
  }
}

export const logger = Logger.getInstance(); 