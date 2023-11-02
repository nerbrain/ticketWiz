import { Injectable, Logger } from '@nestjs/common';
import { gql, request } from 'graphql-request';

interface Event {
  name: string;
  description: string;
  venue: string;
  date: string;
  id: string;
}

interface User {
  name: string;
  email: string;
  telegramId: string;
  submitedName: string;
}

interface Users {
  user: User;
}

interface Tickets {
  tickets: Ticket[];
}

interface Ticket {
  event: Event;
}

interface EventRequestApiResponse {
  events: Event[];
}

@Injectable()
export class ExternalApiService {
  private logger = new Logger();
  private endpoint = 'http://localhost:3000/api/graphql'; // Replace with the actual endpoint

  async fetchDataFromExternalApi(): Promise<any> {
    // const endpoint = 'http://localhost:3000/api/graphql'; // Replace with the actual endpoint
    const query = gql`
      query {
        events {
          name
          description
          venue
          date
          id
        }
      }
    `;

    try {
      const data: EventRequestApiResponse = await request(this.endpoint, query);
      for (const event of data.events) {
        this.logger.debug(`Event Name: ${event.name}`);
      }
      return data.events;
    } catch (error) {
      console.error('Error fetching data from external API:', error);
      throw new Error('Error fetching data from external API');
    }
  }

  async createUser(telegramId, name): Promise<any> {
    const query = gql`
      mutation ($data: UserCreateInput!) {
        createUser(data: $data) {
          name
          email
          telegramId
          submitedName
        }
      }
    `;
    const variables = {
      data: {
        name: name,
        telegramId: telegramId,
      },
    };

    try {
      const data = await request(this.endpoint, query, variables);
      this.logger.debug(`create user: ${data}`);
      if (data!) {
        return data;
      } else {
        return 'error';
      }
      // this.createTicket(variables.data.telegramId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
  }

  async createTicket(telegramId, eventId: string): Promise<any> {
    this.logger.debug(`createTicket Event - ${eventId}`);
    const query = gql`
      mutation ($data: TicketCreateInput!) {
        createTicket(data: $data) {
          event {
            name
          }
          owner {
            telegramId
          }
        }
      }
    `;
    const variables = {
      data: {
        event: {
          connect: {
            id: eventId,
          },
        },
        owner: {
          connect: {
            telegramId: telegramId,
          },
        },
      },
    };

    try {
      const data = await request(this.endpoint, query, variables);
      this.logger.debug(`data: ${data}`);
      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error('Error creating ticket');
    }
  }

  async userManagment(telegramID): Promise<any> {
    const query = gql`
      query User($where: UserWhereUniqueInput!) {
        user(where: $where) {
          name
        }
      }
    `;

    const variables = {
      where: {
        telegramId: telegramID,
      },
    };

    try {
      const data: Users = await request(this.endpoint, query, variables);
      if (data.user != undefined) {
        this.logger.debug(`data: ${data.user.name}`);
        return data;
      } else {
        this.logger.debug(`User not there`);
        return null;
      }
    } catch (error) {
      console.error('Cannot verify user:', error);
      throw new Error('Cannot verify user');
    }
  }

  async checkTickets(userId): Promise<any> {
    const query = gql`
      query Tickets($where: TicketWhereInput!) {
        tickets(where: $where) {
          event {
            name
            description
            venue
            date
            id
          }
        }
      }
    `;

    const variables = {
      where: {
        owner: {
          telegramId: {
            equals: userId,
          },
        },
      },
    };

    try {
      const data: Tickets = await request(this.endpoint, query, variables);
      this.logger.debug(`Tickets Data: ${data.tickets}`);
      if (data == undefined || data.tickets.length === 0) {
        return undefined;
      } else {
        // this.logger.debug(data.tickets);
        for (const ticket of data.tickets) {
          this.logger.debug(`Event Name: ${ticket.event.name}`);
        }
        return data.tickets;
      }
    } catch (error) {
      console.error('Error finding tickets', error);
      throw new Error('Error finding tickets');
    }
  }
}
