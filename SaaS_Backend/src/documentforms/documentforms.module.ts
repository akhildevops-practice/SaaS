import { Module } from '@nestjs/common';
import { DocumentformsService } from './documentforms.service';
import { DocumentformsController } from './documentforms.controller';
import { DocumentformSchema, Documentform } from './schema/documentform.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomLogger } from 'src/audit-trial/logger.provider';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Documentform.name, schema: DocumentformSchema },
    ]),
  ],
  controllers: [DocumentformsController],
  providers: [
    DocumentformsService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class DocumentformsModule {}
