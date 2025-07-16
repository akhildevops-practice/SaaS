import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';

@Module({
  imports: [AuthenticationModule, UserModule],
  controllers: [ProblemController],
  providers: [ProblemService, PrismaService],
  exports: [ProblemService],
})
export class ProblemModule {}
