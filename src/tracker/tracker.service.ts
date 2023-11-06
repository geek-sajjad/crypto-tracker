import { Injectable } from '@nestjs/common';
import { CreateTrackerDto } from './dto/create-tracker.dto';

@Injectable()
export class TrackerService {
  create(createDto: CreateTrackerDto) {
    return { name: 'test' };
  }
}
