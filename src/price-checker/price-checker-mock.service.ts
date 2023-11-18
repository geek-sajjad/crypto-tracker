import { Injectable } from '@nestjs/common';
import { IPriceCheckerService } from './interfaces';

@Injectable()
export class PriceCheckerMockService implements IPriceCheckerService {
  fetchPrice(cryptoName: string, price: number = 37000.33553) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: cryptoName,
          priceUsd: price.toString(),
        });
      }, 100);
    });
  }
}
