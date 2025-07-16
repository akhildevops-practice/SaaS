import { Module } from '@nestjs/common';
import { MeetingTypeController } from './meetingType.controller';
import { MeetingTypeService } from './meetingType.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingType, MeetingTypeDocument } from './schema/meetingType.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { Agenda, AgendaDocument } from 'src/mrm/schema/agenda.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MeetingType.name, schema: MeetingTypeDocument },
      { name: Agenda.name, schema: AgendaDocument },
    ]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    AuthenticationModule,
  ],
  controllers: [MeetingTypeController],
  providers: [
    MeetingTypeService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class MeetingTypeModule {}
