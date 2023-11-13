import { Injectable } from '@nestjs/common';
import { RedisConfigService } from './config/redis/redis-config.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
