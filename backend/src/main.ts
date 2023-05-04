import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { SocketAdapter } from './events/adapter';
import { SharedModule } from './shared/shared.module';
import { ApiConfigService } from './shared/services/api-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );
  app.useWebSocketAdapter(new SocketAdapter(app));
  const configService = app.select(SharedModule).get(ApiConfigService);
  const port = configService.appConfig.port;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
