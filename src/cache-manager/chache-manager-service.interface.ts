export interface ICacheManagerService {
  blockCreateTrackerRequests(ttl?: number): Promise<void>;

  unBlockCreateTrackerRequests(): Promise<void>;

  checkIfCreateTrackerIsBlocked(): Promise<boolean>;

  setCryptoPrice(
    cryptoName: string,
    cryptoPrice: number,
    ttl?: number,
  ): Promise<void>;

  getCryptoPrice(cryptoName: string): Promise<number | undefined>;
}
