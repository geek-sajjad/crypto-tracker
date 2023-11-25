export interface ITrackersToGetNotified {
  trackerId: number;
  cryptoName: string;
  currentPrice: number;
  priceThreshold: number;
  notifyEmail: string;
}
