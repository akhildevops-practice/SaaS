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
import { Logger } from 'winston';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { BusinessService } from './business.service';
import { get, initParams, post, put } from 'request';
import { BusinessDto } from './business.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Controller('/api/business')
export class BusinessController {
  constructor(
    private readonly businesService: BusinessService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @Post('createBusinessType')
  async createBusinessType(@Body() data: any) {
    this.logger.log('createbusinesstype called', 'createBusinessType()');
    return this.businesService.createBusinessType(data);
  }
  @Get('getBusinessTypeById/:id')
  async getBusinessTypeById(@Param('id') id) {
    this.logger.log('getBusinessTypeById is called', 'getBusinessTypeById');
    return this.businesService.getBusinessTypeById(id);
  }
  @Get('getAllBusinessTypes/:orgid')
  async getAllBusinessTypes(@Param('orgid') orgid) {
    this.logger.log('getAllBusinessTypes is called', 'getAllBusinessTyps');
    return this.businesService.getAllBusinessTypes(orgid);
  }
  @Put('updateBusinessType/:id')
  async updatebusinesstype(@Param('id') id, @Body() data: any) {
    this.logger.log('updateBusinessType is called', 'updateBusinessType');
    return this.businesService.updateBusinessType(id, data);
  }
  @Post('createBusinessForBusinessType')
  async createBusiness(@Body() data: any) {
    this.logger.log('createBusinessforbusinesstype called', 'createBusiness');
    return this.businesService.createBusinessForBusinessType(data);
  }

  @Put('updateBusiness/:id')
  async updateBusinessByBusinessType(@Param('id') id, @Body() data) {
    this.logger.log('updatebusinesscalled', 'updateBusiness');
    return this.businesService.updateBusiness(id, data);
  }
  @Get('getBusinessById/:id')
  async getBusinessById(@Param('id') id) {
    this.logger.log('getBusinessById called', 'getBusinessById');
    return this.businesService.getBusinessById(id);
  }
  @Delete('deleteBusinessTypeById/:id')
  async deleteBusinessTypeById(@Param('id') id) {
    this.logger.log('deleteBusinessType Id called', 'deleteBusinessTypeById');
    return this.businesService.deleteBusinessTypeById(id);
  }
  @Patch('restoreBusinessTypeById/:id')
  async restoreBusinessTypeById(@Param('id') id) {
    //this.logger.log('deleteBusinessType Id called', 'deleteBusinessTypeById');
    return this.businesService.restoreBusinessTypeById(id);
  }
  @Delete('permanentDeleteBusinessType/:id')
  async permanentDeleteBusinessTypeById(@Param('id') id) {
    this.logger.log(
      'permanentdeleteBusinessType Id called',
      'deleteBusinessTypeById',
    );
    return this.businesService.permanentDeleteBusinessTypeById(id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/filterFunction')
  filterValue(@Req() req, @Query() query) {
    return this.businesService.filterValue(req.user.id, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllUser')
  getAllUser(@Req() req) {
    return this.businesService.getAllUser(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createFunction')
  async createFunction(@Body() data: any, @Req() req, @Res() res) {
    this.logger.log('createfunctions called', 'createFunction');
    return this.businesService.createFunction(data, req.user, res);
  }
  @Get('getFunctionById/:id')
  async getFunctionById(@Param('id') id) {
    this.logger.log('getFunctionById called', this.getFunctionById);
    return this.businesService.getFunctionById(id);
  }
  @Get('getFunctionByLocation')
  async getFunctionByLocation(@Query('locid') locid: string[]) {
    ////////////////console.log('con', locid);
    this.logger.log(
      'getFunctionByLocation called',
      this.getFunctionBySingleLocation,
    );
    return this.businesService.getFunctionByLocation(locid);
  }
  @Get('getFunctionBySingleLocation/:id')
  async getFunctionBySingleLocation(@Param('id') id) {
    ////////////////console.log('con', locid);
    this.logger.log(
      'getFunctionBySingleLocation called',
      this.getFunctionByLocation,
    );
    return this.businesService.getFunctionBySingleLocation(id);
  }
  @Delete('deleteFunctionById/:id')
  async deleteFunctionById(@Param('id') id) {
    this.logger.log('deleteFunction byId called', this.deleteFunctionById);
    return this.businesService.deleteFunctionById(id);
  }
  @Patch('restoreFunctionById/:id')
  async restoreFunctionById(@Param('id') id) {
    this.logger.log('restoreFunction byId called', this.deleteFunctionById);
    return this.businesService.restoreFunctionById(id);
  }
  @Delete('permanentDeleteFunctionById/:id')
  async permanentDeleteFunctionById(@Param('id') id) {
    this.logger.log('deleteFunction byId called', this.deleteFunctionById);
    return this.businesService.permanentDeleteFunctionById(id);
  }
  @Delete('deleteBusinessById/:id')
  async deleteBusinessById(@Param('id') id) {
    this.logger.log('deleteBusinessById called', this.deleteBusinessById);
    return this.businesService.deleteBusinessById(id);
  }
  @Patch('restoreBusinessById/:id')
  async restoreBusinessById(@Param('id') id) {
    this.logger.log('restoreBusinessById called', this.deleteBusinessById);
    return this.businesService.restoreBusinessById(id);
  }
  @Delete('permanentDeleteBusinessById/:id')
  async permanetDeleteBusinessById(@Param('id') id) {
    this.logger.log(
      'permanentdeleteBusinessById called',
      this.deleteBusinessById,
    );
    return this.businesService.permanentDeleteBusinessById(id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateFunctionById/:id')
  async updateFunctionById(
    @Param('id') id,
    @Body() data: any,
    @Req() req,
    @Res() res,
  ) {
    this.logger.log('updateFunctionById called', this.updateFunctionById);
    return this.businesService.updateFunctionById(id, data, req.user, res);
  }
  @Get('getAllFunctionsByOrgId/:id')
  async getAllFunctionsByOrgId(@Param('id') id) {
    this.logger.log(
      'getAllFunctionsByOrgId called',
      this.getAllFunctionsByOrgId,
    );
    return this.businesService.getAllFunctionsByOrgId(id);
  }
  @Get('getAllBusinesssByOrgId/:id')
  async getallbusinessbyorgid(@Param('id') id) {
    this.logger.log('getAllBusinessByOrgId called', this.getallbusinessbyorgid);
    return this.businesService.getAllBusinessByOrgId(id);
  }
  @Post('helloWorld')
  async helloworld() {
    ////console.log('hello world called');
    return this.businesService.helloWorld();
  }
  @Get('getAllFunctionsInALoc/:id')
  async getAllFunctionsInALoc(@Param('id') id) {
    this.logger.log(
      'getAllFunctionsInALoc been called',
      this.getAllFunctionsInALoc,
    );
    return this.businesService.getAllFunctionsInALoc(id);
  }
  @Get('getAllDepartmentsOfAFunction/:id')
  async getAllDepartmentsForAFunction(@Param('id') id) {
    this.logger.log(
      'getAllDepartmentsForAFunction called',
      this.getAllDepartmentsForAFunction,
    );
    return this.businesService.getAllDepartmentsOfAFunction(id);
  }

  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('importFunction')
  async importFunction(
    @UploadedFile() file,
    @Body('createdBy') createdBy,
    @Body('organizationId') organizationId,
  ) {
    return await this.businesService.importFunction(
      file,
      createdBy,
      organizationId,
    );
  }

  @Post('createSection')
  async createSection(@Body() data: any) {
    this.logger.log(
      `POST api/business/createsection called for payload ${data}`,
      'createSection()',
    );
    return this.businesService.createSection(data);
  }
  @Get('getSectionById/:id')
  async getSectionById(@Param('id') id) {
    this.logger.log(
      `GET  api/business/getSectionById/${id} is called`,
      'getSectionById',
    );
    return this.businesService.getSectionById(id);
  }
  @Get('getAllSections/:orgid')
  async getAllSections(@Param('orgid') orgid) {
    this.logger.log(
      `GET  api/business/getAllSections/${orgid} is called `,
      'getAllSections',
    );
    return this.businesService.getAllSections(orgid);
  }
  @Put('updateSectionById/:id')
  async updateSectionById(@Param('id') id, @Body() data: any) {
    this.logger.log(
      `PUT api/business/updateSectionById/${id} is called for pyalod ${data} `,
      'updateSectionById',
    );
    return this.businesService.updateSection(id, data);
  }
  @Delete('deleteSectionById/:id')
  async deleteSectionById(@Param('id') id) {
    this.logger.log('deleteSectionById called', this.deleteSectionById);
    return this.businesService.deleteSectionById(id);
  }
  @Get('getAllSectionsForEntity/:id')
  async getAllSectionsForEntity(@Param('id') id) {
    this.logger.log(
      'getAllSectionsForEntity called',
      this.getAllSectionsForEntity,
    );
    return this.businesService.getAllSectionsForEntity(id);
  }
}
