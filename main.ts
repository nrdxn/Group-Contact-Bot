import { Context, Telegraf, Markup } from 'telegraf';
import mongoose, { Schema, model, SchemaTypes } from 'mongoose';
import ms from 'ms';

const config = {
    chatId: -1002294235293
};

const OrderModel = model(
    'order-bot',
    new Schema({
        user: SchemaTypes.Number,
        threadId: SchemaTypes.Number,
        sendCooldown: SchemaTypes.Number,
        isOpenThread: { type: SchemaTypes.Boolean, default: false },
        blocked: { type: SchemaTypes.Boolean, default: false }
    })
);

process
    .on('uncaughtException', (err: Error) => {
        console.log(err);
    })
    .on('unhandledRejection', (err: Error) => {
        console.log(err);
    });

class TelegramBot {
    private bot: Telegraf<Context>;

    constructor() {
        this.bot = new Telegraf<Context>(
            '8139053344:AAFYn7lFykMV40_NHx_kfd0_oaglceno3ZY'
        );
    }

    async init() {
        await mongoose
            .connect('mongodb://127.0.0.1:27017/PopitOrders', {
                serverSelectionTimeoutMS: 20000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000
            })
            .then(() => console.log('База занных запущена'));

        this.bot.command('start', async (ctx: Context) => {
            await ctx.reply(
                '👋 Привет, воспользуйся кнопками ниже, чтобы взаимодействовать с ботом.',
                {
                    ...Markup.inlineKeyboard([
                        Markup.button.callback(
                            'Задать вопрос',
                            'CreateQuestion'
                        ),
                        Markup.button.callback('Создать заказ', 'CreateOrder')
                    ])
                }
            );
            await ctx.sendSticker(
                'CAACAgIAAxkBAAENJbxnxwi_AAFichyu4scWYLgJ_XQct8cAAjQ6AAIezyFLytJK34iifik2BA'
            );
        });

        this.bot.command('close', async (ctx: Context) => {
            if (ctx.message?.is_topic_message) {
                const db = await OrderModel.findOne({
                    threadId: ctx.message.message_thread_id
                });

                await this.bot.telegram.closeForumTopic(
                    config.chatId,
                    ctx.message.message_thread_id!
                );

                db!.threadId = 0;
                db!.sendCooldown = 0;
                db!.isOpenThread = false;

                await db?.save();

                await this.bot.telegram.sendMessage(
                    db!.user!,
                    'Твое обращение было закрыто.'
                );
                await this.bot.telegram.sendSticker(
                    db!.user!,
                    'CAACAgIAAxkBAAENKAtnxzAviGnsQIx00e2qQYekyibFBgACe0EAAny7IUsLjcm5l7KGQzYE'
                );

                await ctx.react('👍');
            }
        });

        this.bot.command('ban', async (ctx: Context) => {
            if (ctx.message?.is_topic_message) {
                const db = await OrderModel.findOne({
                    threadId: ctx.message.message_thread_id
                });

                await this.bot.telegram.closeForumTopic(
                    config.chatId,
                    ctx.message.message_thread_id!
                );

                db!.threadId = 0;
                db!.sendCooldown = 0;
                db!.isOpenThread = false;
                db!.blocked = true;

                await db?.save();

                await this.bot.telegram.sendMessage(
                    db!.user!,
                    'Твое обращение было закрыто.'
                );

                await ctx.react('👍');
            }
        });

        this.bot.action(
            ['CreateQuestion', 'CreateOrder'],
            async (ctx: Context) => {
                const db =
                    (await OrderModel.findOne({ user: ctx.from!.id })) ||
                    new OrderModel({ user: ctx.from!.id });

                if (db.blocked) {
                    return await ctx.reply(
                        '👀 Ошибка: У тебя <b>отобран доступ</b>',
                        {
                            parse_mode: 'HTML'
                        }
                    );
                }

                if (db.isOpenThread) {
                    return await ctx.reply(
                        '👀 Ошибка: У тебя есть <b>открытое обращение</b>',
                        {
                            parse_mode: 'HTML'
                        }
                    );
                }

                if (db.sendCooldown! > Date.now()) {
                    return await ctx.reply(
                        '👀 Ошибка: С прошлого обращения <b>не прошло</b> 10-ти минут.',
                        {
                            parse_mode: 'HTML'
                        }
                    );
                }

                await this.bot.telegram
                    .createForumTopic(
                        config.chatId,
                        `${
                            (ctx.callbackQuery as any).data == 'CreateOrder'
                                ? 'Заказ'
                                : 'Вопрос'
                        } от ${ctx.from?.first_name ?? 'Пользователь'} (${ctx.from!.id})`
                    )
                    .then(async (thread) => {
                        db.threadId = thread.message_thread_id;
                        db.sendCooldown = Date.now() + ms('10m');
                        db.isOpenThread = true;

                        await db.save();
                    });

                await ctx.reply(
                    `Ожидай, твой 
                    ${
                        (ctx.callbackQuery as any).data == 'CreateOrder'
                            ? 'заказ'
                            : 'вопрос'
                    } 
                    добавлен в очередь.`
                );
            }
        );

        this.bot.on('message', async (ctx: Context) => {
            if (ctx.message?.is_topic_message) {
                const db = await OrderModel.findOne({
                    threadId: ctx.message.message_thread_id
                });

                if (db) {
                    await ctx.copyMessage(db.user!).catch(() => {});
                }
            } else {
                const db = await OrderModel.findOne({
                    user: ctx.from!.id
                });

                if (db && db.threadId !== 0) {
                    await ctx.forwardMessage(config.chatId, {
                        message_thread_id: db.threadId
                    });
                }
            }
        });

        this.bot.launch();
    }
}

const Bot = new TelegramBot();
Bot.init().then(() => console.log('Бот запущен'));
