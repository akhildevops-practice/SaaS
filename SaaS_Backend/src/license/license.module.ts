import { Module } from '@nestjs/common';
import { LicenseController } from './license.controller';
import { LicenseService } from './license.service';
import { MongooseModule } from '@nestjs/mongoose';
import { License, LicenseSchema } from './schema/license.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: License.name, schema: LicenseSchema }]),
    AuthenticationModule,
  ],
  controllers: [LicenseController],
  providers: [
    LicenseService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class LicenseModule {}
