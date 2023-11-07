import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackerDto } from './dtos/create-tracker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracker } from './entities';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(Tracker)
    private trackerRepository: Repository<Tracker>,
  ) {}

  create(createDto: CreateTrackerDto) {
    const tracker = this.trackerRepository.create({
      cryptoName: createDto.cryptoName,
      price: createDto.price,
      type: createDto.type,
    });

    return this.trackerRepository.save(tracker);
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
}
