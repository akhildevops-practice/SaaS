import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  updatedBy:string;
  previousState:string;
  digiSignComment:string;
}
