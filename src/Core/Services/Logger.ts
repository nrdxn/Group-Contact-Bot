import { LogLevel } from '@enums/LogLevel';

export default class LoggerService {
    listen() {
        process
            .on('uncaughtException', (err: Error) => {
                this.log(LogLevel.ERROR, err);
            })
            .on('unhandledRejection', (err: Error) => {
                this.log(LogLevel.ERROR, err);
            });

        this.log(LogLevel.INFO, `Логер успешно запущен`);
    }

    log(level: LogLevel, message: any) {
        console.log(this.formatLog(level, message) + '\n');
    }

    formatLog(level: LogLevel, message: string) {
        const timestamp =
            new Date().toLocaleDateString() +
            ' | ' +
            new Date().toLocaleTimeString();
        return `[${level}] [\x1b[97m${timestamp}\x1b[0m]\n${message}`;
    }
}
