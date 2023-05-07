import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from '../events.module';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { INestApplication } from '@nestjs/common';

class ConnectionMock {
  app: INestApplication;
  server;
  port: number;
  client: Socket<DefaultEventsMap, DefaultEventsMap>;
  client2: Socket<DefaultEventsMap, DefaultEventsMap>;
  username: string;
  username2: string;

  async start(_username: string, _username2?: string) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();
    this.port = Math.floor(Math.random() * 1001) + 5000;
    this.app = await moduleFixture.createNestApplication();
    await this.app.listen(this.port);
    this.server = await this.app.getHttpServer();
    await this.startClient(_username, _username2);
  }

  async startClient(username: string, username2?: string) {
    this.username = username;
    this.client = io(`http://localhost:${this.port}`, {
      // @ts-ignore
      query: `user=${username}`,
    });
    if (username2) {
      this.username2 = username2;
      this.client2 = io(`http://localhost:${this.port}`, {
        // @ts-ignore
        query: `user=${username2}`,
      });
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
    }
    if (this.app) {
      await this.app.close();
    }
  }
}

export default ConnectionMock;
