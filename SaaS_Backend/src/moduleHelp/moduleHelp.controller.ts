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
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { moduleHelpService } from './moduleHelp.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Controller('/api/moduleHelp')
export class moduleHelpController {
    constructor(
        private readonly moduleHelpService: moduleHelpService,
        @Inject('Logger') private readonly logger: Logger,
      ) {}

    @UseGuards(AuthenticationGuard)
    @Post('/createModule')
    createModule(@Body() data: any, @Req() req: any) {
      const randomNumber = uuid();
      this.logger.log(
        `trace id = ${randomNumber} POST api/moduleHelp/createModule payload = ${data}`,
        'moduleHelp.controller.ts',
      );
      return this.moduleHelpService.createModule(data, randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @Get('/getAllModules')
    getAllModules(){
      const randomNumber = uuid();
      this.logger.log(
        `trace id = ${randomNumber} GET api/moduleHelp/getAllModules`,
        'moduleHelp.controller.ts',
      );
      return this.moduleHelpService.getAllModules(randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @Get('/getTopicsByModuleId/:id')
    getTopicsByModuleId(@Param('id') id: string){
      const randomNumber = uuid();
      this.logger.log(
        `trace id = ${randomNumber} GET api/moduleHelp/getTopicsByModuleId/${id}`,
        'moduleHelp.controller.ts',
      );
      return this.moduleHelpService.getTopicsByModuleId(id,randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @Put('/updateModule/:id')
    updateModule(@Body() data,@Param('id') id: string){
      const randomNumber = uuid();
      this.logger.log(
        `trace id = ${randomNumber} PUT api/moduleHelp/updateModule/${id} payload = ${data}`,
        'moduleHelp.controller.ts',
      );
      return this.moduleHelpService.updateModule(id,data,randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @Delete('/deleteModule/:id')
    deleteModule(@Param('id') id: string){
      const randomNumber = uuid();
      this.logger.log(
        `trace id = ${randomNumber} DELETE api/moduleHelp/deleteModule/${id}`,
        'moduleHelp.controller.ts',
      );
      return this.moduleHelpService.deleteModule(id,randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
    @Post('/createTopic')
    async createTopic(@UploadedFile() file, @Body('moduleId') moduleId, @Body('topic') topic, @Body('deleted') deleted) {
      const data = {
        moduleId,
        topic,
        deleted
      }
      const randomNumber = uuid();
      this.logger.log(
        `trace id = ${randomNumber} POST api/moduleHelp/createTopic payload = ${data}`,
        'moduleHelp.controller.ts',
      );
      return await this.moduleHelpService.createTopic(file, data, randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
    @Put('/updateTopic/:id')
    updateTopic(@UploadedFile() file, @Body('topic') topic, @Body('deleted') deleted, @Param('id') id: string){
      const randomNumber = uuid();
      const data = {
        topic,
        deleted
      }
      this.logger.log(
        `trace id = ${randomNumber} PUT api/moduleHelp/updateTopic/${id} payload = ${data}`,
        'moduleHelp.controller.ts',
      );
      return this.moduleHelpService.updateTopic(id,file,data,randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @Delete('/deleteTopic/:id')
    deleteTopic(@Param('id') id: string){
      const randomNumber = uuid();
      this.logger.log(
        `trace id = ${randomNumber} DELETE api/moduleHelp/deleteTopic/${id}`,
        'moduleHelp.controller.ts',
      );
      return this.moduleHelpService.deleteTopic(id,randomNumber)
    }
}
