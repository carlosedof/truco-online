import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ISeat } from '../types/seat';
import { ICard } from '../types/card';
import { strengthOrder } from '../constants/strengthOrder';
import { naipeOrder } from '../constants/naipeOrder';
import { GameService } from './game.service';
import { Inject } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(
    @Inject(GameService) private readonly gameState: GameService,
    @Inject(LobbyService) private readonly lobbyState: LobbyService,
  ) {}

  async handleConnection(socket: Socket) {
    // console.debug(`Connected on socket (${socket.handshake.query.user})`);
    this.gameState.sessions.push({
      client: socket,
      user: socket.handshake.query.user,
    });
    this.gameState.sessions.forEach((s) => {
      s.client.emit('connected', { scoreboard: this.lobbyState.scoreboard });
    });
  }

  handleDisconnect(socket: Socket) {
    let userDisconnected = null;
    this.gameState.sessions = this.gameState.sessions.filter((session) => {
      if (session?.client?.id === socket?.id) {
        userDisconnected = session.user;
        // console.debug(`Disconnected from socket (${session.user})`);
        return false;
      }
      return true;
    });
    this.gameState.sessions.forEach((s) => {
      s.client.emit('is-offline', userDisconnected?.id);
    });
  }

  @SubscribeMessage('raiserequest')
  async handleRaiseRequest(socket: Socket) {
    const user: string = this.gameState.sessions.find(
      (s) => s.client.id === socket.id,
    )?.user;
    const team = this.lobbyState.scoreboard.team1.players.find(
      (p) => p === user,
    )
      ? 'team1'
      : 'team2';
    this.gameState.sessions.forEach((s) => {
      s.client.emit('raiserequest', { team, user });
    });
  }

  @SubscribeMessage('raiseresponse')
  async handleRaiseResponse(
    socket: Socket,
    { response }: { response: string },
  ) {
    this.gameState.sessions.forEach((s) => {
      s.client.emit('raiseresponse', { response });
    });
    const user: string = this.gameState.sessions.find(
      (s) => s.client.id === socket.id,
    )?.user;
    const requestTeam = this.lobbyState.scoreboard.team1.players.find(
      (p) => p === user,
    )
      ? 'team2'
      : 'team1';
    const otherTeam = this.lobbyState.scoreboard.team1.players.find(
      (p) => p === user,
    )
      ? 'team1'
      : 'team2';
    if (response === 'accept') {
      this.gameState.handValue =
        this.gameState.handValue > 1
          ? this.gameState.handValue + 3
          : this.gameState.handValue + 2;
    } else if (response === 'raise') {
      this.gameState.handValue =
        this.gameState.handValue > 1
          ? this.gameState.handValue + 3
          : this.gameState.handValue + 2;
      this.gameState.sessions.forEach((s) => {
        s.client.emit('raiserequest', { team: otherTeam, user });
      });
    } else {
      this.scoreHandler(
        this.lobbyState.scoreboard[requestTeam].players[0],
        true,
      );
    }
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
    this.lobbyState.takeSeat(payload.playername, payload.seat);
    this.handlePublishTableChanges();
  }

  @SubscribeMessage('gethands')
  async handleGetHands(socket: Socket) {
    socket.emit('scoreboard', { scoreboard: this.lobbyState.scoreboard });
    socket.emit('turn', { turn: this.gameState.handTurn });
    socket.emit('hands', { hands: this.gameState.hands });
    socket.emit('played', { played: this.gameState.handling });
    socket.emit('manilha', { manilha: this.gameState.manilha });
    // TODO check for pending raise requests and responses and update users
  }

  @SubscribeMessage('played')
  async handlePlayedCard(
    socket: Socket,
    payload: { card: ICard; player: string },
  ) {
    const player = payload.player;
    this.gameState.addPlayedCardToState(payload.card, player);
    this.gameState.sessions.forEach((s) => {
      s.client.emit('hands', { hands: this.gameState.hands });
      s.client.emit('played', { handling: this.gameState.handling });
    });
    if (this.gameState.handling.length === 4) {
      this.handleRoundWinner();
    } else {
      this.handleNextHandleTurn(false, player);
    }
  }

  handlePublishTableChanges = () => {
    this.checkReady();
    this.gameState.sessions.forEach((s) =>
      s.client.emit('scoreboard', { scoreboard: this.lobbyState.scoreboard }),
    );
  };

  checkReady = () => {
    // if there are 4 players, start the game
    if (
      this.lobbyState.scoreboard.team1.players[0] &&
      this.lobbyState.scoreboard.team2.players[0] &&
      this.lobbyState.scoreboard.team1.players[1] &&
      this.lobbyState.scoreboard.team2.players[1]
    ) {
      // todo check in rules who needs to start game
      // generate random number between 0 and 3 to choose who starts the game
      const turn = Math.floor(Math.random() * 4);
      this.gameState.handTurn =
        this.lobbyState.scoreboard[turn % 2 === 0 ? 'team1' : 'team2'].players[
          turn < 2 ? 0 : 1
        ];
      this.gameState.roundTurn =
        this.lobbyState.scoreboard[turn % 2 === 0 ? 'team1' : 'team2'].players[
          turn < 2 ? 0 : 1
        ];

      // send the turn to all players
      this.gameState.sessions.forEach((s) => {
        s.client.emit('turn', { turn: this.gameState.handTurn });
      });

      // shuffle and distribute cards
      this.newHand();

      this.gameState.sessions.forEach((s) =>
        s.client.emit('ready', { ready: this.lobbyState.scoreboard }),
      );
    }
  };

  newHand = () => {
    // clear all hands and manilha and send event to users
    this.gameState.sessions.forEach((s) => {
      s.client.emit('hands', { hands: [] });
      s.client.emit('manilha', { manilha: null });
    });
    // shuffle and distribute cards
    this.gameState.dealCards();
    // send new hands, manilha, updated scoreboard to users
    this.gameState.sessions.forEach((s) => {
      this.gameState.handling = [];
      s.client.emit('played', { handling: [] });
      s.client.emit('hands', { hands: this.gameState.hands });
      s.client.emit('manilha', { manilha: this.gameState.manilha });
      s.client.emit('scoreboard', { scoreboard: this.lobbyState.scoreboard });
    });
  };

  handleRoundWinner = () => {
    setTimeout(() => {
      let winnerIndex;
      let draw;

      // gather all cards from hands
      const cards = this.gameState.handling.map((h) => h.card);
      // check for manilhas
      const manilhas = cards.filter(
        (cc) =>
          strengthOrder[strengthOrder.indexOf(cc.nr) - 1] ===
          this.gameState.manilha.nr,
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
        const manilhaNumber = _strengthOrder.find(
          (s) => s === this.gameState.manilha.nr,
        );
        // remove the manilha number from the strength order
        _strengthOrder.splice(
          _strengthOrder.indexOf(this.gameState.manilha.nr),
          1,
        );
        // add the manilha number to the end of the strength order because it is the strongest card
        // TODO for the strongest because it should not be the last
        _strengthOrder.splice(_strengthOrder.length + 1, 0, manilhaNumber);

        const cardLevels = [];
        for (let i = 0; i <= 3; i++) {
          cardLevels.push(
            strengthOrder.indexOf(
              strengthOrder.find(
                (so) => so === this.gameState.handling[i].card.nr,
              ),
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
              const repeatedCardsHands = this.gameState.handling.filter(
                (h) => h.card.nr === biggestRepeatedCard,
              );
              const repeatedPlayers = repeatedCardsHands.map(
                (rch) => rch.player,
              );
              if (
                this.lobbyState.scoreboard.team1.players.find((p) =>
                  repeatedPlayers.includes(p),
                ) &&
                this.lobbyState.scoreboard.team2.players.find((p) =>
                  repeatedPlayers.includes(p),
                )
              ) {
                draw = true;
              } else {
                if (
                  this.lobbyState.scoreboard.team1.players.find((p) =>
                    repeatedPlayers.includes(p),
                  )
                ) {
                  this.gameState.handling.find((h, i) => {
                    if (
                      this.lobbyState.scoreboard.team1.players.includes(
                        h.player,
                      )
                    ) {
                      winnerIndex = i;
                      return true;
                    }
                    return false;
                  });
                } else {
                  this.gameState.handling.find((h, i) => {
                    if (
                      this.lobbyState.scoreboard.team2.players.includes(
                        h.player,
                      )
                    ) {
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
            const repeatedCardsHands = this.gameState.handling.filter(
              (h) => h.card.nr === biggestRepeatedCard,
            );
            // check if repeated are from same team
            const repeatedPlayers = repeatedCardsHands.map((rch) => rch.player);
            if (
              this.lobbyState.scoreboard.team1.players.find((p) =>
                repeatedPlayers.includes(p),
              ) &&
              this.lobbyState.scoreboard.team2.players.find((p) =>
                repeatedPlayers.includes(p),
              )
            ) {
              draw = true;
            } else {
              if (
                this.lobbyState.scoreboard.team1.players.find((p) =>
                  repeatedPlayers.includes(p),
                )
              ) {
                this.gameState.handling.find((h, i) => {
                  if (
                    this.lobbyState.scoreboard.team1.players.includes(h.player)
                  ) {
                    winnerIndex = i;
                    return true;
                  }
                  return false;
                });
              } else {
                this.gameState.handling.find((h, i) => {
                  if (
                    this.lobbyState.scoreboard.team2.players.includes(h.player)
                  ) {
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
      this.scoreHandler(
        draw ? null : this.gameState.handling[winnerIndex].player,
        false,
      );
    }, 2500);
  };

  handleNextHandleTurn = (isNewRound, player) => {
    if (this.lobbyState.scoreboard.team1.players.find((p) => player === p)) {
      // console.log('quem jogou foi do time 1');
      if (this.lobbyState.scoreboard.team1.players.indexOf(player) === 0) {
        // console.log('quem jogou foi do time 0 posicao 0');
        this.gameState.handTurn = this.lobbyState.scoreboard.team2.players[1];
      } else {
        // console.log('quem jogou foi do time 0 posicao 1');
        this.gameState.handTurn = this.lobbyState.scoreboard.team2.players[0];
      }
    } else {
      // console.log('quem jogou foi do time 2');
      if (this.lobbyState.scoreboard.team2.players.indexOf(player) === 0) {
        // console.log('quem jogou foi do time 2 posicao 0');
        this.gameState.handTurn = this.lobbyState.scoreboard.team1.players[0];
      } else {
        // console.log('quem jogou foi do time 2 posicao 1');
        this.gameState.handTurn = this.lobbyState.scoreboard.team1.players[1];
      }
    }
    // console.log('próximo deve ser', this.handTurn);
    // if (isNewRound) {
    //
    // }
    setTimeout(() => {
      this.gameState.sessions.forEach((s) => {
        s.client.emit('turn', { turn: this.gameState.handTurn });
      });
    }, 1200);
  };

  scoreHandler = (winnerPlayer: string, isRaiseDenied: boolean) => {
    const isDraw = !winnerPlayer;
    let winnerTeam;
    let finishedRound;
    if (
      this.lobbyState.scoreboard.team1.players.find((p) => winnerPlayer === p)
    ) {
      winnerTeam = 'team1';
    } else {
      winnerTeam = 'team2';
    }
    if (!isRaiseDenied) {
      if (isDraw) {
        // mão empatada
        this.gameState.points[this.gameState.round] = { draw: true };
        if (this.gameState.round === 1 || this.gameState.round === 2) {
          // mao empatada na segunda ou ultima rodada, quem ganhou a primeira mão leva
          if (
            this.lobbyState.scoreboard.team1.players.find(
              (p) => this.gameState.points[0].winner === p,
            )
          ) {
            this.lobbyState.scoreboard.team1.score =
              this.lobbyState.scoreboard.team1.score + this.gameState.handValue;
          } else {
            this.lobbyState.scoreboard.team2.score =
              this.lobbyState.scoreboard.team2.score + this.gameState.handValue;
          }
          finishedRound = true;
          this.gameState.round = 0;
        } else {
          // mao empatada na primeira rodada, só mantém empate e não pontua
          this.gameState.round =
            this.gameState.round + this.gameState.handValue;
        }
      } else {
        this.gameState.points[this.gameState.round] = { winner: winnerPlayer };
        if (this.gameState.round === 1) {
          // segunda mão
          // console.log('// segunda mão');
          if (this.gameState.points[0].draw) {
            // segunda mão com empate na primeira
            // console.log('// segunda mão com empate na primeira');
            this.lobbyState.scoreboard[winnerTeam].score =
              this.lobbyState.scoreboard[winnerTeam].score +
              this.gameState.handValue;
            this.gameState.round = 0;
            finishedRound = true;
          } else {
            // console.log('// segunda mão sem empate na primeira');
            // segunda mão sem empate na primeira
            if (
              this.lobbyState.scoreboard[winnerTeam].players.includes(
                this.gameState.points[0].winner,
              )
            ) {
              // o time que venceu essa mão também venceu a mão anterior
              // console.log(
              //   '// o time que venceu essa mão também venceu a mão anterior',
              // );
              this.lobbyState.scoreboard[winnerTeam].score =
                this.lobbyState.scoreboard[winnerTeam].score +
                this.gameState.handValue;
              this.gameState.round = 0;
              finishedRound = true;
            } else {
              // console.log(
              //   '// o time que venceu essa mão perdeu a anterior, teremos terceira mão',
              // );
              // o time que venceu essa mão perdeu a anterior, teremos terceira mão
              this.gameState.round =
                this.gameState.round + this.gameState.handValue;
            }
          }
        } else if (this.gameState.round === 0) {
          // console.log('// primeira mão, só atribui o ponto pra quem ganhou');
          // primeira mão, só atribui o ponto pra quem ganhou
          this.gameState.round =
            this.gameState.round + this.gameState.handValue;
        } else {
          // ultima mão
          // console.log('// o time que vence essa mao vence a rodada');
          this.lobbyState.scoreboard[winnerTeam].score =
            this.lobbyState.scoreboard[winnerTeam].score +
            this.gameState.handValue;
          this.gameState.round = 0;
          finishedRound = true;
        }
      }
    } else {
      this.lobbyState.scoreboard[winnerTeam].score =
        this.lobbyState.scoreboard[winnerTeam].score + 1;
    }
    if (this.lobbyState.scoreboard[winnerTeam].score >= 12) {
      this.handleEndgame(winnerTeam);
    }
    if (finishedRound || isRaiseDenied) {
      this.gameState.points = [{}, {}, {}];
      this.newHand();
    } else {
      this.gameState.handling = [];
      if (!isDraw) {
        this.gameState.handTurn = winnerPlayer;
      }
    }

    // turn = turn === connectedPlayers.length - 1 ? 0 : turn + 1;
    this.gameState.sessions.forEach((s) => {
      s.client.emit('turn', { turn: this.gameState.handTurn });
      s.client.emit('played', { handling: [] });
      s.client.emit('points', { points: this.gameState.points });
      s.client.emit('scoreboard', { scoreboard: this.lobbyState.scoreboard });
      s.client.emit('winnerround', {
        winner: isDraw ? 'draw' : winnerPlayer,
      });
    });
  };

  handleEndgame = (winnerTeam: string) => {
    this.gameState.endGame();
    this.gameState.sessions.forEach((s) => {
      s.client.emit('endgame', { winnerTeam });
    });
  };

  handleResetData = () => {
    this.gameState.resetState();
    this.gameState.sessions.forEach((s) => {
      s.client.emit('restart');
    });
  };
}
