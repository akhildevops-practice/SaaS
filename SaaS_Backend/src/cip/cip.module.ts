import { Module } from '@nestjs/common';
import { CIPController } from './cip.controller';
import { CIPService } from './cip.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CIP, CIPDocument } from './schema/cip.schema';
import { CIPCategory, CIPCategoryDocument } from './schema/cip-category.schema';
import { CIPType, CIPTypeDocument } from './schema/cip-type.schema';
import { CIPOrigin, CIPOriginDocument } from './schema/cip-origin.schema';
import { CIPTeam, CIPTeamDocument } from './schema/cip-team.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { CIPActionItems, CIPActionItemsDocument } from './schema/cip-actionItems.schema';
import { PrismaService } from 'src/prisma.service';
import { CIPDocumentComments, CIPDocumentCommentsDocument } from './schema/cip-documentComments.schema';
import { RefsModule } from 'src/refs/refs.module';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { ActionItems, actionitemsSchema } from 'src/actionitems/schema/actionitems.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CIP.name, schema: CIPDocument },
      { name: CIPCategory.name, schema: CIPCategoryDocument },
      { name: CIPType.name, schema: CIPTypeDocument },
      { name: CIPOrigin.name, schema: CIPOriginDocument },
      { name: CIPTeam.name, schema: CIPTeamDocument },
      { name: CIPActionItems.name, schema: CIPActionItemsDocument},
      { name: CIPDocumentComments.name, schema: CIPDocumentCommentsDocument},
      { name: ActionItems.name, schema: actionitemsSchema},
    ]),
    AuthenticationModule,
    RefsModule,
    EmailModule,
  ],
  controllers: [CIPController],
  providers: [
    CIPService,
    PrismaService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ]
})
export class CipModule {}
