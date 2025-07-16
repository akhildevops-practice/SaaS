import { Module } from '@nestjs/common';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Prisma } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { NPDService } from './npd.service';
import { NpdGanttChart, NpdGanttChartSchema } from './schema/ganttChart.schema';
import { NPDController } from './npd.controller';
import { NpdRegister, NpdRegisterSchema } from './schema/registerNpd.schema';
import {
  npdConfig,
  npdConfigSchema,
} from 'src/configuration/schema/departmentActivity.schema';
import {
  addDepartmentGantt,
  addDepartmentGanttSchema,
} from './schema/addDepartmentGantt';
import {
  MinutesOfMeeting,
  MinutesOfMeetingSchema,
} from './schema/minutesOfMeeting.schema';
import {
  DiscussionItem,
  DiscussionItemSchema,
} from './schema/discussionItem.schema';
import { ActionPlan, ActionPlanSchema } from './schema/actionPlan.schema';
import { DelayedItem, DelayedItemSchema } from './schema/delayedItem.schema';
import {
  DelayedItemActionPlan,
  DelayedItemActionPlanSchema,
} from './schema/delayedItemActionPlanes.Schema';
import {
  RiskPrediction,
  RiskPredictionSchema,
} from './schema/riskPrediction.schema';
import {
  RiskPredictionActionPlan,
  RiskPredictionActionPlanSchema,
} from './schema/riskPredictionActionPlanes.schema';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/configuration/schema/configuration.schema';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { SvarGantt, SvarGanttChartSchema } from './schema/SvarGantt.schema';

@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: NpdGanttChart.name, schema: NpdGanttChartSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: npdConfig.name, schema: npdConfigSchema },
      { name: addDepartmentGantt.name, schema: addDepartmentGanttSchema },
      { name: MinutesOfMeeting.name, schema: MinutesOfMeetingSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: DiscussionItem.name, schema: DiscussionItemSchema },
      { name: ActionPlan.name, schema: ActionPlanSchema },
      { name: DelayedItem.name, schema: DelayedItemSchema },
      { name: SvarGantt.name, schema: SvarGanttChartSchema },
      { name: DelayedItemActionPlan.name, schema: DelayedItemActionPlanSchema },
      { name: RiskPrediction.name, schema: RiskPredictionSchema },
      {
        name: RiskPredictionActionPlan.name,
        schema: RiskPredictionActionPlanSchema,
      },
    ]),
  ],
  controllers: [NPDController],
  providers: [
    NPDService,
    PrismaService,
    EmailService,
    SerialNumberService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class NPDModule {}
