type LogLevel = "error" | "warn" | "info" | "debug";

type LogContext = Record<string, unknown>;

function writeLog(level: LogLevel, message: string, context?: LogContext): void {
  const payload = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  });

  switch (level) {
    case "error":
      console.error(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    case "info":
      console.log(payload);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(payload);
      }
      break;
  }
}

export function logError(message: string, context?: LogContext): void {
  writeLog("error", message, context);
}

export function logWarn(message: string, context?: LogContext): void {
  writeLog("warn", message, context);
}

export function logInfo(message: string, context?: LogContext): void {
  writeLog("info", message, context);
}

export function logDebug(message: string, context?: LogContext): void {
  writeLog("debug", message, context);
}
