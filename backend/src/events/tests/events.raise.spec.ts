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
    await connectionMock.start('Sayid Jarrah');
  });

  afterEach(async () => {
    await connectionMock.disconnect();
  });

  it('should request raise, accept and add 3 points to score', (done) => {
    connectionMock.client.once('raiserequest', () => {
      connectionMock.client.emit('raiseresponse', {
        response: true,
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
});
