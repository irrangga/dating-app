import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { Public } from '../common/public-endpoint';
import { SwipeProfileDto } from './dto/swipe-profile.dto';


@Controller('profile')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) { }

  @Public()
  @Post('sign-up')
  async signUp(@Body() input: CompleteProfileDto): Promise<Profile> {
    return this.profilesService.insertProfile(input)
  }

  @Get('discovery')
  async getProfileDiscovery(@Req() request: any): Promise<Profile> {
    return this.profilesService.getProfileDiscovery(request.actor.id)
  }

  @Put('swipe')
  async swipeProfile(@Body() input: SwipeProfileDto, @Req() request: any): Promise<Profile> {
    return this.profilesService.swipeProfile(input, request.actor)
  }
}
