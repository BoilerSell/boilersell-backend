import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';


export class SocketIOAdapter extends IoAdapter {

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService
  ) {
    super(app)
  }

  createIOServer(port: number, options?: ServerOptions ) {
    const clientPort = process.env.CLIENT_URL


    const cors =({
        origin: [clientPort],
        credentials: true
    })

    const optionsWithCORS: ServerOptions = {
      ...options, 
      cors,
    };

    return super.createIOServer(port, optionsWithCORS)

  }
}

