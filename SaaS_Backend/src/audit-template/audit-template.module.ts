import { Module } from '@nestjs/common';
import { AuditTemplateService } from './audit-template.service';
import { AuditTemplateController } from './audit-template.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {AuditTemplate, AuditTemplateSchema } from "./schema/audit-template.schema";
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { Question, QuestionSchema,  } from './schema/question.schema';

@Module({
  imports: [ 
    MongooseModule.forFeature([{name: AuditTemplate.name, schema: AuditTemplateSchema}]),
    MongooseModule.forFeature([{name: Question.name, schema: QuestionSchema}]),
    AuthenticationModule,
    UserModule
  ],
  controllers: [AuditTemplateController],
  providers: [AuditTemplateService, PrismaService],
  exports: [AuditTemplateService]
})
export class AuditTemplateModule {}
