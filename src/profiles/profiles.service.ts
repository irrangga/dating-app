import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { And, DataSource, Entity, Repository } from 'typeorm';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import * as bcrypt from 'bcrypt';
import { ActorDto } from './dto/actor.dto';
import { ProfileGender, ProfileSwipe } from './constants/profile.constants';
import { SwipeProfileDto } from './dto/swipe-profile.dto';


@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private dataSource: DataSource
  ) { }

  async getProfileDiscovery(id: string): Promise<any> {
    const userProfile = await this.getProfileById(id)
    const genderMatch = userProfile.gender === ProfileGender.MALE ? ProfileGender.FEMALE : ProfileGender.MALE

    const otherProfile = await this.dataSource
      .getRepository(Profile)
      .createQueryBuilder("profile")
      .where("profile.id != :id", { id: userProfile.id })
      .andWhere("profile.gender = :gender", { gender: genderMatch })
      .getOne()

    const { password, isLikedBy, ...result } = otherProfile
    return result
  }

  async getProfileById(id: string): Promise<Profile> {
    return await this.profilesRepository.findOneBy({ id: id })
  }

  async getProfileByPhoneNumber(phoneNumber: string): Promise<Profile> {
    return await this.profilesRepository.findOneBy({ phoneNumber: phoneNumber })
  }

  async swipeProfile(input: SwipeProfileDto, actor: ActorDto): Promise<any> {
    const otherProfile = await this.getProfileById(input.id)

    if (input.swipe === ProfileSwipe.RIGHT && !(otherProfile.isLikedBy.includes(actor.id))) {
      const otherProfileDto = new CompleteProfileDto
      otherProfile.isLikedBy.push(actor.id)
      otherProfileDto.isLikedBy = otherProfile.isLikedBy

      await this.updateProfile(otherProfile, otherProfileDto)
    }

    const { password, ...result } = otherProfile
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
