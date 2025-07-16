import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [AuthenticationModule,UserModule],
  controllers: [RolesController],
  providers: [RolesService, PrismaService],
  exports:[RolesService]
})
export class RolesModule {}
