import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { EventsModule } from '../events.module';

jest.mock('../initial.states', () => ({
  sessions: [],
  scoreboard: {
    team1: {
      score: 0,
      players: ['John Locke', 'Jack Shephard'],
    },
    team2: {
      score: 0,
      players: ['James Sawyer', ''],
    },
  },
  points: [{}, {}, {}],
  round: 0,
  handTurn: '',
  roundTurn: '',
  hands: [],
  manilha: null,
  handling: [],
}));

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let client: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
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

  it('should set start the game when there is 4 players', (done) => {
    client.once('ready', ({ ready }: { ready: boolean }) => {
      expect(ready).toBeTruthy();
      done();
    });
    client.emit('takeseat', {
      playername: 'LastPlayer',
      seat: { team: 'team2', chair: 1 },
    });
  });
});
