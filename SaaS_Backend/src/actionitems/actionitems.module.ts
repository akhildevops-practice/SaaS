import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { EmailService } from 'src/email/email.service';
import { EntityModule } from 'src/entity/entity.module';
import {
  MeetingType,
  MeetingTypeDocument,
} from 'src/key-agenda/schema/meetingType.schema';
import { KpiReportModule } from 'src/kpi-report/kpi-report.module';
import { LocationModule } from 'src/location/location.module';
import {
  ActionPoint,
  ActionPointDocument,
} from 'src/mrm/schema/actionPoint.schema';
import { Agenda, AgendaDocument } from 'src/mrm/schema/agenda.schema';
import { Meeting, MeetingDocument } from 'src/mrm/schema/meeting.schema';
import { MRM, MRMDocument } from 'src/mrm/schema/mrm.schema';
import {
  ScheduleMRM,
  ScheduleMRMDocument,
} from 'src/mrm/schema/scheduleMrm.schema';
import { OrganizationModule } from 'src/organization/organization.module';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { ActionitemsController } from './actionitems.controller';
import { ActionitemsService } from './actionitems.service';
import { ActionItems, actionitemsSchema } from './schema/actionitems.schema';
import { CIP , CIPDocument } from 'src/cip/schema/cip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: MRM.name, schema: MRMDocument },
      { name: ScheduleMRM.name, schema: ScheduleMRMDocument },
      { name: MeetingType.name, schema: MeetingTypeDocument },
      { name: ActionPoint.name, schema: ActionPointDocument },
      { name: Agenda.name, schema: AgendaDocument },
      { name: Meeting.name, schema: MeetingDocument },
      { name: CIP.name, schema: CIPDocument },
    ]),
    OrganizationModule,
    UserModule,
    LocationModule,
    EntityModule,

    KpiReportModule,
    AuthenticationModule,
  ],
  controllers: [ActionitemsController],
  providers: [
    ActionitemsService,
    PrismaService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class ActionitemsModule {}
