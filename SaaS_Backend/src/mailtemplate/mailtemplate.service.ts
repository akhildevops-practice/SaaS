import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';
import { MailTemplate } from './schema/mailTemplate.schema';

@Injectable()
export class MailtemplateService {
  constructor(
    @InjectModel(MailTemplate.name)
    private mailTemplate: Model<MailTemplate>,
    @Inject('Logger') private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}
  async createMailTemplate(userid, data, randomNumber) {
    try {
      console.log('data', data);
      const {
        mailEvent,
        description,
        subject,
        body,
        lastModifiedTime,
        lastModifiedBy,
        organizationId,
      } = data;
      const result = await this.mailTemplate.create({
        mailEvent,
        description,
        body,
        subject,
        lastModifiedTime,
        lastModifiedBy,
        organizationId,
      });

      this.logger.log(
        `trace id=${randomNumber} POST api/mailtemplate/createMailTemplate service successful`,
        '',
      );
      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST api/mailtemplate/createMailTemplate service failed for payload ${data} error=${error}`,
        '',
      );
    }
  }

  async updateMailTemplate(userid, data, randomNumber, id) {
    try {
      const { description, subject, body, lastModifiedTime, lastModifiedBy } =
        data;
      const result = await this.mailTemplate.findByIdAndUpdate(id, {
        description,
        subject,
        body,
        lastModifiedTime,
        lastModifiedBy,
      });

      this.logger.log(
        `trace id=${randomNumber} PUT api/mailtemplate/updateMailTemplate service successful`,
        '',
      );
      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} PUT api/mailtemplate/updateMailTemplate/${id} service failed for payload ${data} error=${error}`,
        '',
      );
    }
  }

  async getMailTemplate(userid, randomNumber, id) {
    try {
      const result = await this.mailTemplate.findById(id);

      this.logger.log(
        `trace id=${randomNumber} GET api/mailtemplate/getMailTemplate/${id} service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/mailtemplate/getMailTemplate/${id} service failed for id ${id} error=${error}`,
        '',
      );
    }
  }
  async deleteMailTemplate(userid, randomNumber, id) {
    try {
      const result = await this.mailTemplate.findByIdAndDelete(id);

      this.logger.log(
        `trace id=${randomNumber} DELETE api/mailtemplate/deleteMailTemplate/${id} service successful`,
        '',
      );
      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} DELETE api/mailtemplate/deleteMailTemplate/${id} service failed for id ${id} error=${error}`,
        '',
      );
    }
  }

  async getAllMailTemplate(userid, randomNumber, query) {
    try {
      console.log('query', query);
      const result = await this.mailTemplate.find({
        organizationId: query.organizationId,
      });

      this.logger.log(
        `trace id=${randomNumber} GET api/mailtemplate/getAllMailTemplate/${query} service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/mailtemplate/getAllMailTemplate/${query} service failed error=${error}`,
        '',
      );
    }
  }
}
