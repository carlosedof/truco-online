import { IScoreboard } from '../../types/scoreboard';
import ConnectionMock from './utils';
import { IInitialState } from '../../types/initial-state';

jest.mock<IInitialState>('../initial.states', () => ({
  __esModule: true,
  sessions: [],
  scoreboard: {
    team1: {
      score: 0,
      players: ['Kate Austin', 'Juliet Burke'],
    },
    team2: {
      score: 0,
      players: ['', ''],
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

describe('On lobby, sit and leave seat', () => {
  let username: string;
  const connectionMock = new ConnectionMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    username = Math.random().toString(36).substring(7);
    await connectionMock.start(username);
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should return empty chair when user stands up', (done) => {
    const timeout = setTimeout(() => {
      done();
    }, 2000);
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(scoreboard.team1.players[0]).toMatch('');
      },
    );
    connectionMock.client.emit('takeseat', {
      playername: 'Kate Austin',
      seat: { team: 'team1', chair: 0 },
    });
  });

  it('should change chair when user stands up from one and sits at another one', (done) => {
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(scoreboard.team2.players[0]).toMatch('Kate Austin');
        expect(scoreboard.team1.players[0]).toMatch('');
        done();
      },
    );
    connectionMock.client.emit('takeseat', {
      playername: 'Kate Austin',
      seat: { team: 'team2', chair: 0 },
    });
  });

  it('should not start game after trying to sit in a unavailable chair', (done) => {
    const timeout = setTimeout(() => {
      done();
    }, 2000);
    connectionMock.client.once('ready', () => {
      fail('Should not start game');
    });
    connectionMock.client.emit('takeseat', {
      playername: 'Ana Lucia',
      seat: { team: 'team2', chair: 0 },
    });
  });

  it('should start the game when there is 4 players', (done) => {
    connectionMock.client.once('ready', ({ ready }: { ready: IScoreboard }) => {
      expect(ready).toBeTruthy();
      done();
    });
    connectionMock.client.emit('takeseat', {
      playername: 'Sun Kwon',
      seat: { team: 'team2', chair: 0 },
    });
    connectionMock.client.emit('takeseat', {
      playername: 'Claire Littleton',
      seat: { team: 'team2', chair: 1 },
    });
  });
});
