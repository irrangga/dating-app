import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { DataSource, Repository } from 'typeorm';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import * as bcrypt from 'bcrypt';
import { ActorDto } from './dto/actor.dto';
import { ProfileGender, ProfileSwipe } from './constants/profile.constants';
import { SwipeProfileDto } from './dto/swipe-profile.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisKey } from 'src/common/redis-key';


@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  // GET_PROFILE_DISCOVERY:
  // 1. get user profile
  // 2. get data of profiles which have viewed by user within a day
  // 3. get profile discovery based on:
  //      - matching gender
  //      - profile that never viewed within a day
  // 4. mark profile as viewed by add profile_id to user.viewed_profile_ids
  //    and update ttl to expiration_time (currently set to the end of day 00:00:00)
  async getProfileDiscovery(userId: string): Promise<any> {
    const userProfile = await this.getProfileById(userId)
    const genderMatch = userProfile.gender === ProfileGender.MALE ? ProfileGender.FEMALE : ProfileGender.MALE

    const viewedProfileIds: string[] = await this.cacheManager.get(`${userId}:${RedisKey.VIEWED_PROFILE_IDS}`) || []

    const query = this.dataSource
      .getRepository(Profile)
      .createQueryBuilder("profile")
      .where("profile.id != :id", { id: userProfile.id })
      .andWhere("profile.gender = :gender", { gender: genderMatch })

    if (viewedProfileIds.length) {
      query.andWhere("profile.id NOT IN (:...ids)", { ids: viewedProfileIds })
    }
    const profileDiscovery = await query.getOne()

    if (profileDiscovery) {
      viewedProfileIds.push(profileDiscovery.id)

      const now = new Date()
      let expirationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0)
      if (expirationTime.getTime() < now.getTime()) {
        expirationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 24, 0, 0)
      }
      const ttl = expirationTime.getTime() - now.getTime()
      await this.cacheManager.set(`${userId}:${RedisKey.VIEWED_PROFILE_IDS}`, viewedProfileIds, ttl)

      const { password, likedByProfileIds, ...result } = profileDiscovery
      return result
    }
    return null
  }

  async getProfileById(id: string): Promise<Profile> {
    return await this.profilesRepository.findOneBy({ id: id })
  }

  async getProfileByPhoneNumber(phoneNumber: string): Promise<Profile> {
    return await this.profilesRepository.findOneBy({ phoneNumber: phoneNumber })
  }

  // SWIPE_PROFILE:
  // 1. get detail of swiped profile
  // 2. if swipe right (like) --> update db by add user_id to swiped_profile.liked_by_profile_ids
  //    if swipe left (pass) --> no update db
  async swipeProfile(input: SwipeProfileDto, actor: ActorDto): Promise<any> {
    const swipedProfile = await this.getProfileById(input.id)

    if (input.swipe === ProfileSwipe.RIGHT && !(swipedProfile.likedByProfileIds.includes(actor.id))) {
      const swipedProfileDto = new CompleteProfileDto
      swipedProfile.likedByProfileIds.push(actor.id)
      swipedProfileDto.likedByProfileIds = swipedProfile.likedByProfileIds

      await this.updateProfile(swipedProfile, swipedProfileDto)
    }

    const { password, ...result } = swipedProfile
    return result
  }

  async insertProfile(input: CompleteProfileDto): Promise<Profile> {
    input.password = await bcrypt.hash(input.password, await bcrypt.genSalt())
    return await this.profilesRepository.save(input)
  }

  async updateProfile(profile: Profile, input: CompleteProfileDto): Promise<Profile> {
    await this.profilesRepository.update(profile.id, input)
    return await this.getProfileById(profile.id)
  }
}
