import { Module } from '@nestjs/common';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { SerialNumberController } from './serial-number.controller';
import { SerialNumberService } from './serial-number.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NpdRegister,
  NpdRegisterSchema,
} from 'src/Npd/schema/registerNpd.schema';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/configuration/schema/configuration.schema';

@Module({
  exports: [SerialNumberService],
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
  ],
  controllers: [SerialNumberController],
  providers: [
    SerialNumberService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class SerialNumberModule {}
