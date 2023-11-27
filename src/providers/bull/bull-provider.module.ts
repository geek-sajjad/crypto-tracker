import { Module } from '@nestjs/common';
import { RedisConfigService } from 'src/config/redis/redis-config.service';
import { RedisConfigModule } from 'src/config/redis/redis-config.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisConfigModule],
      inject: [RedisConfigService],
      useFactory: async (redisConfigService: RedisConfigService) => ({
        redis: {
          host: redisConfigService.host,
          port: redisConfigService.port,
          password: redisConfigService.password,
          username: redisConfigService.username,
        },
      }),
    }),
  ],
})
export class BullProviderModule {}
