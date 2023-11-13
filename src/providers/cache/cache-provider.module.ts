import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { RedisConfigService } from 'src/config/redis/redis-config.service';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisConfigModule } from 'src/config/redis/redis-config.module';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [RedisConfigModule],
      useFactory: async (redisConfigService: RedisConfigService) => ({
        store: redisStore,
        socket: {
          host: redisConfigService.host,
          port: redisConfigService.port,
        },
        password: redisConfigService.password,
      }),
      inject: [RedisConfigService],
      isGlobal: true,
    }),
  ],
})
export class CacheProviderModule {}
