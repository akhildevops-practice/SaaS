import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppField } from './schema/app-field.schema';
import { Model } from 'mongoose';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppFieldService {
  constructor(
    @InjectModel(AppField.name)
    private appFieldModel: Model<AppField>,
    private prisma: PrismaService,
  ) {}

  async createAppField(data, user) {
    try {
      const create = await this.appFieldModel.create(data);
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllAppField(orgid, userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const getAllAppFields = await this.appFieldModel
        .find({
          organizationId: orgid,
        })
        .exec();

      const finalResult = await getAllAppFields.map(async (value) => {
        const data = {
          id: value._id,
          name: value.name,
          options: value.options,
          organizationId: value.organizationId,
        };
        return data;
      });
      const result = await Promise.all(finalResult);
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getSingleAppField(id, userId) {
    const finalResult = await this.appFieldModel.findById({
      _id: id,
    });
    return {
      id: finalResult._id,
      name: finalResult.name,
      options: finalResult.options,
      organizationId: finalResult.organizationId,
    };
  }

  async updateAppField(FieldId, userId, data) {
    const { name, options } = data;
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const updateAppField = await this.appFieldModel.findByIdAndUpdate(
        FieldId,
        {
          name,
          options,
        },
      );
      return 'App Field updated successfully';
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update app field');
    }
  }

  async deleteAppField(id, userId) {
    try {
      const deleteAppField = await this.appFieldModel.findByIdAndDelete(id);
      return `App Field deleted Sucessfully`;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getAppfieldOptions(query, userId) {
    try{
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId
        }
      })
      const {fieldId, type} = query
      let options;

      if(type === 'appField'){
        const appFieldOptions = await this.appFieldModel.findById(fieldId)
        options = appFieldOptions.options
      }

      if(type === 'entityType'){
        const entityTypeOptions = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            entityTypeId: fieldId
          }
        })
        options = entityTypeOptions.map((item: any) => {
          return {
            id: item.id,
            name: item.entityName
          }
        })
      }
      return options

    }catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
