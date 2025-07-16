import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { RolesService } from './roles.service';

@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(AuthenticationGuard)
  @Post('/createRoles')
  createRoles(@Body() data, @Req() req, @Res() res) {
    return this.rolesService.createRoles(data, req.user, res);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateRolesById/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req,
    @Res() res,
  ) {
    return this.rolesService.updateRole(id, data, req.user, res);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getUserBasedOnFilter/:roleId/:locationId/:searchUser')
  async getUserBasedOnFilter(@Param() filterData, @Req() req) {
    return this.rolesService.getUserBasedOnFilter(filterData, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllRoles')
  async getAllRoles(@Req() req) {
    return this.rolesService.getAllRoles(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteRoleById/:id')
  async deleteRoleById(@Param('id') id) {
    return this.rolesService.deleteRolesById(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('workFlowDistribution')
  async workFlowDistribution(@Req() req) {
    return this.rolesService.workFlowDistribution(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('workFlowDistributionReviewer')
  async workFlowDistributionReviewer(@Req() req) {
    return this.rolesService.workFlowDistributionReviewer(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('workFlowDistributionApprover')
  async workFlowDistributionApprover(@Req() req) {
    return this.rolesService.workFlowDistributionApprover(req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getLocations')
  async getLocations(@Req() req) {
    return this.rolesService.getLocations(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllRolesInOrg')
  async getAllRolesInOrg(@Req() req) {
    return this.rolesService.getAllRolesInOrg(req.user.id);
  }
}
