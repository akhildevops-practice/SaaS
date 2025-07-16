import {
  Body,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { has } from 'lodash';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import mongoose, { Model } from 'mongoose';
import { CIPCategory } from 'src/cip/schema/cip-category.schema';
import { kpiReportCategory } from 'src/kpi-report/schema/kpi-report-category.schema';
import { objectiveMaster } from 'src/objective/schema/objectiveMaster.schema';
import { organizationGoal } from 'src/objective/schema/organizationGoal.schema';
import { MySQLPrismaService, PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';
import { ArchivedKpi } from './schema/archived.schema';
import { FutureKpi } from './schema/futureKpi.schema';
import { Kpi, kpiDocument } from './schema/kpi.schema';
import {
  KpiMonthTarget,
  kpiMonthTargetDocument,
} from './schema/kpiMonthTargets.schema';
import { KpiOwner } from './schema/kpiOwners.schema';
import { validate } from 'class-validator'; // Import class-validator
import { KpiMonitoring } from './schema/kpiMonitoring.schema';
import { PrismaClient } from '@prisma/client';
import { cara_settings } from 'src/cara/schema/cara-setting.schema';
import { cara } from 'src/cara/schema/cara.schema';
import { CaraService } from 'src/cara/cara.service';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { OrganizationService } from 'src/organization/organization.service';
import { sendMailToDeptHead } from './email.helper';
import { EmailService } from 'src/email/email.service';
import { ObjOwner } from './schema/objOwners.schema';

@Injectable()
export class KpiDefinitionService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(Kpi.name) private KpiModel: Model<kpiDocument>,
    @InjectModel(cara.name) private caraModel: Model<cara>,
    @InjectModel(organizationGoal.name)
    private orgObjective: Model<organizationGoal>,
    @InjectModel(objectiveMaster.name)
    private objectiveMaster: Model<objectiveMaster>,
    @Inject('Logger') private readonly logger: Logger,
    @InjectModel(cara_settings.name) private carasettings: Model<cara_settings>,
    @InjectModel(KpiOwner.name)
    private kpiOwner: Model<KpiOwner>,
    @InjectModel(ObjOwner.name)
    private objOwner: Model<ObjOwner>,
    private readonly organizationService: OrganizationService,
    private readonly caraService: CaraService,
    private readonly serialNumberService: SerialNumberService,
    private readonly emailService: EmailService,
    private mySQLPrisma: MySQLPrismaService,
    @InjectModel(KpiMonthTarget.name)
    private kpiMonthTarget: Model<KpiMonthTarget>,

    @InjectModel(ArchivedKpi.name)
    private archivedKpi: Model<ArchivedKpi>,

    @InjectModel(FutureKpi.name)
    private futureKpi: Model<FutureKpi>,

    @InjectModel(KpiMonitoring.name)
    private kpiMonitoring: Model<KpiMonitoring>,
  ) {}

  //this api is used to creat a new unitType with corresponding unit of measurements
  async createUom(userid, data, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      this.logger.debug(`create uom service started for the data ${data}`);
      const { unitType, unitOfMeasurement } = data;

      this.logger.debug(`creating uom started for the data ${data}`);
      const result = await this.prisma.unitType.create({
        data: {
          unitType,
          unitOfMeasurement,
          organizationId: activeUser.organizationId,
          locationId: activeUser.locationId,
          createdModifiedBy: activeUser.username,
        },
      });
      this.logger.debug(`uom has been created ${result} by ${activeUser}`);
      this.logger.log(
        `trace id=${randomNumber} Post api/kpi-definition/createUom ${data}service successful for ${activeUser}`,
        '',
      );
      return result.id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Post api/kpi-definition/createUom ${data}service failed ${error} for ${activeUser}`,
        error?.stack,
      );
      throw new NotFoundException(error.message);
    }
  }
  //this api will return all the measurement unit for the organization
  async getAllUom(userid, randomNumber, query) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      this.logger.debug(
        `/api/kpi-defintion/getAllUom started for ${activeUser} with ${query}`,
      );

      // Default behavior: no pagination
      let result;
      let totalCount;

      if (query?.page && query?.limit) {
        // Pagination logic
        this.logger.debug(
          `/api/kpi-defintion/getAllUom started with pagination`,
        );
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;

        result = await this.prisma.unitType.findMany({
          where: { organizationId: activeUser.organizationId, deleted: false },
          select: {
            id: true,
            unitOfMeasurement: true,
            unitType: true,
            locationId: true,
          },
          skip: (page - 1) * limit,
          take: limit,
        });

        totalCount = await this.prisma.unitType.count({
          where: { organizationId: activeUser.organizationId, deleted: false },
        });
        this.logger.debug(
          `GET api/kpi-definition/getAllUom service successful with pagination result ${result} totalCout=${totalCount}`,
        );
        this.logger.log(
          `trace id=${randomNumber} GET api/kpi-definition/getAllUom service successful with pagination for ${activeUser}`,
          '',
        );

        return {
          result: result,
          totalCount: totalCount,
          page: page,
          limit: limit,
          totalPages: Math.ceil(totalCount / limit),
        };
      } else {
        this.logger.debug(
          `/api/kpi-defintion/getAllUom started withput pagination`,
        );
        // No pagination logic
        result = await this.prisma.unitType.findMany({
          where: { organizationId: activeUser.organizationId, deleted: false },
          select: {
            id: true,
            unitOfMeasurement: true,
            unitType: true,
            locationId: true,
          },
        });
        this.logger.debug(
          `GET api/kpi-definition/getAllUom service successful without pagination result ${result} totalCout=${totalCount}`,
        );
        this.logger.log(
          `trace id=${randomNumber} GET api/kpi-definition/getAllUom service successful without pagination`,
          '',
        );

        return { result: result };
      }
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getAllUom service failed ${error} for user ${activeUser}`,
        error?.stack,
      );
      throw new NotFoundException(error.message);
    }
  }

  //this api will return a selected unit type
  async getSelectedUom(id, userid, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      this.logger.debug(
        `api/kpi-defintion/getSelectedUom started for user ${activeUser} for ${id}`,
      );
      const result = await this.prisma.unitType.findUnique({
        where: { id: id },
        select: {
          id: true,
          unitType: true,
          unitOfMeasurement: true,
          locationId: true,
          organizationId: true,
        },
      });
      this.logger.debug(
        `/api/kpi-defintion/getSelectemUom finished for ${id} for user ${activeUser} with result ${result}`,
      );
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getSelectedUom/${id} service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getSelectedUom/${id} service failed for ${activeUser}`,
        error.stack || error?.message,
      );
      throw new NotFoundException(error.message);
    }
  }
  async checkUnitType(userid, dataunit, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      this.logger.debug(
        `trace id=${randomNumber} GET api/kpi-definition/checkUnitType/${dataunit} service called for ${activeUser}`,
        '',
      );
      const existingUnitType = await this.prisma.unitType.findMany({
        where: {
          unitType: { equals: dataunit, mode: 'insensitive' },
          organizationId: { equals: activeUser?.organizationId },
          // deleted: false,
        },
      });
      this.logger.debug(
        `trace id=${randomNumber} found existingUnitType${existingUnitType}`,
      );

      if (existingUnitType.length > 0) {
        this.logger.log(
          `trace id=${randomNumber} GET api/kpi-definition/checkUnitType/${dataunit} service called`,
          '',
        );
        return existingUnitType;
      } else return false;
    } catch (err) {
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/checkUnitType/${dataunit} service failed ${err}`,
        '',
      );
    }
  }
  //this api will update the selected unit type
  async updateUom(userid, data, id, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      const { unitType, unitOfMeasurement } = data;
      this.logger.debug(
        `traceid=${randomNumber}update uom service started for ${id} with payload ${data}`,
      );
      const result = await this.prisma.unitType.update({
        where: { id },
        data: {
          unitType,
          unitOfMeasurement,
          createdModifiedBy: activeUser.username,
        },
      });
      this.logger.debug(
        `update completed for ${id} with data ${data} by user ${activeUser}`,
      );
      this.logger.log(
        `trace id=${randomNumber} PUT api/kpi-definition/updateUOm/${id} for ${data}service successful`,
        '',
      );
      return result.id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} PUT api/kpi-definition/updateUOm/${id} for ${data}service failed ${error} for ${activeUser}`,
        error?.stack || error?.message,
      );
      throw new NotFoundException(error.message);
    }
  }
  async deleteUom(userid, id, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      this.logger.debug(`deleteuom service started by ${activeUser} for ${id}`);
      const result = await this.prisma.unitType.update({
        where: { id },
        data: {
          deleted: true,
        },
      });
      this.logger.log(
        `trace id=${randomNumber} DELETe api/kpi-definition/deleteUOm/${id} service successful`,
        '',
      );
      return result.id;
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} DELETe api/kpi-definition/deleteUOm/${id} service failed ${error} for ${activeUser}`,
        error?.stack || error?.message,
      );
      throw new NotFoundException(error.message);
    }
  }
  //this api is used to create a new kpi definition and also stores the fields in the apiendpoint in the separate column as key fields in the database
  async getAllLocations(userid, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      this.logger.debug(
        `trceid=${randomNumber} getAllLocations started for ${activeuser}`,
      );
      let result;
      if (activeuser?.userType !== 'globalRoles') {
        this.logger.debug(
          `traceid=${randomNumber} user is not of type globalRoles`,
        );
        result = await this.prisma.location.findMany({
          where: {
            organizationId: activeuser.organizationId,
            user: userid.id,
            deleted: false,
          },
          orderBy: {
            locationName: 'asc', // Order by entityName in ascending order
          },
          // select: {
          //   id: true,
          //   locationName: true,
          //   locationType: true,
          // },
        });
        this.logger.debug(
          `traceid=${randomNumber} getAllLcoations result ${result} returned for regular user `,
        );
      } else {
        if (activeuser?.additionalUnits?.includes('All')) {
          this.logger.debug(
            `traceid=${randomNumber} acitvuser additonal units has All so returning all locations`,
          );
          result = await this.prisma.location.findMany({
            where: {
              organizationId: activeuser.organizationId,

              deleted: false,
            },
            orderBy: {
              locationName: 'asc', // Order by entityName in ascending order
            },
          });
        } else {
          this.logger.debug(
            `traceid=${randomNumber} user has specific units so fetching only few locations`,
          );
          result = await this.prisma.location.findMany({
            where: {
              organizationId: activeuser.organizationId,
              // user: userid.id,
              id: { in: activeuser.additionalUnits },
              deleted: false,
            },
            orderBy: {
              locationName: 'asc', // Order by entityName in ascending order
            },
          });
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getAllLocations  service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getAllLocations  service failed ${error} for ${activeuser}`,
        error?.stack || error?.message,
      );
    }
  }
  async getSource(value: string, userid: string, randomNumber) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      this.logger.debug(
        `traceid=${randomNumber} getSource service started for ${activeuser}`,
      );

      let result = [];

      // Construct the query based on the presence of "All" option
      let whereCondition: any = {
        organizationId: activeuser.organizationId,
      };

      // Check if value is 'All' or a specific location
      if (value === 'All') {
        whereCondition.OR = [
          { locationId: { has: 'All' } },
          { locationId: null },
        ];
      } else {
        // If value is a specific location, include that location
        whereCondition.locationId = { has: value };
      }
      this.logger.debug(
        `traceid=${randomNumber} conditon build to fetch ${whereCondition}`,
      );
      const sources = await this.prisma.connectedApps.findMany({
        where: whereCondition,
        select: { id: true, sourceName: true },
      });
      this.logger.debug(`traceid=${randomNumber} fetched sources ${sources}`);
      // Filter out sources where sourceName is "watcher" or "objectstorage"
      const filteredSources = sources.filter(
        (source) =>
          !/watcher|objectstorage|MsCalendar/i.test(source.sourceName),
      );

      // Add the "Manual" option at the beginning
      const manualOption = { id: 'Manual', sourceName: 'Manual' };
      filteredSources.unshift(manualOption);
      this.logger.debug(
        `filtered sources watcher,objectstorage,mscalendat and manual from list ${filteredSources}`,
      );

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getSource  service successful for ${activeuser}`,
        '',
      );

      return filteredSources;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getSource  service failed ${error} for ${activeuser}`,
        error.stack || error.message,
      );
    }
  }

  async createKpi(userid, data, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    try {
      const {
        kpiName,
        kpiType,
        unitTypeId,
        uom,
        kpiTarget,
        kpiMinimumTarget,
        sourceId,
        apiEndPoint,
        kpiDescription,
        kpiTargetType,
        locationId,
        entityId,
        category,
        frequency,
        objectiveId,
        displayType,
        op,
      } = data;
      let info;

      this.logger.debug(
        `createKpi service started with payload ${data} for user ${activeUser} and checking for duplicate in the location`,
      );
      // Check if there is already a KPI with the same name for any of the provided locationIds
      const existingKpi = await this.KpiModel.findOne({
        kpiName: kpiName,
        locationId: locationId,
        deleted: false,
        // kpiStatus:"Active"
        // entityId: entityId,
      });
      // console.log("entityid",entityId)
      if (existingKpi) {
        // If an existing KPI is found, return a conflict exception
        this.logger.debug(
          `traceid=${randomNumber} throwing exception that a kpi already exists with the same name in a entity ${existingKpi}`,
        );
        const entity = await this.prisma.entity.findFirst({
          where: {
            id: existingKpi.entityId.toString(),
          },
        });
        info = {
          _id: existingKpi._id,
          kpiType: existingKpi.kpiType,
          kpiName: existingKpi?.kpiName,
          kpiTargetType: existingKpi?.kpiTargetType,
          categoryId: existingKpi?.categoryId,
          frequency: existingKpi.frequency,
          displayType: existingKpi.displayType,
          kpiTarget: existingKpi.kpiTarget,
          kpiMinimumTarget: existingKpi?.kpiMinimumTarget,
          description: existingKpi.kpiDescription,

          uom: existingKpi.uom,
          owner: existingKpi?.owner,
          entityId: entity,
          locationId: existingKpi.locationId,
          keyFields: existingKpi.keyFields,
          apiEndPoint: existingKpi.apiEndPoint,
          // category:existingKpi.categoryId,

          unitTypeId: existingKpi.unitTypeId,
        };
        // console.log('existingKpi', existingKpi);
        this.logger.error(
          `trace id=${randomNumber} GET api/kpi-definition/createKpi for data ${data} service failed for existing kpi error`,
          '',
        );
        return new ConflictException({ status: 409, data: info });
        // return existingKpi
      } else {
        this.logger.debug(
          `traceid=${randomNumber} creating kpi since no duplicae found`,
        );
        let trimmedString = [];
        if (data?.apiEndPoint) {
          let input = data?.apiEndPoint;
          let reg = /{[a-z&_\.-]+}*/g;
          let matchall = input?.match(reg);

          matchall?.forEach((element) => {
            trimmedString.push(element.replace(/[{}]+/g, ''));
          });
        }

        const result = await this.KpiModel.create({
          kpiName,
          kpiType,
          keyFields: trimmedString ? trimmedString : '',
          unitTypeId,
          uom,
          apiEndPoint,
          kpiDescription,
          kpiTarget,
          kpiTargetType,
          organizationId: activeUser.organizationId,
          locationId,
          displayType,
          entityId: entityId,
          frequency,
          categoryId: category,
          kpiMinimumTarget,
          op: op,
          sourceId: sourceId,
          objectiveId: objectiveId ? objectiveId : [],
          startDate: new Date(),
          kpiStatus: 'Active',
          endDate: null,
        });
        this.logger.debug(`traceid=${randomNumber} created kpi ${result} `);
        this.logger.log(
          `trace id=${randomNumber} POST api/kpi-definition/createKpi for data ${data} service successful for user ${activeUser}`,
          '',
        );
        // Return the ID of the newly created KPI as an indication of success
        return result;
      }
    } catch (error) {
      // If any error occurs, throw a conflict exception
      console.log('err', error);
      this.logger.error(
        `trace id=${randomNumber} POST api/kpi-definition/createKpi for data ${data} service failed for user ${activeUser}`,
        error?.stack || error.message,
      );
      throw new InternalServerErrorException();
    }
  }

  async createDuplicateKpi(userid, data, randomNumber) {
    // try {
    const {
      kpiName,
      kpiType,
      unitTypeId,
      uom,
      kpiTarget,
      kpiMinimumTarget,
      sourceId,
      apiEndPoint,
      kpiDescription,
      kpiTargetType,
      locationId,
      entityId,
      category,
      frequency,
      displayType,
      op,
    } = data;

    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });

    // Check if there is already a KPI with the same name for any of the provided locationIds
    const existingKpi = await this.KpiModel.findOne({
      kpiName: kpiName,
      locationId: locationId,
      entityId: entityId,
    });

    if (existingKpi) {
      // If an existing KPI is found, return a conflict exception
      const entity = await this.prisma.entity.findFirst({
        where: {
          id: existingKpi.entityId.toString(),
        },
      });
      const info = {
        _id: existingKpi._id,
        kpiType: existingKpi.kpiType,
        kpiName: existingKpi?.kpiName,
        kpiTargetType: existingKpi?.kpiTargetType,
        categoryId: existingKpi?.categoryId,
        frequency: existingKpi.frequency,
        displayType: existingKpi.displayType,
        kpiTarget: existingKpi.kpiTarget,
        kpiMinimumTarget: existingKpi?.kpiMinimumTarget,
        description: existingKpi.kpiDescription,

        uom: existingKpi.uom,
        owner: existingKpi?.owner,
        entityId: entity,
        locationId: existingKpi.locationId,
        keyFields: existingKpi.keyFields,
        apiEndPoint: existingKpi.apiEndPoint,
        // category:existingKpi.categoryId,

        unitTypeId: existingKpi.unitTypeId,
        op: existingKpi.op,
      };

      throw new ConflictException({ status: 409, data: info });
      // return existingKpi
    } else {
      let trimmedString = [];
      if (data?.apiEndPoint) {
        let input = data?.apiEndPoint;
        let reg = /{[a-z&_\.-]+}*/g;
        let matchall = input?.match(reg);

        matchall?.forEach((element) => {
          trimmedString.push(element.replace(/[{}]+/g, ''));
        });
      }

      const result = await this.KpiModel.create({
        kpiName,
        kpiType,
        keyFields: trimmedString ? trimmedString : '',
        unitTypeId,
        uom,
        apiEndPoint,
        kpiDescription,
        kpiTarget,
        kpiTargetType,
        organizationId: activeUser.organizationId,
        locationId,
        entityId: entityId,
        frequency,
        categoryId: category,
        kpiMinimumTarget,
        status: true,
        sourceId: sourceId,
        kpiStatus: 'Active',
        displayType,
        op,
      });
      this.logger.log(
        `trace id=${randomNumber} POST api/kpi-definition/createDuplicateKpi for data ${data} service successful`,
        '',
      );
      // Return the ID of the newly created KPI as an indication of success
      return result;
    }
    // } catch (error) {
    //   // If any error occurs, throw a conflict exception
    //   this.logger.error(
    //     `trace id=${randomNumber} POST api/kpi-definition/createDuplicateKpi for data ${data} service failed ${error}`,
    //     '',
    //   );
    //   throw new ConflictException({ status: 409 });
    // }
  }
  //this api will return all the kpi definition
  async getAllKpi(userid, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
    });
    try {
      this.logger.debug(
        `traceid=${randomNumber} getAllkpi started for ${activeUser}`,
      );

      if (userid.kcRoles?.roles?.includes('ORG-ADMIN')) {
        this.logger.debug(
          'activeuser is org admin so returing all kpis of org',
        );
        const result = await this.KpiModel.find({
          where: { organizationId: activeUser.organizationId },
        });
        this.logger.log(
          `trace id=${randomNumber} GET api/kpi-definition/getAllKpi  service called`,
          '',
        );
        return result;
      } else {
        this.logger.debug(
          `traceid=${randomNumber} user doesnt have org admin role so returning ony his location kpis`,
        );
        const result = await this.KpiModel.find({
          where: {
            organizationId: activeUser.organizationId,
            locationId: { has: activeUser?.locationId },
          },
        });

        this.logger.log(
          `trace id=${randomNumber} GET api/kpi-definition/getAllKpi  service successful for ${activeUser} with ${result.length} count`,
          '',
        );
        return result;
      }
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getAllKpi  service failed ${error} for ${activeUser}`,
        error.stack || error?.message,
      );
      throw new NotFoundException(error.message);
    }
  }
  async getAllKpiForLocDept(userid, id, id1, id2) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
      include: {
        organization: true,
      },
    });
    try {
      // console.log('id,id1,id2', id, id1, id2);
      this.logger.debug(
        `getAllKpiForLocDept api called for user ${activeUser}`,
      );

      const monthIndices: Record<string, number> = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
      };
      // console.log('id1', id1);
      let quarterIndices: Record<string, number>;
      if (activeUser.organization.fiscalYearQuarters === 'April - Mar') {
        this.logger.debug(
          `caclulating quarter indices if org has April-Mar settings`,
        );
        quarterIndices = {
          'April - June': 1,
          'July - Sept': 2,
          'Oct - Dec': 3,
          'Jan - Mar': 4,
        };
      } else {
        this.logger.debug(`calculating quarter indices if not April-Mar`);
        quarterIndices = {
          'April - June': 2,
          'July - Sept': 3,
          'Oct - Dec': 4,
          'Jan - Mar': 1,
        };
      }
      let halfYearIndices: Record<string, number>;
      if (activeUser.organization.fiscalYearQuarters === 'April - Mar') {
        this.logger.debug(`calculating half year indices for April-Mar`);
        halfYearIndices = {
          'April - September': 1,
          'October - March': 2,
        };
      } else {
        this.logger.debug(`calculating half year indices for JA-Dec`);
        halfYearIndices = {
          'January - June': 1,
          'July - December': 2,
        };
      }
      const frequency = id.toUpperCase();
      const entityId = id2 || 'All';
      // console.log('id', id);
      this.logger.debug(
        `fetching kpis for user location.,entity and frequency`,
      );
      // Fetch KPI data from KpiModel
      const result = await this.KpiModel.aggregate([
        {
          $match: {
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
            deleted: false,
            $or: [{ entityId: entityId }, { entityId: 'All' }],
            frequency: frequency,
          },
        },
        {
          $group: {
            _id: '$categoryId',
            kpis: {
              $push: {
                _id: '$_id',
                kpiName: '$kpiName',
                kpiType: '$kpiType',
                keyFields: '$keyFields',
                unitTypeId: '$unitTypeId',
                sourceId: '$sourceId',
                uom: '$uom',
                status: '$status',
                apiEndPoint: '$apiEndPoint',
                kpiDescription: '$kpiDescription',
                kpiTarget: '$kpiTarget',
                kpiMinimumTarget: '$kpiMinimumTarget',
                kpiTargetType: '$kpiTargetType',
                organizationId: '$organizationId',
                locationId: '$locationId',
                entityId: '$entityId',
                categoryId: '$categoryId',
                frequency: '$frequency',
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',
                owner: '$owner',
                op: '$op',
              },
            },
          },
        },
        {
          $sort: { 'catInfo.ObjectiveCategory': 1 }, // Sort by ObjectiveCategory in ascending order
        },
      ]);
      this.logger.debug(`kpis fetched ${result.length}`);
      if (id === 'Monthly' || id === 'Quarterly' || id === 'Half-Yearly') {
        this.logger.debug(`getting targets for each kpi`);
        // to get targets
        // console.log('inside if ', id, id1);
        let kpiTargets = [];
        const newid =
          id === 'Monthly'
            ? monthIndices[id1]
            : id === 'Quarterly'
            ? quarterIndices[id1]
            : halfYearIndices[id1];

        // If id1 is provided, fetch KPI targets for the specific time period
        if (id1 && id1.trim() !== '') {
          // console.log('inside if id1');
          kpiTargets = await this.kpiMonthTarget.find({
            where: {
              timePeriod: newid,
            },
          });
          this.logger.debug(`kpi targets ${kpiTargets} for ${newid}`);
          // console.log('kpitargets', kpiTargets);
        }
        // console.log('kpiTargets in kpi defn', kpiTargets);
        // if (!kpiTargets || kpiTargets.length === 0) {
        //   console.log('inside if empty', kpiTargets);

        //   return {
        //     message: `Targets are not set for the ${id1} period.`,
        //     data: [],
        //   };
        // }
        // Process KPI data with asynchronous handling
        const catInfoPromises = result.map(async (cat) => {
          const category = await this.orgObjective
            .findById(cat?._id)
            .select('_id ObjectiveCategory');

          const kpiInfoPromises = cat.kpis.map(async (kpi) => {
            if (id1 && id1.trim() !== '') {
              const target = await this.kpiMonthTarget.findOne({
                kpiId: kpi._id,
                timePeriod: newid,
              });
              this.logger.debug(`kpi target ${target}`);
              // console.log('target', target);
              return {
                ...kpi,
                kpiTarget: target ? target.target : kpi.kpiTarget,
                kpiMinimumTarget: target
                  ? target?.minTarget
                  : kpi.kpiMinimumTarget,
              };
            }
            return kpi;
          });

          const kpiInfo = await Promise.all(kpiInfoPromises);

          return {
            catInfo: category,
            kpiInfo: kpiInfo,
          };
        });

        // Wait for all category info promises to resolve
        const catInfo = await Promise.all(catInfoPromises);
        this.logger.debug(`catInfo after processing ${catInfo}`);
        // console.log('catInfo', catInfo);
        return catInfo;
      } else if (id === 'Daily') {
        this.logger.debug(`processtargets for Daily kpis`);
        let catInfo = [];
        for (let cat of result) {
          const category = await this.orgObjective
            .findById(cat?._id)
            .select('_id ObjectiveCategory');
          const data: any = {
            catInfo: category,
            kpiInfo: cat.kpis,
          };
          catInfo.push(data);
        }

        return catInfo;
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getAllKpiForLocDeptForImport(userid) {
    // try {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
    });

    const entityId = activeUser.entityId;

    const result = await this.KpiModel.aggregate([
      {
        $match: {
          organizationId: activeUser.organizationId,
          locationId: activeUser.locationId,
          deleted: false,
          entityId: entityId,
        },
      },
    ]);
    let kpiInfo = [];
    for (let kpi of result) {
      const category = await this.orgObjective
        .findById(kpi?.categoryId)
        .select('_id ObjectiveCategory');
      const locationName = await this.prisma.location.findFirst({
        where: { id: kpi.locationId },
      });
      const entityName = await this.prisma.entity.findFirst({
        where: {
          id: kpi.entityId,
        },
      });
      const data = {
        kpiName: kpi.kpiName,
        location: locationName.locationName,
        entity: entityName.entityName,
        category: category.ObjectiveCategory,
      };
      kpiInfo.push(data);
    }

    return kpiInfo;
    // } catch (error) {
    //   throw new NotFoundException(error.message);
    // }
  }
  async getAllKpiForAnObjective(userid, query, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
    });
    try {
      this.logger.debug(
        `getAllKpiForAnObjective service started for ${activeUser} for query ${query}`,
      );

      let categoryIds = query.id;
      if (!Array.isArray(categoryIds)) {
        categoryIds = [categoryIds];
      }
      categoryIds = categoryIds.map((id) => String(id));

      const ownerInfo = await this.prisma.user.findFirst({
        where: {
          id: query.owner,
        },
      });

      let condition: any = {
        organizationId: activeUser.organizationId,
        categoryId: { $in: categoryIds },
        locationId: ownerInfo.locationId,
        deleted: false,
      };

      if (query.scopeType === 'Department') {
        condition.entityId = query.scope;
      }

      if (query.searchText && query.searchText.trim() !== '') {
        const regexPattern = new RegExp(query.searchText, 'i');

        condition.kpiName = { $regex: regexPattern };
      }
      this.logger.debug(`getAllKpiForAnObjective condition built ${condition}`);
      let result;
      let count;

      if (query.page && query.limit) {
        this.logger.debug(`getAllKpiForAnObjective inside pagination`);
        const page = parseInt(query.page, 10) || 1; // Default to page 1 if not provided
        const limit = parseInt(query.limit, 10) || 10; // Default to limit 10 if not provided
        const skip = (page - 1) * limit;

        result = await this.KpiModel.find(condition)
          .skip(skip)
          .limit(limit)
          .sort({ kpiName: 1 })
          .lean();

        count = await this.KpiModel.countDocuments(condition);
        this.logger.debug(`fetched kpis ${count}`);
      } else {
        this.logger.debug(`getAllKpiForAnObjective outside pagination`);
        result = await this.KpiModel.find(condition)
          .sort({ kpiName: 1 })
          .lean();

        count = result.length;
        this.logger.debug(`fetched kpis ${count}`);
      }

      let catInfo = [];
      for (let cat of result) {
        this.logger.debug(`processing kpi`, cat);
        const oid = new Object(cat.categoryId);
        this.logger.debug(`fetching category ${oid}`);
        const category = await this.orgObjective
          .findById(oid)
          .select('_id ObjectiveCategory');
        const entity = await this.prisma.entity.findFirst({
          where: {
            id: cat.entityId,
          },
          select: {
            entityId: true,
            entityName: true,
          },
        });
        this.logger.debug(`fetched entity and category ${entity} ${category}`);
        const data = {
          catInfo: category,
          kpiInfo: cat,
          entityName: entity.entityName,
        };
        this.logger.debug(`framed json structure ${data}`);
        catInfo.push(data);
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getAllKpiForObjective  service successful for${query} user ${activeUser}`,
        '',
      );
      return { result: catInfo, count: count };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getAllKpiForObjective  service ailed for${query} ${error}`,
        '',
      );
      throw new NotFoundException(error.message);
    }
  }
  async getParentObjKpi(userid, query, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
    });
    try {
      // console.log('id', query.id);
      this.logger.debug(`fetching parent objective kpis for ${query}`);
      const kpis: any = await this.objectiveMaster
        .findById(query.id)
        .select('associatedKpis');
      this.logger.debug(`fetched kpis ${kpis}`);
      const kpiIds = kpis.associatedKpis.map((kpi) => kpi.kpiId || kpi);
      this.logger.debug(`fetched kpiIds ${kpiIds}`);
      let condition: any = {
        deleted: false,
        _id: { $in: kpiIds },
      };
      if (!!query.scopeType && query.scopeType === 'Department') {
        condition.entityId = query.scope;
      } else if (query.scopeType && query.scopeType === 'Unit') {
        condition.locationId = query.scope;
      }
      // console.log('condition', condition);
      this.logger.debug(`formed condtion ${condition}`);
      const kpi = await this.KpiModel.find(condition);
      // console.log('kpi', kpi);

      let catInfo = [];
      for (let cat of kpi) {
        // console.log('cat', cat.entityId);
        this.logger.debug(`processing kpi ${cat}`);
        const oid = new Object(cat.categoryId);
        const category = await this.orgObjective
          .findById(oid)
          .select('_id ObjectiveCategory');
        const entity = await this.prisma.entity.findFirst({
          where: {
            id: cat.entityId.toString(),
          },
          select: {
            entityId: true,
            entityName: true,
          },
        });
        const data = {
          catInfo: category,
          kpiInfo: cat,
          isFromParent: true,
          key: cat._id,
          entityName: entity.entityName,
        };
        this.logger.debug(`formed json structure for kpi ${cat} is ${data}`);
        catInfo.push(data);
      }
      // console.log('catinfo', catInfo);
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getKpiForParentObj service successful for${query}`,
        '',
      );

      return { result: catInfo, count: kpi.length };
      // console.log('Filtered KPIs:', kpi);
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getKpiForParentObj service failed for${query} requested by ${activeUser}`,
        error?.stack || error.message,
      );
    }
  }

  //this api will return all the kpis with their location names and source names
  async getAllKpis(userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
    });
    try {
      this.logger.debug(`getallKpis service started for ${activeUser}`);

      const result = await this.KpiModel.find({
        where: { organizationId: activeUser.organizationId },
      });
      let finalResult = [],
        locationNames;
      // for (let kpi of result) {
      //   if (!kpi.locationId?.includes('All')) {
      //     locationNames =
      //     await Promise.all(
      //       kpi.locationId.map(async (loc: any) => {
      //         const location: any = await this.prisma.location.findFirst({
      //           where: { id: loc },
      //         });
      //         console.log('location name', location.locationName);
      //         return location.locationName;
      //       }),
      //     );
      //   }
      //   console.log('locationNames', locationNames);

      //   let source: any = kpi.sourceId;
      //   let sourceName;
      //   if (source !== 'Manual') {
      //     sourceName = await this.prisma.connectedApps.findFirst({
      //       where: {
      //         id: source,
      //       },
      //       select: {
      //         sourceName: true,
      //       },
      //     });
      //   } else {
      //     sourceName = 'Manual';
      //   }
      //   console.log('sourceName', sourceName);
      //   finalResult.push({
      //     ...kpi.toObject(),
      //     location: locationNames ? locationNames : kpi.locationId,
      //     source: sourceName?.sourceName ? sourceName.sourceName : sourceName,
      //   });
      // }
      this.logger.log(`api/kpi-definition/export  service called`, '');
      return finalResult;
    } catch (error) {
      this.logger.log(`api/kpi-definition/export  service called`, '');
      throw new NotFoundException(error.message);
    }
  }
  //this api will return the selected kpi
  async getSelectedKpi(id) {
    // const activeUser = await this.prisma.user.findFirst({
    //   where: { kcId: userid },
    // });
    try {
      this.logger.debug(`getSelectedkpi/${id} started `);
      //console.log('id', id);

      const result = await this.KpiModel.findById(id);
      this.logger.debug(`fetched kpi ${result}`);
      this.logger.log(
        ` GET api/kpi-definition/getSelectedKpi/${id}  service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `GET api/kpi-definition/getSelectedKpi  service failed ${error}`,
        error?.stack || error?.message,
      );
      throw new NotFoundException(error.message);
    }
  }
  async getSelectedKpiById(id, randomNumber) {
    //const activeUser = await this.prisma.user.findFirst({ where: { kcId: userid } })
    try {
      //console.log('id', id);

      const pid = new ObjectId(id);
      const result = await this.KpiModel.findById(pid);
      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getSelectedKpiById/${id}  service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getSelectedKpiById/${id}  service failed ${error}`,
        '',
      );
      throw new NotFoundException(error.message);
    }
  }
  //this api will return all the kpis for the selected source
  async getKpiBySource(userid, source, query, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });

    this.logger.debug(
      `trace id=${randomNumber} - Fetching KPIs for userId=${userid}, source=${source}`,
      'getKpiBySource',
    );

    try {
      const apiquery: any = {
        sourceId: source,
        organizationId: activeUser.organizationId,
        deleted: false,
      };

      this.logger.debug(
        `trace id=${randomNumber} - Base query: ${JSON.stringify(apiquery)}`,
        'getKpiBySource',
      );

      if (query.locationId !== 'All') {
        apiquery.locationId = query.locationId;
        this.logger.debug(
          `trace id=${randomNumber} - Added locationId to query: ${query.locationId}`,
          'getKpiBySource',
        );
      }

      if (query.entityId !== 'All') {
        apiquery.entityId = query.entityId;
        this.logger.debug(
          `trace id=${randomNumber} - Added entityId to query: ${query.entityId}`,
          'getKpiBySource',
        );
      }

      if (!!query.searchText && query.searchText !== '') {
        const regexPattern = new RegExp(query.searchText, 'i');
        apiquery.kpiName = { $regex: regexPattern };
        this.logger.debug(
          `trace id=${randomNumber} - Added searchText to query: ${query.searchText}`,
          'getKpiBySource',
        );
      }

      this.logger.debug(
        `trace id=${randomNumber} - Final query to Mongo: ${JSON.stringify(
          apiquery,
        )}`,
        'getKpiBySource',
      );

      let result: any = await this.KpiModel.find(apiquery).sort({
        createdAt: -1,
      });
      let count = await this.KpiModel.countDocuments(apiquery);

      this.logger.debug(
        `trace id=${randomNumber} - Retrieved ${result.length} KPIs from DB`,
        'getKpiBySource',
      );

      const data = [];

      for (let obj of result) {
        const entity = await this.prisma.entity.findFirst({
          where: {
            id: obj.entityId,
          },
        });

        const info = {
          _id: obj._id,
          kpiType: obj.kpiType,
          kpiName: obj.kpiName,
          kpiTargetType: obj.kpiTargetType,
          categoryId: obj.categoryId,
          frequency: obj.frequency,
          kpiTarget: obj.kpiTarget,
          kpiMinimumTarget: obj.kpiMinimumTarget,
          kpiDescription: obj.kpiDescription,
          displayType: obj.displayType,
          uom: obj.uom,
          owner: obj.owner,
          entityId: entity,
          locationId: obj.locationId,
          keyFields: obj.keyFields,
          apiEndPoint: obj.apiEndPoint,
          unitTypeId: obj.unitTypeId,
          objectiveId: obj.objectiveId,
          op: obj.op,
        };

        data.push(info);
      }

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getKpiBySource/${source} service successful`,
        'getKpiBySource',
      );

      return { data, count };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getKpiBySource/${source} service failed: ${error.message}`,
        'getKpiBySource',
      );
      throw new NotFoundException(error.message);
    }
  }

  //this api will update the selected kpi-definition
  async updateKpi(userid, data, id, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} Initiating updateKpi for KPI ID: ${id}, user: ${userid}`,
        'KPIService',
      );

      const {
        kpiName,
        kpiType,
        keyFields,
        apiEndPoint,
        kpiDescription,
        kpiTargetType,
        locationId,
        entityId,
        unitTypeId,
        kpiTarget,
        kpiMinimumTarget,
        uom,
        owner,
        frequency,
        category,
        objectiveId,
        displayType,
        op,
      } = data;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      this.logger.debug(
        `trace id=${randomNumber} Found active user: ${activeUser?.username}, orgId: ${activeUser?.organizationId}`,
        'KPIService',
      );

      let input = data.apiEndPoint;
      let reg = /{[a-z&_\.-]+}*/g;
      let matchall = input?.match(reg);
      let trimmedString = [];

      matchall?.forEach((element) => {
        trimmedString.push(element.replace(/[{}]+/g, ''));
      });

      const previous = await this.KpiModel.findById(id);
      this.logger.debug(
        `trace id=${randomNumber} Retrieved existing KPI: ${previous?.kpiName}`,
        'KPIService',
      );

      let kpinewtarget = await this.sanitizeKpiTarget(kpiTarget);
      this.logger.debug(
        `trace id=${randomNumber} Sanitized KPI target: ${kpinewtarget}`,
        'KPIService',
      );

      if (previous.kpiTarget !== kpiTarget) {
        const dataToArchive = {
          kpiName: previous.kpiName,
          kpiType: previous.kpiType,
          keyFields: previous.keyFields,
          apiEndPoint: previous.apiEndPoint,
          kpiDescription: previous.kpiDescription,
          kpiTargetType: previous.kpiTargetType,
          locationId: previous.locationId,
          entityId: previous.entityId,
          unitTypeId: previous.unitTypeId,
          kpiTarget: previous.kpiTarget,
          kpiMinimumTarget: previous.kpiMinimumTarget,
          uom: previous.uom,
          owner: previous.owner,
          displayType: previous.displayType,
          frequency: previous.frequency,
          category: previous.categoryId,
          objectiveId: previous.objectiveId,
          startDate: previous.startDate,
          endDate: new Date(),
          status: false,
          updatedBy: activeUser.id,
          kpiId: previous._id,
          organizationId: activeUser.organizationId,
        };

        const archived = await this.archivedKpi.create(dataToArchive);
        this.logger.log(
          `trace id=${randomNumber} Archived previous KPI version with id=${archived._id}`,
          'KPIService',
        );
      }

      const result = await this.KpiModel.findByIdAndUpdate(id, {
        kpiName,
        kpiType,
        keyFields,
        apiEndPoint,
        kpiDescription,
        kpiTargetType,
        unitTypeId,
        kpiTarget: kpinewtarget,
        objectiveId,
        displayType,
        locationId,
        entityId,
        uom,
        owner,
        kpiMinimumTarget,
        frequency,
        op,
        categoryId: category,
      });

      this.logger.log(
        `trace id=${randomNumber} PUT api/kpi-definition/updateKpi/${id} successful`,
        'KPIService',
      );
      this.logger.debug(
        `trace id=${randomNumber} Updated KPI data: ${JSON.stringify(data)}`,
        'KPIService',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} PUT api/kpi-definition/updateKpi/${id} failed → ${error.message}`,
        error.stack,
        'KPIService',
      );
      throw new NotFoundException(error.message);
    }
  }

  async deleteKpi(userid, id, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} Initiating deleteKpi for KPI ID: ${id}, user: ${userid}`,
        'KPIService',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      if (!activeUser) {
        this.logger.error(
          `trace id=${randomNumber} DELETE api/kpi-definition/deleteKpi/${id} failed → User not found for kcId: ${userid}`,
          '',
          'KPIService',
        );
        throw new NotFoundException('Active user not found');
      }

      this.logger.debug(
        `trace id=${randomNumber} Active user resolved: ${activeUser.username} (orgId: ${activeUser.organizationId})`,
        'KPIService',
      );

      const result = await this.KpiModel.findByIdAndUpdate(id, {
        $set: { deleted: true },
      });

      if (!result) {
        this.logger.warn(
          `trace id=${randomNumber} DELETE api/kpi-definition/deleteKpi/${id} → No KPI found to delete`,
          'KPIService',
        );
        throw new NotFoundException('KPI not found');
      }

      this.logger.log(
        `trace id=${randomNumber} DELETE api/kpi-definition/deleteKpi/${id} successful (soft delete applied)`,
        'KPIService',
      );

      return result.id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} DELETE api/kpi-definition/deleteKpi/${id} failed → ${error.message}`,
        error.stack,
        'KPIService',
      );
      throw new NotFoundException(error.message);
    }
  }

  async import(user, res, file, randomNumber) {
    try {
      const fs = require('fs');
      const XLSX = require('xlsx');

      const fileContent = fs.readFileSync(file.path);
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let invalidKpis = [
        [
          'kpiName',
          'kpiDescription',
          'kpiTarget',
          'kpiTargetType',
          'locationId',
          'sourceId',
          'uom',
          'kpiType',
          'apiEndPoint',
          'kpiMinimumTarget',
          'entityId',
          'categoryId',
          'frequency',
          'displayType',
        ],
      ];
      const userFormat = [
        'kpiName',
        'kpiDescription',
        'kpiTarget',
        'kpiTargetType',
        'locationId',
        'sourceId',
        'uom',
        'kpiType',
        'apiEndPoint',
        'kpiMinimumTarget',
        'entityId',
        'categoryId',
        'frequency',
        'displayType',
      ];
      let reason = '';

      let firstIteration = true;

      for (const rowData of excelData) {
        if (firstIteration) {
          if (!rowData.every((value, index) => value === userFormat[index])) {
            return res.status(200).json({ wrongFormat: true });
          }
          firstIteration = false;
          continue;
        }

        const kpiName = rowData[0] ? rowData[0].trim() : null;
        const kpiDescription = rowData[1] ? rowData[1].trim() : null;
        const kpiTarget = rowData[2] ? rowData[2] : null;

        const kpiTargetType = rowData[3] ? rowData[3].trim() : null;
        const kpiLocations = rowData[4] ? rowData[4].trim() : null;

        const source = rowData[5] ? rowData[5].trim() : null;
        const uom = rowData[6] ? rowData[6].trim() : null;
        const kpiType = rowData[7] ? rowData[7].trim().toUpperCase() : null;
        const apiEndPoint = rowData[8] ? rowData[8] : null;

        const kpiMinimumTarget = rowData[9] ? rowData[9] : null;
        const entityId = rowData[10] ? rowData[10].trim() : null;
        const categoryId = rowData[11] ? rowData[11].trim() : null;
        const frequency = rowData[12] ? rowData[12].trim() : 'MONTHLY';
        const displayType = rowData[13] ? rowData[13].trim() : 'AVERAGE';
        // console.log(
        //   'kpiname and other detials',
        //   kpiDescription,
        //   kpiLocations,
        //   kpiName,
        //   kpiTarget,
        //   kpiTargetType,
        //   apiEndPoint,
        //   uom,
        //   kpiTargetType,
        //   source,

        //   kpiMinimumTarget,
        //   entityId,
        // );
        if (
          kpiName === null ||
          kpiTarget === null ||
          kpiTargetType === null ||
          uom === null ||
          kpiType === null ||
          categoryId === null
        ) {
          reason = 'Required fields are missing';
          rowData.push(reason);
          invalidKpis.push(rowData);
          continue; // Skip creating record if required fields are missing
        }
        if (kpiTargetType === 'Range' && !kpiMinimumTarget) {
          reason = 'kpi target type is range and minimum target is missing';
          rowData.push(reason);
          invalidKpis.push(rowData);
          continue; // Skip creating record if required fields are missing
        }

        // let locationId = [];
        // for (let loc of kpiLocations) {
        //   const location = await this.getLocationId(loc);
        //   if (location === null || location === undefined) {
        //     reason = 'Location Not Found';
        //     rowData.push(reason);
        //     invalidKpis.push(rowData);
        //   }
        //   locationId.push(location);
        // }
        const location = await this.getLocationId(kpiLocations);
        if (location === null || location === undefined) {
          reason = 'Location Not Found';
          rowData.push(reason);
          invalidKpis.push(rowData);
        }
        const entity = await this.getEntityByName(entityId);
        if (entity === null || entity === undefined) {
          reason = 'Entity Not Found';
          rowData.push(reason);
          invalidKpis.push(rowData);
        }
        const category = await this.getObjectiveCategoryByName(categoryId);
        if (category === null || category === undefined) {
          reason = 'Objective Category Not Found';
          rowData.push(reason);
          invalidKpis.push(rowData);
        }

        const sourceId = await this.getSourceByName(source);

        const unitTypeId = await this.getUnitType(uom);

        let trimmedString = [];
        if (apiEndPoint) {
          let input = apiEndPoint;
          let reg = /{[a-z&_\.-]+}*/g; // extract all the fields within the curly braces of the endpoint
          let matchall = input?.match(reg);

          matchall?.forEach((element) => {
            trimmedString.push(element.replace(/[{}]+/g, '')); // trim the curly braces and push to a new array
          });
        }
        // console.log('trimmedstring', trimmedString);
        if (sourceId === null || sourceId === undefined) {
          reason = 'Source not found';
          rowData.push(reason);
          invalidKpis.push(rowData);
        } else if (unitTypeId === null || unitTypeId === undefined) {
          reason = 'Unit type not found for uom';
          rowData.push(reason);
          invalidKpis.push(rowData);
        } else if (!!sourceId && !!location && !!unitTypeId) {
          let result = await this.KpiModel.create({
            kpiName,
            kpiType,
            keyFields: trimmedString ? trimmedString : '',
            unitTypeId,
            uom,
            apiEndPoint,
            kpiDescription,
            kpiTarget,
            kpiTargetType,
            kpiMinimumTarget,
            // createdModifiedBy: activeUser.username,
            organizationId: activeUser.organizationId,
            locationId: location,
            entityId: entity,
            status: false,
            sourceId: sourceId,
            categoryId: category,
            frequency: frequency,
            displayType: displayType,
          });
        }
      }
      // console.log('invalid kpis', invalidKpis);
      if (invalidKpis?.length > 1) {
        // console.log('inside if invalide kpis', invalidKpis);
        return res.status(200).json({ success: true, invalidKpis });
      }

      this.logger.log(
        `trace id=${randomNumber} DELETE api/kpi-definition/import service successful`,
        '',
      );
      return res.sendStatus(200);
    } catch (err) {
      this.logger.log(
        `trace id=${randomNumber} DELETE api/kpi-definition/import service failed`,
        '',
      );
      return res.status(500);
    }
  }
  async getLocationId(locationName: string) {
    try {
      this.logger.debug(
        `Resolving location ID for: ${locationName}`,
        'LocationService',
      );

      if (locationName !== 'All') {
        const location = await this.prisma.location.findFirst({
          where: {
            locationName: {
              contains: locationName,
              mode: 'insensitive',
            },
          },
        });

        if (location) {
          this.logger.debug(
            `Location found: ${locationName} → ID: ${location.id}`,
            'LocationService',
          );
          return location.id;
        } else {
          this.logger.warn(
            `Location not found for name: ${locationName}`,
            'LocationService',
          );
          return null;
        }
      } else {
        this.logger.debug(
          `Location name is 'All' → returning 'All'`,
          'LocationService',
        );
        return 'All';
      }
    } catch (err) {
      this.logger.error(
        `Failed to resolve location ID for: ${locationName} → ${err.message}`,
        err.stack,
        'LocationService',
      );
      throw new InternalServerErrorException('Failed to fetch location ID');
    }
  }

  async getSourceByName(name: string) {
    try {
      this.logger.debug(
        `Searching for source with name: ${name}`,
        'ConnectedAppsService',
      );

      const source = await this.prisma.connectedApps.findFirst({
        where: {
          sourceName: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });

      if (source) {
        this.logger.debug(
          `Source found: ${name} → ID: ${source.id}`,
          'ConnectedAppsService',
        );
        return source.id;
      } else {
        this.logger.warn(
          `Source not found for name: ${name} → returning 'Manual'`,
          'ConnectedAppsService',
        );
        return 'Manual';
      }
    } catch (err) {
      this.logger.error(
        `Failed to fetch source for name: ${name} → ${err.message}`,
        err.stack,
        'ConnectedAppsService',
      );
      throw new InternalServerErrorException('Failed to fetch source ID');
    }
  }

  async getEntityByName(name) {
    try {
      this.logger.debug(`Searching for entity with name: ${name}`, 'entity');
      const entityId = await this.prisma.entity.findFirst({
        where: {
          entityName: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });
      this.logger.debug(`found entity ${entityId}`);
      if (entityId !== null) return entityId.id;
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
  async getUnitType(name) {
    try {
      const unitType = await this.prisma.unitType.findFirst({
        where: {
          unitOfMeasurement: {
            has: name,
          },
        },
      });
      return unitType.id;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  async findAllUsersByEntiy(userid: string, query: any) {
    try {
      this.logger.debug(
        `findAllUsersByEntiy called with userid=${userid} and query=${JSON.stringify(
          query,
        )}`,
        'KpiDefinitionService',
      );

      let whereCondition: any = { deleted: false };

      if (query?.orgId && query?.deptId) {
        whereCondition.organizationId = query.orgId;
        whereCondition.entityId = query.deptId;
      }

      const users = await this.prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          username: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      });

      this.logger.log(
        `GET api/kpi-definition/users successful → found ${users.length} users`,
        'KpiDefinitionService',
      );

      return users;
    } catch (error) {
      this.logger.error(
        `GET api/kpi-definition/users failed for query=${JSON.stringify(
          query,
        )} → ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async checkuser(userid) {
    try {
      this.logger.debug(
        `checkuser called with userid=${JSON.stringify(userid)}`,
        'KpiDefinitionService',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid.id },
      });

      if (!activeUser) {
        this.logger.warn(
          `No active user found for kcId=${userid.id}`,
          'KpiDefinitionService',
        );
        return { dh: [], uh: [] };
      }

      const user = await this.prisma.location.findMany({
        where: {
          users: {
            has: activeUser.id,
          },
        },
      });

      const entityhead = await this.prisma.entity.findMany({
        where: {
          users: {
            has: activeUser.id,
          },
        },
      });

      this.logger.log(
        `GET api/kpi-definition/users checkuser successful — userId=${activeUser.id}`,
        'KpiDefinitionService',
      );

      return { dh: entityhead, uh: user };
    } catch (error) {
      this.logger.error(
        `GET api/kpi-definition/users checkuser failed for userid=${JSON.stringify(
          userid,
        )} → ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw new InternalServerErrorException('Failed to check user roles');
    }
  }

  // api to query the number of KPIs and objectives for each category
  // async getKpiAndObjectiveCountByCategory(userid, query, randomNumber) {
  //   try {
  //     let pipeline = [];

  //     // Match stages for locationId and entityId
  //     if (query.organizationId) {
  //       pipeline.push({ $match: { organizationId: query.organizationId } });
  //     }
  //     if (query.locationId) {
  //       pipeline.push({ $match: { locationId: query.locationId } });
  //     }
  //     if (query.entityId && query.entityId !== 'All') {
  //       pipeline.push({ $match: { entityId: query.entityId } });
  //     }

  //     // Group by categoryId to get counts and IDs
  //     pipeline.push(
  //       {
  //         $group: {
  //           _id: '$categoryId', // Group by categoryId
  //           countKpis: { $sum: 1 }, // Count KPIs for each category
  //           kpiIds: { $push: '$_id' }, // Collect KPI IDs into an array
  //           objectiveIds: { $addToSet: '$objectiveId' }, // Collect unique Objective IDs
  //         },
  //       },
  //       // {
  //       //   $lookup: {
  //       //     from: 'organizationgoals', // Replace with your organizationgoals collection name
  //       //     localField: '_id', // Field from KpiModel to match
  //       //     foreignField: '_id', // Field in organizationgoals to match
  //       //     as: 'category', // Alias for the joined data
  //       //   },
  //       // },
  //       {
  //         $unwind: {
  //           path: '$category',
  //           preserveNullAndEmptyArrays: true, // Preserve documents without matching category
  //         },
  //       },
  //       {
  //         $project: {
  //           categoryId: '$_id',
  //           categoryName: {
  //             $ifNull: ['$category.ObjectiveCategory', 'Unknown'],
  //           }, // Use a default value if categoryName is not found
  //           countKpis: 1,
  //           kpiIds: 1,
  //           objectiveIds: 1,
  //         },
  //       },
  //     );

  //     const result = await this.KpiModel.aggregate(pipeline);
  //     // console.log('result', result);
  //     // Process the result to include objective counts
  //     let formattedResult = [];
  //     for (let entry of result) {
  //       let orggoal;
  //       try {
  //         orggoal = await this.orgObjective.findById(entry.categoryId).exec(); // Use exec() to handle promise

  //         if (!orggoal) {
  //           orggoal = { ObjectiveCategory: 'Unknown' }; // Default if not found
  //         }
  //       } catch (err) {
  //         this.logger.error(
  //           `Failed to find orgObjective for categoryId ${entry.categoryId}: ${err}`,
  //         );
  //         orggoal = { ObjectiveCategory: 'Unknown' }; // Default if there's an error
  //       }
  //       let uniqueObjectiveIds = [];
  //       let obj = entry.objectiveIds.map((id) => id.toString());
  //       // Clean and split objectiveIds if they contain comma-separated values
  //       obj.forEach((id) => {
  //         if (id) {
  //           uniqueObjectiveIds.push(
  //             ...id
  //               .split(',')
  //               .map((oId) => oId.trim())
  //               .filter((oId) => mongoose.Types.ObjectId.isValid(oId)),
  //           );
  //         }
  //       });

  //       // Remove duplicates
  //       uniqueObjectiveIds = Array.from(new Set(uniqueObjectiveIds));

  //       // Count the number of unique objective IDs
  //       const countObjectives = uniqueObjectiveIds.length;
  //       // const objectiveIds = uniqueObjectiveIds.map((id) => id.toString()); // Convert to string
  //       const data = {
  //         categoryId: entry.categoryId,
  //         categoryName: orggoal.ObjectiveCategory,
  //         countKpis: entry.countKpis,
  //         countObjectives: countObjectives,
  //         kpiIds: entry.kpiIds,
  //         objectiveIds: entry.objectiveIds.map((id) => id.toString()),
  //       };
  //       formattedResult.push(data);
  //     }

  //     this.logger.log(
  //       `GET api/kpi-definition/kpiObjCountForCategory service successful for ${query}`,
  //       '',
  //     );
  //     return formattedResult;
  //   } catch (err) {
  //     this.logger.log(
  //       `GET api/kpi-definition/kpiObjCountForCategory service failed for ${query} ${err}`,
  //       '',
  //     );
  //     throw err;
  //   }
  // }
  // async getKpiAndObjectiveCountByCategory(userid, query, randomNumber) {
  //   try {
  //     let formattedResult = [];

  //     // Construct query for ObjectiveMaster based on entityId and locationId
  //     let objectiveQuery: any = {};

  //     // Check if entityId is 'All' or specific
  //     if (query.entityId === 'All') {
  //       objectiveQuery.ScopeType = 'Unit';
  //       objectiveQuery.locationId = query.locationId; // Ensure locationId is included
  //     } else if (query.entityId) {
  //       objectiveQuery.ScopeType = 'Department';
  //       objectiveQuery.Scope = query.entityId; // Specific entityId for departments
  //     }

  //     // Fetch the objectives based on the constructed query
  //     const objectives = await this.objectiveMaster.find(objectiveQuery).exec();
  //     // console.log('objectives', objectives);

  //     // Create a set to store unique categoryIds
  //     let uniqueCategoryIds = new Set();

  //     // Collect all unique categoryIds from associated KPIs in all objectives
  //     objectives.forEach((obj) => {
  //       const associatedKpis = Array.isArray(obj.associatedKpis)
  //         ? obj.associatedKpis
  //         : [];
  //       associatedKpis.forEach((kpi) => {
  //         const categoryId = kpi.kpiInfo?.categoryId;
  //         if (categoryId) {
  //           uniqueCategoryIds.add(categoryId);
  //         }
  //       });
  //     });

  //     // Fetch all categories in bulk based on the unique categoryIds
  //     let categoryIdMap = new Map();
  //     const categories = await this.orgObjective
  //       .find({
  //         _id: { $in: Array.from(uniqueCategoryIds) },
  //       })
  //       .exec();

  //     // Populate categoryIdMap with category names
  //     categories.forEach((category) => {
  //       categoryIdMap.set(category._id.toString(), category.ObjectiveCategory);
  //     });

  //     // Iterate through the objectives and extract KPI data
  //     for (let obj of objectives) {
  //       const associatedKpis = Array.isArray(obj.associatedKpis)
  //         ? obj.associatedKpis
  //         : [];

  //       // Iterate through the associated KPIs and categorize them based on categoryId
  //       for (let kpi of associatedKpis) {
  //         const categoryId = kpi.kpiInfo?.categoryId;
  //         const categoryName = categoryIdMap.get(categoryId) || 'Unknown';

  //         // Prepare the result data for this KPI, associating it with its category
  //         const data = {
  //           categoryId: categoryId,
  //           categoryName: categoryName, // Category name from the map
  //           countKpis: 1, // Each KPI is counted individually
  //           countObjectives: 1, // Each objective counts as 1
  //           kpiIds: [kpi.kpiInfo?._id.toString()], // The specific KPI ID
  //           objectiveIds: [obj._id.toString()], // The objective ID that this KPI belongs to
  //         };

  //         // Check if this category already exists in the result and update it
  //         const existingCategory = formattedResult.find(
  //           (entry) => entry.categoryId === data.categoryId,
  //         );

  //         if (existingCategory) {
  //           // Merge KPI data and objective data if the category already exists
  //           existingCategory.countObjectives += 1;
  //           existingCategory.countKpis += 1; // Increase KPI count for this category
  //           existingCategory.kpiIds.push(...data.kpiIds); // Add the new KPI IDs
  //           existingCategory.objectiveIds.push(...data.objectiveIds); // Add the objective ID
  //         } else {
  //           // If it's a new category, add it to the result
  //           formattedResult.push(data);
  //         }
  //       }
  //     }

  //     return formattedResult;
  //   } catch (err) {
  //     this.logger.error(
  //       `GET api/kpi-definition/kpiObjCountForCategory service failed for ${JSON.stringify(
  //         query,
  //       )} ${err}`,
  //     );
  //     throw err;
  //   }
  // }
  async getKpiAndObjectiveCountByCategory(userid, query, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} getKpiAndObjectiveCountByCategory called with query=${JSON.stringify(
          query,
        )}`,
        'KpiDefinitionService',
      );

      const isAll = query?.categoryId === 'All';
      const filteredCategoryId = isAll ? null : query.categoryId;

      const objectiveQuery: any = {};

      if (query.entityId === 'All') {
        objectiveQuery.ScopeType = 'Unit';
        objectiveQuery.locationId = query.locationId;
      } else if (query.entityId) {
        objectiveQuery.ScopeType = 'Department';
        objectiveQuery.Scope = query.entityId;
      }

      const objectives = await this.objectiveMaster.find(objectiveQuery).exec();
      this.logger.debug(
        `trace id=${randomNumber} Retrieved ${objectives.length} objectives`,
        'KpiDefinitionService',
      );

      const categoryIdSet = new Set<string>();

      if (isAll) {
        objectives.forEach((obj) => {
          const associatedKpis = Array.isArray(obj.associatedKpis)
            ? obj.associatedKpis
            : [];
          associatedKpis.forEach((kpi) => {
            const categoryId = kpi.kpiInfo?.categoryId;
            if (categoryId) categoryIdSet.add(categoryId.toString());
          });
        });
      } else {
        categoryIdSet.add(filteredCategoryId);
      }

      const categories = await this.orgObjective
        .find({
          _id: { $in: Array.from(categoryIdSet) },
        })
        .exec();

      const categoryIdMap = new Map();
      categories.forEach((category) => {
        categoryIdMap.set(category._id.toString(), category.ObjectiveCategory);
      });

      const categoryDataMap = new Map();

      for (const obj of objectives) {
        const associatedKpis = Array.isArray(obj.associatedKpis)
          ? obj.associatedKpis
          : [];
        const objectiveIdStr = obj._id.toString();

        for (const kpi of associatedKpis) {
          const categoryId = kpi.kpiInfo?.categoryId;
          if (!categoryId) continue;

          const categoryIdStr = categoryId.toString();
          if (!isAll && categoryIdStr !== filteredCategoryId) continue;

          const categoryName = categoryIdMap.get(categoryIdStr) || 'Unknown';
          const kpiIdStr = kpi.kpiInfo?._id?.toString();

          if (!categoryDataMap.has(categoryIdStr)) {
            categoryDataMap.set(categoryIdStr, {
              categoryId: categoryIdStr,
              categoryName,
              kpiIds: new Set(),
              objectiveIds: new Set(),
            });
          }

          const categoryData = categoryDataMap.get(categoryIdStr);
          if (kpiIdStr) categoryData.kpiIds.add(kpiIdStr);
          categoryData.objectiveIds.add(objectiveIdStr);
        }
      }

      const formattedResult = Array.from(categoryDataMap.values()).map(
        (entry) => ({
          categoryId: entry.categoryId,
          categoryName: entry.categoryName,
          countKpis: entry.kpiIds.size,
          countObjectives: entry.objectiveIds.size,
          kpiIds: Array.from(entry.kpiIds),
          objectiveIds: Array.from(entry.objectiveIds),
        }),
      );

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/kpiObjCountForCategory service successful — resultCount=${formattedResult.length}`,
        'KpiDefinitionService',
      );

      return formattedResult;
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/kpiObjCountForCategory service failed for ${JSON.stringify(
          query,
        )} — ${err.message}`,
        err.stack,
        'KpiDefinitionService',
      );
      throw err;
    }
  }

  async getObjectivebyIds(user, query, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} getObjectivebyIds called with query=${JSON.stringify(
          query,
        )}`,
        'KpiDefinitionService',
      );

      const idsArray = Array.isArray(query.ids)
        ? query.ids
        : query.ids.split(',').map((id) => id.trim());

      this.logger.debug(
        `trace id=${randomNumber} Parsed idsArray=${JSON.stringify(idsArray)}`,
        'KpiDefinitionService',
      );

      const isValidObjectId = (id) =>
        mongoose.Types.ObjectId.isValid(id) && id.length === 24;

      const objectIdArray = idsArray
        .filter((id) => isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      this.logger.debug(
        `trace id=${randomNumber} Filtered valid ObjectIds=${JSON.stringify(
          objectIdArray,
        )}`,
        'KpiDefinitionService',
      );

      if (objectIdArray.length === 0) {
        this.logger.warn(
          `trace id=${randomNumber} No valid ObjectIds found in input=${JSON.stringify(
            idsArray,
          )}`,
          'KpiDefinitionService',
        );
        return [];
      }

      const objectives = await this.objectiveMaster
        .find({ _id: { $in: objectIdArray } })
        .select('_id ObjectiveName');

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getObjectivebyIds successful with ${objectives.length} objectives`,
        'KpiDefinitionService',
      );

      return objectives;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getObjectivebyIds failed for query=${JSON.stringify(
          query,
        )} — ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async getKpibyIds(user, query, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} getKpibyIds called with query=${JSON.stringify(
          query,
        )}`,
        'KpiDefinitionService',
      );

      const idsArray = Array.isArray(query.ids)
        ? query.ids
        : query.ids.split(',').map((id) => id.trim());

      this.logger.debug(
        `trace id=${randomNumber} Parsed KPI ids array: ${JSON.stringify(
          idsArray,
        )}`,
        'KpiDefinitionService',
      );

      const kpis = await this.KpiModel.find({ _id: { $in: idsArray } }).select(
        '_id kpiName',
      );

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getKpisByIds service successful, count=${kpis.length}`,
        'KpiDefinitionService',
      );

      return kpis;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getKpisByIds failed for query=${JSON.stringify(
          query,
        )} — ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async createObjCopy(user, query, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} createObjCopy called with query=${JSON.stringify(
          query,
        )}`,
        'KpiDefinitionService',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const idsArray = Array.isArray(query.ids)
        ? query.ids
        : query.ids.split(',').map((id) => id.trim());

      this.logger.debug(
        `trace id=${randomNumber} Objective IDs parsed: ${JSON.stringify(
          idsArray,
        )}`,
        'KpiDefinitionService',
      );

      const objectives = await this.objectiveMaster.find({
        _id: { $in: idsArray },
      });

      const duplicatedObjectives = await Promise.all(
        objectives.map(async (objective) => {
          const { _id, ObjectiveName, ...rest } = objective.toObject();

          const duplicatedObjective = await this.objectiveMaster.create({
            ...rest,
            ObjectiveStatus: 'Save As Draft',
            ObjectiveName: `${ObjectiveName} - ${query.year}`,
            ObjectivePeriod: query.year,
          });

          this.logger.debug(
            `trace id=${randomNumber} Duplicated objective ${_id} → ${duplicatedObjective._id}`,
            'KpiDefinitionService',
          );

          // NOTE: You may want to enable the KPI duplication logic below when needed
          /*
          for (let kpi of duplicatedObjective.associatedKpis || []) {
            await this.futureKpi.create({
              ...kpi.kpiInfo,
              objectiveId: duplicatedObjective._id,
              startDate: new Date(),
              createdBy: activeUser.id,
              kpiId: kpi.kpiInfo._id,
            });
          }
          */

          return duplicatedObjective;
        }),
      );

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/createObjCopy service successful, duplicated=${duplicatedObjectives.length}`,
        'KpiDefinitionService',
      );

      return duplicatedObjectives;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/createObjCopy failed for query=${JSON.stringify(
          query,
        )} — ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async sanitizeKpiTarget(value: string) {
    // Remove non-numeric characters except dots
    return value.replace(/[^\d.]/g, '');
  }
  async importUom(user, res, file, randomNumber) {
    try {
      const fs = require('fs');
      const XLSX = require('xlsx');

      // Read and parse the Excel file
      const fileContent = fs.readFileSync(file.path);
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Fetch active user details
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      if (!activeUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      let invalidUnits = [['unittype', 'uom']];
      const userFormat = ['unittype', 'uom'];
      let reason = '';

      let firstIteration = true;

      // Process each row of the Excel data
      for (const rowData of excelData) {
        if (firstIteration) {
          // Validate header row
          if (!rowData.every((value, index) => value === userFormat[index])) {
            return res.status(200).json({ wrongFormat: true });
          }
          firstIteration = false;
          continue;
        }

        const unitType = rowData[0] ? rowData[0].trim() : null;
        const uoms = rowData[1] ? rowData[1].trim() : null;
        //  reason = 'Required fields are missing';
        // rowData.push(reason);
        // invalidKpis.push(rowData);
        if (!unitType || !uoms) {
          reason = 'unit or uom not found';
          rowData.push(reason);
          invalidUnits.push(rowData);
          continue;
        }
        const existingUnitType = await this.prisma.unitType.findFirst({
          where: {
            AND: [
              { unitType: { equals: unitType, mode: 'insensitive' } },
              { organizationId: activeUser.organizationId },
            ],
          },
        });

        if (existingUnitType) {
          reason = 'Unit type already exists';
          rowData.push(reason);
          invalidUnits.push(rowData);
          continue;
        }
        // Split the comma-separated UOM string into an array
        const uomArray = uoms.split(',').map((uom) => uom.trim());

        // Create entries for each UOM

        try {
          await this.prisma.unitType.create({
            data: {
              unitType,
              unitOfMeasurement: uomArray,
              organizationId: activeUser.organizationId,
              // locationId: activeUser.locationId,
              createdModifiedBy: activeUser.username,
            },
          });
        } catch (error) {
          this.logger.error(
            `trace id=${randomNumber} Error creating unitType entry for unitType=${unitType} and uom=${uomArray}: ${error.message}`,
          );
        }
      }

      // Log success and return response
      if (invalidUnits.length > 1) {
        this.logger.log(
          `trace id=${randomNumber} POST api/kpi-definition/importUom service partially successful`,
          '',
        );
        return res.status(200).json({ invalidUnits });
      }

      this.logger.log(
        `trace id=${randomNumber} POST api/kpi-definition/importUom service successful`,
        '',
      );
      return res.sendStatus(200);
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Post api/kpi-definition/importUom service failed: ${err.message}`,
      );
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async createOwners(userid, data, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      const { locationId, entityId, owner, createdModifiedBy } = data;

      this.logger.debug(
        `trace id=${randomNumber} POST createOwners called by user=${
          activeUser?.username
        } (${activeUser?.id}) with data=${JSON.stringify(data)}`,
        'KpiDefinitionService',
      );

      const result = await this.kpiOwner.create({
        locationId,
        entityId,
        owner,
        createdModifiedBy,
      });

      this.logger.log(
        `trace id=${randomNumber} POST api/kpi-definition/createOwners service successful by ${activeUser?.username}`,
        'KpiDefinitionService',
      );

      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST api/kpi-definition/createOwners service failed by user=${userid}: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async updateOwners(userid, data, randomNumber, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      const { locationId, entityId, owner, createdModifiedBy } = data;

      this.logger.debug(
        `trace id=${randomNumber} PUT updateOwners called by user=${
          activeUser?.username
        } (${activeUser?.id}) with data=${JSON.stringify(data)} and id=${id}`,
        'KpiDefinitionService',
      );

      const result = await this.kpiOwner.findByIdAndUpdate(id, {
        locationId,
        entityId,
        owner,
        createdModifiedBy,
      });

      this.logger.log(
        `trace id=${randomNumber} PUT api/kpi-definition/updateOwners service successful by ${activeUser?.username} (${activeUser?.id})`,
        'KpiDefinitionService',
      );

      return result?._id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} PUT api/kpi-definition/updateOwners service failed by user=${userid}: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async getOwners(userid, query, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      this.logger.debug(
        `trace id=${randomNumber} GET getOwners called by user=${
          activeUser?.username
        } (${activeUser?.id}) with query=${JSON.stringify(query)}`,
        'KpiDefinitionService',
      );

      const result = await this.kpiOwner.find({
        locationId: query.locationId,
        entityId: query.entityId,
      });

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getOwners service successful by user=${activeUser?.username} (${activeUser?.id})`,
        'KpiDefinitionService',
      );

      return result?.[0] || null;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getOwners service failed for query=${JSON.stringify(
          query,
        )} by user=${userid}: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async createObjOwners(userid, data, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      this.logger.debug(
        `trace id=${randomNumber} POST createObjOwners called by ${
          activeUser?.username
        } (${activeUser?.id}) with data=${JSON.stringify(data)}`,
        'KpiDefinitionService',
      );

      const { locationId, entityId, owner, createdModifiedBy } = data;

      const result = await this.objOwner.create({
        locationId,
        entityId,
        owner,
        createdModifiedBy,
      });

      this.logger.log(
        `trace id=${randomNumber} POST api/kpi-definition/createObjOwners successful by ${activeUser?.username} (${activeUser?.id})`,
        'KpiDefinitionService',
      );

      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST api/kpi-definition/createObjOwners failed for user=${userid}: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async updateObjOwners(userid, data, randomNumber, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      this.logger.debug(
        `trace id=${randomNumber} PUT updateObjOwners called by ${
          activeUser?.username
        } (${activeUser?.id}) with id=${id} and data=${JSON.stringify(data)}`,
        'KpiDefinitionService',
      );

      const { locationId, entityId, owner, createdModifiedBy } = data;

      const result = await this.objOwner.findByIdAndUpdate(id, {
        locationId,
        entityId,
        owner,
        createdModifiedBy,
      });

      this.logger.log(
        `trace id=${randomNumber} PUT api/kpi-definition/updateObjOwners successful by ${activeUser?.username} (${activeUser?.id}) for id=${id}`,
        'KpiDefinitionService',
      );

      return result?._id;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} PUT api/kpi-definition/updateObjOwners failed for user=${userid}, id=${id}, error=${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async getObjOwners(userid, query, randomNumber) {
    try {
      this.logger.debug(`getObjOwners servide started for query ${query}`);
      const result = await this.objOwner.find({
        locationId: query.locationId,
        entityId: query.entityId,
      });
      this.logger.debug(`fetched owners ${result}`);
      return result[0];
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getObjOwners/${query} service failed: ${error.message}`,
      );
    }
  }
  async createPeriodWiseRecordForKpi(
    data: Record<string, string>,
    kpi: string,
    userId: string,
    randomNumber: string,
  ) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userId },
      include: { organization: true },
    });

    const targetYear = activeUser.organization.auditYear;
    const createdModifiedBy = activeUser.id;

    this.logger.debug(
      `trace id=${randomNumber} createPeriodWiseRecordForKpi called by ${activeUser?.username} (${activeUser?.id}) for KPI=${kpi}`,
      'KpiDefinitionService',
    );

    const monthIndices = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const quarterIndices = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    const halfYearIndices = { H1: 1, H2: 2 };

    const groupedData: Record<
      string,
      { target: string | null; minTarget: string | null }
    > = {};

    for (const [key, value] of Object.entries(data)) {
      let timePeriod = key.replace(/minTarget$/, '').replace(/target$/, '');
      let isMinTarget = key.includes('minTarget');

      let timePeriodIndex: string | number = timePeriod;
      if (monthIndices[timePeriod] !== undefined) {
        timePeriodIndex = monthIndices[timePeriod];
      } else if (quarterIndices[timePeriod] !== undefined) {
        timePeriodIndex = quarterIndices[timePeriod];
      } else if (halfYearIndices[timePeriod] !== undefined) {
        timePeriodIndex = halfYearIndices[timePeriod];
      } else {
        this.logger.warn(
          `Unrecognized time period key: ${key}`,
          'KpiDefinitionService',
        );
        continue;
      }

      if (!groupedData[timePeriodIndex]) {
        groupedData[timePeriodIndex] = { target: null, minTarget: null };
      }
      if (isMinTarget) {
        groupedData[timePeriodIndex].minTarget = value;
      } else {
        groupedData[timePeriodIndex].target = value;
      }
    }

    this.logger.debug(
      `trace id=${randomNumber} Grouped data prepared: ${JSON.stringify(
        groupedData,
      )}`,
      'KpiDefinitionService',
    );

    const validRecords: Array<KpiMonthTarget> = [];
    const invalidRecords: Array<{
      timePeriod: string;
      target: string;
      minTarget: string;
      errors: string[];
    }> = [];

    for (const [timePeriodIndex, values] of Object.entries(groupedData)) {
      if (values.target || values.minTarget) {
        const kpiTargetInstance = new KpiMonthTarget();
        kpiTargetInstance.kpiId = kpi;
        kpiTargetInstance.timePeriod = timePeriodIndex;
        kpiTargetInstance.target = values.target;
        kpiTargetInstance.minTarget = values.minTarget;
        kpiTargetInstance.targetYear = targetYear;
        kpiTargetInstance.createdModifiedBy = createdModifiedBy;

        const errors = await validate(kpiTargetInstance);
        if (errors.length === 0) {
          validRecords.push(kpiTargetInstance);
        } else {
          const errorMessages = errors.flatMap((error) =>
            Object.values(error.constraints || {}),
          );
          invalidRecords.push({
            timePeriod: timePeriodIndex,
            target: values.target,
            minTarget: values.minTarget,
            errors: errorMessages,
          });
          this.logger.warn(
            `Validation failed for period ${timePeriodIndex}: ${errorMessages.join(
              ', ',
            )}`,
            'KpiDefinitionService',
          );
        }
      }
    }

    try {
      if (validRecords.length > 0) {
        await this.kpiMonthTarget.insertMany(validRecords);
        this.logger.log(
          `trace id=${randomNumber} ${validRecords.length} KPI target records inserted successfully by ${activeUser?.username} (${activeUser?.id})`,
          'KpiDefinitionService',
        );
      }

      if (invalidRecords.length > 0) {
        const invalidMessages = invalidRecords
          .map(
            (record) =>
              `Time period ${record.timePeriod} with target ${
                record.target
              } and minTarget ${
                record.minTarget
              } is invalid: ${record.errors.join(', ')}.`,
          )
          .join(' ');
        this.logger.error(
          `trace id=${randomNumber} Some KPI records were invalid: ${invalidMessages}`,
          'KpiDefinitionService',
        );
        throw new Error(`Some records were invalid: ${invalidMessages}`);
      }

      return { message: 'Records processed successfully' };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Failed to insert KPI records by ${activeUser?.username} (${activeUser?.id}): ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw new Error('Failed to save KPI target records');
    }
  }

  async getPeriodTargetForKpi(id, id1, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} Invoked getPeriodTargetForKpi for KPI=${id} with frequency=${id1}`,
        'KpiDefinitionService',
      );

      const monthNames: Record<number, string> = {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec',
      };

      const quarterNames: Record<number, string> = {
        1: 'Q1',
        2: 'Q2',
        3: 'Q3',
        4: 'Q4',
      };

      const halfYearNames: Record<number, string> = {
        1: 'H1',
        2: 'H2',
      };

      const records = await this.kpiMonthTarget.find({ kpiId: id });

      this.logger.debug(
        `trace id=${randomNumber} Found ${records.length} records for KPI=${id}`,
        'KpiDefinitionService',
      );

      const result: Record<string, string> = {};

      records.forEach((record) => {
        let timePeriodLabel = record.timePeriod;

        const numericPeriod = parseInt(record.timePeriod);

        if (id1 === 'MONTHLY' && monthNames[numericPeriod]) {
          timePeriodLabel = monthNames[numericPeriod];
        } else if (id1 === 'QUARTERLY' && quarterNames[numericPeriod]) {
          timePeriodLabel = quarterNames[numericPeriod];
        } else if (id1 === 'HALF-YEARLY' && halfYearNames[numericPeriod]) {
          timePeriodLabel = halfYearNames[numericPeriod];
        }

        result[timePeriodLabel] = record.target;
        result[`${timePeriodLabel}minTarget`] = record.minTarget;
      });

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getPeriodTargetForKpi/${id}/${id1} service successful`,
        'KpiDefinitionService',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getPeriodTargetForKpi/${id}/${id1} service failed: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async updatePeriodWiseRecordForKpi(
    data: Record<string, string>,
    kpi: string,
    userId: string,
    randomNumber,
  ) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} updatePeriodWiseRecordForKpi initiated for KPI=${kpi}`,
        'KpiDefinitionService',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
        include: { organization: true },
      });

      const targetYear = activeUser.organization.auditYear;
      const createdModifiedBy = activeUser.id;

      this.logger.debug(
        `trace id=${randomNumber} Found activeUser=${activeUser.id} with auditYear=${targetYear}`,
        'KpiDefinitionService',
      );

      const monthIndices: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const quarterIndices: Record<string, number> = {
        Q1: 1,
        Q2: 2,
        Q3: 3,
        Q4: 4,
      };

      const halfYearIndices: Record<string, number> = {
        H1: 1,
        H2: 2,
      };

      this.logger.debug(
        `trace id=${randomNumber} Deleting existing records for KPI=${kpi}`,
        'KpiDefinitionService',
      );
      await this.kpiMonthTarget.deleteMany({ kpiId: kpi });

      const groupedData: Record<
        string,
        { target: string | null; minTarget: string | null }
      > = {};

      for (const [key, value] of Object.entries(data)) {
        let timePeriod = key.replace(/minTarget$/, '').replace(/target$/, '');
        let isMinTarget = key.includes('minTarget');

        let timePeriodIndex: number | string = timePeriod;
        if (monthIndices[timePeriod] !== undefined) {
          timePeriodIndex = monthIndices[timePeriod];
        } else if (quarterIndices[timePeriod] !== undefined) {
          timePeriodIndex = quarterIndices[timePeriod];
        } else if (halfYearIndices[timePeriod] !== undefined) {
          timePeriodIndex = halfYearIndices[timePeriod];
        } else {
          this.logger.debug(
            `trace id=${randomNumber} Skipped unrecognized timePeriod=${timePeriod}`,
            'KpiDefinitionService',
          );
          continue;
        }

        if (!groupedData[timePeriodIndex]) {
          groupedData[timePeriodIndex] = { target: null, minTarget: null };
        }

        if (isMinTarget) {
          groupedData[timePeriodIndex].minTarget = value;
        } else {
          groupedData[timePeriodIndex].target = value;
        }
      }

      this.logger.debug(
        `trace id=${randomNumber} Grouped data ready with ${
          Object.keys(groupedData).length
        } time periods`,
        'KpiDefinitionService',
      );

      const records = Object.entries(groupedData)
        .filter(
          ([_, values]) => values.target !== null || values.minTarget !== null,
        )
        .map(([timePeriodIndex, values]) => ({
          kpiId: kpi,
          timePeriod: timePeriodIndex.toString(),
          target: values.target,
          minTarget: values.minTarget,
          targetYear,
          createdModifiedBy,
        }));

      if (records.length > 0) {
        this.logger.debug(
          `trace id=${randomNumber} Inserting ${records.length} records for KPI=${kpi}`,
          'KpiDefinitionService',
        );
        await this.kpiMonthTarget.insertMany(records);
      } else {
        this.logger.debug(
          `trace id=${randomNumber} No valid records to insert for KPI=${kpi}`,
          'KpiDefinitionService',
        );
      }

      this.logger.log(
        `trace id=${randomNumber} POST api/kpi-definition/updatePeriodWiseRecord/${kpi} service successful`,
        'KpiDefinitionService',
      );
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST api/kpi-definition/updatePeriodWiseRecord/${kpi} service failed: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw new Error('Failed to update KPI target records');
    }
  }

  async createMonitoringRulesForKpi(query, data, userid, randomNumber) {
    try {
      const { kpiIds } = query;
      const kpiIdArray = kpiIds ? kpiIds.split(',') : [];

      const {
        deviationType,
        deviationOccurencesToAllow,
        valueToMonitor,
        valueFrom,
        uom,
        createdBy,
        organizationId,
      } = data;

      this.logger.debug(
        `trace id=${randomNumber} Initiating createMonitoringRulesForKpi by user=${userid} for KPI IDs: ${kpiIdArray.join(
          ', ',
        )}`,
        'KpiDefinitionService',
      );

      const operations = kpiIdArray.map(async (kpiId) => {
        this.logger.debug(
          `trace id=${randomNumber} Processing KPI ID: ${kpiId}`,
          'KpiDefinitionService',
        );

        const existingEntry = await this.kpiMonitoring.findOne({ kpiId });

        if (existingEntry) {
          this.logger.debug(
            `trace id=${randomNumber} Existing monitoring rule found for KPI ID: ${kpiId}, updating...`,
            'KpiDefinitionService',
          );
          return this.kpiMonitoring.updateOne(
            { kpiId },
            {
              $set: {
                deviationType,
                deviationOccurencesToAllow,
                valueToMonitor,
                valueFrom,
                uom,
                createdBy,
                organizationId,
              },
            },
          );
        } else {
          this.logger.debug(
            `trace id=${randomNumber} No monitoring rule found for KPI ID: ${kpiId}, creating new...`,
            'KpiDefinitionService',
          );
          return this.kpiMonitoring.create({
            kpiId,
            deviationType,
            deviationOccurencesToAllow,
            valueToMonitor,
            valueFrom,
            uom,
            createdBy,
            organizationId,
          });
        }
      });

      const results = await Promise.all(operations);

      this.logger.log(
        `trace id=${randomNumber} POST api/kpi-definition/createMonitoringRulesForKpi service successful for user=${userid}`,
        'KpiDefinitionService',
      );

      return results;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST api/kpi-definition/createMonitoringRulesForKpi service failed for user=${userid} with data=${JSON.stringify(
          data,
        )}. Error: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async updateMonitoringRulesForKpis(query, data, userid, randomNumber) {
    try {
      const {
        deviationType,
        deviationOccurencesToAllow,
        valueToMonitor,
        valueFrom,
        uom,
        createdBy,
        organizationId,
      } = data;

      const { kpiIds } = query;
      const kpiIdArray = kpiIds ? kpiIds.split(',') : [];

      this.logger.debug(
        `trace id=${randomNumber} PUT api/kpi-definition/updateMonitoringRulesForKpis initiated by user=${userid} for KPI IDs: ${kpiIdArray.join(
          ', ',
        )}`,
        'KpiDefinitionService',
      );

      const updateResult: any = await this.kpiMonitoring.updateMany(
        {
          kpiId: { $in: kpiIdArray },
        },
        {
          $set: {
            deviationType,
            deviationOccurencesToAllow,
            valueToMonitor,
            valueFrom,
            uom,
            createdBy,
            organizationId,
          },
        },
      );

      this.logger.log(
        `trace id=${randomNumber} PUT api/kpi-definition/updateMonitoringRulesForKpis service successful by user=${userid} for ${kpiIdArray.length} KPIs`,
        'KpiDefinitionService',
      );

      return updateResult;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} PUT api/kpi-definition/updateMonitoringRulesForKpis service failed for user=${userid}, kpiIds=${
          query.kpiIds
        }, payload=${JSON.stringify(data)}, error=${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  async getMonitoringRulesForKpi(id, userid, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} GET api/kpi-definition/getMonitoringRulesForKpi/${id} called by user=${userid}`,
        'KpiDefinitionService',
      );

      const result = await this.kpiMonitoring.findOne({
        kpiId: id,
      });

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getMonitoringRulesForKpi/${id} service successful for user=${userid}`,
        'KpiDefinitionService',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getMonitoringRulesForKpi/${id} failed for user=${userid}, error=${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw error;
    }
  }

  //this api will return all the kpis for the selected location and department with search text
  async getKpiByLocDept(userid, query, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} GET api/kpi-definition/getKpiByLocDept called by user=${userid} with query=${JSON.stringify(
          query,
        )}`,
        'KpiDefinitionService',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });

      const baseQuery: any = {
        organizationId: activeUser.organizationId,
        deleted: false,
      };

      if (query.locationId !== 'All') baseQuery.locationId = query.locationId;
      if (query.entityId !== 'All') baseQuery.entityId = query.entityId;
      if (query.searchText && query.searchText !== '') {
        const regexPattern = new RegExp(query.searchText, 'i');
        baseQuery.kpiName = { $regex: regexPattern };
      }

      let kpiIdsWithRules = [];
      if (query.filter !== undefined) {
        kpiIdsWithRules = await this.kpiMonitoring.find({}).distinct('kpiId');
      }

      let countQuery = { ...baseQuery };
      if (query.filter === 'false') {
        countQuery._id = { $in: kpiIdsWithRules };
      } else if (query.filter === 'true') {
        countQuery._id = { $nin: kpiIdsWithRules };
      }

      const count = await this.KpiModel.countDocuments(countQuery);

      this.logger.debug(
        `trace id=${randomNumber} Filtered KPI count: ${count}`,
        'KpiDefinitionService',
      );

      let result;
      if (query.page && query.pageSize) {
        result = await this.KpiModel.find(baseQuery)
          .skip((query.page - 1) * query.pageSize)
          .limit(query.pageSize)
          .sort({ createdAt: -1 });
      } else {
        result = await this.KpiModel.find(baseQuery).sort({ createdAt: -1 });
      }

      const data = [];

      for (let obj of result) {
        const entity = await this.prisma.entity.findFirst({
          where: { id: obj.entityId },
        });

        let orggoal;
        try {
          orggoal = await this.orgObjective.findById(obj.categoryId).exec();
          if (!orggoal) orggoal = { ObjectiveCategory: 'Unknown' };
        } catch (err) {
          this.logger.error(
            `trace id=${randomNumber} Failed to find orgObjective for categoryId=${obj.categoryId}: ${err}`,
            '',
          );
          orggoal = { ObjectiveCategory: 'Unknown' };
        }

        const objectivesData = await this.objectiveMaster
          .find({ _id: { $in: obj.objectiveId } })
          .select('ObjectiveName');

        const objectiveNames = objectivesData
          .map((doc) => doc.ObjectiveName)
          .filter((name) => name)
          .join(', ');

        let kpiRules = [];
        try {
          kpiRules = await this.kpiMonitoring.find({ kpiId: obj._id });
        } catch (error) {
          this.logger.debug(
            `trace id=${randomNumber} No monitoring rule found for KPI ${obj._id}`,
            '',
          );
        }

        if (query.filter === 'false' && kpiRules.length === 0) continue;
        if (query.filter === 'true' && kpiRules.length > 0) continue;

        const info = {
          _id: obj._id,
          kpiType: obj.kpiType,
          kpiName: obj?.kpiName,
          kpiTargetType: obj?.kpiTargetType,
          categoryId: orggoal,
          frequency: obj.frequency,
          kpiTarget: obj.kpiTarget,
          kpiMinimumTarget: obj?.kpiMinimumTarget,
          kpiDescription: obj.kpiDescription,
          displayType: obj.displayType,
          uom: obj.uom,
          owner: obj?.owner,
          entityId: entity,
          locationId: obj.locationId,
          keyFields: obj.keyFields,
          apiEndPoint: obj.apiEndPoint,
          unitTypeId: obj.unitTypeId,
          objectiveId: objectiveNames,
          op: obj.op,
          kpiRules: query.filter ? kpiRules[0] : undefined,
        };

        data.push(info);
      }

      this.logger.log(
        `trace id=${randomNumber} GET api/kpi-definition/getKpiByLocDept successful for user=${userid}, returned ${data.length} records`,
        'KpiDefinitionService',
      );

      return { data, count };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/kpi-definition/getKpiByLocDept failed for user=${userid}, error=${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw new NotFoundException(error.message);
    }
  }

  async deleteKpiFromMonitoringRules(id: string) {
    try {
      const result = await this.kpiMonitoring.deleteOne({ kpiId: id });

      if (result.deletedCount === 1) {
        this.logger.log(
          `DELETE api/kpi-definition/deleteKpiFromMonitoringRules/${id} → KPI monitoring rule deleted successfully.`,
          'KpiDefinitionService',
        );
      } else {
        this.logger.warn(
          `DELETE api/kpi-definition/deleteKpiFromMonitoringRules/${id} → No monitoring rule found for the provided KPI ID.`,
          'KpiDefinitionService',
        );
      }
    } catch (error) {
      this.logger.error(
        `DELETE api/kpi-definition/deleteKpiFromMonitoringRules/${id} → Failed to delete KPI monitoring rule: ${error.message}`,
        error.stack,
        'KpiDefinitionService',
      );
      throw new Error('Failed to delete KPI monitoring rule');
    }
  }

  async monitorKPI() {
    const traceId = `trace=${Date.now()}`; // Optional: or pass `randomNumber`
    const client = new MongoClient(process.env.MONGO_DB_URI1);

    try {
      this.logger.debug(`${traceId} → Connecting to MongoDB`);
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      const rulesCollection = db.collection('kpimonitorings');
      const processedCollection = db.collection('kpiProcessedForMonitorings');

      const rules = await rulesCollection.find().toArray();
      const kpiIds = rules.map((rule) => rule.kpiId);

      if (kpiIds.length === 0) {
        this.logger.log(`${traceId} → No KPI monitoring rules found`, '');
        return;
      }

      this.logger.debug(
        `${traceId} → Fetched ${rules.length} KPI monitoring rules`,
      );

      const capaMap = {};

      for (const rule of rules) {
        const {
          kpiId,
          deviationType,
          valueFrom,
          deviationOccurencesToAllow,
          uom,
          valueToMonitor,
        } = rule;

        try {
          const rows: any = await this.mySQLPrisma.$queryRaw`
            SELECT * FROM reportKpiDataNewData
            WHERE kpiId = ${kpiId}
            ORDER BY reportFor ASC
          `;

          if (!rows.length) {
            this.logger.debug(
              `${traceId} → No MySQL data found for KPI ID ${kpiId}`,
            );
            continue;
          }

          let consecutiveMisses = 0;
          let ruleViolated = false;
          let startDate, endDate, year, organizationId, locationId, entityId;

          for (const row of rows) {
            const reportDate = row.reportFor.toISOString().split('T')[0];
            const existingRecord = await processedCollection.findOne({
              kpiId,
              $or: [{ startDate: reportDate }, { endDate: reportDate }],
            });

            if (existingRecord) {
              continue;
            }

            const isDeviationMet = await this.evaluateCondition(row, rule);

            if (isDeviationMet) {
              if (consecutiveMisses === 0) startDate = reportDate;
              endDate = reportDate;
              consecutiveMisses++;

              if (consecutiveMisses >= deviationOccurencesToAllow) {
                ruleViolated = true;
                locationId = row.kpiLocation;
                entityId = row.kpiEntity;
                organizationId = row.kpiOrganization;
                year = row.reportYear;
                break;
              }
            } else {
              consecutiveMisses = 0;
            }
          }

          if (ruleViolated) {
            try {
              const origin: any = await this.carasettings.find({
                deviationType: { $regex: /kpi/i },
              });

              const kpiInfo = await this.KpiModel.findById(kpiId);

              const serialNumber =
                await this.serialNumberService.generateSerialNumber({
                  moduleType: 'CAPA',
                  location: locationId,
                  entity: entityId,
                  year: year.toString(),
                  createdBy: 'system',
                  organizationId,
                });

              const mappedSerialNumber = await this.mapserialnumber(
                serialNumber,
                locationId,
                entityId,
                organizationId,
              );

              const capa = await this.caraModel.create({
                origin: origin[0]?._id,
                kpiId,
                startDate,
                endDate,
                description: `system capa for ${kpiInfo?.kpiName} from ${startDate} to ${endDate}`,
                date: { startDate, endDate },
                year,
                organizationId,
                registeredBy: 'System',
                locationId,
                entityId,
                entity: entityId,
                systemId: [],
                title: `system capa for ${kpiInfo?.kpiName}`,
                status: 'Open',
                serialNumber: mappedSerialNumber,
              });

              await processedCollection.insertOne({
                kpiId,
                reportFor: endDate,
                capaId: capa._id.toString(),
                organizationId,
                startDate,
                endDate,
                entityId,
                createdAt: new Date(),
              });

              if (!capaMap[entityId]) capaMap[entityId] = [];
              capaMap[entityId].push(capa);
              this.logger.debug(
                `${traceId} → CAPA created for KPI ID ${kpiId}`,
              );
            } catch (innerError) {
              this.logger.error(
                `${traceId} → Error while creating CAPA for KPI ID ${kpiId}: ${innerError.message}`,
              );
            }
          } else {
            this.logger.debug(`${traceId} → KPI ID ${kpiId} is within limits`);
          }
        } catch (kpiError) {
          this.logger.error(
            `${traceId} → Error processing KPI ID ${rule.kpiId}: ${kpiError.message}`,
          );
        }
      }

      for (const [entityId, capas] of Object.entries(capaMap)) {
        try {
          const users = await this.caraService.getDeptHeadForEntity(entityId);
          for (const user of users) {
            sendMailToDeptHead(user, capas, this.emailService.sendEmail);
          }
        } catch (mailErr) {
          this.logger.error(
            `${traceId} → Email sending failed for entity ${entityId}: ${mailErr.message}`,
          );
        }
      }

      this.logger.log(`${traceId} → KPI monitoring completed successfully`, '');
    } catch (error) {
      this.logger.error(
        `${traceId} → monitorKPI service failed: ${error.message}`,
        error.stack,
      );
    } finally {
      await client.close();
      this.logger.debug(`${traceId} → MongoDB client closed`);
    }
  }

  async evaluateCondition(kpiRow, rule) {
    const { deviationType, valueFrom, valueToMonitor, uom } = rule;

    // Convert valueToMonitor and kpiRow values to floating-point numbers
    const valueToMonitorFloat = parseFloat(valueToMonitor);
    const valueFromFloat = parseFloat(valueFrom);
    const kpiValuePercentage = parseFloat(kpiRow.percentage);
    const kpiValue = parseFloat(kpiRow.kpiValue);

    // console.log('kpiRow', kpiRow);
    // console.log('valueToMonitorFloat', valueToMonitorFloat);
    // console.log('kpiValuePercentage', kpiValuePercentage);
    // console.log('kpiValue', kpiValue);
    if (rule.deviationType === 'Fixed' || rule.deviationType === 'Target') {
      if (uom === 'percentage') {
        // Check if the percentage value from kpiRow is less than the valueToMonitor
        if (kpiValuePercentage < valueToMonitorFloat) {
          return true;
        } else {
          return false;
        }
      } else {
        // For other units of measurement, compare the actual kpiValue
        if (kpiValue < valueToMonitorFloat) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      if (uom === 'percentage') {
        // Check if the percentage value from kpiRow is less than the valueToMonitor and greater than valueFrom
        if (
          kpiValuePercentage > valueToMonitorFloat ||
          kpiValuePercentage < valueFromFloat
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        // For other units of measurement, compare the actual kpiValue
        if (kpiValue > valueToMonitorFloat || kpiValue > valueFromFloat) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
  async mapserialnumber(serialnumber, locationId, entityId, organizationId) {
    //console.log('va;ues', entityId);

    const currentTime = new Date();
    const year = currentTime.getFullYear();
    const currentYear: any = await this.organizationService.getFiscalYear(
      organizationId,
      year,
    );
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
      select: {
        fiscalYearFormat: true,
      },
    });
    let showyear;
    if (organization.fiscalYearFormat === 'YY-YY+1') {
      showyear = currentYear;
    } else {
      showyear = currentYear.toString().slice(-2);
    }
    const location = await this.prisma.location.findFirst({
      where: {
        id: locationId,
      },
      select: {
        locationId: true,
      },
    });
    const entity = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
      },
      select: {
        entityId: true,
      },
    });
    const month = (currentTime.getMonth() + 1).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    }); //get current month
    const serialNumber1 = serialnumber
      .replace(/LocationId/g, locationId ? location.locationId : '') // replace all occurrences of 'LocationId'
      .replace(/DepartmentId/g, entityId ? entity.entityId : '') // replace all occurrences of 'DepartmentId'
      .replace(/YY/g, showyear) // replace all occurrences of 'YY' with last two digits of currentyear fron std api
      .replace(/MM/g, month); // replace all occurrences of 'MM'

    return serialNumber1;
  }
  async findAndUpdateKpiForObjectiveId(id, objId) {
    try {
      const kpiData = await this.KpiModel.findById(id);
      if (!kpiData) {
        throw new Error(`KPI with ID ${id} not found`);
      }

      let updatedObjectiveIds: any = kpiData.objectiveId || [];

      // Remove the objectiveId
      updatedObjectiveIds = updatedObjectiveIds.filter(
        (objectiveId) => objectiveId !== objId,
      );

      // Update the KPI document and save
      kpiData.objectiveId = updatedObjectiveIds;
      await kpiData.save();
      this.logger.log(
        `PATCH findKpiAndUpdateForObjectiveId/:id/:id1 service successful`,
        '',
      );
      return kpiData; // Optionally return updated KPI
    } catch (error) {
      // console.error(`Failed to update KPI ${id}:`, error);
      this.logger.log(
        `PATCH findKpiAndUpdateForObjectiveId/:id/:id1 service failed ${error}`,
        '',
      );
      throw error;
    }
  }
}
