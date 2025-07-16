import { Module } from '@nestjs/common';
import { SystemsService } from './systems.service';
import { SystemsController } from './systems.controller';
import { System, SystemSchema } from './schema/system.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { OrganizationModule } from '../organization/organization.module';
import { PrismaService } from 'src/prisma.service';
import { Clauses, ClausesSchema } from './schema/clauses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: System.name, schema: SystemSchema },
      { name: Clauses.name, schema: ClausesSchema },
    ]),
    LocationModule,
    UserModule,
    AuthenticationModule,
    OrganizationModule,
  ],
  controllers: [SystemsController],
  providers: [SystemsService, PrismaService],
  exports: [SystemsService],
})
export class SystemsModule {}
