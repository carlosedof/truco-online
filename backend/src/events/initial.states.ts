import { IScoreboard } from '../types/scoreboard';
import { IPoint } from '../types/point';
import { UserInfo } from '../types/user-info';
import { IHand } from '../types/hand';
import { ICard } from '../types/card';

export const sessions: UserInfo[] = [];

export const scoreboard: IScoreboard = {
  team1: {
    score: 0,
    players: ['a', 'b'],
  },
  team2: {
    score: 0,
    players: ['', 'c'],
  },
};
export const points: IPoint[] = [{}, {}, {}];
export const round = 0;
export const handValue = 0;
export const handTurn = '';
export const roundTurn = '';
export const hands: IHand[] = [];
export const manilha: ICard = null;
export const handling: { card: ICard; player: string }[] = [];
