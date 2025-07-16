import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { createFieldsPairsFilter } from '../utils/filterGenerator';
import { includeObjLoc } from '../utils/constants';

import { getBTDetails } from '../user/helper';

import { ModelDto } from './dto/models.dto';
import { model } from 'mongoose';
// import { User } from '../../dist/authentication/user.model';

@Injectable()
export class ModelService {
  constructor(private prisma: PrismaService, private user: UserService) {}

  async createModel(modelData: ModelDto, user: any) {
    const { modelName, modelNo, description } = modelData;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const modelDataDetail = await this.prisma.models.findFirst({
      where: {
        OR: [{ modelName: modelName }, { modelNo: modelNo }],
      },
    });
    if (modelDataDetail) {
      throw new ConflictException('Model Name or No. already exists');
    }
    const createdModel = await this.prisma.models.create({
      data: {
        modelName,
        modelNo,
        description,
        organization: {
          connect: {
            id: activeUser.organizationId,
          },
        },
      },
    });
    //console.log(createdModel);
    const getCreatedModel = await this.prisma.models.findFirst({
      where: {
        id: createdModel.id,
      },
    });
    if (getCreatedModel) {
      return getCreatedModel;
    } else {
      return;
    }
  }

  // // User master api

  // //get location by id
  async getModelById(id) {
    try {
      const modelData = await this.prisma.models.findUnique({
        where: {
          id: id,
        },
      });

      return modelData;
    } catch {
      throw new NotFoundException('Error while fetching location');
    }
  }

  async getModels(
    modelName?: string,
    modelNo?: string,
    page?: number,
    limit?: number,
    user?: any,
  ) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const skipValue = (page - 1) * Number(limit);
    try {
      let filterOptions: any = {};
      let allModels = [];
      if (modelName && modelName.length > 0) {
        allModels = await this.prisma.models.findMany({
          skip: skipValue,
          take: Number(limit),
          where: {
            organizationId: activeUser.organizationId,
            OR: [
              {
                modelName: {
                  contains: modelName,
                  mode: 'insensitive',
                },
              },
              {
                modelNo: {
                  contains: modelName,
                  mode: 'insensitive',
                },
              },
            ],
          },
        });
      } else {
        allModels = await this.prisma.models.findMany({
          skip: skipValue,
          take: Number(limit),
          where: { organizationId: activeUser.organizationId },
        });
      }

      const noPageLocations = await this.prisma.models.findMany({});
      return { data: allModels, length: noPageLocations.length };
    } catch (err) {
      console.error(err);
      throw new BadRequestException();
    }
  }

  async updateModel(modelData: ModelDto, id: string) {
    const { modelName, modelNo, description } = modelData;

    const isModelExist = await this.prisma.models.findUnique({
      where: {
        id: id,
      },
    });

    if (isModelExist) {
      const updateModel = await this.prisma.models.update({
        where: {
          id: id,
        },
        data: {
          modelName,
          modelNo,
          description,
        },
      });
      return updateModel;
    } else {
      throw new NotFoundException();
    }
  }

  async deleteModel(id: string) {
    const modelData = await this.prisma.models.findUnique({
      where: {
        id: id,
      },
    });
    if (modelData) {
      const deletedModel = await this.prisma.models.delete({
        where: {
          id: id,
        },
      });
      ////console.log(deletedLocation.id);
      return deletedModel.id;
      ////console.log(deletedLocation.id);
      return deletedModel.id;
    } else {
      throw new NotFoundException();
    }
  }

  async importModels(file, user: any, res) {
    const fs = require('fs');
    const XLSX = require('xlsx');
    const fileContent = fs.readFileSync(file.path);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet,{header : 1});
    let firstIteration = true;
    const description = '';
    let failedModels = [['Model Name','Model No.','Reason']];
    const headers = Object.keys(failedModels[0]);

    for (const rowData of excelData) {
      if(firstIteration){
        firstIteration = false;
        continue;
      }
      
      const modelName = rowData[0]
      const modelNo = rowData[1]
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const modelDataDetail=await this.prisma.models.findFirst({
      where:{
        OR:[
          {modelName:modelName},
          {modelNo:modelNo}
        ]
      }
      })
      if (modelDataDetail) {
        rowData.push('Model Name OR Model No. Already Exists');
        failedModels.push(rowData);
        continue;
      }
      const createdModel = await this.prisma.models.create({
        data: {
          modelName,
          modelNo,
          description,
          organization: {
            connect: {
              id: activeUser.organizationId,
            },
          },
        },
      });
    }
    if(failedModels.length > 1){
      return res.json({ success: true, failedModels });
    }
    return res.sendStatus(200);
  }
}
