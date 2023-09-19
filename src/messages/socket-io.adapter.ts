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
    const clientUrls = process.env.CLIENT_URL.split(',');



    const cors =({
        origin: clientUrls,
        credentials: true
    })

    const optionsWithCORS: ServerOptions = {
      ...options, 
      cors,
    };

    return super.createIOServer(port, optionsWithCORS)

  }
}

