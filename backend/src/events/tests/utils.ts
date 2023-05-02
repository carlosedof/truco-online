import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from '../events.module';
import { io } from 'socket.io-client';

class ConnectionMock {
  app;
  server;
  port;
  client;
  username;

  async start(_username) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();
    this.port = Math.floor(Math.random() * 1001) + 5000;
    this.app = await moduleFixture.createNestApplication();
    await this.app.listen(this.port);
    this.server = await this.app.getHttpServer();
    await this.startClient(_username);
  }

  async startClient(username) {
    this.username = username;
    this.client = io(`http://localhost:${this.port}`, {
      // @ts-ignore
      query: `user=${username}}`,
    });
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
