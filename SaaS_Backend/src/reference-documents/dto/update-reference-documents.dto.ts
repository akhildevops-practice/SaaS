import { PartialType } from '@nestjs/mapped-types';
import { CreateReferenceDocumentDto } from './create-reference-documents.dto';

export class UpdateReferenceDocumentDto extends PartialType(CreateReferenceDocumentDto) { }