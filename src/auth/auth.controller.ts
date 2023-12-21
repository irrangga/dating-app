import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthProfileDto } from 'src/profiles/dto/auth-profile.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/public-endpoint';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async signIn(@Body() input: AuthProfileDto) {
    return this.authService.signIn(input)
  }
}
