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
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { BomService } from './bom.service';
import { Logger } from 'winston';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';

@Controller('/api/bom')
export class BomController {
  constructor(
    private readonly bom: BomService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard)
  @Post('/createBoMEntity')
  async createBoMEntity(@Req() req, @Body() data) {
    return this.bom.createBomEntity(req.user.id, data);
  }
  @UseGuards(AuthenticationGuard)
  @Put('/updateBoMEntity/:id')
  async upateBoMEntity(@Req() req, @Body() data, @Param('id') id) {
    return this.bom.updateBomEntity(req.user.id, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getBoMEntity/:id')
  async getBoMEntity(@Req() req, @Param('id') id) {
    return this.bom.getBomEntity(req.user.id, id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getBoMEntityWithoutDetails/:id')
  async getBoMEntityWithoutDetails(@Req() req, @Param('id') id) {
    return this.bom.getBomEntityWithoutDetails(req.user.id, id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/createBoM')
  async createBoM(@Req() req, @Body() data) {
    return this.bom.createBom(req.user.id, data);
  }
  @UseGuards(AuthenticationGuard)
  @Put('/updateBoM/:id')
  async updateBoM(@Req() req, @Param('id') id, @Body() data) {
    return this.bom.updateBom(req.user.id, id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllBoM')
  async getAllBoM(@Req() req, @Query() query) {
    return this.bom.getAllBom(req.user.id, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllEntityTypeswithEntitiesForBom/:id')
  async getAllEntityTypeswithEntitiesForBom(@Req() req, @Param('id') id) {
    return this.bom.getAllEntityTypeswithEntitiesForBom(req.user.id, id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getEntityTypesWithEntities')
  async getEntityTypesWithEntities(@Req() req) {
    return this.bom.getEntityTypesWithEntities(req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getEntitybyId/:id')
  async getEntityInfo(@Param('id') id) {
    return this.bom.getEntityById(id);
  }
}
