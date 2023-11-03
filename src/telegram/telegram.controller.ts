import { Controller, Logger } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import 'dotenv/config';
import { TelegramService } from './telegram.service';
import { ExternalApiService } from 'src/external-api/externalApiRequest';

@Controller('telegram')
export class TelegramController {
  private bot: Telegraf;
  private logger = new Logger(TelegramController.name);
  telegramService = new TelegramService();
  externalAPI = new ExternalApiService();

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.setupBot();
    this.bot.launch();
  }

  private setupBot(): void {
    // this.bot.start((ctx) => ctx.reply('Welcome!'));
    this.bot.start((ctx) => this.handleStart(ctx));
    // this.bot.on('message', (ctx) => this.handleStart(ctx));

    // this.bot.action('button1', (ctx) => this.telegramService.bookTicket(ctx));
    this.bot.action('button1', (ctx) => this.telegramService.viewTickets(ctx));
    this.bot.action('button2', (ctx) =>
      this.telegramService.viewEvents(ctx, this.bot),
    );
  }

  private async handleStart(ctx: Context) {
    this.logger.debug(ctx.message);
    // this.externalAPI.createUser(
    //   ctx.message.from.id.toString(),
    //   `${ctx.message.from.first_name} ${ctx.message.from.last_name}`,
    // );

    //Check if user is already registered
    const userStatus = await this.externalAPI.userManagment(
      ctx.message.from.id.toString(),
      
    );
      
    if (userStatus == null) {
      this.logger.debug(userStatus);
      this.externalAPI.createUser(
        ctx.message.from.id.toString(),
        `${ctx.message.from.first_name} ${ctx.message.from.last_name}`,
      );
    }

    const inlineKeyboardMarkup = {
      inline_keyboard: [
        [{ text: 'View Ticket', callback_data: 'button1' }],
        [{ text: 'View Events', callback_data: 'button2' }],
      ],
    };

    ctx.reply(
      `Hello ${ctx.message.from.first_name}.\n Welcome to TicketWiz.\n How can I help you?`,
      {
        reply_markup: {
          inline_keyboard: inlineKeyboardMarkup.inline_keyboard,
        },
      },
    );
  }
}
