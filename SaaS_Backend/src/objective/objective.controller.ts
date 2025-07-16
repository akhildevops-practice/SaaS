import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AbilityGuard } from '../ability/ability.guard';
import { checkAbilities } from '../ability/abilities.decorator';
import { ObjectiveService } from './objective.service';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { Action } from 'src/ability/ability.factory';
import { CreateObjectMaster } from './dto/createObjectiveMaster';
import { ReviewComments } from './schema/reviewComments.schema';
import { identity } from 'rxjs';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
// import { identity } from 'rxjs';

@Controller('api/objective')
export class ObjectiveController {
  constructor(
    private readonly kpiService: ObjectiveService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('createOrgObjective')
  createOrganizationObjective(@Body() data, @Req() req) {
    const randomNumber = uuid;
    this.logger.log(
      `trace id=${randomNumber} POST api/objective/createOrgObjective service called`,
      '',
    );
    return this.kpiService.createOrganizationObjective(
      data,
      req.user,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('AllObjectives')
  allObjectives(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/AllObjectives service called`,
      '',
    );
    return this.kpiService.allObjectives(req.user.id, query, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Update, resource: 'KPI' })
  @Put('updateObjective/:id')
  updateObject(@Req() req, @Param('id') id: string, @Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} PUT api/objective/updateObjective service called`,
      '',
    );
    return this.kpiService.updateObject(id, req.user.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteObjective/:id')
  deleteObject(@Req() req, @Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} DELETE api/objective/deleteObjective service called`,
      '',
    );
    return this.kpiService.deleteObject(id, req.user.id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getYearFromOrganization')
  getYearFromOrganization(@Req() req) {
    return this.kpiService.getYearFromOrganization(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getOrganizationGoalsFromYear/:year')
  getOrganizationGoalsFromYear(@Req() req, @Param('year') year) {
    return this.kpiService.getOrganizationGoalsFromYear(req.user.id, year);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getNCFromYear/:year')
  getNCFromYear(@Req() req, @Param('year') year) {
    return this.kpiService.getNCFromYear(req.user.id, year);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getObservation/:year')
  getObservationFromYear(@Req() req, @Param('year') year) {
    return this.kpiService.getObservationFromYear(req.user.id, year);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createObjectMaster')
  createObjectMaster(@Req() req, @Body() data: CreateObjectMaster) {
    // console.log('calling service');
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} POST api/objective/createObjectMaster forpayload ${data} service called`,
      '',
    );
    return this.kpiService.createObjectMaster(req.user.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllObjectMasterWithOutPagination')
  getAllObjectMasterWithOutPagination(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/getAllObjectMasterWithOutPagination  service called`,
      '',
    );
    return this.kpiService.getAllObjectMasterWithOutPagination(
      req.user,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllObjectMaster')
  getAllObjectMaster(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/getAllObjectMaster for ${query} service called`,
      '',
    );
    return this.kpiService.getAllObjectMaster(req.user, query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('searchObjectMaster')
  searchObjectMaster(@Req() req, @Query() query) {
    return this.kpiService.searchObjectMaster(req.user, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getObjectMasterById/:id')
  getObjectMasterById(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/getObjectMasterById/${id} service called`,
      '',
    );
    return this.kpiService.getObjectMasterById(req.user, id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllUserForLocation/:id')
  getAllUser(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/getAllUserForLocation/${id} service called`,
      '',
    );
    return this.kpiService.getAllUser(req.user.id, id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('myObjectives')
  myObjectives(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/myObjectives service called`,
      '',
    );
    return this.kpiService.getMyObjectives(req.user, query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getUserById/:id')
  getUserById(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/getUserById/${id} service called`,
      '',
    );
    return this.kpiService.getUserById(req.user, id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getLocationForObjectiveMaster')
  getLocationForObjectiveMaster(@Req() req) {
    return this.kpiService.getLocationForObjectiveMaster(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDepartmentForObjectiveMaster')
  getDepartmentForObjectiveMaster(@Req() req) {
    return this.kpiService.getDepartmentForObjectiveMaster(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateObjectMaster/:id')
  updateObjectMaster(@Param('id') id, @Body() data, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} PUT api/objective/updateObjectMaster/${id} service called`,
      '',
    );
    return this.kpiService.updateObjectMaster(
      id,
      data,
      req.user.id,
      randomNumber,
    );
  }
  //api to get all kpi associated with an objective
  @UseGuards(AuthenticationGuard)
  @Get('getAllKpisforObjective/:id')
  async getAllKpisforObjective(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/getAllKpisforObjective for ${id} service called`,
      '',
    );
    return this.kpiService.getAllKpisOfObjective(id, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Post('createReviewComments')
  createReviewComments(@Body() data, @Req() req) {
    return this.kpiService.createReviewComments(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteObjectMaster/:id')
  deleteObjectMaster(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} DELETE api/objective/deleteObjectMaster for ${id} service called`,
      '',
    );
    return this.kpiService.deleteObjectMaster(req.user.id, id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createOwnerComments')
  createOwnerComments(@Body() data, @Req() req) {
    return this.kpiService.createOwnerComments(data, req.user.id);
  }

  // @Get("testpart")
  // testPart(@Query('test') value){
  //   ////////////////console.log("value",value)
  //   return value
  // }

  @UseGuards(AuthenticationGuard)
  @Put('update/:id')
  update(@Param('id') id, @Body() data, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} Put api/objective/update for ${id} and ${data}service called`,
      '',
    );
    return this.kpiService.update(id, data, req.user.id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllDeptKpisForUnitObj/:id')
  getAllDeptKpisForUnitObj(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/objective/getAllDeptKpisForUnitObj for ${id} service called`,
      '',
    );
    return this.kpiService.getAllDeptObjectivesForUnit(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getFilterListForObjectives')
  getFilterListForObjectives(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/objective/getFilterListForObjectives`,
      '',
    );
    return this.kpiService.getFilterListForObjectives(req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getObjectivesForCopy')
  getObjectivesForCopy(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/objective/getAllObjectivesForCopy`,
      '',
    );
    return this.kpiService.getAllObjectivesForCopy(
      req.user,
      query,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getObjectivesForSelect')
  getObjectivesForSelect(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/objective/getAllObjectivesForSelect`,
      '',
    );
    return this.kpiService.getAllObjectivesForSelect(
      req.user,
      query,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getEntitiesBasedOnRole/:id')
  getEntitiesBasedOnRole(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/objective/getEntitiesBasedOnRole`,
      '',
    );
    return this.kpiService.getEntitiesBasedOnRole(
      id,
      req.user,

      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getObjectivesForCategory')
  async getObjectivesForCategory(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/objective/getObjectivesForCategory/${query}`,
      '',
    );
    return this.kpiService.getObjectivesForCategory(
      query,
      req.user,

      randomNumber,
    );
  }
}
