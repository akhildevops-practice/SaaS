import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';

@Module({
  imports: [AuthenticationModule, UserModule],
  controllers: [PartsController],
  providers: [PartsService, PrismaService],
  exports: [PartsService],
})
export class PartModule {}
