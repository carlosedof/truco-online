import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
// import { HttpModule } from '@nestjs/axios';


@Module({
  // imports: [
  //   HttpModule,
  // ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
