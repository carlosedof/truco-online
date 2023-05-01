import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../app.module';
import { IScoreboard } from '../../types/scoreboard';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let client: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(5008);

    server = app.getHttpServer();
    client = io('http://localhost:5008', {
      // @ts-ignore
      query: `user=token`,
    });
  });

  afterEach(async () => {
    client.disconnect();
    await app.close();
  });

  it('should seat at the chosen position', (done) => {
    client.once('scoreboard', ({ scoreboard }: { scoreboard: IScoreboard }) => {
      expect(scoreboard.team2.players[1]).toMatch('testt');
      done();
    });
    client.emit('takeseat', {
      playername: 'testt',
      seat: { team: 'team2', chair: 1 },
    });
  });

  // it('should receive "Hello World" from serverrr', (done) => {
  //   client.on('scoreboard', (message: string) => {
  //     client.emit('takeseat', {
  //       playername: 'test',
  //       seat: { team: 'team1', chair: 1 },
  //     });
  //     console.log('message', message);
  //     expect(message).toBe('Hello World');
  //     done();
  //   });
  // });
});

// describe('Socket.IO', () => {
//   let clientSocket: Socket;
//
//   beforeAll((done) => {
//     // Connect to Socket.IO server
//     clientSocket = io('http://localhost:5008');
//
//     // Wait for connection to be established
//     clientSocket.on('connect', () => {
//       done();
//     });
//   });
//
//   afterAll(() => {
//     // Disconnect from Socket.IO server
//     clientSocket.disconnect();
//   });
//
//   // it('should receive "hello" event', (done) => {
//   //   clientSocket.on('hello', (data: string) => {
//   //     expect(data).toEqual('world');
//   //     done();
//   //   });
//   //
//   //   // Emit "hello" event from server
//   //   clientSocket.emit('hello');
//   // });
// });
