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
import { PriceCheckerService } from 'src/price-checker/price-checker.service';
import { convertStringToFloatWithPrecision } from 'src/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICryptoPriceData, ITriggeredTracker } from './interfaces';
import { CHECK_TRACKER_IS_RUNNING } from './constants';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertService } from 'src/alert/alert.service';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(Tracker) private trackerRepository: Repository<Tracker>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private priceCheckerService: PriceCheckerService,
    private alertService: AlertService,
  ) {}

  async triggerAlert(email: string, data: string) {
    await this.alertService.sendMailAlert({
      body: data,
      email: email,
      subject: 'subject',
    });
  }

  async create(createDto: CreateTrackerDto) {
    try {
      const isCreateTrackerBlocked = await this.cacheManager.get<boolean>(
        CHECK_TRACKER_IS_RUNNING,
      );

      if (isCreateTrackerBlocked)
        throw new ServiceUnavailableException(
          'The service is currently unavailable, try again after a few minutes later.',
        );

      let { priceUsd } = await this.priceCheckerService.fetchPrice(
        createDto.cryptoName,
      );

      const currentPrice = convertStringToFloatWithPrecision(priceUsd);

      const isTargetPriceValid = this.checkCurrentPriceWithTrackerCondition(
        createDto.type,
        currentPrice,
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
    } catch (error) {
      if (
        error instanceof NotFoundException &&
        error.message.includes('The cryptoName not found!')
      )
        throw new BadRequestException(
          'The provided cryptoName is not available.',
        );

      throw error;
    }
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

  deleteAllBasedOnIDs(IDs: Array<number>) {
    // check if IDs are empty
    if (!IDs.length) return;

    return this.trackerRepository.delete({
      id: In(IDs),
    });
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
    //TODO: Block the incoming requests to create new trackers
    await this.cacheManager.set(CHECK_TRACKER_IS_RUNNING, true, 10000);

    // Load all the trackers from the database into an array
    const trackers = await this.trackerRepository.find();

    // Extract all crypto names into an array
    const distinctCryptoNames = this._extractDistinctCryptoNames(trackers);

    // Retrieve all the crypto prices and store them in an array
    const newCryptoPricesData = await this._fetchPricesForDistinctCryptoNames(
      distinctCryptoNames,
    );

    // TODO:  Update all crypto prices with new ones in the cache system.

    // Begin processing the list of trackers based on the new prices stored in the array
    const triggeredTrackers: ITriggeredTracker[] =
      this._processTrackersBasedOnNewPrices(trackers, newCryptoPricesData);

    // If they meet the new price condition, place them in the notification queue, and remove them from the array, database, and any other remaining locations
    await this._triggerAlertTrackers(triggeredTrackers);

    // If they do not meet the new price condition, simply remove them from the array
    const deleteTrackerIDs =
      this._extractIDsFromTriggeredTracker(triggeredTrackers);
    await this.deleteAllBasedOnIDs(deleteTrackerIDs);

    // TODO: Open the gate for incoming price requests.
    await this.cacheManager.set(CHECK_TRACKER_IS_RUNNING, false);
  }

  private _processTrackersBasedOnNewPrices(
    trackers: Array<Tracker>,
    newCryptoPricesData: Array<ICryptoPriceData>,
  ): Array<ITriggeredTracker> {
    const triggeredTrackers: ITriggeredTracker[] = [];

    for (const tracker of trackers) {
      const { cryptoNewPrice } = newCryptoPricesData.find(
        (newCryptoData) => newCryptoData.cryptoName === tracker.cryptoName,
      );

      const isTrackerMetCondition = this._isTrackerMetCondition(
        tracker,
        cryptoNewPrice,
      );

      if (isTrackerMetCondition)
        triggeredTrackers.push({
          trackerId: tracker.id,
          cryptoName: tracker.cryptoName,
          notifyEmail: tracker.notifyEmail,
          newPrice: cryptoNewPrice,
        });
    }

    return triggeredTrackers;
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

  private async _fetchPricesForDistinctCryptoNames(
    distinctCryptoNames: Array<string>,
  ): Promise<Array<ICryptoPriceData>> {
    try {
      const priceRequests = distinctCryptoNames.map(async (cryptoName) => {
        const result = await this.priceCheckerService.fetchPrice(cryptoName);

        return {
          cryptoName: result['id'] as string,
          cryptoNewPrice: convertStringToFloatWithPrecision(result['priceUsd']),
        };
      });

      const priceResults = await Promise.all(priceRequests);

      return priceResults;
    } catch (error) {
      throw new Error(`Error fetching crypto prices: ${error.message}`);
    }
  }

  private _extractIDsFromTriggeredTracker(
    triggeredTrackers: Array<ITriggeredTracker>,
  ): Array<number> {
    return triggeredTrackers.map((item) => item.trackerId);
  }

  private async _triggerAlertTrackers(
    triggeredTrackers: Array<ITriggeredTracker>,
  ) {
    try {
      const triggerAlertsRequests = triggeredTrackers.map(
        async (triggeredTracker) => {
          await this.triggerAlert(
            triggeredTracker.notifyEmail,
            `crypto name: ${triggeredTracker.cryptoName} - new price: ${triggeredTracker.newPrice}`,
          );
        },
      );

      await Promise.all(triggerAlertsRequests);
    } catch (error) {
      throw new Error(`Error triggering alerts: ${error.message}`);
    }
  }
}
