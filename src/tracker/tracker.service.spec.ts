import { Test, TestingModule } from '@nestjs/testing';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';

describe('TrackerService', () => {
  let service: TrackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackerService],
    }).compile();

    service = module.get<TrackerService>(TrackerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create new tracking crypto', () => {
    it('create method should be defined', () => {
      expect(service.create).toBeDefined();
    });

    it('create method should return an object', () => {
      // Arrange
      const createTrackerDto: CreateTrackerDto = {
        cryptoName: 'btc',
        price: '38000',
        type: 'up',
      };

      // Act

      const result = service.create(createTrackerDto);

      // Assert
      expect(result).not.toBeNull();
    });
  });
});
