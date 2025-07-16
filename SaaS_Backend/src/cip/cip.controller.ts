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
} from '@nestjs/common';
import { CIPService } from './cip.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
import { threadId } from 'worker_threads';

@Controller('/api/cip')
export class CIPController {
  constructor(
    private readonly CIPService: CIPService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post()
  createCIP(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cip/`,
      'cip.controller.ts',
    );
    return this.CIPService.createCIP(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAll/:year/:location')
  getAllCIP(
    @Req() req,
    @Param('year') year,
    @Param('location') location,
    @Query() data,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/`,
      'cip.controller.ts',
    );
    return this.CIPService.getAllCIP(
      req.user.id,
      year,
      location,
      data,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPById/:id')
  getCIPById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPById/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getActionButton/:id')
  getActionButton(@Req() req, @Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getActionButton/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getActionButton(req.user, id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Put(':id')
  updateCIP(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cip/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.updateCIP(id, data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete(':id')
  deleteCIP(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/cip/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.deleteCIP(id, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createCIPCategory')
  createCIPCategory(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cip/createCIPCategory`,
      'cip.controller.ts',
    );
    return this.CIPService.createCIPCategory(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllCIPCategory')
  getAllCIPCategory(@Req() req, @Query() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getAllCIPCategory`,
      'cip.controller.ts',
    );
    return this.CIPService.getAllCIPCategory(req.user.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPCategoryById/:id')
  getCIPCategoryById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPCategoryById/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPCategoryById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateCIPCategory/:id')
  updateCIPCategory(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cip/updateCIPCategory/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.updateCIPCategory(id, data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteCIPCategory/:id')
  deleteCIPCategory(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/cip/deleteCIPCategory/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.deleteCIPCategory(id, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createCIPType')
  createCIPType(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cip/createCIPType`,
      'cip.controller.ts',
    );
    return this.CIPService.createCIPType(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllCIPType')
  getAllCIPType(@Req() req, @Query() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getAllCIPType`,
      'cip.controller.ts',
    );
    return this.CIPService.getAllCIPType(req.user.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPTypeById/:id')
  getCIPTypeById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPTypeById/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPTypeById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPTypeByLocation/:id')
  getCIPTypeByLocation(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPTypeByLocation`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPTypeByLocation(id, req.user.id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateCIPType/:id')
  updateCIPType(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cip/updateCIPType/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.updateCIPType(id, data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteCIPType/:id')
  deleteCIPType(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/cip/deleteCIPType/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.deleteCIPType(id, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createCIPOrigin')
  createCIPOrigin(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cip/createCIPOrigin`,
      'cip.controller.ts',
    );
    return this.CIPService.createCIPOrigin(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllCIPOrigin')
  getAllCIPOrigin(@Req() req, @Query() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getAllCIPOrigin`,
      'cip.controller.ts',
    );
    return this.CIPService.getAllCIPOrigin(req.user.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPOriginById/:id')
  getCIPOriginById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPOriginById/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPOriginById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPOriginByLocation/:id')
  getCIPOriginByLocation(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPOriginByLocation`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPOriginByLocation(
      id,
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateCIPOrigin/:id')
  updateCIPOrigin(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cip/updateCIPOrigin/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.updateCIPOrigin(id, data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteCIPOrigin/:id')
  deleteCIPOrigin(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/cip/deleteCIPOrigin/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.deleteCIPOrigin(id, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createCIPActionItem')
  createCIPActionItem(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cip/createCIPActionItem`,
      'cip.controller.ts',
    );
    return this.CIPService.createCIPActionItem(data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPActionItemsByCIPId/:id')
  getCIPActionItemById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPActionItemsByCIPId/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPActionItemsByCIPId(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateCIPActionItem/:id')
  updateCIPActionItem(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cip/updateCIPActionItem/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.updateCIPActionItem(id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteCIPActionItem/:id')
  deleteCIPActionItem(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/cip/deleteCIPActionItem/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.deleteCIPActionItem(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createCIPDocumentComments')
  createCIPDocumentComments(@Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cip/createCIPDocumentComments`,
      'cip.controller.ts',
    );
    return this.CIPService.createCIPDocumentComments(data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPDocumentCommentsById/:id')
  getCIPDocumentCommentsById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPDocumentCommentsById/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPDocumentCommentsByCIPId(id, randomNumber);
  }
  //inbox api
  @UseGuards(AuthenticationGuard)
  @Get('/getCIPInfoForInbox')
  getCIPInfoForInbox(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPForInbox`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPInfoForInbox(req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('chartData')
  chartData(@Req() req, @Query() filter) {
    return this.CIPService.chartData(filter, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getCipDataForIds')
  async getCipDataForIds(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/ getCipDataForIds started`,
      'cip.controller.ts',
    );
    return this.CIPService.getCipDataForIds(req.user, randomNumber, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDeptwiseChartData')
  getDeptwiseChartData(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getDeptwiseChartData`,
      'cip.controller.ts',
    );
    return this.CIPService.getDeptwiseChartData(req.user, randomNumber, query);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createCIPTeam')
  createCIPTeam(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cip/createTeamCategory`,
      'cip.controller.ts',
    );
    return this.CIPService.createCIPTeam(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllCIPTeams')
  getAllCIPTeam(@Req() req, @Query() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getAllCIPTeams`,
      'cip.controller.ts',
    );
    return this.CIPService.getAllCIPTeams(req.user.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCIPTeamById/:id')
  getCIPTeamById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cip/getCIPTeamById/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.getCIPTeamById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateCIPTeam/:id')
  updateCIPTeam(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cip/updateCIPTeam/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.updateCIPTeam(id, data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteCIPTeam/:id')
  deleteCIPTeam(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/cip/deleteCIPTeam/:id`,
      'cip.controller.ts',
    );
    return this.CIPService.deleteCIPTeam(id, req, randomNumber);
  }
}
