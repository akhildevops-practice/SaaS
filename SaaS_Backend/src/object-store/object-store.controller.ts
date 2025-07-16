import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Delete,
  Inject,
  Put,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ObjectStoreService } from './object-store.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Controller('/api/objectStore')
export class ObjectStoreController {
  constructor(
    private readonly ObjectStoreService: ObjectStoreService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('/createObjectStore')
  createObjectStore(@UploadedFile() file, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/objectStore/createObjectStore`,
      'object-store.controller.ts',
    );
    return this.ObjectStoreService.createObjectStore(data, file, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getObjectStoreByOrgId/:id')
  getObjectStoreByOrgId(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/objectStore/getObjectStoreByOrgId/:id`,
      'object-store.controller.ts',
    );
    return this.ObjectStoreService.getObjectStoreByOrgId(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Patch('/updateObjectStore/:id')
  updateObjectStore(
    @Param('id') id: string,
    @UploadedFile() file,
    @Body() data: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PATCH api/objectStore/updateObjectStore`,
      'object-store.controller.ts',
    );
    return this.ObjectStoreService.updateObjectStore(
      id,
      data,
      file,
      randomNumber,
    );
  }
}
