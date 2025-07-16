import {
  BadRequestException,
  ConflictException,
  Controller,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { cara } from './schema/cara.schema';
// import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { cara_settings } from './schema/cara-setting.schema';
import { CaraComments } from './schema/cara-comments.schema';

import {
  sendMailToDeptHead,
  sendMailToDeptHeadForClosure,
  sendMailToDeptHeadToApprove,
  sendMailToCapaInitiatorOnClosure,
  sendMailToCapaInitiatorOnReject,
  sendMailToCapaOwnerOnChange,
  sendMailToExecutiveForClosure,
} from './email.helper';
import { EmailService } from 'src/email/email.service';

import { RefsService } from 'src/refs/refs.service';

import { SerialNumberService } from 'src/serial-number/serial-number.service';

import { OrganizationService } from 'src/organization/organization.service';
import { ObjectId } from 'mongodb';
import { ActionItems } from 'src/actionitems/schema/actionitems.schema';
import { CaraCapaOwner } from './schema/cara-capaowner.schema';

import {
  MailTemplate,
  mailTemplateSchema,
} from 'src/mailtemplate/schema/mailTemplate.schema';
import * as sgMail from '@sendgrid/mail';
import { Analyse } from './schema/analyse.schema';
import { CaraDefects } from './schema/cara-defects.schema';
import { CaraRcaSettings } from './schema/cara-rca-settings.schema';
import { WorkflowSettings } from './schema/workflowSettitngs.schema';
import { Impact } from 'src/audit-settings/schema/impact.schema';
import { License } from 'src/license/schema/license.schema';
sgMail.setApiKey(
  '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',
);

// import auditTrial from '../watcher/changesStream';

@Injectable()
@Controller('/api/cara')
export class CaraService {
  constructor(
    @InjectModel(cara.name) private caraModel: Model<cara>,
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(cara_settings.name) private carasettings: Model<cara_settings>,
    @InjectModel(CaraComments.name) private capacomments: Model<CaraComments>,
    @InjectModel(Analyse.name) private analysisModel: Model<CaraComments>,
    @InjectModel(CaraDefects.name) private capaDefects: Model<CaraDefects>,
    @InjectModel(CaraRcaSettings.name)
    private capaRcaSettings: Model<CaraRcaSettings>,
    @InjectModel(CaraCapaOwner.name)
    private caraownermodel: Model<CaraCapaOwner>,
    @InjectModel(ActionItems.name) private actionItemModel: Model<ActionItems>,
    @InjectModel(MailTemplate.name) private mailTemplates: Model<MailTemplate>,
    @InjectModel(WorkflowSettings.name)
    private workflowModel: Model<WorkflowSettings>,
    @InjectModel(Impact.name)
    private impactModel: Model<Impact>,
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
    private readonly organizationService: OrganizationService,
    private readonly serialNumberService: SerialNumberService,
    @InjectModel(License.name)
    private readonly licenseModel: Model<License>,
    private refsService: RefsService,
    private readonly emailService: EmailService,
  ) {}
  async createCara(data, userid, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} → Starting createCara`,
        'Cara-controller',
      );

      let serialNumber;
      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid.id },
        include: { organization: true, location: true },
      });

      this.logger.debug(
        `trace id = ${randomNumber} → Fetched active user ${activeuser?.id}`,
        'Cara-controller',
      );

      const {
        origin,
        kpiId,
        startDate,
        endDate,
        description,
        date,
        year,
        organizationId,
        registeredBy,
        locationId,
        entityId,
        entity,
        systemId,
        title,
        type,
        status,
        registerfiles,
        refsData,
        caraCoordinator,
        productId,
        defectType,
      } = data.payload;

      serialNumber = await this.serialNumberService.generateSerialNumber({
        moduleType: 'CAPA',
        location: locationId,
        entity: entity,
        year: year.toString(),
        createdBy: activeuser?.id,
        organizationId: activeuser.organization.id,
      });

      this.logger.debug(
        `trace id = ${randomNumber} → Generated serialNumber: ${serialNumber}`,
        'Cara-controller',
      );

      if (!serialNumber) {
        this.logger.error(
          `trace id = ${randomNumber} → Serial number generation failed`,
          'Cara-controller',
        );
        return new ConflictException({ status: 409 });
      }

      const coordinator = await this.prisma.user.findFirst({
        where: { id: caraCoordinator },
      });

      this.logger.debug(
        `trace id = ${randomNumber} → Fetched coordinator ${coordinator?.id}`,
        'Cara-controller',
      );

      const mappedserialNumber = await this.mapserialnumber(
        serialNumber,
        locationId,
        entityId,
        activeuser.organization.id,
      );

      this.logger.debug(
        `trace id = ${randomNumber} → Mapped serialNumber: ${mappedserialNumber}`,
        'Cara-controller',
      );

      const analysisLevel = await this.capaRcaSettings.findOne({
        locationId: locationId,
      });

      this.logger.debug(
        `trace id = ${randomNumber} → Analysis level: ${analysisLevel?.analysisType}`,
        'Cara-controller',
      );

      const result = await this.caraModel.create({
        origin,
        kpiId,
        startDate,
        endDate,
        description,
        date,
        year,
        analysisLevel: analysisLevel?.analysisType || 'Basic',
        organizationId: activeuser.organization.id,
        locationId,
        entityId: entityId ?? entity,
        systemId,
        registeredBy: activeuser.id,
        title,
        type,
        serialNumber: mappedserialNumber,
        status,
        caraCoordinator,
        registerfiles,
        productId,
        defectType,
      });

      this.logger.debug(
        `trace id = ${randomNumber} → CAPA created with id ${result._id}`,
        'Cara-controller',
      );

      const originname = await this.carasettings
        .findById(new ObjectId(result?.origin))
        .select('deviationType');

      this.logger.debug(
        `trace id = ${randomNumber} → Fetched origin name: ${originname?.deviationType}`,
        'Cara-controller',
      );

      // Send notification
      sendMailToDeptHead(
        coordinator,
        result,
        originname?.deviationType,
        activeuser,
        this.emailService.sendEmail,
      );
      this.logger.debug(
        `trace id = ${randomNumber} → Email sent to coordinator`,
        'Cara-controller',
      );

      // Insert references
      if (refsData && refsData.length > 0) {
        const refs = refsData.map((ref: any) => ({ ...ref, refTo: result.id }));
        const createRefs = await this.refsService.create(refs);
        this.logger.debug(
          `trace id = ${randomNumber} → Reference records created`,
          'Cara-controller',
        );
      }

      this.logger.log(
        `trace id = ${randomNumber} POST /api/cara/createCara successful`,
        'Cara-controller',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/cara/createCara failed: ${error.message}`,
        'Cara-controller',
      );
      return error;
    }
  }

  async getCaraById(id, userid, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} → Fetching CARA by ID: ${id}`,
        'Cara-controller',
      );

      const data = {};
      let owner;

      const cara: any = await this.caraModel.findById(id);
      this.logger.debug(
        `trace id = ${randomNumber} → Found CARA record`,
        'Cara-controller',
      );

      const entity = await this.prisma.entity.findFirst({
        where: { id: cara.entityId },
      });

      this.logger.debug(
        `trace id = ${randomNumber} → Entity fetched: ${entity?.id}`,
        'Cara-controller',
      );

      let coordinator;
      if (!!cara.caraCoordinator && cara.caraCoordinator !== undefined) {
        coordinator = await this.prisma.user.findFirst({
          where: { id: cara.caraCoordinator },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatar: true,
            email: true,
          },
        });
        this.logger.debug(
          `trace id = ${randomNumber} → Coordinator fetched: ${coordinator?.id}`,
          'Cara-controller',
        );
      }

      const user: any = await this.prisma.user.findFirst({
        where: { id: cara.registeredBy },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          username: true,
          avatar: true,
          email: true,
        },
      });
      this.logger.debug(
        `trace id = ${randomNumber} → Registered user fetched: ${user?.id}`,
        'Cara-controller',
      );

      if (cara.caraOwner !== undefined || cara.caraOwner === '') {
        owner = await this.prisma.user.findFirst({
          where: { id: cara.caraOwner },
        });
        this.logger.debug(
          `trace id = ${randomNumber} → Owner fetched: ${owner?.id}`,
          'Cara-controller',
        );
      }

      const location = await this.prisma.location.findFirst({
        where: { id: cara.locationId },
        select: {
          id: true,
          locationId: true,
          locationName: true,
        },
      });

      const systemIds = cara.systemId;
      let systems = [];

      if (systemIds.length > 0) {
        systems = await this.SystemModel.find(
          { _id: { $in: systemIds } },
          { _id: 1, name: 1 },
        );
        this.logger.debug(
          `trace id = ${randomNumber} → Systems fetched: ${systems.length}`,
          'Cara-controller',
        );
      }
      const impactytpe = await this.impactModel
        .findById(cara.impactType)
        .select('impactType');
      // const depthead = await this.getDeptHeadForEntity(cara.entityId);
      const origin: any = await this.carasettings.findById(cara?.origin);
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: cara.organizationId,
        },
      });

      const data1 = {
        _id: cara._id,
        title: cara.title,
        organizationId: cara.organizationId,
        kpiId: cara.kpiId,
        registeredBy: user,
        caraCoordinator: coordinator,
        caraOwner: owner
          ? {
              id: owner.id,
              name: owner.firstname + '' + owner.lastname,
              email: owner.email,
            }
          : {},
        date: cara?.date,
        kpiReportLink: cara?.kpiReportLink,
        locationId: cara?.locationId,
        locationDetails: location,
        entityId: entity,
        systemId: systems,
        status: cara.status,
        description: cara?.description,
        origin: origin,
        createdAt: cara.createdAt?.$date
          ? new Date(cara.createdAt.$date)
          : cara.createdAt,
        startDate: cara?.date?.startDate,
        endDate: cara?.date?.endDate,
        rootCauseAnalysis: cara?.rootCauseAnalysis,
        actualCorrectiveAction: cara?.actualCorrectiveAction,
        containmentAction: cara?.containmentAction,
        actionPointOwner: cara?.actionPointOwner,
        correctiveAction: cara?.correctiveAction,
        deviationType: cara?.deviationType,
        targetDate: cara?.targetDate,
        correctedDate: cara?.correctedDate,
        // deptHead: depthead,
        files: cara.files,
        attachments: cara?.attachments,
        registerfiles: cara?.registerfiles,
        type: cara?.type,
        serialNumber: cara?.serialNumber,
        comments: cara?.comments ? cara.comments : '',
        why1: cara?.why1,
        why2: cara?.why2,
        why3: cara?.why3,
        why4: cara?.why4,
        why5: cara?.why5,
        man: cara?.man,
        material: cara?.material,
        measurement: cara?.measurement,
        method: cara?.method,
        environment: cara?.environment,
        machine: cara?.machine,
        outcome: cara?.outcome,
        analysisLevel: cara?.analysisLevel,
        onePointLesson: cara?.onePointLesson,
        referenceComments: cara?.referenceComments,
        analysisId: cara?.analysisId,
        referenceAttachments: cara?.referenceAttachments,
        productId: cara?.productId,
        defectType: cara?.defectType,
        impactType: impactytpe?.impactType,
        impact: cara.impact,
        highPriority: cara?.highPriority,
        organizationName: organization.realmName,
      };

      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getCaraById/${id} successful`,
        'Cara-controller',
      );

      return data1;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getCaraById/${id} failed: ${error.message}`,
        'Cara-controller',
      );
      throw error;
    }
  }

  async updateCara(id, data, userid, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} → Begin updateCara for ID: ${id}`,
        'Cara-controller',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid.id },
        include: {
          // location: true,
          organization: true,
        },
      });

      this.logger.debug(`Active user: ${activeuser?.id}`, 'Cara-controller');

      const caratobeupdated: any = await this.caraModel.findById(id);
      this.logger.debug(
        `Existing CARA fetched: analysisLevel=${caratobeupdated.analysisLevel}`,
        'Cara-controller',
      );

      let caraowner;
      if (
        typeof data.caraOwner === 'object' &&
        data.caraOwner !== null &&
        data.status === 'Accepted'
      ) {
        caraowner = data.caraOwner.id;
        this.logger.debug(
          `CARA owner derived from object: ${caraowner}`,
          'Cara-controller',
        );
      } else if (
        typeof data.caraOwner !== 'object' ||
        typeof data.caraOwner === 'string'
      ) {
        caraowner = data.caraOwner || activeuser.id;
        this.logger.debug(
          `CARA owner derived from string/fallback: ${caraowner}`,
          'Cara-controller',
        );
      }

      // === Validation for Outcome_In_Progress with Advanced analysis ===
      if (
        data.status === 'Outcome_In_Progress' &&
        caratobeupdated.analysisLevel === 'Advanced'
      ) {
        this.logger.debug(
          `Checking analysis completion for Advanced level`,
          'Cara-controller',
        );

        if (!caratobeupdated.analysisId) {
          this.logger.warn(`Analysis ID missing`, 'Cara-controller');
          return new NotFoundException({ status: 404 });
        }

        const analysis: any = await this.analysisModel.findOne({ capaId: id });
        if (!analysis) {
          return new NotFoundException({
            status: 404,
            message: 'Analysis not found',
          });
        }

        const fishBone = JSON.parse(JSON.stringify(analysis.fishBone || {}));
        const rootCause = JSON.parse(JSON.stringify(analysis.rootCause || {}));

        const hasValidFishBone = Object.entries(fishBone)
          .filter(([key]) => key !== '_id')
          .some(
            ([category, items]) =>
              Array.isArray(items) && items.some((item) => item?.checked),
          );

        const isRootCauseEmpty = Object.entries(rootCause)
          .filter(([key]) => key !== '_id')
          .every(
            ([whyKey, value]) =>
              !Array.isArray(value) ||
              value.length === 0 ||
              value.every((v) => typeof v !== 'string' || v.trim() === ''),
          );

        if (isRootCauseEmpty && !hasValidFishBone) {
          this.logger.warn(
            `Fishbone/Root Cause data missing for Outcome_In_Progress`,
            'Cara-controller',
          );
          return new BadRequestException({
            status: 400,
            message:
              'Please provide data for Fishbone, Root Cause, or Causes before submitting.',
          });
        }
      }

      // === Validation for Closed CAPA with advanced level ===
      if (
        data.status === 'Closed' &&
        caratobeupdated.analysisLevel === 'Advanced'
      ) {
        const outcomes = caratobeupdated?.outcome || [];
        if (outcomes.length <= 0) {
          return new InternalServerErrorException({
            status: 500,
            message: `No Outcome found.`,
          });
        }

        const dataPromises = outcomes.map(async (item) => {
          if (item.applicable) {
            try {
              const apiResponse = await this.actionItemModel.findById(item?.id);
              return { ...item, data: apiResponse };
            } catch {
              return { ...item, data: null };
            }
          } else {
            return { ...item, data: null };
          }
        });

        const results = await Promise.all(dataPromises);
        const invalidItem = results.find(
          (item) => item.applicable && item.data?.status !== false,
        );
        if (invalidItem) {
          return new InternalServerErrorException({
            status: 500,
            message: `One or more action items are not marked as completed. Please ensure all applicable items are closed.`,
          });
        }
      }

      // === Update logic ===
      const data1 = {
        title: data.title,
        type: data.type,
        origin: data.origin?._id,
        kpiId: data.kpiId,
        kpiReportLink: data.kpiReportLink,
        startDate: data.startDate,
        endDate: data.endDate,
        date: data.date,
        entityId: data.entityId,
        locationId: data.locationId,
        systemId: data.systemId,
        description: data.description,
        rootCauseAnalysis: data.rootCauseAnalysis,
        targetDate: data.targetDate,
        actualCorrectiveAction: data.actualCorrectiveAction,
        correctedDate: data.correctedDate,
        status: data.status,
        correctiveAction: data.correctiveAction,
        caraOwner:
          data.status === 'Accepted' && !caraowner ? activeuser?.id : caraowner,
        comments: data.comments,
        files: data.files,
        registerfiles: data.registerfiles,
        containmentAction: data.containmentAction,
        attachments: data.attachments,
        serialNumber: data.serialNumber,
        caraCoordinator: data.caraCoordinator,
        man: data.man,
        material: data.material,
        machine: data.machine,
        method: data.method,
        measurement: data.measurement,
        environment: data.environment,
        why1: data.why1,
        why2: data.why2,
        why3: data.why3,
        why4: data.why4,
        why5: data.why5,
        outcome: data.outcome,
        onePointLesson: data.onePointLesson,
        referenceComments: data.referenceComments,
        referenceAttachments: data.referenceAttachments,
        productId: data.productId,
        defectType: data.defectType,
      };

      this.logger.debug(`Final update payload ready`, 'Cara-controller');
      const beforeUpdate = await this.caraModel.findById(id);
      const update = await this.caraModel.findByIdAndUpdate(id, data1);
      const updated = await this.caraModel.findById(update._id);

      const co = await this.prisma.user.findFirst({
        where: { id: update.caraOwner },
        include: { organization: true },
      });
      const cordinator = await this.prisma.user.findFirst({
        where: { id: updated.caraCoordinator },
      });

      const originname = await this.carasettings
        .findById(new ObjectId(updated?.origin))
        .select('deviationType');

      // === Notification logic ===
      if (
        updated.correctiveAction &&
        updated.targetDate &&
        updated.rootCauseAnalysis &&
        updated.status === 'Analysis_In_Progress'
      ) {
        sendMailToDeptHeadToApprove(
          cordinator,
          updated,
          co,
          this.emailService.sendEmail,
        );
      }

      if (
        updated.actualCorrectiveAction &&
        updated.correctedDate &&
        updated.status === 'Outcome_In_Progress'
      ) {
        sendMailToDeptHeadForClosure(
          cordinator,
          updated,
          co,
          this.emailService.sendEmail,
        );
      }

      if (updated.status === 'Open') {
        sendMailToDeptHead(
          cordinator,
          updated,
          originname?.deviationType,
          activeuser,
          this.emailService.sendEmail,
        );
      }

      const registeredBy = await this.prisma.user.findFirst({
        where: { id: update.registeredBy },
      });

      if (updated.status === 'Closed') {
        sendMailToCapaInitiatorOnClosure(
          registeredBy,
          updated,
          activeuser,
          this.emailService.sendEmail,
        );
      }

      if (updated.status === 'Rejected') {
        sendMailToCapaInitiatorOnReject(
          registeredBy,
          updated,
          activeuser,
          this.emailService.sendEmail,
        );
      }

      // === Refs update ===
      if (data.refsData && data.refsData.length > 0) {
        const refs = data.refsData.map((ref: any) => ({ ...ref, refTo: id }));
        const updateRefs = await this.refsService.update({
          refs: refs,
          id: id,
        });
        this.logger.debug(
          `Updated ${updateRefs?.length || 0} refs`,
          'Cara-controller',
        );
      }

      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/updateCara/${id} successful`,
        'Cara-controller',
      );

      return update;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} /api/cara/updateCara/${id} failed: ${error.message}`,
        data,
      );
      throw error;
    }
  }

  async updateCaraForOutcome(id, data) {
    try {
      this.logger.debug(
        `PATCH /api/cara/updateCaraForOutcome/${id} - Incoming data: ${JSON.stringify(
          data,
        )}`,
        'Cara-controller',
      );

      const res = await this.caraModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true },
      );

      if (!res) {
        this.logger.warn(
          `/api/cara/updateCaraForOutcome/${id} - No CARA found to update`,
          'Cara-controller',
        );
        return null;
      }

      this.logger.log(
        `/api/cara/updateCaraForOutcome/${id} successful - Updated fields: ${Object.keys(
          data,
        ).join(', ')}`,
        'Cara-controller',
      );

      return res;
    } catch (error) {
      this.logger.error(
        `/api/cara/updateCaraForOutcome/${id} failed - Error: ${error.message}`,
        data,
      );
      throw error;
    }
  }

  async deleteCara(id, userid, uuid) {
    try {
      this.logger.debug(
        `trace id = ${uuid} DELETE /api/cara/deleteCara/${id} - Request initiated by user ${userid?.id}`,
        'Cara-controller',
      );

      // Attempt soft delete instead of hard delete? Uncomment if needed:
      // const result = await this.caraModel.findByIdAndUpdate(id, { deleted: true }, { new: true });

      const result = await this.caraModel.findByIdAndDelete(id);

      if (!result) {
        this.logger.warn(
          `trace id = ${uuid} DELETE /api/cara/deleteCara/${id} - No CARA found with this ID`,
          'Cara-controller',
        );
        return null;
      }

      this.logger.log(
        `trace id = ${uuid} DELETE /api/cara/deleteCara/${id} - Deletion successful`,
        'Cara-controller',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} DELETE /api/cara/deleteCara/${id} - Failed with error: ${error.message}`,
        'Cara-controller',
      );
      throw error;
    }
  }

  async getAllCara(query, user, randomNumber) {
    try {
      this.logger.debug(
        `Trace ID = ${randomNumber} - getAllCara called with query: ${JSON.stringify(
          query,
        )}`,
        'Cara-controller',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });

      const page = query.page || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      this.logger.debug(
        `Pagination - Page: ${page}, Limit: ${limit}, Skip: ${skip}`,
        'Cara-controller',
      );

      let filterCriteria: any = {
        organizationId: activeuser.organizationId,
        year: query.currentYear,
      };

      if (query.locationId !== 'All')
        filterCriteria.locationId = query.locationId;
      if (query.entityId !== 'All') filterCriteria.entityId = query.entityId;
      if (query.selectedOrigin && query.selectedOrigin.length > 0) {
        filterCriteria.origin = { $in: query.selectedOrigin };
      }
      if (query.selectedOwner && query.selectedOwner.length > 0) {
        filterCriteria.caraOwner = { $in: query.selectedOwner };
      }
      if (query.selectedStatus && query.selectedStatus.length > 0) {
        filterCriteria.status = { $in: query.selectedStatus };
      }

      if (query.selectedUnit && query.selectedUnit.length > 0) {
        filterCriteria.locationId = { $in: query.selectedUnit };
      }

      if (query.selectedEntity && query.selectedEntity.length > 0) {
        filterCriteria.entityId = { $in: query.selectedEntity };
      }

      this.logger.debug(
        `Filter Criteria: ${JSON.stringify(filterCriteria)}`,
        'Cara-controller',
      );

      this.logger.debug(
        `Filter Criteria: ${JSON.stringify(filterCriteria)}`,
        'Cara-controller',
      );

      // Fetching Impact Types and mapping to their names (Convert _id to string)
      const impactTypes = await this.impactModel.find({
        organizationId: activeuser.organizationId,
      });
      const impactTypeMap = impactTypes.reduce((acc, impactType: any) => {
        acc[impactType._id.toString()] = impactType.impactType; // Convert ObjectId to string
        return acc;
      }, {} as { [key: string]: string });
      // console.log('impactype map', impactTypeMap);
      const result: any = await this.caraModel
        .find(filterCriteria)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const count = await this.caraModel.countDocuments(filterCriteria);

      const dataPromises = result.map(async (cara) => {
        // Batch queries for each cara
        this.logger.debug(`processing ${cara}`);
        const [
          actionItem,
          entity,
          origin,
          userRegistered,
          cordinator,
          owner,
          location,
          systems,
          deptHead,
        ] = await Promise.all([
          this.actionItemModel.find({
            organizationId: activeuser.organizationId,
            source: 'CAPA',
            referenceId: cara._id,
          }),
          this.prisma.entity.findFirst({
            where: { id: cara.entityId },
            select: { id: true, entityId: true, entityName: true },
          }),
          this.carasettings.findById(cara?.origin),
          this.prisma.user.findFirst({
            where: { id: cara.registeredBy },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              avatar: true,
              email: true,
            },
          }),
          this.prisma.user.findFirst({
            where: { id: cara.caraCoordinator },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              avatar: true,
              email: true,
            },
          }),
          cara.caraOwner
            ? this.prisma.user.findFirst({
                where: { id: cara.caraOwner, organizationId: query.orgid },
              })
            : null,
          this.prisma.location.findFirst({
            where: { id: cara.locationId },
            select: { id: true, locationId: true, locationName: true },
          }),
          cara?.systemId.length > 0
            ? this.SystemModel.find(
                { _id: { $in: cara.systemId } },
                { _id: 1, name: 1 },
              )
            : [],
          this.getDeptHeadForEntity(cara.entityId),
        ]);

        const impactTypeName = impactTypeMap[cara?.impactType] || null;
        // console.log('impactname', impactTypeName);
        const highPriority = cara?.highPriority || false;

        return {
          _id: cara._id,
          title: cara.title,
          organizationId: cara.organizationId,
          kpiId: cara.kpiId,
          registeredBy: userRegistered,
          caraCoordinator: cordinator,
          caraOwner: cara.caraOwner
            ? {
                id: owner.id,
                firstname: owner.firstname,
                lastname: owner.lastname,
                email: owner.email,
              }
            : {},
          date: cara?.date,
          kpiReportLink: cara?.kpiReportLink,
          locationId: cara?.locationId,
          locationDetails: location,
          entityId: entity,
          systemId: systems,
          status: cara.status,
          description: cara?.description,
          origin: origin,
          analysisLevel: cara?.analysisLevel,
          startDate: cara.date?.startDate,
          endDate: cara.date?.endDate,
          year: cara.year,
          type: cara?.type,
          actionPointOwner: cara?.actionPointOwner,
          correctiveAction: cara?.correctiveAction,
          rootCauseAnalysis: cara?.rootCauseAnalysis,
          actualCorrectiveAction: cara?.actualCorrectiveAction,
          deviationType: cara?.deviationType,
          targetDate: cara?.targetDate,
          containmentAction: cara?.containmentAction,
          correctedDate: cara?.correctedDate,
          deptHead: deptHead,
          files: cara?.files,
          registerfiles: cara?.registerfiles,
          attachments: cara?.attachments,
          serialNumber: cara?.serialNumber,
          comments: cara?.comments || '',
          actionItem: actionItem,
          createdAt: cara.createdAt?.$date
            ? new Date(cara.createdAt.$date)
            : cara.createdAt,
          why1: cara?.why1,
          why2: cara?.why2,
          why3: cara?.why3,
          why4: cara?.why4,
          why5: cara?.why5,
          man: cara?.man,
          material: cara?.material,
          measurement: cara?.measurement,
          method: cara?.method,
          environment: cara?.environment,
          machine: cara?.machine,
          outcome: cara?.outcome,
          onePointLesson: cara?.onePointLesson,
          referenceComments: cara?.referenceComments,
          analysisId: cara?.analysisId,
          referenceAttachments: cara?.referenceAttachments,
          productId: cara?.productId,
          defectType: cara?.defectType,
          impactType: impactTypeName,
          impact: cara?.impact,
          highPriority: highPriority,
        };
      });

      // Wait for all promises to resolve
      const data = await Promise.all(dataPromises);

      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getAllCara successful`,
        'Cara-controller',
      );

      return { data: data, count: count };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getAllCara failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async getUsersOfEntity(entityId, randomNumber) {
    try {
      this.logger.debug(
        `Trace ID = ${randomNumber} - getUsersOfEntity called with entityId: ${entityId}`,
        'Cara-controller',
      );

      if (entityId !== 'undefined') {
        const users = await this.prisma.entity.findFirst({
          where: { id: entityId },
        });

        this.logger.debug(
          `Entity fetched: ${JSON.stringify(users)}`,
          'Cara-controller',
        );

        let usersArray = [];

        for (let user of users.users) {
          this.logger.debug(
            `Fetching user details for userId: ${user}`,
            'Cara-controller',
          );

          const userDetails = await this.prisma.user.findUnique({
            where: { id: user },
          });

          this.logger.debug(
            `User details fetched: ${JSON.stringify(userDetails)}`,
            'Cara-controller',
          );

          usersArray.push(userDetails);
        }

        let otherUsersForEntity = await this.prisma.user.findMany({
          where: {
            entityId: entityId,
          },
        });

        this.logger.debug(
          `Other users fetched for entity ${entityId}: Count = ${otherUsersForEntity.length}`,
          'Cara-controller',
        );

        this.logger.log(
          `trace id = ${randomNumber} GET /api/cara/getAllUsersOfEntity/${entityId} successful`,
          'Cara-controller',
        );

        return { deptHead: usersArray, otherUsers: otherUsersForEntity };
      } else {
        this.logger.warn(
          `trace id = ${randomNumber} GET /api/cara/getAllUsersOfEntity failed - entityId is undefined`,
          'Cara-controller',
        );
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getAllUsersOfEntity/${entityId} failed: ${error.message}`,
        error.stack,
      );
    }
  }

  async getDeptHeadForEntity(id) {
    try {
      this.logger.debug(
        `getDeptHeadForEntity called with entityId: ${id}`,
        'Cara-controller',
      );

      if (id != undefined) {
        const users = await this.prisma.entity.findFirst({
          where: { id: id },
          include: {
            organization: true,
          },
        });

        this.logger.debug(
          `Fetched entity: ${JSON.stringify(users)}`,
          'Cara-controller',
        );

        let usersArray = [];

        if (users?.users?.length > 0) {
          for (let user of users.users) {
            this.logger.debug(
              `Fetching user details for userId: ${user}`,
              'Cara-controller',
            );

            const userDetails = await this.prisma.user.findUnique({
              where: { id: user },
              include: {
                organization: true,
              },
            });

            this.logger.debug(
              `User details: ${JSON.stringify(userDetails)}`,
              'Cara-controller',
            );

            usersArray.push(userDetails);
          }
        } else {
          this.logger.warn(
            `No users found for entity ${id}`,
            'Cara-controller',
          );
        }

        this.logger.log(
          `GET /api/cara/getDeptHeadForEntity/${id} successful`,
          'Cara-controller',
        );

        return usersArray;
      } else {
        this.logger.warn(
          `getDeptHeadForEntity called with undefined id`,
          'Cara-controller',
        );
        return 'entityid not found';
      }
    } catch (error) {
      this.logger.error(
        `GET /api/cara/getDeptHeadForEntity/${id} failed: ${error.message}`,
        error.stack,
      );
    }
  }

  async createDeviationType(data, user, randomNumber) {
    try {
      this.logger.debug(
        `createDeviationType called with data: ${JSON.stringify(data)}, user: ${
          user.id
        }`,
        'Cara-service',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });

      this.logger.debug(
        `Active user fetched: ${JSON.stringify(activeuser)}`,
        'Cara-service',
      );

      const originexists = await this.carasettings.find({
        deviationType: { $regex: new RegExp(`^${data?.deviationType}$`, 'i') },
        organizationId: activeuser.organizationId,
      });

      this.logger.debug(
        `Existing deviation types matched: ${JSON.stringify(originexists)}`,
        'Cara-service',
      );

      if (originexists.length > 0) {
        this.logger.error(
          `DeviationType "${data?.deviationType}" already exists for organization ${activeuser.organization.id}`,
          'Cara-service',
        );
        return new ConflictException();
      }

      const result = await this.carasettings.create(data);

      this.logger.log(
        `trace id = ${randomNumber} POST api/cara/createDeviationType successful`,
        'Cara-service',
      );
      this.logger.debug(
        `Created deviationType entry: ${JSON.stringify(result)}`,
        'Cara-service',
      );

      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.warn(
          `ConflictException triggered for deviationType: ${data?.deviationType}`,
          'Cara-service',
        );
        throw error;
      }

      this.logger.error(
        `trace id = ${randomNumber} POST api/cara/createDeviationType failed: ${error.message}`,
        error.stack,
      );

      return error;
    }
  }

  async updateDeviationType(id, data, user, randomNumber) {
    try {
      this.logger.debug(
        `updateDeviationType called with id: ${id}, data: ${JSON.stringify(
          data,
        )}, user: ${user?.id}`,
        'Cara-service',
      );

      const result = await this.carasettings.findByIdAndUpdate(id, data);

      this.logger.log(
        `trace id = ${randomNumber} PUT api/cara/updateDeviationType/${id} successful for payload ${JSON.stringify(
          data,
        )}`,
        'Cara-service',
      );

      this.logger.debug(
        `Updated deviationType result: ${JSON.stringify(result)}`,
        'Cara-service',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} PUT api/cara/updateDeviationType/${id} failed. Error: ${error.message}`,
        error.stack || 'No stack trace',
      );

      this.logger.debug(
        `Failed payload: ${JSON.stringify(data)}`,
        'Cara-service',
      );

      return error;
    }
  }

  async getDeviationType(id, randomNumber) {
    try {
      this.logger.debug(
        `getDeviationType called with id: ${id}`,
        'Cara-service',
      );

      const result = await this.carasettings.findById(id);

      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getDeviationType/${id} successful`,
        'Cara-service',
      );

      this.logger.debug(
        `Deviation type result: ${JSON.stringify(result)}`,
        'Cara-service',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/cara/getDeviationType/${id} failed: ${error.message}`,
        error.stack || 'No stack trace',
      );

      return error;
    }
  }

  async deleteDeviationType(id, user, randomNumber) {
    try {
      this.logger.debug(
        `deleteDeviationType called with id: ${id}, user: ${JSON.stringify(
          user,
        )}`,
        'Cara-service',
      );

      const result = await this.carasettings.findByIdAndDelete(id);

      this.logger.log(
        `trace id = ${randomNumber} DELETE api/cara/deleteDeviationType/${id} successful`,
        'Cara-service',
      );

      this.logger.debug(
        `Deleted deviationType document: ${JSON.stringify(result)}`,
        'Cara-service',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} DELETE api/cara/deleteDeviationType/${id} failed: ${error.message}`,
        error.stack || 'No stack trace',
      );
      return error;
    }
  }

  async getAllDeviationType(user, randomNumber, query) {
    try {
      this.logger.debug(
        `getAllDeviationType called with user: ${JSON.stringify(
          user,
        )}, query: ${JSON.stringify(query)}`,
        'Cara-service',
      );

      const page = query.page || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      this.logger.debug(
        `Pagination - page: ${page}, limit: ${limit}, skip: ${skip}`,
        'Cara-service',
      );

      const activuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      this.logger.debug(
        `Active User: ${JSON.stringify(activuser)}`,
        'Cara-service',
      );

      const result = await this.carasettings
        .find({
          organizationId: activuser.organizationId,
        })
        .sort({ deviationType: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      this.logger.debug(
        `Fetched Deviation Types: ${JSON.stringify(result)}`,
        'Cara-service',
      );

      const count = await this.carasettings.countDocuments({
        organizationId: activuser?.organizationId,
      });

      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getAllDeviationType successful`,
        'Cara-service',
      );

      return { data: result, count: count };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/cara/getAllDeviationType failed: ${error.message}`,
        error.stack || 'No stack trace',
      );
      return error;
    }
  }

  async searchCapa(query, user, randomNumber) {
    try {
      this.logger.debug(
        `searchCapa called with user: ${JSON.stringify(
          user,
        )}, query: ${JSON.stringify(query)}`,
        'Cara-service',
      );

      const page = query.page || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      this.logger.debug(
        `Pagination - page: ${page}, limit: ${limit}, skip: ${skip}`,
        'Cara-service',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true },
      });

      this.logger.debug(
        `Active User: ${JSON.stringify(activeUser)}`,
        'Cara-service',
      );

      const users: any = await this.prisma.user.findMany({
        where: {
          AND: [
            { organizationId: activeUser.organization.id },
            { deleted: false },
            {
              OR: [
                { username: { contains: query.text, mode: 'insensitive' } },
                { firstname: { contains: query.text, mode: 'insensitive' } },
                { lastname: { contains: query.text, mode: 'insensitive' } },
                { email: { contains: query.text, mode: 'insensitive' } },
              ],
            },
          ],
        },
      });

      this.logger.debug(`Matched Users: ${users.length}`, 'Cara-service');

      const userIds = users.map((item) => item.id);

      const origins: any = await this.carasettings.find({
        deviationType: { $regex: query.text, $options: 'i' },
      });

      this.logger.debug(`Matched Origins: ${origins.length}`, 'Cara-service');

      const originIDs = origins.map((item) => item._id);

      const queryConditions: any[] = [
        {
          $or: [
            { origin: { $in: originIDs } },
            { registeredBy: { $in: userIds } },
            { caraOwner: { $in: userIds } },
            { title: { $regex: new RegExp(query?.text, 'i') } },
          ],
        },
        { organizationId: activeUser.organizationId },
      ];

      // Add optional filters
      if (query.locationId !== 'All')
        queryConditions.push({ locationId: query.locationId });
      if (query.entityId !== 'All')
        queryConditions.push({ entityId: query.entityId });
      const impactTypes = await this.impactModel.find({
        organizationId: activeUser.organization.id,
      });
      const impactTypeMap = impactTypes.reduce((map, impactType: any) => {
        map[impactType._id.toString()] = impactType.impactType;
        return map;
      }, {});
      // Fetch Cara data in parallel to optimize the processing
      const [caraData, count] = await Promise.all([
        this.caraModel
          .find({ $and: queryConditions })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.caraModel.countDocuments({ $and: queryConditions }),
      ]);

      // Process each 'cara' result with parallel queries
      const data = await Promise.all(
        caraData.map(async (cara: any) => {
          // Fetch related data concurrently using Promise.all
          const [
            actionItems,
            entity,
            userRegistered,
            owner,
            cordinator,
            location,
            origin,
            impactTypes,
            systems,
            deptHead,
          ] = await Promise.all([
            this.actionItemModel.find({
              organizationId: activeUser.organizationId,
              source: 'CAPA',
              referenceId: cara._id,
            }),
            this.prisma.entity.findFirst({
              where: { id: cara.entityId },
              select: { id: true, entityId: true, entityName: true },
            }),
            this.prisma.user.findFirst({
              where: { id: cara.registeredBy },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                avatar: true,
                email: true,
              },
            }),
            cara.caraOwner
              ? this.prisma.user.findFirst({
                  where: { id: cara.caraOwner, organizationId: query.orgId },
                })
              : null,
            this.prisma.user.findFirst({
              where: { id: cara.caraCoordinator },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                avatar: true,
                email: true,
              },
            }),
            this.prisma.location.findFirst({
              where: { id: cara.locationId },
              select: { id: true, locationId: true, locationName: true },
            }),
            this.carasettings.findById(cara.origin),
            this.impactModel.find({
              organizationId: activeUser.organizationId,
              _id: { $in: cara.impactTypes }, // Assuming impactType is stored as an array of IDs in `cara.impactTypes`
            }),
            cara.systemId.length > 0
              ? this.SystemModel.find(
                  { _id: { $in: cara.systemId } },
                  { _id: 1, name: 1 },
                )
              : [],
            this.getDeptHeadForEntity(cara.entityId),
          ]);
          const impactTypeName = impactTypeMap[cara.impactTypeId] || 'Unknown';

          // Handle dates to prevent errors if they're null or undefined
          const createdAt = cara.createdAt?.$date
            ? new Date(cara.createdAt.$date)
            : cara.createdAt;

          // Construct the final result object
          return {
            _id: cara._id,
            title: cara.title,
            organizationId: cara.organizationId,
            kpiId: cara.kpiId,
            caraCoordinator: cordinator,
            registeredBy: userRegistered,
            impactType: impactTypeName,
            highPriority: cara?.highPriority,
            impact: cara?.impact,
            caraOwner: cara.caraOwner
              ? {
                  id: owner?.id,
                  firstname: owner?.firstname,
                  lastname: owner?.lastname,
                  email: owner?.email,
                }
              : {},
            date: cara?.date,
            kpiReportLink: cara?.kpiReportLink,
            locationId: cara?.locationId,
            locationDetails: location,
            analysisLevel: cara?.analysisLevel,
            entityId: entity,
            systemId: systems,
            status: cara.status,
            description: cara?.description,
            origin: origin,
            startDate: cara?.date?.startDate,
            endDate: cara?.date?.endDate,
            type: cara?.type,
            containmentAction: cara?.containmentAction,
            actionPointOwner: cara?.actionPointOwner,
            correctiveAction: cara?.correctiveAction,
            deviationType: cara?.deviationType,
            targetDate: cara?.targetDate,
            correctedDate: cara?.correctedDate,
            deptHead: deptHead,
            createdAt: createdAt,
            files: cara?.files,
            registerfiles: cara?.registerfiles,
            attachments: cara?.attachments,
            serialNumber: cara?.serialNumber,
            comments: cara?.comments || '',
            actionItem: actionItems,

            why1: cara?.why1,
            why2: cara?.why2,
            why3: cara?.why3,
            why4: cara?.why4,
            why5: cara?.why5,
            man: cara?.man,
            material: cara?.material,
            measurement: cara?.measurement,
            method: cara?.method,
            environment: cara?.environment,
            machine: cara?.machine,
            outcome: cara?.outcome,
            onePointLesson: cara?.onePointLesson,
            referenceComments: cara?.referenceComments,
            analysisId: cara?.analysisId,
            referenceAttachments: cara?.referenceAttachments,
            productId: cara?.productId,
            defectType: cara?.defectType,
          };
        }),
      );

      this.logger.error(
        `trace id = ${randomNumber} GET api/cara/searchCapa successful`,
        'Cara-service',
      );

      return { data, count };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/searchCapa failed ${error.message}`,
        error.stack || 'No stack trace',
      );
      return { error: error.message }; // Returning error message for easier debugging
    }
  }

  async getEntitiesForLocation(id, uuid, user) {
    try {
      this.logger.debug(
        `trace id = ${uuid} getEntitiesForLocation() called with locationId: ${id}, user: ${JSON.stringify(
          user,
        )}`,
        'Cara-service',
      );

      let entities = [];

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
          location: true,
        },
      });
      // const entityTypeId = await this.prisma.entityType.findFirst({
      //   where: {
      //     organizationId: activeuser.organization.id,
      //     deleted: false,
      //     name: {
      //       equals: 'Department',
      //       mode: 'insensitive',
      //     },
      //   },
      //   select: {
      //     id: true,
      //   },
      // });
      // console.log('entityType id', entityTypeId);
      if (id == 'All') {
        this.logger.debug(
          `trace id = ${uuid} Fetching all departments for organization: ${activeuser.organization.id}`,
          'Cara-service',
        );

        entities = await this.prisma.entity.findMany({
          where: {
            organizationId: activeuser.organization.id,
            deleted: false,
            // entityTypeId: entityTypeId.id,
          },
          select: {
            id: true,
            entityId: true,
            entityName: true,
          },
          orderBy: { entityName: 'asc' },
        });
      } else {
        this.logger.debug(
          `trace id = ${uuid} Fetching departments for locationId: ${id}`,
          'Cara-service',
        );

        entities = await this.prisma.entity.findMany({
          where: {
            locationId: id,
            organizationId: activeuser.organization.id,
            deleted: false,
            // entityTypeId: entityTypeId.id,
          },
          select: {
            id: true,
            entityId: true,
            entityName: true,
          },
          orderBy: { entityName: 'asc' },
        });
      }

      this.logger.debug(
        `trace id = ${uuid} Entities fetched count: ${entities.length}`,
        'Cara-service',
      );

      this.logger.log(
        `trace id = ${uuid} GET api/cara/getEntitiesByLocation/${id} successful`,
        'Cara-service',
      );

      return entities;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} GET api/cara/getEntitiesForLocation/${id} failed with error: ${error.message}`,
        error.stack || 'No stack trace',
      );
      return error;
    }
  }

  async myCapa(query, userid, uuid) {
    try {
      this.logger.debug(
        `trace id = ${uuid} GET /api/cara/myCapa called with query: ${JSON.stringify(
          query,
        )}, user: ${JSON.stringify(userid)}`,
        'Cara-service',
      );

      const page = query.page || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
        include: { organization: true },
      });

      // Fetch all impact types for the organization
      const impactTypes = await this.impactModel.find({
        organizationId: activeuser.organization.id,
      });

      // Create a map of impactType ID to name
      const impactTypeMap = impactTypes.reduce((map, impactType: any) => {
        map[impactType._id.toString()] = impactType.impactType;
        return map;
      }, {});

      let filterCriteria: any = {
        $and: [
          {
            $or: [
              { caraOwner: activeuser.id },
              { registeredBy: activeuser.id },
            ],
          },
          { organizationId: activeuser.organization?.id },
          { year: query.currentYear },
        ],
      };

      // Add filter criteria based on query parameters
      if (query.selectedOrigin && query.selectedOrigin.length > 0) {
        filterCriteria.origin = { $in: query.selectedOrigin };
      }
      if (query.selectedOwner && query.selectedOwner.length > 0) {
        filterCriteria.caraOwner = { $in: query.selectedOwner };
      }
      if (query.selectedStatus && query.selectedStatus.length > 0) {
        filterCriteria.status = { $in: query.selectedStatus };
      }
      if (query.selectedLocation?.length) {
        filterCriteria.locationId = { $in: query.selectedLocation };
      }
      if (query.selectedEntity?.length) {
        filterCriteria.entityId = { $in: query.selectedEntity };
      }

      // Fetch the 'caras' data
      const caras: any = await this.caraModel
        .find(filterCriteria)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Initialize final result array
      let finalResult = [];

      // Process each 'cara' in parallel using Promise.all
      const count = await this.caraModel.countDocuments(filterCriteria);

      const results = await Promise.all(
        caras.map(async (cara) => {
          // Fetch related data in parallel
          const [
            actionItem,
            entity,
            userRegistered,
            cordinator,
            owner,
            location,
            origin,
            deptHead,
            systems,
          ] = await Promise.all([
            this.actionItemModel.find({
              organizationId: activeuser.organizationId,
              source: 'CAPA',
              referenceId: cara._id,
            }),
            this.prisma.entity.findFirst({
              where: {
                id: cara.entityId,
              },
              select: {
                id: true,
                entityId: true,
                entityName: true,
                users: true,
              },
            }),
            this.prisma.user.findFirst({
              where: {
                id: cara.registeredBy,
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                avatar: true,
                email: true,
              },
            }),
            this.prisma.user.findFirst({
              where: {
                id: cara.caraCoordinator,
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                avatar: true,
                email: true,
              },
            }),
            cara.caraOwner
              ? this.prisma.user.findFirst({
                  where: {
                    id: cara.caraOwner,
                    organizationId: query.orgid,
                  },
                })
              : null,
            this.prisma.location.findFirst({
              where: {
                id: cara.locationId,
              },
              select: {
                id: true,
                locationId: true,
                locationName: true,
              },
            }),
            this.carasettings.findById(cara.origin),
            this.getDeptHeadForEntity(cara.entityId),
            cara.systemId.length > 0
              ? this.SystemModel.find(
                  { _id: { $in: cara.systemId } },
                  { _id: 1, name: 1 }, // Project only _id and name
                )
              : [],
          ]);

          // Extract the impact type name using the ID stored in the 'cara'
          const impactTypeName = impactTypeMap[cara.impactTypeId] || 'Unknown'; // Fetch from map

          // Handle date fields
          const createdAt = cara.createdAt?.$date
            ? new Date(cara.createdAt.$date)
            : cara.createdAt;

          // Construct the final result for this 'cara'
          return {
            _id: cara._id,
            organizationId: cara.organizationId,
            title: cara.title,
            kpiId: cara.kpiId,
            registeredBy: userRegistered,
            caraCoordinator: cordinator,
            caraOwner: cara.caraOwner
              ? {
                  id: owner?.id,
                  firstname: owner?.firstname,
                  lastname: owner?.lastname,
                  email: owner?.email,
                }
              : {},
            analysisLevel: cara?.analysisLevel,
            createdAt: createdAt,
            date: cara?.date,
            kpiReportLink: cara?.kpiReportLink,
            locationId: cara?.locationId,
            locationDetails: location,
            entityId: entity,
            systemId: systems,
            status: cara.status,
            description: cara?.description,
            origin: origin,
            rootCauseAnalysis: cara?.rootCauseAnalysis,
            actualCorrectiveAction: cara?.actualCorrectiveAction,
            containmentAction: cara?.containmentAction,
            correctiveAction: cara?.correctiveAction,
            targetDate: cara?.targetDate,
            correctedDate: cara?.correctedDate,
            deptHead: deptHead,
            files: cara?.files,
            attachments: cara?.attachments,
            registerfiles: cara?.registerfiles,
            type: cara?.type,
            serialNumber: cara?.serialNumber,
            comments: cara?.comments || '',
            actionItem: actionItem,
            impactType: impactTypeName, // Include the impactType name here
            why1: cara?.why1,
            why2: cara?.why2,
            why3: cara?.why3,
            why4: cara?.why4,
            why5: cara?.why5,
            man: cara?.man,
            material: cara?.material,
            measurement: cara?.measurement,
            method: cara?.method,
            environment: cara?.environment,
            machine: cara?.machine,
            outcome: cara?.outcome,
            onePointLesson: cara?.onePointLesson,
            referenceComments: cara?.referenceComments,
            analysisId: cara?.analysisId,
            referenceAttachments: cara?.referenceAttachments,
            productId: cara?.productId,
            defectType: cara?.defectType,
            highPriority: cara?.highPriority,
            impact: cara?.impact,
          };
        }),
      );

      // Log success
      this.logger.log(
        `trace id = ${uuid} GET /api/cara/myCapa successful for userId: ${userid.id}`,
        'Cara-service',
      );

      return { data: results, count: count };
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} GET /api/cara/myCapa failed for userId: ${userid.id}, error: ${error.message}`,
        error.stack || 'No stack trace',
      );
      return { error: error.message };
    }
  }

  async mapserialnumber(serialnumber, locationId, entityId, organizationId) {
    this.logger.debug(
      `Called mapserialnumber with serialnumber="${serialnumber}", locationId="${locationId}", entityId="${entityId}", organizationId="${organizationId}"`,
      'Cara-service',
    );

    const currentTime = new Date();
    const year = currentTime.getFullYear();
    this.logger.debug(`Current year: ${year}`, 'Cara-service');

    const currentYear: any = await this.organizationService.getFiscalYear(
      organizationId,
      year,
    );
    this.logger.debug(`Fiscal year returned: ${currentYear}`, 'Cara-service');

    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
      select: {
        fiscalYearFormat: true,
      },
    });
    this.logger.debug(
      `Organization fiscalYearFormat: ${organization?.fiscalYearFormat}`,
      'Cara-service',
    );

    let showyear;
    if (organization?.fiscalYearFormat === 'YY-YY+1') {
      showyear = currentYear;
    } else {
      showyear = currentYear.toString().slice(-2);
    }

    this.logger.debug(
      `showyear used in replacement: ${showyear}`,
      'Cara-service',
    );

    const location = await this.prisma.location.findFirst({
      where: {
        id: locationId,
      },
      select: {
        locationId: true,
      },
    });

    this.logger.debug(
      `Resolved locationId: ${location?.locationId}`,
      'Cara-service',
    );

    const entity = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
      },
      select: {
        entityId: true,
      },
    });

    this.logger.debug(`Resolved entityId: ${entity?.entityId}`, 'Cara-service');

    const month = (currentTime.getMonth() + 1).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    });
    this.logger.debug(`Current month (MM): ${month}`, 'Cara-service');

    const serialNumber1 = serialnumber
      .replace(/LocationId/g, locationId ? location?.locationId : '')
      .replace(/DepartmentId/g, entityId ? entity?.entityId : '')
      .replace(/YY/g, showyear)
      .replace(/MM/g, month);

    this.logger.debug(`Mapped serial number: ${serialNumber1}`, 'Cara-service');

    return serialNumber1;
  }

  async createCapaComments(data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating Capa Comments for Capa ID ${data.caraId}`,
      'cara.service.ts',
    );
    try {
      const createComments = await this.capacomments.create(data);
      this.logger.log(
        `trace id = ${randomNumber} Creating Capa Comments for Capa ID ${data.caraId} Successful`,
        'cara.service.ts',
      );
      return createComments;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating Capa Comments for Capa ID ${data.caraId} Failed - ${error}`,
        'cara.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getCapaCommentsById(id, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting Comments of Capa: ${id}`,
      'capa.service.ts',
    );
    try {
      const comments = await this.capacomments.find({
        caraId: id,
      });

      this.logger.log(
        `trace id = ${randomNumber} Getting Comments of Capa: ${id} Successful`,
        'capa.service.ts',
      );
      return comments;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting Comments of Capa: ${id} Failed - ${error}`,
        'capa.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getStatusOptionsForCapa(id, userid, uuid) {
    try {
      this.logger.log(
        `trace id = ${uuid} Getting status options for CAPA ID: ${id}`,
        'capa.service.ts',
      );

      // Get active user
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
        include: { organization: true },
      });
      this.logger.debug(
        `trace id = ${uuid} Active user: ${JSON.stringify(activeuser)}`,
        'capa.service.ts',
      );

      // Get CAPA details
      const capaDetails = await this.caraModel.findById(new ObjectId(id));
      const workflow: any = await this.workflowModel.findOne({
        organizationId: activeuser.organizationId,
      });
      // console.log('capa detials status', capaDetails);
      //get depthead of capa entity
      // const depthead: any = await this.getDeptHeadForEntity(
      //   capaDetails?.entityId,
      // );

      let optionsArray = [];

      if (
        activeuser.id === capaDetails.registeredBy &&
        (capaDetails.status === 'Rejected' ||
          capaDetails.status === undefined ||
          capaDetails.status === 'Draft')
      ) {
        optionsArray.push('Save As Draft', 'Submit Capa');
      } else if (
        capaDetails.status === 'Open' &&
        capaDetails?.caraCoordinator === activeuser.id
      ) {
        optionsArray.push('Submit');
      } else if (
        (capaDetails?.caraCoordinator === activeuser.id ||
          activeuser.id === capaDetails.caraOwner) &&
        capaDetails.status === 'Accepted' &&
        capaDetails?.analysisLevel === 'Advanced'
      ) {
        optionsArray.push('Outcome In Progress');
      } else if (
        (capaDetails?.caraCoordinator === activeuser.id ||
          activeuser.id === capaDetails.caraOwner) &&
        capaDetails.status === 'Accepted' &&
        (capaDetails?.analysisLevel === 'Basic' || !capaDetails?.analysisLevel)
      ) {
        optionsArray.push('Save', 'Outcome In Progress');
      }

      //if login user is dh,status is CA pending and also capa ownere,button options will be save, close
      //if logged in user is either cosordinator or capaowner if the status is in outcome in progress directly give option to close capa
      else if (
        (capaDetails?.caraCoordinator === activeuser.id ||
          activeuser.id === capaDetails.caraOwner) &&
        capaDetails.status === 'Outcome_In_Progress'
      ) {
        // console.log('inside if');
        if (!!workflow && workflow?.executiveApprovalRequired) {
          optionsArray.push('Send For Approval');
        } else {
          optionsArray.push('Close Capa');
        }
      } else if (
        capaDetails?.status === 'Sent_For_Approval' &&
        workflow?.executive?.id === activeuser.id
      ) {
        optionsArray.push('Close Capa');
      }
      //if login user is dh,status is ca pending, button options will be save, close
      // else if (
      //   (depthead.some((head) => head.id === activeuser.id) ||
      //     capaDetails?.caraCoordinator === activeuser.id) &&
      //   capaDetails.status === 'Analysis_In_Progress'
      // ) {
      //   optionsArray.push('Save', 'Outcome_In_Progress');
      // } else if (
      //   (depthead.some((head) => head.id === activeuser.id) ||
      //     capaDetails?.caraCoordinator === activeuser.id) &&
      //   capaDetails.status === 'Outcome_In_Progress'
      // ) {
      // if (workflow.executiveApprovalRequired) {
      //   optionsArray.push('Send For Approval');

      // }
      // else {
      // //   optionsArray.push('Close Capa');
      // }
      // }
      //if login user is capa owner and status is accepted, he can save or submit analysis for dh approval
      // else if (
      //   activeuser.id === capaDetails.caraOwner &&
      //   capaDetails.status === 'Accepted'
      // ) {
      //   optionsArray.push('Save', 'Submit Analysis');
      // }
      //if login user is capa owner and status is ca pending, he can save or submit outcome for dh closure
      // else if (
      //   activeuser.id === capaDetails.caraOwner &&
      //   capaDetails.status === 'Outcome_In_Progress'
      // ) {
      //   optionsArray.push('Save', 'Submit Outcome');
      // }

      return optionsArray;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} Getting status of CAPA: ${id} Failed - ${error}`,
        'capa.service.ts',
      );
      throw new NotFoundException();
    }
  }

  async getAllCapaForDH(activeuser, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} Fetching all CAPAs for DH user: ${activeuser?.id}`,
        'capa.service.ts',
      );

      const activeuserid = activeuser.id;

      // Fetch entities where this user is listed
      const entities: any = await this.prisma.entity.findMany({
        where: {
          organizationId: activeuser.orgId,
          users: { has: activeuserid },
        },
      });

      this.logger.debug(
        `trace id = ${randomNumber} Entities for user ${activeuserid}: ${JSON.stringify(
          entities,
        )}`,
        'capa.service.ts',
      );

      if (entities.length > 0) {
        const entityIds = entities.map((entity) => entity.id);

        this.logger.debug(
          `trace id = ${randomNumber} Entity IDs: ${JSON.stringify(entityIds)}`,
          'capa.service.ts',
        );

        const getCapa = await this.caraModel.find({
          entityId: { $in: entityIds },
          $or: [
            { status: 'Open' },
            { status: 'Analysis_In_Progress' },
            { status: 'Outcome_In_Progress' },
          ],
        });

        this.logger.debug(
          `trace id = ${randomNumber} CAPAs fetched: ${JSON.stringify(
            getCapa,
          )}`,
          'capa.service.ts',
        );

        this.logger.log(
          `trace id = ${randomNumber} Getting all CAPAs for logged-in DH: ${activeuser?.id} successful`,
          'capa.service.ts',
        );

        return getCapa;
      } else {
        this.logger.debug(
          `trace id = ${randomNumber} No entities found for user ${activeuserid} as DH`,
          'capa.service.ts',
        );
        return [];
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting all CAPAs for logged-in DH: ${activeuser.id} failed: ${error}`,
        'capa.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllCapaForCapaCoordinator(activeuser, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} Fetching CAPAs for coordinator user: ${activeuser?.id}`,
        'capa.service.ts',
      );

      this.logger.debug(
        `trace id = ${randomNumber} Active user object: ${JSON.stringify(
          activeuser,
        )}`,
        'capa.service.ts',
      );

      const getCapa = await this.caraModel.find({
        caraCoordinator: activeuser.id,
        $or: [
          { status: 'Open' },
          { status: 'Analysis_In_Progress' },
          { status: 'Outcome_In_Progress' },
        ],
      });

      this.logger.debug(
        `trace id = ${randomNumber} CAPAs found for coordinator ${
          activeuser.id
        }: ${JSON.stringify(getCapa)}`,
        'capa.service.ts',
      );

      this.logger.log(
        `trace id = ${randomNumber} Getting all CAPAs for logged-in coordinator: ${activeuser?.id} successful`,
        'capa.service.ts',
      );

      return getCapa;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting all CAPAs for logged-in coordinator: ${activeuser.id} failed ${error}`,
        'capa.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllCapaForCapaOwner(activeuser, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} Fetching CAPAs for owner user: ${activeuser?.id}`,
        'capa.service.ts',
      );

      this.logger.debug(
        `trace id = ${randomNumber} Active user object: ${JSON.stringify(
          activeuser,
        )}`,
        'capa.service.ts',
      );

      const getCapa = await this.caraModel.find({
        caraOwner: activeuser.id,
        $or: [
          { status: 'Accepted' },
          { status: 'Analysis_In_Progress' },
          { status: 'Outcome_In_Progress' },
        ],
      });

      this.logger.debug(
        `trace id = ${randomNumber} CAPAs found for owner ${
          activeuser.id
        }: ${JSON.stringify(getCapa)}`,
        'capa.service.ts',
      );

      this.logger.log(
        `trace id = ${randomNumber} Getting all CAPAs for logged-in owner: ${activeuser?.id} successful`,
        'capa.service.ts',
      );

      return getCapa;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting all CAPAs for logged-in owner: ${activeuser.id} failed ${error}`,
        'capa.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getCapaForInbox(user, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getAllCapaForInbox initiated for user ${user?.id}`,
        'capa.service.ts',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true, location: true, entity: true },
      });

      this.logger.debug(
        `trace id = ${randomNumber} Active user resolved: ${JSON.stringify(
          activeuser,
        )}`,
        'capa.service.ts',
      );

      // If needed in future, also fetch DH-related CAPAs
      // const dh = await this.getAllCapaForDH(activeuser, randomNumber);

      const caraOwner = await this.getAllCapaForCapaOwner(
        activeuser,
        randomNumber,
      );
      this.logger.debug(
        `trace id = ${randomNumber} CAPAs for caraOwner: ${JSON.stringify(
          caraOwner,
        )}`,
        'capa.service.ts',
      );

      const caraCoordinator = await this.getAllCapaForCapaCoordinator(
        activeuser,
        randomNumber,
      );
      this.logger.debug(
        `trace id = ${randomNumber} CAPAs for caraCoordinator: ${JSON.stringify(
          caraCoordinator,
        )}`,
        'capa.service.ts',
      );

      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getAllCapaForInbox successful`,
        'capa.service.ts',
      );

      return { dh: caraCoordinator, caraOwner: caraOwner };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/cara/getAllCapaForInbox failed: ${error}`,
        'capa.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getFilterListForCapa(user, randomNumber, query) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getFilterListForCapa initiated`,
        'cip.controller.ts',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true, location: true, entity: true },
      });

      this.logger.debug(
        `trace id = ${randomNumber} Active user resolved: ${JSON.stringify(
          activeuser,
        )}`,
        'cip.controller.ts',
      );

      const organizationFilter: any = {
        organizationId: activeuser.organizationId,
      };

      if (query.unitId && query.unitId !== 'All') {
        organizationFilter.locationId = query.unitId;
      }

      if (query.entityId && query.entityId !== 'All') {
        organizationFilter.entityId = query.entityId;
      }

      this.logger.debug(
        `trace id = ${randomNumber} Filter conditions for CAPA query: ${JSON.stringify(
          organizationFilter,
        )}`,
        'cip.controller.ts',
      );

      const capaData = await this.caraModel.find(organizationFilter);

      this.logger.debug(
        `trace id = ${randomNumber} Total CAPAs fetched: ${capaData.length}`,
        'cip.controller.ts',
      );

      let originIds = [],
        capaOwnerIds = [],
        unitIds = [],
        entityIds = [],
        status = [];

      for (let value of capaData) {
        if (value.origin) originIds.push(value.origin);
        if (value.caraOwner) capaOwnerIds.push(value.caraOwner);
        if (value.status) status.push(value.status);
        if (value.locationId) unitIds.push(value.locationId);
        if (value.entityId) entityIds.push(value.entityId);
      }

      const uniqueStatus = Array.from(new Set(status)).sort();

      const [originData, locationData, deptData, ownerData] = await Promise.all(
        [
          this.carasettings
            .find({ _id: { $in: originIds } })
            .sort({ deviationType: 1 }),
          this.prisma.location.findMany({
            where: { id: { in: unitIds } },
            orderBy: { locationName: 'asc' },
          }),
          this.prisma.entity.findMany({
            where: { id: { in: entityIds } },
            orderBy: { entityName: 'asc' },
          }),
          this.prisma.user.findMany({
            where: { id: { in: capaOwnerIds } },
            orderBy: { username: 'asc' },
          }),
        ],
      );

      this.logger.debug(
        `trace id = ${randomNumber} Filter results → origin: ${originData.length}, location: ${locationData.length}, entity: ${deptData.length}, owner: ${ownerData.length}, status: ${uniqueStatus.length}`,
        'cip.controller.ts',
      );

      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getFilterListForCapa successful`,
        'cip.controller.ts',
      );

      return {
        origin: originData,
        location: locationData,
        entity: deptData,
        status: uniqueStatus,
        owner: ownerData,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/cara/getFilterListForCapa failed ${error}`,
        'cip.controller.ts',
      );
    }
  }

  async createCapaOwnerEntry(data) {
    try {
      this.logger.debug(
        `POST /api/cara/createCapaOwnerEntry - Payload: ${JSON.stringify(
          data,
        )}`,
        'capa.service.ts',
      );

      const result = await this.caraownermodel.create(data);

      this.logger.log(
        `POST /api/cara/createCapaOwnerEntry successful`,
        'capa.service.ts',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `POST /api/cara/createCapaOwnerEntry failed - Payload: ${JSON.stringify(
          data,
        )} - Error: ${error}`,
        'capa.service.ts',
      );
      throw new InternalServerErrorException(error); // optional: helps propagate errors
    }
  }

  async getCapaOwnerEntry(id) {
    try {
      this.logger.debug(
        `GET /api/cara/getCapaOwnerEntry - Fetching owner entries for CAPA: ${id}`,
        'capa.service.ts',
      );

      const result = await this.caraownermodel.find({ caraId: id });
      this.logger.debug(
        `Fetched ${result.length} owner change entries`,
        'capa.service.ts',
      );

      const data = [];

      for (const entry of result) {
        this.logger.debug(
          `Processing entry ID: ${entry._id}`,
          'capa.service.ts',
        );

        const currentowner = await this.prisma.user.findFirst({
          where: { id: entry.currentOwnerId },
          select: { id: true, username: true, email: true },
        });

        const updatedBy = await this.prisma.user.findFirst({
          where: { id: entry.updatedBy },
          select: { id: true, username: true, email: true },
        });

        const final = {
          id: entry._id,
          previousOwner: entry?.previousOwnerId,
          currentowner,
          updatedBy,
          updatedAt: entry?.updatedAt,
          reason: entry?.reason,
        };

        data.push(final);
      }

      this.logger.log(
        `GET /api/cara/getCapaOwnerEntry successful for CAPA: ${id}`,
        'capa.service.ts',
      );

      return data;
    } catch (error) {
      this.logger.error(
        `GET /api/cara/getCapaOwnerEntry failed for CAPA: ${id} - Error: ${
          error.message || error
        }`,
        'capa.service.ts',
      );
      throw new InternalServerErrorException(error); // Recommended
    }
  }
  async sendMailToOwner(data, userid) {
    try {
      this.logger.debug(
        `Preparing to send CAPA ownership change mail for CAPA ID: ${data?.caraId}`,
        'capa.service.ts',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: userid.id },
        include: { organization: true },
      });

      const oid = new ObjectId(data?.caraId);
      const cara = await this.caraModel.findById(oid).select('title');
      this.logger.debug(
        `Fetched CAPA title: ${cara?.title}`,
        'capa.service.ts',
      );

      const currentOwner = await this.prisma.user.findFirst({
        where: { id: data.currentOwnerId },
      });

      if (currentOwner) {
        this.logger.log(
          `Sending email to new CAPA owner (User ID: ${currentOwner.id}) for CAPA: ${cara?.title}`,
          'capa.service.ts',
        );

        await sendMailToCapaOwnerOnChange(
          currentOwner,
          cara,
          activeuser,
          this.emailService.sendEmail,
        );

        this.logger.log(
          `Email sent to CAPA owner successfully.`,
          'capa.service.ts',
        );
      } else {
        this.logger.warn(
          `No current owner found with ID: ${data.currentOwnerId}`,
          'capa.service.ts',
        );
      }
    } catch (error) {
      this.logger.error(
        `sendMailToOwner failed for CAPA ID: ${data?.caraId} - Error: ${
          error.message || error
        }`,
        'capa.service.ts',
      );
    }
  }

  async getChartData(user, randomNumber, query) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} → getChartData initiated with query: ${JSON.stringify(
          query,
        )}`,
        'capa.service.ts',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
        include: { organization: true },
      });

      if (!activeuser?.organizationId) {
        this.logger.warn(
          `trace id = ${randomNumber} → Active user missing organizationId`,
          'capa.service.ts',
        );
        return {
          myDept: [],
          mydeptcount: 0,
          myloc: [],
          myloccount: 0,
          orginiData: [],
          originCount: 0,
        };
      }

      const fetchOriginNames = async (originIds) => {
        const originSettings = await this.carasettings.find({
          _id: { $in: originIds },
        });
        const originNamesMap = {};
        originSettings.forEach((setting) => {
          originNamesMap[setting._id] = setting.deviationType;
        });
        return originNamesMap;
      };

      // Filters
      const entityMatchCondition =
        query.entityId?.includes('All') || !query.entityId?.length
          ? {}
          : { entityId: { $in: query.entityId } };

      const locationMatchCondition =
        query.locationId?.includes('All') || !query.locationId?.length
          ? {}
          : { locationId: { $in: query.locationId } };

      // Aggregation for My Department
      const mydeptcapa = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: activeuser.organizationId,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $group: {
            _id: { Origin: '$origin', status: '$status' },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            Origin: '$_id.Origin',
            status: '$_id.status',
            count: 1,
            ids: 1,
          },
        },
      ]);

      // Aggregation for My Location
      const myloccapa = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: activeuser.organizationId,
            ...locationMatchCondition,
          },
        },
        {
          $group: {
            _id: { Origin: '$origin', status: '$status' },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            Origin: '$_id.Origin',
            status: '$_id.status',
            count: 1,
            ids: 1,
          },
        },
      ]);

      // Aggregation for Origin-Level Summary
      const originData = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: activeuser.organizationId,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $group: {
            _id: { Origin: '$origin' },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            Origin: '$_id.Origin',
            status: '$_id.status', // will be undefined
            count: 1,
            ids: 1,
          },
        },
      ]);

      const getOriginIds = (arr) => [...new Set(arr.map((i) => i.Origin))];

      const [deptOriginNames, locOriginNames, allOriginNames] =
        await Promise.all([
          fetchOriginNames(getOriginIds(mydeptcapa)),
          fetchOriginNames(getOriginIds(myloccapa)),
          fetchOriginNames(getOriginIds(originData)),
        ]);

      const mapOriginData = (arr, nameMap) =>
        arr.map((item) => ({
          Origin: nameMap[item.Origin] || 'Unknown',
          status: item.status,
          count: item.count,
          ids: item.ids,
        }));

      const myDeptCapaWithNames = mapOriginData(mydeptcapa, deptOriginNames);
      const myLocCapaWithNames = mapOriginData(myloccapa, locOriginNames);
      const originDataWithNames = mapOriginData(originData, allOriginNames);

      const mydeptcount = myDeptCapaWithNames.reduce((t, i) => t + i.count, 0);
      const myloccount = myLocCapaWithNames.reduce((t, i) => t + i.count, 0);
      const originCount = originDataWithNames.reduce((t, i) => t + i.count, 0);

      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getChartData successful`,
        'capa.service.ts',
      );

      return {
        myDept: myDeptCapaWithNames,
        mydeptcount,
        myloc: myLocCapaWithNames,
        myloccount,
        orginiData: originDataWithNames,
        originCount,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getChartData failed - ${error}`,
        'capa.service.ts',
      );
      throw error;
    }
  }

  //get deptwise data for capa dashboard

  // async getDeptwiseChartData(user, randomNumber, query) {
  //   try {
  //     // console.log('query', query);
  //     const activeuser = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: user.id,
  //       },
  //       include: { organization: true },
  //     });

  //     //if locationId is All then dont add to the condition
  //     const locationIds =
  //       query.locationId && query.locationId !== 'All'
  //         ? query.locationId
  //         : [activeuser?.locationId];

  //     //if entityId is all then dont add to the condition
  //     const entityIdFilter =
  //       query.entityId && query.entityId !== 'All'
  //         ? { entityId: { in: query.entityId } }
  //         : {};

  //     const departments = await this.prisma.entity.findMany({
  //       where: {
  //         organizationId: activeuser.organizationId,
  //         locationId: { in: locationIds },
  //         deleted: false,
  //       },
  //     });

  //     const deptwiseCounts = await this.caraModel.aggregate([
  //       {
  //         $match: {
  //           status: { $nin: ['Draft'] }, // Exclude drafts
  //           ...(query.locationId && query.locationId !== 'All'
  //             ? { locationId: { $in: query.locationId } }
  //             : {}),
  //           ...(entityIdFilter.entityId
  //             ? { entityId: { $in: entityIdFilter.entityId.in } }
  //             : {}),
  //           ...(query.checked === 'true'
  //             ? { highPriority: { $exists: true, $eq: true } }
  //             : {}),
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: '$entityId', // Group by department (entityId)
  //           totalCount: { $sum: 1 }, // Excludes draft
  //           pendingCount: {
  //             $sum: {
  //               $cond: [{ $eq: ['$status', 'Open'] }, 1, 0], // Pending records (Open status)
  //             },
  //           },
  //           acceptedCount: {
  //             $sum: {
  //               $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0], // Pending records (Open status)
  //             },
  //           },
  //           completedCount: {
  //             $sum: {
  //               $cond: [
  //                 {
  //                   $or: [
  //                     { $eq: ['$status', 'Closed'] },
  //                     { $eq: ['$status', 'Sent_For_Approval'] },
  //                   ],
  //                 },
  //                 1,
  //                 0,
  //               ], // Completed records (Closed or Sent_For_Approval status)
  //             },
  //           },
  //           wipCount: {
  //             $sum: {
  //               $cond: [
  //                 {
  //                   $or: [
  //                     { $eq: ['$status', 'Analysis_In_Progress'] }, // Analysis In Progress
  //                   ],
  //                 },
  //                 1,
  //                 0,
  //               ],
  //             },
  //           },
  //           outcomeCount: {
  //             $sum: {
  //               $cond: [{ $eq: ['$status', 'Outcome_In_Progress'] }, 1, 0], // Outcome records
  //             },
  //           },
  //           rejectedCount: {
  //             $sum: {
  //               $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0], // Rejected records
  //             },
  //           },
  //           // Extract CAPA IDs grouped by their status
  //           pendingIds: {
  //             $push: {
  //               $cond: [{ $eq: ['$status', 'Open'] }, '$_id', null],
  //             },
  //           },
  //           acceptedIds: {
  //             $push: {
  //               $cond: [{ $eq: ['$status', 'Accepted'] }, '$_id', null],
  //             },
  //           },
  //           approvalIds: {
  //             $push: {
  //               $cond: [
  //                 { $eq: ['$status', 'Sent_For_Approval'] },
  //                 '$_id',
  //                 null,
  //               ],
  //             },
  //           },
  //           completedIds: {
  //             $push: {
  //               $cond: [
  //                 {
  //                   $or: [
  //                     { $eq: ['$status', 'Closed'] },
  //                     { $eq: ['$status', 'Sent_For_Approval'] }, // Include Sent_For_Approval as completed
  //                   ],
  //                 },
  //                 '$_id',
  //                 null,
  //               ],
  //             },
  //           },
  //           wipIds: {
  //             $push: {
  //               $cond: [
  //                 {
  //                   $or: [
  //                     { $eq: ['$status', 'Analysis_In_Progress'] }, // Analysis In Progress
  //                   ],
  //                 },
  //                 '$_id',
  //                 null,
  //               ],
  //             },
  //           },
  //           rejectedIds: {
  //             $push: {
  //               $cond: [{ $eq: ['$status', 'Rejected'] }, '$_id', null],
  //             },
  //           },
  //           outcomeIds: {
  //             $push: {
  //               $cond: [
  //                 { $eq: ['$status', 'Outcome_In_Progress'] },
  //                 '$_id',
  //                 null,
  //               ],
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           // Ensure all count fields are defaulted to 0 in case they are null
  //           totalCount: {
  //             $add: [
  //               { $ifNull: ['$pendingCount', 0] },
  //               { $ifNull: ['$acceptedCount', 0] },
  //               { $ifNull: ['$completedCount', 0] },
  //               { $ifNull: ['$wipCount', 0] },
  //               { $ifNull: ['$rejectedCount', 0] },
  //               { $ifNull: ['$acceptedCount', 0] },
  //               { $ifNull: ['$approvalCount', 0] },
  //               { $ifNull: ['$outcomeCount', 0] },
  //             ],
  //           },
  //           pendingCount: { $ifNull: ['$pendingCount', 0] },
  //           completedCount: { $ifNull: ['$completedCount', 0] },
  //           wipCount: { $ifNull: ['$wipCount', 0] },
  //           rejectedCount: { $ifNull: ['$rejectedCount', 0] },
  //           acceptedCount: { $ifNull: ['$acceptedCount', 0] },
  //           approvalCount: { $ifNull: ['$approvalCount', 0] },
  //           outcomeCount: { $ifNull: ['$outcomeCount', 0] },

  //           pendingIds: {
  //             $filter: {
  //               input: '$pendingIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] }, // Remove null
  //             },
  //           },
  //           completedIds: {
  //             $filter: {
  //               input: '$completedIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           acceptedIds: {
  //             $filter: {
  //               input: '$acceptedIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           approvalIds: {
  //             $filter: {
  //               input: '$approvalIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           wipIds: {
  //             $filter: {
  //               input: '$wipIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           rejectedIds: {
  //             $filter: {
  //               input: '$rejectedIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           outcomeIds: {
  //             $filter: {
  //               input: '$outcomeIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           completionPercentage: {
  //             $cond: [
  //               {
  //                 $eq: [
  //                   {
  //                     $add: [
  //                       { $ifNull: ['$pendingCount', 0] },
  //                       { $ifNull: ['$completedCount', 0] },
  //                       { $ifNull: ['$wipCount', 0] },
  //                       { $ifNull: ['$acceptedCount', 0] },
  //                       { $ifNull: ['$approvalCount', 0] },
  //                       { $ifNull: ['$outcomeCount', 0] },
  //                     ],
  //                   },
  //                   0,
  //                 ],
  //               },
  //               0,
  //               {
  //                 $multiply: [
  //                   {
  //                     $divide: [
  //                       { $ifNull: ['$completedCount', 0] },
  //                       {
  //                         $add: [
  //                           { $ifNull: ['$pendingCount', 0] },
  //                           { $ifNull: ['$completedCount', 0] },
  //                           { $ifNull: ['$wipCount', 0] },
  //                           { $ifNull: ['$acceptedCount', 0] },
  //                           { $ifNull: ['$approvalCount', 0] },
  //                           { $ifNull: ['$outcomeCount', 0] },
  //                         ],
  //                       },
  //                     ],
  //                   },
  //                   100, // Completion percentage calculation
  //                 ],
  //               },
  //             ],
  //           },
  //         },
  //       },
  //     ]);

  //     // map function to get dept names and sort them alphabetically case insensitive
  //     const deptwiseData = deptwiseCounts
  //       .map((dept) => {
  //         const department = departments.find(
  //           (entity) => entity.id === dept._id,
  //         );
  //         const departmentName = department
  //           ? department.entityName
  //           : 'Department not found';

  //         return {
  //           deptName: departmentName,
  //           totalCount: dept.totalCount,
  //           acceptedCount: dept.acceptedCount,
  //           approvalCount: dept.approvalCount,
  //           pendingCount: dept.pendingCount,
  //           wipCount: dept.wipCount,
  //           completedCount: dept.completedCount,
  //           rejectedCount: dept.rejectedCount,
  //           outcomeCount: dept.outcomeCount,
  //           completionPercentage: dept.completionPercentage,
  //           pendingIds: dept.pendingIds,
  //           completedIds: dept.completedIds,
  //           wipIds: dept.wipIds,
  //           rejectedIds: dept.rejectedIds,
  //           acceptedIds: dept.acceptedIds,
  //           approvalIds: dept.approvalIds,
  //           outcomeIds: dept.outcomeIds,
  //         };
  //       })
  //       // Sort department names alphabetically, case insensitive
  //       .sort((a, b) =>
  //         a.deptName.toLowerCase().localeCompare(b.deptName.toLowerCase()),
  //       );

  //     this.logger.log(
  //       `trace id = ${randomNumber} GET api/cara/getDeptwiseChartData successful`,
  //       '',
  //     );

  //     return {
  //       deptwiseData,
  //     };
  //   } catch (error) {
  //     this.logger.log(
  //       `trace id = ${randomNumber} GET api/cara/getDeptwiseChartData failed ${error}`,
  //       '',
  //     );
  //     throw error;
  //   }
  // }
  async getDeptwiseChartData(user, randomNumber, query) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} → getDeptwiseChartData initiated with query: ${JSON.stringify(
          query,
        )}`,
        'capa.service.ts',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
        include: { organization: true },
      });

      const locationIds =
        query.locationId && query.locationId !== 'All'
          ? query.locationId
          : [activeuser.locationId];

      const entityIdFilter =
        query.entityId && query.entityId !== 'All'
          ? { entityId: { in: query.entityId } }
          : {};
      // console.log('query.entityID', query.entityId);
      const departments = await this.prisma.entity.findMany({
        where: {
          organizationId: activeuser.organizationId,
          locationId: { in: locationIds },
          deleted: false,
        },
      });

      const deptwiseCounts = await this.caraModel.aggregate([
        {
          $match: {
            status: { $nin: ['Draft'] },
            ...(query.locationId && query.locationId !== 'All'
              ? { locationId: { $in: query.locationId } }
              : {}),
            ...(entityIdFilter.entityId
              ? { entityId: { $in: entityIdFilter.entityId.in } }
              : {}),
            year: query?.year,
            // ...(query.checked === 'true'
            //   ? { highPriority: { $exists: true, $eq: true } }
            //   : {}),
          },
        },
        {
          $group: {
            _id: '$entityId',
            totalCount: { $sum: 1 },
            pendingCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Open'] }, 1, 0],
              },
            },
            acceptedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0],
              },
            },
            completedCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$status', 'Closed'] },
                      { $eq: ['$status', 'Sent_For_Approval'] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            wipCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Analysis_In_Progress'] }, 1, 0],
              },
            },
            outcomeCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Outcome_In_Progress'] }, 1, 0],
              },
            },
            rejectedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0],
              },
            },
            pendingIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Open'] }, '$_id', null],
              },
            },
            acceptedIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Accepted'] }, '$_id', null],
              },
            },
            approvalIds: {
              $push: {
                $cond: [
                  { $eq: ['$status', 'Sent_For_Approval'] },
                  '$_id',
                  null,
                ],
              },
            },
            completedIds: {
              $push: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$status', 'Closed'] },
                      { $eq: ['$status', 'Sent_For_Approval'] },
                    ],
                  },
                  '$_id',
                  null,
                ],
              },
            },
            wipIds: {
              $push: {
                $cond: [
                  { $eq: ['$status', 'Analysis_In_Progress'] },
                  '$_id',
                  null,
                ],
              },
            },
            rejectedIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Rejected'] }, '$_id', null],
              },
            },
            outcomeIds: {
              $push: {
                $cond: [
                  { $eq: ['$status', 'Outcome_In_Progress'] },
                  '$_id',
                  null,
                ],
              },
            },
          },
        },
        {
          $project: {
            totalCount: { $ifNull: ['$totalCount', 0] },
            pendingCount: { $ifNull: ['$pendingCount', 0] },
            acceptedCount: { $ifNull: ['$acceptedCount', 0] },
            completedCount: { $ifNull: ['$completedCount', 0] },
            wipCount: { $ifNull: ['$wipCount', 0] },
            rejectedCount: { $ifNull: ['$rejectedCount', 0] },
            outcomeCount: { $ifNull: ['$outcomeCount', 0] },
            pendingIds: {
              $filter: {
                input: '$pendingIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            completedIds: {
              $filter: {
                input: '$completedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            acceptedIds: {
              $filter: {
                input: '$acceptedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            approvalIds: {
              $filter: {
                input: '$approvalIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            wipIds: {
              $filter: {
                input: '$wipIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            rejectedIds: {
              $filter: {
                input: '$rejectedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            outcomeIds: {
              $filter: {
                input: '$outcomeIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
          },
        },
      ]);

      const deptwiseData = deptwiseCounts
        .map((dept) => {
          const department = departments.find((d) => d.id === dept._id);
          const departmentName =
            department?.entityName || 'Department not found';
          return {
            deptName: departmentName,
            totalCount: dept.totalCount,
            acceptedCount: dept.acceptedCount,
            approvalCount: dept.approvalCount,
            pendingCount: dept.pendingCount,
            wipCount: dept.wipCount,
            completedCount: dept.completedCount,
            rejectedCount: dept.rejectedCount,
            outcomeCount: dept.outcomeCount,
            completionPercentage: dept.completionPercentage,
            pendingIds: dept.pendingIds,
            completedIds: dept.completedIds,
            wipIds: dept.wipIds,
            rejectedIds: dept.rejectedIds,
            acceptedIds: dept.acceptedIds,
            approvalIds: dept.approvalIds,
            outcomeIds: dept.outcomeIds,
          };
        })
        .sort((a, b) =>
          a.deptName.toLowerCase().localeCompare(b.deptName.toLowerCase()),
        );

      // Aggregate all counts if 'All' for entityId
      let aggregatedData: any = {};
      if (deptwiseData?.length > 1) {
        aggregatedData = {
          deptName: 'Grand Total',
          totalCount: deptwiseData.reduce(
            (acc, dept) => acc + dept.totalCount,
            0,
          ),
          acceptedCount: deptwiseData.reduce(
            (acc, dept) => acc + dept.acceptedCount,
            0,
          ),
          approvalCount: deptwiseData.reduce(
            (acc, dept) => acc + dept.approvalCount,
            0,
          ),
          pendingCount: deptwiseData.reduce(
            (acc, dept) => acc + dept.pendingCount,
            0,
          ),
          wipCount: deptwiseData.reduce((acc, dept) => acc + dept.wipCount, 0),
          completedCount: deptwiseData.reduce(
            (acc, dept) => acc + dept.completedCount,
            0,
          ),
          rejectedCount: deptwiseData.reduce(
            (acc, dept) => acc + dept.rejectedCount,
            0,
          ),
          outcomeCount: deptwiseData.reduce(
            (acc, dept) => acc + dept.outcomeCount,
            0,
          ),
          completionPercentage:
            deptwiseData.reduce(
              (acc, dept) => acc + dept.completionPercentage,
              0,
            ) / deptwiseData.length,
          pendingIds: deptwiseData.reduce(
            (acc, dept) => [...acc, ...dept.pendingIds],
            [],
          ),
          completedIds: deptwiseData.reduce(
            (acc, dept) => [...acc, ...dept.completedIds],
            [],
          ),
          wipIds: deptwiseData.reduce(
            (acc, dept) => [...acc, ...dept.wipIds],
            [],
          ),
          rejectedIds: deptwiseData.reduce(
            (acc, dept) => [...acc, ...dept.rejectedIds],
            [],
          ),
          acceptedIds: deptwiseData.reduce(
            (acc, dept) => [...acc, ...dept.acceptedIds],
            [],
          ),
          approvalIds: deptwiseData.reduce(
            (acc, dept) => [...acc, ...dept.approvalIds],
            [],
          ),
          outcomeIds: deptwiseData.reduce(
            (acc, dept) => [...acc, ...dept.outcomeIds],
            [],
          ),
        };
        deptwiseData.push(aggregatedData); // Add aggregated data at the end
      }

      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getDeptwiseChartData successful`,
        'capa.service.ts',
      );

      return { deptwiseData };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getDeptwiseChartData failed: ${error}`,
        'capa.service.ts',
      );
      throw error;
    }
  }

  //this api is used when all is selected in dropdown for capa dashboard
  // async getLocationwiseChartData(user, randomNumber, query) {
  //   try {
  //     const activeuser = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: user.id,
  //       },
  //       include: { organization: true },
  //     });

  //     // If locationId is All, don't add to the condition

  //     // Get the locations in the organization
  //     const locations = await this.prisma.location.findMany({
  //       where: {
  //         organizationId: activeuser.organizationId,
  //         deleted: false,
  //       },
  //     });

  //     // Modify the aggregation to group by locationId instead of entityId
  //     const locationwiseCounts = await this.caraModel.aggregate([
  //       {
  //         $match: {
  //           status: { $nin: ['Draft'] }, // Exclude CAPA in draft state along with location and entity filters
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: '$locationId', // Group by locationId instead of entityId
  //           totalCount: { $sum: 1 }, // Draft not included
  //           pendingCount: {
  //             $sum: {
  //               $cond: [{ $eq: ['$status', 'Open'] }, 1, 0], // Pending records (Open status)
  //             },
  //           },
  //           completedCount: {
  //             $sum: {
  //               $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0], // Completed records (Closed status)
  //             },
  //           },
  //           wipCount: {
  //             $sum: {
  //               $cond: [
  //                 {
  //                   $and: [
  //                     { $ne: ['$status', 'Open'] }, // WIP records (accepted, in analysis and outcome)
  //                     { $ne: ['$status', 'Closed'] },
  //                   ],
  //                 },
  //                 1,
  //                 0,
  //               ],
  //             },
  //           },
  //           rejectedCount: {
  //             $sum: {
  //               $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0], // Rejected records
  //             },
  //           },
  //           // Extract CAPA IDs grouped by their status
  //           pendingIds: {
  //             $push: {
  //               $cond: [{ $eq: ['$status', 'Open'] }, '$_id', null],
  //             },
  //           },
  //           completedIds: {
  //             $push: {
  //               $cond: [{ $eq: ['$status', 'Closed'] }, '$_id', null],
  //             },
  //           },
  //           wipIds: {
  //             $push: {
  //               $cond: [
  //                 {
  //                   $and: [
  //                     { $ne: ['$status', 'Open'] }, // WIP records (accepted/analysis/outcome)
  //                     { $ne: ['$status', 'Closed'] },
  //                   ],
  //                 },
  //                 '$_id',
  //                 null,
  //               ],
  //             },
  //           },
  //           rejectedIds: {
  //             $push: {
  //               $cond: [{ $eq: ['$status', 'Rejected'] }, '$_id', null],
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           totalCount: {
  //             $add: [
  //               '$pendingCount',
  //               '$completedCount',
  //               '$wipCount',
  //               '$rejectedCount',
  //             ],
  //           },
  //           pendingCount: 1,
  //           completedCount: 1,
  //           wipCount: 1,
  //           rejectedCount: 1,
  //           pendingIds: {
  //             $filter: {
  //               input: '$pendingIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] }, // Remove null
  //             },
  //           },
  //           completedIds: {
  //             $filter: {
  //               input: '$completedIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           wipIds: {
  //             $filter: {
  //               input: '$wipIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           rejectedIds: {
  //             $filter: {
  //               input: '$rejectedIds',
  //               as: 'id',
  //               cond: { $ne: ['$$id', null] },
  //             },
  //           },
  //           completionPercentage: {
  //             $cond: [
  //               {
  //                 $eq: [
  //                   { $add: ['$pendingCount', '$completedCount', '$wipCount'] },
  //                   0,
  //                 ],
  //               },
  //               0,
  //               {
  //                 $multiply: [
  //                   {
  //                     $divide: [
  //                       '$completedCount',
  //                       {
  //                         $add: [
  //                           '$pendingCount',
  //                           '$completedCount',
  //                           '$wipCount',
  //                         ],
  //                       },
  //                     ],
  //                   },
  //                   100, // Completion percentage
  //                 ],
  //               },
  //             ],
  //           },
  //         },
  //       },
  //     ]);

  //     // Map function to get location names and sort alphabetically, case insensitive
  //     const locationwiseData = locationwiseCounts
  //       .map((location) => {
  //         const locationData = locations.find((loc) => loc.id === location._id);
  //         const locationName = locationData
  //           ? locationData?.locationName
  //           : 'Location not found';

  //         return {
  //           locationName: locationName,
  //           totalCount: location.totalCount,
  //           pendingCount: location.pendingCount,
  //           wipCount: location.wipCount,
  //           completedCount: location.completedCount,
  //           rejectedCount: location.rejectedCount,
  //           completionPercentage: location.completionPercentage,
  //           pendingIds: location.pendingIds,
  //           completedIds: location.completedIds,
  //           wipIds: location.wipIds,
  //           rejectedIds: location.rejectedIds,
  //         };
  //       })
  //       // Remove entries where location has been deleted
  //       .filter((location) => location.locationName !== 'Location not found')
  //       // Sort the location names alphabetically, case insensitive
  //       .sort((a, b) =>
  //         a.locationName
  //           .toLowerCase()
  //           .localeCompare(b.locationName.toLowerCase()),
  //       );

  //     this.logger.log(
  //       `trace id = ${randomNumber} GET api/cara/getLocationwiseChartData successful`,
  //       '',
  //     );

  //     return {
  //       locationwiseData,
  //     };
  //   } catch (error) {
  //     this.logger.log(
  //       `trace id = ${randomNumber} GET api/cara/getLocationwiseChartData failed ${error}`,
  //       '',
  //     );
  //     throw error;
  //   }
  // }
  async getLocationwiseChartData(user, randomNumber, query) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} - Received query: ${JSON.stringify(query)}`,
        'capa.service.ts',
      );

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
        include: { organization: true },
      });

      this.logger.debug(
        `trace id = ${randomNumber} - Active user org: ${activeuser?.organizationId}`,
        'capa.service.ts',
      );

      const [locations, entities] = await Promise.all([
        this.prisma.location.findMany({
          where: { organizationId: activeuser.organizationId, deleted: false },
        }),
        this.prisma.entity.findMany({
          where: { organizationId: activeuser.organizationId, deleted: false },
        }),
      ]);

      this.logger.debug(
        `trace id = ${randomNumber} - Fetched ${locations.length} locations and ${entities.length} entities`,
        'capa.service.ts',
      );

      const locationwiseCounts = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: activeuser.organizationId,
            status: { $nin: ['Draft'] },
            year: query?.year,
          },
        },
        {
          $group: {
            _id: { locationId: '$locationId', entityId: '$entityId' },
            totalCount: { $sum: 1 },
            pendingCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] },
            },
            completedCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$status', 'Closed'] },
                      { $eq: ['$status', 'Sent_For_Approval'] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            acceptedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] },
            },
            approvalCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Sent_For_Approval'] }, 1, 0],
              },
            },
            wipCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$status', 'Open'] },
                      { $ne: ['$status', 'Closed'] },
                      { $ne: ['$status', 'Accepted'] },
                      { $ne: ['$status', 'Sent_For_Approval'] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            rejectedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
            },
            pendingIds: {
              $push: { $cond: [{ $eq: ['$status', 'Open'] }, '$_id', null] },
            },
            acceptedIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Accepted'] }, '$_id', null],
              },
            },
            approvalIds: {
              $push: {
                $cond: [
                  { $eq: ['$status', 'Sent_For_Approval'] },
                  '$_id',
                  null,
                ],
              },
            },
            completedIds: {
              $push: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$status', 'Closed'] },
                      { $eq: ['$status', 'Sent_For_Approval'] },
                    ],
                  },
                  '$_id',
                  null,
                ],
              },
            },
            wipIds: {
              $push: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$status', 'Open'] },
                      { $ne: ['$status', 'Closed'] },
                      { $ne: ['$status', 'Accepted'] },
                      { $ne: ['$status', 'Sent_For_Approval'] },
                    ],
                  },
                  '$_id',
                  null,
                ],
              },
            },
            rejectedIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Rejected'] }, '$_id', null],
              },
            },
          },
        },
        {
          $project: {
            locationId: '$_id.locationId',
            entityId: '$_id.entityId',
            totalCount: 1,
            pendingCount: 1,
            completedCount: 1,
            acceptedCount: 1,
            approvalCount: 1,
            wipCount: 1,
            rejectedCount: 1,
            pendingIds: {
              $filter: {
                input: '$pendingIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            acceptedIds: {
              $filter: {
                input: '$acceptedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            approvalIds: {
              $filter: {
                input: '$approvalIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            completedIds: {
              $filter: {
                input: '$completedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            wipIds: {
              $filter: {
                input: '$wipIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            rejectedIds: {
              $filter: {
                input: '$rejectedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            completionPercentage: {
              $cond: [
                {
                  $eq: [
                    { $add: ['$pendingCount', '$completedCount', '$wipCount'] },
                    0,
                  ],
                },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        '$completedCount',
                        {
                          $add: [
                            '$pendingCount',
                            '$completedCount',
                            '$wipCount',
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
      ]);

      this.logger.debug(
        `trace id = ${randomNumber} - Aggregated ${locationwiseCounts.length} location-entity rows`,
        'capa.service.ts',
      );

      const locationwiseData = locations
        .map((loc) => {
          const locData = locationwiseCounts.filter(
            (item) => item.locationId === loc.id,
          );
          if (!locData.length) return null;

          const departmentwiseData = locData.map((entry) => {
            const dept = entities.find((e) => e.id === entry.entityId);
            return {
              departmentName: dept?.entityName || 'Department not found',
              ...entry,
            };
          });

          const total = locData.reduce(
            (acc, curr) => {
              acc.totalCount += curr.totalCount;
              acc.pendingCount += curr.pendingCount;
              acc.completedCount += curr.completedCount;
              acc.acceptedCount += curr.acceptedCount;
              acc.approvalCount += curr.approvalCount;
              acc.wipCount += curr.wipCount;
              acc.rejectedCount += curr.rejectedCount;
              return acc;
            },
            {
              totalCount: 0,
              pendingCount: 0,
              completedCount: 0,
              acceptedCount: 0,
              approvalCount: 0,
              wipCount: 0,
              rejectedCount: 0,
            },
          );

          return {
            locationName: loc.locationName,
            ...total,
            completionPercentage:
              total.totalCount > 0
                ? (total.completedCount / total.totalCount) * 100
                : 0,
            pendingIds: locData.flatMap((d) => d.pendingIds),
            acceptedIds: locData.flatMap((d) => d.acceptedIds),
            approvalIds: locData.flatMap((d) => d.approvalIds),
            completedIds: locData.flatMap((d) => d.completedIds),
            wipIds: locData.flatMap((d) => d.wipIds),
            rejectedIds: locData.flatMap((d) => d.rejectedIds),
            departmentwiseData,
          };
        })
        .filter(Boolean)
        .sort((a, b) =>
          a.locationName
            .toLowerCase()
            .localeCompare(b.locationName.toLowerCase()),
        );

      this.logger.debug(
        `trace id = ${randomNumber} - Computed ${locationwiseData.length} locations with data`,
        'capa.service.ts',
      );

      let grandTotalData = [];
      if (query.locationId?.includes('All')) {
        const grand = locationwiseCounts.reduce(
          (acc, curr) => {
            acc.totalCount += curr.totalCount;
            acc.pendingCount += curr.pendingCount;
            acc.completedCount += curr.completedCount;
            acc.acceptedCount += curr.acceptedCount;
            acc.approvalCount += curr.approvalCount;
            acc.wipCount += curr.wipCount;
            acc.rejectedCount += curr.rejectedCount;
            acc.pendingIds.push(...curr.pendingIds);
            acc.acceptedIds.push(...curr.acceptedIds);
            acc.approvalIds.push(...curr.approvalIds);
            acc.completedIds.push(...curr.completedIds);
            acc.wipIds.push(...curr.wipIds);
            acc.rejectedIds.push(...curr.rejectedIds);
            return acc;
          },
          {
            locationName: 'Grand Total',
            totalCount: 0,
            pendingCount: 0,
            completedCount: 0,
            acceptedCount: 0,
            approvalCount: 0,
            wipCount: 0,
            rejectedCount: 0,
            pendingIds: [],
            acceptedIds: [],
            approvalIds: [],
            completedIds: [],
            wipIds: [],
            rejectedIds: [],
            departmentwiseData: [],
          },
        );
        grand.completionPercentage =
          grand.totalCount > 0
            ? (grand.completedCount / grand.totalCount) * 100
            : 0;
        grandTotalData.push(grand);

        this.logger.debug(
          `trace id = ${randomNumber} - Grand total calculated`,
          'capa.service.ts',
        );
      }

      const finalData = query.locationId?.includes('All')
        ? [...locationwiseData, ...grandTotalData]
        : locationwiseData;

      this.logger.log(
        `trace id = ${randomNumber} - GET api/cara/getLocationwiseChartData successful`,
        'capa.service.ts',
      );

      return { table: finalData, chart: locationwiseData };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} - GET api/cara/getLocationwiseChartData failed: ${error.message}`,
        'capa.service.ts',
      );
      throw error;
    }
  }

  async getCapaDataforIds(user, randomNumber, query) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} - Incoming CAPA ID list: ${JSON.stringify(
          query.ids,
        )}`,
        'cip.controller.ts',
      );

      const capaIds = query.ids.map((id) => new ObjectId(id));
      const capas: any = await this.caraModel.find({ _id: { $in: capaIds } });

      this.logger.debug(
        `trace id = ${randomNumber} - Retrieved ${capas.length} CAPAs from caraModel`,
        'cip.controller.ts',
      );

      const data = [];
      let owner;

      for (let cara of capas) {
        this.logger.debug(
          `trace id = ${randomNumber} - Processing CAPA: ${cara._id}`,
          'cip.controller.ts',
        );

        const entity = await this.prisma.entity.findFirst({
          where: { id: cara.entityId },
          select: { id: true, entityId: true, entityName: true },
        });
        this.logger.debug(
          `trace id = ${randomNumber} - Entity: ${JSON.stringify(
            entity,
          )} for CAPA: ${cara._id}`,
          'cip.controller.ts',
        );

        const origin: any = await this.carasettings.findById(cara?.origin);
        this.logger.debug(
          `trace id = ${randomNumber} - Origin: ${
            origin?.deviationType || 'N/A'
          } for CAPA: ${cara._id}`,
          'cip.controller.ts',
        );

        const registeredUser: any = await this.prisma.user.findFirst({
          where: { id: cara.registeredBy },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatar: true,
            email: true,
          },
        });

        if (cara.caraOwner) {
          owner = await this.prisma.user.findFirst({
            where: {
              id: cara.caraOwner,
              organizationId: query.orgid,
            },
          });
          this.logger.debug(
            `trace id = ${randomNumber} - Owner: ${
              owner?.username || 'Not Found'
            } for CAPA: ${cara._id}`,
            'cip.controller.ts',
          );
        }

        const location = await this.prisma.location.findFirst({
          where: { id: cara.locationId },
          select: {
            id: true,
            locationId: true,
            locationName: true,
          },
        });

        const systems = await this.SystemModel.find(
          { _id: { $in: cara.systemId } },
          { _id: 1, name: 1 },
        );

        const depthead = await this.getDeptHeadForEntity(cara.entityId);
        this.logger.debug(
          `trace id = ${randomNumber} - Completed fetching references for CAPA: ${cara._id}`,
          'cip.controller.ts',
        );

        const data1 = {
          _id: cara._id,
          title: cara.title,
          organizationId: cara.organizationId,
          kpiId: cara.kpiId,
          registeredBy: registeredUser,
          caraOwner: cara.caraOwner
            ? {
                id: owner?.id,
                name: owner?.username,
                email: owner?.email,
              }
            : {},
          date: cara?.date,
          kpiReportLink: cara?.kpiReportLink,
          locationId: cara?.locationId,
          locationDetails: location,
          entityId: entity,
          systemId: systems,
          status: cara.status,
          description: cara?.description,
          origin: origin,
          startDate: cara.date?.startDate,
          endDate: cara.date?.endDate,
          year: cara.year,
          type: cara?.type,
          actionPointOwner: cara?.actionPointOwner,
          correctiveAction: cara?.correctiveAction,
          rootCauseAnalysis: cara?.rootCauseAnalysis,
          actualCorrectiveAction: cara?.actualCorrectiveAction,
          deviationType: cara?.deviationType,
          targetDate: cara?.targetDate,
          containmentAction: cara?.containmentAction,
          correctedDate: cara?.correctedDate,
          deptHead: depthead,
          files: cara?.files,
          registerfiles: cara?.registerfiles,
          attachments: cara?.attachments,
          serialNumber: cara?.serialNumber,
          comments: cara?.comments || '',
          why1: cara?.why1,
          why2: cara?.why2,
          why3: cara?.why3,
          why4: cara?.why4,
          why5: cara?.why5,
          man: cara?.man,
          material: cara?.material,
          measurement: cara?.measurement,
          method: cara?.method,
          environment: cara?.environment,
          machine: cara?.machine,
          impact: cara?.impact,
          highPriority: cara?.highPriority,
          createdAt: cara.createdAt?.$date
            ? new Date(cara.createdAt.$date)
            : cara.createdAt,
        };

        data.push(data1);

        this.logger.debug(
          `trace id = ${randomNumber} - Finished processing CAPA: ${cara._id}`,
          'cip.controller.ts',
        );
      }

      this.logger.log(
        `trace id = ${randomNumber} - GET api/cara/getCapaforIds successful. Total CAPAs returned: ${data.length}`,
        'cip.controller.ts',
      );

      return data;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} - GET api/cara/getCapaforIds failed - ${
          error.stack || error.message
        }`,
        'cip.controller.ts',
      );
      throw error;
    }
  }

  // async mailForCapas(query, randomNumber) {
  //   try {
  //     //READ STATUS BASED ON STATUS GET THE MAILTEMPLATE

  //     const deptheads: any = await this.getDeptHeadForEntity(query.entityId);
  //     const originname = await this.carasettings
  //       .findById(new ObjectId(query?.origin))
  //       .select('deviationType');
  //     const createdBy = await this.prisma.user.findFirst({
  //       where: {
  //         id: query.registeredBy,
  //       },
  //       include: {
  //         organization: true,
  //       },
  //     });
  //     // console.log('createdbu', createdBy);
  //     const capaOwner = await this.prisma.user.findFirst({
  //       where: {
  //         id: query.caraOwner,
  //       },
  //       include: {
  //         organization: true,
  //       },
  //     });
  //     //if created both draft and open status
  //     if (query.status === 'Draft' || query.status === 'Open') {
  //       const mailTemplate = await this.mailTemplates.findOne({
  //         mailEvent: 'capaCreate',
  //       });
  //       // console.log('mailTemplate', mailTemplate);

  //       if (mailTemplate) {
  //         let { subject, body } = mailTemplate;
  //         const ccEmails = deptheads
  //           .map((depthead) => depthead.email)
  //           .join(', ');
  //         // console.log('ccEmails', ccEmails);
  //         // Replace placeholders in the body with user emails for CC
  //         const capaTitle = query.title || 'No Title'; // Assuming query contains capaTitle
  //         const protocol = process.env.PROTOCOL;
  //         const realmName = createdBy?.organization?.realmName;
  //         const redirectUrl = process.env.REDIRECT;
  //         // console.log('createdBy', createdBy, capaTitle, originname);

  //         body = body
  //           .replace(/\${createdBy}/g, createdBy?.firstname || 'Unknown')
  //           .replace(/\${title}/g, capaTitle)
  //           .replace(
  //             /\${origin}/g,
  //             originname?.deviationType || 'Unknown Origin',
  //           )
  //           .replace(
  //             /\${link}/g,
  //             `${protocol}://${realmName}.${redirectUrl}/cara`,
  //           );
  //         body = body
  //           .replace(
  //             /<table>/g,
  //             `<table style="border-collapse: collapse; width: 100%;">`,
  //           )
  //           .replace(
  //             /<td>/g,
  //             `<td style="padding: 8px; border: 1px solid #ddd;">`,
  //           )
  //           .replace(/<tr>/g, `<tr>`)
  //           .replace(/<\/table>/g, `</table>`);
  //         try {
  //           if (process.env.MAIL_SYSTEM === 'IP_BASED') {
  //             const updatedCcEmails = [ccEmails, createdBy.email];
  //             const result = await this.emailService.sendBulkEmails(
  //               updatedCcEmails,
  //               subject,
  //               body,
  //             );
  //             //console.log('sent mail');
  //           } else {
  //             try {
  //               const msg = {
  //                 to: createdBy.email,
  //                 cc: ccEmails,
  //                 from: process.env.FROM,
  //                 subject: subject,
  //                 html: body,
  //               };
  //               const finalResult = await sgMail.send(msg);
  //               // console.log('sent mail with SendGrid');
  //             } catch (error) {
  //               throw error;
  //             }
  //           }
  //           //////console.log('mail sent in review');
  //         } catch (error) {
  //           if (
  //             error.response &&
  //             error.response.body &&
  //             error.response.body.errors
  //           ) {
  //           } else {
  //           }
  //         }
  //       }
  //     }
  //     //if capa is rejected
  //     if (query.status === 'Rejected') {
  //       const mailTemplate = await this.mailTemplates.findOne({
  //         mailEvent: 'capaRejected',
  //       });
  //       // console.log('mailTemplate', mailTemplate);

  //       if (mailTemplate) {
  //         let { subject, body } = mailTemplate;
  //         const ccEmails = deptheads
  //           .map((depthead) => depthead.email)
  //           .join(', ');

  //         // console.log('ccEmails', ccEmails);
  //         // Replace placeholders in the body with user emails for CC
  //         const capaTitle = query.title || 'No Title'; // Assuming query contains capaTitle
  //         const protocol = process.env.PROTOCOL;
  //         const realmName = createdBy?.organization?.realmName;
  //         const redirectUrl = process.env.REDIRECT;
  //         // console.log('createdBy', createdBy, capaTitle, originname);
  //         subject = subject.replace(/\${title}/g, capaTitle);
  //         body = body
  //           .replace(/\${user}/g, createdBy?.firstname || 'Unknown')
  //           .replace(/\${title}/g, capaTitle)
  //           .replace(
  //             /\${originname}/g,
  //             originname?.deviationType || 'Unknown Origin',
  //           )
  //           .replace(/\${comments}/g, query.comments || 'no reason')
  //           .replace(
  //             /\${link}/g,
  //             `${protocol}://${realmName}.${redirectUrl}/cara`,
  //           ); // Replace link
  //         body = body
  //           .replace(
  //             /<table>/g,
  //             `<table style="border-collapse: collapse; width: 100%;">`,
  //           )
  //           .replace(
  //             /<td>/g,
  //             `<td style="padding: 8px; border: 1px solid #ddd;">`,
  //           )
  //           .replace(/<tr>/g, `<tr>`)
  //           .replace(/<\/table>/g, `</table>`);
  //         // console.log('body', body);

  //         try {
  //           if (process.env.MAIL_SYSTEM === 'IP_BASED') {
  //             const updatedCcEmails = [ccEmails, createdBy.email];
  //             const result = await this.emailService.sendBulkEmails(
  //               updatedCcEmails,
  //               subject,
  //               body,
  //             );
  //             console.log('sent mail');
  //           } else {
  //             try {
  //               const msg = {
  //                 to: createdBy.email,
  //                 cc: ccEmails,
  //                 from: process.env.FROM,
  //                 subject: subject,
  //                 html: body,
  //               };
  //               const finalResult = await sgMail.send(msg);
  //               // console.log('sent mail with SendGrid');
  //             } catch (error) {
  //               throw error;
  //             }
  //           }
  //           //////console.log('mail sent in review');
  //         } catch (error) {
  //           if (
  //             error.response &&
  //             error.response.body &&
  //             error.response.body.errors
  //           ) {
  //           } else {
  //           }
  //         }
  //       }
  //     }
  //     //if capa owner  submits the analysis to DH

  //     if (
  //       query.correctiveAction &&
  //       query.targetDate &&
  //       query.rootCauseAnalysis &&
  //       query.status === 'Analysis_In_Progress'
  //     ) {
  //       const mailTemplate = await this.mailTemplates.findOne({
  //         mailEvent: 'capaAnalysisInProgress',
  //       });
  //       // console.log('mailTemplate', mailTemplate);

  //       if (mailTemplate) {
  //         let { subject, body } = mailTemplate;
  //         const ccEmails = deptheads
  //           .map((depthead) => depthead.email)
  //           .join(', ');

  //         // Replace placeholders in the body with user emails for CC
  //         const capaTitle = query.title || 'No Title'; // Assuming query contains capaTitle
  //         const protocol = process.env.PROTOCOL;
  //         const realmName = createdBy?.organization?.realmName;
  //         const redirectUrl = process.env.REDIRECT;
  //         // console.log('createdBy', createdBy, capaTitle, originname);
  //         subject = subject.replace(/\${title}/g, capaTitle);
  //         body = body
  //           .replace(/\${user}/g, capaOwner?.firstname || 'Unknown')
  //           .replace(/\${title}/g, capaTitle)
  //           .replace(
  //             /\${originname}/g,
  //             originname?.deviationType || 'Unknown Origin',
  //           )
  //           .replace(/\${comments}/g, query.comments || 'no reason')
  //           .replace(
  //             /\${link}/g,
  //             `${protocol}://${realmName}.${redirectUrl}/cara`,
  //           );
  //         body = body
  //           .replace(
  //             /<table>/g,
  //             `<table style="border-collapse: collapse; width: 100%;">`,
  //           )
  //           .replace(
  //             /<td>/g,
  //             `<td style="padding: 8px; border: 1px solid #ddd;">`,
  //           )
  //           .replace(/<tr>/g, `<tr>`)
  //           .replace(/<\/table>/g, `</table>`);
  //         try {
  //           if (process.env.MAIL_SYSTEM === 'IP_BASED') {
  //             // const allCcEmails = [...new Set([...ccEmails, capaOwner.email])];
  //             const updatedCcEmails = [...ccEmails, capaOwner.email];
  //             const result = await this.emailService.sendBulkEmails(
  //               updatedCcEmails,
  //               subject,
  //               body,
  //             );
  //             console.log('sent mail');
  //           } else {
  //             try {
  //               const updatedCcEmails = [ccEmails, capaOwner.email];
  //               console.log('updatedCCemails', updatedCcEmails);
  //               const msg = {
  //                 to: createdBy.email,
  //                 cc: updatedCcEmails,
  //                 from: process.env.FROM,
  //                 subject: subject,
  //                 html: body,
  //               };
  //               const finalResult = await sgMail.send(msg);
  //               // console.log('sent mail with SendGrid');
  //             } catch (error) {
  //               throw error;
  //             }
  //           }
  //           //////console.log('mail sent in review');
  //         } catch (error) {
  //           if (
  //             error.response &&
  //             error.response.body &&
  //             error.response.body.errors
  //           ) {
  //           } else {
  //           }
  //         }
  //       }
  //     }
  //     //if capa owner  submits the outcome to DH
  //     if (
  //       query.actualCorrectiveAction &&
  //       query.correctedDate &&
  //       query.status === 'Outcome_In_Progress'
  //     ) {
  //       const mailTemplate = await this.mailTemplates.findOne({
  //         mailEvent: 'capaOutcomeInProgress',
  //       });
  //       // console.log('mailTemplate', mailTemplate);

  //       if (mailTemplate) {
  //         let { subject, body } = mailTemplate;
  //         const ccEmails = deptheads
  //           .map((depthead) => depthead.email)
  //           .join(', ');

  //         const capaTitle = query.title || 'No Title';
  //         const protocol = process.env.PROTOCOL;
  //         const realmName = createdBy?.organization?.realmName;
  //         const redirectUrl = process.env.REDIRECT;

  //         subject = subject.replace(/\${title}/g, capaTitle);
  //         body = body
  //           .replace(/\${user}/g, capaOwner?.firstname || 'Unknown')
  //           .replace(/\${title}/g, capaTitle)
  //           .replace(
  //             /\${originname}/g,
  //             originname?.deviationType || 'Unknown Origin',
  //           )
  //           .replace(/\${comments}/g, query.comments || 'no reason')
  //           .replace(
  //             /\${link}/g,
  //             `${protocol}://${realmName}.${redirectUrl}/cara`,
  //           ); // Replace link

  //         try {
  //           if (process.env.MAIL_SYSTEM === 'IP_BASED') {
  //             // const allCcEmails = [...new Set([...ccEmails, capaOwner.email])];
  //             const updatedCcEmails = [ccEmails, capaOwner.email];
  //             const result = await this.emailService.sendBulkEmails(
  //               updatedCcEmails,
  //               subject,
  //               body,
  //             );
  //             console.log('sent mail');
  //           } else {
  //             try {
  //               const updatedCcEmails = [ccEmails, capaOwner.email];
  //               // console.log('updatedccemails', updatedCcEmails);
  //               const msg = {
  //                 to: createdBy.email,
  //                 cc: updatedCcEmails,
  //                 from: process.env.FROM,
  //                 subject: subject,
  //                 html: body,
  //               };
  //               const finalResult = await sgMail.send(msg);
  //               // console.log('sent mail with SendGrid');
  //             } catch (error) {
  //               throw error;
  //             }
  //           }
  //           //////console.log('mail sent in review');
  //         } catch (error) {
  //           if (
  //             error.response &&
  //             error.response.body &&
  //             error.response.body.errors
  //           ) {
  //           } else {
  //           }
  //         }
  //       }
  //     }
  //     if (query.status === 'Closed') {
  //       const mailTemplate = await this.mailTemplates.findOne({
  //         mailEvent: 'capaClosed',
  //       });
  //       // console.log('mailTemplate', mailTemplate);

  //       if (mailTemplate) {
  //         let { subject, body } = mailTemplate;
  //         const ccEmails = deptheads
  //           .map((depthead) => depthead.email)
  //           .join(', ');

  //         // Replace placeholders in the body with user emails for CC
  //         const capaTitle = query.title || 'No Title'; // Assuming query contains capaTitle
  //         const protocol = process.env.PROTOCOL;
  //         const realmName = createdBy?.organization?.realmName;
  //         const redirectUrl = process.env.REDIRECT;
  //         // console.log('createdBy', createdBy, capaTitle, originname);
  //         subject = subject.replace(/\${title}/g, capaTitle);
  //         body = body
  //           .replace(/\${user}/g, capaOwner?.firstname || 'Unknown')
  //           .replace(/\${title}/g, capaTitle)
  //           .replace(
  //             /\${originname}/g,
  //             originname?.deviationType || 'Unknown Origin',
  //           )
  //           .replace(/\${comments}/g, query.comments || 'no reason')
  //           .replace(
  //             /\${link}/g,
  //             `${protocol}://${realmName}.${redirectUrl}/cara`,
  //           ); // Replace link

  //         // console.log('body', body);
  //         // const allCcEmails = [...new Set([...ccEmails, capaOwner.email])];
  //         // console.log('ccEmails', allCcEmails, capaOwner.email);
  //         try {
  //           if (process.env.MAIL_SYSTEM === 'IP_BASED') {
  //             // const allCcEmails = [...new Set([...ccEmails, capaOwner.email])];
  //             const updatedCcEmails = [
  //               ccEmails,
  //               capaOwner.email,
  //               createdBy.email,
  //             ];
  //             const result = await this.emailService.sendBulkEmails(
  //               updatedCcEmails,
  //               subject,
  //               body,
  //             );
  //             console.log('sent mail');
  //           } else {
  //             try {
  //               const updatedCcEmails = [ccEmails, capaOwner.email];
  //               // console.log('updatedccemails', updatedCcEmails);
  //               const msg = {
  //                 to: createdBy.email,
  //                 cc: updatedCcEmails,
  //                 from: process.env.FROM,
  //                 subject: subject,
  //                 html: body,
  //               };
  //               const finalResult = await sgMail.send(msg);
  //               // console.log('sent mail with SendGrid');
  //             } catch (error) {
  //               throw error;
  //             }
  //           }
  //           //////console.log('mail sent in review');
  //         } catch (error) {
  //           if (
  //             error.response &&
  //             error.response.body &&
  //             error.response.body.errors
  //           ) {
  //           } else {
  //           }
  //         }
  //       }
  //     }
  //     this.logger.log(`api/cara/capaMails successful`);
  //   } catch (error) {
  //     this.logger.error(`GET api/cara/capaMails failed ${error}`);
  //   }
  // }
  async mailForCapas(query, randomNumber) {
    try {
      const deptheads: any = await this.getDeptHeadForEntity(query.entityId);
      const originname = await this.carasettings
        .findById(query?.origin)
        .select('deviationType');
      const createdBy = await this.prisma.user.findFirst({
        where: { id: query.registeredBy },
        include: { organization: true },
      });
      const capaOwner = await this.prisma.user.findFirst({
        where: { id: query.caraOwner },
        include: { organization: true },
      });

      const protocol = process.env.PROTOCOL;
      const realmName = createdBy?.organization?.realmName;
      const redirectUrl = process.env.REDIRECT;
      const mailSystem = process.env.MAIL_SYSTEM;

      const sendEmail = async (to, cc, ipcc, subject, body) => {
        if (mailSystem === 'IP_BASED') {
          const result = await this.emailService.sendBulkEmails(
            ipcc,
            subject,
            body,
          );
          // console.log('Sent mail via IP-based system');
        } else {
          const msg = { to, cc, from: process.env.FROM, subject, html: body };
          const finalResult = await sgMail.send(msg);
          // console.log('Sent mail via SendGrid');
        }
      };

      const sendMail = async (status, mailEvent) => {
        const mailTemplate = await this.mailTemplates.findOne({ mailEvent });
        if (mailTemplate) {
          let { subject, body } = mailTemplate;
          const ccEmails = deptheads
            .map((depthead) => depthead.email)
            .join(', ');
          const capaTitle = query.title || 'No Title';

          subject = subject.replace(/\${title}/g, capaTitle);

          body = body
            .replace(/\${user}/g, capaOwner?.firstname || 'Unknown')
            .replace(/\${owner}/g, capaOwner?.firstname || 'Unknown')
            .replace(/\${createdBy}/g, createdBy?.firstname || 'Unknown')
            .replace(/\${title}/g, capaTitle)
            .replace(
              /\${origin}/g,
              originname?.deviationType || 'Unknown Origin',
            )
            .replace(/\${comments}/g, query.comments || 'No comments')
            .replace(
              /\${link}/g,
              `${protocol}://${realmName}.${redirectUrl}/cara`,
            )
            .replace(
              /<table>/g,
              `<table style="border-collapse: collapse; width: 100%;">`,
            )
            .replace(
              /<td>/g,
              `<td style="padding: 8px; border: 1px solid #ddd;">`,
            )
            .replace(/<tr>/g, `<tr>`)
            .replace(/<\/table>/g, `</table>`);

          const allCcEmails = [...new Set([ccEmails, capaOwner.email])];
          const to = createdBy.email;
          const cc = allCcEmails;
          const ipccmails = [
            ...new Set([ccEmails, capaOwner.email, createdBy.email]),
          ];

          await sendEmail(to, cc, ipccmails, subject, body);
        }
      };

      if (query.status === 'Draft' || query.status === 'Open') {
        await sendMail(query.status, 'capaCreate');
      } else if (query.status === 'Rejected') {
        await sendMail(query.status, 'capaRejected');
      } else if (
        query.correctiveAction &&
        query.targetDate &&
        query.rootCauseAnalysis &&
        query.status === 'Analysis_In_Progress'
      ) {
        await sendMail(query.status, 'capaAnalysisInProgress');
      } else if (
        query.actualCorrectiveAction &&
        query.correctedDate &&
        query.status === 'Outcome_In_Progress'
      ) {
        await sendMail(query.status, 'capaOutcomeInProgress');
      } else if (query.status === 'Closed') {
        await sendMail(query.status, 'capaClosed');
      }

      this.logger.log(`api/cara/capaMails successful`);
    } catch (error) {
      this.logger.error(`GET api/cara/capaMails failed ${error}`);
    }
  }
  //apis for analysis
  async createAnalysis(data, randomNumber) {
    try {
      this.logger.debug(
        `traceid=${randomNumber} - Incoming analysis payload: ${JSON.stringify(
          data,
        )}`,
        'cip.controller.ts',
      );

      // 1. Create analysis document
      const result = await this.analysisModel.create(data);

      if (result) {
        this.logger.debug(
          `traceid=${randomNumber} - Analysis created with _id=${result._id}`,
          'cip.controller.ts',
        );

        // 2. Fetch corresponding CAPA
        const cara = await this.caraModel.findById(data?.capaId);

        if (!cara) {
          this.logger.warn(
            `traceid=${randomNumber} - No CAPA found with id=${data?.capaId}`,
            'cip.controller.ts',
          );
        } else {
          this.logger.debug(
            `traceid=${randomNumber} - Fetched CAPA with id=${cara._id}`,
            'cip.controller.ts',
          );

          // 3. Update analysisId regardless of whether it exists (overwrite)
          const previousAnalysisId = cara.analysisId;
          cara.analysisId = result._id;

          await cara.save();

          this.logger.debug(
            `traceid=${randomNumber} - Updated CAPA: ${cara._id} with new analysisId=${result._id}, previous=${previousAnalysisId}`,
            'cip.controller.ts',
          );
        }
      } else {
        this.logger.warn(
          `traceid=${randomNumber} - Analysis creation returned null or undefined for data=${JSON.stringify(
            data,
          )}`,
          'cip.controller.ts',
        );
      }

      this.logger.log(
        `traceid=${randomNumber} - POST /api/cara/createAnalysis successful for capa id ${data?.capaId}`,
        'cip.controller.ts',
      );
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} - POST /api/cara/createAnalysis failed for capa id ${
          data?.capaId
        }, payload=${JSON.stringify(data)}, error=${
          error.stack || error.message
        }`,
        'cip.controller.ts',
      );
      throw error;
    }
  }

  async updateAnalysis(id, data, randomNumber) {
    try {
      this.logger.debug(
        `traceid=${randomNumber} PUT /api/cara/updateAnalysis/${id} - Incoming update payload: ${JSON.stringify(
          data,
        )}`,
        'cip.controller.ts',
      );

      const updatedAnalysis = await this.analysisModel.findOneAndUpdate(
        { capaId: id },
        { $set: data },
        { new: true },
      );

      if (updatedAnalysis) {
        this.logger.log(
          `traceid=${randomNumber} PUT /api/cara/updateAnalysis/${id} - Successfully updated for capaId=${data?.capaId}`,
          'cip.controller.ts',
        );
        return updatedAnalysis;
      } else {
        this.logger.warn(
          `traceid=${randomNumber} PUT /api/cara/updateAnalysis/${id} - No document found to update for capaId=${data?.capaId}`,
          'cip.controller.ts',
        );
        return null;
      }
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} PUT /api/cara/updateAnalysis/${id} - Update failed for capaId=${
          data?.capaId
        }, payload=${JSON.stringify(data)}, error=${
          error.stack || error.message
        }`,
        'cip.controller.ts',
      );
      throw error;
    }
  }

  async getCausesForCapa(id) {
    try {
      this.logger.debug(
        `GET /api/cara/getCausesForCapa - Fetching analysis for capaId=${id}`,
        'cip.controller.ts',
      );

      const res: any = await this.analysisModel
        .findOne({ capaId: id })
        .select('causes');

      if (!res) {
        this.logger.warn(
          `GET /api/cara/getCausesForCapa - No analysis found for capaId=${id}`,
          'cip.controller.ts',
        );
        return [];
      }

      if (!res.causes) {
        this.logger.warn(
          `GET /api/cara/getCausesForCapa - Analysis found but 'causes' field is empty for capaId=${id}`,
          'cip.controller.ts',
        );
        return [];
      }

      const causes = res.causes?.toObject ? res.causes.toObject() : res.causes;

      this.logger.debug(
        `GET /api/cara/getCausesForCapa - Raw causes structure: ${JSON.stringify(
          causes,
        )}`,
        'cip.controller.ts',
      );

      const result = Object.entries(causes)
        .filter(([key, values]) => Array.isArray(values) && values.length > 0)
        .map(([key, values]) => {
          const lastValidCause = (values as string[])
            .reverse()
            .find((cause) => cause.trim() !== '');

          return {
            id: uuidv4(),
            cause: lastValidCause || 'Unknown Cause',
          };
        });

      this.logger.debug(
        `GET /api/cara/getCausesForCapa - Final processed causes: ${JSON.stringify(
          result,
        )}`,
        'cip.controller.ts',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `GET /api/cara/getCausesForCapa - Error for capaId=${id}, error=${
          error.stack || error.message
        }`,
        'cip.controller.ts',
      );
      throw error;
    }
  }

  async getAnalysisForCapa(id, randomNumber) {
    try {
      this.logger.debug(
        `traceid=${randomNumber} GET /api/cara/getAnalysisForCapa/${id} - Fetching analysis document`,
        'cip.controller.ts',
      );

      const getAnalysis: any = await this.analysisModel.findOne({ capaId: id });

      if (!getAnalysis) {
        this.logger.warn(
          `traceid=${randomNumber} GET /api/cara/getAnalysisForCapa/${id} - No analysis found`,
          'cip.controller.ts',
        );
        return null;
      }

      this.logger.debug(
        `traceid=${randomNumber} GET /api/cara/getAnalysisForCapa/${id} - Analysis found: ${JSON.stringify(
          getAnalysis,
        )}`,
        'cip.controller.ts',
      );

      const { fishBone, rootCause } = getAnalysis;
      const categories = [
        'man',
        'machine',
        'environment',
        'method',
        'material',
        'measurement',
      ];

      let extractedWhy1 = [];
      if (fishBone) {
        extractedWhy1 = categories
          .flatMap((category) => fishBone[category] || [])
          .filter((item) => item.checked)
          .map((item) => item.textArea);

        this.logger.debug(
          `traceid=${randomNumber} - Extracted why1 from fishbone: ${JSON.stringify(
            extractedWhy1,
          )}`,
          'cip.controller.ts',
        );
      }

      // Ensure rootCause exists
      if (!rootCause) {
        getAnalysis.rootCause = {
          why1: [],
          why2: [],
          why3: [],
          why4: [],
          why5: [],
        };
      }

      // Merge extractedWhy1 into rootCause.why1
      getAnalysis.rootCause.why1 = extractedWhy1;

      this.logger.log(
        `traceid=${randomNumber} GET /api/cara/getAnalysisForCapa/${id} - Successful`,
        'cip.controller.ts',
      );

      return getAnalysis.toObject?.() || getAnalysis;
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} GET /api/cara/getAnalysisForCapa/${id} - Error occurred: ${
          error.stack || error.message
        }`,
        'cip.controller.ts',
      );
      throw error;
    }
  }

  async getCompleteOutcomeForCapa(id, randomNumber) {
    try {
      if (!id || id === undefined) {
        this.logger.warn(
          `trace id = ${randomNumber} GET api/cara/getCompleteOutcomeForCapa - Missing or invalid ID`,
          'cip.controller.ts',
        );
        return [];
      }

      this.logger.debug(
        `trace id = ${randomNumber} GET api/cara/getCompleteOutcomeForCapa/${id} - Fetching outcome from CARA model`,
        'cip.controller.ts',
      );

      const res: any = await this.caraModel.findById(id).select('outcome');

      if (!res || !res.outcome) {
        this.logger.warn(
          `trace id = ${randomNumber} GET api/cara/getCompleteOutcomeForCapa/${id} - No outcome data found`,
          'cip.controller.ts',
        );
        return [];
      }

      const outcomes = res.outcome;
      this.logger.debug(
        `trace id = ${randomNumber} - Found ${outcomes.length} outcome items`,
        'cip.controller.ts',
      );

      const dataPromises = outcomes.map(async (item) => {
        if (item.applicable) {
          try {
            const apiResponse = await this.actionItemModel.findById(item.id);
            this.logger.debug(
              `trace id = ${randomNumber} - Fetched actionItem for id ${item.id}`,
              'cip.controller.ts',
            );
            return {
              id: item.id,
              cause: item.cause,
              correctiveAction: item.correctiveAction,
              remarks: item.remarks,
              applicable: true,
              data: apiResponse,
              actionItemCreated: true,
            };
          } catch (err) {
            this.logger.error(
              `trace id = ${randomNumber} - Error fetching actionItem for id ${item.id}: ${err.message}`,
              'cip.controller.ts',
            );
            return {
              id: item.id,
              cause: item.cause,
              correctiveAction: item.correctiveAction,
              remarks: item.remarks,
              applicable: true,
              data: null,
              actionItemCreated: false,
            };
          }
        } else {
          return {
            id: item.id,
            cause: item.cause,
            correctiveAction: item.correctiveAction,
            remarks: item.remarks,
            applicable: false,
            actionItemCreated: item?.actionItemCreated ?? false,
          };
        }
      });

      const results = await Promise.all(dataPromises);

      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getCompleteOutcomeForCapa/${id} - Successfully processed ${results.length} outcomes`,
        'cip.controller.ts',
      );

      return results;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/cara/getCompleteOutcomeForCapa/${id} - Failed with error: ${
          error.stack || error.message
        }`,
        'cip.controller.ts',
      );
      throw error;
    }
  }

  //crud api for cara products
  async createCaraDefect(userid, data, randomNumber) {
    try {
      this.logger.debug(
        `createCaraDefect service started for ${data} and checking for duplicate`,
      );
      const defectExists = await this.capaDefects.find({
        organizationId: data.organizationId,
        locationId: data?.locationId,
        'productId.value': data?.productId?.value,
      });
      this.logger.debug(`check for duplicate complete ${defectExists}`);
      if (defectExists?.length > 0) {
        return new ConflictException();
      }
      const res = await this.capaDefects.create(data);

      this.logger.log(
        `traceid=${randomNumber} POST api/cara/createCaraDefect successful for payload ${data}`,
      );
      return res?._id;
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} POST api/cara/createCaraDefect failed ${error}`,
        error?.stack || error?.message,
      );
    }
  }
  async updateCaraDefect(userid, id, data, randomNumber) {
    try {
      this.logger.debug(`updateCaraDefect/${id} service started with ${data}`);
      const defectExists = await this.capaDefects.find({
        organizationId: data.organizationId,
        locationId: data?.locationId,
        'productId.value': data?.productId?.value,
        _id: { $ne: id },
      });
      this.logger.debug(`checked for duplicate ${defectExists}`);
      if (defectExists?.length > 0) {
        this.logger.debug(`duplicate exists return 409 conflict`);
        return new ConflictException();
      }
      const res = await this.capaDefects.findByIdAndUpdate(id, data);
      this.logger.log(
        `traceid=${randomNumber} PUT api/cara/updateCaraDefect/${id} successful for payload ${data}`,
      );
      return res?._id;
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} PUT api/cara/updateCaraDefect/${id} failed ${error}`,
        error?.stack || error?.message,
      );
    }
  }
  async getCaraDefect(userid, id, randomNumber) {
    try {
      this.logger.debug(`getCaraDefect service started for ${id}`);
      const res = await this.capaDefects.findById(id);

      this.logger.log(
        `traceid=${randomNumber} GET api/cara/getCaraDefect/${id} successful`,
      );
      return res;
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} GET api/cara/getCaraDefect/${id} failed ${error}`,
      );
    }
  }
  async deleteCaraDefect(userid, id, randomNumber) {
    try {
      this.logger.debug(`deleteCaraDefect started for kcid=${userid}`);
      const res = await this.capaDefects.findByIdAndDelete(id);
      this.logger.log(
        `traceid=${randomNumber} GET api/cara/deleteCaraDefect/${id} successful`,
      );
      return res;
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} GET api/cara/deleteCaraDefect/${id} failed ${error}`,
        error?.stack || error?.message,
      );
    }
  }
  async getDefectForProduct(userid, id, randomNumber) {
    try {
      this.logger.debug(
        `getDefectForProduct service started for kcId=${userid} and id ${id}`,
      );
      const res = await this.capaDefects.findOne({
        'productId.value': id,
      });
      // console.log('res', res);

      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getDefectForProduct/${id} successful`,
        '',
      );
      return res?.defectType ? res?.defectType : [];
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET api/cara/getDefectForProduct/${id} failed error=${error}`,
        '',
      );
    }
  }
  async getCaraDefects(userid, query, randomNumber) {
    try {
      this.logger.debug(
        `getCaraDefects started for kcid=${userid} with query ${query}`,
      );
      const page = parseInt(query.page, 10) || 1; // Default page = 1
      const limit = parseInt(query.limit, 10) || 10; // Default limit = 10
      const skip = (page - 1) * limit; // Calculate offset

      // Fetch defects from MongoDB
      const defects = await this.capaDefects
        .find({
          organizationId: query.organizationId,
          // locationId: query.locationId,
        })
        .skip(skip)
        .limit(limit);
      this.logger.debug(`fetched defects ${defects?.length}`);
      // Fetch all location details for the organization from Prisma
      const locations = await this.prisma.location.findMany({
        where: {
          organizationId: query.organizationId,
          // id: query.locationId,
        },
      });
      this.logger.debug(
        `fetched locations ${locations} and mapping locationdetails for each defect`,
      );
      // Map location details to defects
      const defectsWithLocations = defects.map((defect) => {
        return {
          ...defect.toObject(),
          locationDetails:
            locations.find((loc) => loc.id === defect.locationId) || null,
        };
      });

      this.logger.log(
        `traceid=${randomNumber} GET api/cara/getCaraDefectsByProduct for query ${JSON.stringify(
          query,
        )} successful`,
      );

      return {
        data: defectsWithLocations,
        count: await this.capaDefects.countDocuments({
          organizationId: query.organizationId,
        }),
      };
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} GET api/cara/getCaraDefectsByProduct failed ${error} for query ${JSON.stringify(
          query,
        )}`,
      );
      throw error;
    }
  }

  async getProductForLocation(user, id, uuid) {
    const activeuser = await this.prisma.user.findFirst({
      where: {
        kcId: user,
      },
    });
    try {
      this.logger.debug(`getProductForLocation started for ${activeuser}`);
      let entities = [];

      // console.log('active user', activeuser);
      const entityTypeId = await this.prisma.entityType.findFirst({
        where: {
          organizationId: activeuser.organizationId,
          deleted: false,
          name: {
            equals: 'Product',
            mode: 'insensitive',
          },
        },
      });
      this.logger.debug(`fetched entityTypeId for Product ${entityTypeId}`);
      // console.log('entityType id', entityTypeId);
      if (id == 'All') {
        this.logger.debug(`id is All condition`);
        entities = await this.prisma.entity.findMany({
          where: {
            organizationId: activeuser.organizationId,
            deleted: false,
            entityTypeId: entityTypeId.id,
          },
          select: {
            id: true,
            entityId: true,
            entityName: true,
          },
          orderBy: { entityName: 'asc' },
        });
        this.logger.debug(`fetched entities for All ${entities.length}`);
      } else {
        this.logger.debug(`inside id not all`);
        entities = await this.prisma.entity.findMany({
          where: {
            locationId: id,
            organizationId: activeuser.organizationId,
            deleted: false,
            entityTypeId: entityTypeId.id,
          },
          select: {
            id: true,
            entityId: true,
            entityName: true,
          },
          orderBy: { entityName: 'asc' },
        });
        this.logger.debug(
          `fetched entities ${entities.length} for given location `,
        );
      }
      this.logger.log(
        `trace id = ${uuid} GET api/cara/getEntitiesByLocation/${id} successful`,
        'Cara-service',
      );
      // console.log('entities', entities);
      return entities;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} Get api/cara/getEntitiesForLocation/${id} failed ${error}`,
        'Cara-service',
      );
      return error;
    }
  }
  async createSettings(userid, data) {
    try {
      this.logger.debug(
        `createSetting for rca started ${data} initated by kcId=${userid}`,
      );
      const res = await this.capaRcaSettings.create(data);
      this.logger.log(
        `api/cara/createCaraRcaSettings service successful for pyalod ${data}`,
        '',
      );
      return res?._id;
    } catch (error) {
      this.logger.log(
        `api/cara/createCaraRcaSettings service failed for pyalod ${data}`,
        '',
      );
    }
  }
  async updateCaraRcaSettings(userid, id, data) {
    try {
      this.logger.debug(
        `updateCaraRcaSettings started for ${id} kcId=${userid} with data=${data}`,
      );
      const res = await this.capaRcaSettings.findByIdAndUpdate(id, data);
      this.logger.log(
        `api/cara/updateCaraRcaSettings/${id} service successful for pyalod ${data}`,
        '',
      );
      return res?._id;
    } catch (error) {
      this.logger.log(
        `api/cara/updateCaraRcaSettings/${id} service failed for pyalod ${data}`,
        '',
      );
    }
  }
  async getCaraRcaSettings(userid, id, query) {
    const activeuser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });
    try {
      this.logger.debug(`getCaraRcaSettings started kcId=${userid} id=${id} `);
      const res = await this.capaRcaSettings.find({
        organizationId: activeuser?.organizationId,
      });
      this.logger.log(`api/cara/getCaraRcaSettings service successful`, '');
      return res;
    } catch (error) {
      this.logger.error(
        `api/cara/getCaraRcaSettings/${id} service failed ${error}`,
        '',
      );
    }
  }
  async getCaraRcaSettingsForLocation(userid, id) {
    try {
      this.logger.debug(
        `getCaraRcaSettingsForLocation started for id=${id} kcId=${userid}`,
      );
      const res: any = await this.capaRcaSettings.findOne({
        locationId: id,
      });
      this.logger.debug(`fetched settings ${res}`);
      // console.log('res', res);
      this.logger.log(
        `api/cara/getCaraRcaSettingsForLocation/${id} service successful`,
        '',
      );
      return res?.analysisType || 'Basic';
    } catch (error) {
      this.logger.error(
        `api/cara/getCaraRcaSettingsForLocation/${id} service failed ${error}`,
        '',
      );
    }
  }
  async getCapaById(id, randomNumber) {
    try {
      const data = {};
      let owner;
      this.logger.debug(`getCapaById service started for id=${id}`);
      const cara: any = await this.caraModel.findById(id);
      this.logger.debug(`fetched cara ${cara}`);
      const entity = await this.prisma.entity.findFirst({
        where: {
          id: cara.entityId,
        },
      });
      let coordinator;

      if (!!cara.caraCoordinator && cara.caraCoordinator !== undefined) {
        coordinator = await this.prisma.user.findFirst({
          where: {
            id: cara.caraCoordinator,
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatar: true,
            email: true,
          },
        });
      }
      const user: any = await this.prisma.user.findFirst({
        where: {
          id: cara.registeredBy,
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          username: true,
          avatar: true,
          email: true,
        },
      });

      if (cara.caraOwner !== undefined || cara.caraOwner === '') {
        owner = await this.prisma.user.findFirst({
          where: {
            id: cara.caraOwner,
            //  organizationId: act.orgid,
          },
        });
      }
      const location = await this.prisma.location.findFirst({
        where: {
          id: cara.locationId,
        },
        select: {
          id: true,
          locationId: true,
          locationName: true,
        },
      });
      const systemIds = cara.systemId;
      let systems;
      // Fetching multiple systems based on the array of system IDs and selecting only _id and name
      if (systemIds.length > 0) {
        systems = await this.SystemModel.find(
          { _id: { $in: systemIds } },
          { _id: 1, name: 1 }, // Projection: Include only _id and name fields
        );
      }
      const impactytpe = await this.impactModel
        .findById(cara.impactType)
        .select('impactType');
      const depthead = await this.getDeptHeadForEntity(cara.entityId);
      const origin: any = await this.carasettings.findById(cara?.origin);
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: cara.organizationId,
        },
      });
      let analysis;
      if (cara?.analysisLevel === 'Advanced') {
        analysis = await this.analysisModel.findOne({
          capaId: id,
        });
      }
      const data1 = {
        _id: cara._id,
        title: cara.title,
        organizationId: cara.organizationId,
        kpiId: cara.kpiId,
        registeredBy: user,
        caraCoordinator: coordinator,
        caraOwner: owner
          ? {
              id: owner.id,
              name: owner.firstname + '' + owner.lastname,
              email: owner.email,
            }
          : {},
        // deviationFromDate: cara?.deviationFromDate,
        // deviationToDate: cara?.deviationToDate,
        date: cara?.date,
        kpiReportLink: cara?.kpiReportLink,
        locationId: cara?.locationId,
        locationDetails: location,
        entityId: entity,
        systemId: systems,
        status: cara.status,
        description: cara?.description,
        origin: origin,
        createdAt: cara.createdAt?.$date
          ? new Date(cara.createdAt.$date) // Convert to a Date object
          : cara.createdAt,
        startDate: cara?.date?.startDate,
        endDate: cara?.date?.endDate,
        rootCauseAnalysis: cara?.rootCauseAnalysis,
        actualCorrectiveAction: cara?.actualCorrectiveAction,
        containmentAction: cara?.containmentAction,
        actionPointOwner: cara?.actionPointOwner,
        correctiveAction: cara?.correctiveAction,
        deviationType: cara?.deviationType,
        targetDate: cara?.targetDate,
        correctedDate: cara?.correctedDate,
        deptHead: depthead,
        files: cara.files,
        attachments: cara?.attachments,
        registerfiles: cara?.registerfiles,
        type: cara?.type,
        serialNumber: cara?.serialNumber,
        comments: cara?.comments ? cara.comments : '',
        why1: cara?.why1,
        why2: cara?.why2,
        why3: cara?.why3,
        why4: cara?.why4,
        why5: cara?.why5,
        man: cara?.man,
        material: cara?.material,
        measurement: cara?.measurement,
        method: cara?.method,
        environment: cara?.environment,
        machine: cara?.machine,
        impactType: impactytpe?.impactType,
        impact: cara.impact,
        highPriority: cara?.highPriority,
        organizationName: organization.realmName,
        advancedRootCause: analysis?.rootCause,
        isIsNot: analysis?.isIsNot,
        fishBone: analysis?.fishBone,
        defectType: cara?.defectType,
        outcome: cara?.outcome,
      };
      this.logger.debug(`returning json ${data1}`);
      // console.log('data while sending', data1);
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getCaraById/${id} successful`,
        'Cara-controller',
      );
      return { content: data1 };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getCaraById/${id} failed`,
        'Cara-controller',
      );
    }
  }
  async createWorkflowConfig(data, randomNumber) {
    try {
      this.logger.debug(`createWorkflowConfig for ${data} started`);
      const created = await this.workflowModel.create(data);
      this.logger.log(
        `trace id = ${randomNumber} POST /api/cara/createWorkflowConfig successful for payload ${data}`,
        'Cara-controller',
      );
      return created?._id;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} POST /api/cara/createWorkflowConfig failed for payload ${data} error:${error}`,
        'Cara-controller',
      );
    }
  }
  async updateWorkflowConfig(id, data, randomNumber) {
    try {
      const updated = await this.workflowModel.findByIdAndUpdate(id, data);
      this.logger.log(
        `trace id = ${randomNumber} PUT /api/cara/updateWorkflowConfig/${id} successful for payload ${data} `,
        'Cara-controller',
      );
      return updated._id;
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} PUT /api/cara/updateWorkflowConfig/${id} failed for payload ${data} error:${error}`,
        'Cara-controller',
      );
    }
  }
  async getWorkflowConfig(id, randomNumber) {
    try {
      const res = await this.workflowModel.findOne({
        organizationId: id,
      });
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getWorkflowConfig/${id} successful `,
        'Cara-controller',
      );
      return res;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getWorkflowConfig/${id} failed error:${error}`,
        'Cara-controller',
      );
    }
  }
  async getStatusWiseCapaCount(query, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getStatusWiseCapaCount successfull`,
        'Cara-controller',
      );

      this.logger.debug(
        `trace id = ${randomNumber} - Received query params: ${JSON.stringify(
          query,
        )}`,
        'Cara-controller',
      );

      const entityMatchCondition = query?.entityId?.includes('All')
        ? {}
        : { entityId: { $in: query.entityId } };

      const locationMatchCondition = query?.locationId?.includes('All')
        ? {}
        : { locationId: { $in: query.locationId } };

      this.logger.debug(
        `trace id = ${randomNumber} - Match conditions prepared: entity=${JSON.stringify(
          entityMatchCondition,
        )}, location=${JSON.stringify(locationMatchCondition)}`,
        'Cara-controller',
      );

      const countData = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: query.organizationId,
            year: query.year,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $group: {
            _id: {
              status: '$status',
            },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id.status',
            count: 1,
            ids: 1,
          },
        },
      ]);

      this.logger.debug(
        `trace id = ${randomNumber} - Aggregated status counts: ${JSON.stringify(
          countData,
        )}`,
        'Cara-controller',
      );

      const result = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: query.organizationId,
            year: query.year,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $count: 'totalCount',
        },
      ]);

      const totalCount = result[0]?.totalCount || 0;

      this.logger.debug(
        `trace id = ${randomNumber} - Total CAPA count: ${totalCount}`,
        'Cara-controller',
      );

      return { statusCount: countData, total: totalCount };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getStatusWiseCapaCount failed for query ${JSON.stringify(
          query,
        )} error=${error}`,
        'Cara-controller',
      );
    }
  }

  async getOriginWiseCapaCount(query, randomNumber) {
    try {
      this.logger.debug(
        `getORiginwisecapacount service started for query ${query}`,
      );
      const fetchOriginNames = async (originIds) => {
        const originSettings = await this.carasettings.find({
          _id: { $in: originIds },
        });
        const originNamesMap = {};
        originSettings.forEach((setting) => {
          originNamesMap[setting._id] = setting.deviationType;
        });
        return originNamesMap;
      };
      this.logger.debug(`fetchedORiginNames ${fetchOriginNames}`);
      const entityMatchCondition = query?.entityId?.includes('All')
        ? {} // No filter if "All" is present
        : { entityId: { $in: query.entityId } };

      const locationMatchCondition = query?.locationId?.includes('All')
        ? {} // No filter if "All" is present
        : { locationId: { $in: query.locationId } };
      this.logger.debug(
        `entity and lcoation condition build ${entityMatchCondition} ${locationMatchCondition}`,
      );
      const originData = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: query?.organizationId,
            year: query?.year,

            ...locationMatchCondition, // Apply location match condition
            ...entityMatchCondition, //Applying entity filter
          },
        },
        {
          $group: {
            _id: {
              Origin: '$origin', // Note: field name should be lowercase "origin"
              // status: '$status',
            },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            Origin: '$_id.Origin',

            count: 1,
            ids: 1,
          },
        },
      ]);
      this.logger.debug(`fetched orginData ${originData?.length}`);

      const orginDataIds = originData.map((item) => item.Origin);
      this.logger.debug(`fetched originIds ${orginDataIds}`);
      const myOriginDataOriginNames = await fetchOriginNames(orginDataIds);
      const originDataWithNames = originData.map((item) => ({
        Origin: myOriginDataOriginNames[item.Origin] || 'Unknown',
        // status: item.status,
        count: item.count,
        ids: item.ids,
      }));
      this.logger.debug(
        `fetched orginDataWithNames ${originDataWithNames?.length}`,
      );
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getOriginWiseCapaCount sucessful for query ${query}`,
        'Cara-controller',
      );
      return originDataWithNames;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getOriginWiseCapaCount failed for query ${query} error=${error}`,
        error?.stack || error.message,
      );
    }
  }

  async getOwnerWiseCapaCount(query, randomNumber) {
    try {
      this.logger.debug(`getOwnerWiseCapaCount started with ${query}`);
      const fetchUserNames = async (ids: any[]) => {
        const users = await this.prisma.user.findMany({
          where: {
            id: { in: ids },
          },
          select: {
            id: true,
            username: true,
          },
        });
        this.logger.debug(`fetched usernames ${fetchUserNames?.length}`);
        const userMap = {};
        users.forEach((user) => {
          userMap[user.id] = user.username;
        });
        return userMap;
      };

      const entityMatchCondition = query?.entityId?.includes('All')
        ? {}
        : { entityId: { $in: query.entityId } };

      const locationMatchCondition = query?.locationId?.includes('All')
        ? {}
        : { locationId: { $in: query.locationId } };
      this.logger.debug(
        `location and entity match cond ${locationMatchCondition} ${entityMatchCondition}`,
      );
      const coordinatorData = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: query?.organizationId,
            year: query?.year,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $group: {
            _id: '$caraCoordinator', // Group by coordinator ID
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            caraCoordinator: '$_id',
            count: 1,
            ids: 1,
          },
        },
      ]);
      this.logger.debug(`fetched coordinatorData ${coordinatorData?.length}`);
      const coordinatorIds = coordinatorData.map(
        (item) => item.caraCoordinator,
      );
      this.logger.debug(`fetched coordinatorids ${coordinatorIds}`);
      const userNamesMap = await fetchUserNames(coordinatorIds);

      const enrichedResults = coordinatorData.map((item) => ({
        caraCoordinator: item.caraCoordinator,
        coordinatorName: userNamesMap[item.caraCoordinator] || 'Unknown',
        count: item.count,
        ids: item.ids,
      }));
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getOwnerWiseCapaCount failed for query ${query} ${enrichedResults?.length} `,
        'Cara-controller',
      );

      return enrichedResults;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getOwnerWiseCapaCount failed for query ${query} error=${error}`,
        error?.stack || error?.message,
      );
    }
  }

  async getProductWiseCapaCount(query, randomNumber) {
    try {
      this.logger.debug(`getProductWiseCapaCount service started ${query}`);
      const entityMatchCondition = query?.entityId?.includes('All')
        ? {}
        : { entityId: { $in: query.entityId } };

      const locationMatchCondition = query?.locationId?.includes('All')
        ? {}
        : { locationId: { $in: query.locationId } };
      this.logger.debug(
        `location and entity mathc condition ${entityMatchCondition} ${locationMatchCondition}`,
      );
      const productData = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: query?.organizationId,
            year: query?.year,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $group: {
            _id: {
              productId: { $ifNull: ['$productId', 'None'] },
            },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            productId: '$_id.productId',
            count: 1,
            ids: 1,
          },
        },
      ]);
      this.logger.debug(`productData fetched ${productData?.length}`);
      // Step 2: Map productIds
      const productIds = productData
        .map((item) => item.productId)
        .filter((id) => id !== 'None'); // exclude 'None' for DB lookup
      this.logger.debug(`productIds ${productIds}`);
      const products = await this.prisma.entity.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          entityName: true,
        },
      });

      const productNameMap = {};
      products.forEach((p) => {
        productNameMap[p.id] = p.entityName;
      });

      // Step 3: Map product names
      const productDataWithNames = productData.map((item) => ({
        productId: item.productId,
        productName:
          item.productId === 'None'
            ? 'None'
            : productNameMap[item.productId] || 'Unknown',
        count: item.count,
        ids: item.ids,
      }));
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getProductWiseCapaCount successful for query ${query} ${productDataWithNames?.length} `,
        '',
      );
      return productDataWithNames;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getProductWiseCapaCount failed for query ${query} error=${error}`,
        error?.stack || error?.message,
      );
    }
  }

  async getMonthWiseCapaCount(query, randomNumber) {
    try {
      const entityMatchCondition = query?.entityId?.includes('All')
        ? {}
        : { entityId: { $in: query.entityId } };

      const locationMatchCondition = query?.locationId?.includes('All')
        ? {}
        : { locationId: { $in: query.locationId } };

      const year = query?.year;
      this.logger.debug(
        `getMonthwiseCapCount service started with ${query} location and entity match condtion ${locationMatchCondition} ${entityMatchCondition}`,
      );
      const monthWiseData = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: query?.organizationId,
            year: year,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            monthIndex: '$_id.month',
            count: 1,
            ids: 1,
          },
        },
      ]);

      // Build full list of 12 months
      this.logger.debug(`building conditon for framing months`);
      const isFinancialYear = /^\d{2}-\d{2}$/.test(query?.year);
      let startYear: number;
      let months: { monthIndex: number; year: number }[] = [];

      if (isFinancialYear) {
        this.logger.debug(`inside isFinancial year yy-yy+1`);
        // Example: "23-24" → 2023 to 2024 (Apr-Mar)
        const [start, end] = query.year
          .split('-')
          .map((v) => parseInt(`20${v}`, 10));
        startYear = start;

        months = [
          ...Array.from({ length: 9 }, (_, i) => ({
            monthIndex: i + 4, // April (4) to Dec (12)
            year: start,
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            monthIndex: i + 1, // Jan (1) to Mar (3)
            year: end,
          })),
        ];
        this.logger.debug(`months calculated ${months}`);
      } else if (/^\d{4}$/.test(query?.year)) {
        // Calendar year like "2024"
        this.logger.debug(`inside yyyy format`);
        startYear = parseInt(query.year, 10);

        months = Array.from({ length: 12 }, (_, i) => ({
          monthIndex: i + 1,
          year: startYear,
        }));
        this.logger.debug(`months for yyyy format ${months}`);
      } else {
        throw new Error(`Invalid year format: ${query.year}`);
      }

      // Merge actual results into full list
      const result = months.map(({ year, monthIndex }) => {
        const found = monthWiseData.find(
          (item) => item.monthIndex === monthIndex && item.year === year,
        );

        const monthName = new Date(year, monthIndex - 1).toLocaleString(
          'default',
          {
            month: 'long',
          },
        );

        return {
          year,
          monthIndex,
          monthName,
          count: found ? found.count : 0,
          ids: found ? found.ids : [],
        };
      });

      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getMonthWiseCapaCount success with res ${
          result?.length
        } for query ${JSON.stringify(query)}`,
        'Cara-controller',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getMonthWiseCapaCount failed for query ${JSON.stringify(
          query,
        )} error=${error}`,
        error?.stack || error?.message,
      );
    }
  }

  async getDefectTypeWiseCapaCount(query, randomNumber) {
    try {
      this.logger.debug(`getDefectTypeWiseCapaCount started with ${query}`);
      const entityMatchCondition = query?.entityId?.includes('All')
        ? {}
        : { entityId: { $in: query.entityId } };

      const locationMatchCondition = query?.locationId?.includes('All')
        ? {}
        : { locationId: { $in: query.locationId } };
      this.logger.debug(
        `entity and lcoation match condtion ${locationMatchCondition} ${entityMatchCondition}`,
      );

      const defectTypeData = await this.caraModel.aggregate([
        {
          $match: {
            organizationId: query?.organizationId,
            year: query?.year,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $group: {
            _id: {
              defectType: { $ifNull: ['$defectType', 'None'] },
            },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            defectType: '$_id.defectType',
            count: 1,
            ids: 1,
          },
        },
      ]);
      this.logger.debug(`processed defectypedata ${defectTypeData?.length}`);
      this.logger.log(
        `trace id = ${randomNumber} GET /api/cara/getDefectTypeWiseCapaCount failed for query ${query}`,
        'Cara-controller',
      );
      return defectTypeData;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getDefectTypeWiseCapaCount failed for query ${query} error=${error}`,
        error?.stack || error?.message,
      );
    }
  }
  async getCauseWiseCapaCount(query, randomNumber) {
    try {
      const entityMatchCondition = query?.entityId?.includes('All')
        ? {}
        : { entityId: { $in: query.entityId } };

      const locationMatchCondition = query?.locationId?.includes('All')
        ? {}
        : { locationId: { $in: query.locationId } };
      this.logger.debug(
        `getCauseWiseCapaCount started with ${query} and location-entity condtions ${locationMatchCondition} ${entityMatchCondition}`,
      );
      const result = await this.caraModel.aggregate([
        {
          $match: {
            analysisLevel: 'Advanced',
            year: query?.year,
            ...locationMatchCondition,
            ...entityMatchCondition,
          },
        },
        {
          $lookup: {
            from: 'analyses',
            let: { id: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$capaId', '$$id'] },
                },
              },
            ],
            as: 'analysis',
          },
        },
        { $unwind: '$analysis' },
        {
          $project: {
            capaId: '$_id',
            fishBoneArray: { $objectToArray: '$analysis.fishBone' },
          },
        },
        { $unwind: '$fishBoneArray' },
        {
          $unwind: {
            path: '$fishBoneArray.v',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            'fishBoneArray.v.checked': true,
          },
        },
        {
          $group: {
            _id: '$fishBoneArray.k', // Group by category: man, machine, etc.
            count: { $sum: 1 },
            capaIds: { $addToSet: '$capaId' },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
            capaIds: 1,
          },
        },
      ]);
      this.logger.debug(`getcausewise result ${result}`);
      // console.log('result', result);
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getCauseWiseCapaCount successful`,
        'Cara-controller',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/cara/getCauseWiseCapaCount failed for query ${query} error=${error}`,
        'Cara-controller',
      );
    }
  }
  async getCaraRcaSettingsForLocationInDashboard(userid, id) {
    this.logger.debug(
      `getCaraRcaSettingsForLocationInDashboard started for ${id} ${userid}`,
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userid,
        },
      });
      //handle for id==="all" if so get settings across org and return Advanced even if one lcoation has advanced type
      if (id === 'All') {
        this.logger.debug(`inside id is All condition`);
        const allSettings = await this.capaRcaSettings.find({
          organizationId: activeUser.organizationId,
        });

        const hasAdvanced = allSettings.some(
          (setting) => setting.analysisType === 'Advanced',
        );

        this.logger.log(
          `api/cara/getCaraRcaSettingsForLocationInDashboard/All service successful`,
          '',
        );

        return hasAdvanced ? 'Advanced' : 'Basic';
      } else {
        this.logger.debug(`inside else lcoationID not All`);
        const res: any = await this.capaRcaSettings.findOne({
          locationId: id,
        });

        this.logger.log(
          `api/cara/getCaraRcaSettingsForLocationInDashboard/${id} service successful`,
          '',
        );
        return res?.analysisType || 'Basic';
      }
    } catch (error) {
      this.logger.error(
        `api/cara/getCaraRcaSettingsForLocationInDashboard/${id} service failed ${error}`,
        '',
      );
    }
  }
}
