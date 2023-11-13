import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('database.host');
  }
  get port(): number {
    return parseInt(this.configService.get<string>('database.port'), 10);
  }
  get username(): string {
    return this.configService.get<string>('database.username');
  }
  get password(): string {
    return this.configService.get<string>('database.password');
  }
  get name(): string {
    return this.configService.get<string>('database.name');
  }
}
