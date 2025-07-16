import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Error } from '../utils/helper';
import { UserMaster } from './dto/user-master.dto';
import { AbilityGuard } from '../ability/ability.guard';
import { roleChecker } from '../utils//roleChecker';
import { roles } from '../utils/roles.global';
import { checkAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
const fs = require('fs');

@Controller('api/user')
export class UserController {
  constructor(
    private userService: UserService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Get('getAllGlobalRoles')
  async getAllGlobalRoles(@Req() req) {
    return this.userService.getAllGlobalRoles(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getGlobalUsersLocations')
  getGlobalUsersLocations(@Req() req) {
    return this.userService.getGlobalUsersLocations(req.user);
  }
  
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('importuser')
  async importUser(
    @Req() req,
    @Res() res,
    @UploadedFile() file,
    @Body('orgName') orgName,
  ) {
    return await this.userService.importUser(
      req.user?.kcToken,
      res,
      file,
      orgName,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/check/getUserInfo')
  async userInfo(@Req() req, @Res() res) {
    const result = await this.userService.getUserInfo(req.user.id);
    res.send(result);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/locationData')
  async locationData(@Req() req) {
    return this.userService.locationData(req.user);
  }

  /**
   *
   *  this function creates an organization admin
   * @param createUserDto contains all the fields requied for creating a user
   * @param res to send back the desired HTTP response
   * @param token token requied for authentication
   * @returns an array of created users
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Post()
  async createAdmin(
    @Body() createUserDto: CreateUserDto,
    @Response() res,
    @Req() req,
  ) {
    try {
      const relll = await this.userService.createAdmin(
        createUserDto,
        res,
        req.user?.kcToken,
      );
    } catch (err) {
      // ////////////////console.log("err", err)
    }
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const realmName = req.query.realm;
          const locationName = req.query.location?.toString();
          const path = locationName
            ? `${
                process.env.FOLDER_PATH
              }/${realmName}/${locationName.toLowerCase()}/avatar`
            : `${process.env.FOLDER_PATH}/${realmName}/avatar`;
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          //generating a random name for the file
          const randomName: string = uuid();
          //Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post('avatar')
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.userService.uploadAvatar(file, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Get('/searchuser/:id')
  async userSearch(@Param('id') id, @Query() query, @Req() req) {
    return this.userService.searchUser(id, query, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUserInfo')
  async testRoute(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `${randomName}, user.controller.ts calling controller of getUserInfo API`,
      '',
    );
    return this.userService.getUserInfo(req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getUserKeys/:id')
  async getUserKeys(@Param('id') id, @Req() req) {
    return this.userService.getUserKeys(id, req.user?.kcToken);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllMRofOrg/:id')
  async getAllMRofOrg(@Param('id') id) {
    return this.userService.getAllMrOfOrg(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityByLocation')
  async getEntityByLocation(@Query() data, @Req() req) {
    return this.userService.getEntityByLocation(req.user, data);
  }

  /**
   *
   *  this function gets all the organization admins of a particular organization
   * @param realm required realm for api request
   * @returns an array of all the organization admins of a particular organization
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'ORG_MASTER' })
  @Get(':realm')
  getOrgAdmin(@Param('realm') realm) {
    return this.userService.getOrgAdmin(realm);
  }

  /**
   *
   *  this function deletes an organization admin
   * @param id auto generated uuid of user
   * @param realm required realm for api request
   * @param token token requied for authentication which is recieved from keycloak
   * @returns returns the deleted user
   */

  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Delete, resource: 'USER_MASTER' })
  @Delete(':id/:realm')
  async deleteOrgAdmin(
    @Param('id') id,
    @Param('realm') realm,
    @Res() res,
    @Req() req,
  ) {
    try {
      let response = await this.userService.deleteAdmin(
        id,
        realm,
        req.user?.kcToken,
      );
      res.status(200).json({ response });
    } catch (err) {
      throw new NotFoundException();
    }
  }

  /**
   *
   *  this function sends invitations to users
   * @param id auto generated uuid of user
   * @param realm required realm for api request
   * @param token token requied for authentication
   * @param res to send back the desired HTTP response
   * @returns returns success message
   */
  @UseGuards(AuthenticationGuard)
  @Put('invite/:realm/:id')
  async sendInvite(
    @Param('id') id,
    @Param('realm') realm,
    @Response() res,
    @Req() req,
  ) {
    try {
      const token = req.user.kcToken;
      return this.userService.sendInvite(id, realm, token);
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  }

  /**
   *
   *  this function updates an organization admin
   * @param id auto generated uuid of user
   * @param realm required realm for api request
   * @param res to send back the desired HTTP response
   * @param token token requied for authentication
   * @param createUserDto contains all the fields requied for updating a user
   * @returns returns the updated organization admin
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'ORG_MASTER' })
  @Patch('/:realm/:id')
  async updateOrgAdmin(
    @Param('id') id,
    @Param('realm') realm,
    @Response() res,
    @Req() req,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      const token = req.user.kcToken;
      const response = await this.userService.updateAdmin(
        id,
        realm,
        token,
        createUserDto,
      );
      res.status(200).json(response);
    } catch (err) {
      res.status(400).json({ err: err.message });
    }
  }

  /**
   *
   *  this function to create a user of usermaster,
   * @param res to send back the desired HTTP response
   * @param req to get the request information
   * @param userMaster contains all the fields requied for creating a user
   * @returns the created user
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'USER_MASTER' })
  @Post('usermaster')
  async createUser(@Body() userMaster: UserMaster, @Req() req, @Res() res) {
    return this.userService.createUser(userMaster, req.user?.kcToken, res);
  }

  /**
   *
   *  this function to update a user of usermaster
   * @param res to send back the desired HTTP response
   * @param req to get the request information
   * @param userMaster contains all the fields requied for updating a user
   * @returns the updated user
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'USER_MASTER' })
  @Post('usermaster/update/:id')
  async updateUser(
    @Body() userMaster: UserMaster,
    @Req() req,
    @Res() res,
    @Param('id') id,
  ) {
    ////////////////console.log("userMaster",userMaster)
    ////////////////console.log("id",id)
    return this.userService.updateUserMaster(
      id,
      userMaster,
      req.user?.kcToken,
      res,
    );
  }
  @Patch('restoreUser/:id')
  async restoreUser(@Param('id') id, @Param('realm') realm, @Req() req) {
    return this.userService.restoreAdmin(id, realm, req.user?.kcToken);
  }
  /**
   *
   *  this function to filter all users of a organization based on below filter options
   * @param locationName String containing location name
   * @param departmentName string containing department name
   * @param businessType string containing businesstype name
   * @param user string containing users full name
   * @param byRole string containing role names
   * @param status boolean value , reparesting user active or inactive
   * @param page Pagination page number
   * @param limit Results to show in each page
   * @returns the list filtered users of a organization based on various condtions
   */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Get('allusers/:realmName')
  async getAllUsers(
    @Query('filter') filterString,
    @Query('location') location,
    @Query('entity') entity,
    @Query('page') page,
    @Query('limit') limit,
    @Query('query') search,
    @Param('realmName') realmName,
    @Req() req,
  ) {
    return this.userService.getAllUsers(
      realmName,
      location,
      entity,
      filterString,
      req.user,
      page,
      limit,
      search,
    );
  }

  /**
   *
   *  Implementation of user type ahead api,this function to filter all users of a organization based on below filter options
   * @param realmName String containing the reqalm name of the organiza
   * @param email string containing email of the user
   * @param locationId containing the locatonid of the location to fetch users from
   * @returns the list filtered users of a organization based on various condtions
   */
  @UseGuards(AuthenticationGuard)
  @Get('doctype/filterusers/:realmName/:locationId')
  async getAllUserForDoctype(
    @Query('email') email,
    @Param('realmName') realmName,
    @Param('locationId') locationId,
    @Req() req,
  ) {
    return this.userService.getUsersFilter(
      realmName,
      email,
      req.user,
      locationId,
    );
  }

  /**
   * @method getUserById
   *  This controller fetch a user information from db by its ID
   * @param id User ID
   * @returns User data
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Get('getUser/byId/:id')
  async getUserById(@Param('id') id) {
    return this.userService.getUserById(id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('signDocument')
  async signDocument(@Query() query) {
    return this.userService.signDocumentStage(query);
  }

  @UseGuards(AuthenticationGuard)
  @Put('patchUser/:id')
  async patchUser(@Body() body, @Param('id') id) {
    return this.userService.patchUser(body, id);
  }
  /**
   * @method getAuditorsOfOrg
   *  This controller fetch auditors of and organization
   * @param realmName Realm name of org
   * @returns Array of auditors
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Get('getAuditors/:realmName')
  async getAuditorsOfOrg(@Param('realmName') realmName: string, @Req() req) {
    return this.userService.getAuditorsOfOrg(realmName, req.user);
  }

  /**
   * @method getAllUsersOfEntity
   *  This controller fetches all the users of an entity
   * @param entityId Entity ID
   * @returns Array of users
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Get('/getAuditeesByEntity/:entityId')
  getAllUsersOfEntity(@Param('entityId') entityId: string) {
    return this.userService.getAllUsersOfEntity(entityId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Get('/getAllTemplateAuthors/:realmName')
  getAllTemplateAuthors(@Param('realmName') realmName: string) {
    return this.userService.getAllTemplateAuthors(realmName);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUserInfoByName/:name')
  getUserInfoByName(@Param('name') name: string, @Req() req) {
    return this.userService.getUserInfoByName(name, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'USER_MASTER' })
  @Get('getUserInfoforScope/:id')
  async getUser(@Param('id') id) {
    return this.userService.getUserByIdWithEntity(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllUsersByLocation/:locId')
  getAllUsersByLocation(@Param('locId') id: string, @Req() req) {
    return this.userService.getAllUsersByLocation(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUserByRoleInfoById/:id')
  getUserByRoleInfoById(@Param('id') id: string, @Req() req, @Query() query) {
    return this.userService.getUserByRoleInfoById(id, req.user, query);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateRoleforOtherUser')
  updateRoleforOtherUser(@Body() data: string, @Req() req) {
    return this.userService.updateRoleforOtherUser(data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/transferUser')
  async transferUsers(@Body() data, @Req() req, @Res() res) {
    return this.userService.transferUsers(data, req, res);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updateTransferredUser')
  async updateTransferredUser(@Body() data) {
    return this.userService.updateTransferredUser(data);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getGlobalRoles/:id')
  async getGlobalRoles(@Param('id') id) {
    return this.userService.getGlobalRoles(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getPendingForActionUsers/:id')
  async getPendingForActionUsers(@Param('id') id) {
    return this.userService.getPendingForActionUsers(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUserRoleById/:id')
  getUserRoleById(@Param('id') id, @Req() req) {
    return this.userService.getUserRoleById(id, req.user);
  }
}
