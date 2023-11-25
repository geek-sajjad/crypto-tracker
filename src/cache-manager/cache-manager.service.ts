import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ICacheManagerService } from './chache-manager-service.interface';
import { Cache } from 'cache-manager';
import { BLOCK_REQUEST_DEFAULT_TIME } from 'src/tracker/constants';
import {
  CRYPTO_PRICE_CACHE_PREFIX_KEY,
  IS_CREATE_TRACKER_REQUESTS_BLOCKED,
} from './constants';

@Injectable()
export class CacheManagerService implements ICacheManagerService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}
  async setCryptoPrice(
    cryptoName: string,
    cryptoPrice: number,
    ttl?: number,
  ): Promise<void> {
    const key = CRYPTO_PRICE_CACHE_PREFIX_KEY + cryptoName;
    await this.cacheManager.set(key, cryptoPrice, ttl);
  }

  getCryptoPrice(cryptoName: string): Promise<number | undefined> {
    const key = CRYPTO_PRICE_CACHE_PREFIX_KEY + cryptoName;
    return this.cacheManager.get(key);
  }

  async blockCreateTrackerRequests(
    ttl: number = BLOCK_REQUEST_DEFAULT_TIME,
  ): Promise<void> {
    await this.cacheManager.set(
      IS_CREATE_TRACKER_REQUESTS_BLOCKED,
      true,
      BLOCK_REQUEST_DEFAULT_TIME,
    );
  }

  async unBlockCreateTrackerRequests(): Promise<void> {
    await this.cacheManager.del(IS_CREATE_TRACKER_REQUESTS_BLOCKED);
  }

  async checkIfCreateTrackerIsBlocked(): Promise<boolean> {
    const res = await this.cacheManager.get(IS_CREATE_TRACKER_REQUESTS_BLOCKED);
    if (!res) return false;

    return true;
  }
}
