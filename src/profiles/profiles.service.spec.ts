import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileGender, ProfileSwipe } from './constants/profile.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource, UpdateResult } from 'typeorm';

describe('ProfilesService', () => {
  let service: ProfilesService;

  const mockProfileRepository = {
    findOneBy: jest.fn(),
    update: jest.fn(),
  }

  const mockDataSource = {
    getRepository: jest.fn(),
  }

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager
        }
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  describe('getProfileDiscovery', () => {
    it("should return profile that has never been viewed", async () => {
      const profile1: Partial<Profile> = {
        firstName: "John",
        lastName: "Wick",
        gender: ProfileGender.MALE,
      }

      const profile2: Partial<Profile> = {
        firstName: "Anna",
        lastName: "William",
        gender: ProfileGender.FEMALE,
      }

      jest.spyOn(mockProfileRepository, "findOneBy").mockReturnValue(profile1)
      jest.spyOn(mockDataSource, "getRepository").mockImplementation(() => {
        return {
          createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(profile2),
          }))
        }
      })

      const result = await service.getProfileDiscovery(profile1.id)

      expect(result).toEqual(profile2)
    });
  })

  describe('swipeProfile', () => {
    it("should return profile that has been swiped", async () => {
      const profile1: Partial<Profile> = {
        id: "1",
        firstName: "John",
        lastName: "Wick",
        gender: ProfileGender.MALE,
        phoneNumber: "000000000",
      }

      const profile2: Partial<Profile> = {
        firstName: "Anna",
        lastName: "William",
        gender: ProfileGender.FEMALE,
        likedByProfileIds: []
      }

      jest.spyOn(mockProfileRepository, "findOneBy").mockReturnValue(profile2)
      jest.spyOn(mockProfileRepository, "update").mockReturnValue(profile2)

      const result = await service.swipeProfile({ id: profile2.id, swipe: ProfileSwipe.RIGHT }, { id: profile1.id, phoneNumber: profile1.phoneNumber })

      const { likedByProfileIds, ...resultProfile2 } = profile2
      expect(result).toEqual(resultProfile2)
    });
  })
});
