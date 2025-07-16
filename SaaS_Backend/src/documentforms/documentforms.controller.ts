import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DocumentformsService } from './documentforms.service';

@Controller('/api/documentforms')
export class DocumentformsController {
  constructor(private readonly documentformsService: DocumentformsService) {}

  @Post()
  create(@Body() body: any) {
    return this.documentformsService.create(body);
  }

  @Get('/getallformtitles/:organizationId')
  getallformtitles(@Param('organizationId') organizationId: string) {
    return this.documentformsService.getallformtitles(organizationId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.documentformsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentformsService.findOne(id);
  }

  @Patch(':id')
  update(@Body() body: any, @Param('id') id: string) {
    return this.documentformsService.update(body, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentformsService.delete(id);
  }
}
