import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { EntityCreateDto } from './dto/entity-create.dto';
import { BDto } from './dto/getBusinessTypeForLoc.dto';
import { EntityService } from './entity.service';
import { checkAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { AbilityGuard } from '../ability/ability.guard';
import { roleChecker } from '../utils//roleChecker';
import { roles } from '../utils/roles.global';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Controller('api/entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @UseGuards(AuthenticationGuard)
  @Get('/getFullEntityChain/:entityId')
  getFullHierarchy(
    @Param('entityId') entityId: any,
    @Param('orgId') orgId: any,
  ) {
    return this.entityService.getFullHierarchy(entityId, orgId);
  }

  /**
   * @method getAllEntitiesForOrg
   *  this controller is for getting all entity of an organization for current user
   * @param kcId KcId of the current user
   * @returns Array of entities for the current user
   */

  @UseGuards(AuthenticationGuard)
  @Get('/getFunctionByLocation/:id')
  getFunctionByLocation(@Param('id') locationId, @Req() req) {
    return this.entityService.getFunctionByLocation(locationId, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCreatorsDepartments')
  getCreatorsDepartments(@Req() req) {
    return this.entityService.getCreatorsDepartments(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get()
  async getAllEntitiesForOrg(@Req() req) {
    return await this.entityService.getAllEntitiesOfOrg(req.user.id);
  }

  /**
   *
   *  this controller for filtering entity of a organization
   * @param realmName realmname of the organization, whose entitys need to be filtered
   * @returns the filtered entities accroding to given query parameters
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @Get('/all/:realmName')
  getDept(
    @Query('locationName') locationName,
    @Query('entityName') entityName,
    @Query('entityType') entityType,
    @Query('functionID') functionId,
    @Query('location') location,
    @Query('page') page,
    @Query('limit') limit,
    @Query('query') query,
    @Param('realmName') realmName,
    @Req() req,
  ) {
    return this.entityService.findAll(
      realmName,
      locationName,
      entityName,
      functionId,
      entityType,
      page,
      limit,
      req.user,
      location,
      query,
    );
  }
  /**
   *
   *  this controller for creating entity
   * @param entityDoctypeDto contains field required for creating entity
   * @returns the created entity
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'ENTITY_MASTER' })
  @Post()
  createEntity(@Body() entityCreateDto: EntityCreateDto) {
    return this.entityService.createEntity(entityCreateDto);
  }

  /**
   *
   *  this controller for fetching businesstypes for a prticlur location
   * @param locationId id of gthe location whose businesstype we are fetching
   * @returns array of businesstypes for the particluar location
   */

  @UseGuards(AuthenticationGuard)
  @Get('/getBusinessTypeForLoc/:id')
  getBTforLoc(@Param('id') locationId) {
    return this.entityService.getBusinessTypeForLocation(locationId);
  }

  /**
   *
   *  this controller for fetching "Department" entityType of the particular organization
   * @param realmName realmName of the organization, whose "Department" entityType need sto be fetched
   * @returns the "Department" entityType for the particular organization
   */

  @UseGuards(AuthenticationGuard)
  @Get('/getDeptEntityType/:realmName')
  getDeptEntityType(@Param('realmName') realmName) {
    return this.entityService.getDeptEntityType(realmName);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getSelectedEntity/:id')
  getSelectedEntity(@Param('id') id) {
    return this.entityService.getSelectedEntity(id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getEntitiesForEntityType/:id')
  async getEntitiesForEntityType(@Param('id') id, @Query() query) {
    return this.entityService.getEntitiesForEntityType(id, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/allEntityTypes')
  allEntityTypes(@Req() req) {
    return this.entityService.allEntityTypes(req.user);
  }

  /**
   *
   *  this controller for fetching entities for a particular location of a organization
   * @param orgid of the organization whose locations entities need to be fetched
   * @param locid of the organization , whose entity needs to be fetched
   * @returns the entities of a location of a particular organization
   */

  /**
   *
   *  this controller for updating a entity
   * @param entityCreateDto
   * @param id of the entity which needs to be updated
   * @returns the updated entity
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'ENTITY_MASTER' })
  @Put(':id')
  updateEntity(@Body() entityCreateDto: EntityCreateDto, @Param('id') id) {
    return this.entityService.updateEntity(entityCreateDto, id);
  }

  /**
   *
   *  this controller for deleting a entity
   * @param id of the entity to be deleted
   * @returns the deleted entity
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'ENTITY_MASTER' })
  @Delete(':id')
  deleteEntity(@Param('id') id) {
    return this.entityService.deleteEntity(id);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'ENTITY_MASTER' })
  @Patch(':id')
  restoreEntity(@Param('id') id) {
    return this.entityService.restoreEntity(id);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'ENTITY_MASTER' })
  @Delete('permanentDeleteEntity/:id')
  permanetDeleteEntity(@Param('id') id) {
    return this.entityService.permanentDeleteEntity(id);
  }

  /**
   *
   *  this controller for fetching the department of active user
   * @param req the current request object, which contains the active user
   * @returns the department the active user belongs to
   */

  @UseGuards(AuthenticationGuard)
  @Get('/getEntityForActiveUser')
  getDepartmentForUser(@Req() req) {
    return this.entityService.getEntityForActiveUser(req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getEntity/byId/:id')
  getEntityById(@Param('id') id) {
    return this.entityService.getEntityById(id);
  }
  // @UseGuards(AuthenticationGuard)
  // @Get('getSelectedEntity/:id')
  // getSelectedEntity(@Param('id') id) {
  //   return this.entityService.getSelectedEntity(id);
  // }

  @UseGuards(AuthenticationGuard)
  @Get('getEntitiesForLocations')
  getEntitiesForLocations(@Query() query) {
    return this.entityService.getEntitiesForLocations(query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getEntityTypes/byOrg/:realmName')
  getEntityTypeForOrg(@Param('realmName') realmName) {
    return this.entityService.getEntityTypesForOrg(realmName);
  }
  @UseGuards(AuthenticationGuard)
  @Get('search/Department/:id')
  async searchDepartment(@Param('id') id, @Query() query, @Req() req) {
    ////////console.log('controller');
    return this.entityService.searchDepartment(id, query, req.user);
  }
  // @UseGuards(AuthenticationGuard)
  // @Get('getEntitiesForEntityType/:id')
  // async getEntitiesForEntityType(@Param('id') id, @Query() query) {
  //   return this.entityService.getEntitiesForEntityType(id, query);
  // }

  @UseGuards(AuthenticationGuard)
  @Get('getEntitysForEntityType/:id')
  async getEntitysForEntityType(@Param('id') id) {
    return this.entityService.getEntitysForEntityType(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityHead/byEntityId/:entityId')
  getEntityHeadsForOrg(@Param('entityId') entityId) {
    return this.entityService.getEntityHead(entityId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('byUserLocation')
  getEntityByLocation(@Req() req) {
    return this.entityService.getEntityByLocation(req.user.id, req.user);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'ENTITY_MASTER' })
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('importEntity')
  async importEntity(
    @UploadedFile() file,
    @Body('orgName') orgName,
    @Res() res,
  ) {
    await this.entityService.importEntity(file, orgName, res);
  }

  @Post('getUsersNames')
  async getUsersNames(@Body() requestBody, @Res() res) {
    const usersIds = requestBody.usersIds;
    return await this.entityService.getUsersNames(usersIds, res);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityForLocations')
  filterValue(@Query() query) {
    return this.entityService.getEntityForLocations(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getEntityUsedData/:id')
  getEntityUsedData(@Req() req, @Param('id') id) {
    return this.entityService.getEntityUsedData(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/:locationId')
  getEntityByLocationId(@Query() query, @Param('locationId') locationId) {
    return this.entityService.getEntityByLocationId(query, locationId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityByLocationId/:locationId')
  getEntityByLocationIdNew(@Param('locationId') locationId, @Req() req) {
    return this.entityService.getEntityByLocationIdNew(locationId, req.user);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @Get(':orgid/:locid')
  getEntity(@Param('orgid') orgid, @Param('locid') locid, @Req() req) {
    // protecting the route from few roles
    const isAllowed = roleChecker(req.user.kcRoles.roles, [
      roles.admin,
      roles['ORG-ADMIN'],
      roles['LOCATION-ADMIN'],
    ]);

    if (!isAllowed) {
      // throw new ForbiddenException();
      return;
    }
    return this.entityService.getEntity(orgid, locid);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @Get('/all/org/:orgId')
  getAllEntityByOrg(@Param('orgId') orgId, @Query() query) {
    return this.entityService.getAllEntityByOrg(orgId, query);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @Get('/all/:realmName/:name')
  getEntitiesOfEntityType(
    @Query('locationName') locationName,
    @Query('entityName') entityName,
    @Query('entityType') entityType,
    @Query('functionID') functionId,
    @Query('location') location,
    @Query('page') page,
    @Query('limit') limit,
    @Query('query') query,
    @Param('realmName') realmName,
    @Param('name') name,
    @Req() req,
  ) {
    // protecting the route from few roles
    // const isAllowed = roleChecker(req.user.kcRoles.roles, [
    //   roles.admin,
    //   roles['ORG-ADMIN'],
    //   roles['LOCATION-ADMIN'],
    //   roles['ENTITY-HEAD'],
    //   roles['AUDITOR'],
    //   roles['GENERAL-USER'],
    // ]);

    // if (!isAllowed) {
    //   throw new ForbiddenException();
    // }
    //////console.log("api is called")
    return this.entityService.findAllEntititesOfEntityType(
      realmName,
      name,
      locationName,
      entityName,
      functionId,
      entityType,
      page,
      limit,
      req.user,
      location,
      query,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createEntityChain')
  createHierarchy(@Body() body: any) {
    return this.entityService.createHierarchyForEntity(body);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/updateEntityChain')
  updateParent(@Body() body: any) {
    return this.entityService.updateParent(body);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/removeEntityFromChain')
  removeEntityFromHierarchy(@Body() body: any) {
    return this.entityService.removeEntityFromHierarchy(body);
  }
}
