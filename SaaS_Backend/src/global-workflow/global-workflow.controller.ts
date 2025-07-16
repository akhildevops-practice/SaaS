import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
  Inject,
  Delete,
} from '@nestjs/common';
import { GlobalWorkflowService } from './global-workflow.service';
import { v4 as uuid } from 'uuid';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';

import { Logger, log } from 'winston';

@Controller('api/global-workflow')
export class GlobalWorkflowController {
  constructor(
    private readonly globalWorklowService: GlobalWorkflowService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('/createGlobalWorkflow')
  createGlobalWorkflow(@Body() data, @Req() req) {
    const randomNumber = uuid();
    return this.globalWorklowService.createGlobalWorkflow(
      data,
      req.user,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateGlobalWorkflow/:id')
  updateGlobalWorkflow(@Param('id') id, @Body() data, @Req() req) {
    const randomNumber = uuid();
    return this.globalWorklowService.updateGlobalWorkflow(
      id,
      data,
      req.user,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteGlobalWorkflow/:id')
  deleteGlobalWorkflow(@Param('id') id) {
    const randomNumber = uuid();
    return this.globalWorklowService.deleteGlobalWorkflow(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getGlobalWorkflowTableData')
  getGlobalWorkflowTableData(@Req() req, @Query() query) {
    const randomNumber = uuid();
    return this.globalWorklowService.getGlobalWorkflowTableData(
      query,
      req.user,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getGlobalWorkflowById/:id')
  getGlobalWorkflowById(@Param('id') id) {
    const randomNumber = uuid();
    return this.globalWorklowService.getGlobalWorkflowById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getOldGlobalWorkflowForTranscation/:id')
  getOldGlobalWorkflowForTranscation(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    return this.globalWorklowService.getOldGlobalWorkflowForTranscation(
      id,
      req.user,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getGlobalWorkflowForTranscation/:id')
  getGlobalWorkflowForTranscation(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    return this.globalWorklowService.getGlobalWorkflowForTranscation(
      id,
      req.user,
      randomNumber,
    );
  }
}
