import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  imports: [AuthenticationModule, UserModule],
  controllers: [ModelController],
  providers: [ModelService, PrismaService],
  exports: [ModelService],
})
export class ModelModule {}
