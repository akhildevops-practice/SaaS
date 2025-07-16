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
  UseInterceptors,
  UploadedFile,
  Res
} from '@nestjs/common';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { ModelDto } from './dto/models.dto';
import { ModelService } from './model.service';
import { AbilityGuard } from '../ability/ability.guard';
import { roleChecker } from '../utils//roleChecker';
import { roles } from '../utils/roles.global';
import { checkAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Controller('api/model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  /**
   *
   *  this controller for creating location
   * @param locationDto contains fields for creating a location
   * @returns the created location
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'MODEL_MASTER' })
  @Post()
  createLocation(@Body() modelDto: ModelDto, @Req() req) {
    return this.modelService.createModel(modelDto, req.user);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'MODEL_MASTER' })
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('importModels')
  async importModels(@UploadedFile() file, @Req() req, @Res() res) {
    return this.modelService.importModels(file,req.user,res);
  }

  // /**
  //  *
  //  *  this function to filter all locations of a organization based on below filter options
  //  * @param ModelName String containing Model name
  //  * @param ModelNo  String containing Model number
  //  * @param page Pagination page number
  //  * @param limit Results to show in each page
  //  * @returns the list filtered locations of a organization based on various condtions
  //  */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'MODEL_MASTER' })
  @Get()
  async getModels(
    @Query('modelName') modelName,
    @Query('modelNo') modelNo,
    @Query('page') page,
    @Query('limit') limit,
    @Req() req,
  ) {
    return this.modelService.getModels(
      modelName,
      modelNo,
      page,
      limit,
      req.user,
    );
  }

  /**
   *
   *  this function to get location admin of a particular location
   * @param id String containing location id of the location, whose location admin needs to be fetched
   * @returns the location admin for the particular organization
   */

  //  *
  //  *  this controller for updating a location
  //  * @param locationDto contains fields for updating a location
  //  * @returns the created location
  //  */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'MODEL_MASTER' })
  @Put(':id')
  updateModel(@Body() modelDto: ModelDto, @Param('id') id) {
    //console.log('Id', id);
    return this.modelService.updateModel(modelDto, id);
  }

  // /**
  //  *
  //  *  this controller for deleting a location
  //  * @param id of the location to be deleted
  //  * @returns the created location
  //  */

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'MODEL_MASTER' })
  @Delete(':id')
  async deleteModel(@Param('id') id) {
    return this.modelService.deleteModel(id);
  }

  //  *
  //  *  this controller for fetching a single location
  //  * @param realmName of the organizations whose sections need to be fetched
  //  * @returns an array of sections that belong to a pericular organization
  //  */

  @Get('/getModel/byId/:id')
  async getModelById(@Param('id') id) {
    return this.modelService.getModelById(id);
  }
}
