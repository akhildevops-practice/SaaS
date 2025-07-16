import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { InspectionCreateDto } from './dto/createInspection.dto';

@Controller('api/inspection')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @UseGuards(AuthenticationGuard)
  @Post()
  create(@Req() req, @Body() data: InspectionCreateDto) {
    return this.inspectionService.create(data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get()
  getAll(@Req() req) {
    return this.inspectionService.getAll(req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllModels')
  getAllModels(@Req() req) {
    return this.inspectionService.getAllModels(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllParts')
  getAllParts(@Req() req) {
    return this.inspectionService.getAllParts(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/:id')
  getById(@Req() req, @Param('id') id) {
    return this.inspectionService.getInspectionById(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/:id')
  deleteById(@Req() req, @Param('id') id) {
    return this.inspectionService.deleteById(id);
  }

  // @UseGuards(AuthenticationGuard)
  // @Patch('/:id')
  // updateInspection(
  //   @Req() req,
  //   @Param('id') id,
  //   @Body() data: InspectionCreateDto,
  // ) {
  //   return this.inspectionService.updateTest(req.user, id, data);
  // }

  @UseGuards(AuthenticationGuard)
  @Put('/:id')
  update(
    @Req() req,
    @Body() data: InspectionCreateDto,
    @Param('id') id,
  ): Promise<any> {
    return this.inspectionService.update(req.user, id, data);
  }


}
