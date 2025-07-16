import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ObjectStore } from './schema/object-store.schema';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';
import common = require('oci-common');
import * as objectstorage from 'oci-objectstorage';

@Injectable()
export class ObjectStoreService {
  constructor(
    @InjectModel(ObjectStore.name)
    private ObjectStoreModel: Model<ObjectStore>,
    @Inject('Logger') private readonly logger: Logger,
    private prisma: PrismaService,
  ) {}

  async createObjectStore(data, file, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/objectStore/createObjectStore`,
      'object-store.service.ts',
    );
    try {
      const objectStoreExist = await this.ObjectStoreModel.findOne({
        organizationId: data?.organizationId,
      });
      if (objectStoreExist) {
        throw new HttpException(
          {
            message: 'Object Store already exists for this organization.',
          },
          HttpStatus.CONFLICT,
        );
      }
      let finalData = data;
      if (file) {
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(file.path);
        finalData = {
          ...finalData,
          privateKey: fileBuffer,
        };
      }
      const create = await this.ObjectStoreModel.create(finalData);
      return {
        response: {
          ...data,
          _id: create._id,
          privateKey: create.privateKey ? true : false,
        },
        responseMessage: 'Object Store Created Successfully',
      };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} POST api/objectStore/createObjectStore Failed`,
        'object-store.service.ts',
      );
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's a known HttpException
      }
      throw new HttpException(
        {
          message: 'Failed to create Object Store. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getObjectStoreByOrgId(orgId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} GET api/objectStore/getObjectStoreByOrgId/:id`,
      'object-store.service.ts',
    );
    try {
      const getObjectStore = await this.ObjectStoreModel.findOne({
        organizationId: orgId,
      });
      let objStrData;
      if (getObjectStore) {
        if (getObjectStore.privateKey) {
          const { privateKey, ...rest } = getObjectStore.toObject();
          objStrData = { ...rest, privateKey: true };
        } else {
          objStrData = { ...getObjectStore.toObject(), privateKey: false };
        }
      }
      return objStrData;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET api/objectStore/getObjectStoreByOrgId/:id Failed`,
        'object-store.service.ts',
      );
      throw new HttpException(
        {
          message:
            'Failed to retrieve Object Store information. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateObjectStore(id, data, file, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} PATCH api/objectStore/updateObjectStore`,
      'object-store.service.ts',
    );
    try {
      let finalData = data;
      if (file) {
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(file.path);
        finalData = {
          ...finalData,
          privateKey: fileBuffer,
        };
      }
      await this.ObjectStoreModel.findByIdAndUpdate(id, finalData);
      const getData = await this.ObjectStoreModel.findById(id);
      let objStrData;
      if (getData) {
        if (getData.privateKey) {
          const { privateKey, ...rest } = getData.toObject();
          objStrData = { ...rest, privateKey: true };
        } else {
          objStrData = { ...getData.toObject(), privateKey: false };
        }
      }
      return {
        response: objStrData,
        responseMessage: 'Object Store Updated Successfully',
      };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} PATCH api/objectStore/updateObjectStore Failed`,
        'object-store.service.ts',
      );
      throw new HttpException(
        {
          message: 'Failed to update Object Store. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
