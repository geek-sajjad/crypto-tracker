import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './redis.config';
import { RedisConfigService } from './redis-config.service';
import validationSchema from './redis-validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [redisConfig],
      validationSchema,
    }),
  ],
  providers: [RedisConfigService],
  exports: [RedisConfigService],
})
export class RedisConfigModule {}
