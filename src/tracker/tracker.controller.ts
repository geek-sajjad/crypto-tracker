import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dtos/create-tracker.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@Controller('tracker')
export class TrackerController {
  constructor(public readonly trackerService: TrackerService) {}

  @Get()
  getAll(@Paginate() query: PaginateQuery) {
    return this.trackerService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trackerService.findOne(id);
  }

  @Post()
  create(@Body() { cryptoName, price, type }: CreateTrackerDto) {
    return this.trackerService.create({
      cryptoName,
      price,
      type,
    });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.trackerService.delete(id);
  }
}
