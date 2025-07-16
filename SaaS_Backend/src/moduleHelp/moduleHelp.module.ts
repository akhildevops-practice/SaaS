import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { moduleHelpController } from './moduleHelp.controller';
import { moduleHelpService } from './moduleHelp.service';
import { moduleHelp, moduleHelpDocument } from './schema/moduleHelp.schema';
import { topicHelp, topicHelpDocument } from './schema/topicHelp.schema';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: moduleHelp.name, schema: moduleHelpDocument },
        { name: topicHelp.name, schema: topicHelpDocument },
      ]),
      AuthenticationModule,
    ],
    controllers: [moduleHelpController],
    providers: [
      moduleHelpService,
      {
        provide: 'Logger',
        useClass: CustomLogger,
      },
    ]
  })
  export class moduleHelpModule {}
