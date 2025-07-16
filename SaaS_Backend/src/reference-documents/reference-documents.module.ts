import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { referenceDocumentsController } from './reference-documents.controller';
import { referenceDocumentsService } from './reference-documents.service';
import { referenceDocuments, referenceDocumentsDocument } from './schema/reference-documents.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: referenceDocuments.name, schema: referenceDocumentsDocument },
        ]),
        AuthenticationModule,
        EmailModule,
    ],
    controllers: [referenceDocumentsController],
    providers: [
        referenceDocumentsService,
        PrismaService,
        EmailService,
        {
            provide: 'Logger',
            useClass: CustomLogger,
        },
    ]
})
export class referenceDocumentsModule { }
