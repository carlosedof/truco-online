import { ICard } from '../types/card';
import {
  handling,
  hands,
  handTurn,
  handValue,
  round,
  scoreboard,
  sessions,
  manilha,
  roundTurn,
  points,
} from './initial.states';
import { Inject, Injectable } from '@nestjs/common';
import { IPoint } from '../types/point';
import { UserInfo } from '../types/user-info';
import { IHand } from '../types/hand';
import { cards } from '../constants/cards';
import { LobbyService } from './lobby.service';

@Injectable()
export class GameService {
  handling: { card: ICard; player: string }[] = Object.assign([], handling);
  points: IPoint[] = Object.assign([], points);
  // scoreboard: IScoreboard = JSON.parse(JSON.stringify(scoreboard));
  sessions: UserInfo[] = Object.assign([], sessions);
  hands: IHand[] = Object.assign([], hands);
  round: number = round;
  handValue: number = handValue;
  handTurn: string = handTurn;
  roundTurn: string = roundTurn;
  manilha: ICard = Object.assign({}, manilha);

  constructor(
    @Inject(LobbyService) private readonly lobbyService: LobbyService,
  ) {}

  public pickRandomCard(availableCards): {
    pickedCard: ICard;
    pickedCardIndex: number;
  } {
    const pickedCardIndex = Math.floor(Math.random() * availableCards.length);
    return { pickedCard: availableCards[pickedCardIndex], pickedCardIndex };
  }

  public dealCards() {
    this.hands = [];
    this.manilha = null;
    // copy the cards array to avoid mutating the original array
    const availableCards = [...cards];
    const _hands = [];
    // there are 4 players to deal cards
    [...Array(4)].forEach(() => {
      const hand = [];
      // each player has 3 cards
      [...Array(3)].forEach(() => {
        // pick a random card from the available cards
        const { pickedCard, pickedCardIndex } =
          this.pickRandomCard(availableCards);
        // remove the card from the available card
        availableCards.splice(pickedCardIndex, 1);
        hand.push(pickedCard);
      });
      _hands.push(hand);
    });

    // distribute hands to players
    this.hands = _hands.map((h, i) => ({
      cards: _hands[i],
      player:
        this.lobbyService.scoreboard[i % 2 === 0 ? 'team1' : 'team2'].players[
          Math.floor(i / 2)
        ],
    }));

    // generate "manilha"
    const { pickedCard, pickedCardIndex } = this.pickRandomCard(availableCards);
    availableCards.splice(pickedCardIndex, 1);
    this.manilha = pickedCard;
  }

  public addPlayedCardToState(card, player): void {
    const _hands = [...this.hands];
    let hand = _hands?.find((h) => {
      return h.player === player;
    });
    hand = {
      player: player,
      cards: hand?.cards?.filter(
        (c: ICard) => !(c.nr === card.nr && c.suit === card.suit),
      ),
    };
    let index;
    this.hands.map((hh, i) => {
      if (hh.player === player) {
        index = i;
      }
    });
    if (index !== -1) {
      this.hands[index] = hand;
    }
    this.handling.push({ card, player });
  }

  public resetState(): void {
    this.hands = Object.assign([], hands);
    this.manilha = Object.assign({}, manilha);
    this.handling = Object.assign([], handling);
    this.lobbyService.scoreboard = JSON.parse(JSON.stringify(scoreboard));
    this.handTurn = handTurn;
    this.handValue = handValue;
    this.roundTurn = roundTurn;
    this.round = round;
    this.points = Object.assign([], points);
  }
}
