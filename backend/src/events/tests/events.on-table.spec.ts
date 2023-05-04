import ConnectionMock from './utils';
import { IInitialState } from '../../types/initial-state';

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
  points: [{}, {}, {}],
  round: 0,
  handValue: 1,
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
      card: { suit: 'h', nr: '6' },
      player: 'James Sawyer',
    },
  ],
}));
describe('On table, very first round card strength logic', () => {
  const connectionMock = new ConnectionMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    await connectionMock.start('John Doe');
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should the player with the higher card win', (done) => {
    connectionMock.client.once(
      'winnerround',
      ({ winner }: { winner: string }) => {
        expect(winner).toMatch('Sayid Jarrah');
        done();
      },
    );
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: '7' },
      player: 'John Locke',
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'Sayid Jarrah',
    });
  });

  it('should result in draw when players throw same card that is not manilha', (done) => {
    connectionMock.client.once(
      'winnerround',
      ({ winner }: { winner: string }) => {
        // TODO change to draw
        expect(winner).toMatch('draw');
        done();
      },
    );
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'John Locke',
    });
    connectionMock.client.emit('played', {
      card: { suit: 's', nr: 'K' },
      player: 'Sayid Jarrah',
    });
  });

  it('should the higher suit win', (done) => {
    connectionMock.client.once(
      'winnerround',
      ({ winner }: { winner: string }) => {
        expect(winner).toMatch('Sayid Jarrah');
        done();
      },
    );
    connectionMock.client.emit('played', {
      card: { suit: 'd', nr: '2' },
      player: 'John Locke',
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: '2' },
      player: 'Sayid Jarrah',
    });
  });
});
