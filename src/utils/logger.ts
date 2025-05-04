/**
 * Logger utility for frontend
 * 
 * Provides consistent logging with different log levels and context
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Current log level (can be changed at runtime)
let currentLogLevel = LogLevel.INFO;

// Set the current log level
export const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
};

// Get the current log level
export const getLogLevel = (): LogLevel => {
  return currentLogLevel;
};

// Format a log message with timestamp and context
const formatLogMessage = (level: string, message: string, context?: any): string => {
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (context) {
    try {
      formattedMessage += ` ${JSON.stringify(context)}`;
    } catch (error) {
      formattedMessage += ` [Context serialization failed]`;
    }
  }
  
  return formattedMessage;
};

// Logger object
export const logger = {
  debug: (message: string, context?: any): void => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(formatLogMessage('DEBUG', message, context));
    }
  },
  
  info: (message: string, context?: any): void => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(formatLogMessage('INFO', message, context));
    }
  },
  
  warn: (message: string, context?: any): void => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(formatLogMessage('WARN', message, context));
    }
  },
  
  error: (message: string, context?: any): void => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(formatLogMessage('ERROR', message, context));
    }
  },
  
  // Log with a specific level
  log: (level: LogLevel, message: string, context?: any): void => {
    switch (level) {
      case LogLevel.DEBUG:
        logger.debug(message, context);
        break;
      case LogLevel.INFO:
        logger.info(message, context);
        break;
      case LogLevel.WARN:
        logger.warn(message, context);
        break;
      case LogLevel.ERROR:
        logger.error(message, context);
        break;
    }
  }
};

// Initialize log level from environment if available
if (typeof window !== 'undefined') {
  // Set log level based on URL parameter or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const logLevelParam = urlParams.get('logLevel');
  
  if (logLevelParam) {
    switch (logLevelParam.toLowerCase()) {
      case 'debug':
        setLogLevel(LogLevel.DEBUG);
        break;
      case 'info':
        setLogLevel(LogLevel.INFO);
        break;
      case 'warn':
        setLogLevel(LogLevel.WARN);
        break;
      case 'error':
        setLogLevel(LogLevel.ERROR);
        break;
    }
  } else {
    // Check localStorage
    const storedLogLevel = localStorage.getItem('logLevel');
    if (storedLogLevel) {
      try {
        const level = parseInt(storedLogLevel, 10);
        if (level >= LogLevel.DEBUG && level <= LogLevel.ERROR) {
          setLogLevel(level);
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  }
}

// Export default logger
export default logger;
