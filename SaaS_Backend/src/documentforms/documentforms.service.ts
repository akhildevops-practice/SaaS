import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Documentform } from './schema/documentform.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger, query } from 'winston';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DocumentformsService {
  constructor(
    @InjectModel(Documentform.name)
    private documentformModel: Model<Documentform>,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async create(body: any) {
    try {
      this.logger.log(
        `trace id=${uuid()}, POST /documentforms/create request payload: ${JSON.stringify(
          body,
        )}`,
        '',
      );

      const createdDocumentForm = await this.documentformModel.create(body);

      this.logger.log(
        `trace id=${uuid()}, POST /documentforms/create processed successfully, created document form with ID: ${
          createdDocumentForm._id
        }`,
        '',
      );

      return createdDocumentForm;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, POST /documentforms/create failed with error: ${
          error.message
        }`,
      );
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query: any) {
    try {
      this.logger.log(
        `trace id=${uuid()}, GET /documentforms/findAll request with query params: ${JSON.stringify(
          query,
        )}`,
        '',
      );

      const {
        page = 1,
        limit = 10,
        organizationId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build filter object
      const filter: any = { deletedAt: null };

      // Add organizationId filter if provided
      if (organizationId) {
        filter.organizationId = organizationId;
      }

      // Get total count for pagination
      const total = await this.documentformModel.countDocuments(filter);

      // Get paginated results
      const documentForms = await this.documentformModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      this.logger.log(
        `trace id=${uuid()}, GET /documentforms/findAll processed successfully, found ${
          documentForms.length
        } document forms out of ${total} total`,
        '',
      );

      return {
        data: documentForms,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /documentforms/findAll failed with error: ${
          error.message
        }`,
      );
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log(
        `trace id=${uuid()}, GET /documentforms/findOne/${id} request processed`,
        '',
      );

      const documentForm = await this.documentformModel.findOne({
        _id: id,
        deletedAt: null,
      });

      if (!documentForm) {
        this.logger.warn(
          `trace id=${uuid()}, GET /documentforms/findOne/${id} document form not found`,
        );
        throw new NotFoundException(`Document form with ID ${id} not found`);
      }

      this.logger.log(
        `trace id=${uuid()}, GET /documentforms/findOne/${id} processed successfully`,
        '',
      );

      return documentForm;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `trace id=${uuid()}, GET /documentforms/findOne/${id} failed with error: ${
          error.message
        }`,
      );
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(body: any, id: string) {
    try {
      this.logger.log(
        `trace id=${uuid()}, PUT /documentforms/update/${id} request payload: ${JSON.stringify(
          body,
        )}`,
        '',
      );

      const updatedDocumentForm =
        await this.documentformModel.findByIdAndUpdate(
          id,
          { ...body, updatedAt: new Date() },
          { new: true, runValidators: true },
        );

      if (!updatedDocumentForm) {
        this.logger.warn(
          `trace id=${uuid()}, PUT /documentforms/update/${id} document form not found`,
        );
        throw new NotFoundException(`Document form with ID ${id} not found`);
      }

      this.logger.log(
        `trace id=${uuid()}, PUT /documentforms/update/${id} processed successfully`,
        '',
      );

      return updatedDocumentForm;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `trace id=${uuid()}, PUT /documentforms/update/${id} failed with error: ${
          error.message
        }`,
      );
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: string) {
    try {
      this.logger.log(
        `trace id=${uuid()}, DELETE /documentforms/delete/${id} request processed`,
        '',
      );

      // Soft delete by setting deletedAt
      const deletedDocumentForm =
        await this.documentformModel.findByIdAndUpdate(
          id,
          { deletedAt: new Date() },
          { new: true },
        );

      if (!deletedDocumentForm) {
        this.logger.warn(
          `trace id=${uuid()}, DELETE /documentforms/delete/${id} document form not found`,
        );
        throw new NotFoundException(`Document form with ID ${id} not found`);
      }

      this.logger.log(
        `trace id=${uuid()}, DELETE /documentforms/delete/${id} processed successfully`,
        '',
      );

      return { message: `Document form with ID ${id} has been deleted` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `trace id=${uuid()}, DELETE /documentforms/delete/${id} failed with error: ${
          error.message
        }`,
      );
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getallformtitles(organizationId: string) {
    try {
      this.logger.log(
        `trace id=${uuid()}, GET /documentforms/getallformtitles request with query params: ${JSON.stringify(
          organizationId,
        )}`,
        '',
      );

      // Build filter object
      const filter: any = { deletedAt: null };

      // Add organizationId filter if provided
      if (organizationId) {
        filter.organizationId = organizationId;
      }

      // Get paginated results
      const documentForms = await this.documentformModel.find(filter).select('_id formTitle').lean();

      this.logger.log(
        `trace id=${uuid()}, GET /documentforms/fingetallformtitlesdAll processed successfully`,
        '',
      );

      return documentForms;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /documentforms/fingetallformtitlesdAll failed with error: ${
          error.message
        }`,
      );
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
