import { Client } from '@core/Client/ClientClass';
import { Users } from './Users/UserMethods';
import { LogLevel } from '@enums/LogLevel';
import mongoose from 'mongoose';

export class Database {
    public users: Users;

    constructor(private client: Client) {
        this.users = new Users();
    }

    async connect() {
        await mongoose
            .connect(`${process.env['MONGO_URL']}`, {
                serverSelectionTimeoutMS: 20000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000
            })
            .then(() =>
                this.client.logger.log(
                    LogLevel.INFO,
                    'Успешное подключение всех сервисов'
                )
            );
    }
}
