import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('redis.host');
  }
  get port(): number {
    return parseInt(this.configService.get<string>('redis.port'), 10);
  }
  get username(): string {
    return this.configService.get<string>('redis.username');
  }
  get password(): string {
    return this.configService.get<string>('redis.password');
  }
}
