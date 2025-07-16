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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
//import { ConnectedAppsService } from './connected-apps.service';
import { KpiDefinitionService } from './kpi-definition.service';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities, CHECK_ABILITY } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import { PrismaService } from 'src/prisma.service';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
import { identity } from 'rxjs';
const MAX_FILE_SIZE = 1000 * 1024 * 1024;
@Controller('api/kpi-definition')
export class KpiDefinitionController {
  constructor(
    private readonly kpidefinition: KpiDefinitionService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'KPI_DEFINITION' })
  @Post('createUom')
  async createUom(@Body() data: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} Post api/kpi-definition/createUom ${data}service called`,
      '',
    );
    return this.kpidefinition.createUom(req.user.id, data, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @Get('getAllUom')
  async getAllUom(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getAllUom service called`,
      '',
    );
    return this.kpidefinition.getAllUom(req.user.id, randomNumber, query);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @Get('getSelectedUom/:id')
  async getSelectedUom(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getSelectedUom/${id} service called`,
      '',
    );
    return this.kpidefinition.getSelectedUom(id, req.user.id, randomNumber);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'KPI_DEFINITION' })
  @Put('updateUom/:id')
  async updateUom(@Body() data: any, @Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} PUT api/kpi-definition/updateUOm/${id} for ${data} service called`,
      '',
    );
    return this.kpidefinition.updateUom(req.user.id, data, id, randomNumber);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'KPI_DEFINITION' })
  @Delete('deleteUom/:id')
  async deleteUom(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} DELETe api/kpi-definition/deleteUOm/${id} service called`,
      '',
    );
    return this.kpidefinition.deleteUom(req.user.id, id, randomNumber);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @Get('checkUnitType/:dataunit')
  async checkUnitType(@Req() req, @Param('dataunit') dataunit) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/checkUnitType/${dataunit} service called`,
      '',
    );
    return this.kpidefinition.checkUnitType(
      req.user.id,
      dataunit,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'KPI_DEFINITION' })
  @Post('createKpi')
  async createKpi(@Req() req, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} POST api/kpi-definition/createKpi for data ${data} service called`,
      '',
    );
    return this.kpidefinition.createKpi(req.user.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'KPI_DEFINITION' })
  @Post('createDuplicateKpi')
  async createDuplicateKpi(@Req() req, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} POST api/kpi-definition/createDuplicateKpi for data ${data} service called`,
      '',
    );
    return this.kpidefinition.createDuplicateKpi(
      req.user.id,
      data,
      randomNumber,
    );
  }
  // @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @UseGuards(AuthenticationGuard)
  @Get('getAllLocations')
  async getAllLocations(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getAllLocations  service called`,
      '',
    );
    return this.kpidefinition.getAllLocations(req.user.id, randomNumber);
  }
  // @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' }) removed to support globalRoles
  @UseGuards(AuthenticationGuard)
  @Get('getSource')
  async getSource(@Req() req, @Query('location') value) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getSource  service called`,
      '',
    );
    return this.kpidefinition.getSource(value, req.user.id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getSelectedKpibyId/:id')
  async getSelectedKpiById(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getSelectedKpiById/${id}  service called`,
      '',
    );
    return this.kpidefinition.getSelectedKpiById(id, randomNumber);
  }
  // @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @UseGuards(AuthenticationGuard)
  @Get('getKpiBySource/:id')
  async getKpiBySource(@Req() req, @Param('id') id, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getKpiBySource/${id}  service called`,
      '',
    );
    return this.kpidefinition.getKpiBySource(
      req.user.id,
      id,
      query,
      randomNumber,
    );
  }
  // @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @UseGuards(AuthenticationGuard)
  @Get('getAllKpi')
  async getAllKpi(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getAllKpi  service called`,
      '',
    );
    return this.kpidefinition.getAllKpi(req.user, randomNumber);
  }

  @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @Get('getAllKpiForaLocationDept/:id/:id1/:id2')
  async getAllKpiForLocDept(
    @Req() req,
    @Param('id') id,
    @Param('id1') id1,
    @Param('id2') id2,
  ) {
    return this.kpidefinition.getAllKpiForLocDept(req.user.id, id, id1, id2);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllKpiForObjective')
  async getAllKpiForObjective(@Req() req, @Query() id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getAllKpiForObjective  service called`,
      '',
    );
    return this.kpidefinition.getAllKpiForAnObjective(
      req.user,
      id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getKpiForParentObj')
  async getKpiForParentObj(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getKpiForParentObj  service called`,
      '',
    );
    return this.kpidefinition.getParentObjKpi(req.user, query, randomNumber);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_DEFINITION' })
  @Get('getSelectedKpi/:id')
  async getSelectedKpi(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getSelectedKpi  service called`,
      '',
    );
    return this.kpidefinition.getSelectedKpi(id);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Update, resource: 'KPI_DEFINITION' })
  @Put('updateKpi/:id')
  async updateKpi(@Body() data: any, @Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} PUT api/kpi-definition/updateKpi/${id}  service called`,
      '',
    );
    return this.kpidefinition.updateKpi(req.user.id, data, id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Delete, resource: 'KPI_DEFINITION' })
  @Delete('deleteKpi/:id')
  async deleteKpi(@Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} DELETE api/kpi-definition/deleteKpiKpi/${id}  service called`,
      '',
    );
    return this.kpidefinition.deleteKpi(req.user.id, id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({}),
      limits: {
        fileSize: MAX_FILE_SIZE, // Setting the max limit to avoid DoS attacks
      },
    }),
  )
  @Post('/import')
  async importUser(@Req() req, @Res() res, @UploadedFile() file) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} DELETE api/kpi-definition/import  service called`,
      '',
    );
    return await this.kpidefinition.import(req.user, res, file, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({}),
      limits: {
        fileSize: MAX_FILE_SIZE, // Setting the max file storage to avoid DOS attacks
      },
    }),
  )
  @Post('/importUom')
  async importUom(@Req() req, @Res() res, @UploadedFile() file) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} POST api/kpi-definition/importUom  service called`,
      '',
    );
    return await this.kpidefinition.importUom(
      req.user,
      res,
      file,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getAllKpisForExport')
  async getAllKpisForExport(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/export  service called`,
      '',
    );
    return this.kpidefinition.getAllKpis(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/users')
  async getAllUsersOfEntity(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `GET api/kpi-definition/users service called for ${query}`,
      '',
    );
    return this.kpidefinition.findAllUsersByEntiy(req.user, query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/checkUser')
  async checkUser(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(`GET api/kpi-definition/users service called`, '');
    return this.kpidefinition.checkuser(req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('findKpiAndUpdateForObjectiveId/:id/:id1')
  async findByIdAndUpdateForObjectiveId(@Param('id') id, @Param('id1') id1) {
    this.logger.log(
      `PATCH findKpiAndUpdateForObjectiveId/:id/:id1 service called`,
      '',
    );
    return this.kpidefinition.findAndUpdateKpiForObjectiveId(id, id1);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/kpiObjCountForCategory')
  async kpiObjCountForCategory(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `GET api/kpi-definition/kpiObjCountForCategory service called`,
      '',
    );
    return this.kpidefinition.getKpiAndObjectiveCountByCategory(
      req.user,
      query,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getKpisByIds')
  async getKpisByIds(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(`GET api/kpi-definition/getKpisByIds service called`, '');
    return this.kpidefinition.getKpibyIds(req.user, query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getObjectiveByIds')
  async getObjectiveByIds(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `GET api/kpi-definition/getObjectiveByIds service called`,
      '',
    );
    return this.kpidefinition.getObjectivebyIds(req.user, query, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/createObjCopy')
  async createObjCopy(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(`GET api/kpi-definition/createObjCopy service called`, '');
    return this.kpidefinition.createObjCopy(req.user, query, randomNumber);
  }
  //hin-424 delegate owners to create kpis
  @UseGuards(AuthenticationGuard)
  @Post('/createOwners')
  async createOwners(@Req() req, @Body() data) {
    const randomNumber = uuid();
    this.logger.log(`POSt api/kpi-definition/createOwners service called`, '');
    return this.kpidefinition.createOwners(req.user, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateOwners/:id')
  async updateOwners(@Req() req, @Body() data, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(`PUT api/kpi-definition/updateOwners service called`, '');
    return this.kpidefinition.updateOwners(req.user, data, randomNumber, id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getOwners')
  async getOwners(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(`GeT api/kpi-definition/getOwners service called`, '');
    return this.kpidefinition.getOwners(req.user?.id, query, randomNumber);
  }
  //hindalco uat req assign obj creators similar to kpi creators
  @UseGuards(AuthenticationGuard)
  @Post('/createObjOwners')
  async createObjOwners(@Req() req, @Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `POSt api/kpi-definition/createObjOwners service called`,
      '',
    );
    return this.kpidefinition.createObjOwners(req.user?.id, data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateObjOwners/:id')
  async updateObjOwners(@Req() req, @Body() data, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `PUT api/kpi-definition/updateObjOwners service called`,
      '',
    );
    return this.kpidefinition.updateObjOwners(
      req.user?.id,
      data,
      randomNumber,
      id,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getObjOwners')
  async getObjOwners(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(`GeT api/kpi-definition/getObjOwners service called`, '');
    return this.kpidefinition.getObjOwners(req.user, query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllKpiForaLocationDeptForImport')
  async getAllKpiForLocDeptForImport(@Req() req) {
    return this.kpidefinition.getAllKpiForLocDeptForImport(req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Post('createPeriodWiseRecord/:id')
  async createPeriodWiseRecord(@Body() data, @Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `POST api/kpi-definition/createPeriodWiseRecord service called`,
      '',
    );
    return this.kpidefinition.createPeriodWiseRecordForKpi(
      data,
      id,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getPeriodTargetForKpi/:id/:id1')
  async getPeriodTargetForKpi(@Param('id') id, @Param('id1') id1) {
    const randomNumber = uuid();
    this.logger.log(
      `GET api/kpi-definition/getPeriodTargetForKpi/${id}/${id1} service called`,
      '',
    );
    return this.kpidefinition.getPeriodTargetForKpi(id, id1, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('updatePeriodWiseRecord/:id')
  async updatePeriodWiseRecord(@Body() data, @Req() req, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `POST api/kpi-definition/updatePeriodWiseRecord/${id} service called`,
      '',
    );
    return this.kpidefinition.updatePeriodWiseRecordForKpi(
      data,
      id,
      req.user.id,
      randomNumber,
    );
  }
  //apis for kpi monitoring

  @UseGuards(AuthenticationGuard)
  @Post('createMonitoringRulesForKpi')
  async createMonitoringRulesForKpi(@Query() query, @Body() data, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `POST api/kpi-definition/createMonitoringRulesForKpi service called`,
      '',
    );
    return this.kpidefinition.createMonitoringRulesForKpi(
      query,
      data,
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateMonitoringRulesForKpis')
  async updateMonitoringRulesForKpi(@Query() query, @Body() data, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `PUT api/kpi-definition/updateMonitoringRulesForKpi/${query} service called`,
      '',
    );
    return this.kpidefinition.updateMonitoringRulesForKpis(
      query,
      data,
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteMonitoringRulesForKpi/:id')
  async deleteMonitoringRulesForKpi(@Param('id') id) {
    this.logger.log(
      `DELETE api/kpi-definition/deleteMonitoringRulesForKpi/${id} service called`,
      '',
    );
    return this.kpidefinition.deleteKpiFromMonitoringRules(id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getMonitoringRulesForKpi/:id')
  async getMonitoringRulesForKpi(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `GET api/kpi-definition/getMonitoringRulesForKpi/${id} service called`,
      '',
    );
    return this.kpidefinition.getMonitoringRulesForKpi(
      id,

      req.user.id,
      randomNumber,
    );
  }

  //api for getting kpis in setting rules

  @UseGuards(AuthenticationGuard)
  @Get('getKpiByLocDept')
  async getKpiByLocDept(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/kpi-definition/getKpiByLocDept  service called`,
      '',
    );
    return this.kpidefinition.getKpiByLocDept(
      req.user.id,

      query,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('monitorKpis')
  async monitorKpi() {
    // console.log('calling');
    const randomNumber = uuid();
    this.logger.log(`GET api/kpi-definition/monitorKpis service called`, '');
    return this.kpidefinition.monitorKPI();
  }
}
