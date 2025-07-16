import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Google } from './schema/google.schema';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GoogleService {
  constructor(
    @InjectModel(Google.name)
    private GoogleModel: Model<Google>,
    @Inject('Logger') private readonly logger: Logger,
    private prisma: PrismaService,
  ) {}

  async createGoogle(data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/google/createGoogle`,
      'google.service.ts',
    );
    try {
      const googleExist = await this.GoogleModel.findOne({
        organizationId: data?.organizationId,
      });
      if (googleExist) {
        throw new HttpException(
          {
            message: 'Google already exists for this organization.',
          },
          HttpStatus.CONFLICT,
        );
      }
      const create = await this.GoogleModel.create(data);
      return {
        response: {
          ...data,
          _id: create._id,
        },
        responseMessage: 'Google Created Successfully',
      };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} POST api/google/createGoogle Failed`,
        'google.service.ts',
      );
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's a known HttpException
      }
      throw new HttpException(
        {
          message: 'Failed to create Google. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGoogleByOrgId(orgId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} GET api/google/getGoogleByOrgId/:id`,
      'google.service.ts',
    );
    try {
      const getGoogle = await this.GoogleModel.findOne({
        organizationId: orgId,
      });
      return getGoogle;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET api/google/getGoogleByOrgId/:id Failed`,
        'google.service.ts',
      );
      throw new HttpException(
        {
          message: 'Failed to get Google information. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGoogleDtls(userId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} GET api/google/getGoogleDtls`,
      'google.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
      });
      let getGoogleContents = await this.GoogleModel.findOne({
        organizationId: activeUser.organizationId,
      });

      if (!getGoogleContents) {
        getGoogleContents = await this.GoogleModel.findOne({
          organizationId: 'master',
        });
      }
      return getGoogleContents;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET api/google/getGoogleDtls Failed`,
        'google.service.ts',
      );
      throw new HttpException(
        {
          message: 'Failed to get Google information. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateGoogle(id, data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} PATCH api/google/updateGoogle`,
      'google.service.ts',
    );
    try {
      await this.GoogleModel.findByIdAndUpdate(id, data);
      const getData = await this.GoogleModel.findById(id);
      return {
        response: getData,
        responseMessage: 'Google Updated Successfully',
      };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} PATCH api/google/updateGoogle Failed`,
        'google.service.ts',
      );
      throw new HttpException(
        {
          message: 'Failed to update Google. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
