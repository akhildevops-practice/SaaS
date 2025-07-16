import {
  CACHE_TTL_METADATA,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  kpiReportTemplate,
  kpiReportTemplateDocument,
} from './schema/kpi-report-template.schema';
import {
  kpiReportCategory,
  kpiReportCategoryDocument,
} from './schema/kpi-report-category.schema';
import {
  kpiReportInstance,
  kpiReportInstanceDocument,
} from './schema/kpi-report-instance.schema';
import { KRA } from 'src/kra/schema/kra.schema';

import { PrismaService, MySQLPrismaService } from 'src/prisma.service';
import { ObjectId } from 'bson';
//import { concat, ObjectUnsubscribedError, range } from 'rxjs';
import { KpiDefinitionService } from 'src/kpi-definition/kpi-definition.service';
import { UserService } from 'src/user/user.service';
import { ConnectedAppsService } from 'src/connected-apps/connected-apps.service';
import { KraService } from 'src/kra/kra.service';
import { JSONValue } from 'prisma';

import { KraController } from 'src/kra/kra.controller';
import { roles } from 'src/utils/roles.global';
import { TransformStreamDefaultController } from 'node:stream/web';
import * as sgMail from '@sendgrid/mail';
// import { Kpi, kpiDocument } from './schema/kpi.schema';
import { Kpi, kpiDocument } from 'src/kpi-definition/schema/kpi.schema';
import axios from 'axios';
import { organizationGoal } from 'src/objective/schema/organizationGoal.schema';

import { Logger } from 'winston';
import { Prisma } from '@prisma/client';
import { objectiveMaster } from 'src/objective/schema/objectiveMaster.schema';
import { JsonValue } from '@prisma/client/runtime/library';
// import auditTrial from '../watcher/changesStream';
import moment from 'moment';
sgMail.setApiKey(process.env.SMTP_PASSWORD);

@Injectable()
export class KpiReportService {
  constructor(
    @InjectModel(kpiReportTemplate.name)
    private readonly kpiReportTemplateModel: Model<kpiReportTemplateDocument>,
    @InjectModel(kpiReportCategory.name)
    private readonly kpiReportCategoryModel: Model<kpiReportCategoryDocument>,
    @InjectModel(kpiReportInstance.name)
    private readonly kpiReportInstanceModel: Model<kpiReportInstanceDocument>,
    @InjectModel(KRA.name)
    private readonly KRAModel: Model<KRA>,
    @InjectModel(organizationGoal.name)
    private orgObjective: Model<organizationGoal>,
    @InjectModel(objectiveMaster.name)
    private objectiveMaster: Model<objectiveMaster>,

    @InjectModel(Kpi.name) private KpiModel: Model<kpiDocument>,
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
    private mySQLPrisma: MySQLPrismaService,
    private readonly KpiDefinitionService: KpiDefinitionService,
    private readonly kraService: KraService,
    private readonly connectedAppservice: ConnectedAppsService,
    private readonly userService: UserService,
  ) {}
  //this api will create a report template where a report designer can design his report by selected filters,categories and kpis
  //this api will set the status as active to be used for generating the report
  async createKpiReportTemplate(userid, data, randomNumber) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      const {
        kpiReportTemplateName,
        location,
        active,
        sourceId,
        businessUnitFilter,
        entityFilter,
        userFilter,
        reportEditors,
        reportFrequency,
        readersLevel,
        readers,
        emailShareList,
        schedule,
      } = data;
      const result = await this.kpiReportTemplateModel.create({
        kpiReportTemplateName,
        location,
        active,
        sourceId,
        businessUnitFilter,
        entityFilter,
        userFilter,
        reportEditors,
        reportFrequency,
        schedule,
        readersLevel,
        readers,
        emailShareList,
        organization: activeuser.organizationId,
        createdBy: activeuser.id,
      });
      this.logger.log(
        `trace id = ${randomNumber} POST /api/kpi-report/createKpiReportTemplate for ${data} successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/kpi-report/createKpiReportTemplate for ${data} failed`,
        '',
      );
    }
  }
  //this api will set the status as inactive but the data of the template will be saved for future reference
  async saveKpiReportTemplate(userid, data, randomNumber) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      const {
        kpiReportTemplateName,
        location,
        sourceId,
        businessUnitFilter,
        entityFilter,
        userFilter,
        reportEditors,
        reportFrequency,
        schedule,
        readers,
        readersLevel,
        emailShareList,
        kpiReportCategoryId,
      } = data;
      const result = await this.kpiReportTemplateModel.create({
        kpiReportTemplateName,
        location,
        active: false,
        sourceId,
        businessUnitFilter,
        entityFilter,
        userFilter,
        reportEditors,
        reportFrequency,
        schedule,
        readersLevel,
        readers,
        emailShareList,
        kpiReportCategoryId,
        organization: activeuser.organizationId,
        createdBy: activeuser.id,
      });
      this.logger.log(
        `trace id = ${randomNumber} POST /api/kpi-report/saveKpiReportTemplate successful for ${data}`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} POST /api/kpi-report/saveKpiReportTemplate failed for ${data}`,
        '',
      );
    }
  }
  //this api will return the selected template
  //parameter-id of the template
  async getSelectedKpiReportTemplate(id) {
    try {
      const result = await this.kpiReportTemplateModel.findById(id);
      const locationName = await this.prisma.location.findFirst({
        where: {
          id: result.location,
        },
        select: {
          locationName: true,
        },
      });
      const entity = await this.prisma.entity.findFirst({
        where: {
          id: result.entityFilter,
        },
        select: {
          entityName: true,
        },
      });
      const creator = await this.prisma.user.findFirst({
        where: { id: result.createdBy },
      });
      //////////////console.log(creator.username);
      this.logger.log(
        ` /api/kpi-report/getSelectedKpiReportTemplate/${id} successful`,
        '',
      );
      return {
        result,
        creatorUserName: creator.username,
        location: locationName.locationName,
        entity: entity.entityName,
      };
    } catch {
      this.logger.log(
        ` /api/kpi-report/getSelectedKpiReportTemplate/${id} failed`,
        '',
      );
    }
  }
  //this api will return all the report templates of the organization of the logged in user
  async getAllKpiReportTemplates(userid, query, randomNumber) {
    try {
      const { selectedLoction, selectedEntity, skip, limit } = query;

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      let whereCondition: any = { organization: activeuser.organizationId };
      if (selectedEntity !== undefined && selectedEntity !== 'undefined') {
        const decodedEntity = JSON.parse(selectedEntity);
        if (decodedEntity.length > 0)
          whereCondition = {
            ...whereCondition,
            entityFilter: { $in: decodedEntity },
          };
      }
      if (selectedLoction !== undefined && selectedLoction !== 'undefined') {
        const decodedLocation = JSON.parse(selectedLoction);
        if (decodedLocation.length > 0)
          whereCondition = {
            ...whereCondition,
            location: { $in: decodedLocation },
          };
      }
      // console.log('whereCondition', whereCondition);
      let result;
      let totalCount;
      if (skip !== undefined && limit !== undefined) {
        // Pagination is requested
        result = await this.kpiReportTemplateModel
          .find(whereCondition)
          .skip((skip - 1) * limit)
          .limit(limit);

        totalCount = await this.kpiReportTemplateModel.countDocuments(
          whereCondition,
        );
      } else {
        // Fetch all templates without pagination
        result = await this.kpiReportTemplateModel.find(whereCondition);
        totalCount = result.length; // Total count is the length of the result array
      }
      const finalResult = [];
      for (let value of result) {
        const loc: any = await this.prisma.location.findUnique({
          where: { id: value.location },
          select: { locationName: true },
        });
        const usr = await this.prisma.user.findUnique({
          where: { id: value.createdBy },
          select: { username: true },
        });
        const bunit = await this.prisma.business.findUnique({
          where: { id: value?.businessUnitFilter },
          select: { name: true },
        });
        const ent: any = await this.prisma.entity.findUnique({
          where: {
            id: value.entityFilter,
          },
          select: { entityName: true, id: true },
        });

        let sources = [];
        for (let source of value.sourceId) {
          if (source === 'Manual') {
            const data = {
              id: 'Manual',
              sourceName: 'Manual',
            };
            sources.push(data);
          } else {
            let res = await this.prisma.connectedApps.findFirst({
              where: { id: source },
              select: { id: true, sourceName: true },
            });

            sources.push(res);
          }
        }

        const data = {
          id: value._id,
          active: value.active,
          kpiReportTemplateName: value.kpiReportTemplateName,
          createdBy: usr,
          locationName: loc ? loc : '',
          locationId: loc.id,
          reportFrequency: value.reportFrequency,
          scheudle: value.schedule,
          sources,
          businessUnitFilter: bunit ? bunit : '',
          entityId: ent?.id,
          entityFilter: ent,
          reportEditors: value.reportEditors,
        };
        finalResult.push(data);
      }
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getAllKpiReportTemplates successful`,
        '',
      );
      return { data: finalResult, count: totalCount };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/getAllKpiReportTemplates failed`,
        '',
      );
    }
  }

  async filterData(userId, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
      });

      const result = await this.kpiReportTemplateModel.find({
        organization: activeUser.organizationId,
      });
      const location = [];
      const entity = [];
      for (let value of result) {
        const loc: any = await this.prisma.location.findUnique({
          where: { id: value.location },
          select: { locationName: true, id: true },
        });

        const locIds = location.map((value: any) => value?.id);
        if (!locIds.includes(loc.id)) {
          location.push({ id: loc.id, locationName: loc.locationName });
        }

        const ent: any = await this.prisma.entity.findUnique({
          where: {
            id: value.entityFilter,
          },
          select: { entityName: true, id: true },
        });
        const entIds = entity.map((value: any) => value?.id);
        if (!entIds.includes(ent.id)) {
          entity.push({ id: ent.id, entityName: ent.entityName });
        }
      }
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/filterData successful`,
        '',
      );
      return { location, entity };
    } catch (err) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/filterData failed ${err}`,
        '',
      );
    }
  }
  //this api will update the selected report template
  //paramter-template id
  async updateSelectedKpiReportTemplate(data, id, userid, randomNumber) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      const {
        kpiReportTemplateName,
        location,
        sourceId,
        businessUnitFilter,
        entityFilter,
        active,
        userFilter,
        reportEditors,
        reportFrequency,
        schedule,
        readers,
        readersLevel,
        emailShareList,
        kpiReportCategoryId,
      } = data;
      const result = await this.kpiReportTemplateModel.findByIdAndUpdate(id, {
        kpiReportTemplateName,
        location,
        active,
        sourceId,
        businessUnitFilter,
        entityFilter,
        userFilter,
        reportEditors,
        reportFrequency,
        schedule,
        readers,
        emailShareList,
        readersLevel,
        organization: activeuser.organizationId,
        modifiedBy: activeuser.id,
        kpiReportCategoryId,
      });
      this.logger.log(
        `trace id = ${randomNumber} PUT /api/kpi-report/updateSelectedKpiReportTemplate/${id} successful' started`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} PUT /api/kpi-report/updateSelectedKpiReportTemplate/${id}' failed ${error}`,
        '',
      );
    }
  }

  //this api will return the deleted template
  //parameter-template id
  async deleteSelectedKpiReportTemplate(id, randomNumber) {
    try {
      const result = await this.kpiReportTemplateModel.findByIdAndDelete(id);
      this.logger.log(
        `trace id = ${randomNumber} DELETE /api/kpi-report/deleteSelectedKpiReportTemplate/${id} successful' started`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} DELETE /api/kpi-report/deleteSelectedKpiReportTemplate/${id} failed ${error} started`,
        '',
      );
    }
  }
  //this api will return all the users of the organization along with details of the logged in user
  async getAllUser(userId, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
      include: {
        entity: true,
        location: true,
      },
    });
    try {
      this.logger.debug('started GET /api/kpi-report/getAllUsers');
      const result = await this.prisma.user.findMany({
        where: {
          organizationId: activeUser.organizationId,
          NOT: {
            id: activeUser.id,
          },
        },
      });
      // console.log('result', result);
      const finalData = { activeUser: activeUser, allUsers: result };
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getAllUser successful initiated by ${activeUser.username},entity=${activeUser?.entity?.entityName}, location=${activeUser?.location?.locationName}`,
        '',
      );
      return finalData;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/getAllUser failed ${error} initiated by ${activeUser.username},entity=${activeUser?.entity?.entityName}, location=${activeUser?.location?.locationName} `,
        error.stack || error.message,
        '',
      );
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  //this api will return all the users of the organization
  async getAllUsers(userId: string, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const result = await this.prisma.user.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
      });
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getAll successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getAll failed`,
        '',
      );
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getKpiBySourceArray(value, userid, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
      include: {
        location: true,
        entity: true,
      },
    });
    try {
      this.logger.debug(
        `GET /api/kpi-report/ GET /api/kpi-report/getKpiBySourceArray started for ${value}`,
      );

      const sourceNames = JSON.parse(value);

      let kpilist = [];
      for (let i = 0; i < sourceNames.length; i++) {
        // let result = await this.prisma.kpi.findMany({
        //   where: {
        //     sourceId: sourceNames[i],
        //     organizationId: activeUser.organizationId,
        //   },
        //   select: {
        //     id: true,
        //     sourceId: true,
        //     kpiDescription: true,
        //     kpiName: true,
        //     kpiType: true,
        //     uom: true,
        //     kpiTargetType: true,
        //   },
        // });
        let result = await this.KpiModel.find({
          // sourceId: source === 'Manual' ? null : source,
          sourceId: sourceNames[i],
          organizationId: activeUser.organizationId,
        }).select(
          'sourceId kpiDescription kpiName kpiType uom kpiTargetType kpiTarget displayType',
        );
        kpilist.push(...result);
      }
      this.logger.debug(
        ` GET /api/kpi-report/getKpiBySourceArray fetched kpis ${kpilist}`,
      );
      kpilist = kpilist.map((value) => {
        return {
          sourceId: value.sourceId,
          kpiDescription: value.kpiDescription,
          kpiName: value.kpiName,
          kpiType: value.kpiType,
          uom: value.uom,
          kpiTargetType: value.kpiTargetType,
          kpiTarget: value.kpiTarget,
          id: value._id,
          displayType: value.displayType,
        };
      });
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getKpiBySourceArray or ${value} successful initated by ${activeUser?.username} unit=${activeUser?.location?.locationName} entity=${activeUser?.entity?.entityName}`,
        '',
      );
      return kpilist;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getKpiBySourceArray or ${value} failed ${error} initated by ${activeUser?.username} unit=${activeUser?.location?.locationName} entity=${activeUser?.entity?.entityName}`,
        '',
      );
    }
  }
  async getAllKRA(userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });

    try {
      const result = await this.KRAModel.find({
        OrganizationId: activeUser.organizationId,
      });

      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  //this api will create a new category under the report template being designed
  async createKpiReportCategory(data, randomNumber) {
    try {
      const {
        kpiReportCategoryName,
        kraId,
        kpiReportTemplateId,
        kpiInfo,
        columnsArray,
      } = data;
      let finaldata = [];
      for (let value of kpiInfo) {
        // console.log('1');
        const kpidata = await this.KpiDefinitionService.getSelectedKpi(
          value.kpiId,
        );
        // console.log('2');

        value.minimumTarget = columnsArray.includes('minimumTarget')
          ? value.minimumTarget
          : null;
        //console.log('3');

        value.kpiTarget = columnsArray.includes('kpiTarget')
          ? value.kpiTarget
          : null;
        //console.log('4');

        value.weightage = columnsArray.includes('weightage')
          ? value.weightage
          : null;

        value.kpiName = kpidata.kpiName;
        value.kpiDescription = kpidata.kpiDescription;
        value.kpiUOM = kpidata.uom;
        value.kpiTargetType = kpidata.kpiTargetType;
        value.displayType = kpidata.displayType;
        finaldata.push(value);
      }
      //console.log('5');

      const result = await this.kpiReportCategoryModel.create({
        kpiReportCategoryName,
        kpiReportTemplateId,
        kpiInfo: finaldata,
        columnsArray,
        kraId,
      });
      // console.log('6');
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/createKpiReportCategory or ${data} successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/createKpiReportCategory or ${data} failed ${error}`,
        '',
      );
    }
  }

  //this api will return the selected category
  //parameter-id
  async getCategoryById(id) {
    try {
      const result = await this.kpiReportCategoryModel.findById(id);
      this.logger.log(
        ` GET /api/kpi-report/getCategorybyId/${id} successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.log(` GET /api/kpi-report/getCategorybyId/${id} failed`, '');
    }
  }

  //this api will return all the category of the selected template
  //paramter-template id
  async getAllCategory(id) {
    try {
      const result = await this.kpiReportCategoryModel.find({
        kpiReportTemplateId: id,
      });
      // console.log('categoryresult', result);
      this.logger.log(
        `GET /api/kpi-report/getAllCategory/${id} successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `GET /api/kpi-report/getAllCategory/${id} failed ${error}`,
        '',
      );
    }
  }
  //this api will delete selected category
  //parameter-category id
  async deleteCategoryById(id, randomNumber) {
    try {
      const result = await this.kpiReportCategoryModel.findByIdAndDelete({
        _id: new ObjectId(id),
      });
      this.logger.log(
        `trace id = ${randomNumber} DELETE /api/kpi-report/deleteCategoryById/${id} successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} DELETE /api/kpi-report/deleteCategoryById/${id} failed ${error}`,
        '',
      );
    }
  }
  //this api will delete all categories of the selected template
  //parameter-template id
  async deleteAllCategoryOfTemplate(id) {
    try {
      const result = await this.kpiReportCategoryModel.deleteMany({
        kpiReportTemplateId: id,
      });
      this.logger.log(
        ` DELETE /api/kpi-report/deleteAllCategoryOfTemplate/${id} successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.log(
        ` DELETE /api/kpi-report/deleteAllCategoryOfTemplate/${id} failed`,
        '',
      );
      return error;
    }
  }
  async updateCategoryById(data, id, userid, randomNumber) {
    try {
      const { kpiReportCategoryName, kpiInfo, columnsArray, kraId } = data;
      let finaldata = [];
      for (let i of kpiInfo) {
        let res = {
          kpiId: i.kpiId,
          kpiName: i.kpiName,
          kpiDescription: i.kpiDescription,
          kpiUOM: i.kpiUOM,
          kpiTargetType: i.kpiTargetType,
          minimumTarget: i.minimumTarget,
          kpiTarget: i.kpiTarget,
          weightage: i.weightage,
        };

        finaldata.push(res);
      }

      const result = await this.kpiReportCategoryModel.findByIdAndUpdate(id, {
        kpiReportCategoryName: kpiReportCategoryName,
        kpiInfo: finaldata,
        columnsArray,
        kraId,
      });
      this.logger.log(
        `trace id = ${randomNumber} PUT /api/kpi-report/updateCategoryById/${id} successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} PUT /api/kpi-report/updateCategoryById/${id} failed ${error}`,
        '',
      );
    }
  }

  //this api copies all the kpi data of each category in a reportinstance to postgresql(prisma)
  // async writeToKpiDetailTable(id, userid) {
  //   //1.get the active user for org id
  //   const activeuser = await this.prisma.user.findFirst({
  //     where: { kcId: userid },
  //   });
  //   // console.log('write to detail type called');
  //   const repinstancedata: any = await this.getSelectedReportInstance(id);
  //   // console.log('repinstancedata', repinstancedata);
  //   let filterdata;
  //   if (
  //     repinstancedata.tempdata !== '' &&
  //     repinstancedata.kpiReportCategoryId
  //   ) {
  //     filterdata = repinstancedata.tempData;
  //   } else {
  //     filterdata = '';
  //   }

  //   for (let i = 0; i < repinstancedata.result.catInfo.length; i++) {
  //     for (
  //       let j = 0;
  //       j < repinstancedata.result.catInfo[i].kpiInfo.length;
  //       j++
  //     ) {
  //       var cid = repinstancedata.result.catInfo[i].kpiReportCategoryId;
  //       //// //////////////console.log('kraid', repinstancedata.result.catInfo[i].kraId);
  //       var kraid = repinstancedata.result.catInfo[i].kraId
  //         ? repinstancedata.result.catInfo[i].kraId
  //         : repinstancedata.result.catInfo[i].kpiReportCategoryId;
  //       ////////////////console.log('kraid', repinstancedata.result.catInfo[i].kraId);
  //       var per = null;
  //       var variance = null;
  //       if (
  //         repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType ===
  //         'Increase'
  //       ) {
  //         console.log('inside increase');
  //         per =
  //           100 *
  //           (repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue /
  //             repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget);
  //         variance =
  //           repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget &&
  //           repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
  //             ? -(
  //                 parseFloat(
  //                   repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
  //                 ) -
  //                 parseFloat(
  //                   repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
  //                 )
  //               )
  //             : null;
  //       } else if (
  //         repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType ===
  //         'Decrease'
  //       ) {
  //         console.log('inside decrease');
  //         per =
  //           100 -
  //           100 *
  //             (Math.abs(
  //               repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget -
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
  //             ) /
  //               repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget);
  //         variance =
  //           repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget &&
  //           repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
  //             ? parseFloat(
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
  //               ) -
  //               parseFloat(
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
  //               )
  //             : null;
  //       } else if (
  //         repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType ===
  //         'Maintain'
  //       ) {
  //         per =
  //           100 -
  //           100 *
  //             (Math.abs(
  //               repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget -
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
  //             ) /
  //               repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget);
  //         variance =
  //           parseFloat(repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget) -
  //           parseFloat(repinstancedata.result.catInfo[i].kpiInfo[j]?.kpiValue);
  //       } else if (
  //         repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType === 'Range'
  //       ) {
  //         console.log('inside range type');
  //         let kpiValue = parseFloat(
  //           repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
  //         );
  //         let kpiTarget = parseFloat(
  //           repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
  //         );
  //         let minimumTarget = parseFloat(
  //           repinstancedata.result.catInfo[i].kpiInfo[j].minimumTarget,
  //         );
  //         let midrange = (kpiTarget + minimumTarget) / 2;
  //         console.log(
  //           'repinstancedata.result.catInfo[i].kpiInfo[j].minimumTarget',
  //         );
  //         //eficiency if kpivalue is greater than kpiTarget
  //         if (kpiValue > kpiTarget) {
  //           console.log('inside kpivalue>kpitarget');

  //           variance = -(
  //             parseFloat(
  //               repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
  //             ) -
  //             parseFloat(repinstancedata.result.catInfo[i].kpiInfo[j]?.kpiValue)
  //           );
  //           per =
  //             100 -
  //             Math.abs(variance) /
  //               repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget;
  //         }

  //         //efficiency calculation if value is less than min target
  //         else if (kpiValue < minimumTarget) {
  //           console.log('inside kpivalue<mintarget');

  //           variance = -(
  //             parseFloat(
  //               repinstancedata.result.catInfo[i].kpiInfo[j]?.minimumTarget,
  //             ) -
  //             parseFloat(repinstancedata.result.catInfo[i].kpiInfo[j]?.kpiValue)
  //           );
  //           per = 100 - Math.abs(variance) / minimumTarget;
  //         } else if (kpiValue >= minimumTarget && kpiValue <= kpiTarget) {
  //           console.log('inside within range');
  //           per = 100;
  //           variance = 0;
  //         }
  //       }

  //       let result = await this.mySQLPrisma.reportKpiDataNewData.create({
  //         data: {
  //           //     kpiTemplateId:

  //           kpiTemplateId:
  //             repinstancedata.result?.kpiReportTemplateId?.toString()
  //               ? repinstancedata.result?.kpiReportTemplateId?.toString()
  //               : '',
  //           kpiCategoryId: cid.toString(),
  //           kraId: kraid?.toString(),
  //           kpiId: repinstancedata.result.catInfo[i].kpiInfo[j].kpiId,
  //           kpiTargetType:
  //             repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType,
  //           kpiValue: repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
  //             ? parseFloat(
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
  //               )
  //             : null,
  //           kpiComments:
  //             repinstancedata.result.catInfo[i].kpiInfo[j].kpiComments,
  //           minimumTarget: repinstancedata.result.catInfo[i].kpiInfo[j]
  //             .minimumTarget
  //             ? parseFloat(
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].minimumTarget,
  //               )
  //             : null,
  //           target: repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget
  //             ? parseFloat(
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
  //               )
  //             : null,
  //           kpiWeightage: repinstancedata.result.catInfo[i].kpiInfo[j].weightage
  //             ? parseFloat(
  //                 repinstancedata.result.catInfo[i].kpiInfo[j].weightage,
  //               )
  //             : null,
  //           kpiVariance: variance,
  //           percentage: per,
  //           kpibusiness: filterdata?.result?.businessUnitFilter
  //             ? filterdata?.result?.businessUnitFilter
  //             : '',
  //           kpiEntity: repinstancedata.result.entity,
  //           kpiLocation: repinstancedata.result.location,
  //           kpiOrganization: activeuser.organizationId,
  //           kpiStatus: 'WIP',
  //           reportDate: new Date(),
  //           reportFor: repinstancedata.result.runDate,
  //           reportYear: repinstancedata.result.yearFor,
  //         },
  //       });
  //       // //////////////console.log('result', result);
  //     }
  //   }
  // }
  //this api has new field called operational target(hindalco) and this value will be used for calculations
  async writeToKpiDetailTable(id, userid, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: { location: true, entity: true },
    });
    try {
      //1.get the active user for org id

      // console.log('write to detail type called');
      const repinstancedata: any = await this.getSelectedReportInstance(
        id,
        userid,
      );
      this.logger.debug(
        `trace id = ${randomNumber} POST /api/kpi-report/writeToKpiDetailTable/${id} started and report instance fetched ${repinstancedata}`,
      );
      // console.log('repinstancedata', repinstancedata);
      let filterdata;
      if (
        repinstancedata.tempdata !== '' &&
        repinstancedata.kpiReportCategoryId
      ) {
        filterdata = repinstancedata.tempData;
      } else {
        filterdata = '';
      }

      for (let i = 0; i < repinstancedata.result.catInfo.length; i++) {
        for (
          let j = 0;
          j < repinstancedata.result.catInfo[i].kpiInfo.length;
          j++
        ) {
          this.logger.debug(
            `trace id = ${randomNumber} POST /api/kpi-report/writeToKpiDetailTable/${id} creating records for ${repinstancedata.result.catInfo[i].kpiInfo[j]}`,
          );
          var cid = repinstancedata.result.catInfo[i].kpiReportCategoryId;
          //// //////////////console.log('kraid', repinstancedata.result.catInfo[i].kraId);
          var kraid = repinstancedata.result.catInfo[i].kraId
            ? repinstancedata.result.catInfo[i].kraId
            : repinstancedata.result.catInfo[i].kpiReportCategoryId;
          ////////////////console.log('kraid', repinstancedata.result.catInfo[i].kraId);
          var per = null;
          var variance = null;
          if (
            repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType ===
            'Increase'
          ) {
            // console.log('inside increase');
            let kpiValue =
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue;
            let kpiTarget =
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget;

            // Handle special cases
            if (kpiTarget == 0) {
              if (kpiValue == 0)
                //  {
                per = 0; // Both value and target are zero
              // } else {
              //   per = 0; // Value is non-zero, target is zero (avoiding infinity)
              // }
            } else {
              // Normal case: Calculate the percentage
              per = 100 * (kpiValue / kpiTarget);
            }
            variance =
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget &&
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
                ? -(
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    ) -
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                    )
                  )
                : null;
          } else if (
            repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType ===
            'Decrease'
          ) {
            // console.log('inside decrease');

            variance =
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget &&
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
                ? parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                  ) -
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                  )
                : null;
            // console.log(
            //   ' repin',
            //   repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
            // );
            if (
              parseFloat(
                repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
              ) === 0
            ) {
              // console.log('inside if of target 0');
              per =
                parseFloat(
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                ) !== 0
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                    ) * 100
                  : 100;
            } else {
              per =
                (variance /
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget) *
                100;
            }
          } else if (
            repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType ===
            'Maintain'
          ) {
            per =
              100 *
              (repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue /
                repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget);
            variance =
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget &&
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
                ? -(
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    ) -
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                    )
                  )
                : null;
          } else if (
            repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType ===
            'Range'
          ) {
            // console.log('inside range type');
            let kpiValue = parseFloat(
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
            );
            let kpiTarget = parseFloat(
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
            );
            let kpiOperationalTarget = parseFloat(
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiOperationalTarget,
            );
            let minimumTarget = parseFloat(
              repinstancedata.result.catInfo[i].kpiInfo[j].kpiMinimumTarget,
            );
            // console.log(
            //   'minimumTarget',
            //   parseFloat(
            //     repinstancedata.result.catInfo[i].kpiInfo[j].kpiMinimumTarget,
            //   ),
            // );
            let midrange = (kpiTarget + minimumTarget) / 2;
            // console.log(
            //   'repinstancedata.result.catInfo[i].kpiInfo[j].minimumTarget',
            // );
            //eficiency if kpivalue is greater than kpiTarget
            if (kpiValue > kpiTarget) {
              // console.log('inside kpivalue>kpitarget');

              variance = -(
                parseFloat(
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                ) -
                parseFloat(
                  repinstancedata.result.catInfo[i].kpiInfo[j]?.kpiValue,
                )
              );
              per =
                100 -
                Math.abs(variance) /
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget;
            }

            //efficiency calculation if value is less than min target
            else if (kpiValue < minimumTarget) {
              // console.log('inside kpivalue<mintarget');

              variance = -(
                parseFloat(
                  repinstancedata.result.catInfo[i].kpiInfo[j]
                    ?.kpiMinimumTarget,
                ) -
                parseFloat(
                  repinstancedata.result.catInfo[i].kpiInfo[j]?.kpiValue,
                )
              );
              per = 100 - Math.abs(variance) / minimumTarget;
            } else if (kpiValue >= minimumTarget && kpiValue <= kpiTarget) {
              // console.log('inside within range');
              per = 100;
              variance = 0;
            }
          }
          const kpidata = await this.KpiModel.findById(
            repinstancedata.result.catInfo[i].kpiInfo[j].kpiId,
          );
          // console.log('kpidata', kpidata);
          this.logger.debug(
            `checking for existence ${repinstancedata.result.catInfo[i].kpiInfo[j]} for report ${id}`,
          );
          // if report instance is being updated check if the entry for this kpiId, entityId and locationId, exists if so update else create
          let kpicheck = await this.mySQLPrisma.reportKpiDataNewData.findFirst({
            where: {
              kpiReportId: id,
              kpiId: repinstancedata.result.catInfo[i].kpiInfo[j].kpiId,
            },
          });
          //  console.log('kpi check', kpicheck);
          if (kpicheck) {
            // console.log('inside if');
            this.logger.debug(
              `${repinstancedata.result.catInfo[i].kpiInfo[j]} exists and updating record`,
            );
            let result = await this.mySQLPrisma.reportKpiDataNewData.update({
              where: {
                id: kpicheck.id,
              },
              data: {
                //     kpiTemplateId:
                // kpiReportId: id,
                // kpiTemplateId:
                //   repinstancedata.result?.kpiReportTemplateId?.toString()
                //     ? repinstancedata.result?.kpiReportTemplateId?.toString()
                //     : '',
                // kpiCategoryId: cid.toString(),
                // kraId: kraid?.toString(),
                // kpiId: repinstancedata.result.catInfo[i].kpiInfo[j].kpiId,
                // kpiTargetType:
                //   repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType,
                kpiValue: repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                    )
                  : null,
                kpiComments:
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiComments,

                target: repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    )
                  : null,
                minimumTarget: repinstancedata.result.catInfo[i].kpiInfo[j]
                  .kpiMinimumTarget
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j]
                        .kpiMinimumTarget,
                    )
                  : null,
                operationalTarget: repinstancedata.result.catInfo[i].kpiInfo[j]
                  .kpiOperationalTarget
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j]
                        .kpiOperationalTarget,
                    )
                  : null,
                kpiWeightage: repinstancedata.result.catInfo[i].kpiInfo[j]
                  .weightage
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].weightage,
                    )
                  : null,
                kpiVariance: variance,
                percentage: per,
                // kpibusiness: filterdata?.result?.businessUnitFilter
                //   ? filterdata?.result?.businessUnitFilter
                //   : '',
                // kpiEntity: repinstancedata.result.entity,
                // kpiLocation: repinstancedata.result.location,
                // kpiOrganization: activeuser.organizationId,
                // objectiveId: kpidata.objectiveId
                //   ? JSON.stringify(kpidata.objectiveId)
                //   : null,
                // kpiStatus: 'WIP',
                reportDate: new Date(),
                reportFor: repinstancedata.result.runDate,
                reportYear: repinstancedata.result.yearFor,
              },
            });
            let sumresult = await this.mySQLPrisma.kpiSummary.findFirst({
              where: {
                kpiId: repinstancedata.result.catInfo[i].kpiInfo[j].kpiId,
                kpiMonthYear: kpicheck.reportFor.getMonth(),
                kpiYear: kpicheck.reportFor.getFullYear(),

                kpiEntity:
                  repinstancedata.result.catInfo[i].kpiInfo[j].entityId,
              },
            });
            // console.log('sumresult', sumresult);
            let percentage;
            //compute percentage based on kpitarget type
            //while updating subtract the previous value from summarized data and update the calculations for the new value
            if (kpidata?.kpiTargetType === 'Increase') {
              percentage =
                ((sumresult.monthlySum +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                  ) -
                  kpicheck.kpiValue) /
                  (sumresult.monthlyOperationalTarget +
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    ) -
                    kpicheck.operationalTarget)) *
                100;
            } else if (kpidata?.kpiTargetType === 'Decrease') {
              let va =
                sumresult.monthlyOperationalTarget -
                kpicheck.operationalTarget +
                parseFloat(
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                ) -
                (sumresult.monthlySum +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                  ) -
                  kpicheck.kpiValue);
              per =
                100 -
                (Math.abs(va) /
                  (sumresult.monthlyOperationalTarget +
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    ) -
                    kpicheck.target)) *
                  100;
            } else if (kpidata[i]?.kpiTargetType === 'Maintain') {
              percentage =
                ((sumresult.monthlySum +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                  ) -
                  kpicheck.kpiValue) /
                  (sumresult.monthlyTarget +
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    ) -
                    kpicheck.target)) *
                100;
            } else if (kpidata[i]?.kpiTargetType === 'Range') {
              percentage =
                ((sumresult.monthlySum +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                  ) -
                  kpicheck.kpiValue) /
                  (sumresult.monthlyTarget +
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    ) -
                    kpicheck.target)) *
                100;
            }
            await this.mySQLPrisma.kpiSummary.update({
              where: { id: sumresult.id },
              data: {
                // count: value.count + 1,
                monthlySum:
                  sumresult.monthlySum +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                  ) -
                  kpicheck.kpiValue,
                monthlyAverage:
                  (sumresult.monthlySum +
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                    ) -
                    kpicheck.kpiValue) /
                  sumresult.count,
                monthlyOperationalTarget:
                  sumresult.monthlyOperationalTarget +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j]
                      .kpiOperationalTarget,
                  ) -
                  kpicheck.operationalTarget,
                monthlyTarget:
                  sumresult.monthlyTarget +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                  ) -
                  kpicheck.target,

                monthlyMinimumTarget:
                  sumresult.monthlyMinimumTarget +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j]
                      .kpiMinimumTarget,
                  ) -
                  kpicheck.minimumTarget,
                kpiComments:
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiComments,
                monthlyVariance:
                  sumresult.monthlyTarget +
                  parseFloat(
                    repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                  ) -
                  kpicheck.target -
                  (sumresult.monthlySum +
                    parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                    ) -
                    kpicheck.kpiValue),
                percentage: percentage,
              },
            });
          } else {
            this.logger.debug(
              `${repinstancedata.result.catInfo[i].kpiInfo[j]} creating entry in mysql`,
            );
            let result = await this.mySQLPrisma.reportKpiDataNewData.create({
              data: {
                //     kpiTemplateId:
                kpiReportId: id,
                kpiTemplateId:
                  repinstancedata.result?.kpiReportTemplateId?.toString()
                    ? repinstancedata.result?.kpiReportTemplateId?.toString()
                    : '',
                kpiCategoryId: cid.toString(),
                kraId: kraid?.toString(),
                kpiId: repinstancedata.result.catInfo[i].kpiInfo[j].kpiId,
                kpiTargetType:
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiTargetType,
                kpiValue: repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiValue,
                    )
                  : null,
                kpiComments:
                  repinstancedata.result.catInfo[i].kpiInfo[j].kpiComments,
                minimumTarget: repinstancedata.result.catInfo[i].kpiInfo[j]
                  .kpiMinimumTarget
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j]
                        .kpiMinimumTarget,
                    )
                  : null,
                target: repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].kpiTarget,
                    )
                  : null,
                operationalTarget: repinstancedata.result.catInfo[i].kpiInfo[j]
                  .kpiOperationalTarget
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j]
                        .kpiOperationalTarget,
                    )
                  : null,
                kpiWeightage: repinstancedata.result.catInfo[i].kpiInfo[j]
                  .weightage
                  ? parseFloat(
                      repinstancedata.result.catInfo[i].kpiInfo[j].weightage,
                    )
                  : null,
                kpiVariance: variance,
                percentage: per,
                kpibusiness: filterdata?.result?.businessUnitFilter
                  ? filterdata?.result?.businessUnitFilter
                  : '',
                kpiEntity: repinstancedata.result.entity,
                kpiLocation: repinstancedata.result.location,
                kpiOrganization: activeuser.organizationId,
                objectiveId: kpidata.objectiveId
                  ? JSON.stringify(kpidata.objectiveId)
                  : null,
                kpiStatus: 'WIP',
                reportDate: new Date(),
                reportFor: repinstancedata.result.runDate,
                reportYear: repinstancedata.result.yearFor,
              },
            });
          }
          // //////////////console.log('result', result);
        }
      }
      this.logger.log(
        `trace id = ${randomNumber} POST /api/kpi-report/writeToKpiDetailTable/${id} successful initiated by ${activeuser.username} unit=${activeuser?.location?.locationName} entity=${activeuser?.entity?.entityName}`,
        '',
      );
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/kpi-report/writeToKpiDetailTable/${id} failed ${error}initiated by ${activeuser.username} unit=${activeuser?.location?.locationName} entity=${activeuser?.entity?.entityName}`,
        error?.stack || error?.message,
      );
    }
  }
  async writeIndividualKpiData(data1) {
    try {
      this.logger.debug('Starting writeIndividualKpiData', { input: data1 });

      const oid = new ObjectId(data1.kpiId);
      const kpiInfo = await this.KpiModel.findById(oid);
      this.logger.debug('Fetched KPI Info', { kpiInfo });

      let per = null;
      let variance = null;

      if (kpiInfo.kpiTargetType === 'Increase') {
        this.logger.debug('Target type is Increase');
        per = 100 * (data1.kpiValue / data1.target);
        variance =
          data1.target && data1.kpiValue
            ? parseFloat(data1.kpiValue) - parseFloat(data1.target)
            : null;
      } else if (kpiInfo.kpiTargetType === 'Decrease') {
        this.logger.debug('Target type is Decrease');
        per = 100 * ((data1.target - data1.kpiValue) / data1.target) + 100;
        variance =
          data1.target && data1.kpiValue
            ? parseFloat(data1.target) - parseFloat(data1.kpiValue)
            : null;
      } else if (kpiInfo.kpiTargetType === 'Maintain') {
        this.logger.debug('Target type is Maintain');
        per = 100 * (data1.kpiValue / data1.target);
        variance = parseFloat(data1.kpiValue) - parseFloat(data1?.target);
      }

      this.logger.debug('Computed values', { percentage: per, variance });

      const dataToInsert: any = {
        kpiTemplateId: '',
        kpiCategoryId: '',
        kpiId: data1.kpiId,
        kpiTargetType: kpiInfo.kpiTargetType,
        kpiValue: data1.kpiValue ? parseFloat(data1.kpiValue) : null,
        kpiComments: data1.kpiComments || null,
        minimumTarget: data1.minimumTarget
          ? parseFloat(data1.minimumTarget)
          : null,
        target: data1.target ? parseFloat(data1.target) : null,
        kpiWeightage: data1.weightage ? parseFloat(data1.weightage) : null,
        kpiVariance: variance,
        percentage: per,
        kpiEntity: data1.kpiEntity,
        kpiLocation: data1?.kpiLocation,
        kpiOrganization: data1.kpiOrganization,
        kpiStatus: 'WIP',
        reportDate: data1.kpiReportDate,
      };

      this.logger.debug('Inserting KPI data to DB', { dataToInsert });

      const result = await this.mySQLPrisma.reportKpiDataNewData.create({
        data: dataToInsert,
      });

      this.logger.debug(
        'KPI data insert result POST api/kpi-report/writeIndividualKpiData',
        { result },
      );

      return result;
    } catch (error) {
      this.logger.error(
        'Error in  POST api/kpi-report/writeIndividualKpiData',
        {
          message: error.message,
          stack: error.stack,
          data: data1,
        },
      );
      throw error; // rethrow after logging if needed
    }
  }

  // async updateIndividualKpiData(id, data1, userid) {
  //   // console.log('data', data1);
  //   let kpirowid = await this.mySQLPrisma.reportKpiDataNewData.findFirst({
  //     where: {
  //       kpiReportId: id,
  //       kpiId: data1.kpiId,
  //     },
  //   });
  //   console.log('kpirowid', kpirowid);
  //   if (kpirowid) {
  //     const oid = new ObjectId(data1.kpiId);
  //     const kpiInfo = await this.KpiModel.findById(oid);

  //     var per = null;
  //     var variance = null;
  //     if (kpiInfo.kpiTargetType === 'Increase') {
  //       // console.log('inside if');
  //       per = 100 * (data1.kpiValue / data1.target);
  //       variance =
  //         data1.target && data1.kpiValue
  //           ? parseFloat(data1.kpiValue) - parseFloat(data1.target)
  //           : null;
  //     } else if (kpiInfo.kpiTargetType === 'Decrease') {
  //       // console.log('inside else');
  //       per = 100 * ((data1.target - data1.kpiValue) / data1.target) + 100;
  //       variance =
  //         data1.target && data1.kpiValue
  //           ? parseFloat(data1.target) - parseFloat(data1.kpiValue)
  //           : null;
  //     } else if (kpiInfo.kpiTargetType === 'Maintain') {
  //       // console.log(
  //       //   'vaue of target',
  //       //   data1?.kpiTargetType,
  //       //   typeof data1?.kpiTargetType,
  //       // );
  //       per = 100 * (data1.kpiValue / data1.target);
  //       variance = parseFloat(data1.kpiValue) - parseFloat(data1?.target);
  //     }
  //     //update in kpidetail table

  //     let result = await this.mySQLPrisma.reportKpiDataNewData.update({
  //       where: {
  //         id: kpirowid.id,
  //       },
  //       data: {
  //         kpiTemplateId: '',
  //         kpiReportId: id,
  //         kpiCategoryId: '',
  //         kpiId: data1.kpiId,
  //         kpiTargetType: kpiInfo?.kpiTargetType.toString(),
  //         kpiValue: data1.kpiValue ? parseFloat(data1.kpiValue) : null,
  //         kpiComments: data1.kpiComments,
  //         minimumTarget: data1.minimumTarget
  //           ? parseFloat(data1.minimumTarget)
  //           : null,
  //         target: data1.target ? parseFloat(data1.target) : null,
  //         kpiWeightage: data1.weightage ? parseFloat(data1.weightage) : null,
  //         kpiVariance: variance,
  //         percentage: per,
  //         // kpiEntity: data1.kpiEntity,
  //         // kpiLocation: data1?.kpiLocation,
  //         // kpiOrganization: data1.kpiOrganization,
  //         kpiStatus: 'WIP',
  //         // reportDate: data1.kpiReportDate,
  //       },
  //     });

  //     //update in summary table

  //     let sumResult = await this.mySQLPrisma.kpiSummary.findFirst({
  //       where: {
  //         kpiId: data1.kpiId,
  //         kpiMonthYear: kpirowid.reportFor.getMonth(),
  //         kpiYear: kpirowid.reportFor.getFullYear(),
  //       },
  //     });

  //     // let percentage;
  //     // //compute percentage based on kpitarget type
  //     // if (kpiInfo.kpiTargetType === 'Increase') {
  //     //   per =
  //     //     ((sumResult.monthlySum - kpirowid.kpiValue+data1.kpiValue) /
  //     //       (sumResult.monthlyOperationalTarget +
  //     //         kpi.operationalTarget)) *
  //     //     100;
  //     // } else if (kpidata[i]?.kpiTargetType === 'Decrease') {
  //     //   let va =
  //     //     value.monthlyOperationalTarget +
  //     //     kpidata[i].operationalTarget -
  //     //     (value.monthlySum + kpidata[i].kpiValue);
  //     //   per =
  //     //     100 -
  //     //     (Math.abs(va) /
  //     //       (value.monthlyOperationalTarget +
  //     //         kpidata[i].operationalTarget)) *
  //     //       100;
  //     // } else if (kpidata[i]?.kpiTargetType === 'Maintain') {
  //     //   let va =
  //     //     value.monthlyOperationalTarget +
  //     //     kpidata[i].operationalTarget -
  //     //     (value.monthlySum + kpidata[i].kpiValue);

  //     //   per =
  //     //     100 -
  //     //     (Math.abs(va) /
  //     //       (value.monthlyOperationalTarget +
  //     //         kpidata[i].operationalTarget)) *
  //     //       100;
  //     // }
  //     // await this.mySQLPrisma.kpiSummary.update({
  //     //   where: { id: value.id },
  //     //   data: {
  //     //     count: value.count + 1,
  //     //     monthlySum: value.monthlySum + kpidata[i].kpiValue,
  //     //     monthlyAverage:
  //     //       (value.monthlySum + kpidata[i].kpiValue) /
  //     //       (value.count + 1),
  //     //     monthlyOperationalTarget:
  //     //       value.monthlyOperationalTarget +
  //     //       kpidata[i].operationalTarget,
  //     //     monthlyTarget: value.monthlyTarget + kpidata[i].target,
  //     //     monthlyVariance:
  //     //       value.monthlyOperationalTarget +
  //     //       kpidata[i].operationalTarget -
  //     //       (value.monthlySum + kpidata[i].kpiValue),
  //     //     percentage: per,
  //     //   },
  //     // });

  //     // await this.mySQLPrisma.reportKpiDataNewData.update({
  //     //   where: { id: kpidata[i].id },
  //     //   data: { kpiStatus: 'processed' },
  //     // });
  //   }
  // }
  // async getFiscalQuarter(dateFor: any, yearFor: any) {
  //   const ndate = new Date(dateFor);
  //   let date: any = ndate.toLocaleDateString("en-GB");
  //   let kpimonth = ndate.getMonth();
  //   let year = ndate.getFullYear();
  //   // let adate = new Date(date).getTime();

  //   // console.log("date,month,year", date, kpimonth, year);
  //   let result = await axios.get(
  //     `/api/kpi-report/computefiscalyearquarters/${
  //       selectedFiscalYear ? selectedFiscalYear : yearFor
  //     }`
  //   );
  //   // console.log("result", result);
  //   let quarters = result.data;
  //   //console.log("quarters", quarters);
  //   let period;
  //   // console.log('date inside else while writing', date);
  //   for (let i = 0; i < quarters.length; i++) {
  //     //  //////////////console.log('inside for');
  //     // const dateobj = new Date(date);

  //     let qStartDate = quarters[i].startDate;
  //     //  console.log('qstartdate', qStartDate);
  //     ////////////////console.log(quarters[i].endDate);

  //     let qEndDate = quarters[i].endDate;
  //     //  console.log('qenddate', qEndDate);

  //     let d1 = qStartDate.split("/");
  //     let d2 = qEndDate.split("/");
  //     let c = date.split("/");

  //     let from = new Date(+d1[2], +d1[1] - 1, +d1[0]); // using unary plus to convert string to number
  //     let to = new Date(+d2[2], +d2[1] - 1, +d2[0]);
  //     let check = new Date(+c[2], +c[1] - 1, +c[0]);
  //     // console.log("check,from,to", from, to, check);
  //     if (check >= from && check <= to) {
  //       period = quarters[i].quarterNumber;
  //       // console.log('period inside if', period);
  //     }
  //   }
  //   return period;
  // }

  async createReportInstance(userid, data, randomNumber) {
    try {
      const {
        kpiReportInstanceName,
        kpiReportTemplateId,
        reportStatus,
        catInfo,
        runDate,
        year,
      } = data;

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      const reportData = await this.getSelectedKpiReportTemplate(
        kpiReportTemplateId,
      );
      if (reportData.result.reportEditors.includes(activeuser.id)) {
        let categoryupdate = [];
        for (let i of catInfo) {
          let kpiInfoUpdate = [];
          for (let j of i.kpiInfo) {
            let kpidata = await this.KpiDefinitionService.getSelectedKpi(
              j.kpiId,
            );

            let res = {
              kpiId: j.kpiId,
              kpiTarget: j.kpiTarget,
              kpiTargetType: j.kpiTargetType,
              minimumTarget: kpidata.kpiMinimumTarget,
              kpiValue: j.kpiValue,
              kpiComments: j.kpiComments,
              weightage: j.weightage,
              kpiDescription: kpidata.kpiDescription,
              kpiUOM: kpidata.uom,
              kpiName: kpidata.kpiName,
              displayType: kpidata.displayType,
            };
            kpiInfoUpdate.push(res);
          }
          const data = {
            kpiReportCategoryId: i.kpiReportCategoryId,
            kpiReportCategoryName: i.kpiReportCategoryName,
            columnsArray: i.columnsArray,
            kpiInfo: kpiInfoUpdate,
            kraId: i.kraId,
          };
          categoryupdate.push(data);
        }
        //  //////////////console.log('cat update data', categoryupdate);
        const result = await this.kpiReportInstanceModel.create({
          kpiReportInstanceName,
          kpiReportTemplateId,
          reportStatus,
          year,
          catInfo: categoryupdate,
          reportRunBy: activeuser.username,
          organization: activeuser.organizationId,
          runDate,
          location: reportData.result.location,
          entity: reportData.result.entityFilter,
        });
        this.logger.log(
          `trace id = ${randomNumber} POST /api/kpi-report/createReportInstance successful for ${data}`,
          '',
        );
        return result;
      } else {
        return 'not authorized to edit';
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/kpi-report/createReportInstance failed for ${data}`,
        '',
      );
    }
  }
  async createAdhocReportInstance(user, data, traceId) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: user.user.id },
      include: { location: true, entity: true },
    });

    this.logger.debug(`Trace ID: ${traceId} - Fetched active user`, {
      activeuser,
    });
    try {
      this.logger.debug(
        `Trace ID: ${traceId} - Starting createAdhocReportInstance`,
        { data },
      );

      const {
        kpiReportInstanceName,
        location,
        entity,
        reportStatus,
        catInfo,
        runDate,
        reportFrequency,
        year,
        yearFor,
        semiAnnual,
      } = data;

      const checkunique = await this.kpiReportInstanceModel.find({
        yearFor,
        runDate,
        $and: [{ reportFrequency: { $ne: 'Daily' } }, { reportFrequency }],
        entity: activeuser.entityId,
        organization: activeuser.organizationId,
      });

      this.logger.debug(`Trace ID: ${traceId} - Unique check result`, {
        length: checkunique.length,
      });

      if (checkunique.length <= 0) {
        const categoryupdate = [];

        for (const i of catInfo) {
          const kpiInfoUpdate = [];

          for (const j of i.kpiInfo) {
            const kpidata = await this.KpiDefinitionService.getSelectedKpi(
              j.kpiId,
            );

            kpiInfoUpdate.push({
              kpiId: j.kpiId,
              kpiTarget: j.kpiTarget,
              kpiOperationalTarget: j.kpiOperationalTarget,
              kpiTargetType: j.kpiTargetType,
              kpiMinimumTarget: j.kpiMinimumTarget,
              kpiValue: j.kpiValue,
              kpiComments: j.kpiComments,
              weightage: j.weightage,
              kpiDescription: kpidata.kpiDescription,
              kpiUOM: kpidata.uom,
              kpiName: kpidata.kpiName,
              owner: kpidata.owner,
              displayType: kpidata.displayType,
            });
          }

          categoryupdate.push({
            kpiReportCategoryId: i.kpiReportCategoryId,
            kpiReportCategoryName: i.kpiReportCategoryName,
            columnsArray: i.columnsArray,
            kpiInfo: kpiInfoUpdate,
            kraId: i.kraId,
          });
        }

        const result = await this.kpiReportInstanceModel.create({
          kpiReportInstanceName,
          reportFrequency,
          reportStatus,
          year,
          catInfo: categoryupdate,
          reportRunBy: activeuser.username,
          organization: activeuser.organizationId,
          runDate,
          yearFor,
          semiAnnual,
          location,
          entity,
          updatedAt: new Date(),
        });

        this.logger.log(
          `Trace ID: ${traceId} - KPI Adhoc Report Created Successfully`,
          {
            kpiReportInstanceName,
            runDate,
            organizationId: activeuser.organizationId,
          },
        );

        return result;
      } else {
        this.logger.error(
          `Trace ID: ${traceId} - Duplicate Adhoc Report found initated by ${activeuser?.username} unit=${activeuser.location?.locationName} entity=${activeuser?.entity?.entityName}`,
          {
            runDate,
            reportFrequency,
            entity: activeuser.entityId,
            organization: activeuser.organizationId,
          },
        );

        return new ConflictException({
          status: 409,
          message: 'Duplicate report exists for the given parameters.',
        });
      }
    } catch (error) {
      this.logger.error(
        `Trace ID: ${traceId} - Error in createAdhocReportInstance initated by ${activeuser?.username} unit=${activeuser.location?.locationName} entity=${activeuser?.entity?.entityName}`,
        {
          message: error.message,
          stack: error.stack,
          data,
        },
      );
      throw error;
    }
  }

  async getAdhocReportInstanceForUniqueCheck(user, query, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: user.user.id },
      include: {
        location: true,
        entity: true,
      },
    });
    try {
      // console.log('query', query);
      const checkunique = await this.kpiReportInstanceModel.find({
        yearFor: query.yearFor,
        runDate: query.runDate,
        $and: [
          { reportFrequency: { $ne: 'Daily' } },
          { reportFrequency: query.reportFrequency },
        ],
        entity: activeuser.entityId,
        organization: activeuser.organizationId,
      });
      // console.log('uniquecheck', checkunique);
      if (checkunique.length > 0) {
        return new ConflictException({ status: 409 });
      }
    } catch (error) {
      this.logger.error(
        `Trace ID: ${randomNumber} - Error in getAdhicReportInstanceForUniqueCheck initated by ${activeuser?.username} unit=${activeuser.location?.locationName} entity=${activeuser?.entity?.entityName}`,
        {
          message: error.message,
          stack: error.stack,
          query: query,
        },
      );
      throw error;
    }
  }

  async updateReportInstance(user, data, id, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: user.user.id },
    });
    try {
      // const auditTrail = await auditTrial(
      //   'kpireportinstances',
      //   'KIP',
      //   'KIP Report',
      //   user.user,
      //   activeuser,
      //   randomNumber,
      // );
      const {
        kpiReportInstanceName,
        kpiReportTemplateId,
        reportStatus,
        catInfo,
        runDate,
        year,
      } = data;
      const reportData = await this.getSelectedKpiReportTemplate(
        kpiReportTemplateId,
      );
      if (reportData.result.reportEditors.includes(activeuser.id)) {
        let categoryupdate = [];
        for (let i of catInfo) {
          let kpiInfoUpdate = [];
          for (let j of i.kpiInfo) {
            let kpidata = await this.KpiDefinitionService.getSelectedKpi(
              j.kpiId,
            );

            let res = {
              kpiId: j.kpiId,
              kpiTarget: j.kpiTarget,

              minimumTarget: kpidata.kpiMinimumTarget,
              kpiValue: j.kpiValue,
              kpiTargetType: j.kpiTargetType,
              kpiComments: j.kpiComments,
              weightage: j.weightage,
              kpiDescription: kpidata.kpiDescription,
              kpiUOM: kpidata.uom,
              kpiName: kpidata.kpiName,
              displayType: kpidata.displayType,
            };
            kpiInfoUpdate.push(res);
          }
          const data = {
            kpiReportCategoryId: i.kpiReportCategoryId,
            kpiReportCategoryName: i.kpiReportCategoryName,
            columnsArray: i.columnsArray,
            kpiInfo: kpiInfoUpdate,
            kraId: i.kraId,
          };
          categoryupdate.push(data);
        }
        const result = await this.kpiReportInstanceModel.findByIdAndUpdate(id, {
          kpiReportInstanceName,
          kpiReportTemplateId,
          reportStatus,
          runDate,
          year,
          location: reportData.result.location,
          entity: reportData.result.entityFilter,
          catInfo: categoryupdate,
          reportRunBy: activeuser.username,
          updatedBy: activeuser.username,
          organization: activeuser.organizationId,
          updatedAt: new Date(),
        });
        this.logger.log(
          `trace id = ${randomNumber} PUT /api/kpi-report/updateReportInstance/${id} sucessful`,
          '',
        );
        return result;
      } else {
        return 'you are not authorized to edit';
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} PUT /api/kpi-report/updateReportInstance/${id} failed for ${data} ${error}`,
        '',
      );
    }
  }
  async updateAdhocReportInstance(userid, data, id, traceId) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });

    this.logger.debug(`Trace ID: ${traceId} - Active user fetched`, {
      activeuser,
    });
    try {
      this.logger.debug(
        `Trace ID: ${traceId} - Starting updateAdhocReportInstance`,
        {
          userId: userid,
          reportId: id,
          input: data,
        },
      );

      const {
        kpiReportInstanceName,
        location,
        entity,
        reportStatus,
        reportFrequency,
        catInfo,
        runDate,
        year,
        yearFor,
      } = data;

      const categoryupdate = [];

      for (const i of catInfo) {
        const kpiInfoUpdate = [];

        for (const j of i.kpiInfo) {
          const kpidata = await this.KpiDefinitionService.getSelectedKpi(
            j.kpiId,
          );

          kpiInfoUpdate.push({
            kpiId: j.kpiId,
            kpiTarget: j.kpiTarget,
            kpiOperationalTarget: j.kpiOperationalTarget,
            kpiMinimumTarget: j.kpiMinimumTarget,
            kpiValue: j.kpiValue,
            kpiTargetType: j.kpiTargetType,
            kpiComments: j.kpiComments,
            weightage: j.weightage,
            kpiDescription: kpidata.kpiDescription,
            kpiUOM: kpidata.uom,
            kpiName: kpidata.kpiName,
            owner: kpidata.owner,
            displayType: kpidata.displayType,
          });
        }

        categoryupdate.push({
          kpiReportCategoryId: i.kpiReportCategoryId,
          kpiReportCategoryName: i.kpiReportCategoryName,
          columnsArray: i.columnsArray,
          kpiInfo: kpiInfoUpdate,
          kraId: i.kraId,
        });
      }

      this.logger.debug(`Trace ID: ${traceId} - KPI category update prepared`, {
        categoryupdate,
      });

      const result = await this.kpiReportInstanceModel.findByIdAndUpdate(id, {
        kpiReportInstanceName,
        reportFrequency,
        reportStatus,
        runDate,
        year,
        yearFor,
        location: activeuser.locationId,
        entity: activeuser.entityId,
        catInfo: categoryupdate,
        reportRunBy: activeuser.username,
        updatedBy: activeuser.username,
        organization: activeuser.organizationId,
      });

      this.logger.log(
        `Trace ID: ${traceId} - PUT /api/kpi-report/updateadhocReportInstance/${id} successful`,
        { updatedBy: activeuser.username, result },
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Trace ID: ${traceId} - PUT /api/kpi-report/updateadhocReportInstance/${id} failed`,
        {
          message: error.message,
          stack: error.stack,
          input: data,
        },
      );
      throw error;
    }
  }

  // async getSelectedReportInstance(id) {
  //   try {
  //     const result = await this.kpiReportInstanceModel.findById(id);
  //     // console.log('result', result);
  //     let tempData;
  //     if (result?.kpiReportTemplateId) {
  //       tempData = await this.getSelectedKpiReportTemplate(
  //         result?.kpiReportTemplateId,
  //       );
  //     } else {
  //       tempData = '';
  //     }
  //     this.logger.log(
  //       `GET /api/kpi-report/getSelectedReportInstance/${id} successful`,
  //       '',
  //     );
  //     return { result, tempData };
  //   } catch (error) {
  //     this.logger.error(
  //       ` GET /api/kpi-report/getSelectedReportInstance/${id} failed ${error}`,
  //       '',
  //     );
  //   }
  // }
  async generateFiscalQuarterOptions(fiscalYearQuarter: string) {
    if (fiscalYearQuarter === 'April - Mar') {
      return ['April - June', 'July - Sept', 'Oct - Dec', 'Jan - Mar'];
    } else if (fiscalYearQuarter === 'Jan - Dec') {
      return ['Jan - Mar', 'April - June', 'July - Sept', 'Oct - Dec'];
    } else {
      throw new Error('Invalid fiscal year quarter format');
    }
  }
  async getFiscalQuarter(dateFor: any, yearFor: any, userid) {
    const ndate = new Date(dateFor);
    let date: any = ndate.toLocaleDateString('en-GB');
    let kpimonth = ndate.getMonth();
    let year = ndate.getFullYear();
    // let adate = new Date(date).getTime();

    // console.log("date,month,year", date, kpimonth, year);

    let quarters = await this.computeFiscalYearQuarters(userid, yearFor);
    let period;
    // console.log('date inside else while writing', date);
    for (let i = 0; i < quarters.length; i++) {
      //  //////////////console.log('inside for');
      // const dateobj = new Date(date);

      let qStartDate = quarters[i].startDate;
      //  console.log('qstartdate', qStartDate);
      ////////////////console.log(quarters[i].endDate);

      let qEndDate = quarters[i].endDate;
      //  console.log('qenddate', qEndDate);

      let d1 = qStartDate.split('/');
      let d2 = qEndDate.split('/');
      let c = date.split('/');

      let from = new Date(+d1[2], +d1[1] - 1, +d1[0]); // using unary plus to convert string to number
      let to = new Date(+d2[2], +d2[1] - 1, +d2[0]);
      let check = new Date(+c[2], +c[1] - 1, +c[0]);
      // console.log("check,from,to", from, to, check);
      if (check >= from && check <= to) {
        period = quarters[i].quarterNumber;
        // console.log('period inside if', period);
      }
    }
    return period;
  }
  async getSelectedReportInstance(id, userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: {
        organization: true,
        entity: true,
        location: true,
      },
    });
    try {
      // Fetch the report instance using the provided ID
      this.logger.debug(
        ` fetching /api/kpi-report/getSelectedReportInstance/${id} started`,
      );
      const result: any = await this.kpiReportInstanceModel.findById(id);
      // console.log('result', result);
      this.logger.debug(
        `/api/kpi-report/getSelectedReportInstance/${id} completed with result ${result}`,
      );

      let tempData;
      if (result?.kpiReportTemplateId) {
        tempData = await this.getSelectedKpiReportTemplate(
          result?.kpiReportTemplateId,
        );
      } else {
        tempData = '';
      }

      // Determine the period based on the frequency
      const frequency = result.reportFrequency.toUpperCase();
      let period;
      if (result.reportFrequency === 'Daily') {
        const date = new Date(result.runDate);
        period = date;
      } else if (result.reportFrequency === 'Monthly') {
        const months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        const date = new Date(result.runDate);
        const monthIndex = date.getMonth();
        period = months[monthIndex];
      } else if (result.reportFrequency === 'Quarterly') {
        const date = result.runDate;
        let quarter = await this.getFiscalQuarter(date, result.yearFor, userid);

        // console.log('quarter', quarter);

        // console.log('activeUSer', activeUser);
        const fiscalQuarters = await this.generateFiscalQuarterOptions(
          activeUser.organization?.fiscalYearQuarters,
        );
        // console.log('fiscalQuarters', fiscalQuarters);
        let quartername = fiscalQuarters[quarter - 1];
        // console.log('quartername', quartername);
        period = quartername;
      } else if (result.reportFrequency === 'Half-Yearly') {
        period = result?.semiAnnual;
      }

      // console.log('frequency,period', frequency, period);
      this.logger.debug(
        `computing period /api/kpi-report/getSelectedReportInstance/${id} ${period}`,
      );
      // Fetch KPI targets based on the frequency and period
      const kpiTargets = await this.KpiDefinitionService.getAllKpiForLocDept(
        userid,
        result.reportFrequency,
        period,
        result.entity,
      );
      // console.log('kpiTargets in getselected reportinstance', kpiTargets);
      this.logger.debug(`calculating targets`);
      // Loop through the categories and add the targets to the KPIs
      if (result && Array.isArray(result.catInfo)) {
        // Loop through existing categories and update KPI targets
        for (let category of result.catInfo) {
          if (Array.isArray(category.kpiInfo)) {
            for (let kpi of category.kpiInfo) {
              // Find the corresponding category in kpiTargets
              const matchingCategory = kpiTargets.find(
                (targetCategory) =>
                  targetCategory.catInfo._id.toString() ===
                  category?.kpiReportCategoryId,
              );

              if (matchingCategory) {
                // console.log('inside matching category', matchingCategory);
                // Find the matching target for the specific KPI
                const matchingTarget = matchingCategory.kpiInfo.find(
                  (target) => target.kpiId === kpi.kpiId,
                );
                // console.log('matching Target', matchingTarget, kpi.kpiTarget);

                if (matchingTarget) {
                  // Update KPI with new target values
                  kpi.kpiTarget = matchingTarget.kpiTarget || kpi.kpiTarget;
                  kpi.kpiMinimumTarget =
                    matchingTarget.kpiMinimumTarget || kpi.kpiMinimumTarget;
                } else {
                  // No matching target found, retain existing KPI values
                  kpi.kpiTarget = kpi.kpiTarget || null;
                  kpi.kpiMinimumTarget = kpi.kpiMinimumTarget || null;
                }
              } else {
                // If no category match is found, retain existing KPI values
                kpi.kpiTarget = kpi.kpiTarget || null;
                kpi.kpiMinimumTarget = kpi.kpiMinimumTarget || null;
              }
            }
          }
        }

        // Add missing KPIs from kpiTargets that are not in the result
        for (let targetCategory of kpiTargets) {
          if (Array.isArray(targetCategory.kpiInfo)) {
            for (let kpi of targetCategory.kpiInfo) {
              // console.log('kpi of kpitarget', kpi.kpiTarget);
              // Check if the KPI already exists in the result
              let exists = false;
              for (let category of result.catInfo) {
                if (Array.isArray(category.kpiInfo)) {
                  for (let existingKpi of category.kpiInfo) {
                    if (existingKpi.kpiId === kpi._id.toString()) {
                      exists = true; // If the KPI exists, don't add it
                      break;
                    }
                  }
                }
              }

              // If the KPI does not exist, add it with the correct target
              if (!exists) {
                // Find the matching category for the new KPI
                const matchingCategory = result.catInfo.find(
                  (category) =>
                    category.kpiReportCategoryId ===
                    targetCategory.catInfo._id.toString(),
                );

                if (matchingCategory) {
                  // Add the KPI to the matched category

                  matchingCategory.kpiInfo.push({
                    kpiId: kpi._id,
                    kpiTarget: kpi.kpiTarget || null, // Ensure the correct target is assigned
                    kpiMinimumTarget: kpi.kpiMinimumTarget || null, // Ensure the correct minimum target is assigned
                    kpiTargetType: kpi?.kpiTargetType || null,
                    kpiOperationalTarget: kpi.kpiOperationalTarget || null,
                    kpiValue: null,
                    kpiName: kpi?.kpiName,
                    kpiUOM: kpi?.uom || null,
                    kpiDescription: kpi?.kpiDescription || '',
                    displayType: kpi?.displayType || 'SUM',
                  });
                } else {
                  // If no matching category is found, create a new category for the KPI

                  result.catInfo.push({
                    kpiReportCategoryId: targetCategory.catInfo._id.toString(),
                    kpiReportCategoryName:
                      targetCategory.catInfo.ObjectiveCategory,
                    kpiInfo: [
                      {
                        kpiId: kpi._id,
                        kpiTarget: kpi.kpiTarget || null,
                        kpiMinimumTarget: kpi.kpiMinimumTarget || null,
                        kpiTargetType: kpi?.kpiTargetType || null,
                        kpiOperationalTarget: kpi.kpiOperationalTarget || null,
                        kpiValue: null,
                        kpiName: kpi?.kpiName,
                        kpiDescription: kpi?.kpiDescription || '',
                        displayType: kpi?.displayType || 'SUM',
                      },
                    ],
                  });
                }
              }
            }
          }
        }
      }
      this.logger.debug(
        `returning result for getSelectedReportInstance/${id} with result`,
      );
      // Return the modified result with merged KPI targets
      return { result, tempData };
    } catch (error) {
      this.logger.error(
        `GET /api/kpi-report/getSelectedReportInstance/${id} failed ${error} initiated by ${activeUser?.username} unit=${activeUser?.location?.locationName} entity=${activeUser?.entity?.entityName}`,
        error?.stack || error?.message,
      );
      throw error;
    }
  }

  async deleteSelectedReportInstance(id, userid, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: {
        location: true,
        entity: true,
      },
    });

    const deleteKpiDataFromMySQL = async (kpiId, kpiMonthYear, kpiYear) => {
      try {
        const reportKpiDetailTable =
          await this.mySQLPrisma.kpiSummary.deleteMany({
            where: {
              kpiId: kpiId,
              kpiMonthYear: kpiMonthYear,
              kpiYear: kpiYear,
            },
          });
        // console.log(
        //   'Deleted kpi summary data for kpiId',
        //   kpiId,
        //   reportKpiDetailTable,
        // );
      } catch (error) {
        // console.error(`Error deleting kpi summary for kpiId ${kpiId}`, error);
      }
    };

    try {
      // Fetch the report instance and extract kpiIds in bulk
      const reportInstance = await this.kpiReportInstanceModel.findById(id);
      if (!reportInstance) {
        throw new Error('Report instance not found');
      }

      const kpisToDelete = [];
      for (const cat of reportInstance.catInfo) {
        for (const kpiInfo of cat.kpiInfo) {
          const kpiId = kpiInfo.kpiId;
          const kpicheck =
            await this.mySQLPrisma.reportKpiDataNewData.findFirst({
              where: { kpiReportId: id, kpiId: kpiId },
            });

          if (kpicheck) {
            const kpiMonthYear = new Date(kpicheck.reportFor).getMonth();
            const kpiYear = new Date(kpicheck.reportFor).getFullYear();
            kpisToDelete.push({ kpiId, kpiMonthYear, kpiYear });
          }
        }
      }

      // Delete from MySQL: reportKpiDataNewData
      await this.mySQLPrisma.reportKpiDataNewData.deleteMany({
        where: {
          kpiReportId: id,
        },
      });
      this.logger.debug(`Deleting kpis from mysql started`);
      // Delete from MySQL: kpiSummary (batch delete for each KPI)
      for (const kpi of kpisToDelete) {
        await deleteKpiDataFromMySQL(kpi.kpiId, kpi.kpiMonthYear, kpi.kpiYear);
      }
      this.logger.debug(`Deleting report instance from mongodb started`);
      // Delete from MongoDB (kpiReportInstance)
      const result = await this.kpiReportInstanceModel.findByIdAndDelete(id);
      // console.log('MongoDB delete result:', result);

      // If the report instance is successfully deleted, log the success
      if (result) {
        this.logger.log(
          `trace id = ${randomNumber} DELETE /api/kpi-report/deleteSelectedReportInstance/${id} successful`,
          '',
        );
        return result;
      } else {
        throw new Error(`Failed to delete report instance ${id}`);
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} DELETE /api/kpi-report/deleteSelectedReportInstance/${id} failed: ${error.message}`,
        '',
      );
      throw error; // Optionally rethrow the error to propagate it further up
    }
  }

  async getAllReportInstanceofTemplate(id) {
    try {
      const result = await this.kpiReportInstanceModel.find({
        kpiReportTemplateId: id,
      });
      this.logger.log(
        ` /api/kpi-report/getAllReportInstancesofTemplate/${id} started`,
        '',
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAllReportInstances(userid, query, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: { location: true, entity: true },
    });
    try {
      this.logger.debug(
        `/api/kpi-report/getAllReportInstances started with query ${query}`,
      );
      const page = query.page || 1;
      const pageSize = query.limit || 10;
      const skip = (page - 1) * pageSize;
      let apiquery: any = {
        organization: activeuser.organizationId,
        yearFor: query.currentYear,
      };
      if (query.unitId !== 'All') {
        apiquery.location = query.unitId;
      }

      if (query.deptId !== 'All') {
        apiquery.entity = query.deptId;
      }
      if (query.selectedFrequency && query.selectedFrequency.length > 0) {
        apiquery.reportFrequency = { $in: query.selectedFrequency };
      }
      if (!!query.searchValue && query.searchValue !== '') {
        // console.log('inside searchValue', query.searchValue);
        // const searchRegex = new RegExp(query.search, 'i');
        // const categories = await this.kpiReportCategoryModel.find({
        //   organizationId: activeuser.organizationId,
        //   kpiReportCategoryName: { $regex: query.searchValue, $options: 'i' },
        // });
        // console.log('categories', categories);
        // const catIds = categories.map((item) => item._id.toString());
        const kpis = await this.KpiModel.find({
          organizationId: activeuser.organizationId,
          $or: [
            { kpiName: { $regex: query.searchValue, $options: 'i' } },
            { uom: { $regex: query.searchValue, $options: 'i' } },
          ],
        });
        // console.log('kpis', kpis);
        const kpiIds = kpis.map((item) => item._id.toString());
        // console.log('kpiIds', kpiIds);
        // console.log('catids', catIds);
        // const stringCatIds = catIds.map((id) => id.toString());
        // console.log('catids', stringCatIds);
        apiquery.$or = [
          {
            kpiReportInstanceName: { $regex: query.searchValue, $options: 'i' },
          },
          {
            // 'catInfo.kpiReportCategoryId': { $in: catIds },
            'catInfo.kpiInfo.kpiId': { $in: kpiIds },
            // 'catInfo.kpiInfo.kpiName': {
            //   $regex: query.searchValue,
            //   $options: 'i',
            // },
            // 'catInfo.kpiInfo.kpiUOM': {
            //   $regex: query.searchValue,
            //   $options: 'i',
            // },
          },
        ];
      }
      // console.log('apiquery', apiquery);
      // console.log('query', query);
      this.logger.debug(`built query ${apiquery}`);
      const result: any = await this.kpiReportInstanceModel
        .find(apiquery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();
      this.logger.debug(`fetch result`);
      let count = await this.kpiReportInstanceModel.countDocuments(apiquery);
      // return result;
      // console.log('Result', result);
      let finaldata = [];

      for (let value of result) {
        this.logger.debug(`value in loop${value}`);
        //console.log(value.kpiReportTemplateId);
        let count = 0;
        for (let i = 0; i < value.catInfo.length; i++) {
          for (let j = 0; j < value.catInfo[i].kpiInfo.length; j++) {
            count = count + 1;
          }
        }
        let tempresult;
        if (value.kpiReportTemplateId && value.kpiReportTemplateId !== '') {
          tempresult = await this.getSelectedKpiReportTemplate(
            value.kpiReportTemplateId,
          );

          const location = await this.prisma.location.findFirst({
            where: { id: tempresult.result?.location },
          });
          const entity = await this.prisma.entity.findFirst({
            where: {
              id: tempresult.result?.entityFilter,
            },
          });
          const catdata = await this.getAllCategory(value.kpiReportTemplateId);
          const data = {
            id: value._id,
            reportinstaname: value.kpiReportInstanceName,
            runby: value.reportRunBy,
            reportid: value._id,
            noofkpis: count,
            runDate: value.runDate,
            schedule: tempresult.result.reportFrequency,
            sharedwith: tempresult.result.emailShareList,
            location: location,
            entity: entity,
            tempdata: tempresult.result,
            catdata: catdata,
            createdAt: value.createdAt,
            reportStatus: value.reportStatus,
            semiAnnual: value.semiAnnual ? value.semiAnnual : '',
          };
          finaldata.push(data);
        } else {
          tempresult = '';
          const location = await this.prisma.location.findFirst({
            where: { id: value.location },
          });
          const entity = await this.prisma.entity.findFirst({
            where: {
              id: value.entity,
            },
          });
          // const catdata = await this.getAllCategory(value.kpiReportTemplateId);
          const data = {
            id: value._id,
            reportinstaname: value.kpiReportInstanceName,
            runby: value.reportRunBy,
            reportid: value._id,
            noofkpis: count,
            reportFrequency: value.reportFrequency,
            // schedule: tempresult?.result?.reportFrequency
            //   ? tempresult?.result?.reportFrequency
            //   : '',
            // sharedwith: tempresult.result.emailShareList
            //   ? tempresult.result.emailShareList
            //   : '',
            location: location,
            entity: entity,
            tempdata: tempresult.result ? tempresult.result : '',
            catdata: value.catInfo,
            createdAt: value.createdAt,
            updatedAt: value.updatedAt,
            reportStatus: value.reportStatus,
            runDate: value.runDate,
            yearFor: value.yearFor,
            semiAnnual: value.semiAnnual ? value.semiAnnual : '',
          };
          finaldata.push(data);
        }
      }
      // console.log(finaldata);
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getAllReportInstances successful initiated by ${activeuser?.username} unit=${activeuser?.location.locationName} entity=${activeuser?.entity?.entityName}`,
        '',
      );
      return { data: finaldata, count: count };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/getAllReportInstances failed initiated by ${activeuser?.username} unit=${activeuser?.location.locationName} entity=${activeuser?.entity?.entityName} error`,
        error?.stack || error?.message,
      );
      return error;
    }
  }
  async computationForKpi(kpiid, locid, entityId, lte, gte, randomNumber) {
    try {
      // console.log('kpiid,locid', kpiid, locid, entityId, lte, gte);
      this.logger.debug(
        `api/kpi-report/computationforkpi started with kpi=${kpiid} locid=${locid} enttyId=${entityId} lte=${lte} get=${gte}`,
      );
      const allkpidata = await this.mySQLPrisma
        .$queryRaw`SELECT * FROM reportKpiDataNewData WHERE DATE(reportFor) >= ${new Date(
        gte,
      )} AND DATE(reportFor) <= ${new Date(
        lte,
      )} AND kpiId = ${kpiid} AND kpiLocation = ${locid} AND kpiEntity=${entityId} ORDER BY DATE(reportFor) ASC;`;
      // console.log('records', allkpidata);

      const records = await this.mySQLPrisma.$queryRaw`
  SELECT 
    SUM(kpiValue) as totalMonthlySum,
    AVG(kpiValue) as monthlyAverage,
    SUM(kpiVariance) as totalMonthlyVariance,
    AVG(percentage) as averagepercentage,
    SUM(target) as totalTarget,
    AVG(monthlyTarget) as avgTarget,
    SUM(monthlyMinimumTarget) as totalMinimumTarget,
    AVG(monthlyMinimumTarget) as avgMinimumTarget,
    SUM(operationalTarget) as totalOperationalTarget
    
  FROM reportKpiDataNewData 
  WHERE DATE(reportFor) >= ${new Date(gte)} 
    AND DATE(reportFor) <= ${new Date(lte)} 
    AND kpiId = ${kpiid}
    AND kpiLocation = ${locid} AND  kpiEntity=${entityId} ORDER BY DATE(reportFor) ASC;
`;
      this.logger.debug(`query successful`);
      return { allkpidata, records };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/computationForKpi/${kpiid}/${locid}/${lte}/${gte} failed`,
        error?.stack || error?.message,
      );
    }
  }

  // async writeToSummary(userid) {
  //   // console.log('writeTosummary called');
  //   const activeuser = await this.prisma.user.findFirst({
  //     where: { kcId: userid },
  //     include: { organization: true },
  //   });
  //   let date = new Date();
  //   let month = date.getMonth();
  //   let year = date.getFullYear();
  //   let quarters = [];

  //   //find kpis which are not written to the summary yet(status:workinprogress)
  //   let kpidata = await this.mySQLPrisma.reportKpiDataNewData.findMany({
  //     where: { kpiStatus: 'WIP', kpiOrganization: activeuser.organization.id },
  //   });
  //   // console.log('kpidata', kpidata);
  //   //find whether summary has already entries for this year,month,kpid and category:if entry is already there just update it if not create a new entry)
  //   for (let i = 0; i < kpidata.length; i++) {
  //     let date = kpidata[i].reportFor;
  //     let month = date.getMonth();
  //     let year = date.getFullYear();
  //     let result = await this.mySQLPrisma.kpiSummary.findMany({
  //       where: {
  //         kpiId: kpidata[i].kpiId,
  //         kpiMonthYear: month,
  //         kpiYear: year,
  //         kraId: kpidata[i].kpiCategoryId,
  //       },
  //     });
  //     // console.log('result.length', result);
  //     if (result.length != 0) {
  //       for (let value of result) {
  //         if (value.count > 0) {
  //           let per;
  //           //compute percentage based on kpitarget type
  //           if (kpidata[i]?.kpiTargetType === 'Increase') {
  //             per =
  //               ((value.monthlySum + kpidata[i].kpiValue) /
  //                 (value.monthlyTarget + kpidata[i].target)) *
  //               100;
  //           } else if (kpidata[i]?.kpiTargetType === 'Decrease') {
  //             let va =
  //               value.monthlyTarget +
  //               kpidata[i].target -
  //               (value.monthlySum + kpidata[i].kpiValue);
  //             per =
  //               100 -
  //               (Math.abs(va) / (value.monthlyTarget + kpidata[i].target)) *
  //                 100;
  //           } else if (kpidata[i]?.kpiTargetType === 'Maintain') {
  //             let va =
  //               value.monthlyTarget +
  //               kpidata[i].target -
  //               (value.monthlySum + kpidata[i].kpiValue);

  //             per =
  //               100 -
  //               (Math.abs(va) / (value.monthlyTarget + kpidata[i].target)) *
  //                 100;
  //           }
  //           let datatoupdate = await this.mySQLPrisma.kpiSummary.update({
  //             where: { id: value.id },
  //             data: {
  //               count: value.count + 1,
  //               monthlySum: value.monthlySum + kpidata[i].kpiValue,
  //               monthlyAverage:
  //                 (value.monthlySum + kpidata[i].kpiValue) / (value.count + 1),

  //               monthlyTarget: value.monthlyTarget + kpidata[i].target,
  //               monthlyVariance:
  //                 value.monthlyTarget +
  //                 kpidata[i].target -
  //                 (value.monthlySum + kpidata[i].kpiValue),
  //               percentage: per,
  //             },
  //           });
  //           ////////////////console.log('datatoupdate', datatoupdate);
  //           let statusupdate =
  //             await this.mySQLPrisma.reportKpiDataNewData.update({
  //               where: { id: kpidata[i].id },
  //               data: { kpiStatus: 'processed' },
  //             });
  //           // //////////////console.log('status updated', statusupdate);
  //         } else {
  //           let objid;
  //           // console.log(
  //           //   'kraid and categoryid',
  //           //   kpidata[i].kraId,
  //           //   kpidata[i].kpiCategoryId,
  //           // );
  //           if (kpidata[i].kraId === kpidata[i].kpiCategoryId) {
  //             // console.log('inside equal case');
  //             objid = kpidata[i].kraId;
  //           } else {
  //             objid = null;
  //           }
  //           let period;
  //           let daterep = kpidata[i].reportFor.toLocaleDateString();
  //           // console.log('date inside else', typeof date);
  //           for (let i = 0; i < quarters.length; i++) {
  //             let qStartDate = quarters[i].startDate;
  //             // console.log('qstartdate', qStartDate);
  //             // let aenddate=quarters[i].endDate
  //             // console.log(quarters[i].endDate);

  //             let qEndDate = quarters[i].endDate;
  //             // console.log('qenddate', typeof qEndDate);

  //             var d1 = qStartDate.split('/');
  //             var d2 = qEndDate.split('/');
  //             var c: any = daterep.split('/');

  //             var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
  //             var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
  //             var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);
  //             // console.log('reportdates', from, to, check);
  //             if (check >= from && check <= to) {
  //               period = quarters[i].quarterNumber;
  //               // console.log('period inside if', period);
  //             }
  //           }
  //           // console.log('period', period);

  //           let datatowrite = await this.mySQLPrisma.kpiSummary.create({
  //             data: {
  //               kpiId: kpidata[i].kpiId,
  //               kraId: kpidata[i].kpiCategoryId,
  //               objectiveId: objid,
  //               kpiLocation: kpidata[i].kpiLocation,
  //               kpiEntity: kpidata[i].kpiEntity,
  //               kpibusiness: kpidata[i].kpibusiness,
  //               kpiOrganization: kpidata[i].kpiOrganization,
  //               kpiMonthYear: month,
  //               kpiYear: year,
  //               monthlySum: kpidata[i].kpiValue,
  //               monthlyAverage: kpidata[i].kpiValue / 1,
  //               monthlyVariance: kpidata[i].kpiVariance,
  //               monthlyTarget: kpidata[i].target,
  //               count: 1,
  //               percentage: kpidata[i].percentage,
  //               kpiPeriod: period,
  //             },
  //           });
  //           let statusupdate =
  //             await this.mySQLPrisma.reportKpiDataNewData.update({
  //               where: { id: kpidata[i].id },
  //               data: { kpiStatus: 'processed' },
  //             });
  //         }
  //       }
  //     } else {
  //       // console.log('inside else');
  //       let objid;
  //       if (kpidata[i].kraId === kpidata[i].kpiCategoryId) {
  //         objid = kpidata[i].kraId;
  //       } else {
  //         objid = null;
  //       }
  //       let period;
  //       quarters = await this.computeFiscalYearQuarters(
  //         userid,
  //         kpidata[i].reportYear,
  //       );
  //       // console.log('quarters', quarters);
  //       let dateObj = new Date(kpidata[i].reportFor);
  //       let day: any = dateObj.getDate();
  //       let month: any = dateObj.getMonth() + 1; // Months are zero-indexed
  //       let year = dateObj.getFullYear();

  //       if (day < 10) {
  //         day = '0' + day;
  //       }
  //       if (month < 10) {
  //         month = '0' + month;
  //       }

  //       let date = day + '/' + month + '/' + year;
  //       let kpimonth = kpidata[i].reportFor.getMonth();
  //       year = kpidata[i].reportFor.getFullYear();
  //       // let adate = new Date(date).getTime();
  //       // console.log('date,month,year', date, kpimonth, year);
  //       // console.log('date inside else while writing', date);
  //       for (let i = 0; i < quarters.length; i++) {
  //         //  //////////////console.log('inside for');
  //         // const dateobj = new Date(date);

  //         let qStartDate = quarters[i].startDate;
  //         //  console.log('qstartdate', qStartDate);
  //         ////////////////console.log(quarters[i].endDate);

  //         let qEndDate = quarters[i].endDate;
  //         //  console.log('qenddate', qEndDate);

  //         let d1 = qStartDate.split('/');
  //         let d2 = qEndDate.split('/');
  //         let c = date.split('/');

  //         let from = new Date(+d1[2], +d1[1] - 1, +d1[0]); // using unary plus to convert string to number
  //         let to = new Date(+d2[2], +d2[1] - 1, +d2[0]);
  //         let check = new Date(+c[2], +c[1] - 1, +c[0]);
  //         // console.log('check,from,to', from, to, check);
  //         if (check >= from && check <= to) {
  //           period = quarters[i].quarterNumber;
  //           // console.log('period inside if', period);
  //         }
  //       }
  //       // console.log('period', period);
  //       let datatowrite = await this.mySQLPrisma.kpiSummary.create({
  //         data: {
  //           kpiId: kpidata[i].kpiId,
  //           kraId: kpidata[i].kpiCategoryId.toString(),
  //           kpiMonthYear: kpimonth,
  //           objectiveId: objid,
  //           kpiYear: year,
  //           kpibusiness: kpidata[i].kpibusiness,
  //           kpiEntity: kpidata[i].kpiEntity,
  //           kpiLocation: kpidata[i].kpiLocation,
  //           kpiOrganization: kpidata[i].kpiOrganization,
  //           monthlySum: kpidata[i].kpiValue,
  //           monthlyAverage: kpidata[i].kpiValue / 1,
  //           monthlyVariance: kpidata[i].kpiVariance,
  //           monthlyTarget: kpidata[i].target,
  //           count: 1,
  //           percentage: kpidata[i].percentage,
  //           kpiPeriod: period,
  //         },
  //       });
  //       // //////////////console.log('datatowrite', datatowrite);
  //       let statusupdate = await this.mySQLPrisma.reportKpiDataNewData.update({
  //         where: { id: kpidata[i].id },
  //         data: { kpiStatus: 'processed' },
  //       });
  //     }
  //   }

  //   // //////////////console.log('summary data', summaryofKpi);
  // }
  //this api is for considering operational target for calculations(hindalco) if no operational target use the above api
  async writeToSummary(query) {
    // console.log('writeTosummary called');

    try {
      this.logger.debug(`pi/kpi-report/writeToSummary started for ${query}`);
      const org = await this.prisma.organization.findFirst({
        where: {
          id: query.organizationId,
        },
      });

      let date = new Date();
      let month = date.getMonth();
      let year = date.getFullYear();
      let quarters = [];

      //find kpis which are not written to the summary yet(status:workinprogress)
      let kpidata = await this.mySQLPrisma.reportKpiDataNewData.findMany({
        where: {
          kpiStatus: 'WIP',
          kpiOrganization: query.organizationId,
        },
      });
      this.logger.debug(`kpis found ${kpidata?.length}`);
      // console.log('kpidata', kpidata);
      //find whether summary has already entries for this year,month,kpid and category:if entry is already there just update it if not create a new entry)
      for (let i = 0; i < kpidata.length; i++) {
        let date = kpidata[i].reportFor;
        let month = date.getMonth();
        let year = date.getFullYear();
        let result = await this.mySQLPrisma.kpiSummary.findMany({
          where: {
            kpiId: kpidata[i].kpiId,
            kpiMonthYear: month,
            kpiYear: year,
            kraId: kpidata[i].kpiCategoryId,
          },
        });
        this.logger.debug(`entries found in summary table ${result?.length}`);
        // console.log('result.length', result);
        if (result.length != 0) {
          for (let value of result) {
            if (value.count > 0) {
              let per;
              //compute percentage based on kpitarget type
              if (kpidata[i]?.kpiTargetType === 'Increase') {
                const monthlySum = value.monthlySum || 0; // Use 0 if undefined
                const kpiValue = kpidata[i]?.kpiValue || 0; // Use 0 if undefined
                const monthlyTarget = value.monthlyTarget || 0; // Use 0 if undefined
                const target = kpidata[i]?.target || 0; // Use 0 if undefined

                if (monthlyTarget === 0 && target === 0) {
                  per = 0; // Both monthlyTarget and target are zero
                } else if (monthlyTarget === 0) {
                  per = 0; // monthlyTarget is zero, target is non-zero (avoid division by zero)
                } else {
                  // Calculate the percentage
                  per =
                    ((monthlySum + kpiValue) / (monthlyTarget + target)) * 100;
                }
              } else if (kpidata[i]?.kpiTargetType === 'Decrease') {
                let va =
                  value.monthlyTarget +
                  kpidata[i].target -
                  (value.monthlySum + kpidata[i].kpiValue);
                if (value.monthlyTarget + kpidata[i].target === 0) {
                  per = va === 0 ? 100 : va * 100;
                } else {
                  per = (va / (value.monthlyTarget + kpidata[i].target)) * 100;
                }
              } else if (kpidata[i]?.kpiTargetType === 'Maintain') {
                per =
                  ((value.monthlySum + kpidata[i].kpiValue) /
                    (value.monthlyTarget + kpidata[i].target)) *
                  100;
              } else if (kpidata[i]?.kpiTargetType === 'Range') {
                per =
                  ((value.monthlySum + kpidata[i].kpiValue) /
                    (value.monthlyTarget + kpidata[i].target)) *
                  100;
              }
              await this.mySQLPrisma.kpiSummary.update({
                where: { id: value.id },
                data: {
                  count: value.count + 1,
                  monthlySum: value.monthlySum + kpidata[i].kpiValue,
                  monthlyAverage:
                    (value.monthlySum + kpidata[i].kpiValue) /
                    (value.count + 1),
                  monthlyOperationalTarget:
                    value.monthlyOperationalTarget +
                    kpidata[i].operationalTarget,
                  monthlyTarget: value.monthlyTarget + kpidata[i].target,
                  monthlyMinimumTarget:
                    value?.monthlyMinimumTarget + kpidata[i].minimumTarget,
                  monthlyVariance:
                    value.monthlyTarget +
                    kpidata[i].target -
                    (value.monthlySum + kpidata[i].kpiValue),
                  percentage: per,
                  kpiComments: kpidata[i].kpiComments,
                },
              });

              await this.mySQLPrisma.reportKpiDataNewData.update({
                where: { id: kpidata[i].id },
                data: { kpiStatus: 'processed' },
              });
              // //////////////console.log('status updated', statusupdate);
            } else {
              let objid: any;
              // console.log(
              //   'kraid and categoryid',
              //   kpidata[i].kraId,
              //   kpidata[i].kpiCategoryId,
              // );
              // if (kpidata[i].kraId === kpidata[i].kpiCategoryId) {
              //   // console.log('inside equal case');
              //   objid = kpidata[i].kraId;
              // } else {
              //   objid = null;
              // }
              let period;
              let daterep = kpidata[i].reportFor.toLocaleDateString();
              // console.log('date inside else', typeof date);
              for (let i = 0; i < quarters.length; i++) {
                let qStartDate = quarters[i].startDate;
                // console.log('qstartdate', qStartDate);
                // let aenddate=quarters[i].endDate
                // console.log(quarters[i].endDate);

                let qEndDate = quarters[i].endDate;
                // console.log('qenddate', typeof qEndDate);

                var d1 = qStartDate.split('/');
                var d2 = qEndDate.split('/');
                var c: any = daterep.split('/');

                var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
                var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
                var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);
                // console.log('reportdates', from, to, check);
                if (check >= from && check <= to) {
                  period = quarters[i].quarterNumber;
                  // console.log('period inside if', period);
                }
              }
              let halfYear: any = await this.getSemiannualPeriod(
                kpidata[i].reportFor.toDateString(),
                kpidata[i].reportYear,
                org.fiscalYearQuarters,
              );
              // console.log('objectiveid in kpi summary', halfYear);
              // objid=JSON.parse(kpidata[i].objectiveId)
              let objectiveId: JsonValue = kpidata[i].objectiveId
                ? kpidata[i].objectiveId
                : null;
              let datatowrite = await this.mySQLPrisma.kpiSummary.create({
                data: {
                  kpiId: kpidata[i].kpiId,
                  kraId: kpidata[i].kpiCategoryId,
                  objectiveId: JSON.stringify(objectiveId),
                  kpiLocation: kpidata[i].kpiLocation,
                  kpiEntity: kpidata[i].kpiEntity,
                  kpibusiness: kpidata[i].kpibusiness,
                  kpiOrganization: kpidata[i].kpiOrganization,
                  kpiMonthYear: month,
                  kpiYear: year,
                  monthlySum: kpidata[i].kpiValue,
                  monthlyAverage: kpidata[i].kpiValue / 1,
                  monthlyVariance: kpidata[i].kpiVariance,
                  monthlyTarget: kpidata[i].target,
                  monthlyMinimumTarget: kpidata[i].minimumTarget,
                  monthlyOperationalTarget: kpidata[i].operationalTarget,
                  count: 1,
                  percentage: kpidata[i].percentage,
                  kpiPeriod: period,
                  kpiComments: kpidata[i].kpiComments,
                  kpiSemiAnnual: halfYear,
                },
              });

              // Update reportKpiDataNewData status to processed
              await this.mySQLPrisma.reportKpiDataNewData.update({
                where: { id: kpidata[i].id },
                data: { kpiStatus: 'processed' },
              });
            }
          }
        } else {
          // console.log('inside else');
          this.logger.debug(
            `creating fresh entry in summary table for ${kpidata[i]}`,
          );
          let objid;
          if (kpidata[i].kraId === kpidata[i].kpiCategoryId) {
            objid = kpidata[i].kraId;
          } else {
            objid = null;
          }
          let period;
          quarters = await this.computeFiscalYearQuartersForSummary(
            query.organizationId,
            kpidata[i].reportYear,
          );

          // Compute period based on fiscal year quarters
          let dateObj = new Date(kpidata[i].reportFor);
          let day: any = dateObj.getDate();
          let month: any = dateObj.getMonth() + 1; // Months are zero-indexed
          let year = dateObj.getFullYear();

          if (day < 10) {
            day = '0' + day;
          }
          if (month < 10) {
            month = '0' + month;
          }

          let date = day + '/' + month + '/' + year;
          let kpimonth = kpidata[i].reportFor.getMonth();
          year = kpidata[i].reportFor.getFullYear();
          // let adate = new Date(date).getTime();
          // console.log('date,month,year', date, kpimonth, year);
          // console.log('date inside else while writing', date);
          for (let i = 0; i < quarters.length; i++) {
            //  //////////////console.log('inside for');
            // const dateobj = new Date(date);

            let qStartDate = quarters[i].startDate;
            //  console.log('qstartdate', qStartDate);
            ////////////////console.log(quarters[i].endDate);

            let qEndDate = quarters[i].endDate;
            //  console.log('qenddate', qEndDate);

            let d1 = qStartDate.split('/');
            let d2 = qEndDate.split('/');
            let c = date.split('/');

            let from = new Date(+d1[2], +d1[1] - 1, +d1[0]); // using unary plus to convert string to number
            let to = new Date(+d2[2], +d2[1] - 1, +d2[0]);
            let check = new Date(+c[2], +c[1] - 1, +c[0]);
            // console.log('check,from,to', from, to, check);
            if (check >= from && check <= to) {
              period = quarters[i].quarterNumber;
              // console.log('period inside if', period);
            }
          }
          // console.log('period', period);

          let halfYear: any = await this.getSemiannualPeriod(
            kpidata[i].reportFor.toDateString(),
            kpidata[i].reportYear,
            org.fiscalYearQuarters,
          );
          // console.log('objectiveid in kpi summary', halfYear);
          let objectiveId: JsonValue = kpidata[i].objectiveId;

          let datatowrite = await this.mySQLPrisma.kpiSummary.create({
            data: {
              kpiId: kpidata[i].kpiId,
              kraId: kpidata[i].kpiCategoryId.toString(),
              objectiveId: objectiveId,
              kpiLocation: kpidata[i].kpiLocation,
              kpiEntity: kpidata[i].kpiEntity,
              kpibusiness: kpidata[i].kpibusiness,
              kpiOrganization: kpidata[i].kpiOrganization,
              kpiMonthYear: kpimonth,
              kpiYear: year,
              monthlySum: kpidata[i].kpiValue,
              monthlyAverage: kpidata[i].kpiValue / 1,
              monthlyVariance: kpidata[i].kpiVariance,
              monthlyTarget: kpidata[i].target,
              monthlyMinimumTarget: kpidata[i].minimumTarget,
              monthlyOperationalTarget: kpidata[i].operationalTarget,
              count: 1,
              percentage: kpidata[i].percentage,
              kpiPeriod: period,
              kpiComments: kpidata[i].kpiComments,
              kpiSemiAnnual: halfYear,
            },
          });
          this.logger.debug(
            `etry creating in summary ${datatowrite} and updating detail table to processed`,
          );
          // Update reportKpiDataNewData status to processed
          await this.mySQLPrisma.reportKpiDataNewData.update({
            where: { id: kpidata[i].id },
            data: { kpiStatus: 'processed' },
          });
        }
      }

      // Log success message after all operations are completed
      this.logger.log(`GET /api/kpi-report/writeToSummary successful`, '');

      // Return success status or other response as needed
      return { status: 'success' };
    } catch (error) {
      // Log error message if any operation fails
      this.logger.error(
        `GET /api/kpi-report/writeToSummary failed ${error}`,
        '',
      );

      throw error;
    }
  }

  // async calculationFromSummary(query, kpiid, locid, userid, randomNumber) {
  //   try {
  //     const { startDate, endDate, entity } = query;
  //     console.log('startDate', startDate, endDate);
  //     const activeuser = await this.prisma.user.findFirst({
  //       where: { kcId: userid },
  //     });

  //     const startMonth = new Date(startDate).getMonth().toString();
  //     const endMonth = new Date(endDate).getMonth().toString();
  //     const startYear = new Date(startDate).getFullYear().toString();
  //     const endYear = new Date(endDate).getFullYear().toString();
  //     const from = startYear + startMonth;
  //     console.log(from);

  //     const to = endYear + endMonth;
  //     console.log('tot', to);
  //     const kpiId = kpiid;
  //     //get monthwise records
  //     let monthwiseresult = await this.mySQLPrisma.$queryRaw`
  //   SELECT *
  //   FROM kpiSummary
  //   WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
  //     AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
  //     AND kpiId = ${kpiId}
  //     AND kpiLocation = ${locid}  AND kpiEntity=${entity} ORDER BY kpiYear ASC, kpiMonthYear ASC;
  // `;
  //     console.log('monthwisedata', monthwiseresult);
  //     //get monthwise totals
  //     let result = await this.mySQLPrisma.$queryRaw`
  //   SELECT
  //     kpiYear,
  //     SUM(monthlySum) as totalMonthlySum,
  //     AVG(monthlyAverage) as averageMonthlyAverage,
  //     SUM(monthlyVariance) as totalMonthlyVariance,
  //     SUM(monthlyTarget) as totalTarget,
  //     SUM(monthlyOperationalTarget) as totalOperationalTarget

  //   FROM kpiSummary
  //   WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
  //     AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
  //     AND kpiId = ${kpiId}
  //     AND kpiLocation = ${locid}
  //     AND kpiEntity=${entity}
  //     AND kpiYear IS NOT NULL
  //     AND kpiMonthYear IS NOT NULL
  //   GROUP BY kpiYear  ORDER BY kpiYear ASC;
  // `;
  //     //get quarterwise totals
  //     let quarterwisedata = await this.mySQLPrisma.$queryRaw`
  //   SELECT
  //     kpiPeriod,
  //     kpiYear,
  //     SUM(monthlySum) as totalQuarterSum,
  //     AVG(monthlyAverage) as averageQuarterAverage,
  //     SUM(monthlyVariance) as totalQuarterVariance,
  //     SUM(monthlyTarget) as totalQuarterTarget,
  //     SUM(monthlyOperationalTarget) as totalQuarterOperationalTarget
  //   FROM kpiSummary
  //   WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
  //     AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
  //     AND kpiId = ${kpiId}
  //     AND kpiLocation = ${locid}
  //     AND kpiEntity=${entity}
  //   GROUP BY kpiPeriod, kpiYear  ORDER BY kpiYear ASC, kpiPeriod ASC;
  // `;

  //     const finalResult = await this.toJson(result);
  //     // //////////////console.log(finalResult);
  //     // console.log('monthwise result', quarterwisedata);
  //     //return monthwise individual records,monthwise aggregate,quarterwise aggregate
  //     this.logger.log(
  //       `trace id = ${randomNumber} GET /api/kpi-report/calculationFromSummary/${kpiid}/${locid} successful`,
  //       '',
  //     );
  //     return {
  //       monthwiseresult,
  //       sum: JSON.parse(finalResult),
  //       quarter: quarterwisedata,
  //     };
  //   } catch (error) {
  //     this.logger.error(
  //       `trace id = ${randomNumber} GET /api/kpi-report/calculationFromSummary/${kpiid}/${locid} failed`,
  //       '',
  //     );
  //   }
  // }
  async calculationFromSummary(query, kpiid, locid, userid, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: { location: true, entity: true },
    });
    try {
      this.logger.debug(
        `/api/kpi-report/calculationFromSummary started with query ${query}`,
      );
      const { startDate, endDate, entity } = query;
      // console.log('startDate', startDate, endDate);

      const startMonth = new Date(startDate)
        .getMonth()
        .toString()
        .padStart(2, '0');
      const endMonth = (new Date(endDate).getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const startYear = new Date(startDate).getFullYear().toString();
      const endYear = new Date(endDate).getFullYear().toString();

      const from = startYear + startMonth;
      // console.log('from', from);

      const to = endYear + endMonth;
      // console.log('to', to);

      const kpiId = kpiid;

      // get monthwise records
      this.logger.debug(`started fetching monthwise result for kpiId=${kpiId}`);
      let monthwiseresult = await this.mySQLPrisma.$queryRaw`
        SELECT * 
        FROM kpiSummary 
        WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
          AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
          AND kpiId = ${kpiId}
          AND kpiLocation = ${locid}
          AND kpiEntity = ${entity}
        ORDER BY kpiYear ASC, kpiMonthYear ASC;
      `;
      // console.log('monthwisedata', monthwiseresult);

      // get monthwise totals
      this.logger.debug(
        `started fetching aggregated result for kpiId=${kpiId}`,
      );
      let result = await this.mySQLPrisma.$queryRaw`
        SELECT
          kpiYear,
          SUM(monthlySum) as totalMonthlySum,
          AVG(monthlyAverage) as averageMonthlyAverage,
          SUM(monthlyVariance) as totalMonthlyVariance,
          AVG(monthlyTarget) as avgTarget,
          SUM(monthlyTarget) as totalTarget,
          SUM(monthlyMinimumTarget) as totalMinimumTarget,
          AVG(monthlyMinimumTarget) as avgMinimumTarget,
          SUM(monthlyOperationalTarget) as totalOperationalTarget
        FROM kpiSummary
        WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
          AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
          AND kpiId = ${kpiId}
          AND kpiLocation = ${locid}
          AND kpiEntity = ${entity}
          AND kpiYear IS NOT NULL
          AND kpiMonthYear IS NOT NULL
        GROUP BY kpiYear
        ORDER BY kpiYear ASC;
      `;

      // get quarterwise totals
      this.logger.debug(
        `started fetching quarterwise result for kpiId=${kpiId}`,
      );
      let quarterwisedata = await this.mySQLPrisma.$queryRaw`
        SELECT
          kpiPeriod,
          kpiYear,
          SUM(monthlySum) as totalQuarterSum,
          AVG(monthlyAverage) as averageQuarterAverage,
          SUM(monthlyVariance) as totalQuarterVariance,
          SUM(monthlyTarget) as totalQuarterTarget,
          AVG(monthlyTarget) as avgTarget,
          SUM(monthlyMinimumTarget) as totalMinimumTarget,
          AVG(monthlyMinimumTarget) as avgMinimumTarget,
          SUM(monthlyOperationalTarget) as totalQuarterOperationalTarget
        FROM kpiSummary
        WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
          AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
          AND kpiId = ${kpiId}
          AND kpiLocation = ${locid}
          AND kpiEntity = ${entity}
        GROUP BY kpiPeriod, kpiYear
        ORDER BY kpiYear ASC, kpiPeriod ASC;
      `;
      let halfYearwiseData = await this.mySQLPrisma.$queryRaw`
  SELECT
    kpiSemiAnnual,
    kpiYear,
    SUM(monthlySum) as totalHalfYearSum,
    AVG(monthlyAverage) as halfYearAverage,
    SUM(monthlyVariance) as totalHalfYearVariance,
    SUM(monthlyTarget) as totalHalfYearTarget,
    AVG(monthlyTarget) as avgTarget,
    SUM(monthlyMinimumTarget) as totalMinimumTarget,
    AVG(monthlyMinimumTarget) as avgMinimumTarget,
    SUM(monthlyOperationalTarget) as totalHalfYearOperationalTarget
  FROM kpiSummary
  WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
    AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
    AND kpiId = ${kpiId}
    AND kpiLocation = ${locid}
    AND kpiEntity = ${entity}
    AND kpiSemiAnnual IS NOT NULL
  GROUP BY kpiSemiAnnual, kpiYear
  ORDER BY kpiYear ASC, kpiSemiAnnual ASC;
`;
      const finalResult = await this.toJson(result);

      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/calculationFromSummary/${kpiid}/${locid} successful initated by ${activeuser?.username} unit=${activeuser?.location?.locationName} entity=${activeuser?.entity?.entityName} `,
        '',
      );
      return {
        monthwiseresult,
        sum: JSON.parse(finalResult),
        quarter: quarterwisedata,
        halfYear: halfYearwiseData,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/calculationFromSummary/${kpiid}/${locid} failed initated by ${activeuser?.username} unit=${activeuser?.location?.locationName} entity=${activeuser?.entity?.entityName} `,
        error?.stack || error?.message,
      );
    }
  }

  async sorted(data) {
    const sortedData = data.sort((a, b) => {
      // Sort by year first
      if (a.kpiYear < b.kpiYear) return -1;
      if (a.kpiYear > b.kpiYear) return 1;

      // If years are equal, sort by month
      if (a.kpiMonthYear < b.kpiMonthYear) return -1;
      if (a.kpiMonthYear > b.kpiMonthYear) return 1;

      return 0;
    });

    return sortedData;
  }
  async toJson(data) {
    return JSON.stringify(data, (_, v) =>
      typeof v === 'bigint' ? `${v}n` : v,
    ).replace(/"(-?\d+)n"/g, (_, a) => a);
  }

  async getLocationEntityBU(userid, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
      include: { location: true, entity: true },
    });
    try {
      let locs = [];
      if (userid.kcRoles.roles.includes('ORG-ADMIN')) {
        this.logger.debug(
          `api/kpi-report/getLocationEntityBU started for org admi role`,
        );
        locs = await this.prisma.location.findMany({
          where: { organizationId: activeuser.organizationId, deleted: false },
          select: { locationName: true, id: true },
          orderBy: { locationName: 'asc' },
        });
        // //////////////console.log('locations', locs);
      } else {
        this.logger.debug(
          `api/kpi-report/getLocationEntityBU started for general user role for his location`,
        );
        locs = await this.prisma.location.findMany({
          where: { id: activeuser.locationId, deleted: false },
          select: { locationName: true, id: true },
          orderBy: { locationName: 'asc' },
        });
        // //////////////console.log('locations', locs);
      }
      let final = await locs.map(async (value) => {
        const bu = await this.prisma.locationBusiness.findMany({
          where: { locationId: value.id },
          // include: { name: true, id: true, },
          select: {
            // id: true,
            business: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        let name = JSON.stringify(bu);

        const entity = await this.prisma.entity.findMany({
          where: { locationId: { contains: value.id }, deleted: false },
          select: { id: true, entityName: true },
        });

        const data = {
          location: value,
          business: JSON.parse(name),
          entityname: entity,
        };

        return data;
      });
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getLocationEntityBU successful`,
        '',
      );
      return await Promise.all(final);
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getLocationEntityBU failed`,
        '',
      );
    }
  }
  async getKpiForLocation(query, randomNumber) {
    try {
      const { kpiLocation, kpiEntity } = query;
      this.logger.debug(
        `api/kpi-report/getKpiForLocation started with query ${query}`,
      );
      // Fetch KPIs from the database
      const kpis = await this.mySQLPrisma.kpiSummary.findMany({
        where: {
          kpiLocation: kpiLocation,
          kpiEntity: kpiEntity,
        },
        select: {
          kpiId: true,
        },
      });

      // console.log('kpis', kpis);

      // Prepare an array to store final data
      const finalData = [];

      // Use Promise.all to handle concurrent fetching
      await Promise.all(
        kpis.map(async (value) => {
          try {
            // Fetch KPI details from another model
            this.logger.debug(`Fetching data for kpi ${value?.kpiId}`);
            const name = await this.KpiModel.findById(value.kpiId);
            // console.log('kpiName', name);

            if (name) {
              const data = {
                kpiId: value.kpiId,
                kpiname: name.kpiName,
                kpiuom: name.uom,
                targettype: name.kpiTargetType,
                displayType: name.displayType,
                deleted: name.deleted,
                frequency: name.frequency,
              };
              finalData.push(data);
            }
          } catch (error) {
            this.logger.error(
              `trace id = ${randomNumber} Error fetching KPI details for kpiId=${value.kpiId} ${error}`,
              error?.stack || error?.message,
            );
          }
        }),
      );

      const uniqueArray = finalData.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.kpiId === item.kpiId),
      );

      // Sort uniqueArray by kpiname alphabetically
      const sortedArray = uniqueArray.sort((a, b) => {
        if (a.kpiname < b.kpiname) return -1;
        if (a.kpiname > b.kpiname) return 1;
        return 0;
      });

      // Log success and return the result
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getKpiForLocation successful`,
        '',
      );

      return sortedArray;
      // Log success and return the result

      // return uniqueArray;
    } catch (error) {
      // Log the error if the entire process fails
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/getKpiForLocation failed ${error} for query=${query}`,
        error?.stack || error?.message,
      );
      throw error; // Optionally rethrow the error to be handled by the caller
    }
  }

  async getCategoryForLocation(query) {
    const { kpiLocation, kpiEntity } = query;
    // console.log('kpilocation,kpiEntity', query);
    this.logger.debug(
      `GET /api/kpi-report/getCategoryForLocation started for query ${query}`,
    );
    //get the kra id and objective id from summary table
    let kras;
    if (kpiEntity !== 'All') {
      this.logger.debug(`fetching categories when entity is not All`);
      kras = await this.mySQLPrisma.kpiSummary.findMany({
        where: {
          kpiLocation: kpiLocation,
          kpiEntity: kpiEntity,
        },
        select: {
          kraId: true,
          objectiveId: true,
        },
      });
    } else {
      this.logger.debug(
        `Fetching categories for a given location ${kpiLocation}`,
      );
      kras = await this.mySQLPrisma.kpiSummary.findMany({
        where: {
          kpiLocation: kpiLocation,
          // kpiEntity: kpiEntity,
        },
        select: {
          kraId: true,
          objectiveId: true,
        },
      });
    }
    // console.log('kra', kras);
    //get all the categories related to this kra by validating two conditions
    //1. if kra doesnot exists(check using obj id if it is null no kra so kraid will be catid) then get the corresponding category
    //2. if it exists (obj not null) then get the kraname and corresponding cat data
    let kpinames = [];
    // const final = await kras.map(async (value) =>
    for (let value of kras) {
      if (value.objectiveId === null) {
        let name = await this.kpiReportCategoryModel
          .findById(value.kraId)
          .select('kpiReportCategoryName _id');
        // console.log('name ', name);
        let data = {
          kraid: null,
          objectiveid: null,
          categoryid: value.kraId,
          categoryname: name?.kpiReportCategoryName,
        };
        kpinames.push(data);
      } else {
        // let kraid = await this.getCategoryById(value.kraId);
        // console.log('value.kraId', value.kraId);
        const id = new ObjectId(value.kraId);
        let name = await this.orgObjective
          .findById(id)
          .select('_id ObjectiveCategory');
        // let catid = await this.kpiReportCategoryModel
        //   .find({ kraId: value.kraId })
        //   .select('_id kpiReportCategoryName');
        // console.log('name', name);
        let data = {
          kraid: value.kraId,
          objectiveid: name._id,
          categoryid: value.kraId,
          categoryname: name.ObjectiveCategory,

          // categoryid: catid,
        };

        kpinames.push(data);
      }
      // return kpinames;
    }
    // //////////////console.log('final', kpinames);
    return await Promise.all(kpinames);
  }

  async getComputationForCategoryMonthwise(query, id, userid, randomNumber) {
    const activUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
      include: {
        entity: true,
        location: true,
      },
    });
    try {
      const catresult = await this.getCategoryById(id);
      // console.log('catresult', catresult);
      let allkpidata = [];
      if (catresult) {
        for (let value of catresult.kpiInfo) {
          const { startDate, endDate, location, entity } = query;
          const startMonth = new Date(startDate).getMonth().toString();
          const endMonth = new Date(endDate).getMonth().toString();
          const startYear = new Date(startDate).getFullYear().toString();
          const endYear = new Date(endDate).getFullYear().toString();
          const from = startYear + startMonth;
          ////////////////console.log(from);
          const to = endYear + endMonth;
          const kpiId = value.kpiId;
          //get monthwise records

          let monthwiseresult = await this.mySQLPrisma
            .$queryRaw`SELECT * FROM kpiSummary
      WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from} 
       AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
       AND kpiId = ${kpiId}
       AND kpiLocation=${location}
       AND kpiEntity=${entity}
        AND kraId = ${id}`;
          //get monthwise totals
          let result = await this.mySQLPrisma.$queryRaw`
  SELECT kpiYear,
    SUM(monthlySum) as totalMonthlySum,
    AVG(monthlyAverage) as averageMonthlyAverage,
    SUM(monthlyVariance) as totalMonthlyVariance,
    AVG(percentage) as avgEfficiency,
    SUM(monthlyTarget) as totalTarget
  FROM kpiSummary
  WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
    AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
    AND kpiId = ${kpiId}
    AND kraId = ${id}
    AND kpiYear IS NOT NULL
    AND kpiMonthYear IS NOT NULL
  GROUP BY kpiYear`;
          const finalResult = await this.toJson(result);
          const data = {
            kpi: value.kpiName,
            uom: value.kpiUOM,
            kpitype: value.kpiTargetType,
            kpidatamonthwise: monthwiseresult,
            //kpidataquarterwise: quarterwisedata,
            sum: JSON.parse(finalResult),
          };
          // //////////////console.log('data', data);
          allkpidata.push(data);
        }
        return allkpidata;
      } else {
        let condition: any = {
          organizationId: activUser?.organizationId,
          deleted: false,
        };
        this.logger.debug(
          `traceId=${randomNumber} - Building condition for KPI query`,
          JSON.stringify(condition),
        );
        if (id && id !== 'All') {
          condition.categoryId = id;
        }
        let objective,
          objnames = [];

        if (!!query.objectiveId && query.objectiveId !== '') {
          // condition.objectiveId = { $in: [query.objectiveId] };
          // if (Array.isArray(query.objectiveId)) {
          //   condition.objectiveId = {
          //     $in: query.objectiveId,
          //   };
          // } else {
          //   condition.objectiveId = {
          //     $elemMatch: { $eq: query.objectiveId },
          //   };
          // }
          // console.log('inside if', query.objectiveId);
          condition.objectiveId = {
            $in: [query.objectiveId],
          };
          objective = await this.objectiveMaster.findById(query.objectiveId);
        }
        //if location is there then add it to condition and hnadle null and undefined cases
        if (
          query.location &&
          (query.location !== null || query.location != undefined)
        ) {
          if (Array.isArray(query.location)) {
            condition.locationId = {
              $in: query.location,
            };
          } else {
            condition.locationId = query.location;
          }
        }

        if (
          query.entity &&
          (query.entity !== null ||
            query.entity != undefined ||
            query.entity !== 'All')
        ) {
          if (Array.isArray(query.entity)) {
            // If 'All' is in the array, skip the entityId condition
            if (!query.entity.includes('All')) {
              // console.log('inside if');
              condition.entityId = { $in: query.entity }; // Filter by entities in the array
            }
          } else if (query.entity && query.entity !== 'All') {
            // console.log('inside else');
            // If 'entity' is a single value and not 'All', apply the condition
            condition.entityId = query.entity; // Single entity filter
          }
        }
        // console.log('condition', condition);
        const kpis = await this.KpiModel.find(condition);
        this.logger.debug(
          `traceId=${randomNumber} - Found ${kpis.length} KPIs for condition ${condition}`,
        );
        let kraFilter = '';
        if (id && id !== 'All') {
          kraFilter = `AND kraId = '${id}'`;
        }
        // console.log('kpis', kpis);
        for (let value of kpis) {
          const { startDate, endDate } = query;
          const startMonth = new Date(startDate)
            .getMonth()
            .toString()
            .padStart(2, '0');
          const endMonth = new Date(endDate)
            .getMonth()
            .toString()
            .padStart(2, '0');
          const startYear = new Date(startDate).getFullYear().toString();
          const endYear = new Date(endDate).getFullYear().toString();
          const from = startYear + startMonth;
          ////////////////console.log(from);
          const to = endYear + endMonth;
          const kpiId = value._id;
          //get monthwise records
          this.logger.debug(
            `traceId=${randomNumber} - Running KPI summary query for kpiId=${kpiId} from=${from} to=${to}`,
          );
          let monthwiseresult = await this.mySQLPrisma.$queryRawUnsafe(
            `
            SELECT * FROM kpiSummary
            WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ?
              AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ?
              AND kpiId = ?
              ${kraFilter}
          `,
            from,
            to,
            kpiId,
          );

          let result = await this.mySQLPrisma.$queryRawUnsafe(
            `
            SELECT kpiYear,
              SUM(monthlySum) as totalMonthlySum,
              AVG(monthlyAverage) as averageMonthlyAverage,
              SUM(monthlyVariance) as totalMonthlyVariance,
              AVG(percentage) as avgEfficiency,
              SUM(monthlyTarget) as totalTarget
            FROM kpiSummary
            WHERE CONCAT(kpiYear, kpiMonthYear) >= ?
              AND CONCAT(kpiYear, kpiMonthYear) <= ?
              AND kpiId = ?
              ${kraFilter}
              AND kpiYear IS NOT NULL
              AND kpiMonthYear IS NOT NULL
            GROUP BY kpiYear
          `,
            from,
            to,
            kpiId,
          );
          // console.log('result in monthwise', result);
          for (let i of value.objectiveId) {
            const result = await this.objectiveMaster
              .findById(i)
              .select('ObjectiveName');
            objnames.push(result?.ObjectiveName);
          }
          const finalResult = await this.toJson(result);
          const data = {
            kpi: value.kpiName,
            uom: value.uom,
            kpitype: value.kpiTargetType,
            kpidatamonthwise: monthwiseresult,
            objectiveName: query.objectiveId
              ? objective.ObjectiveName
              : objnames,
            //kpidataquarterwise: quarterwisedata,
            sum: JSON.parse(finalResult),
          };
          // //////////////console.log('data', data);
          allkpidata.push(data);
        }
        this.logger.log(
          `traceId=${randomNumber} -GET /api/kpi-report/getComputationForCategoryMonthwise/${id} successful for user=${
            activUser?.username
          }, entity=${activUser?.entity?.entityName}, location=${
            activUser?.location?.locationName
          }, query=\n${JSON.stringify(query, null, 2)}`,
          '',
        );
        return allkpidata;
      }
    } catch (error) {
      this.logger.error(
        `traceId=${randomNumber} -GET /api/kpi-report/getComputationForCategoryMonthwise/${id} successful for user=${
          activUser?.username
        }, entity=${activUser?.entity?.entityName}, location=${
          activUser?.location?.locationName
        }, query=\n${JSON.stringify(query, null, 2)}`,
        error.stack || error.message,
      );
      throw error;
    }
  }
  async getComputationForCategoryYearwise(query, id, userid, traceId) {
    const activUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
      include: {
        entity: true,
        location: true,
      },
    });
    try {
      let allkpidata = [];
      let condition: any = {
        organizationId: activUser?.organizationId,
        deleted: false,
      };

      if (id && id !== 'All') {
        condition.categoryId = id;
      }

      let objective,
        objnames = [];

      if (query.objectiveId) {
        condition.objectiveId = { $in: [query.objectiveId] };
        objective = await this.objectiveMaster.findById(query.objectiveId);
      }

      if (query.location) {
        condition.locationId = Array.isArray(query.location)
          ? { $in: query.location }
          : query.location;
      }

      if (query.entity && query.entity !== 'All') {
        if (Array.isArray(query.entity) && !query.entity.includes('All')) {
          condition.entityId = { $in: query.entity };
        } else if (!Array.isArray(query.entity)) {
          condition.entityId = query.entity;
        }
      }

      this.logger.debug(
        `traceId=${traceId} - Building condition for KPI query`,
        JSON.stringify(condition),
      );

      const kpis = await this.KpiModel.find(condition);
      this.logger.debug(
        `traceId=${traceId} - Found ${kpis.length} KPIs for condition ${condition}`,
      );

      for (let value of kpis) {
        const { startDate, endDate } = query;
        const from = `${new Date(startDate).getFullYear()}${String(
          new Date(startDate).getMonth(),
        ).padStart(2, '0')}`;
        const to = `${new Date(endDate).getFullYear()}${String(
          new Date(endDate).getMonth(),
        ).padStart(2, '0')}`;
        const kpiId = value._id;

        const kraFilter = id && id !== 'All' ? `AND kraId = ?` : '';
        const rawQuery = `
          SELECT kpiYear,
            SUM(monthlySum) as totalMonthlySum,
            AVG(monthlyAverage) as averageMonthlyAverage,
            SUM(monthlyVariance) as totalMonthlyVariance,
            AVG(percentage) as avgEfficiency,
            SUM(monthlyTarget) as totalTarget
          FROM kpiSummary
          WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ?
            AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ?
            AND kpiId = ?
            ${kraFilter}
            AND kpiYear IS NOT NULL
            AND kpiMonthYear IS NOT NULL
          GROUP BY kpiYear
        `;

        const params = [from, to, kpiId];
        if (kraFilter) params.push(id);

        this.logger.debug(
          `traceId=${traceId} - Running KPI summary query for kpiId=${kpiId}`,
        );

        const result = await this.mySQLPrisma.$queryRawUnsafe(
          rawQuery,
          ...params,
        );

        for (let i of value.objectiveId) {
          const obj = await this.objectiveMaster
            .findById(i)
            .select('ObjectiveName');
          objnames.push(obj?.ObjectiveName);
        }

        const finalResult = await this.toJson(result);

        allkpidata.push({
          kpi: value.kpiName,
          uom: value.uom,
          kpiId: kpiId,
          kpitype: value.kpiTargetType,
          kraId: id,
          objectiveName: query.objectiveId
            ? objective?.ObjectiveName
            : objnames,
          sum: JSON.parse(finalResult),
        });
      }

      this.logger.log(
        `traceId=${traceId} -GET /api/kpi-report/getComputationForCategoryYearwise/${id} successful for user=${
          activUser?.username
        }, entity=${activUser?.entity?.entityName}, location=${
          activUser?.location?.locationName
        }, query=\n${JSON.stringify(query, null, 2)}`,
        '',
      );

      return allkpidata;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} -GET /api/kpi-report/getComputationForCategoryYearwise/${id} failed for user=${
          activUser?.username
        }, entity=${activUser?.entity?.entityName}, location=${
          activUser?.location?.locationName
        }, query=\n${JSON.stringify(query, null, 2)}`,
        error.stack || error.message,
      );
      throw error;
    }
  }

  async getComputationForCategoryDaywise(
    id,

    randomNumber,
    query,
  ) {
    // console.log('id,lte,gte', id, new Date(lte), new Date(gte));
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: id,
      },
      include: {
        entity: true,
        location: true,
      },
    });
    try {
      const catresult = await this.getCategoryById(id);
      if (catresult) {
        // console.log('catresult', catresult);
        let allkpidata = [];
        // let kraid = catresult.kraId;
        // //////////////console.log('kraid', kraid);
        for (let value of catresult?.kpiInfo) {
          // console.log('', value.kpiId);

          const daywisedata = await this.mySQLPrisma
            .$queryRaw`SELECT * FROM reportKpiDataNewData 
    WHERE reportDate >= ${new Date(query.gte)} 
    AND reportkpidatanewdata.reportDate <= ${new Date(query.lte)} 
    AND reportkpidatanewdata.kpiId = ${value.kpiId} 
    AND reportkpidatanewdata.kpiCategoryId = ${id};`;
          // console.log('Daywise data', daywisedata);

          const aggregatedata = await this.mySQLPrisma
            .$queryRaw`SELECT  SUM(reportkpidatanewdata.kpiValue) as totalMonthlySum,
    AVG(reportkpidatanewdata.kpiValue) as monthlyAverage,
    SUM(reportkpidatanewdata.kpiVariance) as totalMonthlyVariance,
    AVG(reportkpidatanewdata.percentage) as averagepercentage,
    SUM(reportkpidatanewdata.target) as totalTarget
  FROM reportKpiDataNewData 
  WHERE DATE(reportkpidatanewdata.reportDate) >= ${new Date(query.gte)}
  AND DATE(reportkpidatanewdata.reportDate) <= ${new Date(query.lte)} 
  AND reportkpidatanewdata.kpiId = ${value.kpiId} 
  AND reportkpidatanewdata.kpiCategoryId = ${id};`;
          // console.log('aggregated data', aggregatedata);

          const data = {
            kpi: value.kpiName,
            uom: value.kpiUOM,
            kpitype: value.kpiTargetType,
            kpidata: daywisedata,
            aggregate: aggregatedata,
          };
          // console.log('data', data);
          allkpidata.push(data);
        }
        return allkpidata;
      } else {
        let condition: any = {
          organizationId: activeUser?.organizationId,
          deleted: false,
        };
        if (id && id !== 'All') {
          condition.categoryId = id;
        }
        let categoryFilter = '';
        if (id && id !== 'All') {
          categoryFilter = `AND kpiCategoryId = '${id}'`;
        }
        //if objectiveID is there then add to the condition
        let objective,
          objnames = [];
        if (
          query.objectiveId &&
          (query.objectiveId !== null || query.objectiveId !== undefined)
        ) {
          condition.objectiveId = {
            $in: [query.objectiveId],
          };
          objective = await this.objectiveMaster.findById(query.objectiveId);
        }
        //if location is passed then add to the condtion and handle null conditions
        if (
          query.location &&
          (query.location !== null || query.location !== undefined)
        ) {
          if (Array.isArray(query.location)) {
            condition.locationId = {
              $in: query.location,
            };
          } else {
            condition.locationId = query.location;
          }
        }
        //if enity is passed then add to the condition and handle null cases
        if (
          query.entity &&
          (query.entity !== null || query.entity !== undefined)
        ) {
          if (Array.isArray(query.entity)) {
            // If 'All' is in the array, skip the entityId condition
            if (!query.entity.includes('All')) {
              // console.log('inside if');
              condition.entityId = { $in: query.entity }; // Filter by entities in the array
            }
          } else if (query.entity && query.entity !== 'All') {
            // console.log('inside else');
            // If 'entity' is a single value and not 'All', apply the condition
            condition.entityId = query.entity; // Single entity filter
          }
        }
        this.logger.debug(
          `traceId=${randomNumber} - Building condition for KPI query`,
          JSON.stringify(condition),
        );
        const kpis = await this.KpiModel.find(condition);
        this.logger.debug(
          `traceId=${randomNumber} - Found ${kpis.length} KPIs for condition ${condition}`,
        );
        let allkpidata = [];
        for (let value of kpis) {
          const kpiid = value._id.toString();
          const daywisedata = await this.mySQLPrisma.$queryRawUnsafe(
            `
            SELECT * FROM reportKpiDataNewData 
            WHERE reportDate >= ? 
              AND reportDate <= ? 
              AND kpiId = ?
              ${categoryFilter};
          `,
            new Date(query.gte),
            new Date(query.lte),
            kpiid,
          );
          this.logger.debug(
            `traceId=${randomNumber} - Running KPI summary query for kpiId=${kpiid} and query ${query}`,
          );
          const aggregatedata = await this.mySQLPrisma.$queryRawUnsafe(
            `
            SELECT  
              SUM(kpiValue) as totalMonthlySum,
              AVG(kpiValue) as monthlyAverage,
              SUM(kpiVariance) as totalMonthlyVariance,
              AVG(percentage) as averagepercentage,
              SUM(target) as totalTarget
            FROM reportKpiDataNewData 
            WHERE DATE(reportDate) >= ?
              AND DATE(reportDate) <= ?
              AND kpiId = ?
              ${categoryFilter};
          `,
            new Date(query.gte),
            new Date(query.lte),
            value._id,
          );
          for (let i of value.objectiveId) {
            const result = await this.objectiveMaster
              .findById(i)
              .select('ObjectiveName');
            objnames.push(result.ObjectiveName);
          }

          const data = {
            kpi: value.kpiName,
            uom: value.uom,
            kpitype: value.kpiTargetType,
            objectiveName: query.objectiveId
              ? objective?.ObjectiveName
              : objnames,
            kpidata: daywisedata,
            aggregate: aggregatedata,
          };
          // console.log('data', data);
          allkpidata.push(data);
        }
        this.logger.log(
          `trace id = ${randomNumber} GET /api/kpi-report/getComputationForCategoryDaywise/${id} successful successful for user=${
            activeUser?.username
          }, entity=${activeUser?.entity?.entityName}, location=${
            activeUser?.location?.locationName
          }, query=\n${JSON.stringify(query, null, 2)}`,
          '',
        );
        return allkpidata;
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/getComputationForCategoryDaywise/${id} failed ${error} successful for user=${
          activeUser?.username
        }, entity=${activeUser?.entity?.entityName}, location=${
          activeUser?.location?.locationName
        }, query=\n${JSON.stringify(query, null, 2)}`,
        error.stack || error.message,
      );
    }
  }
  //giving pad start for removing extra 0
  async getComputationForCategoryQuarterwise(query, id, userid, randomNumber) {
    const activUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
      include: {
        entity: true,
        location: true,
      },
    });
    try {
      const catresult = await this.getCategoryById(id);
      // console.log('catresult', query);
      if (catresult) {
        let allkpidata = [];
        for (let value of catresult.kpiInfo) {
          const { startDate, endDate } = query;
          const startMonth = new Date(startDate)
            .getMonth()
            .toString()
            .padStart(2, '0'); // Pad to ensure 2 digits
          const endMonth = new Date(endDate)
            .getMonth()
            .toString()
            .padStart(2, '0'); // Pad to ensure 2 digits

          // Get year values
          const startYear = new Date(startDate).getFullYear().toString();
          const endYear = new Date(endDate).getFullYear().toString();

          const from = startYear + startMonth;
          ////////////////console.log(from);
          const to = endYear + endMonth;
          const kpiId = value.kpiId;
          //get quarterwise totals
          let quarterwisedata = await this.mySQLPrisma.$queryRaw`
      SELECT kpiPeriod, kpiYear,
        SUM(monthlySum) as totalQuarterSum,
        AVG(monthlyAverage) as averageQuarterAverage,
        SUM(monthlyVariance) as totalQuarterVariance,
        AVG(percentage) as avgEfficiency,
        SUM(monthlyTarget) as totalQuarterTarget
      FROM kpiSummary
      WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
        AND CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) <= ${to}
        AND kpiId= ${kpiId}
        AND kraId = ${id}
      GROUP BY kpiPeriod, kpiYear`;
          // console.log('quarterwisedata', quarterwisedata);
          const data = {
            kpi: value.kpiName,
            uom: value.kpiUOM,
            kpitype: value.kpiTargetType,
            kpidata: quarterwisedata,
          };
          // //////////////console.log('data', data);
          allkpidata.push(data);
        }
        return allkpidata;
      } else {
        let allkpidata = [];
        let condition: any = {
          organizationId: activUser?.organizationId,
          deleted: false,
        };
        if (id && id !== 'All') {
          condition.categoryId = id;
        }
        let objective,
          objnames = [];
        if (
          query.objectiveId &&
          (query.objectiveId !== null || query.objectiveId !== undefined)
        ) {
          condition.objectiveId = {
            $in: [query.objectiveId],
          };
          objective = await this.objectiveMaster.findById(query.objectiveId);
        }
        if (
          query.location &&
          (query.location !== null || query.location !== undefined)
        ) {
          if (Array.isArray(query.location)) {
            condition.locationId = {
              $in: query.location,
            };
          } else {
            condition.locationId = query.location;
          }
        }

        if (
          query.entity &&
          (query.entity !== null || query.entity !== undefined)
        ) {
          if (Array.isArray(query.entity)) {
            // If 'All' is in the array, skip the entityId condition
            if (!query.entity.includes('All')) {
              // console.log('inside if');
              condition.entityId = { $in: query.entity }; // Filter by entities in the array
            }
          } else if (query.entity && query.entity !== 'All') {
            // console.log('inside else');
            // If 'entity' is a single value and not 'All', apply the condition
            condition.entityId = query.entity; // Single entity filter
          }
        }

        this.logger.debug(
          `traceId=${randomNumber} - Building condition for KPI query`,
          JSON.stringify(condition),
        );
        // console.log('condition', condition);
        const kpis = await this.KpiModel.find(condition);
        this.logger.debug(
          `traceId=${randomNumber} - Found ${kpis.length} KPIs for condition ${condition}`,
        );
        for (let value of kpis) {
          const { startDate, endDate } = query;
          const startMonth = new Date(startDate)
            .getMonth()
            .toString()
            .padStart(2, '0');

          const endMonth = new Date(endDate)
            .getMonth()
            .toString()
            .padStart(2, '0');
          // .padStart(2, '0');
          const startYear = new Date(startDate).getFullYear().toString();
          const endYear = new Date(endDate).getFullYear().toString();
          const from = startYear + startMonth;
          // console.log('start and end', query);
          // console.log('from', from);
          const to = endYear + endMonth;
          // console.log('to', to);
          const kpiId = value._id;
          //get quarterwise totals

          const kraFilter = id && id !== 'All' ? `AND kraId = ?` : '';

          const rawQuery = `
            SELECT kpiPeriod, kpiYear,
              SUM(monthlySum) as totalQuarterSum,
              AVG(monthlyAverage) as averageQuarterAverage,
              SUM(monthlyVariance) as totalQuarterVariance,
              AVG(percentage) as avgEfficiency,
              SUM(monthlyTarget) as totalQuarterTarget
            FROM kpiSummary
            WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ?
              AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ?
              AND kpiId = ?
              ${kraFilter}
            GROUP BY kpiPeriod, kpiYear
          `;

          const params = [from, to, kpiId];
          if (kraFilter) params.push(id); // add id only if kraFilter is applied
          this.logger.debug(
            `traceId=${randomNumber} - Running KPI summary query for kpiId=${kpiId}`,
          );
          const quarterwisedata = await this.mySQLPrisma.$queryRawUnsafe(
            rawQuery,
            ...params,
          );

          // console.log('quarterwise data', quarterwisedata);
          for (let i of value.objectiveId) {
            const result = await this.objectiveMaster
              .findById(i)
              .select('ObjectiveName');
            objnames.push(result.ObjectiveName);
          }
          const data = {
            kpi: value.kpiName,
            uom: value.uom,
            objectiveName: query.objectiveId
              ? objective?.ObjectiveName
              : objnames,
            kpitype: value.kpiTargetType,
            kpidata: quarterwisedata,
          };
          // console.log('data', data);
          allkpidata.push(data);
        }
        this.logger.log(
          `traceId=${randomNumber} -GET /api/kpi-report/getComputationForCategoryQuarterwise/${id} successful for user=${
            activUser?.username
          }, entity=${activUser?.entity?.entityName}, location=${
            activUser?.location?.locationName
          }, query=\n${JSON.stringify(query, null, 2)}`,
          '',
        );
        return allkpidata;
      }
    } catch (error) {
      this.logger.error(
        `traceId=${randomNumber} -GET /api/kpi-report/getComputationForCategoryQuarterwise/${id} failed for user=${
          activUser?.username
        }, entity=${activUser?.entity?.entityName}, location=${
          activUser?.location?.locationName
        }, query=\n${JSON.stringify(query, null, 2)}`,
        error.stack || error.message,
      );
    }
  }
  // async computeFiscalYearQuarters(userid) {
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: { kcId: userid },
  //   });

  //   const organization = await this.prisma.organization.findFirst({
  //     where: { id: activeUser.organizationId },
  //     select: { fiscalYearQuarters: true },
  //   });

  //   // console.log('fiscalyear', organization);

  //   let startMonth = 1; // Default start month (January)
  //   let endMonth = 12; // Default end month (December)

  //   if (organization.fiscalYearQuarters === 'April - Mar') {
  //     startMonth = 4; // Fiscal year starts in April
  //     endMonth = 3; // Fiscal year ends in March of the following year
  //   }

  //   let currentYear = new Date().getFullYear();
  //   // console.log('currentyear', currentYear);
  //   const quarters = [];

  //   for (let i = 0; i < 4; i++) {
  //     const quarterStartMonth = startMonth + i * 3;
  //     let quarterEndMonth = quarterStartMonth + 2;

  //     if (quarterEndMonth > 12) {
  //       quarterEndMonth -= 12;
  //       currentYear++;
  //     }

  //     const quarterStartDate = new Date(currentYear, quarterStartMonth - 1, 1);
  //     const lastDayOfMonth = new Date(
  //       currentYear,
  //       quarterEndMonth,
  //       0,
  //     ).getDate();
  //     const quarterEndDate = new Date(
  //       currentYear,
  //       quarterEndMonth - 1,
  //       lastDayOfMonth,
  //     );

  //     quarters.push({
  //       quarterNumber: i + 1,
  //       startDate: quarterStartDate.toLocaleDateString(),
  //       endDate: quarterEndDate.toLocaleDateString(),
  //     });
  //   }

  //   // console.log('quarters in computefiscalyear', quarters);
  //   return quarters;
  // }
  async computeFiscalYearQuarters(userid, fiscalYear) {
    // console.log('fiscalyear', fiscalYear);
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });

    const organization = await this.prisma.organization.findFirst({
      where: { id: activeUser.organizationId },
      select: { fiscalYearQuarters: true, fiscalYearFormat: true },
    });

    let startMonth = 1; // Default start month (January)
    let endMonth = 12; // Default end month (December)

    if (organization.fiscalYearQuarters === 'April - Mar') {
      startMonth = 4; // Fiscal year starts in April
      endMonth = 3; // Fiscal year ends in March of the following year
    }
    if (organization.fiscalYearFormat === 'YY-YY+1') {
      const [startYear, endYear] = fiscalYear.split('-').map(Number);
      const currentYear = new Date().getFullYear();
      const startFullYear = this.getFiscalFullYear(startYear, currentYear);
      const endFullYear = this.getFiscalFullYear(endYear, currentYear);
      // console.log('startFullyear,endfullyear', startFullYear, endFullYear);
      const quarters = [];

      for (let i = 0; i < 4; i++) {
        let quarterStartMonth = startMonth + i * 3;
        let quarterEndMonth = quarterStartMonth + 2;
        let quarterStartYear = startFullYear;
        let quarterEndYear = startFullYear;

        // Handle wrap-around when month exceeds 12
        if (quarterStartMonth > 12) {
          quarterStartMonth -= 12;
          quarterStartYear++;
        }
        if (quarterEndMonth > 12) {
          quarterEndMonth -= 12;
          quarterEndYear++;
        }

        // Stop computation if we exceed the end year
        if (
          quarterEndYear > endFullYear ||
          (quarterEndYear === endFullYear && quarterEndMonth > endMonth)
        ) {
          break;
        }

        // Compute quarter start and end dates
        const quarterStartDate = new Date(
          quarterStartYear,
          quarterStartMonth - 1,
          1,
        );
        const lastDayOfMonth = new Date(
          quarterEndYear,
          quarterEndMonth,
          0,
        ).getDate();
        const quarterEndDate = new Date(
          quarterEndYear,
          quarterEndMonth - 1,
          lastDayOfMonth,
        );

        quarters.push({
          quarterNumber: i + 1,
          startDate: quarterStartDate.toLocaleDateString('en-GB'),
          endDate: quarterEndDate.toLocaleDateString('en-GB'),
        });
      }
      // console.log('quarters', quarters);
      return quarters;
    } else if (organization.fiscalYearFormat === 'YYYY') {
      const currentYear = new Date().getFullYear();
      // const startFullYear =
      // const endFullYear = this.getFiscalFullYear(endYear, currentYear);
      // console.log('startFullyear,endfullyear', startFullYear, endFullYear);
      const quarters = [];

      for (let i = 0; i < 4; i++) {
        let quarterStartMonth = startMonth + i * 3;
        let quarterEndMonth = quarterStartMonth + 2;
        let quarterStartYear = currentYear;
        let quarterEndYear = currentYear;

        // Handle wrap-around when month exceeds 12
        if (quarterStartMonth > 12) {
          quarterStartMonth -= 12;
          quarterStartYear++;
        }
        if (quarterEndMonth > 12) {
          quarterEndMonth -= 12;
          quarterEndYear++;
        }

        // Stop computation if we exceed the end year
        if (
          quarterEndYear > currentYear ||
          (quarterEndYear === currentYear && quarterEndMonth > endMonth)
        ) {
          break;
        }

        // Compute quarter start and end dates
        const quarterStartDate = new Date(
          quarterStartYear,
          quarterStartMonth - 1,
          1,
        );
        const lastDayOfMonth = new Date(
          quarterEndYear,
          quarterEndMonth,
          0,
        ).getDate();
        const quarterEndDate = new Date(
          quarterEndYear,
          quarterEndMonth - 1,
          lastDayOfMonth,
        );

        quarters.push({
          quarterNumber: i + 1,
          startDate: quarterStartDate.toLocaleDateString('en-GB'),
          endDate: quarterEndDate.toLocaleDateString('en-GB'),
        });
      }
      return quarters;
    }
  }

  getFiscalFullYear(year, currentYear) {
    const currentTwoDigitYear = currentYear % 100;
    const currentCentury = Math.floor(currentYear / 100) * 100;

    // Define the threshold to switch centuries
    const threshold = 50;

    // Calculate the absolute difference between the years
    let diff = Math.abs(currentTwoDigitYear - year);

    // Determine the century based on the difference and the threshold
    if (diff <= threshold) {
      // The year is within the same century as the current year
      return currentCentury + year;
    } else {
      // The year is in the other century
      if (currentYear > year) {
        // If the current year is greater, assume it belongs to the past century
        return currentCentury - 100 + year;
      } else {
        // Otherwise, assume it belongs to the future century
        return currentCentury + 100 + year;
      }
    }
  }
  async computeFiscalYearQuartersForSummary(organizationId, fiscalYear) {
    // console.log('fiscalyear', fiscalYear);

    const organization = await this.prisma.organization.findFirst({
      where: { id: organizationId },
      select: { fiscalYearQuarters: true, fiscalYearFormat: true },
    });

    let startMonth = 1; // Default start month (January)
    let endMonth = 12; // Default end month (December)

    if (organization.fiscalYearQuarters === 'April - Mar') {
      startMonth = 4; // Fiscal year starts in April
      endMonth = 3; // Fiscal year ends in March of the following year
    }
    if (organization.fiscalYearFormat === 'YY-YY+1') {
      const [startYear, endYear] = fiscalYear.split('-').map(Number);
      const currentYear = new Date().getFullYear();
      const startFullYear = this.getFiscalFullYear(startYear, currentYear);
      const endFullYear = this.getFiscalFullYear(endYear, currentYear);
      // console.log('startFullyear,endfullyear', startFullYear, endFullYear);
      const quarters = [];

      for (let i = 0; i < 4; i++) {
        let quarterStartMonth = startMonth + i * 3;
        let quarterEndMonth = quarterStartMonth + 2;
        let quarterStartYear = startFullYear;
        let quarterEndYear = startFullYear;

        // Handle wrap-around when month exceeds 12
        if (quarterStartMonth > 12) {
          quarterStartMonth -= 12;
          quarterStartYear++;
        }
        if (quarterEndMonth > 12) {
          quarterEndMonth -= 12;
          quarterEndYear++;
        }

        // Stop computation if we exceed the end year
        if (
          quarterEndYear > endFullYear ||
          (quarterEndYear === endFullYear && quarterEndMonth > endMonth)
        ) {
          break;
        }

        // Compute quarter start and end dates
        const quarterStartDate = new Date(
          quarterStartYear,
          quarterStartMonth - 1,
          1,
        );
        const lastDayOfMonth = new Date(
          quarterEndYear,
          quarterEndMonth,
          0,
        ).getDate();
        const quarterEndDate = new Date(
          quarterEndYear,
          quarterEndMonth - 1,
          lastDayOfMonth,
        );

        quarters.push({
          quarterNumber: i + 1,
          startDate: quarterStartDate.toLocaleDateString('en-GB'),
          endDate: quarterEndDate.toLocaleDateString('en-GB'),
        });
      }
      // console.log('quarters', quarters);
      return quarters;
    } else if (organization.fiscalYearFormat === 'YYYY') {
      const currentYear = new Date().getFullYear();
      // const startFullYear =
      // const endFullYear = this.getFiscalFullYear(endYear, currentYear);
      // console.log('startFullyear,endfullyear', startFullYear, endFullYear);
      const quarters = [];

      for (let i = 0; i < 4; i++) {
        let quarterStartMonth = startMonth + i * 3;
        let quarterEndMonth = quarterStartMonth + 2;
        let quarterStartYear = currentYear;
        let quarterEndYear = currentYear;

        // Handle wrap-around when month exceeds 12
        if (quarterStartMonth > 12) {
          quarterStartMonth -= 12;
          quarterStartYear++;
        }
        if (quarterEndMonth > 12) {
          quarterEndMonth -= 12;
          quarterEndYear++;
        }

        // Stop computation if we exceed the end year
        if (
          quarterEndYear > currentYear ||
          (quarterEndYear === currentYear && quarterEndMonth > endMonth)
        ) {
          break;
        }

        // Compute quarter start and end dates
        const quarterStartDate = new Date(
          quarterStartYear,
          quarterStartMonth - 1,
          1,
        );
        const lastDayOfMonth = new Date(
          quarterEndYear,
          quarterEndMonth,
          0,
        ).getDate();
        const quarterEndDate = new Date(
          quarterEndYear,
          quarterEndMonth - 1,
          lastDayOfMonth,
        );

        quarters.push({
          quarterNumber: i + 1,
          startDate: quarterStartDate.toLocaleDateString('en-GB'),
          endDate: quarterEndDate.toLocaleDateString('en-GB'),
        });
      }
      return quarters;
    }
  }

  async getKpiUomwise(query, id, userid) {
    const { startDate, endDate, uom } = query;
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    const allkpis = await this.getCategoryById(id);
    // //////////////console.log(allkpis.kpiInfo);
    let kpiswithsameuom = [];
    for (let value of allkpis.kpiInfo) {
      if (value.kpiUOM == uom) kpiswithsameuom.push(value.kpiId);
    }
    // //////////////console.log('kpis', kpiswithsameuom);
  }
  async getAllUomofCategory(id, userid) {
    const alluoms = await this.getCategoryById(id);
    let uoms = [];
    for (let value of alluoms.kpiInfo) {
      if (!uoms.includes(value.kpiUOM))
        //push unique uoms of the category
        uoms.push(value.kpiUOM);
    }
    // //////////////console.log('uoms', uoms);
    return uoms;
  }
  async getAllErpKpisofTemplate(id, userid, res) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    // //////////////console.log('id', id);
    //get the sourceids of the template
    let tempdata = await this.getSelectedKpiReportTemplate(id);
    //get all the categories of this template
    let catdata = await this.kpiReportCategoryModel.find({
      kpiReportTemplateId: id,
    });
    try {
      let auth = [];

      for (let value of tempdata.result.sourceId) {
        let source = await this.connectedAppservice.getSelectedConnectedApp(
          value,
        );
        //if the source is axelor call respective connection api
        if (source.sourceName.toLowerCase() == 'axelor') {
          // //////////////console.log('inside if');
          const connection =
            await this.connectedAppservice.connectionTypeAxelor(value);
          const data = {
            sourceId: value,
            sourcename: source.sourceName,
            connection: connection,
          };
          auth.push(data);
        }
        //if source is salesforce use different connection api
        else if (source.sourceName.toLowerCase() == 'salesforce') {
          const connection = await this.connectedAppservice.testConnectedApp(
            userid,
            value,
            res,
          );

          const data = {
            sourceId: value,
            sourcename: source.sourceName,
            connection: connection,
          };
          auth.push(data);
        }
        //if source is manual then there is no connection required initialize connection object as null
        else if (source.sourceName.toLowerCase() == 'manual') {
          ////////////////console.log('inside else if');
          const data = {
            sourceId: value,
            sourcename: source.sourceName,
            connection: null,
          };
          auth.push(data);
        }
      }
      // //////////////console.log('auth array', auth);
      // //////////////console.log('length', catdata.length);
      let getkpis = [];
      for (let i = 0; i < catdata.length; i++) {
        ////////////////console.log('kpis of category', catdata[i].kpiInfo);
        for (let j = 0; j < catdata[i].kpiInfo.length; j++) {
          let kpidata = await this.KpiDefinitionService.getSelectedKpi(
            catdata[i].kpiInfo[j].kpiId,
          );
          // //////////////console.log('kpidata', kpidata);
          if (kpidata.kpiType == 'GET') {
            const data = {
              kpiid: kpidata.id,
              sourceid: kpidata.sourceId,
              apiendpoint: kpidata.apiEndPoint,
            };
            getkpis.push(data);
          }
        }
      }
      // //////////////console.log('getkpis', getkpis);
      const kpivalues = [];
      for (let value of getkpis) {
        let filteredConnection = auth.filter(
          (source) =>
            source.sourceId.match(value.sourceid) && source.connection != null,
        );
        // //////////////console.log('filteredconnection', filteredConnection);
        if (filteredConnection[0]?.sourcename?.toLowerCase() == 'axelor') {
          let endpoint = null;
          let datapart: string = null;
          let parts = value.apiendpoint.split(';'); //split the api endpoint into two parts
          // //////////////console.log('parts', parts);
          endpoint = parts[0];
          datapart = parts[1];

          const query = {
            jid: filteredConnection[0].connection,
            url: endpoint,
          };

          const payload = await this.connectedAppservice.axelorEndPoint(query);
          // //////////////console.log('payload', payload);
          let kpivalue = eval(`payload.${datapart}`);
          //  //////////////console.log('data in loop', kpivalue);
          const data = {
            kpiId: value.kpiid,
            kpivalue: kpivalue,
          };
          kpivalues.push(data);
          // return payload;
        }
      }
      ////////////////console.log('kpisvalues', kpivalues);
      res.send(kpivalues);
    } catch {}
    //initailize an array to store sourceid,name and connection obj indicating whether its connected or not
  }
  //mailing api
  async sendReportInstanceMail(id, userid) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });

    // //////////////console.log('sending mail called');
    const reportdata = await this.getSelectedReportInstance(id, userid);
    // //////////////console.log('reportdata', reportdata.tempData.result);
    const organizationName = await this.prisma.organization.findFirst({
      where: {
        id: reportdata.result.organization,
      },
      select: {
        organizationName: true,
      },
    });
    // //////////////console.log('orgname', organizationName);

    try {
      const pendingPromises = [];
      let emailMessage = ``;

      if (reportdata.result.reportStatus == 'SUBMIT') {
        // //////////////console.log('inside if');
        for (let editor of reportdata.tempData.result.emailShareList) {
          const reviewerInfo = await this.prisma.user.findFirst({
            where: {
              id: editor,
            },
          });
          emailMessage = `
        <p> Dear, ${reviewerInfo.firstname} </p>
        <p>
        ${reportdata.result.reportRunBy} has generated the report ${reportdata.result.kpiReportInstanceName}. Please click on the link to view the generated report
        </p>
        <p>Here is the link to view<a href="${process.env.PROTOCOL}://${organizationName}.${process.env.REDIRECT}/dashboard/kpi" target="_blank"> click here </a> </p>
        <p>Regards </p>
          <p> ${reportdata.result.reportRunBy} </p>
        `;

          // //////////////console.log('reviewer info', reviewerInfo);
          const msg = {
            to: reviewerInfo.email, // Change to your recipient
            from: process.env.FROM, // Change to your verified sender
            subject: `ReportName- ${reportdata.result.kpiReportInstanceName} for your review`,
            html: `<div>${emailMessage}</div>`,
          };
          // pendingPromises.push(sgMail.send(msg));
          const finalResult = await sgMail.send(msg);
          ////////////////console.log('finalResult', finalResult);
        }
      }
      // //////////////console.log('pendin', pendingPromises);
      return await Promise.all(pendingPromises);
    } catch (error) {
      //////////////console.log('error occured while sending mail');
    }
  }
  //function to genearate oauth token (to provide token for executing an api in cron)
  async generateOAuthToken() {
    const qs = require('qs');
    try {
      const tokenEndpoint =
        'http://localhost:8080/auth/realms/win/protocol/openid-connect/token';

      const requestBody = qs.stringify({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'winadmin',
        password: 'admin',
      });
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios.post(tokenEndpoint, requestBody, config);

      if (response.status === 200) {
        const token = response.data.access_token;
        ////////////////console.log('OAuth token:', token);
        return token;
      } else {
        console.error('Failed to generate OAuth token:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error generating OAuth token:', error);
      return null;
    }
  }
  //creating cronjobs to run as service in main. when the app start cron service is also started
  async startCronJobs() {
    const cron = require('node-cron');
    try {
      const reports = await this.kpiReportTemplateModel.find(
        {},
        { _id: 1, reportFrequency: 1 },
      );
      ////////////////console.log('reports', reports);
      reports.forEach((report) => {
        const { reportFrequency } = report;
        const job = cron.schedule(reportFrequency, async () => {
          // This function will be called each time the cron expression matches

          const token = await this.generateOAuthToken();
          // const response = await this.writeToSummary(kcid.kcId);
          const response = await axios.get(
            'http://localhost:5000/api/kpi-report/writeToSummary',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );
          if (response.status == 200) {
            // //////////////console.log(`API called successfully for template ${report._id}`);
          }
        });
        job.start();
        // //////////////console.log(
        //   `Cron job for report ${report._id} started with frequency ${reportFrequency}`,
        // );
      });
    } catch (error) {
      console.error('Error starting cron jobs:', error);
    }
  }

  async sendDummyData() {
    const result = await this.mySQLPrisma.kpiSummary.create({
      data: {
        id: 'asdasdasdas',
        kpiId: '',
        kraId: '',
        objectiveId: '',
        kpiEntity: '',
        kpibusiness: '',
        kpiLocation: '',
        kpiOrganization: '',
        kpiMonthYear: 12,
        monthlySum: 1,
        monthlyAverage: 1,
        monthlyVariance: 1,
        monthlyTarget: 1,
        monthlyWeightedScore: 1,
        percentage: 1,
        //Status :"",
        count: 1,
        kpiYear: 1,
        kpiPeriod: 1,
      },
    });
    // console.log('result', result);
    return result;
  }
  async getHistoricDataForMonth(id, id1, user, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: user },
      include: { organization: true, location: true, entity: true },
    });
    try {
      const today = new Date();
      const catresult = await this.getCategoryById(id);
      let allkpidata = [];

      // console.log('catresult', catresult);
      if (catresult) {
        for (let value of catresult.kpiInfo) {
          const { startDate, endDate } = await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
          const startMonth = startDate.getMonth().toString().padStart(2, '0');
          const endMonth = endDate.getMonth().toString().padStart(2, '0');
          const startYear = startDate.getFullYear().toString();
          const endYear = endDate.getFullYear().toString();
          const from = startYear + startMonth;
          const to = endYear + endMonth;
          const kpiId = value.kpiId;
          // console.log('from', from);
          // console.log('to', to);
          // console.log('id', id);
          // console.log('kpid', value.kpiId);

          let monthwiseresult = await this.mySQLPrisma.$queryRaw`
                SELECT * FROM kpiSummary
                WHERE CONCAT(kpiSummary.kpiYear, kpiSummary.LPAD(kpiMonthYear, 2, '0')) >= ${from} 
                AND CONCAT(kpiSummary.kpiYear, kpiSummary.LPAD(kpiMonthYear, 2, '0')) <= ${to}
                AND kpiSummary.kpiEntity=${activeuser.entityId}
                AND kpiSummary.kpiId = ${kpiId}
                AND kpiSummary.kraId = ${id}`;
          // console.log('monthwiseresult', monthwiseresult);

          let result = await this.mySQLPrisma.$queryRaw`
                SELECT kpiYear,
                SUM(monthlySum) as totalMonthlySum,
                AVG(monthlyAverage) as averageMonthlyAverage,
                SUM(monthlyVariance) as totalMonthlyVariance,
                SUM(monthlyTarget) as totalTarget
                FROM kpiSummary
                WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
                AND kpiId = ${kpiId}
                AND kraId = ${id}
                AND kpiEntity=${activeuser.entityId}
                AND kpiYear IS NOT NULL
                AND kpiMonthYear IS NOT NULL
                GROUP BY kpiYear`;

          const finalResult = await this.toJson(result);
          const data = {
            kpi: value.kpiName,
            uom: value.kpiUOM,
            kpitype: value.kpiTargetType,
            displayType: value.displayType,
            kpidatamonthwise: monthwiseresult,
            sum: JSON.parse(finalResult),
          };
          allkpidata.push(data);
        }
        return allkpidata;
      } else {
        const kpis = await this.KpiModel.find({
          categoryId: id,
          frequency: 'MONTHLY',
          entityId: id1,
          deleted: false,
        });
        this.logger.debug(
          `trace id = ${randomNumber} - No category found, fetched KPIs by frequency`,
          { kpisCount: kpis.length },
        );
        const { startDate, endDate, endyear } =
          await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
        // console.log('start and end date', startDate, endDate, endyear);
        let fiscalYearStartMonth, fiscalYearEndMonth, enddate;
        if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
          fiscalYearEndMonth = 2;
          fiscalYearStartMonth = 3;
          enddate = new Date(endyear, 2, 31);
        } else {
          fiscalYearEndMonth = 11;
          fiscalYearStartMonth = 0;
        }
        const startMonth = startDate.getMonth().toString().padStart(2, '0');
        const endMonth = endDate.getMonth().toString().padStart(2, '0');
        const startYear = startDate.getFullYear().toString();
        const endYear = endDate.getFullYear().toString();

        const from = startYear + startMonth;
        const to = endYear + endMonth;
        // console.log('from and to', from, to);

        const currentstartYear = (startDate.getFullYear() % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentstartyear', currentstartYear);
        const currentendYear = ((startDate.getFullYear() + 1) % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentendYear', currentendYear);
        this.logger.debug(
          `trace id = ${randomNumber} - Fiscal year date range`,
          { from, to },
        );
        const present = currentstartYear + '-' + currentendYear;
        const previousYearStart = new Date(startDate);
        previousYearStart.setFullYear(previousYearStart.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
        previousYearStart.setMonth(fiscalYearStartMonth); // Set to April of previous year

        const previousYearEnd = new Date(enddate);
        previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
        previousYearEnd.setMonth(fiscalYearEndMonth); // Set to March of the previous year

        // Format the previous year's start and end dates as YYYYMM
        const previousYearFrom =
          previousYearStart.getFullYear().toString() +
          previousYearStart.getMonth().toString().padStart(2, '0');
        const previousYearTo =
          previousYearEnd.getFullYear().toString() +
          previousYearEnd.getMonth().toString().padStart(2, '0');

        // For two years ago (2 years ago)
        const previousTwoYearStart = new Date(startDate);
        previousTwoYearStart.setFullYear(
          previousTwoYearStart.getFullYear() - 2,
        ); // Subtract 2 years for the previous two fiscal year
        previousTwoYearStart.setMonth(fiscalYearStartMonth); // Set to April of two years ago

        const previousTwoYearEnd = new Date(enddate);
        previousTwoYearEnd.setFullYear(previousTwoYearEnd.getFullYear() - 2); // Subtract 2 years for the previous two fiscal year
        previousTwoYearEnd.setMonth(fiscalYearEndMonth);

        const previousTwoFrom =
          previousTwoYearStart.getFullYear().toString() +
          previousTwoYearStart.getMonth().toString().padStart(2, '0');
        const previousTwoTo =
          previousTwoYearEnd.getFullYear().toString() +
          previousTwoYearEnd.getMonth().toString().padStart(2, '0');

        // console.log(
        //   'previous two from and to',
        //   previousTwoFrom,
        //   previousTwoTo,
        //   from,
        //   to,
        // );

        // console.log('previoustwo from and two', previousTwoFrom, previousTwoTo);
        for (let value of kpis) {
          this.logger.debug(
            `trace id = ${randomNumber} - Processing KPI  ${value} `,
          );
          const kpiId = value._id.toString();

          let monthwiseresult: any = await this.mySQLPrisma.$queryRaw`
                SELECT * FROM kpiSummary
                WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from} 
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
                AND kpiId = ${kpiId}
                AND kpiEntity=${id1}
                AND kraId = ${id}`;
          let startMonthIndex, endMonthIndex;
          if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
            startMonthIndex = startDate.getMonth() - 3;
            endMonthIndex = endDate.getMonth() - 3;
            startMonthIndex = (startMonthIndex + 12) % 12;
            endMonthIndex = ((endMonthIndex + 12) % 12) + 1;
          } else {
            startMonthIndex = startDate.getMonth();
            endMonthIndex = endDate.getMonth();
          }

          let allMonths = [];
          let currentMonth = new Date(startDate);
          while (
            currentMonth.getFullYear() < endYear ||
            (currentMonth.getFullYear() === endYear &&
              currentMonth.getMonth() <= endMonth)
          ) {
            allMonths.push(currentMonth.getMonth());
            currentMonth.setMonth(currentMonth.getMonth() + 1);
          }

          // Fill monthWiseData with empty objects for missing months
          const monthWiseData = Array.from(
            { length: endMonthIndex - startMonthIndex + 1 },
            (_, i) => {
              const monthIndex = (startMonthIndex + i) % 12;

              const fiscalYearStart =
                activeuser.organization.fiscalYearQuarters;
              const fiscalIndex = this.fiscalMonthIndex(
                startMonthIndex + i,
                fiscalYearStart,
              );

              const yearOffset = Math.floor((startMonthIndex + i) / 12);
              const year = startYear + yearOffset;

              const monthData = monthwiseresult.find(
                (record) => record.kpiMonthYear === monthIndex,
              );
              if (monthData) {
                return { ...monthData, fiscalIndex };
              } else {
                return {
                  kpiYear: new Date().getFullYear(),
                  kpiMonthYear: monthIndex,
                  fiscalIndex,
                  monthlySum: null,
                  monthlyAverage: null,
                  monthlyVariance: null,
                  monthlyTarget: null,
                  monthlyOperationalTarget: null,
                  monthlyMinimumTarget: null,
                };
              }
            },
          );

          monthWiseData.sort((a, b) => a.fiscalIndex - b.fiscalIndex);
          this.logger.debug(
            `trace id = ${randomNumber} - Monthly KPI data fetched`,
            { count: monthwiseresult.length },
          );
          // console.log('monthwiseresult', monthwiseresult);
          let result = await this.mySQLPrisma.$queryRaw`
                SELECT kpiYear,
                SUM(monthlySum) as totalMonthlySum,
                AVG(monthlyAverage) as averageMonthlyAverage,
                AVG(monthlyTarget) as monthlyTargetAverage,
                SUM(monthlyVariance) as totalMonthlyVariance,
                SUM(monthlyTarget) as totalTarget
                FROM kpiSummary
                WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
                AND kpiId = ${kpiId}
                AND kraId = ${id}
                AND kpiEntity=${id1}
                AND kpiYear IS NOT NULL
                AND kpiMonthYear IS NOT NULL
                GROUP BY kpiYear`;

          const finalResult = await this.toJson(result);

          let currentYearData = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE  CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;
          let data1: any = {
            kpiYear: present,
            totalQuarterSum: currentYearData[0]?.totalQuarterSum,
            averageQuarterAverage: currentYearData[0]?.averageQuarterAverage,
            totalQuarterVariance: currentYearData[0]?.totalQuarterVariance,
            totalQuarterTarget: currentYearData[0]?.totalQuarterTarget,
            targetAverage: currentYearData[0]?.targetAverage,
          };
          this.logger.debug(
            `trace id = ${randomNumber} - Current year KPI data fetched`,
          );
          // Query for previous year 1 data
          let previousYear1Data = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE  CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${previousYearFrom}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${previousYearTo}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;
          this.logger.debug(
            `trace id = ${randomNumber} -Previous year KPI data fetched`,
          );

          let data2: any = {
            kpiYear:
              (previousYearStart.getFullYear() % 100)
                .toString()
                .padStart(2, '0') +
              '-' +
              (previousYearEnd.getFullYear() % 100).toString().padStart(2, '0'),
            totalQuarterSum: previousYear1Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear1Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear1Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear1Data[0]?.totalQuarterTarget,
            targetAverage: previousYear1Data[0]?.targetAverage,
          };

          // Query for previous year 2 data
          let previousYear2Data = await this.mySQLPrisma.$queryRaw`
               SELECT kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,
                   AVG(monthlyTarget) as targetAverage

               FROM kpiSummary
               WHERE  CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${previousTwoFrom}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${previousTwoTo}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;
          // console.log(
          //   'previous2 data',
          //   previousTwoFrom,
          //   previousTwoTo,
          //   previousYear2Data,
          // );
          this.logger.debug(
            `trace id = ${randomNumber} - Previous two year KPI data fetched`,
          );
          let data3: any = {
            kpiYear:
              (previousTwoYearStart.getFullYear() % 100)
                .toString()
                .padStart(2, '0') +
              '-' +
              (previousTwoYearEnd.getFullYear() % 100)
                .toString()
                .padStart(2, '0'),
            totalQuarterSum: previousYear2Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear2Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear2Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear2Data[0]?.totalQuarterTarget,
            targetAverage: previousYear2Data[0]?.targetAverage,
          };
          // console.log('kpitype', monthWiseData);
          const data = {
            id: value._id,
            kpi: value.kpiName,
            uom: value.uom,
            kpiType: value.kpiTargetType,
            kpiTarget: value.kpiTarget,
            displayType: value.displayType,
            kpidatamonthwise: monthWiseData,
            sum: JSON.parse(finalResult),
            currentYearData: data1,
            previousYear1: data2,
            previousYear2: data3,
          };
          allkpidata.push(data);
        }
        this.logger.log(
          `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForMonth/${id} successful for user ${activeuser?.username} entity=${activeuser?.entity?.entityName} unit=${activeuser?.location?.locationName}`,
          '',
        );
        // console.log('allkpidata', allkpidata);
        return allkpidata;
      }
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForMonth/${id} failed ${error} for user ${activeuser?.username} entity=${activeuser?.entity?.entityName} unit=${activeuser?.location?.locationName}`,
        error?.stack || error?.message,
      );
    }
  }
  //api to get historic data for quarter
  async getHistoricDataForQuarter(id, id1, userid, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: { organization: true, location: true, entity: true },
    });
    try {
      const catresult = await this.getCategoryById(id);
      const today = new Date();

      // console.log('catresult', query);
      if (catresult) {
        let allkpidata = [];
        for (let value of catresult.kpiInfo) {
          const { startDate, endDate } = await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
          const startMonth = new Date(startDate)
            .getMonth()
            .toString()
            .padStart(2, '0');
          const endMonth = new Date(endDate)
            .getMonth()
            .toString()
            .padStart(2, '0');
          const startYear = new Date(startDate).getFullYear().toString();
          const endYear = new Date(endDate).getFullYear().toString();
          const from = startYear + startMonth;
          ////////////////console.log(from);
          const to = endYear + endMonth;
          const kpiId = value.kpiId;
          //get quarterwise totals
          let quarterwisedata = await this.mySQLPrisma.$queryRaw`
      SELECT kpiPeriod,kpiYear,
        SUM(monthlySum) as totalQuarterSum,
        AVG(monthlyAverage) as averageQuarterAverage,
        SUM(monthlyVariance) as totalQuarterVariance,
        SUM(monthlyTarget) as totalQuarterTarget
      FROM kpiSummary
      WHERE CONCAT(kpiYear,kpiMonthYear) >= ${from}
        AND CONCAT(kpiYear,kpiMonthYear) <= ${to}
        ANDkpiId= ${kpiId}
        ANDkraId = ${id}
        AND kpiEntity=${activeuser.entityId}
      GROUP BY kpiPeriod,kpiYear`;
          // console.log('quarterwisedata', quarterwisedata);
          const data = {
            kpi: value.kpiName,
            uom: value.kpiUOM,
            kpitype: value.kpiTargetType,
            kpidata: quarterwisedata,
          };
          // //////////////console.log('data', data);
          allkpidata.push(data);
        }
        return allkpidata;
      } else {
        let allkpidata = [];
        const { startDate, endDate, endyear } =
          await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
        this.logger.debug(
          `GET /api/getHistoricDataForQuarter/${id} started and computed dates are ${startDate},end=${endDate},endyear=${endyear}`,
        );
        // console.log('endyear', endyear, startDate, endDate);
        let fiscalYearStartMonth, fiscalYearEndMonth, enddate;
        if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
          fiscalYearEndMonth = 2;
          fiscalYearStartMonth = 3;
          enddate = new Date(endyear, 2, 31);
        } else {
          fiscalYearEndMonth = 11;
          fiscalYearStartMonth = 0;
        }
        const startMonth = startDate.getMonth().toString().padStart(2, '0');
        const endMonth = endDate.getMonth().toString().padStart(2, '0');
        const startYear = startDate.getFullYear().toString();
        const endYear = endDate.getFullYear().toString();

        const from = startYear + startMonth;
        const to = endYear + endMonth;
        // console.log('from and to', from, to);
        this.logger.debug(`computed  from and to dates ${from} and to ${to}`);
        const currentstartYear = (startDate.getFullYear() % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentstartyear', currentstartYear);
        const currentendYear = ((startDate.getFullYear() + 1) % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentendYear', currentendYear);
        const present = currentstartYear + '-' + currentendYear;
        const previousYearStart = new Date(startDate);
        previousYearStart.setFullYear(previousYearStart.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
        previousYearStart.setMonth(fiscalYearStartMonth); // Set to April of previous year

        const previousYearEnd = new Date(enddate);
        previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
        previousYearEnd.setMonth(fiscalYearEndMonth); // Set to March of the previous year

        // Format the previous year's start and end dates as YYYYMM
        const previousYearFrom =
          previousYearStart.getFullYear().toString() +
          previousYearStart.getMonth().toString().padStart(2, '0');
        const previousYearTo =
          previousYearEnd.getFullYear().toString() +
          previousYearEnd.getMonth().toString().padStart(2, '0');

        // For two years ago (2 years ago)
        const previousTwoYearStart = new Date(startDate);
        previousTwoYearStart.setFullYear(
          previousTwoYearStart.getFullYear() - 2,
        ); // Subtract 2 years for the previous two fiscal year
        previousTwoYearStart.setMonth(fiscalYearStartMonth); // Set to April of two years ago

        const previousTwoYearEnd = new Date(enddate);
        previousTwoYearEnd.setFullYear(previousTwoYearEnd.getFullYear() - 2); // Subtract 2 years for the previous two fiscal year
        previousTwoYearEnd.setMonth(fiscalYearEndMonth); // Set to March of the year before last

        // Format two years ago start and end dates as YYYYMM
        const previousTwoFrom =
          previousTwoYearStart.getFullYear().toString() +
          previousTwoYearStart.getMonth().toString().padStart(2, '0');
        const previousTwoTo =
          previousTwoYearEnd.getFullYear().toString() +
          previousTwoYearEnd.getMonth().toString().padStart(2, '0');

        // console.log('previous two from and to', previousTwoFrom, previousTwoTo);

        // console.log('previoustwo from and two', previousTwoFrom, previousTwoTo);
        this.logger.debug(`fetching kpis for category and entity ${id} ${id1}`);
        const kpis = await this.KpiModel.find({
          categoryId: id,
          frequency: 'QUARTERLY',
          entityId: id1,
          deleted: false,
        });
        for (let value of kpis) {
          const { startDate, endDate } = await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );

          const kpiId = value._id.toString();
          //get quarterwise totals
          // console.log('kpiID catId', kpiId, id);
          this.logger.debug(`Fetching qurterwise data for ${kpiId}`);
          let quarterwisedata = await this.mySQLPrisma.$queryRaw`
      SELECT kpiPeriod, kpiYear,
        SUM(monthlySum) as totalQuarterSum,
        AVG(monthlyAverage) as averageQuarterAverage,
      
        SUM(monthlyVariance) as totalQuarterVariance,
        SUM(monthlyTarget) as totalQuarterTarget,
        SUM(monthlyMinimumTarget) as totalQuarterMinimumTarget,
        
        GROUP_CONCAT(kpiComments SEPARATOR ', ') as kpiComments
      FROM kpiSummary
      WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
        AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
        AND kpiEntity=${id1}
        AND kpiId= ${kpiId}
        AND kraId = ${id}
      GROUP BY kpiPeriod, kpiYear`;
          // console.log('quarterdata', quarterwisedata);
          //   const previoustwoyeardata = await this.mySQLPrisma.$queryRaw`
          // SELECT kpiPeriod,kpiYear,
          //                SUM(monthlySum) as totalMonthlySum,
          //                AVG(monthlyAverage) as averageMonthlyAverage,
          //                SUM(monthlyVariance) as totalMonthlyVariance,
          //                SUM(monthlyTarget) as totalTarget
          //                FROM kpiSummary
          //                WHERE
          //               kpiId = ${kpiId}
          //                AND kraId = ${id}
          //                AND kpiEntity=${id1}
          //                AND kpiYear IS NOT NULL
          //                AND kpiMonthYear IS NOT NULL
          //                GROUP BY kpiPeriod,kpiYear ORDER BY kpiYear ASC`;
          //   // console.log('previousyears', previoustwoyeardata);
          //   const previousResult = await this.toJson(previoustwoyeardata);

          // Get current year and previous two years
          const currentYear = new Date().getFullYear();
          const previousYear1 = currentYear - 1;
          const previousYear2 = currentYear - 2;
          // console.log('currentyrat', currentYear);
          // Query for current year data
          let currentYearData = await this.mySQLPrisma.$queryRaw`
                SELECT  kpiYear,
                    SUM(monthlySum) as totalQuarterSum,
                    AVG(monthlyAverage) as averageQuarterAverage,
                    SUM(monthlyVariance) as totalQuarterVariance,
                    SUM(monthlyTarget) as totalQuarterTarget,
                    AVG(monthlyTarget) as targetAverage
                FROM kpiSummary
                WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                    AND kpiId= ${kpiId}
                    AND kraId = ${id}
                    AND kpiEntity=${id1}
                GROUP BY kpiYear`;
          // console.log('currentyeardata', currentendYear[0]);
          let data1: any = {
            kpiYear: present,
            totalQuarterSum: currentYearData[0]?.totalQuarterSum,
            averageQuarterAverage: currentYearData[0]?.averageQuarterAverage,
            totalQuarterVariance: currentYearData[0]?.totalQuarterVariance,
            totalQuarterTarget: currentYearData[0]?.totalQuarterTarget,
            targetAverage: currentYearData[0]?.targetAverage,
          };
          // Query for previous year 1 data
          let previousYear1Data = await this.mySQLPrisma.$queryRaw`
                SELECT  kpiYear,
                    SUM(monthlySum) as totalQuarterSum,
                    AVG(monthlyAverage) as averageQuarterAverage,
                    SUM(monthlyVariance) as totalQuarterVariance,
                    SUM(monthlyTarget) as totalQuarterTarget,AVG(monthlyTarget) as targetAverage
                FROM kpiSummary
                WHERE CONCAT(kpiYear, kpiMonthYear) >= ${previousYearFrom}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${previousYearTo}
                    AND kpiId= ${kpiId}
                    AND kraId = ${id}
                    AND kpiEntity=${id1}
                GROUP BY kpiYear`;

          // Query for previous year 2 data
          let previousYear2Data = await this.mySQLPrisma.$queryRaw`
                SELECT kpiYear,
                    SUM(monthlySum) as totalQuarterSum,
                    AVG(monthlyAverage) as averageQuarterAverage,
                    SUM(monthlyVariance) as totalQuarterVariance,
                    SUM(monthlyTarget) as totalQuarterTarget,AVG(monthlyTarget) as targetAverage
                FROM kpiSummary
                WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${previousTwoFrom}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${previousTwoTo}
                    AND kpiId= ${kpiId}
                    AND kraId = ${id}
                    AND kpiEntity=${id1}
                GROUP BY kpiYear`;
          // console.log('quarterwisedata', quarterwisedata);
          let data2: any = {
            kpiYear:
              (previousYearStart.getFullYear() % 100)
                .toString()
                .padStart(2, '0') +
              '-' +
              (previousYearEnd.getFullYear() % 100).toString().padStart(2, '0'),
            totalQuarterSum: previousYear1Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear1Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear1Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear1Data[0]?.totalQuarterTarget,
            targetAverage: previousYear1Data[0]?.targetAverage,
          };

          let data3: any = {
            kpiYear:
              (previousTwoYearStart.getFullYear() % 100)
                .toString()
                .padStart(2, '0') +
              '-' +
              (previousTwoYearEnd.getFullYear() % 100)
                .toString()
                .padStart(2, '0'),
            totalQuarterSum: previousYear2Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear2Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear2Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear2Data[0]?.totalQuarterTarget,
            targetAverage: previousYear2Data[0]?.targetAverage,
          };
          // console.log('quarterdata', quarterwisedata);
          const data = {
            id: value._id,
            kpi: value.kpiName,
            uom: value.uom,
            kpitype: value.kpiTargetType,
            displayType: value.displayType,
            kpidata: quarterwisedata,
            currentYearData: data1,
            previousYear1: data2,
            previousYear2: data3,
          };

          // //////////////console.log('data', data);
          allkpidata.push(data);
        }
        this.logger.log(
          `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForQuarter/${id} successful`,
          '',
        );
        return allkpidata;
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForQuarter/${id} failed ${error}`,
        '',
      );
    }
  }
  //api to get historic data for half-early kpis
  async getHistoricDataForHalfYear(id, id1, user, randomNumber) {
    try {
      const today = new Date();
      const catresult = await this.getCategoryById(id);
      let allkpidata = [];
      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: user },
        include: { organization: true },
      });
      // console.log('catresult', catresult);
      if (catresult) {
        for (let value of catresult.kpiInfo) {
          const { startDate, endDate } = await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
          const startMonth = startDate.getMonth().toString();
          const endMonth = endDate.getMonth().toString();
          const startYear = startDate.getFullYear().toString();
          const endYear = endDate.getFullYear().toString();
          const from = startYear + startMonth;
          const to = endYear + endMonth;
          const kpiId = value.kpiId;
          // console.log('from', from);
          // console.log('to', to);
          // console.log('id', id);
          // console.log('kpid', value.kpiId);

          const data = {
            kpi: value.kpiName,
            uom: value.kpiUOM,
            kpitype: value.kpiTargetType,
            displayType: value.displayType,
          };
          allkpidata.push(data);
        }
        return allkpidata;
      } else {
        const kpis = await this.KpiModel.find({
          categoryId: id,
          frequency: 'HALF-YEARLY',
          entityId: id1,
          deleted: false,
        });
        // console.log('kpis', kpis);
        const { startDate, endDate, endyear } =
          await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
        // console.log('endyear', endyear, endDate);
        let fiscalYearStartMonth, fiscalYearEndMonth, enddate;
        if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
          fiscalYearEndMonth = 2;
          fiscalYearStartMonth = 3;
          enddate = new Date(endyear, 2, 31);
        } else {
          fiscalYearEndMonth = 11;
          fiscalYearStartMonth = 0;
        }
        const startMonth = startDate.getMonth().toString().padStart(2, '0');
        const endMonth = endDate.getMonth().toString().padStart(2, '0');
        const startYear = startDate.getFullYear().toString();
        const endYear = endDate.getFullYear().toString();

        const from = startYear + startMonth;
        const to = endYear + endMonth;
        // console.log('from and to', from, to);
        const currentstartYear = (startDate.getFullYear() % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentstartyear', currentstartYear);
        const currentendYear = ((startDate.getFullYear() + 1) % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentendYear', currentendYear);
        const present = currentstartYear + '-' + currentendYear;
        const previousYearStart = new Date(startDate);
        previousYearStart.setFullYear(previousYearStart.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
        previousYearStart.setMonth(fiscalYearStartMonth); // Set to April of previous year

        const previousYearEnd = new Date(enddate);
        previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
        previousYearEnd.setMonth(fiscalYearEndMonth); // Set to March of the previous year

        // Format the previous year's start and end dates as YYYYMM
        const previousYearFrom =
          previousYearStart.getFullYear().toString() +
          previousYearStart.getMonth().toString().padStart(2, '0');
        const previousYearTo =
          previousYearEnd.getFullYear().toString() +
          previousYearEnd.getMonth().toString().padStart(2, '0');

        // For two years ago (2 years ago)
        const previousTwoYearStart = new Date(startDate);
        previousTwoYearStart.setFullYear(
          previousTwoYearStart.getFullYear() - 2,
        ); // Subtract 2 years for the previous two fiscal year
        previousTwoYearStart.setMonth(fiscalYearStartMonth); // Set to April of two years ago

        const previousTwoYearEnd = new Date(enddate);
        previousTwoYearEnd.setFullYear(previousTwoYearEnd.getFullYear() - 2); // Subtract 2 years for the previous two fiscal year
        previousTwoYearEnd.setMonth(fiscalYearEndMonth); // Set to March of the year before last

        // Format two years ago start and end dates as YYYYMM
        const previousTwoFrom =
          previousTwoYearStart.getFullYear().toString() +
          previousTwoYearStart.getMonth().toString().padStart(2, '0');
        const previousTwoTo =
          previousTwoYearEnd.getFullYear().toString() +
          previousTwoYearEnd.getMonth().toString().padStart(2, '0');

        // console.log('previous two from and to', previousTwoFrom, previousTwoTo);

        // console.log('previoustwo from and two', previousTwoFrom, previousTwoTo);
        for (let value of kpis) {
          const kpiId = value._id.toString();
          //calculate half year data
          let halfyearwisedata = await this.mySQLPrisma.$queryRaw`
          SELECT kpiSemiAnnual, kpiYear,
        SUM(monthlySum) as totalQuarterSum,
        AVG(monthlyAverage) as averageQuarterAverage,
        SUM(monthlyMinimumTarget) as totalQuarterMinimumTarget,
        SUM(monthlyVariance) as totalQuarterVariance,
        SUM(monthlyTarget) as totalQuarterTarget,
        GROUP_CONCAT(kpiComments SEPARATOR ', ') as kpiComments
      FROM kpiSummary
          WHERE CONCAT(kpiYear,LPAD(kpiMonthYear, 2, '0')) >= ${from}
            AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
            AND kpiEntity=${id1}
            AND kpiId= ${kpiId}
            AND kraId = ${id}
          GROUP BY kpiSemiAnnual, kpiYear`;
          // console.log('half year dara', halfyearwisedata);
          let currentYearData = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE  CONCAT(kpiYear, kpiMonthYear) >= ${from}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;
          let data1: any = {
            kpiYear: present,
            totalQuarterSum: currentYearData[0]?.totalQuarterSum,
            averageQuarterAverage: currentYearData[0]?.averageQuarterAverage,
            totalQuarterVariance: currentYearData[0]?.totalQuarterVariance,
            totalQuarterTarget: currentYearData[0]?.totalQuarterTarget,
            targetAverage: currentYearData[0]?.targetAverage,
          };
          // Query for previous year 1 data
          let previousYear1Data = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE  CONCAT(kpiYear, kpiMonthYear) >= ${previousYearFrom}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${previousYearTo}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;

          let data2: any = {
            kpiYear:
              (previousYearStart.getFullYear() % 100)
                .toString()
                .padStart(2, '0') +
              '-' +
              (previousYearEnd.getFullYear() % 100).toString().padStart(2, '0'),
            totalQuarterSum: previousYear1Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear1Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear1Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear1Data[0]?.totalQuarterTarget,
            targetAverage: previousYear1Data[0]?.targetAverage,
          };

          // Query for previous year 2 data
          let previousYear2Data = await this.mySQLPrisma.$queryRaw`
               SELECT kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,
                   AVG(monthlyTarget) as targetAverage

               FROM kpiSummary
               WHERE  CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${previousTwoFrom}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')r) <= ${previousTwoTo}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;
          // console.log(
          //   'previous2 data',
          //   previousTwoFrom,
          //   previousTwoTo,
          //   previousYear2Data,
          // );
          let data3: any = {
            kpiYear:
              (previousTwoYearStart.getFullYear() % 100)
                .toString()
                .padStart(2, '0') +
              '-' +
              (previousTwoYearEnd.getFullYear() % 100)
                .toString()
                .padStart(2, '0'),
            totalQuarterSum: previousYear2Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear2Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear2Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear2Data[0]?.totalQuarterTarget,
            targetAverage: previousYear2Data[0]?.targetAverage,
          };
          const data = {
            id: value._id,
            kpi: value.kpiName,
            uom: value.uom,
            kpitype: value.kpiTargetType,
            kpiTarget: value.kpiTarget,
            displayType: value.displayType,
            halfYearData: halfyearwisedata,
            currentYearData: data1,
            previousYear1: data2,
            previousYear2: data3,
          };
          allkpidata.push(data);
        }
        this.logger.log(
          `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForHalfYear/${id} successful`,
          '',
        );
        return allkpidata;
      }
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForHalfYear/${id} failed ${error}`,
        '',
      );
    }
  }
  //api to get historic data for daily kpis
  async getHistoricDataForDaily(id, id1, user, randomNumber) {
    try {
      const today = new Date();
      const catresult = await this.getCategoryById(id);
      let allkpidata = [];
      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: user },
        include: { organization: true },
      });
      // console.log('catresult', catresult);
      if (catresult) {
        for (let value of catresult.kpiInfo) {
          const { startDate, endDate } = await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
          const startMonth = startDate.getMonth().toString();
          const endMonth = endDate.getMonth().toString();
          const startYear = startDate.getFullYear().toString();
          const endYear = endDate.getFullYear().toString();
          const from = startYear + startMonth;
          const to = endYear + endMonth;
          const kpiId = value.kpiId;

          let monthwiseresult = await this.mySQLPrisma.$queryRaw`
                SELECT * FROM kpiSummary
                WHERE CONCAT(kpiSummary.kpiYear, kpiSummary.kpiMonthYear) >= ${from} 
                AND CONCAT(kpiSummary.kpiYear, kpiSummary.kpiMonthYear) <= ${to}
                AND kpiSummary.kpiEntity=${activeuser.entityId}
                AND kpiSummary.kpiId = ${kpiId}
                AND kpiSummary.kraId = ${id}`;
          // console.log('monthwiseresult', monthwiseresult);

          let result = await this.mySQLPrisma.$queryRaw`
                SELECT kpiYear,
                SUM(monthlySum) as totalMonthlySum,
                AVG(monthlyAverage) as averageMonthlyAverage,
                SUM(monthlyVariance) as totalMonthlyVariance,
                SUM(monthlyTarget) as totalTarget
                FROM kpiSummary
                WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                AND kpiId = ${kpiId}
                AND kraId = ${id}
                AND kpiEntity=${activeuser.entityId}
                AND kpiYear IS NOT NULL
                AND kpiMonthYear IS NOT NULL
                GROUP BY kpiYear`;

          const finalResult = await this.toJson(result);
          const data = {
            kpi: value.kpiName,
            uom: value.kpiUOM,
            kpitype: value.kpiTargetType,
            displayType: value.displayType,
            kpidatamonthwise: monthwiseresult,
            sum: JSON.parse(finalResult),
          };
          allkpidata.push(data);
        }
        return allkpidata;
      } else {
        const kpis = await this.KpiModel.find({
          categoryId: id,
          frequency: 'DAILY',
          entityId: id1,
          deleted: false,
        });

        const { startDate, endDate, endyear } =
          await this.calculateStartAndEndDate(
            activeuser.organization.fiscalYearQuarters,
            activeuser.organization.auditYear,
            today,
          );
        // console.log('endyear', endyear);
        let previoustartmonth, previousendmonth, enddate;
        if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
          previousendmonth = 2;
          previoustartmonth = 3;
          enddate = new Date(endyear, 2, 31);
        } else {
          previousendmonth = 11;
          previoustartmonth = 0;
        }
        const startMonth = startDate.getMonth().toString();
        const endMonth = endDate.getMonth().toString();
        const startYear = startDate.getFullYear().toString();
        const endYear = endDate.getFullYear().toString();
        const from = startYear + startMonth;
        const to = endYear + endMonth;
        // console.log('from and to', from, to);
        const currentstartYear = (startDate.getFullYear() % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentstartyear', currentstartYear);
        const currentendYear = ((startDate.getFullYear() + 1) % 100)
          .toString()
          .padStart(2, '0');
        // console.log('currentendYear', currentendYear);
        const present = currentstartYear + '-' + currentendYear;
        const previous1startYear = ((startDate.getFullYear() % 100) - 1)
          .toString()
          .padStart(2, '0');
        // console.log('currentstartyear', currentstartYear);
        const previous1endYear = (startDate.getFullYear() % 100)
          .toString()
          .padStart(2, '0');
        const previous1 = previous1startYear + '-' + previous1endYear;
        const previous2startYear = ((startDate.getFullYear() % 100) - 2)
          .toString()
          .padStart(2, '0');
        // console.log('currentstartyear', currentstartYear);
        const previous2endYear = ((startDate.getFullYear() % 100) - 1)
          .toString()
          .padStart(2, '0');
        const previous2 = previous2startYear + '-' + previous2endYear;
        // Calculate the previous one year
        const previousOneStart = new Date(startDate); // Make a copy of the start date
        previousOneStart.setFullYear(previousOneStart.getFullYear() - 1); // Subtract one year
        const previousOneEnd = new Date(enddate); // Make a copy of the end date
        previousOneEnd.setFullYear(previousOneEnd.getFullYear() - 1); // Subtract one year
        const previousOneFrom =
          previousOneStart.getFullYear().toString() +
          previousOneStart.getMonth().toString();
        const previousOneTo =
          previousOneEnd.getFullYear().toString() +
          previousOneEnd.getMonth().toString();

        // console.log('previous one from and to', previousOneFrom, previousOneTo);

        // Calculate the previous two years
        const previousTwoStart = new Date(startDate);
        previousTwoStart.setFullYear(previousTwoStart.getFullYear() - 2);
        const previousTwoEnd = new Date(endDate);
        previousTwoEnd.setFullYear(previousTwoEnd.getFullYear() - 1);
        const previousTwoFrom =
          previousTwoStart.getFullYear().toString() +
          (previousTwoStart.getMonth() + 1).toString().padStart(2, '0');
        const previousTwoTo =
          previousTwoEnd.getFullYear().toString() +
          (previousTwoEnd.getMonth() + 1).toString().padStart(2, '0');

        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );

        for (let value of kpis) {
          const kpiId = value._id.toString();

          let daywiseresult = await this.mySQLPrisma.$queryRaw`
                SELECT * FROM reportKpiDataNewData
                WHERE reportFor >= ${firstDayOfMonth} 
                AND reportFor <= ${today}
                AND kpiId = ${kpiId}
                AND kpiEntity=${id1}
                AND kraId = ${id} ORDER BY reportFor ASC`;

          let result = await this.mySQLPrisma.$queryRaw`
                SELECT kpiYear,
                SUM(monthlySum) as totalMonthlySum,
                AVG(monthlyAverage) as averageMonthlyAverage,
                AVG(monthlyTarget) as monthlyTargetAverage,
                SUM(monthlyVariance) as totalMonthlyVariance,
                SUM(monthlyTarget) as totalTarget
                FROM kpiSummary
                WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                AND kpiId = ${kpiId}
                AND kraId = ${id}
                AND kpiEntity=${id1}
                AND kpiYear IS NOT NULL
                AND kpiMonthYear IS NOT NULL
                GROUP BY kpiYear`;

          const finalResult = await this.toJson(result);

          let currentYearData = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE  CONCAT(kpiYear, kpiMonthYear) >= ${from}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;
          // console.log('currentyeardata', currentYearData);
          let data1: any = {
            kpiYear: present,
            totalQuarterSum: currentYearData[0]?.totalQuarterSum,
            averageQuarterAverage: currentYearData[0]?.averageQuarterAverage,
            totalQuarterVariance: currentYearData[0]?.totalQuarterVariance,
            totalQuarterTarget: currentYearData[0]?.totalQuarterTarget,
            targetAverage: currentYearData[0]?.targetAverage,
          };

          // Query for previous year 1 data
          let previousYear1Data = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE  CONCAT(kpiYear, kpiMonthYear) >= ${previousOneFrom}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${previousOneTo}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;

          let data2: any = {
            kpiYear: previous1,
            totalQuarterSum: previousYear1Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear1Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear1Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear1Data[0]?.totalQuarterTarget,
            targetAverage: previousYear1Data[0]?.targetAverage,
          };

          // Query for previous year 2 data
          let previousYear2Data = await this.mySQLPrisma.$queryRaw`
               SELECT kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,
                   AVG(monthlyTarget) as targetAverage

               FROM kpiSummary
               WHERE  CONCAT(kpiYear, kpiMonthYear) >= ${previousTwoFrom}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${previousTwoTo}
                   AND kpiId= ${kpiId}
                   AND kraId = ${id}
                   AND kpiEntity=${id1}
               GROUP BY kpiYear`;

          let data3: any = {
            kpiYear: previous2,
            totalQuarterSum: previousYear2Data[0]?.totalQuarterSum,
            averageQuarterAverage: previousYear2Data[0]?.averageQuarterAverage,
            totalQuarterVariance: previousYear2Data[0]?.totalQuarterVariance,
            totalQuarterTarget: previousYear2Data[0]?.totalQuarterTarget,
            targetAverage: previousYear2Data[0]?.targetAverage,
          };
          const data = {
            id: value._id,
            kpi: value.kpiName,
            uom: value.uom,
            kpitype: value.kpiTargetType,
            displayType: value.displayType,
            kpiTarget: value.kpiTarget,
            kpidatadaywise: daywiseresult,
            sum: JSON.parse(finalResult),
            currentYearData: data1,
            previousYear1: data2,
            previousYear2: data3,
          };
          allkpidata.push(data);
        }
        this.logger.log(
          `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForDaily/${id} successfull`,
          '',
        );
        return allkpidata;
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/kpi-report/getHistoricDataForDaily/${id} failed ${error}`,
        '',
      );
    }
  }
  async calculateStartAndEndDate(fiscalYearQuarters, audityear, currentDate) {
    const currentMonth = currentDate.getMonth();
    const fiscalyear = audityear;
    let startYear, endYear;

    // Handle fiscal year format (YY-YY+1 or YYYY)
    if (fiscalyear?.includes('-')) {
      [startYear, endYear] = fiscalyear?.split('-')?.map((year) => {
        const yearNumber = parseInt(year, 10); // Convert the year string to a number
        // Logic to determine whether the year is in the 20th or 21st century
        if (yearNumber >= 50) {
          return 1900 + yearNumber;
        } else {
          return 2000 + yearNumber;
        }
      });
    } else {
      startYear = endYear = audityear;
    }

    let startDate, endDate;
    const currentYear = currentDate.getFullYear();

    if (fiscalYearQuarters === 'April - Mar') {
      // Fiscal Year: April - March
      if (currentYear === startYear && currentMonth >= 3) {
        startDate = new Date(startYear, 3, 1); // Start from April 1st
      } else if (currentYear === endYear && currentMonth < 3) {
        startDate = new Date(startYear, 3, 1); // Start from April 1st
      }

      // Set the end date to the last day of the current month
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      ); // Last day of the current month
    } else {
      // For Jan-Dec fiscal year
      // Start date is January 1 of the current year
      startDate = new Date(currentDate.getFullYear(), 0, 1);

      // Set the end date to the last day of the current month
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      ); // Last day of the current month
    }

    // console.log('startdate and enddate', startDate, endDate);
    return {
      startDate: startDate,
      endDate: endDate,
      endyear: endYear ? endYear : currentDate.getFullYear(),
    };
  }

  async getFilterListForReports(user, randomNumber) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true, location: true, entity: true },
      });
      const reportData = await this.kpiReportInstanceModel.find({
        organizationId: activeuser.organizationId,
      });

      let frequency = [];
      for (let value of reportData) {
        // console.log('origin', value.origin);
        if (value.reportFrequency) {
          frequency.push(value?.reportFrequency);
        }
      }
      const uniqueStatus = Array.from(new Set(frequency)); // Remove duplicates
      uniqueStatus.sort();
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getFilterListForReports successful`,
        '',
      );
      return {
        frequency: uniqueStatus,
      };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/getFilterListForReports failed ${error}`,
        '',
      );
    }
  }
  async isMergedCell(worksheet, r, c) {
    for (let m = 0; m < worksheet['!merges'].length; ++m) {
      const merge = worksheet['!merges'][m];
      if (
        r >= merge.s.r &&
        r <= merge.e.r &&
        c >= merge.s.c &&
        c <= merge.e.c
      ) {
        return true;
      }
    }
    return false;
  }

  // Function to get the value of a cell, considering merged cells
  // Function to get the value of a cell, considering merged cells
  async getCellValue(worksheet, row, col) {
    const XLSX = require('xlsx');
    if (this.isMergedCell(worksheet, row, col)) {
      // Find the primary cell of the merged range
      for (let m = 0; m < worksheet['!merges'].length; ++m) {
        const merge = worksheet['!merges'][m];
        if (
          row >= merge.s.r &&
          row <= merge.e.r &&
          col >= merge.s.c &&
          col <= merge.e.c
        ) {
          return worksheet[
            XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c })
          ].v;
        }
      }
    } else {
      // If not merged, get value directly from the cell
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        return worksheet[cellAddress].v;
      }
    }
    return null; // Cell is empty
  }

  async importReport(user, res, file, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/kpi-report/importReport started`,
        '',
      );
      const fs = require('fs');
      const XLSX = require('xlsx');

      // Read and parse the Excel file
      const fileContent = fs.readFileSync(file.path);
      const workbook = XLSX.read(fileContent, { type: 'buffer' });

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const activeUser = await this.prisma.user.findFirst({
          where: { kcId: user.id },
        });

        let invalidKpis = [
          [
            'Location',
            'Department',
            'Category',
            'KpiName',
            'MonthYear',
            'Actual',
            'Target',
            'Reason',
          ],
        ];

        // Extract month-year headers from the second row
        const monthYearHeaders = [];
        for (let i = 4; i < excelData[0].length; i += 2) {
          const monthYearCode = excelData[0][i];
          // console.log('monthYearCode:', monthYearCode);

          // Manual parsing of month and year
          const match = monthYearCode.match(/(\w{3})-(\d{2})/);
          if (match) {
            const monthStr = match[1];
            const yearStr = match[2];
            const monthMap = {
              Jan: 1,
              Feb: 2,
              Mar: 3,
              Apr: 4,
              May: 5,
              Jun: 6,
              Jul: 7,
              Aug: 8,
              Sep: 9,
              Oct: 10,
              Nov: 11,
              Dec: 12,
            };
            const month = monthMap[monthStr];
            const year = parseInt(yearStr, 10) + 2000; // Convert two-digit year to four-digit year

            if (month && year) {
              monthYearHeaders.push({ month, year });
              // console.log('Parsed month and year:', { month, year });
            } else {
              console.error('Invalid month/year:', { monthStr, yearStr });
            }
          } else {
            console.error('Invalid date code format:', monthYearCode);
          }
        }

        // Process data rows
        for (let i = 1; i < excelData.length; i++) {
          const rowData = excelData[i];
          const locationName = rowData[0] ? rowData[0].trim() : null;
          const department = rowData[1] ? rowData[1].trim() : null;
          const categoryName = rowData[2] ? rowData[2].trim() : null;
          const kpiName = rowData[3] ? rowData[3].trim() : null;

          for (let j = 0; j < monthYearHeaders.length; j++) {
            const header = monthYearHeaders[j];
            const month = header.month;
            const year = header.year;
            const targetIndex = j * 2 + 4;
            const actualIndex = targetIndex + 1;

            const target: any =
              rowData[targetIndex] !== undefined
                ? parseFloat(rowData[targetIndex])
                : null;
            const actual: any =
              rowData[actualIndex] !== undefined
                ? parseFloat(rowData[actualIndex])
                : null;

            if (
              !kpiName ||
              !locationName ||
              !department ||
              !categoryName ||
              actual === null ||
              target === null ||
              isNaN(month) ||
              isNaN(year)
            ) {
              const reason = 'Required fields are missing or invalid';
              invalidKpis.push([...rowData, reason]);
              continue;
            }

            const location = await this.getLocationId(locationName);
            if (!location) {
              const reason = 'Location Not Found';
              invalidKpis.push([...rowData, reason]);
              continue;
            }

            const entity = await this.getEntityByName(department);
            if (!entity) {
              const reason = 'Entity Not Found';
              invalidKpis.push([...rowData, reason]);
              continue;
            }

            const category = await this.getObjectiveCategoryByName(
              categoryName,
            );
            if (!category) {
              const reason = 'Objective Category Not Found';
              invalidKpis.push([...rowData, reason]);
              continue;
            }

            const kpi = await this.getKpiId(kpiName);
            if (!kpi) {
              const reason = 'KPI Not Found';
              invalidKpis.push([...rowData, reason]);
              continue;
            }

            let per = null;
            let variance = null;
            if (kpi.kpiTargetType === 'Increase') {
              per = 100 * (actual / target);
              variance = target && actual ? actual - target : null;
            } else if (kpi.kpiTargetType === 'Decrease') {
              per = 100 * ((target - actual) / target);
              variance = target && actual ? target - actual : null;
            } else if (kpi.kpiTargetType === 'Maintain') {
              per = 100 * (actual / target);
              variance = target - actual;
            } else if (kpi.kpiTargetType === 'Range') {
              const kpiValue = parseFloat(actual);
              const kpiTarget = parseFloat(target);
              const minimumTarget = parseFloat(kpi.kpiMinimumTarget.toString());
              const midrange = (kpiTarget + minimumTarget) / 2;

              if (kpiValue > kpiTarget) {
                per = 100 - (actual - midrange) / midrange;
                variance = actual - target;
              } else if (kpiValue < minimumTarget) {
                per = 100 - (midrange - kpiValue) / midrange;
                variance = minimumTarget - actual;
              } else {
                per = 100;
                variance = 0;
              }
            }

            // console.log('Creating record for KPI:', kpi.kpiName);
            if (actual && target) {
              await this.mySQLPrisma.reportKpiDataNewData.create({
                data: {
                  kpiTemplateId: '',
                  kpiReportId: '',
                  kpiCategoryId: category.toString(),
                  kraId: category.toString(),
                  kpiId: kpi._id.toString(),
                  kpiTargetType: kpi.kpiTargetType.toString(),
                  kpiValue: actual,
                  kpiComments: 'created from import',
                  minimumTarget: kpi.kpiMinimumTarget
                    ? parseFloat(kpi.kpiMinimumTarget.toString())
                    : null,
                  target: target,
                  kpiWeightage: null,
                  kpiVariance: variance,
                  percentage: per,
                  kpibusiness: '',
                  kpiEntity: entity,
                  kpiLocation: location,
                  kpiOrganization: activeUser.organizationId,
                  kpiStatus: 'WIP',
                  reportDate: new Date(),
                  reportFor: await this.getLastDateOfMonth(year, month - 1),
                  reportYear: `${year}-${year + 1}`,
                },
              });
            }
          }
        }

        if (invalidKpis.length > 1) {
          return res.status(200).json({ success: true, invalidKpis });
        }
      }
      const summary = await this.writeToSummary(randomNumber);
      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  async getEntityByName(name) {
    try {
      const entityId = await this.prisma.entity.findFirst({
        where: {
          entityName: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });
      if (entityId !== null) return entityId.id;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  async getLocationId(locationName) {
    try {
      if (locationName !== 'All') {
        const locationId = await this.prisma.location.findFirst({
          where: {
            locationName: {
              contains: locationName,
              mode: 'insensitive',
            },
          },
        });
        if (locationId !== null) return locationId.id;
        else return null;
      } else return 'All';
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  async getKpiId(name) {
    try {
      const kpiId = await this.KpiModel.findOne({
        kpiName: new RegExp(`^${name}$`, 'i'),
      });
      if (kpiId) {
        return kpiId;
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  async getObjectiveCategoryByName(name) {
    try {
      const categoryId = await this.orgObjective.findOne({
        ObjectiveCategory: new RegExp(`^${name}$`, 'i'),
      });
      if (categoryId) {
        return categoryId._id.toString();
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  async getLastDateOfMonth(year, month) {
    // Ensure the year is a four-digit number
    let fullYear;
    // console.log('year', year);
    if (year < 100) {
      // Assuming years in the format '23' or '24' are for 2023 or 2024
      fullYear = 2000 + parseInt(year);
    } else {
      fullYear = parseInt(year);
    }

    // Create a date object for the first day of the next month
    const nextMonth = new Date(fullYear, month + 1, 1);

    // Subtract one day to get the last day of the given month
    nextMonth.setDate(0);

    return nextMonth;
  }

  // async exportReport(userid, query) {
  //   console.log('query', query);

  //   const activeuser = await this.prisma.user.findFirst({
  //     where: { kcId: userid.id },
  //     include: { organization: true },
  //   });

  //   // Prepare date variables
  //   const today = new Date();
  //   const { startDate, endDate, endyear } = await this.calculateStartAndEndDate(
  //     activeuser.organization.fiscalYearQuarters,
  //     today,
  //   );

  //   // Initialize date variables for previous years
  //   let previoustartmonth, previousendmonth, enddate;
  //   if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
  //     previousendmonth = 2; // March
  //     previoustartmonth = 3; // April
  //     enddate = new Date(endyear, 2, 31); // End of March
  //   } else {
  //     previousendmonth = 11; // December
  //     previoustartmonth = 0; // January
  //   }

  //   const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
  //   const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
  //   const startYear = startDate.getFullYear().toString();
  //   const endYear = endDate.getFullYear().toString();
  //   const from = startYear + startMonth;
  //   const to = endYear + endMonth;

  //   const currentstartYear = (startDate.getFullYear() % 100)
  //     .toString()
  //     .padStart(2, '0');
  //   const currentendYear = ((startDate.getFullYear() + 1) % 100)
  //     .toString()
  //     .padStart(2, '0');
  //   const present = currentstartYear + '-' + currentendYear;

  //   const previous1startYear = ((startDate.getFullYear() % 100) - 1)
  //     .toString()
  //     .padStart(2, '0');
  //   const previous1endYear = (startDate.getFullYear() % 100)
  //     .toString()
  //     .padStart(2, '0');
  //   const previous1 = previous1startYear + '-' + previous1endYear;

  //   const previous2startYear = ((startDate.getFullYear() % 100) - 2)
  //     .toString()
  //     .padStart(2, '0');
  //   const previous2endYear = ((startDate.getFullYear() % 100) - 1)
  //     .toString()
  //     .padStart(2, '0');
  //   const previous2 = previous2startYear + '-' + previous2endYear;

  //   // Calculate previous year ranges
  //   const previousOneStart = new Date(startDate);
  //   previousOneStart.setFullYear(previousOneStart.getFullYear() - 1);
  //   const previousOneEnd = new Date(enddate);
  //   previousOneEnd.setFullYear(previousOneEnd.getFullYear() - 1);
  //   const previousOneFrom =
  //     previousOneStart.getFullYear().toString() +
  //     previousOneStart.getMonth().toString().padStart(2, '0');
  //   const previousOneTo =
  //     previousOneEnd.getFullYear().toString() +
  //     previousOneEnd.getMonth().toString().padStart(2, '0');

  //   const previousTwoStart = new Date(startDate);
  //   previousTwoStart.setFullYear(previousTwoStart.getFullYear() - 2);
  //   const previousTwoEnd = new Date(endDate);
  //   previousTwoEnd.setFullYear(previousTwoEnd.getFullYear() - 1);
  //   const previousTwoFrom =
  //     previousTwoStart.getFullYear().toString() +
  //     (previousTwoStart.getMonth() + 1).toString().padStart(2, '0');
  //   const previousTwoTo =
  //     previousTwoEnd.getFullYear().toString() +
  //     (previousTwoEnd.getMonth() + 1).toString().padStart(2, '0');

  //   // Build query conditions
  //   let condition: any = {
  //     organizationId: activeuser.organizationId,
  //   };

  //   const locationIds = query.locationId ? query.locationId.split(',') : [];
  //   const entityIds = query.entityId ? query.entityId.split(',') : [];
  //   const categoryIds = query.categoryId ? query.categoryId.split(',') : [];
  //   const objectiveIds = query.objectiveId ? query.objectiveId.split(',') : [];

  //   if (Array.isArray(locationIds) && locationIds.length > 0) {
  //     condition.locationId = { $in: locationIds };
  //   } else if (query.locationId) {
  //     condition.locationId = query.locationId;
  //   }
  //   if (Array.isArray(entityIds) && entityIds.length > 0) {
  //     condition.entityId = { $in: entityIds };
  //   } else if (query.entityId) {
  //     condition.entityId = query.entityId;
  //   }
  //   if (Array.isArray(categoryIds) && categoryIds.length > 0) {
  //     condition.categoryId = { $in: categoryIds };
  //   } else if (query.categoryId) {
  //     condition.categoryId = query.categoryId;
  //   }

  //   if (Array.isArray(objectiveIds) && objectiveIds.length > 0) {
  //     condition.objectiveId = { $in: objectiveIds };
  //   } else if (query.objectiveId) {
  //     condition.objectiveId = query.objectiveId;
  //   }

  //   // Fetch KPIs
  //   const kpis = await this.KpiModel.find(condition);

  //   // Fetch entities
  //   let entities = [];
  //   if (query.entityId === 'All') {
  //     entities = await this.prisma.entity.findMany({
  //       where: { locationId: { in: locationIds } },
  //       select: { id: true, entityName: true },
  //     });
  //   } else {
  //     const entityIdsArray = query.entityId.split(',').map((id) => id.trim());
  //     entities = await this.prisma.entity.findMany({
  //       where: { id: { in: entityIdsArray } },
  //       select: { id: true, entityName: true },
  //     });
  //   }
  //   console.log('entities', entities);
  //   let allKpiData = {};

  //   for (let entity of entities) {
  //     let groupedData = {};
  //     console.log('entity', entity.entityName);
  //     for (let kpi of kpis) {
  //       const kpiId = kpi._id.toString();

  //       let monthwiseresult = await this.mySQLPrisma.$queryRaw`
  //               SELECT * FROM kpiSummary
  //               WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
  //                 AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
  //                 AND kpiId = ${kpiId}
  //                 AND kpiEntity = ${entity.id}
  //           `;

  //       let currentYearData = await this.mySQLPrisma.$queryRaw`
  //               SELECT kpiYear,
  //                   SUM(monthlySum) as totalQuarterSum,
  //                   AVG(monthlyAverage) as averageQuarterAverage,
  //                   SUM(monthlyVariance) as totalQuarterVariance,
  //                   SUM(monthlyTarget) as totalQuarterTarget,
  //                   AVG(monthlyTarget) as targetAverage
  //               FROM kpiSummary
  //               WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
  //                 AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
  //                 AND kpiId = ${kpiId}
  //                 AND kpiEntity = ${entity.id}
  //               GROUP BY kpiYear
  //           `;

  //       let data1 = {
  //         kpiYear: present,
  //         totalQuarterSum: currentYearData[0]?.totalQuarterSum,
  //         averageQuarterAverage: currentYearData[0]?.averageQuarterAverage,
  //         totalQuarterVariance: currentYearData[0]?.totalQuarterVariance,
  //         totalQuarterTarget: currentYearData[0]?.totalQuarterTarget,
  //         targetAverage: currentYearData[0]?.targetAverage,
  //       };

  //       let previousYear1Data = await this.mySQLPrisma.$queryRaw`
  //               SELECT kpiYear,
  //                   SUM(monthlySum) as totalQuarterSum,
  //                   AVG(monthlyAverage) as averageQuarterAverage,
  //                   SUM(monthlyVariance) as totalQuarterVariance,
  //                   SUM(monthlyTarget) as totalQuarterTarget,
  //                   AVG(monthlyTarget) as targetAverage
  //               FROM kpiSummary
  //               WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${previousOneFrom}
  //                 AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${previousOneTo}
  //                 AND kpiId = ${kpiId}
  //                 AND kpiEntity = ${entity.id}
  //               GROUP BY kpiYear
  //           `;

  //       let data2 = {
  //         kpiYear: previous1,
  //         totalQuarterSum: previousYear1Data[0]?.totalQuarterSum,
  //         averageQuarterAverage: previousYear1Data[0]?.averageQuarterAverage,
  //         totalQuarterVariance: previousYear1Data[0]?.totalQuarterVariance,
  //         totalQuarterTarget: previousYear1Data[0]?.totalQuarterTarget,
  //         targetAverage: previousYear1Data[0]?.targetAverage,
  //       };

  //       let previousYear2Data = await this.mySQLPrisma.$queryRaw`
  //               SELECT kpiYear,
  //                   SUM(monthlySum) as totalQuarterSum,
  //                   AVG(monthlyAverage) as averageQuarterAverage,
  //                   SUM(monthlyVariance) as totalQuarterVariance,
  //                   SUM(monthlyTarget) as totalQuarterTarget,
  //                   AVG(monthlyTarget) as targetAverage
  //               FROM kpiSummary
  //               WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${previousTwoFrom}
  //                 AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${previousTwoTo}
  //                 AND kpiId = ${kpiId}
  //                 AND kpiEntity = ${entity.id}
  //               GROUP BY kpiYear
  //           `;

  //       let data3 = {
  //         kpiYear: previous2,
  //         totalQuarterSum: previousYear2Data[0]?.totalQuarterSum,
  //         averageQuarterAverage: previousYear2Data[0]?.averageQuarterAverage,
  //         totalQuarterVariance: previousYear2Data[0]?.totalQuarterVariance,
  //         totalQuarterTarget: previousYear2Data[0]?.totalQuarterTarget,
  //         targetAverage: previousYear2Data[0]?.targetAverage,
  //       };

  //       let result = await this.mySQLPrisma.$queryRaw`
  //               SELECT kpiYear,
  //                   SUM(monthlySum) as totalMonthlySum,
  //                   AVG(monthlyAverage) as averageMonthlyAverage,
  //                   AVG(monthlyTarget) as monthlyTargetAverage,
  //                   SUM(monthlyVariance) as totalMonthlyVariance,
  //                   SUM(monthlyTarget) as totalTarget
  //               FROM kpiSummary
  //               WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
  //                 AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
  //                 AND kpiId = ${kpiId}
  //                 AND kpiEntity = ${entity.id}
  //                 AND kpiYear IS NOT NULL
  //                 AND kpiMonthYear IS NOT NULL
  //               GROUP BY kpiYear
  //           `;

  //       const finalResult = await this.toJson(result);
  //       const categoryname = await this.orgObjective.findById(kpi.categoryId);
  //       const data = {
  //         id: kpi._id,
  //         kpi: kpi.kpiName,
  //         uom: kpi.uom,
  //         kpitype: kpi.kpiTargetType,
  //         kpiTarget: kpi.kpiTarget,
  //         displayType: kpi.displayType,
  //         categoryName: categoryname.ObjectiveCategory,
  //         kpidatamonthwise: monthwiseresult,
  //         sum: JSON.parse(finalResult),
  //         currentYearData: data1,
  //         previousYear1: data2,
  //         previousYear2: data3,
  //       };

  //       if (!groupedData[entity.id]) {
  //         groupedData[entity.id] = {};
  //       }

  //       if (!groupedData[entity.id][data.categoryName]) {
  //         groupedData[entity.id][data.categoryName] = [];
  //       }

  //       groupedData[entity.id][data.categoryName].push(data);
  //     }
  //     console.log('groupeddata', groupedData);
  //     // Transform groupedData to the desired format and add to allKpiData
  //     allKpiData[entity.entityName] = Object.keys(groupedData[entity.id]).map(
  //       (categoryName) => ({
  //         categoryName,
  //         kpis: groupedData[entity.id][categoryName],
  //       }),
  //     );

  //     // Clear groupedData for the next entity
  //     groupedData = {};
  //   }

  //   console.log('All KPI Data:', allKpiData);

  //   return allKpiData;
  // }
  async exportReport(userid, query) {
    // console.log('Query Parameters:', query);

    // Fetch the active user and organization details
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
      include: { organization: true },
    });

    // Prepare date variables
    const today = new Date();
    const { startDate, endDate, endyear } = await this.calculateStartAndEndDate(
      activeuser.organization.fiscalYearQuarters,
      activeuser.organization.auditYear,
      today,
    );
    // console.log('endyear', endyear);
    let previoustartmonth, previousendmonth, enddate;
    if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
      previousendmonth = 2;
      previoustartmonth = 3;
      enddate = new Date(endyear, 2, 31);
    } else {
      previousendmonth = 11;
      previoustartmonth = 0;
    }
    const startMonth = startDate.getMonth().toString();
    const endMonth = endDate.getMonth().toString();
    const startYear = startDate.getFullYear().toString();
    const endYear = endDate.getFullYear().toString();
    const from = startYear + startMonth;
    const to = endYear + endMonth;
    // console.log('from and to', from, to);
    const currentstartYear = (startDate.getFullYear() % 100)
      .toString()
      .padStart(2, '0');
    // console.log('currentstartyear', currentstartYear);
    const currentendYear = ((startDate.getFullYear() + 1) % 100)
      .toString()
      .padStart(2, '0');
    // console.log('currentendYear', currentendYear);
    const present = currentstartYear + '-' + currentendYear;
    const previous1startYear = ((startDate.getFullYear() % 100) - 1)
      .toString()
      .padStart(2, '0');
    // console.log('currentstartyear', currentstartYear);
    const previous1endYear = (startDate.getFullYear() % 100)
      .toString()
      .padStart(2, '0');
    const previous1 = previous1startYear + '-' + previous1endYear;
    const previous2startYear = ((startDate.getFullYear() % 100) - 2)
      .toString()
      .padStart(2, '0');
    // console.log('currentstartyear', currentstartYear);
    const previous2endYear = ((startDate.getFullYear() % 100) - 1)
      .toString()
      .padStart(2, '0');
    const previous2 = previous2startYear + '-' + previous2endYear;
    // Calculate the previous one year
    const previousOneStart = new Date(startDate); // Make a copy of the start date
    previousOneStart.setFullYear(previousOneStart.getFullYear() - 1); // Subtract one year
    const previousOneEnd = new Date(enddate); // Make a copy of the end date
    previousOneEnd.setFullYear(previousOneEnd.getFullYear() - 1); // Subtract one year
    const previousOneFrom =
      previousOneStart.getFullYear().toString() +
      previousOneStart.getMonth().toString();
    const previousOneTo =
      previousOneEnd.getFullYear().toString() +
      previousOneEnd.getMonth().toString();

    // console.log('previous one from and to', previousOneFrom, previousOneTo);

    // Calculate the previous two years
    const previousTwoStart = new Date(startDate);
    previousTwoStart.setFullYear(previousTwoStart.getFullYear() - 2);
    const previousTwoEnd = new Date(endDate);
    previousTwoEnd.setFullYear(previousTwoEnd.getFullYear() - 1);
    const previousTwoFrom =
      previousTwoStart.getFullYear().toString() +
      (previousTwoStart.getMonth() + 1).toString().padStart(2, '0');
    const previousTwoTo =
      previousTwoEnd.getFullYear().toString() +
      (previousTwoEnd.getMonth() + 1).toString().padStart(2, '0');

    // Build query conditions
    let condition: any = { organizationId: activeuser.organizationId };
    const locationIds = query.locationId ? query.locationId.split(',') : [];
    const entityIds = query.entityId ? query.entityId.split(',') : [];
    const categoryIds = query.categoryId ? query.categoryId.split(',') : [];
    const objectiveIds = query.objectiveId ? query.objectiveId.split(',') : [];

    if (Array.isArray(locationIds) && locationIds.length > 0) {
      condition.locationId = { $in: locationIds };
    } else if (query.locationId) {
      condition.locationId = query.locationId;
    }

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      condition.categoryId = { $in: categoryIds };
    } else if (query.categoryId) {
      condition.categoryId = query.categoryId;
    }

    if (Array.isArray(objectiveIds) && objectiveIds.length > 0) {
      condition.objectiveId = { $in: objectiveIds };
    } else if (query.objectiveId) {
      condition.objectiveId = query.objectiveId;
    }

    // Fetch KPIs
    const kpis = await this.KpiModel.find(condition);
    // console.log('Fetched KPIs:', kpis);

    // Fetch entities
    let entities = [];
    if (query.entityId === 'All') {
      entities = await this.prisma.entity.findMany({
        where: { locationId: { in: locationIds } },
        select: { id: true, entityName: true },
      });
    } else {
      const entityIdsArray = query.entityId.split(',').map((id) => id.trim());
      entities = await this.prisma.entity.findMany({
        where: { id: { in: entityIdsArray } },
        select: { id: true, entityName: true },
      });
    }
    // console.log('Fetched Entities:', entities);

    let allKpiData = {};
    let categoryCountByDepartment = {};

    for (let entity of entities) {
      // console.log(`Processing entity: ${entity.id} (${entity.entityName})`);

      // Filter KPIs by the current entity
      const entityKpis = kpis.filter((kpi) => kpi.entityId === entity.id);

      let groupedData = {};

      // Process KPIs for the current entity
      for (let kpi of entityKpis) {
        const kpiId = kpi._id.toString();
        // console.log(`Processing KPI: ${kpiId}`);

        // Fetch data from MySQL
        // console.log('month from to', from, to);
        let monthwiseresult = await this.mySQLPrisma.$queryRaw`
                SELECT * FROM kpiSummary
                WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
          AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                AND kpiId = ${kpiId}
                AND kpiEntity=${entity.id}
              `;
        // console.log('monthwiseresult', monthwiseresult);
        let result = await this.mySQLPrisma.$queryRaw`
                SELECT kpiYear,
                SUM(monthlySum) as totalMonthlySum,
                AVG(monthlyAverage) as averageMonthlyAverage,
                AVG(monthlyTarget) as monthlyTargetAverage,
                SUM(monthlyVariance) as totalMonthlyVariance,
                SUM(monthlyTarget) as totalTarget
                FROM kpiSummary
                WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                AND kpiId = ${kpiId}
               
                AND kpiEntity=${entity.id}
                AND kpiYear IS NOT NULL
                AND kpiMonthYear IS NOT NULL
                GROUP BY kpiYear`;

        let currentYearData = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE CONCAT(kpiYear, kpiMonthYear) >= ${from}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${to}
                AND kpiId = ${kpiId}
               
                AND kpiEntity=${entity.id}
                AND kpiYear IS NOT NULL
                AND kpiMonthYear IS NOT NULL
                GROUP BY kpiYear`;
        // console.log('current year data', currentYearData, from, to);
        let data1: any = {
          kpiYear: present,
          totalQuarterSum: currentYearData[0]?.totalQuarterSum,
          averageQuarterAverage: currentYearData[0]?.averageQuarterAverage,
          totalQuarterVariance: currentYearData[0]?.totalQuarterVariance,
          totalQuarterTarget: currentYearData[0]?.totalQuarterTarget,
          targetAverage: currentYearData[0]?.targetAverage,
        };
        // Query for previous year 1 data
        let previousYear1Data = await this.mySQLPrisma.$queryRaw`
               SELECT  kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,  AVG(monthlyTarget) as targetAverage
               FROM kpiSummary
               WHERE CONCAT(kpiYear, kpiMonthYear) >= ${previousOneFrom}
                AND CONCAT(kpiYear, kpiMonthYear) <= ${previousOneTo}
                   AND kpiId= ${kpiId}
                  
                   AND kpiEntity=${entity.id}
               GROUP BY kpiYear`;
        // console.log(
        //   'previous1 data',
        //   previousYear1Data,
        //   previousOneFrom,
        //   previousOneTo,
        // );
        let data2: any = {
          kpiYear: previous1,
          totalQuarterSum: previousYear1Data[0]?.totalQuarterSum,
          averageQuarterAverage: previousYear1Data[0]?.averageQuarterAverage,
          totalQuarterVariance: previousYear1Data[0]?.totalQuarterVariance,
          totalQuarterTarget: previousYear1Data[0]?.totalQuarterTarget,
          targetAverage: previousYear1Data[0]?.targetAverage,
        };

        // Query for previous year 2 data
        let previousYear2Data = await this.mySQLPrisma.$queryRaw`
               SELECT kpiYear,
                   SUM(monthlySum) as totalQuarterSum,
                   AVG(monthlyAverage) as averageQuarterAverage,
                   SUM(monthlyVariance) as totalQuarterVariance,
                   SUM(monthlyTarget) as totalQuarterTarget,
                   AVG(monthlyTarget) as targetAverage

               FROM kpiSummary
               WHERE  CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${previousTwoFrom}
                AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${previousTwoTo}
                   AND kpiId= ${kpiId}
                  
                   AND kpiEntity=${entity.id}
               GROUP BY kpiYear`;
        // console.log(
        //   'previous2 data',
        //   previousTwoFrom,
        //   previousTwoTo,
        //   previousYear2Data,
        // );
        let data3: any = {
          kpiYear: previous2,
          totalQuarterSum: previousYear2Data[0]?.totalQuarterSum,
          averageQuarterAverage: previousYear2Data[0]?.averageQuarterAverage,
          totalQuarterVariance: previousYear2Data[0]?.totalQuarterVariance,
          totalQuarterTarget: previousYear2Data[0]?.totalQuarterTarget,
          targetAverage: previousYear2Data[0]?.targetAverage,
        };
        const finalResult = await this.toJson(result);
        const categoryname = await this.orgObjective.findById(kpi.categoryId);
        const data = {
          id: kpi._id,
          kpi: kpi.kpiName,
          uom: kpi.uom,
          kpitype: kpi.kpiTargetType,
          kpiTarget: kpi.kpiTarget,
          displayType: kpi.displayType,
          categoryName: categoryname.ObjectiveCategory,
          kpidatamonthwise: monthwiseresult,
          sum: JSON.parse(finalResult),
          currentYearData: data1,
          previousYear1: data2,
          previousYear2: data3,
        };

        // Initialize groupedData for each entity and category
        if (!groupedData[entity.id]) {
          groupedData[entity.id] = {};
        }
        if (!groupedData[entity.id][data.categoryName]) {
          groupedData[entity.id][data.categoryName] = [];
        }

        groupedData[entity.id][data.categoryName].push(data);
      }

      // Check if groupedData[entity.id] is valid before proceeding
      if (groupedData[entity.id]) {
        allKpiData[entity.entityName] = Object.keys(groupedData[entity.id]).map(
          (categoryName) => ({
            categoryName,
            kpis: groupedData[entity.id][categoryName],
          }),
        );
      } else {
        allKpiData[entity.entityName] = []; // Ensure we have an empty array if no data is available
      }

      // console.log(
      //   `Grouped Data for Entity ${entity.id} (${entity.entityName}):`,
      //   groupedData,
      // );
    }

    // console.log('All KPI Data:', allKpiData);

    return allKpiData;
  }

  // Utility function to get date ranges
  getDateRanges(startDate, endDate, endyear) {
    const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const startYear = startDate.getFullYear().toString();
    const endYear = endDate.getFullYear().toString();

    const from = startYear + startMonth;
    const to = endYear + endMonth;

    const previousOneStart = new Date(startDate);
    previousOneStart.setFullYear(previousOneStart.getFullYear() - 1);
    const previousOneEnd = new Date(endDate);
    previousOneEnd.setFullYear(previousOneEnd.getFullYear() - 1);
    const previousOneFrom =
      previousOneStart.getFullYear().toString() +
      (previousOneStart.getMonth() + 1).toString().padStart(2, '0');
    const previousOneTo =
      previousOneEnd.getFullYear().toString() +
      (previousOneEnd.getMonth() + 1).toString().padStart(2, '0');

    const previousTwoStart = new Date(startDate);
    previousTwoStart.setFullYear(previousTwoStart.getFullYear() - 2);
    const previousTwoEnd = new Date(endDate);
    previousTwoEnd.setFullYear(previousTwoEnd.getFullYear() - 1);
    const previousTwoFrom =
      previousTwoStart.getFullYear().toString() +
      (previousTwoStart.getMonth() + 1).toString().padStart(2, '0');
    const previousTwoTo =
      previousTwoEnd.getFullYear().toString() +
      (previousTwoEnd.getMonth() + 1).toString().padStart(2, '0');

    return {
      from,
      to,
      previousOneFrom,
      previousOneTo,
      previousTwoFrom,
      previousTwoTo,
    };
  }

  async getEntitiesByLocations(query, userid) {
    //console.log('query', query);
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });
    const result = await this.prisma.entity.findMany({
      where: {
        locationId: query.locationId,
        deleted: false,
        organizationId: activeUser.organizationId,
      },
      select: {
        id: true,
        entityName: true,
        organizationId: true,
      },
      orderBy: { entityName: 'asc' },
    });
    //console.log('result', result);
    return result;
  }

  async parseFiscalYear(fiscalYear: string) {
    const currentYear = new Date().getFullYear();
    if (fiscalYear.includes('-')) {
      const [start, end] = fiscalYear.split('-').map((y) => parseInt(y, 10));
      const startYear = start < 100 ? 2000 + start : start;
      const endYear = end < 100 ? 2000 + end : end;
      return { startYear: startYear, endYear: endYear };
    } else {
      const year = parseInt(fiscalYear, 10);
      return { startYear: year, endYear: year + 1 };
    }
  }

  async getSemiannualPeriod(
    date: string,
    fiscalYear: string,
    fiscalYearQuarters: string,
  ) {
    // console.log('date', date);
    const inputDate = new Date(date);
    const { startYear, endYear } = await this.parseFiscalYear(fiscalYear);
    // console.log('start and end', startYear, endYear);
    if (fiscalYearQuarters === 'April - Mar') {
      const fiscalYearStart = new Date(startYear, 3, 1);
      const fiscalYearEnd = new Date(endYear, 2, 31);
      // console.log(
      //   'fiscalyearstart,fiscalend',
      //   fiscalYearStart,
      //   fiscalYearEnd,
      //   inputDate,
      // );
      if (inputDate < fiscalYearStart || inputDate > fiscalYearEnd) {
        return 'Date is out of fiscal year bounds';
      }

      if (
        inputDate >= fiscalYearStart &&
        inputDate < new Date(startYear, 9, 1)
      ) {
        // October 1st starts the second semiannual period
        return 1;
      } else {
        return 2;
      }
    } else {
      const fiscalYearStart = new Date(startYear, 0, 1); // Assuming Jan as the fiscal year start
      const fiscalYearEnd = new Date(endYear, 11, 31); // Dec of the next year

      if (inputDate < fiscalYearStart || inputDate > fiscalYearEnd) {
        return 'Date is out of fiscal year bounds';
      }

      if (
        inputDate >= fiscalYearStart &&
        inputDate < new Date(startYear, 9, 1)
      ) {
        // October 1st starts the second semiannual period
        return 1;
      } else {
        return 2;
      }
    }
  }
  // async getAllKpiDataForGraph(userid, query) {
  //   const kpiInfo = await this.KpiModel.findById(query.kpiId);
  //   const activeuser = await this.prisma.user.findFirst({
  //     where: { kcId: userid },
  //     include: { organization: true },
  //   });
  //   const today = new Date();
  //   const { startDate, endDate, endyear } = await this.calculateStartAndEndDate(
  //     activeuser.organization.fiscalYearQuarters,
  //     activeuser.organization.auditYear,
  //     today,
  //   );
  //   console.log('endyear', startDate, endyear, endDate);
  //   let previoustartmonth, previousendmonth, enddate;
  //   if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
  //     previousendmonth = 2;
  //     previoustartmonth = 3;
  //     enddate = new Date(endyear, 2, 31);
  //   } else {
  //     previousendmonth = 11;
  //     previoustartmonth = 0;
  //   }

  //   let fiscalYearStartMonth, fiscalYearEndMonth;
  //   if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
  //     fiscalYearEndMonth = 2;
  //     fiscalYearStartMonth = 3;
  //     enddate = new Date(endyear, 2, 31);
  //   } else {
  //     fiscalYearEndMonth = 11;
  //     fiscalYearStartMonth = 0;
  //   }
  //   const startMonth = startDate.getMonth().toString().padStart(2, '0');
  //   const endMonth = endDate.getMonth().toString().padStart(2, '0');
  //   const startYear = startDate.getFullYear().toString();
  //   const endYear = endDate.getFullYear().toString();

  //   const from = startYear + startMonth;
  //   const to = endYear + endMonth;
  //   console.log('from and to', from, to);
  //   const currentstartYear = (startDate.getFullYear() % 100)
  //     .toString()
  //     .padStart(2, '0');
  //   // console.log('currentstartyear', currentstartYear);
  //   const currentendYear = ((startDate.getFullYear() + 1) % 100)
  //     .toString()
  //     .padStart(2, '0');
  //   // console.log('currentendYear', currentendYear);
  //   const present = currentstartYear + '-' + currentendYear;
  //   const previousYearStart = new Date(startDate);
  //   previousYearStart.setFullYear(previousYearStart.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
  //   previousYearStart.setMonth(fiscalYearStartMonth); // Set to April of previous year

  //   const previousYearEnd = new Date(enddate);
  //   previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1); // Subtract 1 year for the previous fiscal year
  //   previousYearEnd.setMonth(fiscalYearEndMonth); // Set to March of the previous year

  //   // Format the previous year's start and end dates as YYYYMM
  //   const previousYearFrom =
  //     previousYearStart.getFullYear().toString() +
  //     previousYearStart.getMonth().toString().padStart(2, '0');
  //   const previousYearTo =
  //     previousYearEnd.getFullYear().toString() +
  //     previousYearEnd.getMonth().toString().padStart(2, '0');

  //   // For two years ago (2 years ago)
  //   const previousTwoYearStart = new Date(startDate);
  //   previousTwoYearStart.setFullYear(previousTwoYearStart.getFullYear() - 2); // Subtract 2 years for the previous two fiscal year
  //   previousTwoYearStart.setMonth(fiscalYearStartMonth); // Set to April of two years ago

  //   const previousTwoYearEnd = new Date(enddate);
  //   previousTwoYearEnd.setFullYear(previousTwoYearEnd.getFullYear() - 2); // Subtract 2 years for the previous two fiscal year
  //   previousTwoYearEnd.setMonth(fiscalYearEndMonth); // Set to March of the year before last
  //   console.log('previoustwoend', previousTwoYearEnd);
  //   // Format two years ago start and end dates as YYYYMM
  //   const previousTwoFrom =
  //     previousTwoYearStart.getFullYear().toString() +
  //     previousTwoYearStart.getMonth().toString().padStart(2, '0');
  //   const previousTwoTo =
  //     previousTwoYearEnd.getFullYear().toString() +
  //     previousTwoYearEnd.getMonth().toString().padStart(2, '0');
  //   const kpiId = query.kpiId;
  //   console.log('previousTwo', previousTwoFrom, previousTwoTo);
  //   let yearWiseData: any = [];
  //   let previousYear2Data = await this.mySQLPrisma.$queryRaw`
  //   SELECT kpiYear,
  //       SUM(monthlySum) as totalQuarterSum,
  //       AVG(monthlyAverage) as averageQuarterAverage,
  //       SUM(monthlyVariance) as totalQuarterVariance,
  //       SUM(monthlyTarget) as totalQuarterTarget,
  //      AVG(monthlyMinimumTarget) as averageMinimumTarget,
  //      SUM(monthlyMinimumTarget) as totalMinimumTarget,
  //       SUM(monthlyOperationalTarget) as totalOperationalTarget,
  //       AVG(monthlyTarget) as targetAverage

  //   FROM kpiSummary
  //   WHERE  CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) >= ${previousTwoFrom}
  //    AND CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) <= ${previousTwoTo}
  //       AND kpiId= ${kpiId}

  //   GROUP BY kpiYear`;
  //   // console.log(
  //   //   'previous2 data',
  //   //   previousTwoFrom,
  //   //   previousTwoTo,
  //   //   previousYear2Data,
  //   // );
  //   let data3: any = {
  //     kpiYear:
  //       activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
  //         ? (previousTwoYearStart.getFullYear() % 100)
  //             .toString()
  //             .padStart(2, '0') +
  //           '-' +
  //           (previousTwoYearEnd.getFullYear() % 100).toString().padStart(2, '0')
  //         : previousTwoYearStart.getFullYear(),
  //     totalQuarterSum: previousYear2Data[1]
  //       ? previousYear2Data[0]?.totalQuarterSum +
  //         previousYear2Data[1]?.totalQuarterSum
  //       : previousYear2Data[0]?.totalQuarterSum,
  //     averageQuarterAverage: previousYear2Data[1]
  //       ? previousYear2Data[0]?.averageQuarterAverage +
  //         previousYear2Data[1]?.averageQuarterAverage
  //       : previousYear2Data[0]?.averageQuarterAverage,
  //     totalQuarterVariance: previousYear2Data[1]
  //       ? previousYear2Data[0]?.totalQuarterVariance +
  //         previousYear2Data[1]?.totalQuarterVariance
  //       : previousYear2Data[0]?.totalQuarterVariance,
  //     totalQuarterTarget: previousYear2Data[1]
  //       ? previousYear2Data[0]?.totalQuarterTarget +
  //         previousYear2Data[1]?.totalQuarterTarget
  //       : previousYear2Data[0]?.totalQuarterTarget,
  //     totalOperationalTarget: previousYear2Data[1]
  //       ? previousYear2Data[0]?.totalOperationalTarget +
  //         previousYear2Data[1]?.totalOperationalTarget
  //       : previousYear2Data[0]?.totalOperationalTarget,
  //     targetAverage: previousYear2Data[1]
  //       ? previousYear2Data[0]?.targetAverage +
  //         previousYear2Data[1]?.targetAverage
  //       : previousYear2Data[0]?.targetAverage,
  //     averageMinimumTarget: previousYear2Data[1]
  //       ? previousYear2Data[0]?.averageMinimumTarget +
  //         previousYear2Data[1]?.averageMinimumTarget
  //       : previousYear2Data[0]?.averageMinimumTarget,
  //     totalMinimumTarget: previousYear2Data[1]
  //       ? previousYear2Data[0]?.totalMinimumTarget +
  //         previousYear2Data[1]?.totalMinimumTarget
  //       : previousYear2Data[0]?.totalMinimumTarget,
  //   };

  //   // console.log('data3', data3);
  //   yearWiseData.push(data3);

  //   let previousYear1Data = await this.mySQLPrisma.$queryRaw`
  //   SELECT  kpiYear,
  //       SUM(monthlySum) as totalQuarterSum,
  //       AVG(monthlyAverage) as averageQuarterAverage,
  //       SUM(monthlyVariance) as totalQuarterVariance,
  //       SUM(monthlyTarget) as totalQuarterTarget,
  //       SUM(monthlyOperationalTarget) as totalOperationalTarget,
  //       SUM(monthlyMinimumTarget) as totalMinimumTarget,
  //       AVG(monthlyMinimumTarget) as averageMinimumTarget,
  //         AVG(monthlyTarget) as targetAverage
  //   FROM kpiSummary
  //   WHERE  CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) >= ${previousYearFrom}
  //    AND CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) <= ${previousYearTo}
  //       AND kpiId= ${kpiId}

  //   GROUP BY kpiYear`;
  //   // console.log(
  //   //   'previousyearfrom, previousTo',
  //   //   previousYearFrom,
  //   //   previousYearTo,
  //   //   previousYear1Data,
  //   // );
  //   let data2: any = {
  //     kpiYear:
  //       (previousYearStart.getFullYear() % 100).toString().padStart(2, '0') +
  //       '-' +
  //       (previousYearEnd.getFullYear() % 100).toString().padStart(2, '0'),
  //     totalQuarterSum: previousYear1Data[1]
  //       ? previousYear1Data[0]?.totalQuarterSum +
  //         previousYear1Data[1]?.totalQuarterSum
  //       : previousYear1Data[0]?.totalQuarterSum,
  //     averageQuarterAverage: previousYear1Data[1]
  //       ? previousYear1Data[0]?.averageQuarterAverage +
  //         previousYear1Data[1]?.averageQuarterAverage
  //       : previousYear1Data[0]?.averageQuarterAverage,
  //     totalQuarterVariance: previousYear1Data[1]
  //       ? previousYear1Data[0]?.totalQuarterVariance +
  //         previousYear1Data[1]?.totalQuarterVariance
  //       : previousYear1Data[0]?.totalQuarterVariance,
  //     totalQuarterTarget: previousYear1Data[1]
  //       ? previousYear1Data[0]?.totalQuarterTarget +
  //         previousYear1Data[1]?.totalQuarterTarget
  //       : previousYear1Data[0]?.totalQuarterTarget,
  //     totalOperationalTarget: previousYear1Data[1]
  //       ? previousYear1Data[0]?.totalOperationalTarget +
  //         previousYear1Data[1]?.totalOperationalTarget
  //       : previousYear1Data[0]?.totalOperationalTarget,
  //     targetAverage: previousYear1Data[1]
  //       ? previousYear1Data[0]?.targetAverage +
  //         previousYear1Data[1]?.targetAverage
  //       : previousYear1Data[0]?.targetAverage,
  //     averageMinimumTarget: previousYear1Data[1]
  //       ? previousYear1Data[0]?.averageMinimumTarget +
  //         previousYear1Data[1]?.averageMinimumTarget
  //       : previousYear1Data[0]?.averageMinimumTarget,
  //     totalMinimumTarget: previousYear1Data[1]
  //       ? previousYear1Data[0]?.totalMinimumTarget +
  //         previousYear1Data[1]?.totalMinimumTarget
  //       : previousYear1Data[0]?.totalMinimumTarget,
  //   };

  //   // console.log('data2', data2);
  //   yearWiseData.push(data2);
  //   let currentYearData = await this.mySQLPrisma.$queryRaw`
  //  SELECT  kpiYear,
  //      SUM(monthlySum) as totalQuarterSum,
  //      AVG(monthlyAverage) as averageQuarterAverage,
  //      SUM(monthlyVariance) as totalQuarterVariance,
  //      SUM(monthlyTarget) as totalQuarterTarget,
  //      SUM(monthlyOperationalTarget) as totalOperationalTarget,
  //      SUM(monthlyMinimumTarget) as totalMinimumTarget,
  //      AVG(monthlyMinimumTarget) as averageMinimumTarget,
  //       AVG(monthlyTarget) as targetAverage
  //  FROM kpiSummary
  //  WHERE  CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) >= ${from}
  //   AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
  //      AND kpiId= ${kpiId}

  //  GROUP BY kpiYear`;

  //   //monthwise data
  //   let monthwiseresult: any = await this.mySQLPrisma.$queryRaw`
  //   SELECT * FROM kpiSummary
  //   WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
  //         AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
  //   AND kpiId = ${kpiId}`;
  //   console.log('monthwiseresult', monthwiseresult);
  //   let startMonthIndex, endMonthIndex;
  //   if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
  //     startMonthIndex = startDate.getMonth() - 3; // April should be 0, adjust for fiscal start
  //     endMonthIndex = endDate.getMonth() - 3;
  //     startMonthIndex = (startMonthIndex + 12) % 12;
  //     endMonthIndex = (endMonthIndex + 12) % 12;
  //   } else {
  //     startMonthIndex = startDate.getMonth(); // Get the starting month index (0-11)
  //     endMonthIndex = endDate.getMonth(); // Get the ending month index (0-11)
  //   }

  //   let allMonths = [];
  //   let currentMonth = new Date(startDate);
  //   while (
  //     currentMonth.getFullYear() < endYear ||
  //     (currentMonth.getFullYear() === endYear &&
  //       currentMonth.getMonth() <= endMonth)
  //   ) {
  //     allMonths.push(currentMonth.getMonth());
  //     currentMonth.setMonth(currentMonth.getMonth() + 1);
  //   }

  //   // Fill monthWiseData with empty objects for missing months
  //   const monthWiseData = Array.from(
  //     { length: endMonthIndex - startMonthIndex + 1 },
  //     (_, i) => {
  //       const monthIndex = (startMonthIndex + i) % 12;

  //       // Adjust month index based on the fiscal year start (from active user info)
  //       const fiscalYearStart = activeuser.organization.fiscalYearQuarters; // e.g., 'April-Mar' or 'Jan-Dec'
  //       const fiscalIndex = this.fiscalMonthIndex(
  //         startMonthIndex + i,
  //         fiscalYearStart,
  //       );

  //       // Adjust year offset if the fiscal year moves to the next year
  //       const yearOffset = Math.floor((startMonthIndex + i) / 12);
  //       const year = startYear + yearOffset;

  //       const monthData = monthwiseresult.find(
  //         (record) => record.kpiMonthYear === monthIndex,
  //       );
  //       if (monthData) {
  //         return { ...monthData, fiscalIndex };
  //       } else {
  //         return {
  //           kpiYear: new Date().getFullYear(),
  //           kpiMonthYear: monthIndex,
  //           fiscalIndex,
  //           monthlySum: null,
  //           monthlyAverage: null,
  //           monthlyVariance: null,
  //           monthlyTarget: null,
  //           monthlyOperationalTarget: null,
  //           monthlyMinimumTarget: null,
  //         };
  //       }
  //     },
  //   );

  //   // Sort the data according to fiscal month order (either Jan-Dec or Apr-Mar)
  //   monthWiseData.sort((a, b) => a.fiscalIndex - b.fiscalIndex);

  //   // console.log('monthwisedata', monthWiseData);
  //   let data1: any = {
  //     kpiYear: present,
  //     totalQuarterSum: currentYearData[1]
  //       ? currentYearData[0]?.totalQuarterSum +
  //         currentYearData[1]?.totalQuarterSum
  //       : currentYearData[0]?.totalQuarterSum,
  //     averageQuarterAverage: currentYearData[1]
  //       ? currentYearData[0]?.averageQuarterAverage +
  //         currentYearData[1]?.averageQuarterAverage
  //       : currentYearData[0]?.averageQuarterAverage,
  //     totalQuarterVariance: currentYearData[1]
  //       ? currentYearData[0]?.totalQuarterVariance +
  //         currentYearData[1]?.totalQuarterVariance
  //       : currentYearData[0]?.totalQuarterVariance,
  //     totalQuarterTarget: currentYearData[1]
  //       ? currentYearData[0]?.totalQuarterTarget +
  //         currentYearData[1]?.totalQuarterTarget
  //       : currentYearData[0]?.totalQuarterTarget,
  //     totalOperationalTarget: currentYearData[1]
  //       ? currentYearData[0]?.totalOperationalTarget +
  //         currentYearData[1]?.totalOperationalTarget
  //       : currentYearData[0]?.totalOperationalTarget,
  //     targetAverage: currentYearData[1]
  //       ? currentYearData[0]?.targetAverage + currentYearData[1]?.targetAverage
  //       : currentYearData[0]?.targetAverage,
  //     averageMinimumTarget: currentYearData[1]
  //       ? currentYearData[0]?.averageMinimumTarget +
  //         currentYearData[1]?.averageMinimumTarget
  //       : currentYearData[0]?.averageMinimumTarget,
  //     totalMinimumTarget: currentYearData[1]
  //       ? currentYearData[0]?.totalMinimumTarget +
  //         currentYearData[1]?.totalMinimumTarget
  //       : currentYearData[0]?.totalMinimumTarget,
  //   };
  //   // console.log('data1', data1);
  //   yearWiseData.push(data1);

  //   const data = {
  //     id: kpiId,
  //     kpi: kpiInfo.kpiName,
  //     uom: kpiInfo.uom,
  //     kpitype: kpiInfo.kpiTargetType,
  //     kpiTarget: kpiInfo.kpiTarget,
  //     displayType: kpiInfo.displayType,
  //     yearWiseData: yearWiseData,

  //     kpidatamonthwise: monthWiseData,
  //   };
  //   return data;
  // }
  async getFiscalYear(orgId, searchyear) {
    const year = await this.prisma.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        fiscalYearQuarters: true,
        fiscalYearFormat: true,
      },
    });

    const isAprilToMarch = year.fiscalYearQuarters === 'April - Mar';

    const date = new Date();
    const currentMonth = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based month

    // Check if the fiscal year starts in April (April-March)
    const isBeforeApril = isAprilToMarch && currentMonth < 4;

    if (!searchyear) {
      let cYear = date.getFullYear();
      let nYear = cYear + 1;

      if (isBeforeApril) {
        // If current date is before April, adjust the previous fiscal year
        cYear--;
        nYear--;
      }
      const clastTwoDigits = cYear.toString().slice(-2);
      const nlastTwoDigits = nYear.toString().slice(-2);

      switch (year.fiscalYearFormat) {
        case 'YYYY':
          return cYear;
        case 'YY-YY+1':
          return `${clastTwoDigits}-${nlastTwoDigits}`;
        case 'YYYY-YY+1':
          return `${cYear}-${nlastTwoDigits}`;
        case 'YY+1':
          return `${nlastTwoDigits}`;
      }
    } else {
      let inputYear = parseInt(searchyear, 10);
      if (isBeforeApril) {
        // If current date is before April, adjust the previous fiscal year
        inputYear--;
        searchyear--;
      }
      const nYear = inputYear + 1;

      const clastTwoDigits = searchyear.toString().slice(-2);
      const nlastTwoDigits = nYear.toString().slice(-2);

      switch (year?.fiscalYearFormat) {
        case 'YYYY':
          return searchyear;
        case 'YY-YY+1':
          return `${clastTwoDigits}-${nlastTwoDigits}`;
        case 'YYYY-YY+1':
          return `${searchyear}-${nlastTwoDigits}`;
        case 'YY+1':
          return `${nlastTwoDigits}`;
      }
    }
  }
  async getAllKpiDataForGraph(userid, query) {
    const kpiInfo = await this.KpiModel.findById(query.kpiId);
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: { organization: true },
    });

    const today = new Date();
    let year;
    if (activeuser.organization.fiscalYearFormat === 'YY-YY+1') {
      year = await this.getFiscalYear(
        activeuser.organizationId,
        today.getFullYear(),
      );
    } else {
      year = activeuser?.organization?.auditYear;
    }
    const { startDate, endDate, endyear } = await this.calculateStartAndEndDate(
      activeuser.organization.fiscalYearQuarters,
      year,
      today,
    );

    let previoustartmonth, previousendmonth, enddate;
    let fiscalYearStartMonth, fiscalYearEndMonth;
    // console.log('activeuser.organization', activeuser.organization);
    if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
      previousendmonth = 2;
      previoustartmonth = 3;
      fiscalYearStartMonth = 3;
      fiscalYearEndMonth = 2;
      enddate = new Date(endyear, 2, 31); // End of March
    } else {
      previousendmonth = 11;
      previoustartmonth = 0;
      fiscalYearStartMonth = 0;
      fiscalYearEndMonth = 11;
      enddate = new Date(endyear, 12, 31);
    }
    // console.log('endyear', startDate, endyear, enddate);

    const startMonth = startDate.getMonth().toString().padStart(2, '0');
    const endMonth = enddate.getMonth().toString().padStart(2, '0');
    const startYear = startDate.getFullYear().toString();
    const endYear = enddate.getFullYear().toString();

    const from = startYear + startMonth;
    const to = endYear + endMonth;
    // console.log('from and to', from, to);

    const currentstartYear = (startDate.getFullYear() % 100)
      .toString()
      .padStart(2, '0');
    const currentendYear = (enddate.getFullYear() % 100)
      .toString()
      .padStart(2, '0');
    const present =
      activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
        ? currentstartYear + '-' + currentendYear
        : startYear;

    // const previousYearStart = new Date(startDate);
    // previousYearStart.setFullYear(previousYearStart.getFullYear() - 1);
    // previousYearStart.setMonth(fiscalYearStartMonth);

    // const previousYearEnd = new Date(enddate);
    // previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1);
    // previousYearEnd.setMonth(fiscalYearEndMonth);

    // const previousYearFrom =
    //   previousYearStart.getFullYear().toString() +
    //   previousYearStart.getMonth().toString().padStart(2, '0');
    // const previousYearTo =
    //   previousYearEnd.getFullYear().toString() +
    //   previousYearEnd.getMonth().toString().padStart(2, '0');

    const previousYearStart = new Date(startDate);
    previousYearStart.setFullYear(previousYearStart.getFullYear() - 1); // Subtract 2 years for previous two years
    previousYearStart.setMonth(fiscalYearStartMonth); // Set to the correct fiscal start month

    const previousYearEnd = new Date(enddate);
    previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1); // Subtract 2 years for previous two years
    previousYearEnd.setMonth(fiscalYearEndMonth); // Set to the correct fiscal end month

    // Ensure these are valid dates before proceeding
    // console.log('Previous one Start Date:', previousYearStart);
    // console.log('Previous one End Date:', previousYearEnd);

    // Now we construct the date strings based on these valid Date objects
    // const previousFrom =
    //   activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
    //     ? (previousYearStart.getFullYear() % 100).toString().padStart(2, '0') +
    //       '-' +
    //       ((previousYearStart.getFullYear() % 100) + 1)
    //         .toString()
    //         .padStart(2, '0')
    //     : previousYearStart.getFullYear().toString() + '-01'; // Add "01" to indicate the start of the month

    // const previousYearTo =
    //   activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
    //     ? (previousYearEnd.getFullYear() % 100).toString().padStart(2, '0') +
    //       '-' +
    //       ((previousYearEnd.getFullYear() % 100) + 1)
    //         .toString()
    //         .padStart(2, '0')
    //     : previousYearEnd.getFullYear().toString() + '-12'; // Add "12" to indicate the end of the fiscal year
    // // console.log('previous year one', previousFrom, previousYearTo);

    const previousTwoYearStart = new Date(startDate);
    previousTwoYearStart.setFullYear(previousTwoYearStart.getFullYear() - 2); // Subtract 2 years for previous two years
    previousTwoYearStart.setMonth(fiscalYearStartMonth); // Set to the correct fiscal start month

    const previousTwoYearEnd = new Date(enddate);
    previousTwoYearEnd.setFullYear(previousTwoYearEnd.getFullYear() - 2); // Subtract 2 years for previous two years
    previousTwoYearEnd.setMonth(fiscalYearEndMonth); // Set to the correct fiscal end month
    // console.log('Previous two Start Date:', previousTwoYearStart);
    // console.log('Previous two End Date:', previousTwoYearEnd);
    // Now we construct the date strings based on these valid Date objects
    // const previousTwoFrom =
    //   activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
    //     ? (previousTwoYearStart.getFullYear() % 100)
    //         .toString()
    //         .padStart(2, '0') +
    //       '-' +
    //       ((previousTwoYearStart.getFullYear() % 100) + 1)
    //         .toString()
    //         .padStart(2, '0')
    //     : previousTwoYearStart.getFullYear().toString() + '-01'; // Add "01" to indicate the start of the month

    // // const previousTwoTo =
    //   activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
    //     ? (previousTwoYearEnd.getFullYear() % 100).toString().padStart(2, '0') +
    //       '-' +
    //       ((previousTwoYearEnd.getFullYear() % 100) + 1)
    //         .toString()
    //         .padStart(2, '0')
    //     : previousTwoYearEnd.getFullYear().toString() + '-12'; // Add "12" to indicate the end of the fiscal year
    // console.log('previous year two', previousTwoFrom, previousTwoTo);
    let yearWiseData: any = [];
    // console.log(
    //   'previousTwoYearEnd,previous',

    //   previousTwoYearEnd,
    //   previousTwoYearStart,
    // );
    const formatDateForQuery = (date) => {
      const year = date.getFullYear(); // Ensure four-digit year (YYYY)
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Convert month to MM format
      return `${year}${month}`;
    };

    // Assuming startDate and endDate are JavaScript Date objects
    let previous2From = formatDateForQuery(previousTwoYearStart);
    let previous2To = formatDateForQuery(previousTwoYearEnd);
    // console.log(
    //   'previous from and start',

    //   previous2From,
    //   previous2To,
    // );
    // Fetching data for two years ago
    let previousYear2Data = await this.mySQLPrisma.$queryRaw`
    SELECT kpiYear,
        ROUND(SUM(monthlySum),2) as totalQuarterSum,
        ROUND(AVG(monthlyAverage),2) as averageQuarterAverage,
        ROUND(SUM(monthlyVariance),2) as totalQuarterVariance,
        ROUND(SUM(monthlyTarget),2) as totalQuarterTarget,
        ROUND(AVG(monthlyMinimumTarget),2) as averageMinimumTarget,
        ROUND(SUM(monthlyMinimumTarget),2) as totalMinimumTarget,
        ROUND(SUM(monthlyOperationalTarget),2) as totalOperationalTarget,
        ROUND(AVG(monthlyTarget),2) as targetAverage
    FROM kpiSummary
    WHERE  CONCAT(kpiYear,  kpiMonthYear) >= ${previous2From}
     AND CONCAT(kpiYear,  kpiMonthYear)<= ${previous2To}
        AND kpiId= ${query.kpiId}
    GROUP BY kpiYear`;

    let data3: any = {
      kpiYear:
        activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
          ? (previousTwoYearStart.getFullYear() % 100)
              .toString()
              .padStart(2, '0') +
            '-' +
            (previousTwoYearEnd.getFullYear() % 100).toString().padStart(2, '0')
          : previousTwoYearStart.getFullYear(),
      totalQuarterSum: previousYear2Data[1]
        ? previousYear2Data[0]?.totalQuarterSum +
          previousYear2Data[1]?.totalQuarterSum
        : previousYear2Data[0]?.totalQuarterSum,
      averageQuarterAverage: previousYear2Data[1]
        ? previousYear2Data[0]?.averageQuarterAverage +
          previousYear2Data[1]?.averageQuarterAverage
        : previousYear2Data[0]?.averageQuarterAverage,
      totalQuarterVariance: previousYear2Data[1]
        ? previousYear2Data[0]?.totalQuarterVariance +
          previousYear2Data[1]?.totalQuarterVariance
        : previousYear2Data[0]?.totalQuarterVariance,
      totalQuarterTarget: previousYear2Data[1]
        ? previousYear2Data[0]?.totalQuarterTarget +
          previousYear2Data[1]?.totalQuarterTarget
        : previousYear2Data[0]?.totalQuarterTarget,
      totalOperationalTarget: previousYear2Data[1]
        ? previousYear2Data[0]?.totalOperationalTarget +
          previousYear2Data[1]?.totalOperationalTarget
        : previousYear2Data[0]?.totalOperationalTarget,
      targetAverage: previousYear2Data[1]
        ? previousYear2Data[0]?.targetAverage +
          previousYear2Data[1]?.targetAverage
        : previousYear2Data[0]?.targetAverage,
      averageMinimumTarget: previousYear2Data[1]
        ? previousYear2Data[0]?.averageMinimumTarget +
          previousYear2Data[1]?.averageMinimumTarget
        : previousYear2Data[0]?.averageMinimumTarget,
      totalMinimumTarget: previousYear2Data[1]
        ? previousYear2Data[0]?.totalMinimumTarget +
          previousYear2Data[1]?.totalMinimumTarget
        : previousYear2Data[0]?.totalMinimumTarget,
    };

    yearWiseData.push(data3);
    let previous1From = formatDateForQuery(previousYearStart);
    let previous1To = formatDateForQuery(previousYearEnd);
    // console.log(
    //   'previous one from and start',

    //   previous1From,
    //   previous1To,
    // );
    // Fetching data for the previous year
    let previousYear1Data = await this.mySQLPrisma.$queryRaw`
    SELECT kpiYear,
        ROUND(SUM(monthlySum),2) as totalQuarterSum,
        ROUND(AVG(monthlyAverage),2) as averageQuarterAverage,
        ROUND(SUM(monthlyVariance),2) as totalQuarterVariance,
        ROUND(SUM(monthlyTarget),2) as totalQuarterTarget,
        ROUND(SUM(monthlyOperationalTarget),2) as totalOperationalTarget,
        ROUND(SUM(monthlyMinimumTarget),2) as totalMinimumTarget,
        ROUND(AVG(monthlyMinimumTarget),2) as averageMinimumTarget,
        ROUND(AVG(monthlyTarget),2) as targetAverage
    FROM kpiSummary
    WHERE  CONCAT(kpiYear,  kpiMonthYear) >= ${previous1From}
     AND CONCAT(kpiYear,  kpiMonthYear) <= ${previous1To}
        AND kpiId= ${query.kpiId}
    GROUP BY kpiYear`;
    // console.log('previousyear one data', previousYear1Data);
    let data2: any = {
      kpiYear:
        activeuser?.organization?.fiscalYearFormat === 'YY-YY+1'
          ? (previousYearStart.getFullYear() % 100)
              .toString()
              .padStart(2, '0') +
            '-' +
            (previousYearEnd.getFullYear() % 100).toString().padStart(2, '0')
          : previousYearStart.getFullYear(),
      totalQuarterSum: previousYear1Data[1]
        ? previousYear1Data[0]?.totalQuarterSum +
          previousYear1Data[1]?.totalQuarterSum
        : previousYear1Data[0]?.totalQuarterSum,
      averageQuarterAverage: previousYear1Data[1]
        ? previousYear1Data[0]?.averageQuarterAverage +
          previousYear1Data[1]?.averageQuarterAverage
        : previousYear1Data[0]?.averageQuarterAverage,
      totalQuarterVariance: previousYear1Data[1]
        ? previousYear1Data[0]?.totalQuarterVariance +
          previousYear1Data[1]?.totalQuarterVariance
        : previousYear1Data[0]?.totalQuarterVariance,
      totalQuarterTarget: previousYear1Data[1]
        ? previousYear1Data[0]?.totalQuarterTarget +
          previousYear1Data[1]?.totalQuarterTarget
        : previousYear1Data[0]?.totalQuarterTarget,
      totalOperationalTarget: previousYear1Data[1]
        ? previousYear1Data[0]?.totalOperationalTarget +
          previousYear1Data[1]?.totalOperationalTarget
        : previousYear1Data[0]?.totalOperationalTarget,
      targetAverage: previousYear1Data[1]
        ? previousYear1Data[0]?.targetAverage +
          previousYear1Data[1]?.targetAverage
        : previousYear1Data[0]?.targetAverage,
      averageMinimumTarget: previousYear1Data[1]
        ? previousYear1Data[0]?.averageMinimumTarget +
          previousYear1Data[1]?.averageMinimumTarget
        : previousYear1Data[0]?.averageMinimumTarget,
      totalMinimumTarget: previousYear1Data[1]
        ? previousYear1Data[0]?.totalMinimumTarget +
          previousYear1Data[1]?.totalMinimumTarget
        : previousYear1Data[0]?.totalMinimumTarget,
    };

    yearWiseData.push(data2);

    // Fetching current year data
    // let currentYearData = await this.mySQLPrisma.$queryRaw`
    // SELECT kpiYear,
    //     SUM(monthlySum) as totalQuarterSum,
    //     AVG(monthlyAverage) as averageQuarterAverage,
    //     SUM(monthlyVariance) as totalQuarterVariance,
    //     SUM(monthlyTarget) as totalQuarterTarget,
    //     SUM(monthlyOperationalTarget) as totalOperationalTarget,
    //     SUM(monthlyMinimumTarget) as totalMinimumTarget,
    //     AVG(monthlyMinimumTarget) as averageMinimumTarget,
    //     AVG(monthlyTarget) as targetAverage
    // FROM kpiSummary
    // WHERE CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) >= ${from}
    //  AND CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) <= ${to}
    //     AND kpiId= ${query.kpiId}
    // GROUP BY kpiYear`;
    let currentYearData = await this.mySQLPrisma.$queryRaw`
    SELECT kpiYear,
        ROUND(SUM(monthlySum), 2) as totalQuarterSum,
        ROUND(AVG(monthlyAverage), 2) as averageQuarterAverage,
        ROUND(SUM(monthlyVariance), 2) as totalQuarterVariance,
        ROUND(SUM(monthlyTarget), 2) as totalQuarterTarget, 
        ROUND(SUM(monthlyOperationalTarget), 2) as totalOperationalTarget,
        ROUND(SUM(monthlyMinimumTarget), 2) as totalMinimumTarget,
        ROUND(AVG(monthlyMinimumTarget), 2) as averageMinimumTarget,
        ROUND(AVG(monthlyTarget), 2) as targetAverage
    FROM kpiSummary
    WHERE CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) >= ${from}
      AND CONCAT(kpiYear,  LPAD(kpiMonthYear, 2, '0')) <= ${to}
      AND kpiId= ${query.kpiId}
    GROUP BY kpiYear`;

    let data1: any = {
      kpiYear: present,
      totalQuarterSum: currentYearData[1]
        ? currentYearData[0]?.totalQuarterSum +
          currentYearData[1]?.totalQuarterSum
        : currentYearData[0]?.totalQuarterSum,
      averageQuarterAverage: currentYearData[1]
        ? currentYearData[0]?.averageQuarterAverage +
          currentYearData[1]?.averageQuarterAverage
        : currentYearData[0]?.averageQuarterAverage,
      totalQuarterVariance: currentYearData[1]
        ? currentYearData[0]?.totalQuarterVariance +
          currentYearData[1]?.totalQuarterVariance
        : currentYearData[0]?.totalQuarterVariance,
      totalQuarterTarget: currentYearData[1]
        ? currentYearData[0]?.totalQuarterTarget +
          currentYearData[1]?.totalQuarterTarget
        : currentYearData[0]?.totalQuarterTarget,
      totalOperationalTarget: currentYearData[1]
        ? currentYearData[0]?.totalOperationalTarget +
          currentYearData[1]?.totalOperationalTarget
        : currentYearData[0]?.totalOperationalTarget,
      targetAverage: currentYearData[1]
        ? currentYearData[0]?.targetAverage + currentYearData[1]?.targetAverage
        : currentYearData[0]?.targetAverage,
      averageMinimumTarget: currentYearData[1]
        ? currentYearData[0]?.averageMinimumTarget +
          currentYearData[1]?.averageMinimumTarget
        : currentYearData[0]?.averageMinimumTarget,
      totalMinimumTarget: currentYearData[1]
        ? currentYearData[0]?.totalMinimumTarget +
          currentYearData[1]?.totalMinimumTarget
        : currentYearData[0]?.totalMinimumTarget,
    };

    yearWiseData.push(data1);
    //monthwise data
    let kpiId = kpiInfo._id;
    let monthwiseresult: any = await this.mySQLPrisma.$queryRaw`
    SELECT * FROM kpiSummary
    WHERE CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) >= ${from}
          AND CONCAT(kpiYear, LPAD(kpiMonthYear, 2, '0')) <= ${to}
    AND kpiId = ${kpiId}`;
    // console.log('monthwiseresult', monthwiseresult);
    let startMonthIndex, endMonthIndex;
    if (activeuser.organization.fiscalYearQuarters === 'April - Mar') {
      startMonthIndex = startDate.getMonth() - 3; // Adjust to the fiscal year (April should be 0)
      endMonthIndex = enddate.getMonth() - 3;

      // Handle wrap around for months starting from April to March (fiscal year)
      startMonthIndex = (startMonthIndex + 12) % 12;
      endMonthIndex = ((endMonthIndex + 12) % 12) + 1;
    } else {
      startMonthIndex = startDate.getMonth(); // For non-fiscal, simple month index (0-11)
      endMonthIndex = enddate.getMonth();
    }

    let allMonths = [];
    let currentMonth = new Date(startDate);
    while (
      currentMonth.getFullYear() < endYear ||
      (currentMonth.getFullYear() === endYear &&
        currentMonth.getMonth() <= endMonth)
    ) {
      allMonths.push(currentMonth.getMonth());
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    // console.log('startmontindes', startMonthIndex, endMonthIndex);
    // Fill monthWiseData with empty objects for missing months
    const monthWiseData = Array.from(
      { length: endMonthIndex - startMonthIndex + 1 },
      (_, i) => {
        const monthIndex = (startMonthIndex + i) % 12;
        // console.log('monthindex', monthIndex);
        // Adjust month index based on the fiscal year start (from active user info)
        const fiscalYearStart = activeuser.organization.fiscalYearQuarters; // e.g., 'April-Mar' or 'Jan-Dec'
        const fiscalIndex = this.fiscalMonthIndex(
          startMonthIndex + i,
          fiscalYearStart,
        );

        // Adjust year offset if the fiscal year moves to the next year
        const yearOffset = Math.floor((startMonthIndex + i) / 12);
        // const year = startYear + yearOffset;

        const monthData = monthwiseresult.find(
          (record) => record.kpiMonthYear === monthIndex,
        );
        if (monthData) {
          return { ...monthData, fiscalIndex };
        } else {
          return {
            kpiYear: new Date().getFullYear(),
            kpiMonthYear: monthIndex,
            fiscalIndex,
            monthlySum: null,
            monthlyAverage: null,
            monthlyVariance: null,
            monthlyTarget: null,
            monthlyOperationalTarget: null,
            monthlyMinimumTarget: null,
          };
        }
      },
    );
    // console.log('monthwise data', monthWiseData);
    // Sort the data according to fiscal month order (either Jan-Dec or Apr-Mar)
    // monthWiseData.sort((a, b) => a.fiscalIndex - b.fiscalIndex);
    const uniqueData = monthWiseData.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.fiscalIndex === value.fiscalIndex),
    );

    uniqueData.sort((a, b) => a.fiscalIndex - b.fiscalIndex);
    // console.log('monthwisedata', monthWiseData);
    const data = {
      id: kpiInfo?._id,
      kpi: kpiInfo.kpiName,
      uom: kpiInfo.uom,
      kpitype: kpiInfo.kpiTargetType,
      kpiTarget: kpiInfo.kpiTarget,
      displayType: kpiInfo.displayType,
      yearWiseData: yearWiseData,

      kpidatamonthwise: uniqueData,
    };
    return data;
  }

  async startCron() {
    // const cron = require('node-cron');
    try {
      this.logger.log(
        `GET /api/kpi-report/startCron started for writeToSummary`,
        '',
      );

      // Fetch connected apps with 'watcher' in the sourceName
      const apps = await this.prisma.organization.findMany({});

      // Loop through each app and run writeToSummary for each organization
      for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        const data = {
          organizationId: app.id, // Pass the organizationId for each app
        };

        try {
          const response1 = await this.writeToSummary(data);
          if (response1) {
            this.logger.log(
              `GET /api/kpi-report/startCron successfully completed for organizationId: ${app.id}`,
              '',
            );
          }
        } catch (writeError) {
          console.error(
            `Error processing writeToSummary for organizationId: ${app.id}`,
            writeError,
          );
        }
      }
    } catch (error) {
      console.error('Error starting cron jobs:', error);
    }
  }
  fiscalMonthIndex = (calendarMonthIndex, fiscalYearStart) => {
    // Adjusting for fiscal year start month (April or January)
    if (fiscalYearStart === 'April - Mar') {
      return (calendarMonthIndex + 9) % 12;
    } else {
      return calendarMonthIndex;
    }
  };
}
