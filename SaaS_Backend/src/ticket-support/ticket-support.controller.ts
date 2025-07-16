import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Inject,
  Req,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { Logger } from 'winston';
import { TicketSupportService } from './ticket-support.service';
const fs = require('fs');
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { ApiParam } from '@nestjs/swagger';
@Controller('/api/ticketSupport')
export class TicketSupportController {
  constructor(
    private readonly ticketSupportService: TicketSupportService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('/send')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          //   console.log('req', req);
          const realmName = req.query.realm.toLowerCase();
          const locationName = req.query.locationName.toLowerCase();
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/tickets`;
          // console.log('destination', destination);
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
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
  async sendEmailWithAttachment(
    @UploadedFile() attachment,
    @Body() data: any,
    @Req() req,
  ) {
    // console.log('controller', attachment);
    this.logger.log(
      `POST /api/ticketSupport request started`,
      this.ticketSupportService,
    );
    await this.ticketSupportService.sendEmailWithAttachment(
      data,
      attachment,
      req.user,
    );
  }
  // @UseGuards(AuthenticationGuard)
  // @UseInterceptors(FileInterceptor('attachment'))
  // @Post('/send')
  // async sendEmailWithAttachment(
  //   @UploadedFile() attachment: Express.Multer.File,
  //   @Body() data: any,
  //   @Req() req,
  // ) {
  //   this.logger.log(
  //     `POST /api/ticketSupport request started`,
  //     this.ticketSupportService,
  //   );
  //   await this.ticketSupportService.sendEmailWithAttachment(
  //     data,
  //     attachment,
  //     req.user,
  //   );
  // }
  @UseGuards(AuthenticationGuard)
  @Get('/getAllTicketsOfOrganization/:id')
  async getAllTicketsOfOrganization(@Param('id') id) {
    return this.ticketSupportService.getAllTicketsOfOrganization(id);
  }
}
