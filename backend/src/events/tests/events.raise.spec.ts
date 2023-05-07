import ConnectionMock from './utils';
import { IInitialState } from '../../types/initial-state';
import { IScoreboard } from '../../types/scoreboard';
import { IPoint } from '../../types/point';
import { handValue } from '../initial.states';

jest.mock<IInitialState>('../initial.states', () => ({
  __esModule: true,
  sessions: [],
  scoreboard: {
    team1: {
      score: 0,
      players: ['John Locke', 'Jack Shephard'],
    },
    team2: {
      score: 1,
      players: ['James Sawyer', 'Sayid Jarrah'],
    },
  },
  points: [
    {
      winner: 'Sayid Jarrah',
    },
    {},
    {},
  ],
  round: 1,
  handValue: 1,
  handTurn: '',
  roundTurn: '',
  hands: [],
  manilha: { suit: 'h', nr: 'A' },
  handling: [
    {
      card: { suit: 'h', nr: 'J' },
      player: 'James Sawyer',
    },
    {
      card: { suit: 'h', nr: 'Q' },
      player: 'John Locke',
    },
    {
      card: { suit: 'h', nr: '7' },
      player: 'Jack Shephard',
    },
  ],
}));

describe('Raise round value logic', () => {
  const connectionMock = new ConnectionMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    await connectionMock.start('Sayid Jarrah', 'John Locke');
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should request raise, accept and add 3 points to score', (done) => {
    connectionMock.client.once('raiserequest', () => {
      connectionMock.client.emit('raiseresponse', {
        response: 'accept',
      });
    });
    connectionMock.client.once('raiseresponse', () => {
      connectionMock.client.emit('played', {
        card: { suit: 'h', nr: 'K' },
        player: 'Sayid Jarrah',
      });
    });
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(scoreboard?.team2?.score).toBe(4);
        done();
      },
    );
    connectionMock.client.emit('raiserequest');
  });

  it('should request raise, deny and add 1 point to score', (done) => {
    connectionMock.client.once('raiserequest', () => {
      connectionMock.client.emit('raiseresponse', {
        response: 'deny',
      });
    });
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(
          scoreboard?.team1?.score === 1 && scoreboard?.team2?.score === 1,
        ).toBeTruthy();
        done();
      },
    );
    connectionMock.client.emit('raiserequest');
  });

  it('should request raise, accept and the response is doubled', (done) => {
    connectionMock.client.on('raiserequest', ({ team, user }) => {
      if (user === 'Sayid Jarrah') {
        connectionMock.client2.emit('raiseresponse', {
          response: 'raise',
        });
      } else {
        connectionMock.client.emit('raiseresponse', {
          response: 'accept',
        });
      }
    });
    connectionMock.client.on(
      'raiseresponse',
      ({ response }: { response: string }) => {
        if (response === 'accept') {
          connectionMock.client.emit('played', {
            card: { suit: 'h', nr: 'K' },
            player: 'Sayid Jarrah',
          });
        }
      },
    );
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(scoreboard?.team2?.score).toBe(7);
        done();
      },
    );
    connectionMock.client.emit('raiserequest');
  });

  it('should request raise twice, accept and the response is raised twice', (done) => {
    let raiseCount = 0;
    connectionMock.client.on('raiserequest', ({ user }) => {
      if (user === 'Sayid Jarrah') {
        if (raiseCount === 0) {
          connectionMock.client2.emit('raiseresponse', {
            response: 'raise',
          });
        } else {
          connectionMock.client2.emit('raiseresponse', {
            response: 'accept',
          });
        }
        raiseCount++;
      } else {
        connectionMock.client.emit('raiseresponse', {
          response: 'raise',
        });
      }
    });
    connectionMock.client.on(
      'raiseresponse',
      ({ response }: { response: string }) => {
        if (response === 'accept') {
          connectionMock.client.emit('played', {
            card: { suit: 'h', nr: 'K' },
            player: 'Sayid Jarrah',
          });
        }
      },
    );
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(scoreboard?.team2?.score).toBe(10);
        done();
      },
    );
    connectionMock.client.emit('raiserequest');
  });

  it('should request raise three times, end round and reinitialize scoreboard', (done) => {
    let raiseCount = 0;
    let gameEnded = false;
    connectionMock.client.on('raiserequest', ({ user }) => {
      if (user === 'Sayid Jarrah') {
        if (raiseCount === 2) {
          connectionMock.client2.emit('raiseresponse', {
            response: 'accept',
          });
        } else {
          connectionMock.client2.emit('raiseresponse', {
            response: 'raise',
          });
        }
        raiseCount++;
      } else {
        connectionMock.client.emit('raiseresponse', {
          response: 'raise',
        });
      }
    });
    connectionMock.client.on(
      'raiseresponse',
      ({ response }: { response: string }) => {
        if (response === 'accept') {
          connectionMock.client.emit('played', {
            card: { suit: 'h', nr: 'K' },
            player: 'Sayid Jarrah',
          });
        }
      },
    );
    connectionMock.client.once(
      'endgame',
      ({ winnerTeam }: { winnerTeam: string }) => {
        expect(winnerTeam).toBe('team2');
        gameEnded = true;
      },
    );
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(scoreboard?.team2?.score).toBe(0);
        expect(scoreboard?.team1?.score).toBe(0);
        expect(gameEnded).toBeTruthy();
        done();
      },
    );
    connectionMock.client.emit('raiserequest');
  });
});
