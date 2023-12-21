import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthProfileDto } from 'src/profiles/dto/auth-profile.dto';
import { ProfilesService } from 'src/profiles/profiles.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private profilesService: ProfilesService,
    private jwtService: JwtService
  ) { }

  async signIn(input: AuthProfileDto): Promise<any> {
    const profile = await this.profilesService.getProfileByPhoneNumber(input.phoneNumber);

    const isPasswordMatch = await bcrypt.compare(input.password, profile.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    const payload = { id: profile.id, phoneNumber: profile.phoneNumber }
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
