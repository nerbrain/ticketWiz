import { Injectable, Logger } from '@nestjs/common';
import { Context, Markup, Telegraf } from 'telegraf';
import 'dotenv/config';
import { ExternalApiService } from '../external-api/externalApiRequest';

@Injectable()
export class TelegramService {
  externalAPI = new ExternalApiService();
  public events: any;
  public tickets: any;
  private logger = new Logger(TelegramService.name);
  private name: string;
  private email: string;
  private currentEventId: any;

  public async bookTicket(ctx: Context) {
    ctx.reply('Book Event');
    // this.eventsDemo = await this.externalAPI.fetchDataFromExternalApi();
  }

  public async viewEvents(ctx: Context, bot: Telegraf) {
    this.events = await this.externalAPI.fetchDataFromExternalApi();
    this.logger.debug(`Events ${this.events}`);

    if(this.events)
    {
    const eventDisplayPromises = this.events.map((event) => {
      return ctx.reply(
        ` Event Name: ${event.name}\nEvent Description: ${event.description}\nEvent Venue: ${event.venue}\nEvent Date: ${event.date}\n`,
      );
    });

    await Promise.all(eventDisplayPromises);

    const buttons = this.events.map((event) =>
      Markup.button.callback(`${event.name}`, `event-${event.id}`),
    );

    const keyboard = Markup.inlineKeyboard([...buttons], { columns: 2 });

    ctx.reply('Choose an event:', keyboard);

    // Handle the selected event
    this.events.forEach((event) => {
      this.logger.debug(`All events-${event.name}`);
      bot.action(`event-${event.id}`, (ctx) => {
        this.logger.debug(`Selected Event - ${event.name}`);
        ctx.reply(`You selected ${event.name}`);
        this.handleEventSelection(ctx, event.id, bot);
      });
    });
    } else{
      ctx.reply('There are no events avaliable');
    }
  }

  public async viewTickets(ctx: Context) {

    
    this.logger.debug(ctx.from.id.toString());
    this.tickets = await this.externalAPI.checkTickets(ctx.from.id.toString());

    if (this.tickets == undefined || this.tickets == null) {
      return ctx.reply("It looks like you don't have any tickets");
    } else {
      ctx.reply(`These are all your booked tickets`);
      const eventDisplayPromises = this.tickets.map((ticket) => {
        return ctx.reply(
          `Event Name: ${ticket.event.name}\nEvent Description: ${ticket.event.description}\nEvent Venue: ${ticket.event.venue}\nEvent Date: ${ticket.event.date}\n`,
        );
      });

      await Promise.all(eventDisplayPromises);
    }
  }

  // Function to handle event selection
  private handleEventSelection(ctx: Context, eventId: any, bot: Telegraf) {
    this.currentEventId = eventId;
    this.logger.debug(`handleEventSelection 1 - ${this.currentEventId}`);
    // ctx.reply(`You selected ${event.name}`);
    ctx.reply('Please enter your name:');

    bot.on('text', (ctx) => {
      if (!this.name) {
        this.name = ctx.message.text; // Store the submitted name in the 'name' variable
        this.logger.debug(`Submitted name: ${this.name}`);
        ctx.reply('Please enter your email address:');
      } else if (!this.email) {
        this.email = ctx.message.text;
        this.logger.debug(`Submitted email: ${this.email}`);

        this.logger.debug(`handleEventSelection 2 - ${this.currentEventId}`);
        this.externalAPI.createTicket(
          ctx.message.from.id.toString(),
          this.currentEventId,
        );

        ctx.reply('Ticket Acquired');

        //Clear variables
        this.name = null;
        this.email = null;
        // Proceed with the next step in the conversation flow
        // bot.action(`event-${event.id}`, () => {});
      }
    });
  }
}
