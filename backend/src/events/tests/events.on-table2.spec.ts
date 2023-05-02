import ConnectionMock from './utils';
import { IInitialState } from '../../types/initial-state';
import { ICard } from '../../types/card';
import { IScoreboard } from '../../types/scoreboard';

jest.mock<IInitialState>('../initial.states', () => ({
  __esModule: true,
  sessions: [],
  scoreboard: {
    team1: {
      score: 0,
      players: ['John Locke', 'Jack Shephard'],
    },
    team2: {
      score: 0,
      players: ['James Sawyer', 'Sayid Jarrah'],
    },
  },
  points: [
    {
      draw: true,
    },
    {},
    {},
  ],
  round: 1,
  handTurn: '',
  roundTurn: '',
  hands: [],
  manilha: { suit: 'h', nr: 'A' },
  handling: [
    {
      card: { suit: 'h', nr: 'Q' },
      player: 'Jack Shephard',
    },
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
describe('On table, second round after a draw at the first one', () => {
  const connectionMock = new ConnectionMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    await connectionMock.start('John Doe');
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should the player with the higher card win, start new turn and add a point to correct team ', (done) => {
    let manilhaCalled = false;
    let scoreboardCalled = false;
    connectionMock.client.on('manilha', ({ manilha }: { manilha: ICard }) => {
      if (manilha) {
        manilhaCalled = true;
        if (scoreboardCalled) {
          done();
        }
      }
    });
    connectionMock.client.once(
      'scoreboard',
      ({ scoreboard }: { scoreboard: IScoreboard }) => {
        if (scoreboard) {
          scoreboardCalled = true;
          if (manilhaCalled && scoreboard.team2.score === 1) {
            done();
          }
        }
      },
    );
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'Sayid Jarrah',
    });
  });
});
