import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { EmailService } from 'src/email/email.service';
import { EntityModule } from 'src/entity/entity.module';
import { LocationModule } from 'src/location/location.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { PrismaService } from 'src/prisma.service';
import { RefsModule } from 'src/refs/refs.module';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { UserModule } from 'src/user/user.module';
import {
  ticketSupport,
  ticketSupportSchema,
} from './schema/ticketSupport.schema';
import { TicketSupportController } from './ticket-support.controller';
import { TicketSupportService } from './ticket-support.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ticketSupport.name, schema: ticketSupportSchema },
    ]),
    AuthenticationModule,
    // TicketSupportModule,
  ],
  controllers: [TicketSupportController],
  providers: [
    TicketSupportService,
    PrismaService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class TicketSupportModule {}
