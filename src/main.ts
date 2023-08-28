import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { SocketIOAdapter } from './messages/socket-io.adapter';
import { ConfigService } from '@nestjs/config';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe())

  const configService = app.get(ConfigService)
  
  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  app.useWebSocketAdapter(new SocketIOAdapter(app, configService))
  
  await app.listen(process.env.PORT);
}
bootstrap();
