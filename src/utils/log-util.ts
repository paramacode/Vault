type LogLevel = "print" | "warn" | "error";

const LOG_PREFIX = "Vault";

function formatMessage(message: string, shouldDebug = false): string {
	if (!shouldDebug) {
		return `[${LOG_PREFIX}]: ${message}`;
	}
	return `[${LOG_PREFIX}]: ${message}\n\n${debug.traceback()}`;
}

export function Log(level: LogLevel, message: string, errorLevel?: number, shouldDebug?: boolean): void {
	const formatted = formatMessage(message, shouldDebug);

	switch (level) {
		case "print":
			print(formatted);
			break;
		case "warn":
			warn(formatted);
			break;
		case "error":
			error(formatted, errorLevel);
			return;

		default: {
			const _exhaustive: never = level;
			return _exhaustive;
		}
	}
}
