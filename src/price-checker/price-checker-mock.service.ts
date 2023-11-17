import { Injectable } from '@nestjs/common';
import { IPriceCheckerService } from './interfaces';

@Injectable()
export class PriceCheckerMockService implements IPriceCheckerService {
  fetchPrice(cryptoName: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'bitcoin',
          priceUsd: 37000.33553,
        });
      }, 100);
    });
  }
}
