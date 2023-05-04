import ConnectionMock from './utils';
import { IInitialState } from '../../types/initial-state';
import { IScoreboard } from '../../types/scoreboard';
import { IPoint } from '../../types/point';

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
      card: { suit: 'h', nr: '7' },
      player: 'John Locke',
    },
  ],
}));
describe('On table, second round after a win at the first one', () => {
  const connectionMock = new ConnectionMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    await connectionMock.start('John Doe');
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should the team that won the round gain a point in case of draw at the first round', (done) => {
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        if (scoreboard?.team2?.score === 2) {
          done();
        }
      },
    );
    connectionMock.client.emit('played', {
      card: { suit: 's', nr: 'K' },
      player: 'Jack Shephard',
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'Sayid Jarrah',
    });
  });

  it('should have third round after one win for each team', (done) => {
    let manilhaCalled = false;
    let scoreboardCalled = false;
    connectionMock.client.on('turn', ({ turn }: { turn: string }) => {
      if (turn === 'Jack Shephard') {
        manilhaCalled = true;
        if (scoreboardCalled) {
          done();
        }
      }
    });
    connectionMock.client.on('points', ({ points }: { points: IPoint[] }) => {
      if (points) {
        scoreboardCalled = true;
        if (manilhaCalled && points[1]?.winner === 'Jack Shephard') {
          done();
        }
      }
    });
    connectionMock.client.emit('played', {
      card: { suit: 's', nr: 'A' },
      player: 'Jack Shephard',
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'Sayid Jarrah',
    });
  });
});
