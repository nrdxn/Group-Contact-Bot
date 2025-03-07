import { Client } from './ClientClass';
import { Context, Markup } from 'telegraf';

const client = new Client();

export const start = () => {
    client.logger.listen();

    client.bot.command('start', async (ctx: Context) => {
        await ctx.replyWithPhoto(
            'https://i.pinimg.com/736x/21/ab/7e/21ab7e04c08ce15d2b94c28d9edba996.jpg',
            {
                caption:
                    '❤ Доброе утро, моя дорогая. Решил вот так тебе преподнести поздравление. Нажми кнопочку ниже.',
                ...Markup.inlineKeyboard([
                    Markup.button.callback('Тык тык', 'Info')
                ])
            }
        );
        await ctx.sendSticker(
            'CAACAgIAAxkBAAENQYxnyyP5s2RW4yRwYzagR7pZbQ6DdwACgCEAAnDOYUvWti2w_ET0uTYE'
        );
    });

    client.bot.action('Info', async (ctx: Context) => {
        await ctx.reply(
            'Чтоб получить свое поздравление, ты должна сложить числа нашего рождения и начала наших отношений, плюс мое любимое число от 1 до 10'
        );
    });

    client.bot.on('message', async (ctx: Context) => {
        if (ctx.text !== '42') {
            return await ctx.reply('Нуну, кариш, попробуй еще раз');
        } else {
            await ctx.reply('Ну умница такая ❤. Секундочку...');
            setTimeout(async () => {
                return await ctx.sendPhoto(
                    'https://i.postimg.cc/LXMKpxMD/Picsart-25-03-07-20-02-30-687.jpg'
                );
            }, 3000);
        }
    });

    client.bot.launch();
};
