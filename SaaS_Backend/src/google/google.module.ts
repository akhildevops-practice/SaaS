import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Google, GoogleDocument } from './schema/google.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { PrismaService } from 'src/prisma.service';
import {
  AppField,
  AppFieldSchema,
} from 'src/app-field/schema/app-field.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Google.name, schema: GoogleDocument },
      { name: AppField.name, schema: AppFieldSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [GoogleController],
  providers: [
    GoogleService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class GoogleModule {}
