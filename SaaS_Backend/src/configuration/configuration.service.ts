import { includeObj } from './../utils/constants';
import { ObjectId } from 'bson';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  ConfigurationSchema,
  Configuration,
} from './schema/configuration.schema';
import { npdConfigSchema, npdConfig } from './schema/departmentActivity.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createdBy } from 'src/utils/helper';
import { Logger } from 'winston';

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Configuration.name)
    private configModel: Model<Configuration>,
    @InjectModel(npdConfig.name)
    private npdConfig: Model<npdConfig>,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async create(data, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const result = await this.configModel.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });

      this.logger.log(
        ` POST /api/configuration/create for ${data} successful`,
        '',
      );
      return result;
    } catch (err) {}
  }

  async updateConfig(id, data, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const updateData = await this.configModel.findByIdAndUpdate(id, {
        ...data,
        updatedBy: activeUser.id,
      });
      return updateData;
    } catch (err) {}
  }

  async deleteData(id, user) {
    try {
      const deleteData = await this.configModel.findByIdAndDelete(id);
    } catch (err) {}
  }

  async getAll(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const data = await this.configModel.find({
        organizationId: activeUser.organizationId,
      });

      let finalData = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        let apData = [...item?.pm];
        const approverData = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: apData },
          },
        });
        finalData.push({
          ...item.toObject(),
          pmUserData: approverData,
        });
      }
      return finalData;
    } catch (err) {}
  }

  async getAllUserForConfig(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.prisma.user.findMany({
        where: { organizationId: activeUser.organizationId },
        // select: { id: true, firstname: true, username: true, email: true },
      });
      return result;
    } catch (err) {}
  }

  async getAllDept(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const entityType = await this.prisma.entityType.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          name: { contains: 'Department', mode: 'insensitive' },
        },
      });
      console.log('entitytype', entityType);
      const entity = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          entityTypeId: entityType?.id,
        },
        select: { id: true, entityName: true },
      });
      console.log('entity', entity);

      this.logger.log(
        ` GET /api/configuration/getAllDept successful`,
        'Cara-controller',
      );
      return entity;
    } catch (err) {
      this.logger.error(` GET /api/configuration/getAllDept failed ${err}`, '');
    }
  }
  async getAllCustomer(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const entityType = await this.prisma.entityType.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          name: { contains: 'Customer', mode: 'insensitive' },
        },
      });
      const entity = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          entityTypeId: entityType?.id,
        },
        select: { id: true, entityName: true },
      });
      this.logger.log(
        ` GET /api/configuration/getAllCustomer successful`,
        'Cara-controller',
      );
      return entity;
    } catch (err) {
      this.logger.log(
        ` GET /api/configuration/getAllCustomer failed`,
        'Cara-controller',
      );
    }
  }

  async getAllUserByDept(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const entityData = await this.prisma.user.findMany({
        where: { organizationId: activeUser.organizationId, entityId: id },
        select: { id: true, username: true, firstname: true, email: true },
      });
      return entityData;
    } catch (err) {}
  }

  async getAllDeptFromConfig(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      let npdConfigData: any = await this.npdConfig.find({
        organizationId: activeUser.organizationId,
      });

      const entityDataIds = npdConfigData.flatMap((item) => item.deptId);
      const entityData = await this.prisma.entity.findMany({
        where: {
          id: { in: entityDataIds },
          organizationId: activeUser.organizationId,
        },
      });
      npdConfigData = npdConfigData.map((value) => {
        let entityFindData = entityData.find(
          (item) => item.id === value.deptId,
        );
        return {
          entityName: entityFindData.entityName,
          entityId: value?.deptId,
          pic: value?.pic,
          npdConfigId: value?._id?.toString(),
        };
      });
      return npdConfigData;
    } catch (err) {}
  }

  async createNpdConfig(user, data) {
    // try {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    const createdData = await this.npdConfig.create({
      ...data,
      organizationId: activeUser.organizationId,
      createdBy: activeUser.id,
    });
    return createdData;
    // } catch (err) {}
  }

  async updateNpdConfig(user, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const updateData = await this.npdConfig.findByIdAndUpdate(id, {
        ...data,
        updatedBy: activeUser.id,
      });

      return updateData;
    } catch (err) {}
  }

  async getNpdConfigById(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const data = await this.npdConfig.findById(id);
      return data;
    } catch (err) {}
  }

  async getNpdConfigByDpt(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const data = await this.npdConfig.findOne({ deptId: id });
      let apData = [...data?.pic];
      const approverData = await this.prisma.user.findMany({
        where: {
          organizationId: activeUser.organizationId,
          id: { in: apData },
        },
      });
      let dataFinal: any = {
        _id: data?._id,
        organizationId: data?.organizationId,
        deptId: data?.deptId,
        pic: approverData,
        reviewers: data?.reviewers,
        approvers: data?.approvers,
        notification: data?.notification,
        escalationList: data?.escalationList,
        activity: data?.activity,
        createdBy: data?.createdBy,
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
        __v: 0,
      };
      return dataFinal;
    } catch (err) {}
  }

  async getAllNpdConfig(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      let data: any = await this.npdConfig.find({
        organizationId: activeUser.organizationId,
      });

      let finalData = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        let dpeIdData = await this.prisma.entity.findFirst({
          where: { id: item.deptId },
        });

        let reData = [...item?.reviewers];
        const reviewersData = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: reData },
          },
        });

        let apData = [...item?.approvers];
        const approverData = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: apData },
          },
        });

        let piData = [...item?.pic];
        const picData = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: piData },
          },
        });

        let notiData = [...item?.notification];
        const notificationData = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: notiData },
          },
        });

        let escalationData = [...item?.escalationList];
        const escalationListData = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: escalationData },
          },
        });

        finalData.push({
          ...item.toObject(),
          escalationListData: escalationListData,
          notificationData: notificationData,
          picData: picData,
          approverData: approverData,
          reviewersData: reviewersData,
          dptData: dpeIdData?.entityName,
        });
      }
      return finalData;
    } catch (err) {}
  }

  async getDptAndPicUsersConfig(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      let data: any = await this.npdConfig.find({
        organizationId: activeUser.organizationId,
      });

      let finalData = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        let piData = [...item?.pic];
        const picData = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: piData },
          },
        });

        let dpeIdData = await this.prisma.entity.findFirst({
          where: { id: item.deptId },
        });

        finalData.push({
          _id: item._id,
          picData: picData,
          dptData: dpeIdData,
        });
      }
      return finalData;
    } catch (err) {}
  }

  async getAllNpdGnatt(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const data = await this.npdConfig.find({
        organizationId: activeUser.organizationId,
      });
      return data;
    } catch (err) {}
  }

  async getAllNpdDeptGnatt(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const data = await this.npdConfig
        .find({
          organizationId: activeUser.organizationId,
        })
        .select('deptId');
      return data;
    } catch (err) {}
  }

  async uploadsAttachment(files: any, data) {
    try {
      //file,req.query.realm.toLowerCase()
      const documentLinks = [];
      const realmName = data.realm.toLowerCase();

      for (let file of files) {
        const documentLink = `${process.env.SERVER_IP}/${realmName}/npd/${file.filename}`;
        documentLinks.push({ documentLink, fileName: file.originalname });
      }
      // const path = file.path;
      return documentLinks;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async addsingleFile(file, user) {
    const realmName = user.realm.toLowerCase();
    const documentLink = `${process.env.SERVER_IP}/${realmName}/npd/${file.filename}`;
    return {
      documentLink,
      url: documentLink,
      fileName: file.originalname,
    };
  }
}
