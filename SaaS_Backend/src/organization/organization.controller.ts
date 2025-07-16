import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
//import axios from 'axios'
import { OrganizationService } from './organization.service';
//import { updateBusinessConfig } from './dto/update-business-config.dto';

import { CreateOrgDto } from './dto/create-organization.dto';

import { Error } from '../utils/helper';
import { AuthenticationGuard } from '../authentication/authentication.guard';

import { checkAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { AbilityGuard } from '../ability/ability.guard';

import { PrismaService } from '../prisma.service';
import { BusinessConfig } from './dto/business-config.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
const fs = require('fs');

@Controller('api/organization')
export class OrganisationController {
  constructor(
    private organizationService: OrganizationService,
    private prisma: PrismaService,
  ) {}

  /**
   *
   *  this function creates an organization
   * @param createOrgDto contains all the fields requied for creating a organization
   * @param res to send back the desired HTTP response
   * @param token token requied for authentication
   * @returns returns an array of created organization
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'ORG_MASTER' })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.query.realm.toLowerCase();
          const destination = `${process.env.FOLDER_PATH}/${realmName}/logo`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName: string = uuid();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createOrganization(
    @Body() createOrgDto: CreateOrgDto,
    @UploadedFile() file,
    @Response() res,
    @Req() req,
  ) {
    try {
      return await this.organizationService.createOrg(
        createOrgDto,
        file,
        res,
        req.user.kcToken,
        req,
      );
    } catch (err) {
      //   await logger(req.user,'POST','ORG-MASTER',{action:"Created a organization",err:err.message},"ERROR",this.prisma)
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'ORG_MASTER' })
  @Patch('/editLogo/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.query.realm.toLowerCase();
          const destination = `${process.env.FOLDER_PATH}/${realmName}/logo`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName: string = uuid();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async editLogo(
    @Body() createOrgDto: CreateOrgDto,
    @UploadedFile() file,
    @Param('id') id: string,
    @Response() res,
  ) {
    try {
      return await this.organizationService.editLogo(
        createOrgDto,
        file,
        id,
        res,
      );
    } catch (err) {
      //   await logger(req.user,'POST','ORG-MASTER',{action:"Created a organization",err:err.message},"ERROR",this.prisma)
      throw new BadRequestException(err.message);
    }
  }

  /**
   *
   *  this function creates a business configs of a organization
   * @param businessConfig contains all the fields requied for creating a business config
   * @param id auto generated uuid of organization
   * @returns the created business config
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'BUSINESS_CONFIG_MASTER' })
  @Post('/business/createBusinessConfig/:id')
  async createBusinessConfig(
    @Body() businessConfig: BusinessConfig,
    @Param('id') id: string,
    @Res() res,
  ) {
    return this.organizationService.createBusinessConfig(
      businessConfig,
      id,
      res,
    );
  }

  /**
   *
   *  this function updates/deletes business configs
   * @param businessConfig contains all the fields requied for updating a business config
   * @param id auto generated uuid of organization
   * @returns the updated business config
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'BUSINESS_CONFIG_MASTER' })
  @Put(':id')
  async updateBusinessConfig(
    @Body() businessConfig: BusinessConfig,
    @Param('id') id: string,
  ) {
    return this.organizationService.updateBusinessConfigNew(businessConfig, id);
  }

  /**
   *
   *  this function gets all the organizations and includes filters
   * @param orgName name of the organization
   * @param orgAdmin name of the organization admin
   * @returns all the organization/filtered organizations
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @Get()
  @checkAbilities({ action: Action.Read, resource: 'ORG_MASTER' })
  getOrganizations(
    @Query('orgName') orgName,
    @Query('orgAdmin') orgAdmin,
    @Query('page') page,
    @Query('limit') limit,

    @Req() req,
  ) {
    // preventing all users except admin form hitting this router
    if (!req.user.kcRoles.roles.includes('admin')) {
      throw new ForbiddenException('You have no permission');
    }
    return this.organizationService.getOrganizations(
      orgName,
      orgAdmin,
      page,
      limit,
    );
  }

  /**
   *
   *  this function deletes an organization
   * @param id auto generated uuid of organization
   * @param res to send back the desired HTTP response
   * @param token token requied for authentication
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'ORG_MASTER' })
  @Delete('/deleteorg/:id')
  async deleteOrganizations(
    @Param('id') id: string,
    @Response() res,
    @Req() req,
  ) {
    const orgId = id;
    const responseDelete = await this.organizationService.deleteOrganization(
      orgId,
      req.user.kcToken,
    );
    res.send(responseDelete);
  }

  /**
   *
   *  this funtions fetch a single organization
   * @param realmName name of the realm
   * @returns a single organization
   */
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: "ORG_MASTER" })
  @Get(':realmName')
  getOrganization(@Param('realmName') realmName: string) {
    return this.organizationService.getOrganization(realmName);
  }

  /**
   *
   *  this funtions fetch businesstypes for a particular organization
   * @param realmName name of the realm
   * @returns an array of business types
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'LOCATION_MASTER' })
  @Get('business/:realmName')
  getBusinessType(@Param('realmName') realmName) {
    return this.organizationService.getBusiness(realmName);
  }
  // @UseGuards(AuthenticationGuard)
  // @Get('getBusinessByBusinessType/:realmName/:businessType')
  // getBusinessByBusinessType(
  //   @Param('realmName') realmName,
  //   @Param('businessType') businessType,
  // ) {
  //   return this.organizationService.getBusinessByBusinessType(
  //     realmName,
  //     businessType,
  //   );
  // }
  // @UseGuards(AuthenticationGuard)
  // @Get('getAllBusinessTypes/:realmName')
  // getAllBusinessTypes(@Param('realmName') realmName) {
  //   return this.organizationService.getAllBusinessTypes(realmName);
  // }
  /*
   *
   *  this funtions fetch entityTypes for a particular organization
   * @param realmName name of the realm
   * @returns an array of entity types
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'BUSINESS_CONFIG_MASTER' })
  @Get('entitytype/:realmName')
  getEntityType(@Param('realmName') realmName) {
    return this.organizationService.getEntityType(realmName);
  }

  /**
   *
   *  this funtions fetch systemTypes for a particular organization
   * @param realmName name of the realm
   * @returns an array of system types
   */
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  @Get('systemtype/:realmName')
  getSystemType(@Param('realmName') realmName) {
    return this.organizationService.getSystemType(realmName);
  }

  /**
   *
   *  this funtions fetch sections for a particular organization
   * @param realmName name of the realm
   * @returns an array of sections for a particular organization
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'BUSINESS_CONFIG_MASTER' })
  @Get('section/:realmName')
  getSection(@Param('realmName') realmName) {
    return this.organizationService.getSection(realmName);
  }

  /**
   *
   *  this funtions fetch DEFAULT "Department" entity type for a  organization
   * @param realmName name of the realm
   * @returns a entity type name "Department" for a particular organization
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @Get('department/:realmName')
  getDepartment(@Param('realmName') realmName) {
    return this.organizationService.getDepartment(realmName);
  }

  // @Get('/getOrgName')
  // getOrgName(@Req() req){
  //   return this.organizationService.getOrgName(req.user)
  // }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  @Get('systemtype/:realmName/systems')
  getSystemAndSystems(@Param('realmName') realmName, @Req() req) {
    return this.organizationService.getSystemTypeGroupedByType(
      realmName,
      req.user.id,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Post('addActiveModules/:realmName')
  async addActiveModules(
    @Param('realmName') realmName,
    @Query('data') updateArray: any,
  ) {
    // console.log('data in payload', updateArray);
    return this.organizationService.addActiveModules(
      realmName,
      JSON.parse(updateArray),
    );
  }

  @Get('getAllActiveModules/:realmName')
  async getAllActiveModules(@Param('realmName') realmName) {
    return this.organizationService.getAllActiveModules(realmName);
  }
  @Get('getFunction/:realmName')
  async getFunction(@Param('realmName') realmName) {
    return this.organizationService.getFunction(realmName);
  }
  @Delete('deleteFunction/:realmName')
  async deleteFunction(@Param('realmName') realmName) {
    return this.organizationService.deleteFunction(realmName);
  }
  @Get('getFiscalYear/:orgid')
  async getFiscalYear(@Param('orgid') orgid, @Query('searchyear') searchyear) {
    return this.organizationService.getFiscalYear(orgid, searchyear);
  }
  @Get('getOrganizationLogo/:id')
  getOrganizationLogo(@Param('id') id: string) {
    return this.organizationService.getOrganizationLogo(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityTypeById/:id')
  getEntityTypeById(@Param('id') id) {
    console.log('getEntityTypeByID called');
    return this.organizationService.getEntityTypeById(id);
  }
}
