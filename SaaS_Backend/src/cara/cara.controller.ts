import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { CaraService } from './cara.service';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';

@Controller('/api/cara')
export class CaraController {
  constructor(
    private readonly cara: CaraService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard)
  @Post('/createCara')
  async createCara(@Body() data: any, @Req() req) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} POST /api/cara/createCara for ${data} called`,
      'Cara-controller',
    );
    return this.cara.createCara(data, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getCaraById/:id')
  async getCaraById(@Param('id') id, @Req() req) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getCaraById/${id}`,
      'Cara-controller',
    );

    return this.cara.getCaraById(id, req.user.id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteCara/:id')
  async deleteCara(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getEntitiesForLocation/${id}`,
      'Cara-controller',
    );
    return this.cara.deleteCara(id, req.user, uuid);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('/updateCara/:id')
  async updateCara(@Param('id') id, @Body() data: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/updateCara/${id}`,
      'Cara-controller',
    );
    return this.cara.updateCara(id, data, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('/updateCaraForOutcome/:id')
  async updateCaraForOutcome(@Param('id') id, @Body() data: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/updateCaraForOutcome/${id}`,
      'Cara-controller',
    );
    return this.cara.updateCaraForOutcome(id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllCara')
  async getAllCara(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getAllCara`,
      'Cara-controller',
    );
    return this.cara.getAllCara(query, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getAllUsersOfEntity/:id')
  async getAllUsersOfEntity(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getAllUsersOfEntity/${id}`,
      'Cara-controller',
    );
    return this.cara.getUsersOfEntity(id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getEntitiesForLocation/:id')
  async getEntitiesForLocation(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getEntitiesForLocation/${id}`,
      'Cara-controller',
    );
    return this.cara.getEntitiesForLocation(id, randomNumber, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getDeptHeadForEntity/:id')
  async getDeptHeadForEntity(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getDeptHeadForEntity/${id}`,
      'Cara-controller',
    );
    return this.cara.getDeptHeadForEntity(id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('createDeviationType')
  async createDeviationType(@Body() data: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cara/createDeviationType`,
      'Cara-controller',
    );
    return this.cara.createDeviationType(data, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateDeviationType/:id')
  async updateDeviationType(@Body() data: any, @Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cara/updateDeviationType`,
      'Cara-controller',
    );
    return this.cara.updateDeviationType(id, data, req, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getDeviationType/:id')
  async getDeviationType(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getDeviationType/${id}`,
      'Cara-controller',
    );
    return this.cara.getDeviationType(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteDeviationType/:id')
  async deleteDeviationType(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/deleteDeviationType/${id}`,
      'Cara-controller',
    );
    return this.cara.deleteDeviationType(id, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDeviationType')
  async getAllDeviationType(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GEt api/cara/getallDeviationType`,
      'Cara-controller',
    );
    return this.cara.getAllDeviationType(req.user, randomNumber, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('searchCapa')
  async searchCapa(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/searchCapa`,
      'Cara-controller',
    );
    return this.cara.searchCapa(query, req.user, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getStatusOptionForCapa/:id')
  async getStatusOptionForCapa(@Param() id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getStatusOptionForCapa/${id}`,
      'Cara-controller',
    );
    return this.cara.getStatusOptionsForCapa(id, req.user, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('myCapa')
  async myCapa(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/myCapa`,
      'Cara-controller',
    );
    return this.cara.myCapa(query, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getCapaOwnerEntry/:id')
  async getCapaOwnerEntry(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getCapaOwnerEntry`,
      'Cara-controller',
    );
    return this.cara.getCapaOwnerEntry(id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('sendMailToNewOwner')
  async sendMailToOwner(@Body() data, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/sendMailToNewOwner/id`,
      'Cara-controller',
    );
    return this.cara.sendMailToOwner(data, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/createCapaOwnerEntry')
  createCapaOwnerEntry(@Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cara/createCapaOwnerEntry`,
      'cip.controller.ts',
    );
    return this.cara.createCapaOwnerEntry(data);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/createCapaComments')
  createCapaComments(@Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/cara/createCapaComments`,
      'cip.controller.ts',
    );
    return this.cara.createCapaComments(data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCapaCommentsById/:id')
  getCapaCommentsById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getCapaCommentsById/:id`,
      'cip.controller.ts',
    );
    return this.cara.getCapaCommentsById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllCapaForDH')
  getAllCapaForDH(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getAllCapaForDH`,
      'cip.controller.ts',
    );
    return this.cara.getAllCapaForDH(req.user, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllCapaForCapaOwner')
  getAllCapaForCapaOwner(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/ getAllCapaForCapaOwner`,
      'cip.controller.ts',
    );
    return this.cara.getAllCapaForCapaOwner(req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getAllCapaForInbox')
  getAllCapaForInbox(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/ getAllCapaForInbox`,
      'cip.controller.ts',
    );
    return this.cara.getCapaForInbox(req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getFilterListForCapa')
  getFilterListForCapa(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getFilterListForCapa`,
      'cip.controller.ts',
    );
    return this.cara.getFilterListForCapa(req.user, randomNumber, query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getProductsForLocation/:id')
  async getProductsForLocation(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getProductsForLocation for ${id} called`,
      '',
    );
    return this.cara.getProductForLocation(req.user.id, id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/capaMails')
  async getCapaMails(@Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POSt api/cara/getCapaMails`,
      'cip.controller.ts',
    );
    return this.cara.mailForCapas(data, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getChartData')
  getChartData(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getChartData`,
      'cip.controller.ts',
    );
    return this.cara.getChartData(req.user, randomNumber, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDeptwiseChartData')
  getDeptwiseChartData(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getDeptwiseChartData`,
      'cara.controller.ts',
    );
    return this.cara.getDeptwiseChartData(req.user, randomNumber, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getLocationwiseChartData')
  getLocationwiseChartData(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getLocationwiseChartData`,
      'cara.controller.ts',
    );
    return this.cara.getLocationwiseChartData(req.user, randomNumber, query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getCapaDataforIds')
  getCapaDataforIds(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getCapaforIds`,
      'cip.controller.ts',
    );
    return this.cara.getCapaDataforIds(req.user, randomNumber, query);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('/updateAnalysis/:id')
  async updateAnalysis(@Req() req, @Param('id') id, @Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/updateAnalysis/${id}`,
      'cip.controller.ts',
    );

    return this.cara.updateAnalysis(id, data, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getCausesForCapa/:id')
  async getCausesForCapa(@Req() req, @Param('id') id) {
    // console.log('api called');
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getCausesForCapa/${id}`,
      'aa',
    );

    return this.cara.getCausesForCapa(id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/createAnalysis')
  async createAnalysis(@Req() req, @Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/createAnalysis`,
      'cip.controller.ts',
    );
    return this.cara.createAnalysis(data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAnalysisForCapa/:id')
  async getAnalysis(@Req() req, @Param('id') id, @Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getAnalysisForCapa/${id}`,
      'cip.controller.ts',
    );
    return this.cara.getAnalysisForCapa(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCompleteOutcomeForCapa/:id')
  async getCompleteOutcomeForCapa(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getCompleteOutcomeForCapa/${id} started`,
      '',
    );
    return this.cara.getCompleteOutcomeForCapa(id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/createCaraDefect')
  createCaraDefect(@Req() req, @Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/createCaraDefect called`,
      '',
    );
    return this.cara.createCaraDefect(req.user.id, data, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getRcaSettingsForLocation/:id')
  async getCaraRcaSettingsForLocation(@Req() req, @Param('id') id) {
    // console.log('api called');
    this.logger.log(`api/cara/getCaraRcaSettingsForLocation/${id} started`, '');
    return this.cara.getCaraRcaSettingsForLocation(req.user.id, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCaraDefect/:id')
  getCaraDefect(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getCaraDefect/${id} called`,
      '',
    );
    return this.cara.getCaraDefect(req.user.id, id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDefectForProduct/:id')
  getDefectForProduct(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getDefectForProduct/${id} called`,
      '',
    );
    return this.cara.getDefectForProduct(req.user.id, id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Delete('/deleteCaraDefect/:id')
  deleteCaraDefect(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/cara/deleteCaraDefect/${id} called`,
      '',
    );
    return this.cara.deleteCaraDefect(req.user.id, id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Put('/updateCaraDefect/:id')
  async updateCaraDefect(@Req() req, @Body() data, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/cara/updateCaraDefect/${id} called`,
      '',
    );
    // console.log('api called');
    return this.cara.updateCaraDefect(req.user.id, id, data, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getCaraDefects')
  getCaraDefectsByProduct(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/cara/getCaraDefects for ${query} called`,
      '',
    );
    return this.cara.getCaraDefects(req.user.id, query, randomNumber);
  }

  //apis for basic level settings
  @UseGuards(AuthenticationGuard)
  @Post('/createCaraRcaSettings')
  async createCaraRcaSettings(@Req() req, @Body() data) {
    this.logger.log(
      `api/cara/createCaraRcaSettings service started for pyalod ${data}`,
      '',
    );
    return this.cara.createSettings(req.user.id, data);
  }
  @UseGuards(AuthenticationGuard)
  @Put('/updateCaraRcaSettings/:id')
  async updateCaraRcaSettings(@Req() req, @Body() data, @Param('id') id) {
    this.logger.log(
      `api/cara/updateCaraRcaSettingsservice started for pyalod ${data}`,
      '',
    );
    return this.cara.updateCaraRcaSettings(req.user.id, id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCaraRcaSettings')
  async getCaraRcaSettings(@Req() req, @Param('id') id, @Query() query) {
    this.logger.log(`api/cara/getCaraRcaSettings started`, '');
    return this.cara.getCaraRcaSettings(req.user.id, id, query);
  }
  @Get('/getCapaById/:id')
  async getCapaById(@Param('id') id, @Req() req) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getCaraById/${id}`,
      'Cara-controller',
    );

    return this.cara.getCapaById(id, randomNumber);
  }
  //api for workflow settings
  @UseGuards(AuthenticationGuard)
  @Post('createWorkflowConfig')
  async createWorkFlowConfig(@Body() data: any) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/createWorkFlowConfig started`,
      'Cara-controller',
    );
    return this.cara.createWorkflowConfig(data, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Put('updateWorkflowConfig/:id')
  async updateWorkFlowConfig(@Body() data: any, @Param('id') id: any) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/updateWorkFlowConfig started`,
      'Cara-controller',
    );
    return this.cara.updateWorkflowConfig(id, data, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getWorkflowConfig/:id')
  async getWorkFlowConfig(@Param('id') id: any) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getWorkflowConfig/${id} started`,
      'Cara-controller',
    );
    return this.cara.getWorkflowConfig(id, randomNumber);
  }
  //apis for new dashboard all included with year filters
  @UseGuards(AuthenticationGuard)
  @Get('/getStatusWiseCapaCount')
  async getStatusWiseCapaCount(@Query() query) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getStatusWiseCapaCount started`,
      'Cara-controller',
    );
    return this.cara.getStatusWiseCapaCount(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getOriginWiseCapaCount')
  async getOriginWiseCapaCount(@Query() query) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getOriginWiseCapaCount started`,
      'Cara-controller',
    );
    return this.cara.getOriginWiseCapaCount(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getOwnerWiseCapaCount')
  async getOwnerWiseCapaCount(@Query() query) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getOriginWiseCapaCount started`,
      'Cara-controller',
    );
    return this.cara.getOwnerWiseCapaCount(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getProductWiseCapaCount')
  async getProductWiseCapaCount(@Query() query) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getProductWiseCapaCount started`,
      'Cara-controller',
    );
    return this.cara.getProductWiseCapaCount(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getMonthWiseCapaCount')
  async getMonthWiseCapaCount(@Query() query) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getMonthWiseCapaCount started`,
      'Cara-controller',
    );
    return this.cara.getMonthWiseCapaCount(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getDefectTypeWiseCapaCount')
  async getDefectTypeWiseCapaCount(@Query() query) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getDefectTypeWiseCapaCount started`,
      'Cara-controller',
    );
    return this.cara.getDefectTypeWiseCapaCount(query, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCauseWiseCapaCount')
  async getCauseWiseCapaCount(@Query() query) {
    const randomNumber = uuid();

    this.logger.log(
      `trace id = ${randomNumber} GET /api/cara/getCauseWiseCapaCount started`,
      'Cara-controller',
    );
    return this.cara.getCauseWiseCapaCount(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getRcaSettingsForLocationInDashboard/:id')
  async getCaraRcaSettingsForLocationInDashboard(@Req() req, @Param('id') id) {
    // console.log('api called');
    this.logger.log(
      `api/cara/getCaraRcaSettingsForLocationInDashboard/${id} started`,
      '',
    );
    return this.cara.getCaraRcaSettingsForLocationInDashboard(req.user.id, id);
  }
}
