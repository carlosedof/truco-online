import { scoreboard } from './initial.states';
import { Inject, Injectable } from '@nestjs/common';
import { IScoreboard } from '../types/scoreboard';
import { GameService } from './game.service';
import { ISeat } from '../types/seat';

@Injectable()
export class LobbyService {
  scoreboard: IScoreboard = JSON.parse(JSON.stringify(scoreboard));
  // constructor(@Inject(GameService) private readonly lobbyState: GameService) {}

  public takeSeat(name: string, seat: ISeat) {
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
  }
}
