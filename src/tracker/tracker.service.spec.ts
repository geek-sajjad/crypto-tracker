import { Test, TestingModule } from '@nestjs/testing';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dtos/create-tracker.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tracker, TrackerType } from './entities';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PriceCheckerService } from 'src/price-checker/price-checker.service';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { when } from 'jest-when';
import { AlertService } from 'src/alert/alert.service';

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

  const mockPriceCheckerService = {
    fetchPrice: jest.fn(),
  };

  const mockAlertService = {
    sendMailAlert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackerService,
        {
          provide: trackerRepositoryToken,
          useValue: mockRepo,
        },
        {
          provide: PriceCheckerService,
          useValue: mockPriceCheckerService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: AlertService,
          useValue: mockAlertService,
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
        cryptoName: 'bitcoin',
        priceThreshold: 35536.44,
        type: TrackerType.INCREASE,
        notifyEmail: 'test@me.com',
      };

      const resolvedValue = {
        ...createTrackerDto,
        id: 1,
        updatedAt: new Date(),
        createdAt: new Date(),
        notifyEmail: 'test@me.com',
      };

      const currentPriceResult = {
        priceUsd: '30000.0043',
      };

      mockRepo.create.mockReturnValue(resolvedValue);
      mockRepo.save.mockResolvedValue(resolvedValue);
      mockPriceCheckerService.fetchPrice.mockResolvedValue(currentPriceResult);

      // Act
      const result = await service.create(createTrackerDto);

      // Assert
      expect(result).toBe(resolvedValue);
    });

    it('create method should check the price before creating new tracker', async () => {
      // Arrange
      const createTrackerDto: CreateTrackerDto = {
        cryptoName: 'btc',
        priceThreshold: 35536.44,
        type: TrackerType.INCREASE,
        notifyEmail: 'test@me.com',
      };

      const fetchPriceResult = {
        priceUsd: '37000.00',
      };

      mockPriceCheckerService.fetchPrice.mockResolvedValue(fetchPriceResult);

      // Act
      const createPromise = service.create(createTrackerDto);

      // Assert
      await expect(createPromise).rejects.toThrowError(BadRequestException);
    });

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
        priceThreshold: 35536.44,
        type: TrackerType.INCREASE,
        updatedAt: new Date(),
        createdAt: new Date(),
        notifyEmail: 'test@me.com',
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

  describe('checkCurrentPriceWithTrackerCondition', () => {
    it('checkCurrentPriceWithTrackerCondition method should be defined', () => {
      expect(service.checkCurrentPriceWithTrackerCondition).toBeDefined();
    });

    it('should return false for invalid condition', () => {
      // Arrange
      const currentPrice = 4.0;
      const targetPrice = 3.0;
      const trackerType = TrackerType.INCREASE;

      // Act
      const result = service.checkCurrentPriceWithTrackerCondition(
        trackerType,
        currentPrice,
        targetPrice,
      );

      // Arrest

      expect(result).toBeFalsy();
    });

    it('should return true for valid condition', () => {
      // Arrange
      const currentPrice = 4.0;
      const targetPrice = 3.0;
      const trackerType = TrackerType.DECREASE;

      // Act
      const result = service.checkCurrentPriceWithTrackerCondition(
        trackerType,
        currentPrice,
        targetPrice,
      );

      // Arrest
      expect(result).toBeTruthy();
    });
  });

  describe('checkTrackerContinuously', () => {
    it('checkTrackerContinuously method should be defined', () => {
      expect(service.checkTrackerContinuously).toBeDefined();
    });

    it('should delete trackers that met with the new price condition', async () => {
      // Arrange
      const trackers = [
        {
          id: 1,
          cryptoName: 'bitcoin',
          priceThreshold: '35000.0',
          type: TrackerType.INCREASE,
        },
        {
          id: 2,
          cryptoName: 'bitcoin',
          priceThreshold: '30000.0',
          type: TrackerType.INCREASE,
        },
        {
          id: 3,
          cryptoName: 'bitcoin',
          priceThreshold: '40000.0',
          type: TrackerType.DECREASE,
        },
        {
          id: 4,
          cryptoName: 'bitcoin',
          priceThreshold: '60000.0',
          type: TrackerType.INCREASE,
        },
        {
          id: 5,
          cryptoName: 'bitcoin',
          priceThreshold: '4000.0',
          type: TrackerType.DECREASE,
        },
      ];
      mockRepo.find.mockResolvedValue(trackers);
      when(mockPriceCheckerService.fetchPrice)
        .calledWith('bitcoin')
        .mockResolvedValue({
          id: 'bitcoin',
          priceUsd: 37000.0,
        });

      jest.spyOn(service, 'deleteAllBasedOnIDs');

      // Act
      await service.checkTrackerContinuously();

      // Arrest

      expect(service.deleteAllBasedOnIDs).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should call triggerAlert method for triggered alerts', async () => {
      // Arrange
      const trackers = [
        {
          id: 1,
          cryptoName: 'bitcoin',
          priceThreshold: '35000.0',
          type: TrackerType.INCREASE,
          notifyEmail: 'test@me.com',
        },
        {
          id: 2,
          cryptoName: 'bitcoin',
          priceThreshold: '30000.0',
          type: TrackerType.INCREASE,
          notifyEmail: 'test@me.com',
        },
        {
          id: 3,
          cryptoName: 'bitcoin',
          priceThreshold: '40000.0',
          type: TrackerType.DECREASE,
          notifyEmail: 'test@me.com',
        },
        {
          id: 4,
          cryptoName: 'bitcoin',
          priceThreshold: '60000.0',
          type: TrackerType.INCREASE,
          notifyEmail: 'test@me.com',
        },
        {
          id: 5,
          cryptoName: 'bitcoin',
          priceThreshold: '4000.0',
          type: TrackerType.DECREASE,
          notifyEmail: 'test@me.com',
        },
      ];
      mockRepo.find.mockResolvedValue(trackers);
      when(mockPriceCheckerService.fetchPrice)
        .calledWith('bitcoin')
        .mockResolvedValue({
          id: 'bitcoin',
          priceUsd: 37000.0,
        });

      jest.spyOn(service, 'triggerAlert');

      // Act
      await service.checkTrackerContinuously();

      // Arrest
      expect(service.triggerAlert).toHaveBeenCalledTimes(3);
    });
  });
});
