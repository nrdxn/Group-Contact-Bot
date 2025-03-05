import { Database } from '@db/Database';
import { Telegraf, Context } from 'telegraf';
import LoggerService from '@services/Logger';

export class Client {
    public bot: Telegraf<Context>;
    public db: Database;
    public logger: LoggerService;

    constructor() {
        this.bot = new Telegraf<Context>(`${process.env['BOT_TOKEN']}`);
        this.db = new Database(this);
        this.logger = new LoggerService();
    }
}
