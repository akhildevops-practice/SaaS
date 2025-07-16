import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { filter } from 'rxjs';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { DashboardService } from './dashboard.service';
import { ChartFilter } from './dto/dashboard-chart-filter.dto';
import { DashboardFilter } from './dto/dashboard-filter.dto';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get()
  findAll(@Query() filterObj: DashboardFilter, @Req() req) {
    return this.dashboardService.findAll(filterObj, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('documentFilterList/:filter')
  documentFilterList(@Req() req, @Param('filter') filter, @Query() data) {
    return this.dashboardService.documentFilterList(req.user, filter,data);
  }

  // @UseGuards(AuthenticationGuard)
  // @UsePipes(new ValidationPipe({
  //   transform: true,
  //   whitelist: false,
  //   forbidNonWhitelisted: false,
  //   forbidUnknownValues: false,
  //   skipNullProperties: true,
  //   skipMissingProperties: true
  // }))
  // @Get('/chart')
  // getChartData(@Query() filterObj: ChartFilter,@Req() req) {
  //   return this.dashboardService.getChartData(filterObj,req.user);
  // }

  /*  ---------------- Audit dashboard routes  ----------------------------- */

  @UseGuards(AuthenticationGuard)
  @Get('/chart/audit')
  getAuditChartData(@Query() filters: any, @Req() req) {
    return this.dashboardService.getAuditChartData(filters, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/audit/filter')
  auditDataFilter(
    @Query() filters: any,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req,
  ) {
    return this.dashboardService.auditDataFilter(
      { ...filters, skip, limit },
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/audit/search')
  searchAuditData(
    @Query() query: any,
    @Req() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.searchAuditData(
      { ...query, limit, skip },
      req,
    );
  }

  /*  ---------------- NC dashboard routes  ----------------------------- */

  @UseGuards(AuthenticationGuard)
  @Get('/chart/nc')
  getNcChartData(@Query() filters: any, @Req() req) {
    return this.dashboardService.getNcChartData(filters, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/nc/search')
  searchNcData(
    @Query() query: any,
    @Req() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.searchNcData({ ...query, limit, skip }, req);
  }

  /**  Get Audit Finalcial Year     */
  // @UseGuards(AuthenticationGuard)
  // @Get("/getFinancialYear/:orgId")
  // getFinancialYear( @Param('orgId') organization: string ) {
  //     return this.dashboardService.getFinancialYear(organization);
  // }

  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get('systems/:system')
  findAllBydocumentsBySystems(
    @Query() filterObj: DashboardFilter,
    @Req() req,
    @Param('system') system: string,
  ) {
    //return req.user
    return this.dashboardService.findAllBydocumentsBySystems(
      filterObj,
      req.user,
      system,
    );
  }

  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get('entity/:entity')
  findAllBydocumentsByentity(
    @Query() filterObj: DashboardFilter,
    @Req() req,
    @Param('entity') entity: string,
  ) {
    //return req.user
    return this.dashboardService.findAllBydocumentsByEntity(
      filterObj,
      req.user,
      entity,
    );
  }

  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get('findAllByDocumentsByEntityandSystem/:entity/:system')
  findAllBydocumentsByEntityAndSystem(
    @Query() filterObj: DashboardFilter,
    @Req() req,
    @Param('entity') entity: string,
    @Param('system') system: string,
  ) {
    //return req.user
    return this.dashboardService.findAllBydocumentsByEntityAndSystem(
      filterObj,
      req.user,
      entity,
      system,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getFinancialYear/:orgId')
  getFinancialYear(@Param('orgId') organization: string) {
    return this.dashboardService.getFinancialYear(organization);
  }
  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get('favorite')
  findAllByFavorite(@Query() filterObj: DashboardFilter, @Req() req) {
    //return req.user
    return this.dashboardService.findAllByFavorite(filterObj, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get('mydocuments')
  findAllBydocuments(@Query() filterObj: DashboardFilter, @Req() req) {
    //return req.user
    return this.dashboardService.findAllBydocuments(filterObj, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get('myDistributedDocuments')
  findAllMyDistributeddocuments(
    @Query() filterObj: DashboardFilter,
    @Req() req,
  ) {
    //return req.user
    return this.dashboardService.findAllMyDistributeddocuments(
      filterObj,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipMissingProperties: true,
    }),
  )
  @Get('workFlowDocuments')
  findWorkFlowdocuments(@Query() filterObj: DashboardFilter, @Req() req) {
    //return req.user
    return this.dashboardService.findWorkFlowdocuments(filterObj, req.user);
  }

  @Get('myAllDistributedDocuments')
  findAllMyDistributeddocumentsWithoutPagination(
    @Query() filterObj: DashboardFilter,
    @Req() req,
  ) {
    //return req.user
    return this.dashboardService.findAllMyDistributeddocumentsWithoutPagination(
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/systemchart')
  findAllBySystem(@Req() req) {
    return this.dashboardService.findAllBySystem(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/chart')
  getChartData(
    @Param('orgId') orgId: string,
    @Query() queryParams: any,
    @Req() req,
  ) {
    return this.dashboardService.findAllChartData(orgId, queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/dashboardData')
  dashboardData(@Query() queryParams: any, @Req() req) {
    return this.dashboardService.dashboardData(queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/displayDocData')
  displayDocData(@Query() queryParams: any, @Req() req) {
    return this.dashboardService.displayDocData(queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/displayDocumentData')
  displayDocumentData(@Query() queryParams: any, @Req() req) {
    return this.dashboardService.displayDocumentData(queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/retireDocument')
  retireDocument(@Query() queryParams: any, @Req() req) {
    return this.dashboardService.retireDocument(queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/dummyDocument')
  dummyDocument(@Query() queryParams: any, @Req() req) {
    return this.dashboardService.dummyDocument(queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/docDashboardCounts')
  docDashboardCounts(@Query() queryParams: any) {
    return this.dashboardService.getDashboardDocumentCounts(queryParams);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/docChartDataBySystem')
  docChartDataBySystem(@Query() queryParams: any) {
    return this.dashboardService.getDocumentChartDataBySystem(queryParams);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/docChartDataByStatus')
  docChartDataByStatus(@Query() queryParams: any) {
    return this.dashboardService.getDocumentChartDataByStatus(queryParams);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/docChartDataByDocType')
  docChartDataByDocType(@Query() queryParams: any) {
    return this.dashboardService.getDocumentChartDataByDocType(queryParams);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/docChartDataByDepartment')
  docChartDataByDepartment(@Query() queryParams: any) {
    return this.dashboardService.getDocumentChartDataByDepartment(queryParams);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/docChartDataByLocation/:orgId')
  docChartDataByLocation(@Param() orgId: any) {
    return this.dashboardService.getDocumentChartDataByLocation(orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/filteredDocumentList')
  filteredDocumentList(@Query() query: any) {
    return this.dashboardService.getFilteredDocumentTableData(query);
  }
}
