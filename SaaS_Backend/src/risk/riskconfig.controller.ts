import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RiskConfigService } from './riskconfig.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';

@Controller('/api/riskconfig')
export class RiskConfigController {
  constructor(private readonly riskConfigService: RiskConfigService) {}

  @UseGuards(AuthenticationGuard)
  @Get('/getAllAreaMaster')
  getAllAreaMaster(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query() query: any,
  ) {
    // console.log('hehrhehrehra');
    return this.riskConfigService.getAllAreaMaster({ ...query, page, pageSize });
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraTypes')
  getAllHiraTypes(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query() query: any,
  ) {
    // //console.log('hehrhehrehra');
    return this.riskConfigService.getAllHiraTypes({ ...query, page, pageSize });
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Get('/getHiraConfig/:orgId')
  getHiraConfig(@Param('orgId') orgId: string) {
    return this.riskConfigService.getHiraConfig(orgId);
  } 

  @UseGuards(AuthenticationGuard)
  @Get('/getriskcategories/:orgId')
  getRiskCategories(
    @Param('orgId') orgId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string
  ) {
    return this.riskConfigService.getRiskCategories(orgId, Number(page), Number(pageSize));
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getconfigbyid/:configId')
  getConfigById(
    @Param('configId') configId: string
  ) {
    return this.riskConfigService.getConfigById(configId);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteconfigbyid/:configId')
  deleteConfigById(
    @Param('configId') configId: string
  ) {
    return this.riskConfigService.deleteConfigById(configId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getallcategorynames/:orgId')
  getAllCategoryNames(
    @Param('orgId') orgId: string,
  ) {
    return this.riskConfigService.getAllCategoryNames(orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getconfigbycategory/:id')
  getConfigByCategory(@Param('id') id: string) {
    return this.riskConfigService.findByCategory(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getallcategories')
  getAllCategories(@Req() req: any) {
    return this.riskConfigService.findAllCategories(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/document')
  searchDocument(@Query('search') search: any, @Req() req: any) {
    return this.riskConfigService.searchDocument(search, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getuserconfig')
  getUserRiskConfig(@Req() req: any) {
    return this.riskConfigService.getUserRiskConfig(req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.riskConfigService.create(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_CONFIG' })
  @Get()
  findAll(@Req() req) {
    return this.riskConfigService.findAll(req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_CONFIG' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.riskConfigService.findOne(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_CONFIG' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.riskConfigService.update(id, data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_CONFIG' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.riskConfigService.delete(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getconfigbycategory/:orgId/:name')
  getConfigByCategoryName(
    @Param('name') name: string,
    @Param('orgId') orgId: string,
  ) {
    return this.riskConfigService.findConfigByCategoryName(name, orgId);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/createHazardType')
  createHiraType(@Body() body: any, @Req() req: any) {
    return this.riskConfigService.createHiraType(body);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Patch('/updateHazardType/:hiraTypeId')
  updateHazardType(@Body() body: any, @Param('hiraTypeId') hiraTypeId: string) {
    return this.riskConfigService.updateHazardType(body, hiraTypeId);
  }

  @Delete('/deleteHazardType/:hiraTypeId')
  deleteHazardType(@Param('hiraTypeId') hiraTypeId: string) {
    return this.riskConfigService.deleteHazardType(hiraTypeId);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/createImpactType')
  createImpactType(@Body() body: any, @Req() req: any) {
    return this.riskConfigService.createImpactType(body);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Patch('/updateImpactType/:hiraTypeId')
  updateImpactType(@Body() body: any, @Param('hiraTypeId') hiraTypeId: string) {
    return this.riskConfigService.updateImpactType(body, hiraTypeId);
  }

  @Delete('/deleteImpactType/:hiraTypeId')
  deleteImpactType(@Param('hiraTypeId') hiraTypeId: string) {
    return this.riskConfigService.deleteImpactType(hiraTypeId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/createHiraConfig')
  createHiraConfig(@Body() body: any, @Req() req: any) {
    return this.riskConfigService.createHiraConfig(body);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Patch('/updateHiraConfig/:hiraConfigId')
  updateHiraConfig(@Body() body: any, @Param('hiraConfigId') hiraConfigId: string) {
    return this.riskConfigService.updateHiraConfig(body, hiraConfigId);
  }


  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/createAreaMaster')
  createAreaMaster(@Body() body: any, @Req() req: any) {
    return this.riskConfigService.createAreaMaster(body);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Patch('/updateAreaMaster/:hiraAreaMasterId')
  updateAreaMaster(@Body() body: any, @Param('hiraAreaMasterId') hiraAreaMasterId: string) {
    return this.riskConfigService.updateAreaMaster(body, hiraAreaMasterId);
  }

  @Delete('/deleteAreaMaster/:hiraAreaMasterId')
  deleteAreaMaster(@Param('hiraAreaMasterId') hiraAreaMasterId: string) {
    return this.riskConfigService.deleteAreaMaster(hiraAreaMasterId);
  }

}
