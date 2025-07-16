import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  OrganizationGoalSchema,
  organizationGoal,
} from './schema/organizationGoal.schema';
import { ObjectId } from 'bson';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { objectiveMaster } from './schema/objectiveMaster.schema';
import { Audit } from 'src/audit/schema/audit.schema';
import { Nonconformance } from 'src/audit/schema/nonconformance.schema';
import { text } from 'stream/consumers';
import { CreateObjectMaster } from './dto/createObjectiveMaster';
import { ReviewComments } from './schema/reviewComments.schema';
import { createReviewComments } from './dto/reviewComments.dto';
import { OwnerComments } from './schema/ownerComments.schema';
import { createOwnerComments } from './dto/createOwnerComments.dto';
import * as sgMail from '@sendgrid/mail';
import { async, lastValueFrom } from 'rxjs';
import { KRA } from 'src/kra/schema/kra.schema';
import { Logger } from 'winston';
import { Kpi, kpiDocument } from 'src/kpi-definition/schema/kpi.schema';

sgMail.setApiKey(process.env.SMTP_PASSWORD);

@Injectable()
export class ObjectiveService {
  constructor(
    @InjectModel(organizationGoal.name)
    private orgObjective: Model<organizationGoal>,
    @InjectModel(Audit.name)
    private audit: Model<Audit>,
    @InjectModel(Nonconformance.name)
    private nonConformance: Model<Nonconformance>,
    @InjectModel(objectiveMaster.name)
    private objectiveMaster: Model<objectiveMaster>,
    @InjectModel(ReviewComments.name)
    private reviewComments: Model<ReviewComments>,
    @InjectModel(OwnerComments.name)
    private ownerComments: Model<OwnerComments>,
    // private readonly prisma: PrismaService,
    @InjectModel(KRA.name)
    private kra: Model<KRA>,
    @InjectModel(Kpi.name) private KpiModel: Model<kpiDocument>,
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  async createOrganizationObjective(data, user, randomNumber) {
    const { Year, ObjectiveCategory, Description } = data;
    // console.log('data', data);
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    this.logger.debug(
      `createOrganizationObjective stated for user ${activeUser} with data ${data}`,
    );
    try {
      await this.orgObjective.create({
        Year,
        ObjectiveCategory,
        Description,
        organizationId: activeUser.organizationId,
        ModifiedBy: activeUser.username,
        updatedBy: activeUser.username,
      });
      this.logger.log(
        `POST api/objective/createOrgObjective service successfull`,
        '',
      );
    } catch (error) {
      console.log('error', error);
      this.logger.error(
        `POST api/objective/createOrgObjective service failed ${error} for user ${activeUser} with data ${data}`,
        error?.stack || error?.message,
      );
      throw new ConflictException(error);
    }
  }

  async allObjectives(userId, query, randomNumber) {
    try {
      this.logger.debug(
        `GET allObjectives service started with query ${query}`,
      );
      const orgId = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      this.logger.debug(`fetched activeuser ${orgId}`);

      let findQuery = {
        organizationId: orgId.organizationId,
      };

      // Check if page and limit are provided
      if (query.page && query.limit) {
        const page = query.page || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        this.logger.debug(`inside pagination condition ${findQuery}`);
        const finalResult = await this.orgObjective
          .find(findQuery)
          .skip(skip)
          .limit(limit)

          .lean();
        const sortedResult = finalResult.sort((a, b) =>
          a.ObjectiveCategory.toLowerCase().localeCompare(
            b.ObjectiveCategory.toLowerCase(),
          ),
        );
        const count = await this.orgObjective.countDocuments(findQuery);
        this.logger.debug(`fetched org objs with count ${count}`);
        return { result: sortedResult, count: count };
      } else {
        // Fetch all data without pagination
        this.logger.debug(`allObjectives without pagination`);
        const finalResult = await this.orgObjective.find(findQuery).lean();
        const count = finalResult.length;
        this.logger.log(
          `trace id=${randomNumber} GET api/objective/AllObjectives for ${query} service successful`,
          '',
        );
        return { result: finalResult, count: count };
      }
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/objective/AllObjectives for ${query} service failed ${error} `,
        '',
      );
      throw new ConflictException(error);
    }
  }

  async updateObject(id, userId, data, randomNumber) {
    this.logger.debug(
      `updateobjective category started with ${data?.finalData}`,
    );
    const { Year, ObjectiveCategory, Description } = data.finalData;
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      this.logger.debug(`fetched activeuser ${activeUser}`);

      // console.log('activeuser', ObjectiveCategory);
      if (ObjectiveCategory !== '' && ObjectiveCategory !== undefined) {
        this.logger.debug(
          `inside condition when obj category not equal to empty or undefined update org objective`,
        );
        const update = await this.orgObjective.findByIdAndUpdate(id, {
          Year,
          ObjectiveCategory,
          Description,
          ModifiedDate: new Date().toISOString(),
          ModifiedBy: {
            id: activeUser.id,
            username: activeUser.username,
            email: activeUser.email,
            avatar: activeUser.avatar,
          },
        });
        this.logger.log(
          `trace id=${randomNumber} PUT api/objective/updateObjective service successful`,
          '',
        );
        // console.log('update', update);
        return 'successfull updated';
      } else {
        throw new InternalServerErrorException({ status: 500 });
      }
    } catch (err) {
      this.logger.log(
        `trace id=${randomNumber} PUT api/objective/updateObjective service failed ${err}`,
        '',
      );
      throw new ConflictException(err);
    }
  }

  async deleteObject(id, userId, randomNumber): Promise<any> {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      this.logger.debug(
        `delete or objective servoce started for ${activeUser}`,
      );
      const delObject = await this.orgObjective.findByIdAndDelete({
        _id: id,
      });

      this.logger.log(
        `trace id=${randomNumber} DELETE api/objective/deleteObjective/${id} service called`,
        '',
      );
      return {
        result: delObject,
        status: 'successful',
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} DELETE api/objective/deleteObjective/${id} service failed ${err}`,
        '',
      );
      throw new NotFoundException(err);
    }
  }

  async getYearFromOrganization(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const finalResult = [];
      const result = await this.orgObjective
        .find({
          organizationId: activeUser.organizationId,
        })
        .distinct('Year');
      await result.map((value) => {
        const data = { Year: value };
        finalResult.push(data);
      });
      return finalResult;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getOrganizationGoalsFromYear(userId, Year) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const searchYear = Year.replace(/\s+/g, '');
      const year1 = searchYear.slice(0, 4);
      const year2 = searchYear.slice(5);
      const result = await this.orgObjective
        .find({
          Year: `${year1} - ${year2}`,
          organizationId: activeUser.organizationId,
        })
        .select('_id Year ObjectiveCategory');

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getNCFromYear(userId, year) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const searchYear = year.replace(/\s+/g, '');
      const year1 = searchYear.slice(0, 4);
      const year2 = searchYear.slice(5);
      const result = [];
      const getAudit = await this.audit
        .find({
          auditYear: { $regex: `${year1} - ${year2}` },
          organization: activeUser.organizationId,
        })
        .then(function (storedDataArray) {
          return storedDataArray;
        })
        .catch(function (err) {
          if (err) {
            throw new Error(err.message);
          }
        });
      const finalData = [];
      if (getAudit) {
        for (let value of getAudit) {
          const result = await this.nonConformance
            .find({
              audit: value._id,
              type: 'NC',
            })
            .select('_id id type');
          finalData.push(...result);
        }
      }

      return finalData;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getObservationFromYear(userId, year) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const searchYear = year.replace(/\s+/g, '');
      const year1 = searchYear.slice(0, 4);
      const year2 = searchYear.slice(5);
      const result = [];
      const getAudit = await this.audit
        .find({
          auditYear: { $regex: `${year1} - ${year2}` },
          organization: activeUser.organizationId,
        })
        .then(function (storedDataArray) {
          return storedDataArray;
        })
        .catch(function (err) {
          if (err) {
            throw new Error(err.message);
          }
        });
      const finalData = [];
      if (getAudit) {
        for (let value of getAudit) {
          const result = await this.nonConformance
            .find({
              audit: value._id,
              type: 'Observation',
            })
            .select('_id id type');
          finalData.push(...result);
        }
      }

      return finalData;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async createObjectMaster(userId, data: CreateObjectMaster, randomNumber) {
    // console.log('data in create pbject master', data);
    this.logger.debug(`createObjectMaster service started with data ${data}`);
    try {
      const {
        ObjectiveName,
        ObjectiveId,
        ObjectiveCategory,
        Description,
        ObjectivePeriod,
        EntityTypeId,
        ObjectiveType,
        ObjectiveLinkedId,
        ReviewList,
        ObjectiveStatus,
        MilestonePeriod,
        ParentObjective,
        ReviewComments,
        Reason,
        ObjectivedocStatus,
        Readers,
        Review,
        Owner,
        OwnerShipType,
        OwnershipEntity,
        ReadersList,
        locationId,
        Scope,
        Goals,
        ScopeDetails,
        resources,
        evaluationProcess,
        systemTypes,
        ScopeType,
        associatedKpis,
      } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const objectiveNameRegex: any = new RegExp(`^${ObjectiveName}$`, 'i');
      const existingObject = await this.objectiveMaster.find({
        ScopeType: ScopeType,
        Scope: Scope,
        ObjectiveName: { $regex: new RegExp(`^${ObjectiveName}$`, 'i') },
        ObjectivePeriod: ObjectivePeriod,

        Goals: {
          some: {
            name: {
              in: Goals,
            },
          },
        },
      });
      this.logger.debug(`checking for duplicat ${existingObject}`);
      // console.log('existing object', existingObject);
      if (existingObject.length > 0) {
        this.logger.error(
          `trace id=${randomNumber} POST api/objective/createObjectMaster forpayload ${data} service failed`,
          '',
        );
        throw new ConflictException({ status: 409 });
      }
      // try {
      else {
        this.logger.debug(`creating record`);
        const result = await this.objectiveMaster.create({
          ObjectiveName,
          ObjectiveId,
          ObjectiveCategory: Goals,
          Description,
          ObjectivePeriod,
          EntityTypeId,
          ObjectiveType,
          ObjectiveLinkedId,
          ReviewList,
          ObjectiveStatus,
          createdBy: {
            id: activeUser.id,
            username: activeUser.username,
            email: activeUser.email,
            avatar: activeUser.avatar,
          },
          OrganizationId: activeUser.organizationId,
          MilestonePeriod,
          ParentObjective,
          Reason,
          ObjectivedocStatus,
          Readers,
          Review,
          Owner,
          OwnerShipType,
          OwnershipEntity,
          ReadersList,
          Scope,
          Goals,
          locationId,
          ScopeDetails,
          resources,
          evaluationProcess,
          systemTypes,
          ScopeType,
          associatedKpis,
        });

        const finalData = {
          ReviewComments: ReviewComments,
          ObjectiveId: new ObjectId(result._id),
        };

        if (ReviewComments) {
          const createOwnerComment = await this.createOwnerComments(
            finalData,
            activeUser.kcId,
          );
        }
        this.logger.log(
          `trace id=${randomNumber} POST api/objective/createObjectMaster forpayload ${data} service successful`,
          '',
        );
        // return 'successfully Created Object Master';
        return result;
      }
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST api/objective/createObjectMaster forpayload ${data} service failed ${error}`,
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

  async deleteObjectMaster(userId, id, randomNumber): Promise<any> {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      this.logger.debug(
        `deleteObjectMaster service started for ${activeUser} `,
      );
      // Check if the objective is referenced by any KPI
      const kpisWithObjective = await this.KpiModel.find({
        objectiveId: id,
      });
      this.logger.debug(`found kpis with obective ${kpisWithObjective}`);
      // console.log('kpis with objectove', kpisWithObjective);
      if (kpisWithObjective.length > 0) {
        // console.log('inside if');
        this.logger.debug(`if kpis exists removing obj id from their record`);
        await this.KpiModel.updateMany(
          { objectiveId: id },
          { $pull: { objectiveId: id } }, // Pull `id` from the `objectiveIds` array
        );
      }

      //Delete the objective from the objectiveMaster collection
      const result = await this.objectiveMaster.findByIdAndDelete(id);
      this.logger.log(
        `trace id=${randomNumber} DELETE api/objective/deleteObjectMaster for ${id} service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} DELETE api/objective/deleteObjectMaster for ${id} service failed ${error}`,
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

  async getAllObjectMasterWithOutPagination(userId, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
      },
    });

    try {
      this.logger.debug(
        `getAllObjectMasterwithoutpagination started fr ${activeUser}`,
      );
      const result = await this.objectiveMaster.find({
        OrganizationId: activeUser.organizationId,
      });
      const finalResult = [];

      for (let value of result) {
        this.logger.debug(`processing obj ${value}`);
        const ownerInfo = await this.prisma.user.findFirst({
          where: {
            id: value.Owner,
          },
          include: {
            entity: true,
          },
        });

        const result = await this.kra.find({
          ObjectiveId: value._id,
        });
        const data1 = {
          _id: value._id,
          entityName: ownerInfo?.entity?.entityName || null,
          ObjectiveName: value.ObjectiveName,
          ObjectiveId: value.ObjectiveId,
          ObjectiveCategory: value.ObjectiveCategory,
          ObjectiveYear: value.ObjectiveYear,
          Description: value.Description,
          ModifiedDate: value.ModifiedDate,
          ModifiedBy: value.ModifiedBy,
          ObjectivePeriod: value.ObjectivePeriod,
          EntityTypeId: value.EntityTypeId,
          ObjectiveType: value.ObjectiveType,
          ObjectiveLinkedId: value.ObjectiveLinkedId,
          OrganizationId: value.OrganizationId,
          ObjectiveStatus: value.ObjectiveStatus,
          ObjectivedocStatus: value.ObjectivedocStatus,
          locationId: value.locationId,
          Readers: value.Readers,
          ReadersList: value.ReadersList,
          ReviewList: value.ReviewList,
          Objective: value.Objective,
          Owner: value.Owner,
          OwnerName: ownerInfo ? ownerInfo.username : '',
          OwnerShipType: value.OwnerShipType,
          OwnershipEntity: value.OwnershipEntity,
          MilestonePeriod: value.MilestonePeriod,
          ParentObjective: value.ParentObjective,
          Goals: value.Goals,
          Reason: value.Reason,
          reviwerAccess: false,
          kra: result,
          ScopeType: value.ScopeType,
          createdBy: value?.createdBy,
        };
        let ReaderAccess = false;
        let EditerAccess = false;
        let ReviwerAccess = false;

        switch (value.Readers) {
          case 'Organization':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value.OrganizationId === activeUser.organizationId) {
              ReaderAccess = true;
            }
            const resultData = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };

            finalResult.push(resultData);
            break;
          case 'Location(s)':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList?.includes(activeUser.locationId)) {
              ReaderAccess = true;
            }
            const resultData1 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData1);
            break;
          case 'Entity(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.entityId)) {
              ReaderAccess = true;
            }
            const resultData2 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData2);
            break;
          case 'User(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.id)) {
              ReaderAccess = true;
            }
            const resultData3 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData3);
            break;

          default:
            const resultData4 = {
              ...data1,
            };
            finalResult.push(resultData4);
            break;
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllObjectMasterWithOutPagination  service successful`,
        '',
      );
      return { data: finalResult, length: finalResult.length };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/objective/getAllObjectMasterWithOutPagination  service failed ${error}`,
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

  async searchObjectMaster(userId, query) {
    this.logger.debug(`searchobjectivemaster started ${query}`);
    const page = query.page || 1; // Default to page 1 if not provided
    const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
    const skip = (page - 1) * limit;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
      },
    });
    try {
      const result = await this.objectiveMaster
        .find({
          $and: [
            { ObjectiveName: { $regex: new RegExp(query?.text, 'i') } },
            { OrganizationId: activeUser.organizationId },
            { ObjectivePeriod: query?.ObjectivePeriod },
          ],
        })
        .skip(skip)
        .limit(limit)
        .lean();
      const finalResult = [];

      for (let value of result) {
        const ownerInfo = await this.prisma.user.findFirst({
          where: {
            id: value.Owner,
          },
          include: {
            entity: true,
            location: true,
          },
        });
        let parentObjectiveDetails;
        if (value.ParentObjective) {
          try {
            parentObjectiveDetails = await this.objectiveMaster.findById(
              new ObjectId(value.ParentObjective),
            );
          } catch (error) {
            this.logger.warn(`no parent objective found`);
          }
        }
        const result = await this.kra.find({
          ObjectiveId: value._id,
        });
        const data1 = {
          _id: value._id,
          entityName: ownerInfo?.entity?.entityName || null,
          locationName: ownerInfo?.location?.locationName,
          ObjectiveName: value.ObjectiveName,
          ObjectiveId: value.ObjectiveId,
          ObjectiveCategory: value.ObjectiveCategory,
          ObjectiveYear: value.ObjectiveYear,
          Description: value.Description,
          ModifiedDate: value.ModifiedDate,
          ModifiedBy: value.ModifiedBy,
          ObjectivePeriod: value.ObjectivePeriod,
          EntityTypeId: value.EntityTypeId,
          ObjectiveType: value.ObjectiveType,
          ObjectiveLinkedId: value.ObjectiveLinkedId,
          OrganizationId: value.OrganizationId,
          ObjectiveStatus: value.ObjectiveStatus,
          ObjectivedocStatus: value.ObjectivedocStatus,
          Readers: value.Readers,
          ReadersList: value.ReadersList,
          ReviewList: value.ReviewList,
          Objective: value.Objective,
          parentObjectiveDetails: parentObjectiveDetails,
          Owner: value.Owner,
          OwnerName: ownerInfo ? ownerInfo.username : '',
          OwnerShipType: value.OwnerShipType,
          OwnershipEntity: value.OwnershipEntity,
          MilestonePeriod: value.MilestonePeriod,
          ParentObjective: value.ParentObjective,
          Reason: value.Reason,
          Goals: value.Goals,
          reviwerAccess: false,
          kra: result,
          locationId: value.locationId,
          Scope: value.Scope,
          ScopeDetails: value.ScopeDetails,
          ScopeType: value.ScopeType,
          createdAt: value?.createdAt,
          createdBy: value?.createdBy,
          associatedKpis: value?.associatedKpis,
        };
        let ReaderAccess = false;
        let EditerAccess = false;
        let ReviwerAccess = false;

        switch (value.Readers) {
          case 'Organization':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value.OrganizationId === activeUser.organizationId) {
              ReaderAccess = true;
            }
            const resultData = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };

            finalResult.push(resultData);
            break;
          case 'Location(s)':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList?.includes(activeUser.locationId)) {
              ReaderAccess = true;
            }
            const resultData1 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData1);
            break;
          case 'Entity(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.entityId)) {
              ReaderAccess = true;
            }
            const resultData2 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData2);
            break;
          case 'User(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.id)) {
              ReaderAccess = true;
            }
            const resultData3 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData3);
            break;

          default:
            const resultData4 = {
              ...data1,
            };
            finalResult.push(resultData4);
            break;
        }
      }
      return { data: finalResult, length: finalResult.length };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getOwnerDetails(ownerId) {
    try {
      this.logger.debug(`getOwnerDetails service started ${ownerId}`);
      const ownerDetails = await this.prisma.user.findFirst({
        where: { id: ownerId },
        include: { entity: true },
      });
      return ownerDetails?.entity?.id;
    } catch (error) {
      console.error('Error fetching owner details:', error);
      return null;
    }
  }

  // async getAllObjectMaster(userId, query) {
  //   const page = query.page || 1; // Default to page 1 if not provided
  //   const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
  //   const skip = (page - 1) * limit;

  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: userId.id,
  //     },
  //     include: {
  //       location: {
  //         select: {
  //           locationName: true,
  //         },
  //       },
  //       organization: {
  //         select: {
  //           id: true,
  //         },
  //       },
  //     },
  //   });

  //   try {
  //     let result, count;
  //     if (query.locationId === 'All' && query.deptId === 'All') {
  //       result = await this.objectiveMaster
  //         .find({
  //           OrganizationId: activeUser.organization.id,
  //           //locationId: query.locationId,
  //           ObjectivePeriod: query.year,
  //         })
  //         .skip(skip)
  //         .limit(limit)
  //         .lean();
  //       count = await this.objectiveMaster.countDocuments({
  //         organizationId: activeUser?.organization.id,
  //         ObjectivePeriod: query.year,
  //       });
  //     } else if (query.locationId === 'All') {
  //       result = await this.objectiveMaster
  //         .find({
  //           OrganizationId: activeUser.organization.id,
  //           //locationId: query.locationId,
  //           ObjectivePeriod: query.year,
  //         })
  //         .skip(skip)
  //         .limit(limit)
  //         .lean();
  //       count = await this.objectiveMaster.countDocuments({
  //         organizationId: activeUser?.organization.id,
  //         ObjectivePeriod: query.year,
  //       });
  //     } else {
  //       result = await this.objectiveMaster
  //         .find({
  //           OrganizationId: activeUser.organization.id,
  //           locationId: query.locationId,
  //           ObjectivePeriod: query.year,
  //         })
  //         .skip(skip)
  //         .limit(limit)
  //         .lean();
  //       count = await this.objectiveMaster.countDocuments({
  //         organizationId: activeUser?.organization.id,
  //         locationId: query.locationId,
  //         ObjectivePeriod: query.year,
  //       });
  //     }

  //     const filteredResults = (
  //       await Promise.all(
  //         result.map(async (result) => {
  //           if (query?.deptId === 'All') {
  //             return result;
  //           } else if (
  //             result.ScopeType === 'Department' &&
  //             result.Scope === query?.deptId
  //           ) {
  //             return result; // Include in the filtered results for entity based on deptId
  //           } else if (result?.ScopeType === 'Unit') {
  //             const ownerDepartmentId = await this.getOwnerDetails(
  //               result.Owner,
  //             ); //get owners dept id

  //             if (ownerDepartmentId === query.deptId) {
  //               return result; // Include in the filtered results for location  if the scopetype is location by matching owners entity
  //             }
  //           }
  //           return null; // Exclude the result
  //         }),
  //       )
  //     ).filter(Boolean);

  //     const finalResult = [];

  //     for (let value of filteredResults) {
  //       const ownerInfo = await this.prisma.user.findFirst({
  //         where: {
  //           id: value.Owner,
  //         },
  //         include: {
  //           entity: true,
  //           location: true,
  //         },
  //       });
  //       let parentObjectiveDetails;
  //       if (value.ParentObjective) {
  //         parentObjectiveDetails = await this.objectiveMaster.findById(
  //           new ObjectId(value.ParentObjective),
  //         );
  //       }
  //       const result = await this.kra.find({
  //         ObjectiveId: value._id,
  //       });
  //       const data1 = {
  //         _id: value._id,
  //         entityName: ownerInfo?.entity?.entityName || null,
  //         locationName: ownerInfo?.location?.locationName || null,
  //         ObjectiveName: value.ObjectiveName,
  //         ObjectiveId: value.ObjectiveId,
  //         ObjectiveCategory: value.ObjectiveCategory,
  //         ObjectiveYear: value.ObjectiveYear,
  //         Description: value.Description,
  //         ModifiedDate: value.ModifiedDate,
  //         ModifiedBy: value.ModifiedBy,
  //         ObjectivePeriod: value.ObjectivePeriod,
  //         EntityTypeId: value.EntityTypeId,
  //         ObjectiveType: value.ObjectiveType,
  //         ObjectiveLinkedId: value.ObjectiveLinkedId,
  //         OrganizationId: value.OrganizationId,
  //         ObjectiveStatus: value.ObjectiveStatus,
  //         ObjectivedocStatus: value.ObjectivedocStatus,
  //         Readers: value.Readers,
  //         ReadersList: value.ReadersList,
  //         ReviewList: value.ReviewList,
  //         Objective: value.Objective,
  //         Owner: value.Owner,
  //         OwnerName: ownerInfo ? ownerInfo.username : '',
  //         OwnerShipType: value.OwnerShipType,
  //         OwnershipEntity: value.OwnershipEntity,
  //         MilestonePeriod: value.MilestonePeriod,
  //         Goals: value.Goals,
  //         ParentObjective: value.ParentObjective,
  //         parentObjectiveDetails: parentObjectiveDetails,
  //         Reason: value.Reason,
  //         reviwerAccess: false,
  //         kra: result,
  //         Scope: value.Scope,
  //         ScopeDetails: value.ScopeDetails,
  //         locationId: value.locationId,
  //         createdBy: value?.createdBy,
  //         createdAt: value?.createdAt,
  //         associatedKpis: value?.associatedKpis,
  //       };
  //       let ReaderAccess = false;
  //       let EditerAccess = false;
  //       let ReviwerAccess = false;

  //       switch (value.Readers) {
  //         case 'Organization':
  //           if (
  //             value?.ReviewList?.some((value) => value['id'] === activeUser.id)
  //           ) {
  //             ReviwerAccess = true;
  //           }
  //           if (value?.Owner === activeUser.id) {
  //             EditerAccess = true;
  //           }
  //           if (value.OrganizationId === activeUser.organizationId) {
  //             ReaderAccess = true;
  //           }
  //           const resultData = {
  //             ...data1,
  //             ReaderAccess,
  //             ReviwerAccess,
  //             EditerAccess,
  //           };

  //           finalResult.push(resultData);
  //           break;
  //         case 'Location(s)':
  //           if (
  //             value?.ReviewList?.some((value) => value['id'] === activeUser.id)
  //           ) {
  //             ReviwerAccess = true;
  //           }
  //           if (value?.Owner === activeUser.id) {
  //             EditerAccess = true;
  //           }
  //           if (value?.ReadersList?.includes(activeUser.locationId)) {
  //             ReaderAccess = true;
  //           }
  //           const resultData1 = {
  //             ...data1,
  //             ReaderAccess,
  //             ReviwerAccess,
  //             EditerAccess,
  //           };
  //           finalResult.push(resultData1);
  //           break;
  //         case 'Entity(s)':
  //           if (
  //             value?.ReviewList.some((value) => value['id'] === activeUser.id)
  //           ) {
  //             ReviwerAccess = true;
  //           }
  //           if (value?.Owner === activeUser.id) {
  //             EditerAccess = true;
  //           }
  //           if (value?.ReadersList.includes(activeUser.entityId)) {
  //             ReaderAccess = true;
  //           }
  //           const resultData2 = {
  //             ...data1,
  //             ReaderAccess,
  //             ReviwerAccess,
  //             EditerAccess,
  //           };
  //           finalResult.push(resultData2);
  //           break;
  //         case 'User(s)':
  //           if (
  //             value?.ReviewList.some((value) => value['id'] === activeUser.id)
  //           ) {
  //             ReviwerAccess = true;
  //           }
  //           if (value?.Owner === activeUser.id) {
  //             EditerAccess = true;
  //           }
  //           if (value?.ReadersList.includes(activeUser.id)) {
  //             ReaderAccess = true;
  //           }
  //           const resultData3 = {
  //             ...data1,
  //             ReaderAccess,
  //             ReviwerAccess,
  //             EditerAccess,
  //           };
  //           finalResult.push(resultData3);
  //           break;

  //         default:
  //           const resultData4 = {
  //             ...data1,
  //           };
  //           finalResult.push(resultData4);
  //           break;
  //       }
  //     }
  //     return { data: finalResult, length: count };
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         message: error.message,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }
  async getAllObjectMaster(userId, query, randomNumber) {
    this.logger.debug(`getAllObjectMaster service started with ${query}`);
    const page = query.page || 1; // Default to page 1 if not provided
    const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
    const skip = (page - 1) * limit;
    // console.log('query', query);
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
        organization: {
          select: {
            id: true,
          },
        },
      },
    });

    try {
      let result, count;
      if (query.scopeType) {
        this.logger.debug(`inside if query.scopetype exists`);
        // console.log('inside if');
        if (query.locationId === 'All' && query.scopeType === 'Unit') {
          this.logger.debug(
            `if query.locationId is All and scoptetype is unit condtion`,
          );
          // console.log('location == all and scopetype is unit');
          result = await this.objectiveMaster
            .find({
              OrganizationId: activeUser.organization.id,
              //locationId: query.locationId,
              ObjectivePeriod: query.year,
              ScopeType: 'Unit',
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
          count = await this.objectiveMaster.countDocuments({
            organizationId: activeUser?.organization.id,
            ObjectivePeriod: query.year,
            ScopeType: 'Unit',
          });
        } else if (query.locationId !== 'All' && query.scopeType === 'Unit') {
          this.logger.debug(
            `inside locationId not equal to All and scopeType is Unit`,
          );
          // console.log('location!=all and scopetype is unit');
          result = await this.objectiveMaster
            .find({
              OrganizationId: activeUser.organization.id,
              //  locationId: query.locationId,
              ObjectivePeriod: query.year,
              ScopeType: 'Unit',
              Scope: query.locationId,
            })
            .skip(skip)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
          // console.log('result', result);
          count = await this.objectiveMaster.countDocuments({
            organizationId: activeUser?.organization.id,
            ObjectivePeriod: query.year,
            // locationId: query.locationId,
            ScopeType: 'Unit',
            Scope: query.locationId,
          });
        } else if (
          query.locationId !== 'All' &&
          query.scopeType === 'Department' &&
          query.deptId !== 'All'
        ) {
          this.logger.debug(
            `inside locationid not equal to all, scopetype is deprtment and deptId not equal to All`,
          );
          // console.log('location!=all and dept != all scopetype is dept');page=1&limit=10&locationId=cm0xsztrm000y10jnbvscs4yw&year=24-25&deptId=cm0yt0dxa000e2x8n6vr7lq01&scopeType=Department
          result = await this.objectiveMaster
            .find({
              OrganizationId: activeUser.organization.id,
              locationId: query.locationId,
              ObjectivePeriod: query.year,
              Scope: query.deptId,
              ScopeType: 'Department',
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
          count = await this.objectiveMaster.countDocuments({
            organizationId: activeUser?.organization.id,
            locationId: query.locationId,
            ObjectivePeriod: query.year,
            Scope: query.deptId,
            ScopeType: 'Department',
          });
        } else if (
          query.locationId !== 'All' &&
          query.scopeType === 'Department' &&
          query.deptId === 'All'
        ) {
          this.logger.debug(
            `inside locationId not equal to All and deptID equal to All and scopetype is department`,
          );
          // console.log('location!=all and dept  all scopetype is dept');
          result = await this.objectiveMaster
            .find({
              OrganizationId: activeUser.organization.id,
              locationId: query.locationId,
              ObjectivePeriod: query.year,

              ScopeType: 'Department',
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
          count = await this.objectiveMaster.countDocuments({
            organizationId: activeUser?.organization.id,
            locationId: query.locationId,
            ObjectivePeriod: query.year,

            ScopeType: 'Department',
          });
        } else if (
          query.locationId === 'All' &&
          query.scopeType === 'Department' &&
          query.deptId === 'All'
        ) {
          this.logger.debug(
            `inside both locid and deptid equal to all and scopetype is department`,
          );
          // console.log('location=all and dept = all scopetype is dept');
          result = await this.objectiveMaster
            .find({
              OrganizationId: activeUser.organization.id,

              ObjectivePeriod: query.year,

              ScopeType: 'Department',
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
          count = await this.objectiveMaster.countDocuments({
            organizationId: activeUser?.organization.id,

            ObjectivePeriod: query.year,

            ScopeType: 'Department',
          });
        }
      } else if (
        (!!query.selectedScopetype && query.selectedScopetype.length > 0) ||
        (!!query.selectedParent && query.selectedParent.length > 0)
      ) {
        this.logger.debug(
          `inside selectedscopetype and selectedPArent ids are there`,
        );
        let condition: any = {
          organizationId: activeUser?.organization.id,

          ObjectivePeriod: query.year,
        };

        if (query.selectedScopetype && query.selectedScopetype.length > 0) {
          condition.ScopeType = { $in: query.selectedScopetype };
        } else if (query.selectedParent && query.selectedParent.length > 0) {
          condition.ParentObjective = { $in: query.selectedParent };
        }

        // console.log('condition', condition);
        result = await this.objectiveMaster
          .find(condition)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: 1 })
          .lean();

        // console.log('result', result);
        count = await this.objectiveMaster.countDocuments({
          organizationId: activeUser?.organization.id,

          ObjectivePeriod: query.year,

          ScopeType: { $in: query.selectedScopetype },
        });
      }

      const finalResult = [];

      for (let value of result) {
        this.logger.debug(`processing obj ${value}`);
        const ownerInfo = await this.prisma.user.findFirst({
          where: {
            id: value.Owner,
          },
          include: {
            entity: true,
            location: true,
          },
        });
        let parentObjectiveDetails;
        if (value.ParentObjective) {
          try {
            parentObjectiveDetails = await this.objectiveMaster.findById(
              new ObjectId(value.ParentObjective),
            );
          } catch (error) {
            this.logger.debug(`parent obj not found`);
          }
        }
        const result = await this.kra.find({
          ObjectiveId: value._id,
        });
        const data1 = {
          _id: value._id,
          entityName: ownerInfo?.entity?.entityName || null,
          locationName: ownerInfo?.location?.locationName || null,
          ObjectiveName: value.ObjectiveName,
          ObjectiveId: value.ObjectiveId,
          ObjectiveCategory: value.ObjectiveCategory,
          ObjectiveYear: value.ObjectiveYear,
          Description: value.Description,
          ModifiedDate: value.ModifiedDate,
          ModifiedBy: value.ModifiedBy,
          ObjectivePeriod: value.ObjectivePeriod,
          EntityTypeId: value.EntityTypeId,
          ObjectiveType: value.ObjectiveType,
          ObjectiveLinkedId: value.ObjectiveLinkedId,
          OrganizationId: value.OrganizationId,
          ObjectiveStatus: value.ObjectiveStatus,
          ObjectivedocStatus: value.ObjectivedocStatus,
          Readers: value.Readers,
          ReadersList: value.ReadersList,
          ReviewList: value.ReviewList,
          Objective: value.Objective,
          Owner: value.Owner,
          OwnerName: ownerInfo ? ownerInfo.username : '',
          OwnerShipType: value.OwnerShipType,
          OwnershipEntity: value.OwnershipEntity,
          MilestonePeriod: value.MilestonePeriod,
          Goals: value.Goals,
          ParentObjective: value.ParentObjective,
          parentObjectiveDetails: parentObjectiveDetails,
          Reason: value.Reason,
          reviwerAccess: false,
          kra: result,
          Scope: value.Scope,
          ScopeType: value.ScopeType,
          ScopeDetails: value.ScopeDetails,
          locationId: value.locationId,
          createdBy: value?.createdBy,
          createdAt: value?.createdAt,
          associatedKpis: value?.associatedKpis,
        };
        let ReaderAccess = false;
        let EditerAccess = false;
        let ReviwerAccess = false;

        if (
          userId.kcRoles?.roles?.includes('MR') ||
          userId.kcRoles?.roles?.includes('ORG-ADMIN') ||
          activeUser.id === value.Owner
        ) {
          EditerAccess = true;
        }

        switch (value.Readers) {
          case 'Organization':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value.OrganizationId === activeUser.organizationId) {
              ReaderAccess = true;
            }
            const resultData = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };

            finalResult.push(resultData);
            break;
          case 'Location(s)':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList?.includes(activeUser.locationId)) {
              ReaderAccess = true;
            }
            const resultData1 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData1);
            break;
          case 'Entity(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.entityId)) {
              ReaderAccess = true;
            }
            const resultData2 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData2);
            break;
          case 'User(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.id)) {
              ReaderAccess = true;
            }
            const resultData3 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData3);
            break;

          default:
            const resultData4 = {
              ...data1,
              EditerAccess: EditerAccess,
            };
            finalResult.push(resultData4);
            break;
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllObjectMaster  service successful`,
        '',
      );
      return { data: finalResult, length: count };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/objective/getAllObjectMaster  service failed ${error}`,
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

  async getObjectMasterById(userId, id, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });
    this.logger.debug(
      `getObjectmasterById started for ${activeUser} and id =${id}`,
    );
    try {
      let EditorAccess = false;

      const objresult = await this.objectiveMaster.findById({
        _id: new ObjectId(id),
        OrganizationId: activeUser.organizationId,
      });
      let parentObjective;
      if (objresult.ParentObjective !== '') {
        try {
          parentObjective = await this.objectiveMaster.findById({
            _id: new ObjectId(objresult.ParentObjective),
          });
        } catch (error) {
          this.logger.debug(`parent obj not found`);
        }
      }
      const result = {
        ObjectiveName: objresult.ObjectiveName,
        ParentObjective: parentObjective,
        ObjectivePeriod: objresult.ObjectivePeriod,
        MilestonePeriod: objresult.MilestonePeriod,
        Owner: objresult.Owner,
        // OwnerName: objresult.OwnerName,
        ObjectiveId: objresult.ObjectiveId,
        // ObjectiveCategory:res.data.result.ObjectiveCategory,
        Description: objresult.Description,
        Scope: objresult.Scope,
        Goals: objresult.Goals,
        resources: objresult.resources,
        evaluationProcess: objresult.evaluationProcess,
        systemTypes: objresult.systemTypes,
        createdBy: objresult.createdBy,
        associatedKpis: objresult.associatedKpis,
        ScopeType: objresult.ScopeType,
        locationId: objresult.locationId,
        ObjectiveStatus: objresult.ObjectiveStatus,

        _id: objresult._id,
      };
      if (
        userId.kcRoles?.roles?.includes('ORG-ADMIN') ||
        (userId.kcRoles?.roles?.includes('MR') &&
          objresult.locationId === activeUser.locationId) ||
        activeUser.id === result.Owner
      ) {
        EditorAccess = true;
      }

      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getObjectMasterById/${id} service successful`,
        '',
      );
      return {
        result,

        EditorAccess,
      };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/objective/getObjectMasterById/${id} service failed ${error}`,
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

  async getAllUser(userId, id, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    this.logger.debug(`getallUSer in obj started for ${activeUser}`);
    try {
      let result, finalData;
      if (activeUser?.userType !== 'globalRoles') {
        this.logger.debug(`inside user doesnt have global roles `);
        result = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            deleted: false,
            locationId: id,
          },
          orderBy: {
            username: 'asc', // Sort by username in ascending order
          },
        });
        finalData = { activeUser: activeUser, allUsers: result };
      } else {
        this.logger.debug(`user has additionalUnits`);
        if (activeUser?.additionalUnits?.includes('All')) {
          this.logger.debug(`user had All as additional units`);
          //if additionalunits includes all then display all locations
          result = await this.prisma.user.findMany({
            where: {
              organizationId: activeUser.organizationId,
              deleted: false,
            },
            orderBy: {
              username: 'asc', // Sort by username in ascending order
            },
          });
        } else {
          this.logger.debug(`user has one or more additionalunits`);
          //else only subsets
          result = await this.prisma.user.findMany({
            where: {
              organizationId: activeUser.organizationId,
              deleted: false,
              locationId: { in: activeUser?.additionalUnits },
            },
            orderBy: {
              username: 'asc', // Sort by username in ascending order
            },
          });
        }

        finalData = {
          activeUser: activeUser,
          allUsers: [...result, activeUser],
        };
      }

      // finalData.allUsers.push(activeUser);
      // console.log('finalData', finalData);
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllUser service successful`,
        '',
      );
      return finalData;
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllUser service failed ${error}`,
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

  async getUserById(userId, id, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });

    try {
      const userInfo: any = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
        include: {
          // assignedRole: {
          //   select: {
          //     role: {
          //       select: {
          //         roleName: true,
          //       },
          //     },
          //   },
          // },
        },
      });
      const roleInfo = await this.prisma.role.findMany({
        where: { id: { in: userInfo.roleId } },
      });

      const roleIds = roleInfo.map((value) => value.roleName);
      if (roleIds[0] === 'ORG-ADMIN') {
        const result = await this.prisma.user.findFirst({
          where: {
            id: id,
          },
          include: {
            organization: {
              select: {
                id: true,
                organizationName: true,
              },
            },
          },
        });
        this.logger.log(
          `trace id=${randomNumber} GET api/objective/getUserById/${id} service successful`,
          '',
        );
        return {
          organization: result.organization.organizationName,
          organizationId: result.organization.id,
          userId: activeUser.id,
          userName: activeUser.username,
        };
      } else {
        const result = await this.prisma.user.findFirst({
          where: {
            id,
          },
          include: {
            location: {
              select: {
                locationName: true,
                id: true,
              },
            },
            entity: {
              select: {
                id: true,
                entityName: true,
              },
            },
            // business: {
            //   select: {
            //     id: true,
            //     name: true,
            //   },
            // },
            organization: {
              select: {
                id: true,
                organizationName: true,
              },
            },
          },
        });
        this.logger.log(
          `trace id=${randomNumber} GET api/objective/getUserById/${id} service successful`,
          '',
        );
        return {
          userId: result.id,
          userName: result.username,
          emailAddress: result.email,
          avatar: result.avatar,
          organization: result.organization.organizationName,
          organizationId: result.organizationId,
          locationName: result.location.locationName,
          locationId: result.locationId,
          // businessUnit: result.business.name,
          // businessUnitId: result.business.id,
          entity: result.entity.entityName,
          entityId: result.entityId,
        };
      }
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getUserById/${id} service failed${error}`,
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

  async getLocationForObjectiveMaster(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    this.logger.debug(
      `getLocationForObjectiveMastr service started for ${activeUser}`,
    );
    try {
      const result = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
        select: {
          id: true,
          locationName: true,
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getDepartmentForObjectiveMaster(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    this.logger.debug(
      `getDepartmentForObjectiveMaster started for ${activeUser}`,
    );
    try {
      const result = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
        select: {
          id: true,
          entityName: true,
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateObjectMaster(id, data, userId, randomNumber) {
    const {
      ObjectivedocStatus,
      Readers,
      Review,
      Owner,
      OwnerShipType,
      OwnershipEntity,
      ModifiedBy,
      ReadersList,
      Scope,
      Goals,
      ScopeDetails,
      associatedKpis,
    } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    this.logger.debug(
      `updateObjectMaster service started for ${activeUser} for data ${data}`,
    );
    try {
      const updateStatus = await this.objectiveMaster.findByIdAndUpdate(
        { _id: id },
        {
          ObjectivedocStatus,
          Readers,
          Review,
          Owner,
          ReadersList,
          OwnerShipType,
          OwnershipEntity,
          ModifiedBy: activeUser.username,
          ModifiedDate: Date(),
          Scope,
          Goals,
          ScopeDetails,
          associatedKpis,
        },
      );

      this.logger.log(
        `trace id=${randomNumber} PUT api/objective/updateObjectMaster/${id} service successful`,
        '',
      );
      return updateStatus;
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} PUT api/objective/updateObjectMaster/${id} service failed`,
        error.stack || error?.message,
      );
      throw new InternalServerErrorException({
        message: error.message,
      });
    }
  }

  async createReviewComments(data: createReviewComments, userId) {
    const { ReviewComments, ObjectiveId, ReviewedBy } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const result = this.reviewComments.create({
        ReviewComments,
        ObjectiveId,
        ReviewedBy,
        ReviewDate: Date.now(),
      });
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async createOwnerComments(data: createOwnerComments, userId) {
    const { ReviewComments, ObjectiveId } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const result = await this.ownerComments.create({
        ReviewComments,
        ObjectiveId: new ObjectId(ObjectiveId),
        CommentDate: Date.now(),
      });
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async update(id, data, userId, randomNumber) {
    const {
      ObjectiveName,
      ObjectiveId,
      ObjectiveCategory,
      ObjectiveYear,
      Description,
      ObjectivePeriod,
      EntityTypeId,
      ObjectiveType,
      ObjectiveLinkedId,
      ObjectiveStatus,
      ObjectivedocStatus,
      Readers,
      ReadersList,
      Review,
      Objective,
      Owner,
      ReviewComments,
      OwnerShipType,
      OwnershipEntity,
      MilestonePeriod,
      ParentObjective,
      ReviewList,
      Reason,
      locationId,
      Scope,
      Goals,
      ScopeDetails,
      ScopeType,
      createdBy,
      systemTypes,
      associatedKpis,
    } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      this.logger.debug(
        `update service called for ${activeUser} with data ${data}`,
      );
      const result = await this.objectiveMaster.findByIdAndUpdate(
        { _id: id },
        {
          ObjectiveName,
          ObjectiveId,
          ObjectiveCategory,
          ObjectiveYear,
          Description,
          ObjectivePeriod,
          EntityTypeId,
          ObjectiveType,
          ObjectiveLinkedId,
          ObjectiveStatus,
          ObjectivedocStatus,
          Readers,
          ReviewList,
          ReadersList,
          Review,
          Objective,
          Owner,
          OwnerShipType,
          OwnershipEntity,
          MilestonePeriod,
          ModifiedDate: Date.now(),
          ModifiedBy: activeUser.username,
          ParentObjective,
          Reason,
          locationId,
          Scope,
          Goals,
          ScopeDetails,
          ScopeType,
          systemTypes,
          createdBy,
          associatedKpis,
        },
      );
      const result1 = await this.objectiveMaster.findById(id);
      if (ReviewList) {
        try {
          const sendReviewerMail = await this.sendMail(result, id);
        } catch {
          ////////////////console.log('email address is not valid');
        }
      }
      if (ReviewComments) {
        const finalData = {
          ReviewComments: ReviewComments,
          ObjectiveId: result._id,
        };
        const createOwnerComments = await this.createOwnerComments(
          finalData,
          activeUser.kcId,
        );
      }
      this.logger.log(
        `trace id=${randomNumber} Put api/objective/update for ${id} and ${data}service successful`,
        '',
      );
      return { result: result1, ownerComments: createOwnerComments };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Put api/objective/update for ${id} and ${data}service failed ${error}`,
        '',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async sendMail(data, id) {
    const { Owner, ReviewList, ObjectiveName } = data;
    const pendingPromises = [];
    let emailMessage = ``;
    const ownerInfo = await this.prisma.user.findFirst({
      where: {
        id: Owner,
      },
      include: {
        organization: {
          select: {
            organizationName: true,
          },
        },
      },
    });
    for (let reviewer of ReviewList) {
      const reviewerInfo = await this.prisma.user.findFirst({
        where: {
          id: reviewer,
        },
      });
      emailMessage = `
      <p> Dear, ${reviewerInfo.firstname} </p>
      <p> 
      ${ownerInfo.username} has sent ${ObjectiveName} for your Review. Please click on the link to review and add your comments
      </p>
      <p>Here is the link <a href="${process.env.PROTOCOL}://${ownerInfo.organization.organizationName}.${process.env.REDIRECT}/objectiveform/${id}" target="_blank"> click here </a> </p>
      <p>Regards </p>
        <p> ${ownerInfo.firstname} ${ownerInfo.lastname} </p>
      `;
      const msg = {
        to: reviewerInfo.email, // Change to your recipient
        from: process.env.FROM, // Change to your verified sender
        subject: `Objective- ${ObjectiveName} for your review`,
        html: `<div>${emailMessage}</div>`,
      };
      // pendingPromises.push(sgMail.send(msg));
      const finalResult = await sgMail.send(msg);
    }
    return await Promise.all(pendingPromises);
  }
  async getMyObjectives(userid, query, randomNumber) {
    try {
      const page = query.page || 1; // Default to page 1 if not provided
      const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
      const skip = (page - 1) * limit;
      //  console.log('userid', userid);
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
        include: { organization: true },
      });
      this.logger.debug(
        `getMyObjectives service started for ${activeUser} with query ${query}`,
      );
      // console.log('activeuser', activeUser);
      const result = await this.objectiveMaster.find({
        $and: [
          { Owner: activeUser.id },
          { organizationId: activeUser.organization?.id },
          { ObjectivePeriod: query.year },
        ],
        offset: skip,
        limit: query.limit,
      });
      // console.log('Result', result);
      const finalResult = [];

      for (let value of result) {
        this.logger.debug(`processing obj ${value}`);
        // console.log('value', value);
        const ownerInfo = await this.prisma.user.findFirst({
          where: {
            id: value.Owner,
          },
          include: {
            entity: true,
            location: true,
          },
        });
        let parentObjectiveDetails;
        if (value.ParentObjective) {
          parentObjectiveDetails = await this.objectiveMaster.findById(
            new ObjectId(value.ParentObjective),
          );
        }
        const result = await this.kra.find({
          ObjectiveId: value._id,
        });
        const data1 = {
          _id: value._id,
          entityName: ownerInfo?.entity?.entityName || null,
          locationName: ownerInfo?.location?.locationName,
          ObjectiveName: value.ObjectiveName,
          ObjectiveId: value.ObjectiveId,
          ObjectiveCategory: value.ObjectiveCategory,
          ObjectiveYear: value.ObjectiveYear,
          Description: value.Description,
          ModifiedDate: value.ModifiedDate,
          createdAt: value?.createdAt,
          ModifiedBy: value.ModifiedBy,
          ObjectivePeriod: value.ObjectivePeriod,
          EntityTypeId: value.EntityTypeId,
          ObjectiveType: value.ObjectiveType,
          ObjectiveLinkedId: value.ObjectiveLinkedId,
          OrganizationId: value.OrganizationId,
          ObjectiveStatus: value.ObjectiveStatus,
          ObjectivedocStatus: value.ObjectivedocStatus,
          Readers: value.Readers,
          ReadersList: value.ReadersList,
          ReviewList: value.ReviewList,
          Objective: value.Objective,
          Owner: value.Owner,
          OwnerName: ownerInfo ? ownerInfo.username : '',
          OwnerShipType: value.OwnerShipType,
          OwnershipEntity: value.OwnershipEntity,
          MilestonePeriod: value.MilestonePeriod,
          Goals: value.Goals,
          ParentObjective: value.ParentObjective,
          parentObjectiveDetails: parentObjectiveDetails,
          Reason: value.Reason,
          reviwerAccess: false,
          kra: result,
          Scope: value.Scope,
          ScopeDetails: value.ScopeDetails,
          locationId: value.locationId,
          createdBy: value?.createdBy,

          ScopeType: value?.ScopeType,
          associatedKpis: value?.associatedKpis,
        };
        let ReaderAccess = false;
        let EditerAccess = false;
        let ReviwerAccess = false;

        switch (value.Readers) {
          case 'Organization':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value.OrganizationId === activeUser.organizationId) {
              ReaderAccess = true;
            }
            const resultData = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };

            finalResult.push(resultData);
            break;
          case 'Location(s)':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList?.includes(activeUser.locationId)) {
              ReaderAccess = true;
            }
            const resultData1 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData1);
            break;
          case 'Entity(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.entityId)) {
              ReaderAccess = true;
            }
            const resultData2 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData2);
            break;
          case 'User(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.id)) {
              ReaderAccess = true;
            }
            const resultData3 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData3);
            break;

          default:
            const resultData4 = {
              ...data1,
            };
            finalResult.push(resultData4);
            break;
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/myObjectives for ${activeUser.id} service successful`,
        '',
      );
      return { data: finalResult, length: finalResult.length };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/objective/myObjectives  service successful ${error}`,
        '',
      );
      throw new NotFoundException();
    }
  }
  async getAllKpisOfObjective(id, user, randomNumber) {
    try {
      this.logger.debug(`getallKpisofObjective started for ${id}`);
      const result = await this.kra
        .find({
          // ObjectiveId: id,

          objectiveCategories: id,
        })
        .select('associatedKpis');
      this.logger.debug(`fetched kpis ${result}`);

      let kpis = [];
      for (let kpi of result) {
        this.logger.debug(`processing ${kpi}`);
        const associatedKpis: any[] = kpi.associatedKpis;
        // console.log('associatedKpis', associatedKpis);
        if (associatedKpis && associatedKpis.length > 0) {
          for (let res of associatedKpis) {
            // console.log('res', res._id);
            this.logger.debug(`kpi ${res}`);
            const data = await this.KpiModel.findById(res._id);
            kpis.push(data);
          }
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllKpisforObjective for ${id} service successful`,
        '',
      );
      return kpis;
    } catch (error) {
      this.logger.error(
        `GET /api/kpidefintion/getAllKpisofObjective/${id} failed`,
      );
    }
  }
  async getAllDeptObjectivesForUnit(objid, randomNumber) {
    // console.log('objid', objid);
    try {
      this.logger.debug(`getallDeptObjectivesForUnit started for ${objid}`);
      const checkifParentObj = await this.objectiveMaster.find({
        // ScopeType:"Department",
        ParentObjective: objid,
      });
      this.logger.debug(`check if it is parent ${checkifParentObj}`);
      // console.log('checkif', checkifParentObj.length);
      let associatedKpis = [];
      if (checkifParentObj.length > 0) {
        for (let obj of checkifParentObj) {
          let kpis: any = obj.associatedKpis;
          for (let kpi of kpis) {
            associatedKpis.push(kpi);
          }
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllDeptKpisForUnitObj for ${objid} service successful`,
        '',
      );
      return associatedKpis;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} GET api/objective/getAllDeptKpisForUnitObj for ${objid} service failed ${error}`,
        '',
      );
      throw new NotFoundException();
    }
  }

  async getFilterListForObjectives(user, randomNumber) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true, location: true, entity: true },
      });
      this.logger.debug(`getFilterlsit started for ${activeuser}`);
      const objData = await this.objectiveMaster.find({
        OrganizationId: activeuser.organizationId,
      });

      let scopeType = [];
      let parentObjs = [];

      // unitIds = [],
      // entityIds = [],

      for (let value of objData) {
        this.logger.debug(`processing obj ${value}`);
        // console.log('origin', value.origin);
        if (value.ScopeType) {
          scopeType.push(value?.ScopeType);
        }
        if (value.ParentObjective) {
          parentObjs.push(value.ParentObjective);
        }

        // if (value.locationId) {
        //   unitIds.push(value.locationId);
        // }
        // if (value.entityId) {
        //   entityIds.push(value.entityId);
        // }
      }
      const uniqueStatus = Array.from(new Set(scopeType)); // Remove duplicates
      uniqueStatus.sort();
      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getFilterListForObjectives successful`,
        'cip.controller.ts',
      );
      const parentnames = await this.objectiveMaster
        .find({
          _id: { $in: parentObjs },
        })
        .sort({ ObjectiveName: 1 });
      // console.log('parent names', parentnames, parentObjs);
      return {
        scopeType: uniqueStatus,
        parentObj: parentnames,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/cara/getFilterListForObjectives failed ${error}`,
        'cip.controller.ts',
      );
    }
  }
  async getAllObjectivesForCopy(userId, query, randomNumber) {
    const page = query.page || 1; // Default to page 1 if not provided
    const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
    const skip = (page - 1) * limit;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
        organization: {
          select: {
            id: true,
          },
        },
      },
    });
    this.logger.debug(
      `getallObjectivesForCopy started for ${activeUser} with ${query}`,
    );

    try {
      let result, count;
      let condition: any = {
        OrganizationId: activeUser.organization.id,
        //locationId: query.locationId,
        ObjectivePeriod: query.year,
        ObjectiveStatus: 'Submit',
      };
      if (
        (query.searchText && query.searchText !== '') ||
        query.searchText !== null ||
        query.searchText !== undefined
      ) {
        condition.ObjectiveName = {
          $regex: new RegExp(query?.searchText, 'i'),
        };
      }
      if (query.locationId && query.locationId !== '') {
        condition.locationId = query.locationId;
      }
      if (query.entityId && query.entityId !== '') {
        if (query.entityId === 'All') {
          condition.ScopeType = 'Department';
        } else if (query.entityId === 'None') {
          condition.ScopeType = 'Unit';
        } else {
          condition.Scope = query.entityId;
          condition.ScopeType = 'Department';
        }
      }
      this.logger.debug(`conditon formed ${condition}`);
      result = await this.objectiveMaster
        .find(condition)
        .skip(skip)
        .limit(limit)
        .lean();
      count = await this.objectiveMaster.countDocuments(condition);
      this.logger.debug(`found ${count}`);
      // console.log('result', result);
      const finalResult = [];

      for (let value of result) {
        this.logger.debug(`processed value ${value}`);
        const ownerInfo = await this.prisma.user.findFirst({
          where: {
            id: value.Owner,
          },
          include: {
            entity: true,
            location: true,
          },
        });
        let parentObjectiveDetails;
        if (value.ParentObjective) {
          parentObjectiveDetails = await this.objectiveMaster.findById(
            new ObjectId(value.ParentObjective),
          );
        }
        const result = await this.kra.find({
          ObjectiveId: value._id,
        });
        const data1 = {
          _id: value._id,
          entityName: ownerInfo?.entity?.entityName || null,
          locationName: ownerInfo?.location?.locationName || null,
          ObjectiveName: value.ObjectiveName,
          ObjectiveId: value.ObjectiveId,
          ObjectiveCategory: value.ObjectiveCategory,
          ObjectiveYear: value.ObjectiveYear,
          Description: value.Description,
          ModifiedDate: value.ModifiedDate,
          ModifiedBy: value.ModifiedBy,
          ObjectivePeriod: value.ObjectivePeriod,
          EntityTypeId: value.EntityTypeId,
          ObjectiveType: value.ObjectiveType,
          ObjectiveLinkedId: value.ObjectiveLinkedId,
          OrganizationId: value.OrganizationId,
          ObjectiveStatus: value.ObjectiveStatus,
          ObjectivedocStatus: value.ObjectivedocStatus,
          Readers: value.Readers,
          ReadersList: value.ReadersList,
          ReviewList: value.ReviewList,
          Objective: value.Objective,
          Owner: value.Owner,
          OwnerName: ownerInfo ? ownerInfo.username : '',
          OwnerShipType: value.OwnerShipType,
          OwnershipEntity: value.OwnershipEntity,
          MilestonePeriod: value.MilestonePeriod,
          Goals: value.Goals,
          ParentObjective: value.ParentObjective,
          parentObjectiveDetails: parentObjectiveDetails,
          Reason: value.Reason,
          reviwerAccess: false,
          kra: result,
          Scope: value.Scope,
          ScopeType: value.ScopeType,
          ScopeDetails: value.ScopeDetails,
          locationId: value.locationId,
          createdBy: value?.createdBy,
          createdAt: value?.createdAt,
          associatedKpis: value?.associatedKpis,
        };
        let ReaderAccess = false;
        let EditerAccess = false;
        let ReviwerAccess = false;

        switch (value.Readers) {
          case 'Organization':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value.OrganizationId === activeUser.organizationId) {
              ReaderAccess = true;
            }
            const resultData = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };

            finalResult.push(resultData);
            break;
          case 'Location(s)':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList?.includes(activeUser.locationId)) {
              ReaderAccess = true;
            }
            const resultData1 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData1);
            break;
          case 'Entity(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.entityId)) {
              ReaderAccess = true;
            }
            const resultData2 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData2);
            break;
          case 'User(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.id)) {
              ReaderAccess = true;
            }
            const resultData3 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData3);
            break;

          default:
            const resultData4 = {
              ...data1,
            };
            finalResult.push(resultData4);
            break;
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllObjectMaster  service successful`,
        '',
      );
      return { data: finalResult, length: count };
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllObjectMaster  service failed ${error}`,
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

  async getAllObjectivesForSelect(userId, query, randomNumber) {
    const page = query.page || 1; // Default to page 1 if not provided
    const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
    const skip = (page - 1) * limit;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
        organization: {
          select: {
            id: true,
          },
        },
      },
    });
    this.logger.debug(
      `getallObjectivesForSelect started for ${activeUser} and query ${query}`,
    );
    // console.log('query', query);
    try {
      let result, count;
      let condition: any = {
        OrganizationId: activeUser.organization.id,
        //locationId: query.locationId,
        ObjectivePeriod: query.year,
        ObjectiveStatus: 'Submit',
      };
      if (
        (query.searchText && query.searchText !== '') ||
        query.searchText !== null ||
        query.searchText !== undefined
      ) {
        condition.ObjectiveName = {
          $regex: new RegExp(query?.searchText, 'i'),
        };
      }
      if (query.locationId && query.locationId !== '') {
        condition.locationId = query.locationId;
      }
      if (query.entityId && query.entityId !== '') {
        if (query.entityId === 'All') {
          condition.ScopeType = 'Department';
        } else {
          condition.Scope = query.entityId;
          condition.ScopeType = 'Department';
        }
      } else if (query.entityId === '') {
        condition.ScopeType = 'Unit';
      }
      this.logger.debug(`formed condition ${condition}`);
      result = await this.objectiveMaster
        .find(condition)
        .skip(skip)
        .limit(limit)
        .lean();
      count = await this.objectiveMaster.countDocuments(condition);
      // console.log('result', result);
      this.logger.debug(`found ${count}`);
      const finalResult = [];

      for (let value of result) {
        this.logger.debug(`processing value ${value}`);
        const ownerInfo = await this.prisma.user.findFirst({
          where: {
            id: value.Owner,
          },
          include: {
            entity: true,
            location: true,
          },
        });
        let parentObjectiveDetails;
        if (value.ParentObjective) {
          parentObjectiveDetails = await this.objectiveMaster.findById(
            new ObjectId(value.ParentObjective),
          );
        }
        const result = await this.kra.find({
          ObjectiveId: value._id,
        });
        const data1 = {
          _id: value._id,
          entityName: ownerInfo?.entity?.entityName || null,
          locationName: ownerInfo?.location?.locationName || null,
          ObjectiveName: value.ObjectiveName,
          ObjectiveId: value.ObjectiveId,
          ObjectiveCategory: value.ObjectiveCategory,
          ObjectiveYear: value.ObjectiveYear,
          Description: value.Description,
          ModifiedDate: value.ModifiedDate,
          ModifiedBy: value.ModifiedBy,
          ObjectivePeriod: value.ObjectivePeriod,
          EntityTypeId: value.EntityTypeId,
          ObjectiveType: value.ObjectiveType,
          ObjectiveLinkedId: value.ObjectiveLinkedId,
          OrganizationId: value.OrganizationId,
          ObjectiveStatus: value.ObjectiveStatus,
          ObjectivedocStatus: value.ObjectivedocStatus,
          Readers: value.Readers,
          ReadersList: value.ReadersList,
          ReviewList: value.ReviewList,
          Objective: value.Objective,
          Owner: value.Owner,
          OwnerName: ownerInfo ? ownerInfo.username : '',
          OwnerShipType: value.OwnerShipType,
          OwnershipEntity: value.OwnershipEntity,
          MilestonePeriod: value.MilestonePeriod,
          Goals: value.Goals,
          ParentObjective: value.ParentObjective,
          parentObjectiveDetails: parentObjectiveDetails,
          Reason: value.Reason,
          reviwerAccess: false,
          kra: result,
          Scope: value.Scope,
          ScopeType: value.ScopeType,
          ScopeDetails: value.ScopeDetails,
          locationId: value.locationId,
          createdBy: value?.createdBy,
          createdAt: value?.createdAt,
          associatedKpis: value?.associatedKpis,
        };
        let ReaderAccess = false;
        let EditerAccess = false;
        let ReviwerAccess = false;

        switch (value.Readers) {
          case 'Organization':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value.OrganizationId === activeUser.organizationId) {
              ReaderAccess = true;
            }
            const resultData = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };

            finalResult.push(resultData);
            break;
          case 'Location(s)':
            if (
              value?.ReviewList?.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList?.includes(activeUser.locationId)) {
              ReaderAccess = true;
            }
            const resultData1 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData1);
            break;
          case 'Entity(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.entityId)) {
              ReaderAccess = true;
            }
            const resultData2 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData2);
            break;
          case 'User(s)':
            if (
              value?.ReviewList.some((value) => value['id'] === activeUser.id)
            ) {
              ReviwerAccess = true;
            }
            if (value?.Owner === activeUser.id) {
              EditerAccess = true;
            }
            if (value?.ReadersList.includes(activeUser.id)) {
              ReaderAccess = true;
            }
            const resultData3 = {
              ...data1,
              ReaderAccess,
              ReviwerAccess,
              EditerAccess,
            };
            finalResult.push(resultData3);
            break;

          default:
            const resultData4 = {
              ...data1,
            };
            finalResult.push(resultData4);
            break;
        }
      }
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllObjectMaster  service successful`,
        '',
      );
      return { data: finalResult, length: count };
    } catch (error) {
      this.logger.log(
        `trace id=${randomNumber} GET api/objective/getAllObjectMaster  service failed ${error}`,
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
  async getEntitiesBasedOnRole(locationId, user, randomNumber) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true, location: true, entity: true },
      });
      this.logger.debug(`getEntitiesBasedOnRole started for ${activeuser}`);
      if (
        (user.kcRoles.roles.includes('MR') &&
          activeuser.locationId === locationId) ||
        user.kcRoles.roles.includes('ORG-ADMIN')
      ) {
        this.logger.debug(
          `if either MR for given location or user is org admin`,
        );
        let entities = await this.prisma.entity.findMany({
          where: {
            locationId: locationId,
          },
        });
        this.logger.log(
          `trace id = ${randomNumber} GET api/objective/getEntitiesBasedOnRole/${locationId} successful`,
          '',
        );
        return entities;
      } else {
        this.logger.debug(
          `entities for given location and userid in users array`,
        );
        const entities = await this.prisma.entity.findMany({
          where: {
            locationId: locationId,
            users: {
              hasSome: [activeuser.id],
            },
          },
        });
        this.logger.log(
          `trace id = ${randomNumber} GET api/objective/getEntitiesBasedOnRole/${locationId} successful`,
          '',
        );
        return entities;
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/objective/getEntitiesBasedOnRole failed ${error}`,
        '',
      );
    }
  }

  //api to get objectiveids for a given category in dashboard filter
  async getObjectivesForCategory(query, userid, randomNumber) {
    try {
      // console.log('query', query);
      this.logger.debug(
        `getObjectivesForCategory service started for ${query}`,
      );
      const result = await this.objectiveMaster
        .find({
          ObjectiveCategory: { $in: query.categoryId },
        })
        .exec();

      this.logger.log(
        `trace id = ${randomNumber} GET api/objective/getObjectivesForCategory successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/objective/getObjectivesForCategory failed ${error}`,
        '',
      );
    }
  }
}
