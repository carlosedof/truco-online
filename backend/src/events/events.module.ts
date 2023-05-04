import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { GameService } from './game.service';
import { LobbyService } from './lobby.service';

@Module({
  providers: [EventsGateway, GameService, LobbyService],
  exports: [EventsGateway],
})
export class EventsModule {}
