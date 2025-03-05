import UserModel from './UserModel';

export class Users {
    async findUserById(userId: number) {
        let db = await UserModel.findOne({
            user: userId
        });

        if (!db)
            db = await UserModel.create({
                user: userId
            });

        return db;
    }

    async findUserByThreadId(threadId: number) {
        let db = await UserModel.findOne({
            threadId: threadId
        });

        return db;
    }
}
