import { Controller, Logger } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import 'dotenv/config';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  private bot: Telegraf;
  private logger = new Logger(TelegramController.name);
  telegramService = new TelegramService();

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.setupBot();
    this.bot.launch();
  }

  private setupBot(): void {
    // this.bot.start((ctx) => ctx.reply('Welcome!'));
    this.bot.start((ctx) => this.handleStart(ctx));
    // this.bot.on('message', (ctx) => this.handleStart(ctx));

    this.bot.action('button1', (ctx) => this.telegramService.bookTicket(ctx));
    this.bot.action('button2', (ctx) =>
      this.telegramService.viewEvents(ctx, this.bot),
    );
  }

  private handleStart(ctx: Context) {
    this.logger.debug(ctx.message);
    const inlineKeyboardMarkup = {
      inline_keyboard: [
        [{ text: 'Book Ticket', callback_data: 'button1' }],
        [{ text: 'View Events', callback_data: 'button2' }],
      ],
    };

    ctx.reply('Welcome. How can I help you?', {
      reply_markup: {
        inline_keyboard: inlineKeyboardMarkup.inline_keyboard,
      },
    });
  }
}
