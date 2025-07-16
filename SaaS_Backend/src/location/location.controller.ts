import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
  Put,
  Delete,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { LocationDto } from './dto/location.dto';
import { LocationService } from './location.service';
import { AbilityGuard } from '../ability/ability.guard';
import { roleChecker } from '../utils//roleChecker';
import { roles } from '../utils/roles.global';
import { checkAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { query } from 'winston';
import { identity } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
const fs = require('fs');

@Controller('api/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(AuthenticationGuard)
  @Get('getAllLocationList')
  getAllLocation(@Req() req) {
    return this.locationService.getAllLocation(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getGlobalUsersLocation')
  getGlobalUsersLocation(@Req() req) {
    return this.locationService.getGlobalUsersLocation(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getLogo')
  getLogo(@Req() req) {
    return this.locationService.getLogo(req.user);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'LOCATION_MASTER' })
  @Get('/getLocationsForOrg/:realmName')
  async getLocationsForOrg(@Param('realmName') realmName, @Req() req) {
    return this.locationService.getLocationforOrg(realmName, req.user);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @Get('/getSectionsForOrg/:realmName')
  async getSectionsForDept(@Param('realmName') realmName) {
    return this.locationService.getSectionsForOrg(realmName);
  }
  /**
   *
   *  this controller for creating location
   * @param locationDto contains fields for creating a location
   * @returns the created location
   *
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'LOCATION_MASTER' })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body.organization.toLowerCase();
          const locationName = req.body.locationName;
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/logo`;
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
  createLocation(
    @Body() locationDto: LocationDto,
    @UploadedFile() file,
    @Req() req,
  ) {
    return this.locationService.createLocation(locationDto, req.user, file);
  }

  @UseGuards(AuthenticationGuard)
  @Get('locationadmin/:id')
  getLocationAdmin(@Param('id') id) {
    return this.locationService.getLocationAdmin(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllLocations/:id')
  getAllLocations(@Param('id') id) {
    return this.locationService.getAllLocations(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllLocationsForExport/:id')
  getAllLocationsForExport(@Param('id') id) {
    return this.locationService.getAllLocationsForExport(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'LOCATION_MASTER' })
  @Get('/searchlocation/:id')
  async locationSearch(@Param('id') id, @Query() query) {
    return this.locationService.searchLocation(id, query);
  }

  @Get('/getBusinessTypeName/:businessTypeId')
  async getBusinessTypeNameById(@Param('businessTypeId') businessTypeId) {
    return await this.locationService.getBusinessTypeName(businessTypeId);
  }

  /**
   *
   *  this function to filter all locations of a organization based on below filter options
   * @param locationName String containing location name
   * @param locAdmin string containing full name of the location admin
   * @param locationType string containing location type name
   * @param page Pagination page number
   * @param limit Results to show in each page
   * @returns the list filtered locations of a organization based on various condtions
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'LOCATION_MASTER' })
  @Get(':realmName/:type')
  async getLocations(
    @Query('locName') locationName,
    @Query('locAdmin') locAdmin,
    @Query('locationType') locationType,
    @Query('page') page,
    @Query('limit') limit,
    @Query('functions') functions,
    @Query('query') query,
    @Param('realmName') realmName,
    @Param('type') type,
    @Req() req,
  ) {
    return this.locationService.getLocations(
      realmName,
      locationName,
      locAdmin,
      locationType,
      page,
      limit,
      functions ? JSON.parse(functions) : [],
      req.user,
      query,
      type,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('locationFilter/:realmName')
  async getLocationsforFilter(
    @Query('locName') locationName,
    @Query('locAdmin') locAdmin,
    @Query('locationType') locationType,
    @Query('page') page,
    @Query('limit') limit,
    @Param('realmName') realmName,
    @Query('functions') functions,
    @Req() req,
  ) {
    //////////////console.log('functionsparse', JSON.parse(functions));
    return this.locationService.getLocationsforFilter(
      realmName,
      locationName,
      locAdmin,
      locationType,
      page,
      limit,
      req.user,
      functions ? JSON.parse(functions) : [],
    );
  }

  /**
   *
   *  this function to get location admin of a particular location
   * @param id String containing location id of the location, whose location admin needs to be fetched
   * @returns the location admin for the particular organization
   */

  /**
   *
   *  this controller for updating a location
   * @param locationDto contains fields for updating a location
   * @returns the created location
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'LOCATION_MASTER' })
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body.organization.toLowerCase();
          const locationName = req.body.locationName;
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/logo`;
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
  updateLocation(
    @Body() locationDto: LocationDto,
    @UploadedFile() file,
    @Param('id') id,
    @Req() req,
  ) {
    ////////////////console.log('Id', id);
    return this.locationService.updateLocation(locationDto, id, req.user, file);
  }

  /**
   *
   *  this controller for deleting a location
   * @param id of the location to be deleted
   * @returns the created location
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'LOCATION_MASTER' })
  @Delete(':id')
  async deleteLocation(@Param('id') id) {
    return this.locationService.deleteLocation(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'LOCATION_MASTER' })
  @Delete('permanetDelete/:id')
  async permanetDeleteLocation(@Param('id') id) {
    return this.locationService.permanetDeleteLocation(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'LOCATION_MASTER' })
  @Patch('restoreLocation/:id')
  async restoreLocation(@Param('id') id) {
    return this.locationService.restoreLocation(id);
  }

  /**
   *
   *  this controller for fetching location of the user
   *  if the user is orgadmin this endpoint returns all locations for the organization and if any other user then return only the location that he belongs to
   * @param realmName of the organization whose locations we want fetch
   * @returns either a array of locations if orgadmin or a single location if other user is logged in
   */

  /**
   *
   *  this controller for fetching location of the user
   *  if the user is orgadmin this endpoint returns all locations for the organization and if any other user then return only the location that he belongs to
   * @param realmName of the organization whose locations we want fetch
   * @returns either a array of locations if orgadmin or a single location if other user is logged in
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'ENTITY_MASTER' })
  @Get('/getDeptForLocation/:realmName/:locationId')
  async getDeptForLocation(
    @Param('realmName') realmName,
    @Param('locationId') locationId,
  ) {
    return this.locationService.getEntityForLocation(realmName, locationId);
  }
  /**
   *
   *  this controller for fetching business type for a particular department
   * @param deptId id of the department whose business types need to be fetched
   * @returns an array of businesstype associated with a particular department
   */
  // @UseGuards(AuthenticationGuard, AbilityGuard)
  // @checkAbilities({ action: Action.Read, resource: "ENTITY_MASTER" })
  // @Get('/getBusinessTypeForDept/:deptId')
  // async getBussinessTypeForLocation(@Param('deptId') deptId) {
  //     return this.locationService.getBusinessTypeForDept(deptId)
  // }

  /**
   *
   *  this controller for fetching all sections of a particular organization
   * @param realmName of the organizations whose sections need to be fetched
   * @returns an array of sections that belong to a pericular organization
   */

  /**
   *
   *  this controller for fetching a single location
   * @param realmName of the organizations whose sections need to be fetched
   * @returns an array of sections that belong to a pericular organization
   */

  @Get('/getLocation/byId/:id')
  async getLocationById(@Param('id') id) {
    return this.locationService.getLocationById(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'LOCATION_MASTER' })
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('importUnit')
  async importUnit(
    @UploadedFile() file,
    @Body('orgName') orgName,
    @Req() req,
    @Res() res,
  ) {
    return await this.locationService.importUnit(file, orgName, req.user, res);
  }
}
