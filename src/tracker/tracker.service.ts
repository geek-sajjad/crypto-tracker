import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateTrackerDto } from './dtos/create-tracker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracker, TrackerType } from './entities';
import { In, Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { convertStringToFloatWithPrecision } from 'src/utils';

import { ITrackersToGetNotified } from './interfaces';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertService } from 'src/alert/alert.service';
import { ICryptoPrice, ICryptoPriceService } from 'src/crypto-price/interfaces';
import {
  CACHE_MANAGER_SERVICE_TOKEN,
  CRYPTO_PRICE_SERVICE_TOKEN,
} from 'src/common/constants';
import { ICacheManagerService } from 'src/cache-manager/chache-manager-service.interface';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(Tracker) private trackerRepository: Repository<Tracker>,
    @Inject(CRYPTO_PRICE_SERVICE_TOKEN)
    private cryptoPriceService: ICryptoPriceService,
    private alertService: AlertService,
    @Inject(CACHE_MANAGER_SERVICE_TOKEN)
    private cacheManagerService: ICacheManagerService,
  ) {}

  async create(createDto: CreateTrackerDto) {
    const isCreateTrackerBlocked =
      await this.cacheManagerService.checkIfCreateTrackerIsBlocked();
    if (isCreateTrackerBlocked)
      throw new ServiceUnavailableException(
        'The service is currently unavailable, try again after a few minutes later.',
      );

    const { price } = await this.cryptoPriceService.getPrice(
      createDto.cryptoName,
    );

    const isTargetPriceValid = this.checkCurrentPriceWithTrackerCondition(
      createDto.type,
      price,
      createDto.priceThreshold,
    );

    if (!isTargetPriceValid)
      throw new BadRequestException(
        'The target priceThreshold should meet the currentPrice condition',
      );

    const tracker = this.trackerRepository.create({
      cryptoName: createDto.cryptoName,
      priceThreshold: createDto.priceThreshold,
      type: createDto.type,
      notifyEmail: createDto.notifyEmail,
    });

    return this.trackerRepository.save(tracker);
  }

  findAll(query: PaginateQuery) {
    return paginate(query, this.trackerRepository, {
      defaultSortBy: [['id', 'DESC']],
      sortableColumns: [
        'id',
        'createdAt',
        'priceThreshold',
        'cryptoName',
        'type',
      ],
    });
  }

  async findOne(id: number) {
    const result = await this.trackerRepository.findOne({ where: { id } });
    if (!result)
      throw new NotFoundException('The requested resource was not found.');
    return result;
  }

  delete(id: number) {
    return this.trackerRepository.delete(id);
  }

  checkCurrentPriceWithTrackerCondition(
    trackerType: TrackerType,
    currentUsdPrice: number,
    targetPrice: number,
  ): boolean {
    if (trackerType === TrackerType.INCREASE)
      return targetPrice > currentUsdPrice;

    return targetPrice < currentUsdPrice;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkTrackerContinuously() {
    // TODO handle error
    await this.cacheManagerService.blockCreateTrackerRequests();

    const triggeredTrackers = await this._getTrackersToGetNotified();

    await this.alertService.alertTrackers(triggeredTrackers);

    await this._removeNotifiedTrackers(triggeredTrackers);

    await this.cacheManagerService.unBlockCreateTrackerRequests();
  }

  private async _removeNotifiedTrackers(
    trackers: Array<ITrackersToGetNotified>,
  ) {
    const deleteTrackerIDs = this._extractIDsFromTriggeredTracker(trackers);
    if (!deleteTrackerIDs.length) return;

    await this.trackerRepository.delete({
      id: In(deleteTrackerIDs),
    });
  }

  private async _getTrackersToGetNotified(): Promise<
    Array<ITrackersToGetNotified>
  > {
    const trackers = await this.trackerRepository.find();

    const distinctCryptoNames = this._extractDistinctCryptoNames(trackers);

    const cryptoPrices =
      await this.cryptoPriceService.fetchPricesForDistinctCryptoNames(
        distinctCryptoNames,
      );

    const triggeredTrackers: ITrackersToGetNotified[] =
      this._processTrackersBasedOnNewPrices(trackers, cryptoPrices);

    return triggeredTrackers;
  }

  private _processTrackersBasedOnNewPrices(
    trackers: Array<Tracker>,
    cryptoPrices: Array<ICryptoPrice>,
  ): Array<ITrackersToGetNotified> {
    const trackersToGetNotified: ITrackersToGetNotified[] = [];

    for (const tracker of trackers) {
      const { price } = cryptoPrices.find(
        (cryptoPrice) => cryptoPrice.name === tracker.cryptoName,
      );

      const isTrackerMetCondition = this._isTrackerMetCondition(tracker, price);

      if (isTrackerMetCondition)
        trackersToGetNotified.push({
          trackerId: tracker.id,
          cryptoName: tracker.cryptoName,
          notifyEmail: tracker.notifyEmail,
          priceThreshold: tracker.priceThreshold,
          currentPrice: price,
        });
    }

    return trackersToGetNotified;
  }

  private _isTrackerMetCondition(
    tracker: Tracker,
    newCryptoPrice: number,
  ): boolean {
    return !this.checkCurrentPriceWithTrackerCondition(
      tracker.type,
      newCryptoPrice,
      tracker.priceThreshold,
    );
  }

  private _extractDistinctCryptoNames(trackers: Array<Tracker>): Array<string> {
    return Array.from(new Set(trackers.map((tracker) => tracker.cryptoName)));
  }

  private _extractIDsFromTriggeredTracker(
    triggeredTrackers: Array<ITrackersToGetNotified>,
  ): Array<number> {
    return triggeredTrackers.map((item) => item.trackerId);
  }
}
