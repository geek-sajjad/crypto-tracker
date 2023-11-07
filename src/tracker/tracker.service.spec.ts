import { Test, TestingModule } from '@nestjs/testing';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dtos/create-tracker.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tracker, TrackerType } from './entities';
import { NotFoundException } from '@nestjs/common';

describe('TrackerService', () => {
  let service: TrackerService;
  let trackerRepositoryToken = getRepositoryToken(Tracker);

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackerService,
        {
          provide: trackerRepositoryToken,
          useValue: mockRepo,
        },
      ],
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

    it('create method should return an object', async () => {
      // Arrange
      const createTrackerDto: CreateTrackerDto = {
        cryptoName: 'btc',
        price: 35536.44,
        type: TrackerType.UP,
      };

      const resolvedValue = {
        ...createTrackerDto,
        id: 1,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockRepo.create.mockReturnValue(resolvedValue);
      mockRepo.save.mockResolvedValue(resolvedValue);

      // Act
      const result = await service.create(createTrackerDto);

      // Assert
      expect(result).toBe(resolvedValue);
    });

    // it('create method should check the price before creating new tracker', () => {

    // });

    // it('return error when creating with wrong information', () => {});
  });

  describe('find All trackers', () => {
    it('find all method should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

    // it('find all method should return array of objects', async () => {
    //   // Arrange
    //   mockRepo.findAll.mockResolvedValue([]);

    //   // Act
    //   const result = await service.findAll({path: });

    //   // Assert
    //   console.log(result);
    // });
  });

  describe('find One tracker with id', () => {
    it('find One method should be defined', () => {
      expect(service.findOne).toBeDefined();
    });

    it('should return an entity with the specified ID', async () => {
      // Arrange
      const id = 1;
      const resolvedValue = {
        id,
        cryptoName: 'btc',
        price: 35536.44,
        type: TrackerType.UP,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockRepo.findOne.mockResolvedValue(resolvedValue);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toBe(resolvedValue);
    });

    it('find one method should throw not found exception', async () => {
      // Arrange

      const id = 999;
      const resolvedValue = null;

      mockRepo.findOne.mockResolvedValue(resolvedValue);

      // Act
      const findPromise: Promise<Tracker> = service.findOne(id);

      // Assert
      await expect(findPromise).rejects.toThrowError(NotFoundException);
    });
  });

  describe('delete one tracker with id', () => {
    it('delete one method should be defined', () => {
      expect(service.delete).toBeDefined();
    });

    it('should delete the entity ', async () => {
      // Arrange
      const id = 1;

      // Act
      await service.delete(id);

      // Assert
      expect(mockRepo.delete).toHaveBeenCalledWith(id);
    });
  });
});
