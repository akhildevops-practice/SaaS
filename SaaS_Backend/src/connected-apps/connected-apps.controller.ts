import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { ConnectedAppsService } from './connected-apps.service';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import { url } from 'inspector';

@Controller('api/connected-apps')
export class ConnectedAppsController {
  constructor(private readonly connectedApps: ConnectedAppsService) {}
  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Create, resource: 'CONNECTED_APPS' })
  @Post('connectedapps')
  async connectedapps(@Body() data: any, @Req() req) {
    return this.connectedApps.createConnectedApp(req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Read, resource: 'CONNECTED_APPS' })
  @Get('getallconnectedapps')
  async getallconnectedapps(@Req() req) {
    return this.connectedApps.getAllConnectedApps(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Read, resource: 'CONNECTED_APPS' })
  @Get('getConnectedAppByName')
  async getConnectedAppByName(@Query() data, @Req() req) {
    return this.connectedApps.getConnectedAppByName(data, req.user.id);
  }
  
  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Delete, resource: 'CONNECTED_APPS' })
  @Delete('deleteconnectedapp/:id')
  async deleteconnectedapp(@Req() req, @Param('id') id) {
    return this.connectedApps.deleteConnectedApp(req.user.id, id);
  }

  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Read, resource: 'CONNECTED_APPS' })
  @Get('getconnectedappbyid/:id')
  async getconnectedappid(@Req() req, @Param('id') id) {
    return this.connectedApps.getSelectedConnectedApp(id);
  }

  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Update, resource: 'CONNECTED_APPS' })
  @Put('updateselectedconnectedapp/:id')
  async updateselectedconnectedapp(
    @Body() data: any,
    @Req() req,
    @Param('id') id,
  ) {
    return this.connectedApps.updateselectedconnectedapp(data, req.user.id, id);
  }

  @UseGuards(AuthenticationGuard)
  @checkAbilities({ action: Action.Update, resource: 'CONNECTED_APPS' })
  @Get('testConnection/:id')
  async testconnectedapp(@Req() req, @Param('id') id, @Res() res) {
    // ////////////////console.log("test")
    return this.connectedApps.testConnectedApp(req.user.id, id, res);
  }
  @Get('testconnectionaxios/:id')
  async testconnection(@Param('id') id) {
    return this.connectedApps.connectionTypeAxelor(id);
  }
  @Get('axiosget')
  async axiosget(@Query() query) {
    return this.connectedApps.axelorEndPoint(query);
  }
}
