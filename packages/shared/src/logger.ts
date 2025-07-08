type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
    extraArgs?: Record<string, unknown>;
}

const getTimestamp = (): string => new Date().toISOString();

export class Logger {
    constructor(private context: string) {}

    private formatMessage(level: LogLevel, message: string): string {
        const parts = [
            `[${getTimestamp()}]`,
            `[${level.toUpperCase()}]`,
            `[${this.context}]`,
            message,
        ];
        return parts.join(' ');
    }

    private log(level: LogLevel, message: string, options?: LogOptions): void {
        const formatted = this.formatMessage(level, message);

        switch (level) {
            case 'info':
                console.log(formatted);
                break;
            case 'warn':
                console.warn(formatted);
                break;
            case 'error':
                console.error(formatted);
                break;
            case 'debug':
                console.debug(formatted);
                break;
        }

        if (options?.extraArgs) {
            console.dir({ extraArgs: options.extraArgs }, { depth: null, colors: true });
        }
    }

    info = (msg: string, options?: LogOptions) => this.log('info', msg, options);
    warn = (msg: string, options?: LogOptions) => this.log('warn', msg, options);
    error = (msg: string, error?: unknown, options?: LogOptions) => this.log('error', msg, options);
    debug = (msg: string, options?: LogOptions) => this.log('debug', msg, options);
}
