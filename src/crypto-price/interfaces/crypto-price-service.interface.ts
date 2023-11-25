import { ICryptoPrice } from './crypto-price.interface';

export interface ICryptoPriceService {
  fetchPriceFromApi(cryptoName: string): Promise<ICryptoPrice>;

  fetchPriceFromCache(cryptoName: string): Promise<ICryptoPrice | undefined>;

  getPrice(cryptoName: string): Promise<ICryptoPrice>;

  fetchPricesForDistinctCryptoNames(
    distinctCryptoNames: Array<string>,
  ): Promise<Array<ICryptoPrice>>;
}
