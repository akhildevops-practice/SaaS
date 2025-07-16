import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { createFieldsPairsFilter } from '../utils/filterGenerator';
import { includeObjLoc } from '../utils/constants';

import { getBTDetails } from '../user/helper';

import { PartsDto } from './dto/parts.dto';
import { duplicateFinder } from 'src/utils/helper';
import { throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
// import { User } from '../../dist/authentication/user.model';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService, private user: UserService) {}

  async createParts(partsData: PartsDto, user: any) {
    const { partName, partNo, description, entity, models } = partsData;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const createdPart1 = await this.prisma.parts.findFirst({
      where: {
        partNo: partNo,
      },
    });
    if (createdPart1) {
      //console.log("kkkk")
      throw new HttpException(
        'Duplicate entries found while creating Parts',
        409,
      );
    } else {
      const createdPart = await this.prisma.parts.create({
        data: {
          partNo,
          partName,
          description,
          organization: {
            connect: {
              id: activeUser.organizationId,
            },
          },
          entity: {
            connect: {
              id: entity,
            },
          },
          models: {
            connect: models.map((model: any) => ({ id: model.id })),
          },
        },
        include: {
          models: true,
        },
      });
      const getcreatedPart = await this.prisma.parts.findFirst({
        where: {
          id: createdPart.id,
        },
      });
      if (createdPart) {
        return getcreatedPart;
      } else {
        return;
      }
    }
  }

  // // User master api

  // //get location by id
  async getPartsById(id) {
    try {
      const partsData = await this.prisma.parts.findUnique({
        where: {
          id: id,
        },
        include: {
          entity: true,
          models: true,
        },
      });

      return partsData;
    } catch {
      throw new NotFoundException('Error while fetching parts');
    }
  }

  // // //user master apis

  // // async getLocationAdmin(id: string) {
  // //   const data = await this.prisma.user.findMany({
  // //     where: {
  // //       AND: [
  // //         {
  // //           assignedRole: {
  // //             some: {
  // //               role: {
  // //                 roleName: {
  // //                   equals: 'LOCATION-ADMIN',
  // //                 },
  // //               },
  // //             },
  // //           },
  // //         },
  // //         { locationId: id },
  // //       ],
  // //     },
  // //     select: {
  // //       id: true,
  // //       firstname: true,
  // //       lastname: true,
  // //       username: true,
  // //       locationId: true,
  // //       email: true,
  // //     },
  // //   });
  // //   return data;
  // // }

  async getParts(
    page?: number,
    limit?: number,
    user?: any,
    search?: string,
    entityId?: string,
  ) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const skipValue = (page - 1) * Number(limit);
    try {
      let allParts = [];
      if (search && search.length > 0) {
        if (entityId) {
          let entityIds = entityId.split(',');
          allParts = await this.prisma.parts.findMany({
            skip: skipValue,
            take: Number(limit),
            where: {
              organizationId: activeUser.organizationId,
              OR: [
                {
                  partName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  partNo: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  models: {
                    some: {
                      modelName: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
              ],
              entityId: {
                in: entityIds,
              },
            },
            include: {
              entity: true,
              models: true,
            },
          });
        } else {
          allParts = await this.prisma.parts.findMany({
            skip: skipValue,
            take: Number(limit),
            where: {
              organizationId: activeUser.organizationId,
              OR: [
                {
                  partName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  partNo: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  models: {
                    some: {
                      modelName: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
              ],
            },
            include: {
              entity: true,
              models: true,
            },
          });
        }

        //console.log(allParts,"allParts")
      } else {
        if (entityId) {
          let entityIds = entityId.split(',');
          //console.log(entityIds)
          allParts = await this.prisma.parts.findMany({
            skip: skipValue,
            take: Number(limit),
            where: {
              organizationId: activeUser.organizationId,
              entityId: entityId,
            },
            include: {
              entity: true,
              models: true,
            },
          });
          //console.log(allParts,"allParts")
        } else {
          allParts = await this.prisma.parts.findMany({
            skip: skipValue,
            take: Number(limit),
            where: {
              organizationId: activeUser.organizationId,
            },
            include: {
              entity: true,
              models: true,
            },
          });
        }
      }

      const noPageLocations = await this.prisma.parts.findMany({});
      return { data: allParts, length: noPageLocations.length };
    } catch (err) {
      console.error(err);
      throw new BadRequestException();
    }
  }

  async updateParts(partsData: PartsDto, id: string) {
    const { partName, partNo, description, entity, models } = partsData;

    const isPartExist = await this.prisma.parts.findUnique({
      where: {
        id: id,
      },
    });

    if (isPartExist) {
      const updateParts = await this.prisma.parts.update({
        where: {
          id: id,
        },
        data: {
          partName,
          partNo,
          entity: {
            connect: {
              id: entity,
            },
          },
          description,
          models: {
            connect: models.map((model: any) => ({ id: model.id })),
          },
        },
      });
      return updateParts;
    } else {
      throw new NotFoundException();
    }
  }

  async deletePart(id: string) {
    const PartData = await this.prisma.parts.findUnique({
      where: {
        id: id,
      },
    });
    if (PartData) {
      const deletedPart = await this.prisma.parts.delete({
        where: {
          id: id,
        },
      });
      ////console.log(deletedLocation.id);
      return PartData.id;
      ////console.log(deletedLocation.id);
      return PartData.id;
    } else {
      throw new NotFoundException();
    }
  }

  async importParts(file, user: any, res) {
    const fs = require('fs');
    const XLSX = require('xlsx');
    const fileContent = fs.readFileSync(file.path);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet,{header : 1});
    let firstIteration = true;
    const description = '';
    let failedParts = [['Part No.','Part Name','Department','Models','Reason']];
    const headers = Object.keys(failedParts[0]);

    mainLoop : for (const rowData of excelData) {
      let modelIds = [];
      if(firstIteration){
        firstIteration = false;
        continue;
      }
      const partNo = rowData[0].toString();
      const partName = rowData[1]
      
      const entityName = rowData[2]
      const entity = await this.getEntityId(entityName)
      if(entity === null){
        rowData.push('Department Does Not Exist');
        failedParts.push(rowData);
        continue;
      }
      
      const modelName = rowData[3].split(',');
      for(const model of modelName){
        const modelIdExist = await this.getModelId(model)
        if(modelIdExist === null){
          rowData.push('Model ' + model + ' Does Not Exist');
          failedParts.push(rowData);
          continue mainLoop;
        }
        modelIds.push(modelIdExist)
      }

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const createdPart1=await this.prisma.parts.findFirst({
        where:{
          partNo:partNo
        }
      })
      if(createdPart1){
        rowData.push('Part No. Already Exists');
        failedParts.push(rowData);
        continue;
      }
      else{
        const createdPart = await this.prisma.parts.create({
          data: {
            partNo,
            partName,
            description,
            organization: {
              connect: {
                id: activeUser.organizationId,
              },
            },
            entity: {
              connect: {
                id: entity,
              },
            },
            models: {
              connect: modelIds.map((model: any) => ({ id: model.id })),
            },
          },
          include: {
            models: true,
          },
        });
      }
    }
    if(failedParts.length > 1){
      return res.json({ success: true, failedParts });
    }
    return res.sendStatus(200);
  }

  async getModelId(modelName) {
    try {
      const model = await this.prisma.models.findFirst({
        where: {
          modelName: {
            contains: modelName,
            mode: 'insensitive',
          }
        }
      });
      if(model !== null)
          return model;
        else
          return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getEntityId(entityName) {
    try {
      const entity = await this.prisma.entity.findFirst({
        where: {
          entityName: {
            contains: entityName,
            mode: 'insensitive',
          }
        }
      });
      if(entity !== null)
          return entity.id;
        else
          return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
