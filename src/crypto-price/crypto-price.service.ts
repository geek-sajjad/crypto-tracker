import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios, { Axios } from 'axios';
import { ICryptoPrice, ICryptoPriceService } from './interfaces';
import { CacheManagerService } from 'src/cache-manager/cache-manager.service';
import {
  CACHE_MANAGER_SERVICE_TOKEN,
  CRYPTO_PRICE_CACHE_TTL,
} from 'src/common/constants';
import { convertStringToFloatWithPrecision } from 'src/utils';

@Injectable()
export class CryptoPriceService implements ICryptoPriceService {
  private _apiUrl = 'https://api.coincap.io/v2/assets/';

  constructor(
    @Inject(CACHE_MANAGER_SERVICE_TOKEN)
    private cacheManagerService: CacheManagerService,
  ) {}

  async fetchPriceFromApi(cryptoName: string): Promise<ICryptoPrice> {
    try {
      const {
        data: { data: result },
      } = await axios.get(this._apiUrl + cryptoName);

      if (!result) throw new Error('result is undefined');

      const priceInNumber = convertStringToFloatWithPrecision(result?.priceUsd);

      return {
        name: cryptoName,
        price: priceInNumber,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('The cryptoName not found!');
      }

      throw new InternalServerErrorException(
        'An error occurred while fetching crypto price from Api.',
      );
    }
  }

  async fetchPriceFromCache(
    cryptoName: string,
  ): Promise<ICryptoPrice | undefined> {
    try {
      const cachedCryptoPrice = await this.cacheManagerService.getCryptoPrice(
        cryptoName,
      );
      if (cachedCryptoPrice)
        return {
          name: cryptoName,
          price: cachedCryptoPrice,
        };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching crypto price from cache.',
      );
    }
  }

  async getPrice(cryptoName: string): Promise<ICryptoPrice> {
    try {
      const cachedCryptoPrice = await this.fetchPriceFromCache(cryptoName);

      if (cachedCryptoPrice) return cachedCryptoPrice;

      const cryptoPrice = await this.fetchPriceFromApi(cryptoName);

      await this.cacheManagerService.setCryptoPrice(
        cryptoName,
        cryptoPrice.price,
        CRYPTO_PRICE_CACHE_TTL,
      );

      return cryptoPrice;
    } catch (error) {
      if (error.message.includes === 'The cryptoName not found!') throw error;

      throw new InternalServerErrorException(
        'An error occurred while getting crypto price.',
      );
    }
  }

  async fetchPricesForDistinctCryptoNames(
    distinctCryptoNames: string[],
  ): Promise<ICryptoPrice[]> {
    try {
      const cryptoGetPromises = distinctCryptoNames.map((cryptoName) =>
        this.getPrice(cryptoName),
      );

      return Promise.all(cryptoGetPromises);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetchPricesForDistinctCryptoNames.',
      );
    }
  }
}
