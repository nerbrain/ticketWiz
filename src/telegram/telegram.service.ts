import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup, Telegraf } from 'telegraf';
import 'dotenv/config';

@Injectable()
export class TelegramService {
  private events: any[] = [
    { id: 0, name: 'Event0' },
    { id: 1, name: 'Event1' },
    { id: 2, name: 'Event2' },
    { id: 3, name: 'Event3' },
    { id: 4, name: 'Event4' },
    { id: 5, name: 'Event5' },
    { id: 6, name: 'Event6' },
    { id: 7, name: 'Event7' },
    { id: 8, name: 'Event8' },
    { id: 9, name: 'Event9' },
  ];

  private logger = new Logger(TelegramService.name);
  private name: string;
  private email: string;

  public bookTicket(ctx: Context) {
    ctx.reply('Book Event');
  }

  public viewEvents(ctx: Context, bot: Telegraf) {
    const buttons = this.events.map((event) =>
      Markup.button.callback(event.name, `event-${event.id}`)
    );

    const keyboard = Markup.inlineKeyboard([...buttons], { columns: 2 });

    ctx.reply('Choose an event:', keyboard);

    // Handle the selected event
    this.events.forEach((event) => {
      this.logger.debug(`event-${event.id}`);
      bot.action(`event-${event.id}`, (ctx) => {
        ctx.reply(`You selected ${event.name}`);
        ctx.reply('Please enter your name:');
        bot.on('text', (ctx) => {
          if (!this.name) {
            this.name = ctx.message.text; // Store the submitted name in the 'name' variable
            this.logger.debug(`Submitted name: ${this.name}`);
            ctx.reply('Please enter your email address:');
          } else if (!this.email) {
            this.email = ctx.message.text;
            this.logger.debug(`Submitted email: ${this.email}`);
            // Proceed with the next step in the conversation flow
          }
        });
      });
    });
  }
}
