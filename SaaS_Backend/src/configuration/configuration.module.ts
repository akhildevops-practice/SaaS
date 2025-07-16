import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';
import {
  ConfigurationSchema,
  Configuration,
} from './schema/configuration.schema';
import { npdConfig, npdConfigSchema } from './schema/departmentActivity.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';

@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: npdConfig.name, schema: npdConfigSchema },
    ]),
  ],
  controllers: [ConfigurationController],
  providers: [
    ConfigurationService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class ConfigurationModule {}
