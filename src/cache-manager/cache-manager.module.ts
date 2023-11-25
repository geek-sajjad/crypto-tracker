import { Module } from '@nestjs/common';
import { CacheManagerService } from './cache-manager.service';
import { CACHE_MANAGER_SERVICE_TOKEN } from 'src/common/constants';

@Module({
  providers: [
    {
      provide: CACHE_MANAGER_SERVICE_TOKEN,
      useClass: CacheManagerService,
    },
  ],
  exports: [CACHE_MANAGER_SERVICE_TOKEN],
})
export class CacheManagerModule {}
