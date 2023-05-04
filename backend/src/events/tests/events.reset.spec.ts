import ConnectionMock from './utils';
import { IInitialState } from '../../types/initial-state';
import { IScoreboard } from '../../types/scoreboard';

jest.mock<IInitialState>('../initial.states', () => ({
  __esModule: true,
  sessions: [],
  scoreboard: {
    team1: {
      score: 0,
      players: ['', ''],
    },
    team2: {
      score: 0,
      players: ['', ''],
    },
  },
  points: [],
  round: 0,
  handTurn: '',
  roundTurn: '',
  hands: [],
  manilha: null,
  handling: [],
}));
describe('Game in progress', () => {
  const connectionMock = new ConnectionMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    await connectionMock.start('John Doe');
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should state be cleared after calling reset', (done) => {
    let tookSeat;
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        expect(scoreboard.team1.players[0]).toMatch('Kate Austin');
        tookSeat = true;
      },
    );
    connectionMock.client.on('restart', () => {
      if (tookSeat) {
        done();
      }
    });
    connectionMock.client.emit('takeseat', {
      playername: 'Kate Austin',
      seat: { team: 'team1', chair: 0 },
    });
    connectionMock.client.emit('restart');
  });
});
