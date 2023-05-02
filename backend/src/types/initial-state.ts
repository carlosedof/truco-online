import { UserInfo } from './user-info';
import { IScoreboard } from './scoreboard';
import { IPoint } from './point';
import { IHand } from './hand';
import { ICard } from './card';

export interface IInitialState {
  sessions: UserInfo[];
  scoreboard: IScoreboard;
  points: IPoint[];
  round: number;
  handTurn: string;
  roundTurn: string;
  hands: IHand[];
  manilha: ICard;
  handling: { card: ICard; player: string }[];
}
