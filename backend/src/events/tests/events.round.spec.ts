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
      score: 0,
      players: ['James Sawyer', 'Sayid Jarrah'],
    },
  },
  points: [{}, {}, {}],
  round: 1,
  handTurn: '',
  roundTurn: '',
  hands: [],
  manilha: { suit: 'h', nr: 'A' },
  handling: [],
}));
describe('On table, validate round sequence', () => {
  const connectionMock = new ConnectionMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    await connectionMock.start('John Doe');
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should the team 2 position 1 play after team 1 position 0', (done) => {
    connectionMock.client.on('turn', ({ turn }: { turn: string }) => {
      expect(turn).toMatch('Sayid Jarrah');
      done();
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'John Locke',
    });
  });

  it('should the team 1 position 1 play after team 2 position 1', (done) => {
    connectionMock.client.on('turn', ({ turn }: { turn: string }) => {
      expect(turn).toMatch('Jack Shephard');
      done();
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'Sayid Jarrah',
    });
  });

  it('should the team 2 position 0 play after team 1 position 1', (done) => {
    connectionMock.client.on('turn', ({ turn }: { turn: string }) => {
      expect(turn).toMatch('James Sawyer');
      done();
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'Jack Shephard',
    });
  });

  it('should the team 1 position 0 play after team 2 position 0', (done) => {
    connectionMock.client.on('turn', ({ turn }: { turn: string }) => {
      console.log(turn);
      expect(turn).toMatch('John Locke');
      done();
    });
    connectionMock.client.emit('played', {
      card: { suit: 'h', nr: 'K' },
      player: 'James Sawyer',
    });
  });
});
