import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profiles/entities/profile.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PROFILE_DB_HOST,
      port: parseInt(process.env.PROFILE_DB_PORT) || 5432,
      username: process.env.PROFILE_DB_USERNAME,
      password: process.env.PROFILE_DB_PASSWORD,
      database: process.env.PROFILE_DB_DATABASE,
      entities: [Profile],
      autoLoadEntities: true,
      synchronize: true
    }),
    CacheModule.register(
      {
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        isGlobal: true
      }),
    ProfilesModule,
    AuthModule
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: AuthGuard,
  }]
})

export class AppModule { }
