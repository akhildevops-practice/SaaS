import { Module } from '@nestjs/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { PrismaService } from '../prisma.service';
import { OrganisationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserModule } from '../user/user.module';
import { System, SystemSchema } from '../systems/schema/system.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthenticationModule,
    UserModule,
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
  ],
  controllers: [OrganisationController],
  providers: [OrganizationService, PrismaService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
