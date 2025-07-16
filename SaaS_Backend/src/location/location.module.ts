import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';

import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [
    AuthenticationModule,
    UserModule,
    // MongooseModule.forFeature([
    //   { name: holiday_settings.name, schema: holidaySchema },
    // ]),
  ],
  controllers: [LocationController],
  providers: [LocationService, PrismaService],
  exports: [LocationService],
})
export class LocationModule {}
