import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup, Telegraf } from 'telegraf';
import 'dotenv/config';
import { ExternalApiService } from '../external-api/externalApiRequest';

@Injectable()
export class TelegramService {
  // private events: any[] = [
  //   { id: 0, name: 'Event0' },
  //   { id: 1, name: 'Event1' },
  //   { id: 2, name: 'Event2' },
  //   { id: 3, name: 'Event3' },
  //   { id: 4, name: 'Event4' },
  //   { id: 5, name: 'Event5' },
  //   { id: 6, name: 'Event6' },
  //   { id: 7, name: 'Event7' },
  //   { id: 8, name: 'Event8' },
  //   { id: 9, name: 'Event9' },
  // ];

  externalAPI = new ExternalApiService();
  // private events: Event[];
  public events: any;

  private logger = new Logger(TelegramService.name);
  private name: string;
  private email: string;

  public async bookTicket(ctx: Context) {
    ctx.reply('Book Event');
    // this.eventsDemo = await this.externalAPI.fetchDataFromExternalApi();
  }

  public async viewEvents(ctx: Context, bot: Telegraf) {
    // this.events = await this.externalAPI.fetchDataFromExternalApi();
    this.events = await this.externalAPI.fetchDataFromExternalApi();
    this.logger.debug(`Events ${this.events}`);
    const buttons = this.events.map((event) =>
      Markup.button.callback(event.name, `event-${event.id}`),
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
            this.externalAPI.createTicket(
              ctx.message.from.id.toString(),
              event.id,
            );

            //clear variables
            this.name = null;
            this.email = null;
            // Proceed with the next step in the conversation flow
          }
        });
      });
    });
  }
}
