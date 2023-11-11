import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackerDto } from './dtos/create-tracker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracker, TrackerType } from './entities';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { PriceCheckerService } from 'src/price-checker/price-checker.service';
import { convertStringToFloatWithPrecision } from 'src/utils';

@Injectable()
export class TrackerService {
  constructor(
    private priceCheckerService: PriceCheckerService,
    @InjectRepository(Tracker)
    private trackerRepository: Repository<Tracker>,
  ) {}

  async create(createDto: CreateTrackerDto) {
    try {
      let { priceUsd } = await this.priceCheckerService.fetchPrice(
        createDto.cryptoName,
      );

      const currentPrice = convertStringToFloatWithPrecision(priceUsd);

      const isTargetPriceValid = this.checkCurrentPriceWithTrackerCondition(
        createDto.type,
        currentPrice,
        createDto.price,
      );

      if (!isTargetPriceValid)
        throw new BadRequestException(
          'The target price should meet the currentPrice condition',
        );

      const tracker = this.trackerRepository.create({
        cryptoName: createDto.cryptoName,
        price: createDto.price,
        type: createDto.type,
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
      sortableColumns: ['id', 'createdAt', 'price', 'cryptoName', 'type'],
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
    if (trackerType === TrackerType.UP) return targetPrice > currentUsdPrice;

    return targetPrice < currentUsdPrice;
  }
}
