import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { MailtemplateController } from './mailtemplate.controller';
import { MailtemplateService } from './mailtemplate.service';
import { MailTemplate, mailTemplateSchema } from './schema/mailTemplate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailTemplate.name, schema: mailTemplateSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [MailtemplateController],
  providers: [
    MailtemplateService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class MailtemplateModule {}
