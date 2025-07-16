import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { patch } from 'request';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * @Desc This method fetches all the notification of the current user
   * @param req Request object
   * @returns All notifications of the current user
   */
  @UseGuards(AuthenticationGuard)
  @Get()
  findAll(@Req() req) {
    return this.notificationService.findAll(req.user.id);
  }

  
  /**
   * @Desc This method updates a notification by ID and set it as read.
   * @param req Request Object
   * @param id User ID
   * @returns Updated notification
   */
  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  markAsRead(@Req() req, @Param('id') id: string) {
    return this.notificationService.markAsRead(req.user.id, id);
  }

  /**
   * @Desc This method updates a notification by ID and set it as read.
   * @param req Request Object
   * @param id User ID
   * @returns Updated notification
   */
   @UseGuards(AuthenticationGuard)
   @Delete()
   async clearNotifications (@Req() req, @Param('id') id: string) {
     return this.notificationService.clearAllNotifications(req.user.id);
   }
}
