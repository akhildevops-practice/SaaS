import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { KpiReportService } from './kpi-report.service';
import { Cron } from '@nestjs/schedule';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities, CHECK_ABILITY } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import { kpiReportTemplate } from './schema/kpi-report-template.schema';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
@Controller('/api/kpi-report')
export class KpiReportController {
  constructor(
    private readonly KpiReportService: KpiReportService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'KPI_REPORT_TEMPLATE' })
  @Post('createKpiReportTemplate')
  async createKpiReportTemplate(@Req() req, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/kpi-report/createKpiReportTemplate`,
      '',
    );
    return this.KpiReportService.createKpiReportTemplate(
      req.user.id,
      data,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'KPI_REPORT_TEMPLATE' })
  @Post('saveKpiReportTemplate')
  async saveKpiReportTemplate(@Req() req, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/kpi-report/saveKpiReportTemplate started`,
      '',
    );
    return this.KpiReportService.saveKpiReportTemplate(
      req.user.id,
      data,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  @Get('getSelectedKpiReportTemplate/:id')
  async getSelectedKpiReportTemplate(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/kpi-report/getSelectedKpiReportTemplate/${id} started`,
      '',
    );
    return this.KpiReportService.getSelectedKpiReportTemplate(id);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  @Get('getAllKpiReportTemplates')
  async getAllKpiReportTemplates(@Req() req, @Query() queryData) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getAllKpiReportTemplates started`,
      '',
    );
    return this.KpiReportService.getAllKpiReportTemplates(
      req.user.id,
      queryData,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'KPI_REPORT_TEMPLATE' })
  @Put('updateSelectedKpiReportTemplate/:id')
  async updateSelectedKpiReportTemplate(
    @Body() data: any,
    @Param('id') id,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT /api/kpi-report/updateSelectedKpiReportTemplate/${id}' started`,
      '',
    );
    return this.KpiReportService.updateSelectedKpiReportTemplate(
      data,
      id,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'KPI_REPORT_TEMPLATE' })
  @Delete('deleteSelectedKpiReportTemplate/:id')
  async deleteSelectedKpiReportTemplate(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE /api/kpi-report/deleteSelectedKpiReportTemplate/${id}' started`,
      '',
    );
    return this.KpiReportService.deleteSelectedKpiReportTemplate(
      id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllUser')
  getAllUser(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getAllUser started`,
      '',
    );
    return this.KpiReportService.getAllUser(req.user.id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('filterData')
  filterData(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/filterData started`,
      '',
    );
    return this.KpiReportService.filterData(req.user.id, randomNumber);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  @Get('getKpiBySourceArray')
  async getKpiBySourceArray(@Req() req, @Query('id') value) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getKpiBySourceArray or ${value} started`,
      '',
    );
    return this.KpiReportService.getKpiBySourceArray(
      value,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'KPI_REPORT_TEMPLATE' })
  @Post('createKpiReportCategory')
  async createKpiReportCategory(@Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/createKpiReportCategory or ${data} started`,
      '',
    );
    return this.KpiReportService.createKpiReportCategory(data, randomNumber);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  @Get('getCategorybyId/:id')
  async getCategoryById(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getCategorybyId/${id} started`,
      '',
    );
    return this.KpiReportService.getCategoryById(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  @Get('getAllCategory/:id')
  async getAllCategory(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getAllCategory/${id} started`,
      '',
    );
    return this.KpiReportService.getAllCategory(id);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'KPI_REPORT_TEMPLATE' })
  @Put('updateCategoryById/:id')
  async updateCategoryById(@Body() data: any, @Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT /api/kpi-report/updateCategoryById/${id}started`,
      '',
    );
    return this.KpiReportService.updateCategoryById(
      data,
      id,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'KPI_REPORT_TEMPLATE' })
  @Delete('deleteCategoryById/:id')
  async deleteCategoryById(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE /api/kpi-report/deleteCategoryById/${id} started`,
      '',
    );
    return this.KpiReportService.deleteCategoryById(id, randomNumber);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'KPI_REPORT_TEMPLATE' })
  @Delete('deleteAllCategoryOfTemplate/:id')
  async deleteAllCategoryOfTemplate(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE /api/kpi-report/deleteAllCategoryOfTemplate/${id} started`,
      '',
    );
    return this.KpiReportService.deleteAllCategoryOfTemplate(id);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  @Post('writeToKpiDetailTable/:id')
  async writeToKpiDetailTable(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/kpi-report/writeToKpiDetailTable/${id} started`,
      '',
    );
    return this.KpiReportService.writeToKpiDetailTable(
      id,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  @Post('writeIndividualKpiData')
  async writeIndividualKpi(@Body() data) {
    return this.KpiReportService.writeIndividualKpiData(data);
  }

  // @UseGuards(AuthenticationGuard)
  // // @checkAbilities({ action: Action.Read, resource: 'KPI_REPORT_TEMPLATE' })
  // @Post('updateIndividualKpiData/:id')
  // async updateIndividualKpi(@Param('id') id,@Body() data,@Req() req) {
  //   return this.KpiReportService.updateIndividualKpiData(id,data,req.user.id);
  // }
  @UseGuards(AuthenticationGuard)
  @Post('createReportInstance')
  async createReportInstance(@Req() req, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/kpi-report/createReportInstance started`,
      '',
    );
    return this.KpiReportService.createReportInstance(
      req.user.id,
      data,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Post('createAdhocReportInstance')
  async createAdhocReportInstance(@Req() req, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/kpi-report/createAdhocReportInstance started`,
      '',
    );
    return this.KpiReportService.createAdhocReportInstance(
      req,
      data,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAdhocReportInstanceForUniqueCheck')
  async getAdhocReportInstance(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getAdhocReportInstanceForUniqueCheck started`,
      '',
    );
    return this.KpiReportService.getAdhocReportInstanceForUniqueCheck(
      req,
      query,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Put('updateReportInstance/:id')
  async updateReportInstance(@Req() req, @Body() data: any, @Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT /api/kpi-report/updateReportInstance/${id} started`,
      '',
    );
    return this.KpiReportService.updateReportInstance(
      req,
      data,
      id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Put('updateadhocReportInstance/:id')
  async updateadhocReportInstance(
    @Req() req,
    @Body() data: any,
    @Param('id') id,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT /api/kpi-report/updateadhocReportInstance/${id} started`,
      '',
    );
    return this.KpiReportService.updateAdhocReportInstance(
      req.user.id,
      data,
      id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getSelectedReportInstance/:id')
  async getSelectedReportInstance(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getSelectedReportInstance/${id} started`,
      '',
    );
    return this.KpiReportService.getSelectedReportInstance(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllReportInstancesofTemplate/:id')
  async getAllReportInstancesofTemplate(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getAllReportInstancesofTemplate/${id} started`,
      '',
    );
    return this.KpiReportService.getAllReportInstanceofTemplate(id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getFilterListForReports')
  getFilterListForCapa(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getFilterListForReports started`,
      '',
    );
    return this.KpiReportService.getFilterListForReports(
      req.user,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllReportInstances')
  async getAllReportInstances(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getAllReportInstances started`,
      '',
    );
    return this.KpiReportService.getAllReportInstances(
      req.user.id,
      query,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Delete('deleteSelectedReportInstance/:id')
  async deleteSelectedReportInstance(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE /api/kpi-report/deleteSelectedReportInstance started`,
      '',
    );
    return this.KpiReportService.deleteSelectedReportInstance(
      id,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllKRA')
  async getAllKRA(@Req() req) {
    return this.KpiReportService.getAllKRA(req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('computationForKpi/:id/:id1/:id2/:lte/:gte')
  async computationForKpi(
    @Param('id') id,
    @Param('id1') id1,
    @Param('id2') id2,
    @Param('lte') lte,
    @Param('gte') gte,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/computationForKpi/${id}/${id1}/${id2}/${lte}/${gte} started`,
      '',
    );
    return this.KpiReportService.computationForKpi(
      id,
      id1,
      id2,
      lte,
      gte,
      randomNumber,
    );
  }
  // @UseGuards(AuthenticationGuard)
  @Get('writeToSummary')
  async writeToSummary(@Req() req, @Query() query) {
    //console.log("hello world")
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/writeToSummary started`,
      '',
    );
    return this.KpiReportService.writeToSummary(query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('calculationFromSummary/:id/:id1')
  async calculationFromSummary(
    @Query() query,
    @Param('id') id,
    @Param('id1') id1,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/calculationFromSummary/${id}/${id1} started`,
      '',
    );
    return this.KpiReportService.calculationFromSummary(
      query,
      id,
      id1,
      req.user.id,
      randomNumber,
    );
  }
  //cron for every 15 mins
  @Cron('*/15 * * * *')
  startcron() {
    return this.KpiReportService.startCron();
  }
  @UseGuards(AuthenticationGuard)
  @Get('getLocationEntityBU')
  async getLocationEntityBU(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getLocationEntityBU started`,
      '',
    );
    return this.KpiReportService.getLocationEntityBU(req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getKpiForLocation')
  async getkpiforlocation(@Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getKpiForLocation started`,
      '',
    );
    return this.KpiReportService.getKpiForLocation(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getCategoryForLocation')
  async getCategoryForLocation(@Query() query) {
    return this.KpiReportService.getCategoryForLocation(query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getComputationForCategoryMonthwise/:id')
  async getComputationForCategoryMonthWise(
    @Query() query,
    @Param('id') id,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getComputationForCategoryMonthwise/${id} started`,
      '',
    );
    return this.KpiReportService.getComputationForCategoryMonthwise(
      query,
      id,
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getComputationForCategoryYearwise/:id')
  async getComputationForCategoryYearWise(
    @Query() query,
    @Param('id') id,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getComputationForCategoryYearwise/${id} started`,
      '',
    );
    return this.KpiReportService.getComputationForCategoryYearwise(
      query,
      id,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getComputationForCategoryDaywise/:id')
  async getComputationForCategoryDaywise(
    @Param('id') id,

    @Query() query,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getComputationForCategoryDaywise/${id} started`,
      '',
    );
    return this.KpiReportService.getComputationForCategoryDaywise(
      id,

      randomNumber,
      query,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('computefiscalyearquarters/:id')
  async computeFiscalYearQuarters(@Req() req, @Param('id') id) {
    return this.KpiReportService.computeFiscalYearQuarters(req.user.id, id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getComputationForCategoryQuarterwise/:id')
  async getComputationForCategoryQuarterwisewise(
    @Query() query,
    @Param('id') id,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getComputationForCategoryQuarterwise/${id} started`,
      '',
    );
    return this.KpiReportService.getComputationForCategoryQuarterwise(
      query,
      id,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getKpisUomwise/:id')
  async getKpiUomwise(@Query() query, @Param('id') id, @Req() req) {
    return this.KpiReportService.getKpiUomwise(query, id, req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllUomOfCategory/:id')
  async getAllUomofCategory(@Param('id') id, @Req() req) {
    return this.KpiReportService.getAllUomofCategory(id, req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllErpKpisofTemplate/:id')
  async getAllErpKpisofTemplate(@Param('id') id, @Req() req, @Res() res) {
    return await this.KpiReportService.getAllErpKpisofTemplate(
      id,
      req.user.id,
      res,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('sendReportMail/:id')
  async sendReportMail(@Param('id') id, @Req() req) {
    return this.KpiReportService.sendReportInstanceMail(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('sendDummyData')
  async sendDummyData() {
    return this.KpiReportService.sendDummyData();
  }
  @UseGuards(AuthenticationGuard)
  @Get('getHistoricDataForMonth/:id/:id1')
  async getHistoricDataForMonth(
    @Param('id') id,
    @Param('id1') id1,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForMonth/${id} started`,
      '',
    );
    return this.KpiReportService.getHistoricDataForMonth(
      id,
      id1,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getHistoricDataForDaily/:id/:id1')
  async getHistoricDataForDaily(
    @Param('id') id,
    @Param('id1') id1,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForDaily/${id} started`,
      '',
    );
    return this.KpiReportService.getHistoricDataForDaily(
      id,
      id1,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getHistoricDataForQuarter/:id/:id1')
  async getHistoricDataForQuarter(
    @Param('id') id,
    @Param('id1') id1,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForQuarter/${id} started`,
      '',
    );
    return this.KpiReportService.getHistoricDataForQuarter(
      id,
      id1,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAll')
  getAllUsers(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getAllUsers started`,
      '',
    );
    return this.KpiReportService.getAllUsers(req.user.id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getHistoricDataForHalfYear/:id/:id1')
  async getHistoricDataForHalfYear(
    @Param('id') id,
    @Param('id1') id1,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForHalfYear/${id} started`,
      '',
    );
    return this.KpiReportService.getHistoricDataForHalfYear(
      id,
      id1,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('importReport')
  async importReport(@Req() req, @Res() res, @UploadedFile() file) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/kpi-report/importReport started`,
      '',
    );
    return await this.KpiReportService.importReport(
      req.user,
      res,
      file,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getEntitiesByLocations')
  async getEntitiesByLocation(@Query() query, @Req() req) {
    return await this.KpiReportService.getEntitiesByLocations(
      query,
      req.user.id,
    );
  }
  @UseGuards(AuthenticationGuard)
  // @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Get('exportKpis')
  async exportReport(@Req() req, @Query() query) {
    return await this.KpiReportService.exportReport(req.user, query);
  }

  //api for new graph for hindalco where bar graph for previous years and line grph for current year months will be give
  @UseGuards(AuthenticationGuard)
  @Get('getAllKpiDataForGraph')
  async getAllKpiDataForGraph(@Req() req, @Query() query) {
    return await this.KpiReportService.getAllKpiDataForGraph(
      req.user.id,
      query,
    );
  }
}
