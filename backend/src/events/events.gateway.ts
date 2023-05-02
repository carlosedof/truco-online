import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { cards } from '../constants/cards';
import { ISeat } from '../types/seat';
import { IScoreboard } from '../types/scoreboard';
import { ICard } from '../types/card';
import { strengthOrder } from '../constants/strengthOrder';
import { naipeOrder } from '../constants/naipeOrder';
import { IPoint } from '../types/point';
import { UserInfo } from '../types/user-info';
import {
  points,
  scoreboard,
  sessions,
  hands,
  round,
  roundTurn,
  handTurn,
  manilha,
  handling,
} from './initial.states';
import { IHand } from '../types/hand';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  points: IPoint[] = Object.assign([], points);
  // scoreboard: IScoreboard = Object.assign({}, scoreboard);
  scoreboard: IScoreboard = JSON.parse(JSON.stringify(scoreboard));
  sessions: UserInfo[] = Object.assign([], sessions);
  hands: IHand[] = Object.assign([], hands);
  round: number = round;
  handTurn: string = handTurn;
  roundTurn: string = roundTurn;
  manilha: ICard = Object.assign({}, manilha);
  handling: { card: ICard; player: string }[] = Object.assign([], handling);

  async handleConnection(socket: Socket) {
    // console.debug(`Connected on socket (${socket.handshake.query.user})`);
    this.sessions.push({ client: socket, user: socket.handshake.query.user });
    this.sessions.forEach((s) => {
      s.client.emit('connected', { scoreboard: this.scoreboard });
    });
  }

  handleDisconnect(socket: Socket) {
    let userDisconnected = null;
    this.sessions = this.sessions.filter((session) => {
      if (session?.client?.id === socket?.id) {
        userDisconnected = session.user;
        // console.debug(`Disconnected from socket (${session.user})`);
        return false;
      }
      return true;
    });
    this.sessions.forEach((s) => {
      s.client.emit('is-offline', userDisconnected?.id);
    });
  }

  @SubscribeMessage('restart')
  async handleRestart() {
    this.handleResetData();
  }

  @SubscribeMessage('takeseat')
  async handleTakeSeat(
    socket: Socket,
    payload: { playername: string; seat: ISeat },
  ) {
    this.handleNewPlayerConnected(payload.playername, payload.seat);
  }

  @SubscribeMessage('gethands')
  async handleGetHands(socket: Socket) {
    socket.emit('scoreboard', { scoreboard: this.scoreboard });
    socket.emit('turn', { turn: this.handTurn });
    socket.emit('hands', { hands: this.hands });
    socket.emit('played', { played: this.handling });
    socket.emit('manilha', { manilha: this.manilha });
  }

  @SubscribeMessage('played')
  async handlePlayedCard(
    socket: Socket,
    payload: { card: ICard; player: string },
  ) {
    const card = payload.card;
    const player = payload.player;
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
    this.sessions.forEach((s) => {
      s.client.emit('hands', { hands: this.hands });
      s.client.emit('played', { handling: this.handling });
    });
    if (this.handling.length === 4) {
      this.handleRoundWinner();
    } else {
      this.handleNextHandleTurn(false, player);
    }
  }

  handleNewPlayerConnected = (name: string, seat: ISeat) => {
    // if there is less than 4 players and the choosen seat is empty
    if (!this.scoreboard?.[seat.team]?.players[seat.chair]) {
      // if the seat is empty, add the player to the seat
      if (!this.scoreboard[seat.team].players[seat.chair]) {
        this.scoreboard[seat.team].players[seat.chair] = name;
        // if the user was already seat at the other chair of the same team, remove the user from the seat
        const playersOnTeam = this.scoreboard[seat.team].players.filter(
          (p) => p === name,
        );
        if (playersOnTeam.length > 1) {
          this.scoreboard[seat.team].players[seat.chair === 0 ? 1 : 0] = '';
        }
        // if the user was already seat at the other team, remove the user from the seat
        const otherTeam = seat.team === 'team1' ? 'team2' : 'team1';
        this.scoreboard[otherTeam].players = this.scoreboard[
          otherTeam
        ].players.map((p) => (p === name ? '' : p));
      }
      // if the player is already in the chosen seat, remove the player from the seat
    } else if (this.scoreboard[seat.team].players[seat.chair] === name) {
      this.scoreboard[seat.team].players[seat.chair] = '';
      // remove him from the connected list to avoid duplicates
    }

    // if there are 4 players, start the game
    if (
      this.scoreboard.team1.players[0] &&
      this.scoreboard.team2.players[0] &&
      this.scoreboard.team1.players[1] &&
      this.scoreboard.team2.players[1]
    ) {
      // todo check in rules who needs to start game
      // generate random number between 0 and 3 to choose who starts the game
      const turn = Math.floor(Math.random() * 4);
      switch (turn) {
        case 0:
          this.handTurn = this.scoreboard.team1.players[0];
          this.roundTurn = this.scoreboard.team1.players[0];
          break;
        case 1:
          this.handTurn = this.scoreboard.team2.players[0];
          this.roundTurn = this.scoreboard.team2.players[0];
          break;
        case 2:
          this.handTurn = this.scoreboard.team1.players[1];
          this.roundTurn = this.scoreboard.team1.players[1];
          break;
        case 3:
          this.handTurn = this.scoreboard.team2.players[1];
          this.roundTurn = this.scoreboard.team2.players[1];
          break;
      }

      // send the turn to all players
      this.sessions.forEach((s) => {
        s.client.emit('turn', { turn: this.handTurn });
      });

      // shuffle and distribute cards
      this.newHand();
    }
    this.sessions.forEach((s) => {
      s.client.emit('scoreboard', { scoreboard: this.scoreboard });
      if (
        this.scoreboard.team1.players[0] &&
        this.scoreboard.team2.players[0] &&
        this.scoreboard.team1.players[1] &&
        this.scoreboard.team2.players[1]
      ) {
        s.client.emit('ready', { ready: this.scoreboard });
      }
    });
  };

  newHand = () => {
    // clear all hands and manilha and send event to users
    this.sessions.forEach((s) => {
      s.client.emit('hands', { hands: [] });
      s.client.emit('manilha', { manilha: null });
    });
    // shuffle and distribute cards
    this.dealCards();
    // send new hands, manilha, updated scoreboard to users
    this.sessions.forEach((s) => {
      this.handling = [];
      s.client.emit('played', { handling: [] });
      s.client.emit('hands', { hands: this.hands });
      s.client.emit('manilha', { manilha: this.manilha });
      s.client.emit('scoreboard', { scoreboard: this.scoreboard });
    });
  };

  dealCards = () => {
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
        this.scoreboard[i % 2 === 0 ? 'team1' : 'team2'].players[
          Math.floor(i / 2)
        ],
    }));

    // generate "manilha"
    const { pickedCard, pickedCardIndex } = this.pickRandomCard(availableCards);
    availableCards.splice(pickedCardIndex, 1);
    this.manilha = pickedCard;
  };

  pickRandomCard = (availableCards) => {
    const pickedCardIndex = Math.floor(Math.random() * availableCards.length);
    return { pickedCard: availableCards[pickedCardIndex], pickedCardIndex };
  };

  handleRoundWinner = () => {
    setTimeout(() => {
      let winnerIndex;
      let draw;

      // gather all cards from hands
      const cards = this.handling.map((h) => h.card);
      // check for manilhas
      const manilhas = cards.filter(
        (cc) =>
          strengthOrder[strengthOrder.indexOf(cc.nr) - 1] === this.manilha.nr,
      );
      const manilhasLength = manilhas.length;

      if (manilhasLength) {
        if (manilhasLength > 1) {
          const cardLevels = [];

          // create an array with the manilha level
          manilhas.forEach((m) => {
            {
              cardLevels.push(naipeOrder.indexOf(m.suit));
            }
          });

          // get the winner naipe index
          const winnerNaipe = naipeOrder[Math.max(...cardLevels)];

          // get the card number from manilhas list with the winner index
          const winnerNr = manilhas.find((m) => m.suit === winnerNaipe).nr;

          // set the winner index from cards list
          cards.some((card, i) => {
            if (winnerNr === card.nr && winnerNaipe === card.suit) {
              winnerIndex = i;
              return true;
            }
            return false;
          });
        } else {
          // there is only one manilha
          const _manilha = manilhas[0];
          // find the winner index with the manilha
          cards.some((card, i) => {
            if (_manilha.nr === card.nr && _manilha.suit === card.suit) {
              winnerIndex = i;
              return true;
            }
            return false;
          });
        }
      } else {
        // there is no manilha
        const _strengthOrder = [...strengthOrder];
        // find the manilha number in the strength order
        const manilhaNumber = _strengthOrder.find((s) => s === this.manilha.nr);
        // remove the manilha number from the strength order
        _strengthOrder.splice(_strengthOrder.indexOf(this.manilha.nr), 1);
        // add the manilha number to the end of the strength order because it is the strongest card
        // TODO for the strongest because it should not be the last
        _strengthOrder.splice(_strengthOrder.length + 1, 0, manilhaNumber);

        const cardLevels = [];
        for (let i = 0; i <= 3; i++) {
          cardLevels.push(
            strengthOrder.indexOf(
              strengthOrder.find((so) => so === this.handling[i].card.nr),
            ),
          );
        }
        const biggestCard = Math.max(...cardLevels);
        const cardNrs = cards.map((c) => c.nr);
        if (new Set(cardNrs).size !== cardNrs.length) {
          const repeateds = cardNrs.filter(
            (item, index) => cardNrs.indexOf(item) !== index,
          );
          if (repeateds.length === 1) {
            if (biggestCard === strengthOrder.indexOf(repeateds[0])) {
              const biggestRepeatedCard = repeateds.find(
                (r) => strengthOrder.indexOf(r) === biggestCard,
              );
              const repeatedCardsHands = this.handling.filter(
                (h) => h.card.nr === biggestRepeatedCard,
              );
              const repeatedPlayers = repeatedCardsHands.map(
                (rch) => rch.player,
              );
              if (
                this.scoreboard.team1.players.find((p) =>
                  repeatedPlayers.includes(p),
                ) &&
                this.scoreboard.team2.players.find((p) =>
                  repeatedPlayers.includes(p),
                )
              ) {
                draw = true;
              } else {
                if (
                  this.scoreboard.team1.players.find((p) =>
                    repeatedPlayers.includes(p),
                  )
                ) {
                  this.handling.find((h, i) => {
                    if (this.scoreboard.team1.players.includes(h.player)) {
                      winnerIndex = i;
                      return true;
                    }
                    return false;
                  });
                } else {
                  this.handling.find((h, i) => {
                    if (this.scoreboard.team2.players.includes(h.player)) {
                      winnerIndex = i;
                      return true;
                    }
                    return false;
                  });
                }
              }
            }
          } else {
            const biggestRepeatedCard = repeateds.find(
              (r) => strengthOrder.indexOf(r) === biggestCard,
            );
            const repeatedCardsHands = this.handling.filter(
              (h) => h.card.nr === biggestRepeatedCard,
            );
            // check if repeated are from same team
            const repeatedPlayers = repeatedCardsHands.map((rch) => rch.player);
            if (
              this.scoreboard.team1.players.find((p) =>
                repeatedPlayers.includes(p),
              ) &&
              this.scoreboard.team2.players.find((p) =>
                repeatedPlayers.includes(p),
              )
            ) {
              draw = true;
            } else {
              if (
                this.scoreboard.team1.players.find((p) =>
                  repeatedPlayers.includes(p),
                )
              ) {
                this.handling.find((h, i) => {
                  if (this.scoreboard.team1.players.includes(h.player)) {
                    winnerIndex = i;
                    return true;
                  }
                  return false;
                });
              } else {
                this.handling.find((h, i) => {
                  if (this.scoreboard.team2.players.includes(h.player)) {
                    winnerIndex = i;
                    return true;
                  }
                  return false;
                });
              }
            }
          }
        }
        winnerIndex = cardLevels.indexOf(biggestCard);
      }
      this.scoreHandler(draw ? null : this.handling[winnerIndex].player);
    }, 2500);
  };

  handleNextHandleTurn = (isNewRound, player) => {
    if (this.scoreboard.team1.players.find((p) => player === p)) {
      // console.log('quem jogou foi do time 1');
      if (this.scoreboard.team1.players.indexOf(player) === 0) {
        // console.log('quem jogou foi do time 0 posicao 0');
        this.handTurn = this.scoreboard.team2.players[1];
      } else {
        // console.log('quem jogou foi do time 0 posicao 1');
        this.handTurn = this.scoreboard.team2.players[0];
      }
    } else {
      // console.log('quem jogou foi do time 2');
      if (this.scoreboard.team2.players.indexOf(player) === 0) {
        // console.log('quem jogou foi do time 2 posicao 0');
        this.handTurn = this.scoreboard.team1.players[0];
      } else {
        // console.log('quem jogou foi do time 2 posicao 1');
        this.handTurn = this.scoreboard.team1.players[1];
      }
    }
    // console.log('próximo deve ser', this.handTurn);
    // if (isNewRound) {
    //
    // }
    setTimeout(() => {
      this.sessions.forEach((s) => {
        s.client.emit('turn', { turn: this.handTurn });
      });
    }, 1200);
  };

  scoreHandler = (winnerPlayer) => {
    const isDraw = !winnerPlayer;
    let winnerTeam;
    let finishedRound;
    if (this.scoreboard.team1.players.find((p) => winnerPlayer === p)) {
      winnerTeam = 'team1';
    } else {
      winnerTeam = 'team2';
    }
    if (isDraw) {
      // mão empatada
      this.points[this.round] = { draw: true };
      if (this.round === 1 || this.round === 2) {
        // mao empatada na segunda ou ultima rodada, quem ganhou a primeira mão leva
        if (
          this.scoreboard.team1.players.find((p) => this.points[0].winner === p)
        ) {
          this.scoreboard.team1.score = this.scoreboard.team1.score + 1;
        } else {
          this.scoreboard.team2.score = this.scoreboard.team2.score + 1;
        }
        finishedRound = true;
        this.round = 0;
      } else {
        // mao empatada na primeira rodada, só mantém empate e não pontua
        this.round = this.round + 1;
      }
    } else {
      this.points[this.round] = { winner: winnerPlayer };
      if (this.round === 1) {
        // segunda mão
        // console.log('// segunda mão');
        if (this.points[0].draw) {
          // segunda mão com empate na primeira
          // console.log('// segunda mão com empate na primeira');
          this.scoreboard[winnerTeam].score =
            this.scoreboard[winnerTeam].score + 1;
          this.round = 0;
          finishedRound = true;
        } else {
          // console.log('// segunda mão sem empate na primeira');
          // segunda mão sem empate na primeira
          if (
            this.scoreboard[winnerTeam].players.includes(this.points[0].winner)
          ) {
            // o time que venceu essa mão também venceu a mão anterior
            // console.log(
            //   '// o time que venceu essa mão também venceu a mão anterior',
            // );
            this.scoreboard[winnerTeam].score =
              this.scoreboard[winnerTeam].score + 1;
            this.round = 0;
            finishedRound = true;
          } else {
            // console.log(
            //   '// o time que venceu essa mão perdeu a anterior, teremos terceira mão',
            // );
            // o time que venceu essa mão perdeu a anterior, teremos terceira mão
            this.round = this.round + 1;
          }
        }
      } else if (this.round === 0) {
        // console.log('// primeira mão, só atribui o ponto pra quem ganhou');
        // primeira mão, só atribui o ponto pra quem ganhou
        this.round = this.round + 1;
      } else {
        // ultima mão
        // console.log('// o time que vence essa mao vence a rodada');
        this.scoreboard[winnerTeam].score =
          this.scoreboard[winnerTeam].score + 1;
        this.round = 0;
        finishedRound = true;
      }
    }
    if (finishedRound) {
      this.points = [{}, {}, {}];
      this.newHand();
    } else {
      this.handling = [];
      if (!isDraw) {
        this.handTurn = winnerPlayer;
      }
    }

    // turn = turn === connectedPlayers.length - 1 ? 0 : turn + 1;
    // console.log(this.scoreboard);
    this.sessions.forEach((s) => {
      s.client.emit('turn', { turn: this.handTurn });
      s.client.emit('played', { handling: [] });
      s.client.emit('points', { points: this.points });
      s.client.emit('scoreboard', { scoreboard: this.scoreboard });
      s.client.emit('winnerround', {
        winner: isDraw ? 'empate' : winnerPlayer,
      });
    });
  };

  handleResetData = () => {
    this.hands = [];
    this.manilha = null;
    this.handling = [];
    this.scoreboard = {
      team1: {
        score: 0,
        players: ['', ''],
      },
      team2: {
        score: 0,
        players: ['', ''],
      },
    };
    this.handTurn = '';
    this.roundTurn = '';
    this.round = 0;
    this.points = [{}, {}, {}];
    this.sessions.forEach((s) => {
      s.client.emit('restart');
    });
  };
}
