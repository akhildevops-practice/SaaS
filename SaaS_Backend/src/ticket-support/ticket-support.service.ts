import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as sgMail from '@sendgrid/mail';
import { PrismaService } from 'src/prisma.service';
import {
  ticketSupport,
  TicketSupportDocument,
} from './schema/ticketSupport.schema';
import axios from 'axios';
import { Logger } from 'winston';
import { EmailService } from 'src/email/email.service';
sgMail.setApiKey(
  `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`,
);
//sgMail.setApiKey(process.env.SMTP_PASSWORD);
@Injectable()
export class TicketSupportService {
  constructor(
    // private readonly ticketSupportService: TicketSupportService,
    @InjectModel(ticketSupport.name)
    private readonly ticketSupportModel: Model<TicketSupportDocument>,
    @Inject('Logger') private readonly logger: Logger,
    private prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}
  //this code can be used when you want to store the attachments in your local
  async sendEmailWithAttachment(data, attachment, user) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true, entity: true, location: true },
      });
      console.log('attachemnt', attachment);
      const result = await this.ticketSupportModel.create(data);
      const freshdesk = await this.prisma.connectedApps.findFirst({
        where: {
          sourceName: {
            contains: 'freshdesk',
            mode: 'insensitive',
          },
          organizationId: activeuser.organization.id,
        },
      });
      // console.log('freshdesk details', freshdesk);
      const fs = require('fs');

      const axios = require('axios');

      const apiKey = Buffer.from(freshdesk.clientSecret, 'base64').toString(
        'ascii',
      );
      // console.log('apikey', apiKey);
      // const email = Buffer.from(freshdesk.clientId, 'base64').toString('ascii');
      // console.log('email of freshdesk', email);
      const password = 'X';
      let attachments: any = [];

      const authHeader =
        'Basic ' + Buffer.from(apiKey + ':' + password).toString('base64');

      //formdata was used send attachments to freshdesk otherwise wouldnt work
      const FormData = require('form-data');
      const formData = new FormData();
      // Add creator email, subject, and description fields to the FormData
      formData.append('email', activeuser?.email);
      formData.append(
        'subject',
        'Ticket for module' + ' ' + data?.moduleName + ' ' + 'has been created',
      );
      formData.append('description', data.description);
      formData.append('status', 2);
      formData.append('priority', 1);
      const ccEmails = [
        // 'shashank@processridge.in',
        'support@processridge.in',
        // 'aravind@processridge.in',
        // 'sanath@processridge.in',
        'prem@processridge.in',
      ];
      ccEmails.forEach((email) => {
        formData.append('cc_emails[]', email);
      });

      if (attachment && attachment?.path && fs.existsSync(attachment?.path)) {
        formData.append('attachments[]', fs.createReadStream(attachment.path));
        attachments.push(attachment);
      }
      let freshdeskResponse;
      try {
        const response = await axios.post(freshdesk.baseURL, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: authHeader,
            'Content-Type': 'multipart/form-data',
          },
        });
        // console.log('response', response);
        freshdeskResponse = response.status;
      } catch (error) {
        console.error(
          'Error:',
          error.response ? error.response.data : error.message,
        );
      }
      // commented code because freshdesk will automatically send response to the ticket creator and support@processridge.in
      // const emailMessage = `
      //   <p>Hello Team,</p>
      // <p>User ${activeuser.username} of department:${activeuser?.entity?.entityName} of location:${activeuser?.location?.locationName} has created a ticket for module ${data?.moduleName} with the following description.</p>
      // <p>${data.description}</p>

      //   `;

      // const emailMessageIP = `
      //   Hello Team,
      // User ${activeuser.username} of department:${activeuser?.entity?.entityName} of location:${activeuser?.location?.locationName} has created a ticket for module ${data?.moduleName} with the following description.
      // ${data.description}

      //   `;
      // if (freshdeskResponse === 201 || freshdeskResponse === 200) {
      //   if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      //     const result = await this.emailService.sendBulkEmails(
      //       [
      //         activeuser.email,
      //         'aravind@processridge.in',
      //         'sanath@processridge.in',
      //         'prem@processridge.in',
      //       ],
      //       `Ticket has been generated`,
      //       emailMessageIP,
      //       attachments,
      //     );
      //   } else {
      //     const msg = {
      //       to: [
      //         activeuser?.email,

      //         'shashank@processridge.in',
      //         'aravind@processridge.in',
      //         'sanath@processridge.in',
      //         'prem@processridge.in',
      //       ],
      //       from: process.env.FROM,
      //       subject: `Ticket has been generated `,
      //       html: `<div>${emailMessage}</div>`,
      //       attachments: [],
      //     };

      //     if (attachment) {
      //       // If attachment exists, add it to the attachments array
      //       msg.attachments.push({
      //         content: fs.readFileSync(attachment.path).toString('base64'),
      //         filename: attachment.originalname,
      //         type: attachment.mimetype,
      //         disposition: 'attachment',
      //       });
      //     }

      //     try {
      //       const finalResult = await sgMail.send(msg);
      //       // console.log('mail sent');
      //     } catch (error) {
      //       console.error('Error:', error);
      //     }
      //   }
      // }
    } catch (error) {
      return new NotFoundException({ status: 404 });
    }
  }
  //this api is without storing attachment
  // async sendEmailWithAttachment(data, attachment, user) {
  //   // try {
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: user.id,
  //     },
  //     include: { organization: true, entity: true, location: true },
  //   });

  //   const emailMessage = `
  //       <p>Hello Team,</p>
  //       <p>User ${activeUser.username} of department:${activeUser?.entity?.entityName} of location:${activeUser?.location?.locationName} has created a ticket for module ${data?.moduleName} with the following description.</p>
  //       <p>${data.description}</p>
  //     `;

  //   const emailMessageIP = `
  //       Hello Team,
  //       User ${activeUser.username} of department:${activeUser?.entity?.entityName} of location:${activeUser?.location?.locationName} has created a ticket for module ${data?.moduleName} with the following description.
  //       ${data.description}
  //       severity:${data.severity}
  //     `;
  //   // console.log('attachment', attachment);
  //   let encodedContent, msg;

  //   if (!!attachment) {
  //     encodedContent = attachment?.buffer.toString('base64'); // Read attachment content and encode it as Base64
  //     // console.log('encoded content', encodedContent);
  //     console.log('inside if');
  //     msg = {
  //       to: ['support@processridge.in', 'ashwini@processridge.in'], // Array of recipients
  //       from: process.env.FROM,
  //       subject: `Ticket has been generated `,
  //       html: `<div>${emailMessage}</div>`,
  //       attachments: [
  //         {
  //           content: encodedContent ? encodedContent : null, // Set attachment content
  //           filename: attachment?.originalname, // Set filename
  //           type: attachment?.mimetype, // Set file type
  //           disposition: 'attachment', // Set attachment disposition
  //         },
  //       ],
  //     };
  //     //to freshdesk
  //     console.log('just before freshdesk');
  //     const freshdeskResponse = await axios.post(
  //       'https://processridgesolutionspvtltd-help.freshdesk.com/api/v2/tickets',
  //       {
  //         email: [
  //           'support@processridge.in',
  //           'ashwini@processridge.in',
  //           'shashank@processridge.in',
  //         ],
  //         subject: 'Ticket has been generated',
  //         description: data?.description,
  //         attachments: [
  //           {
  //             content: encodedContent,
  //             filename: attachment.originalname,
  //             content_type: attachment.mimetype,
  //           },
  //         ],
  //       },
  //       {
  //         headers: {
  //           Authorization:
  //             'Basic ' +
  //             Buffer.from('MBz4aMnH3NqcIiW4ahzD' + ':' + 'X').toString(
  //               'base64',
  //             ),
  //         },
  //       },
  //     );
  //     console.log('after freshdesk');
  //     // Handle Freshdesk response if needed
  //     console.log('Freshdesk Response:', freshdeskResponse.data);
  //   } else {
  //     msg = {
  //       to: ['support@processridge.in', 'ashwini@processridge.in'], // Array of recipients
  //       from: process.env.FROM,
  //       subject: `Ticket has been generated `,
  //       html: `<div>${emailMessage}</div>`,
  //       // attachments: [
  //       //   {
  //       //     content: encodedContent ? encodedContent : null, // Set attachment content
  //       //     filename: attachment?.originalname, // Set filename
  //       //     type: attachment?.mimetype, // Set file type
  //       //     disposition: 'attachment', // Set attachment disposition
  //       //   },
  //       // ],
  //     };
  //     const freshdeskResponse = await axios.post(
  //       'https://processridgesolutionspvtltd-help.freshdesk.com/api/v2/tickets',
  //       {
  //         email: [
  //           'support@processridge.in',
  //           'ashwini@processridge.in',
  //           'shashank@processridge.in',
  //         ],
  //         subject: 'Ticket has been generated',
  //         description: data?.description,
  //         attachments: [
  //           {
  //             content: encodedContent,
  //             filename: attachment?.originalname,
  //             content_type: attachment.mimetype,
  //           },
  //         ],
  //       },
  //       {
  //         headers: {
  //           Authorization:
  //             'Basic ' +
  //             Buffer.from('MBz4aMnH3NqcIiW4ahzD' + ':' + 'X').toString(
  //               'base64',
  //             ),
  //         },
  //       },
  //     );
  //   }

  //   // if (process.env.MAIL_SYSTEM === 'IP_BASED') {
  //   //   await this.emailService.sendEmail(
  //   //     'support@processridge.in',
  //   //     `Ticket has been generated`,
  //   //     emailMessageIP,
  //   //     attachment,
  //   //   );
  //   // } else {
  //   //   await sgMail.send(msg);
  //   // }
  //   // } catch (error) {
  //   //   throw new NotFoundException({ status: 404 });
  //   // }
  // }
  async getAllTicketsOfOrganization(id) {
    try {
      this.logger.log(
        `GET /api/ticketSupport/getAllTicketsOfOrganization service started`,
        'ticketsupport-service',
      );
      const result = await this.ticketSupportModel.find({
        organizationId: id,
        status: false,
      });
      return result;
    } catch (Error) {
      this.logger.error(
        `GET /api/ticketSupport/getAllTicketsOfOrganization failed`,
      );
    }
  }
}
