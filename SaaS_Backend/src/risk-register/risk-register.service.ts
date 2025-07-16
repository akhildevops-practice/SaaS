import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Riskschema,
  riskSchema,
} from './riskRegisterSchema/riskRegister.schema';
import {
  riskMitigation,
  riskMitigationDocument,
} from './riskRegisterSchema/riskMitigation.schema';
import { RiskConfig } from 'src/risk/riskConfigSchema/riskconfig.schema';
import {
  RiskReviewComments,
  RiskReviewCommentsSchema,
} from './riskRegisterSchema/riskReviewComments.schema';
import {
  HiraRegister,
  HiraRegisterSchema,
} from './hiraRegisterSchema/hiraRegister.schema';
import {
  HiraMitigation,
  HiraMitigationSchema,
} from './hiraRegisterSchema/hiraMitigation.schema';
import {
  HiraOwnerComments,
  HiraOwnerCommentsSchema,
} from './hiraRegisterSchema/hiraOwnerComments.schema';
import {
  HiraReviewComments,
  HiraReviewCommentsSchema,
} from './hiraRegisterSchema/hiraReviewComments.schema';
import {
  HiraTypeConfig,
  HiraTypeConfigSchema,
} from 'src/risk/schema/hiraTypesSchema/hiraTypes.schema';
import {
  HiraConsolidatedStatus,
  hiraConsolidatedStatusSchema,
} from './hiraRegisterSchema/hiraConsolidatedStatus.schema';

import {
  HiraReviewHistory,
  HiraReviewHistorySchema,
} from './hiraRegisterSchema/hiraReviewHistory.schema';

import { HiraChangesTrack } from './hiraRegisterSchema/hiraChangesTrack.schema';
import { RefsService } from 'src/refs/refs.service';
import { HiraConfig } from 'src/risk/schema/hiraConfigSchema/hiraconfig.schema';
import { HiraAreaMaster } from 'src/risk/schema/hiraAreaMasterSchema/hiraAreaMaster.schema';
import { Hira, HiraSchema } from './hiraRegisterSchema/hira.schema';
import {
  HiraSteps,
  HiraStepsSchema,
} from './hiraRegisterSchema/hiraSteps.schema';
import { PrismaService } from 'src/prisma.service';
import { ObjectId } from 'bson';
import * as sgMail from '@sendgrid/mail';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { OrganizationService } from 'src/organization/organization.service';
import { EmailService } from 'src/email/email.service';
import { Logger, log } from 'winston';
import { v4 as uuid } from 'uuid';
import auditTrial from '../watcher/changesStream';
import { CreateHiraDto } from './dto/create-hira.dto';
import { CreateHiraStepsDto } from './dto/create-hiraStep.dto';
import { UpdateHiraDto } from './dto/update-hira.dto';
import { UpdateHiraStepsDto } from './dto/update-hiraStep.dto';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import {
  getApproverMailTemplate,
  getCreatorAndReviewerMailTemplateWhenHiraIsRejected,
  getCreatorMailTemplateWhenHiraIsApproved,
  getResponsiblePersonMailTempalateWhenHiraIsApproved,
  getReviewerMailTemplate,
} from './hiraMailTemplates/templates';

const moment = require('moment');
sgMail.setApiKey(process.env.SMTP_PASSWORD);

@Injectable()
export class RiskRegisterService {
  constructor(
    @InjectModel(Riskschema.name) private riskModel: Model<Riskschema>,
    @InjectModel(riskMitigation.name)
    private riskMitigationModel: Model<riskMitigation>,
    @InjectModel(RiskConfig.name) private riskConfigModel: Model<RiskConfig>,
    @InjectModel(RiskReviewComments.name)
    private riskReviewCommentsModel: Model<RiskReviewComments>,

    @InjectModel(HiraRegister.name)
    private hiraRegisterModel: Model<HiraRegister>,
    @InjectModel(HiraMitigation.name)
    private hiraMitigationModel: Model<HiraMitigation>,
    @InjectModel(HiraOwnerComments.name)
    private hiraOwnerCommentsModel: Model<HiraOwnerComments>,
    @InjectModel(HiraReviewComments.name)
    private hiraReviewCommentsModel: Model<HiraReviewComments>,
    @InjectModel(HiraTypeConfig.name)
    private hiraTypeConfigModel: Model<HiraTypeConfig>,
    @InjectModel(HiraConsolidatedStatus.name)
    private hiraConsolidatedStatusModel: Model<HiraConsolidatedStatus>,

    @InjectModel(HiraReviewHistory.name)
    private hiraReviewHistoryModel: Model<HiraReviewHistory>,

    @InjectModel(HiraChangesTrack.name)
    private hiraChangesTrackModel: Model<HiraChangesTrack>,

    @InjectModel(HiraConfig.name) private hiraConfigModel: Model<HiraConfig>,
    @InjectModel(HiraAreaMaster.name)
    private hiraAreaMasterModel: Model<HiraAreaMaster>,
    @InjectModel(Hira.name) private hiraModel: Model<Hira>,
    @InjectModel(HiraSteps.name) private hiraStepsModel: Model<HiraSteps>,
    @Inject('Logger') private readonly logger: Logger,

    private readonly organizationService: OrganizationService,
    private readonly serialNumberService: SerialNumberService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private refsService: RefsService,
  ) {}

  async uploadsAttachment(files: any, data) {
    try {
      //file,req.query.realm.toLowerCase()
      //////console.log('check files', files);
      //////console.log('check data', data);

      const attachments = [];
      const realmName = data.realm.toLowerCase();
      let locationName;

      if (data?.locationName) {
        locationName = data?.locationName;
      } else {
        locationName = 'NoLocation';
      }

      for (let file of files) {
        const attachmentUrl = `${process.env.SERVER_IP}/${realmName}/${locationName}/risk/hiraAttachments/${file.filename}`;
        attachments.push({
          attachmentUrl,
          attachmentName: file.originalname,
        });
      }
      // const path = file.path;
      return attachments;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  getExcelObj(excelRow: any) {
    const filteredData = excelRow.filter((item: any) => !!item);

    let prevHeader = null;
    const excelObj = filteredData.reduce((acc: any, item: any) => {
      if (!prevHeader) {
        prevHeader = item;
        return { ...acc, [prevHeader]: null };
      } else {
        acc[prevHeader] = item;
        prevHeader = null;
      }
      return acc;
    }, {});

    return excelObj;
  }

  private async streamToBuffer(stream: fs.ReadStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  async import(file: any, userId: string, body: any) {
    try {
      // ─── Helpers ─────────────────────────────────────────────────────────────
      const parseDate = (str: string): Date | undefined => {
        if (!str || str === '-') return undefined;
        const parts = str.split(/[\/\-.]/).map((p) => p.trim());
        if (parts.length !== 3) return undefined;
        const [p1, p2, p3] = parts.map((p) => parseInt(p, 10));
        if ([p1, p2, p3].some((n) => isNaN(n))) return undefined;
        // choose format by separator
        let dd: number,
          mm: number,
          yyyy = p3 < 100 ? p3 + 2000 : p3;
        if (str.includes('/')) {
          mm = p1;
          dd = p2;
        } else {
          dd = p1;
          mm = p2;
        }
        return new Date(yyyy, mm - 1, dd);
      };

      const parseBool = (v: string) => String(v).toLowerCase() === 'yes';
      const parseNum = (v: any) =>
        typeof v === 'number' ? v : isNaN((v = parseInt(v, 10))) ? 0 : v;

      const extractLabel = (raw: string): string | undefined => {
        if (!raw || raw === '-') return undefined;
        // split on the first " - " and trim off anything after it
        return raw?.split('-', 1)[0]?.trim();
      };

      const normalizeLabel = (s: string): string =>
        s
          ?.trim()
          ?.toLowerCase()
          ?.replace(/\s*-\s*/g, '-') // "1 - Low" → "1-low"
          ?.replace(/\s+/g, ' '); // collapse extra spaces if any

      // ─── 1) File exists? ─────────────────────────────────────────────────────
      if (!fs.existsSync(file.path)) {
        throw new InternalServerErrorException('File not found');
      }

      // ─── 2) Load config & build lookup maps ──────────────────────────────────
      const {
        configId,
        organizationId,
        sheetName,
        stepsStartingFromRow = 2,
      } = body;

      const riskConfig = await this.hiraConfigModel
        .findOne({ _id: new ObjectId(configId), deleted: false })
        .lean();
      if (!riskConfig) {
        throw new InternalServerErrorException(`Config ${configId} not found`);
      }

      // console.log("risk COngif in import --->", riskConfig);

      // helper to build Map<label, idString>
      const makeMap = (opts: any[]) =>
        new Map(opts.map((o) => [normalizeLabel(o.label), o._id.toString()]));

      const riskTypeMap = makeMap(riskConfig.riskTypeOptions);
      const impactTypeMap = makeMap(riskConfig.impactTypeOptions);
      const existingRiskMap = makeMap(riskConfig.existingRiskRatingOptions);
      const targetRiskMap = makeMap(riskConfig.targetRiskRatingOptions);
      const existingKeyMap = makeMap(riskConfig.existingKeyControlOptions);
      const actualRiskMap = makeMap(riskConfig.actualRiskRatingOptions);
      const controlEffMap = makeMap(
        riskConfig.currentControlEffectivenessOptions,
      );
      const decisionMap = makeMap(riskConfig.riskManagementDecisionOptions);

      // console.log("targetRiskMap in import ---->", targetRiskMap);

      // Fetch "Risk Source" (hazard) list and build map: name → _id
      const hazardList = await this.hiraTypeConfigModel
        .find({ organizationId, type: 'hazard' })
        .select('_id name')
        .lean();

      // console.log("hazardList in import ---->", hazardList);

      const hazardMap = new Map(
        hazardList.map((h) => [h.name, h._id.toString()]),
      );

      // console.log("hazardMap in import ---->", hazardMap);

      // Build map for riskRatingRanges: normalized description → _id
      const riskRatingRangeMap = new Map(
        (riskConfig.riskRatingRanges || []).map((r: any) => [
          normalizeLabel(r.description),
          r._id.toString(),
        ]),
      );

      // ─── 3) Read & preprocess Excel ──────────────────────────────────────────
      const rowsToSkip = stepsStartingFromRow - 2;

      const fileBuffer = await this.streamToBuffer(
        fs.createReadStream(file.path),
      );
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new InternalServerErrorException('Invalid Sheet Name');
      }

      const rawExcelData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        dateNF: 'dd-mm-yyyy',
      });

      const dataRows = rawExcelData.slice(rowsToSkip).filter((row) => {
        const sno = Number(row[0]);
        return !isNaN(sno) && sno > 0;
      });

      // console.log("dataRows in import ---->", dataRows);
      // ─── 4) Map rows → JSON with ID lookups ──────────────────────────────────
      const jsonData = dataRows.map((row) => {
        const [
          sNoRaw,
          regDateStr,
          riskSourceStr,
          riskTypeStr,
          jobBasicStep,
          riskDetailedScenario,
          riskOwner,
          existingControl,
          impactTypeStr,
          likelihoodRaw,
          impactRaw,
          baseScoreRaw,
          existingRiskRaw,
          targetRiskRaw,
          existingKeyRaw,
          requireTreatmentRaw,
          additionalControl,
          targetDateStr,
          actualLikelyRaw,
          actualImpactRaw,
          residualScoreRaw,
          actualRiskRaw,
          controlEffRaw,
          residualAcceptedRaw,
          decisionStr,
          monitoringDetails,
          nextReviewDateStr,
          responsibilityStr,
        ] = row;

        // console.log("targetRiskRaw in import ---->", targetRiskRaw);

        const labelTargetRisk = extractLabel(targetRiskRaw);

        // normalize once per field
        const keyRiskSource = riskSourceStr;
        const keyRiskType = normalizeLabel(riskTypeStr);
        const keyImpactType = normalizeLabel(impactTypeStr);
        const keyExistingRisk = normalizeLabel(existingRiskRaw);
        const keyTargetRisk = normalizeLabel(labelTargetRisk || '');
        const keyExistingKey = extractLabel(existingKeyRaw);
        const keyActualRisk = extractLabel(actualRiskRaw);
        const keyControlEff = extractLabel(controlEffRaw);
        const keyDecision = normalizeLabel(decisionStr);

        // console.log("all key fields in import ---->",
        //   keyRiskSource, keyRiskType,
        //   keyImpactType, keyExistingRisk,
        //   keyTargetRisk, keyExistingKey, keyActualRisk,
        //   keyControlEff, keyDecision);

        // console.log("keyTargetRisk in import ---->", keyTargetRisk);

        const out: any = {
          sNo: parseNum(sNoRaw),
          regDate: parseDate(regDateStr),

          // 🔗 all lookups now normalize first
          riskSourceId: hazardMap.get(keyRiskSource),
          riskTypeId: riskTypeMap.get(keyRiskType),
          impactTypeId: impactTypeMap.get(keyImpactType),

          existingRiskRatingId: riskRatingRangeMap.get(keyExistingRisk),
          targetRiskRatingId: labelTargetRisk
            ? targetRiskMap.get(keyTargetRisk)
            : undefined,

          existingKeyControlId: keyExistingKey
            ? existingKeyMap.get(keyExistingKey)
            : undefined,
          actualRiskRatingId: keyActualRisk
            ? actualRiskMap.get(keyActualRisk)
            : undefined,
          currentControlEffectivenessId: keyControlEff
            ? controlEffMap.get(keyControlEff)
            : undefined,
          riskManagementDecisionId: decisionMap.get(keyDecision),

          // flat fields
          jobBasicStep,
          riskDetailedScenario,
          riskOwner,
          existingControl,
          likelihood: parseNum(likelihoodRaw),
          impact: parseNum(impactRaw),
          baseScore: parseNum(baseScoreRaw),
          requireRiskTreatment: parseBool(requireTreatmentRaw),
          additionalControlDescription:
            additionalControl && additionalControl !== '-'
              ? additionalControl
              : undefined,
          targetDate: parseDate(targetDateStr),
          actualLikelihood: parseNum(actualLikelyRaw),
          actualImpact: parseNum(actualImpactRaw),
          residualScore: parseNum(residualScoreRaw),
          residualRiskAccepted: parseBool(residualAcceptedRaw),
          monitoringDetails:
            monitoringDetails && monitoringDetails !== '-'
              ? monitoringDetails
              : undefined,
          nextReviewDate: parseDate(nextReviewDateStr),
        };

        // responsibility → array
        if (responsibilityStr && responsibilityStr !== '-') {
          out.responsibility = String(responsibilityStr)
            .split(/,| and /)
            .map((s) => s.trim());
        }

        // console.log("out targetRiskRaw in import ---->", out.targetRiskRatingId);

        return out;
      });

      const formattedData = jsonData.map((out) => {
        // pull flat fields off of `out`
        const {
          sNo,
          regDate,
          jobBasicStep,
          riskSourceId,
          riskDetailedScenario,
          riskOwner,
          existingControl,
          likelihood,
          impact,
          baseScore,
          requireRiskTreatment,
          additionalControlDescription,
          targetDate,
          responsibility,
          actualLikelihood,
          actualImpact,
          residualScore,
          residualRiskAccepted,
          monitoringDetails,
          nextReviewDate,

          // ID lookups
          riskTypeId,
          impactTypeId,
          existingRiskRatingId,
          targetRiskRatingId,
          existingKeyControlId,
          actualRiskRatingId,
          currentControlEffectivenessId,
          riskManagementDecisionId,
        } = out;

        // grab the full "details" objects from riskConfig
        const riskTypeDetails =
          riskConfig.riskTypeOptions.find(
            (o: any) => o._id.toString() === riskTypeId,
          ) || null;
        const impactTypeDetails =
          riskConfig.impactTypeOptions.find(
            (o: any) => o._id.toString() === impactTypeId,
          ) || null;
        const existingRiskRatingDetails =
          riskConfig.existingRiskRatingOptions.find(
            (o: any) => o._id.toString() === existingRiskRatingId,
          ) || null;
        const targetRiskRatingDetails =
          riskConfig.targetRiskRatingOptions.find(
            (o: any) => o._id.toString() === targetRiskRatingId,
          ) || null;
        const existingKeyControlDetails =
          riskConfig.existingKeyControlOptions.find(
            (o: any) => o._id.toString() === existingKeyControlId,
          ) || null;
        const actualRiskRatingDetails =
          riskConfig.actualRiskRatingOptions.find(
            (o: any) => o._id.toString() === actualRiskRatingId,
          ) || null;
        const currentControlEffectivenessDetails =
          riskConfig.currentControlEffectivenessOptions.find(
            (o: any) => o._id.toString() === currentControlEffectivenessId,
          ) || null;
        const riskManagementDecisionDetails =
          riskConfig.riskManagementDecisionOptions.find(
            (o: any) => o._id.toString() === riskManagementDecisionId,
          ) || null;

        // console.log("targetRiskRatingDetails in import ---->", targetRiskRatingDetails);

        return {
          sNo,
          // if you want a static subStepNo you can compute it here
          subStepNo: null,
          jobBasicStep,
          riskSource: riskSourceId,
          regDate,
          riskDetailedScenario,
          riskOwner,
          existingControl,
          likelihood,
          impact,
          baseScore,
          requireRiskTreatment,
          additionalControlDescription,
          targetDate,
          responsibility,
          actualLikelihood,
          actualImpact,
          residualScore,
          residualRiskAccepted,
          monitoringDetails,
          nextReviewDate,

          // nested doc for insertion
          riskDetails: {
            riskTypeId,
            impactType: {
              format: riskConfig.impactTypeFormat,
              id: impactTypeId,
            },
            existingRiskRatingId,
            targetRiskRatingId,
            existingKeyControlId,
            actualRiskRatingId,
            currentControlEffectivenessId,
            riskManagementDecisionId,
          },

          // flat "Details" for the frontend
          riskTypeDetails,
          riskConditionDetails: null,
          currentControlDetails: null,
          existingRiskRatingDetails,
          targetRiskRatingDetails,
          existingKeyControlDetails,
          actualRiskRatingDetails,
          currentControlEffectivenessDetails,
          riskManagementDecisionDetails,
          impactTypeDetails,
        };
      });
      console.log('formattedData in import   ---->', formattedData);

      // ─── 5) Cleanup & return ────────────────────────────────────────────────────
      fs.unlinkSync(file.path);
      this.logger.log(`...import succeeded`, '');
      return formattedData;
    } catch (error) {
      this.logger.error(`...import failed: ${error}`, '');
      throw new InternalServerErrorException(error);
    }
  }

  async createHiraWithStep(
    body: { hira: CreateHiraDto; step: CreateHiraStepsDto },
    user: any,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting createHiraWithStep`,
      JSON.stringify({ hira: body.hira, step: body.step }),
    );

    const session = await this.hiraModel.startSession();
    session.startTransaction();

    try {
      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: user.user.id }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({
          userId: activeUser.id,
          organizationId: activeUser.organizationId,
        }),
      );

      // Check for duplicate HIRA in the same department
      this.logger.debug(
        `traceId=${traceId} - Checking for duplicate HIRA`,
        JSON.stringify({
          jobTitle: body.hira.jobTitle,
          organizationId: activeUser.organizationId,
          categoryId: body?.hira?.categoryId,
          entityId: body.hira.entityId,
        }),
      );

      const findDuplicateInSameDept = await this.hiraModel
        .find({
          jobTitle: body.hira.jobTitle,
          organizationId: activeUser.organizationId,
          categoryId: body?.hira?.categoryId,
          entityId: body.hira.entityId,
          status: 'active',
        })
        .session(session); // Use session for transaction

      // If duplicate HIRA found, throw ConflictException
      if (findDuplicateInSameDept.length > 0) {
        this.logger.debug(
          `traceId=${traceId} - Duplicate HIRA found`,
          JSON.stringify({ duplicateCount: findDuplicateInSameDept.length }),
        );
        throw new ConflictException(
          'A HIRA with the same job title already exists in the department.',
        );
      }

      this.logger.debug(
        `traceId=${traceId} - No duplicates found, creating HIRA step`,
        JSON.stringify(body.step),
      );

      // Create the HIRA Step first (pass single object)
      const createdHiraStep = await this.hiraStepsModel.create(
        [
          {
            ...body.step,
            createdBy: activeUser.id,
            status: 'active',
          },
        ],
        { session }, // Ensure the step creation is part of the transaction
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA step created successfully`,
        JSON.stringify({ stepId: createdHiraStep[0]._id?.toString() }),
      );

      // console.log("createdHiraStep ------>>", createdHiraStep);

      // console.log('body.hira in createhirawithstep---------->', body);

      this.logger.debug(
        `traceId=${traceId} - Creating HIRA document`,
        JSON.stringify(body.hira),
      );

      // After creating the step, create the HIRA (pass single object)
      const createdHira = await this.hiraModel.create(
        [
          {
            ...body.hira,
            createdBy: activeUser.id,
            status: 'active',
            currentVersion: 0,
            workflowStatus: 'DRAFT',
            stepIds: [createdHiraStep[0]._id?.toString()],
          },
        ],
        { session }, // Ensure the HIRA creation is part of the transaction
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA document created successfully`,
        JSON.stringify({ hiraId: createdHira[0]._id?.toString() }),
      );

      // console.log('createdHira ------>>', createdHira);

      // console.log("session ------>>", session);

      // Commit the transaction if both operations succeed
      await session.commitTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction committed successfully`,
        JSON.stringify({ success: true }),
      );

      // Return the created HIRA, including the steps
      return { ...createdHira, traceId };
    } catch (error) {
      // Rollback the transaction if any error occurs
      await session.abortTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction aborted due to error`,
        JSON.stringify({ error: error }),
      );

      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException for duplicates
      } else {
        // Throw internal server error if something goes wrong
        throw new InternalServerErrorException(
          'An error occurred while creating the HIRA and Step.',
        );
      }
    }
  }

  async createHiraWithMultipleSteps(body: any, user: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting createHiraWithMultipleSteps`,
      JSON.stringify({ hira: body.hira, stepsCount: body.steps?.length }),
    );

    const session = await this.hiraModel.startSession();
    session.startTransaction();

    try {
      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: user.user.id }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.user.id },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({
          userId: activeUser.id,
          organizationId: activeUser.organizationId,
        }),
      );

      // Check for duplicate HIRA in the same department
      this.logger.debug(
        `traceId=${traceId} - Checking for duplicate HIRA`,
        JSON.stringify({
          jobTitle: body.hira.jobTitle,
          organizationId: activeUser.organizationId,
          categoryId: body?.hira?.categoryId,
          entityId: body.hira.entityId,
        }),
      );

      const existingHira = await this.hiraModel
        .find({
          jobTitle: body.hira.jobTitle,
          organizationId: activeUser.organizationId,
          categoryId: body?.hira?.categoryId,
          entityId: body.hira.entityId,
          status: 'active',
        })
        .session(session);

      if (existingHira.length > 0) {
        this.logger.debug(
          `traceId=${traceId} - Duplicate HIRA found`,
          JSON.stringify({ duplicateCount: existingHira.length }),
        );
        throw new ConflictException(
          'A HIRA with the same job title already exists in the department.',
        );
      }

      this.logger.debug(
        `traceId=${traceId} - No duplicates found, creating multiple HIRA steps`,
        JSON.stringify({ stepsCount: body.steps.length }),
      );

      // **Step 1: Create multiple HIRA steps**
      const stepsToInsert = body.steps.map((step) => ({
        ...step,
        createdBy: activeUser.id,
        status: 'active',
      }));

      this.logger.debug(
        `traceId=${traceId} - Prepared steps for insertion`,
        JSON.stringify({ stepsToInsertCount: stepsToInsert.length }),
      );

      const createdHiraSteps = await this.hiraStepsModel.insertMany(
        stepsToInsert,
        { session },
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA steps created successfully`,
        JSON.stringify({ createdStepsCount: createdHiraSteps.length }),
      );

      // Extract newly created step IDs
      const stepIds = createdHiraSteps.map((step) => step._id.toString());

      this.logger.debug(
        `traceId=${traceId} - Extracted step IDs`,
        JSON.stringify({ stepIds }),
      );

      // **Step 2: Create the HIRA document**
      this.logger.debug(
        `traceId=${traceId} - Creating HIRA document`,
        JSON.stringify(body.hira),
      );

      const createdHira = await this.hiraModel.create(
        [
          {
            ...body.hira,
            createdBy: activeUser.id,
            status: 'active',
            currentVersion: 0,
            workflowStatus: 'DRAFT',
            stepIds: stepIds, // Store all created step IDs
          },
        ],
        { session },
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA document created successfully`,
        JSON.stringify({ hiraId: createdHira[0]._id?.toString() }),
      );

      // Commit the transaction if everything succeeds
      await session.commitTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction committed successfully`,
        JSON.stringify({ success: true }),
      );

      return { ...createdHira, traceId };
    } catch (error) {
      // Rollback the transaction if anything fails
      await session.abortTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction aborted due to error`,
        JSON.stringify({ error: error.message }),
      );

      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An error occurred while creating the HIRA and Steps.',
        );
      }
    }
  }

  async createRiskWithMultipleSteps(body: any, user: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting createRiskWithMultipleSteps`,
      JSON.stringify({ hira: body.hira, stepsCount: body.steps?.length }),
    );

    const session = await this.hiraModel.startSession();
    session.startTransaction();

    try {
      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: user.user.id }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.user.id },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({
          userId: activeUser.id,
          organizationId: activeUser.organizationId,
        }),
      );

      // … your conflict check here …

      this.logger.debug(
        `traceId=${traceId} - Loading risk configuration`,
        JSON.stringify({ categoryId: body.hira.categoryId }),
      );

      // **NEW**: Load the config so we know how to shape `impactType`
      const riskConfig: any = await this.hiraConfigModel
        .findOne({
          categoryId: body.hira.categoryId,
        })
        .lean();
      if (!riskConfig) {
        this.logger.debug(
          `traceId=${traceId} - Invalid HIRA category`,
          JSON.stringify({ categoryId: body.hira.categoryId }),
        );
        throw new BadRequestException('Invalid HIRA category');
      }

      this.logger.debug(
        `traceId=${traceId} - Risk configuration loaded`,
        JSON.stringify({
          impactTypeFormat: riskConfig?.impactTypeFormat,
          categoryId: riskConfig?.categoryId,
        }),
      );

      // **STEP 1: build the exact shape your HiraSteps schema expects**
      this.logger.debug(
        `traceId=${traceId} - Building steps with risk details`,
        JSON.stringify({ stepsCount: body.steps.length }),
      );

      const stepsToInsert = body.steps.map((step: any) => {
        const {
          riskType,
          riskCondition,
          currentControl,
          existingRiskRatingId,
          targetRiskRatingId,
          existingKeyControlId,
          actualRiskRatingId,
          currentControlEffectivenessId,
          riskManagementDecisionId,
          impactType,
          ...rest
        } = step;

        const riskDetails: any = {};
        if (riskType) riskDetails.riskTypeId = riskType;
        if (riskCondition) riskDetails.riskConditionId = riskCondition;
        if (currentControl) riskDetails.currentControlId = currentControl;
        if (existingRiskRatingId)
          riskDetails.existingRiskRatingId = existingRiskRatingId;
        if (targetRiskRatingId)
          riskDetails.targetRiskRatingId = targetRiskRatingId;
        if (existingKeyControlId)
          riskDetails.existingKeyControlId = existingKeyControlId;
        if (actualRiskRatingId)
          riskDetails.actualRiskRatingId = actualRiskRatingId;
        if (currentControlEffectivenessId)
          riskDetails.currentControlEffectivenessId =
            currentControlEffectivenessId;
        if (riskManagementDecisionId)
          riskDetails.riskManagementDecisionId = riskManagementDecisionId;

        if (riskConfig.impactTypeFormat === 'dropdown' && impactType) {
          riskDetails.impactType = { format: 'dropdown', id: impactType };
        } else if (riskConfig.impactTypeFormat === 'text' && impactType) {
          riskDetails.impactType = { format: 'text', text: impactType };
        }

        return {
          ...rest,
          ...(Object.keys(riskDetails).length && { riskDetails }),
          status: 'active',
          locationId: body.hira.locationId,
          entityId: body.hira.entityId,
          categoryId: body.hira.categoryId,
          createdBy: activeUser.id,
        };
      });

      this.logger.debug(
        `traceId=${traceId} - Steps prepared for insertion`,
        JSON.stringify({ stepsToInsertCount: stepsToInsert.length }),
      );

      // **STEP 1B**: insert your steps
      const createdHiraSteps = await this.hiraStepsModel.insertMany(
        stepsToInsert,
        { session },
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA steps created successfully`,
        JSON.stringify({ createdStepsCount: createdHiraSteps.length }),
      );

      // grab their IDs
      const stepIds = createdHiraSteps.map((s) => s._id.toString());

      this.logger.debug(
        `traceId=${traceId} - Extracted step IDs`,
        JSON.stringify({ stepIds }),
      );

      // **STEP 2**: create the HIRA document with the stepIds array
      this.logger.debug(
        `traceId=${traceId} - Creating HIRA document`,
        JSON.stringify(body.hira),
      );

      const createdHira = await this.hiraModel.create(
        [
          {
            ...body.hira,
            createdBy: activeUser.id,
            status: 'active',
            currentVersion: 0,
            workflowStatus: 'DRAFT',
            stepIds,
          },
        ],
        { session },
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA document created successfully`,
        JSON.stringify({ hiraId: createdHira[0]._id?.toString() }),
      );

      await session.commitTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction committed successfully`,
        JSON.stringify({ success: true }),
      );

      return { ...createdHira, traceId };
    } catch (err) {
      console.log('err in create risk with multiple steps-->', err);

      await session.abortTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction aborted due to error`,
        JSON.stringify({ error: err }),
      );

      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException(
        'An error occurred while creating the HIRA and Steps.',
      );
    }
  }

  async addRiskStepToRisk(dto: any, user: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting addRiskStepToRisk`,
      JSON.stringify({ hiraId, dto }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Destructuring DTO fields`,
        JSON.stringify({ dto }),
      );

      const {
        riskType,
        riskCondition,
        currentControl,
        existingRiskRatingId,
        targetRiskRatingId,
        existingKeyControlId,
        actualRiskRatingId,
        currentControlEffectivenessId,
        riskManagementDecisionId,
        impactType,
        ...rest
      } = dto;

      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: user.user.id }),
      );

      // 1) Who's creating this?
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.user.id },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({ userId: activeUser.id }),
      );

      // 2) Load the parent HIRA
      this.logger.debug(
        `traceId=${traceId} - Loading parent Risk`,
        JSON.stringify({ hiraId }),
      );

      const hira = await this.hiraModel.findById(hiraId);
      if (!hira) {
        this.logger.debug(
          `traceId=${traceId} - Risk not found`,
          JSON.stringify({ hiraId }),
        );
        throw new NotFoundException('Risk not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Risk loaded successfully`,
        JSON.stringify({ hiraId: hira._id, categoryId: hira.categoryId }),
      );

      // 3) Load the config for impactType logic
      this.logger.debug(
        `traceId=${traceId} - Loading Risk config`,
        JSON.stringify({ categoryId: hira?.categoryId }),
      );

      const cfg: any = await this.hiraConfigModel
        .findOne({ _id: hira?.categoryId })
        .lean();
      if (!cfg) {
        this.logger.debug(
          `traceId=${traceId} - Invalid Risk category`,
          JSON.stringify({ categoryId: hira?.categoryId }),
        );
        throw new BadRequestException('Invalid HIRA category');
      }

      this.logger.debug(
        `traceId=${traceId} - Risk config loaded`,
        JSON.stringify({
          impactTypeFormat: cfg?.impactTypeFormat,
          categoryId: cfg?.categoryId,
        }),
      );

      // 4) Build the nested riskDetails

      this.logger.debug(
        `traceId=${traceId} - Building risk details`,
        JSON.stringify({ riskType, riskCondition, currentControl, impactType }),
      );

      // build riskDetails same as above
      const riskDetails: any = {};
      if (riskType) riskDetails.riskTypeId = riskType;
      if (riskCondition) riskDetails.riskConditionId = riskCondition;
      if (currentControl) riskDetails.currentControlId = currentControl;
      if (existingRiskRatingId)
        riskDetails.existingRiskRatingId = existingRiskRatingId;
      if (targetRiskRatingId)
        riskDetails.targetRiskRatingId = targetRiskRatingId;
      if (existingKeyControlId)
        riskDetails.existingKeyControlId = existingKeyControlId;
      if (actualRiskRatingId)
        riskDetails.actualRiskRatingId = actualRiskRatingId;
      if (currentControlEffectivenessId)
        riskDetails.currentControlEffectivenessId =
          currentControlEffectivenessId;
      if (riskManagementDecisionId)
        riskDetails.riskManagementDecisionId = riskManagementDecisionId;

      if (cfg.impactTypeFormat === 'dropdown' && impactType) {
        riskDetails.impactType = { format: 'dropdown', id: impactType };
      } else if (cfg.impactTypeFormat === 'text' && impactType) {
        riskDetails.impactType = { format: 'text', text: impactType };
      }

      this.logger.debug(
        `traceId=${traceId} - Risk details built`,
        JSON.stringify({ riskDetails }),
      );

      // now assemble only supplied fields
      const stepDoc: any = {
        ...rest,
        ...(Object.keys(riskDetails).length && { riskDetails }),
        status: 'active',
        createdBy: activeUser.id,
        locationId: hira.locationId,
        entityId: hira.entityId,
        categoryId: hira.categoryId,
      };

      this.logger.debug(
        `traceId=${traceId} - Step document prepared`,
        JSON.stringify({ stepDoc }),
      );

      // 6) Insert the new HIRA step
      this.logger.debug(
        `traceId=${traceId} - Creating Risk step`,
        JSON.stringify({ stepDoc }),
      );

      const createdStep = await this.hiraStepsModel.create(stepDoc);

      this.logger.debug(
        `traceId=${traceId} - Risk step created successfully`,
        JSON.stringify({ stepId: createdStep._id?.toString() }),
      );

      // 7) Push its ID into the parent Risk
      this.logger.debug(
        `traceId=${traceId} - Updating parent Risk with step ID`,
        JSON.stringify({ hiraId, stepId: createdStep._id?.toString() }),
      );

      const updatedHira = await this.hiraModel.findByIdAndUpdate(
        hiraId,
        { $push: { stepIds: createdStep._id.toString() } },
        { new: true },
      );

      this.logger.debug(
        `traceId=${traceId} - Parent Risk updated successfully`,
        JSON.stringify({ hiraId: updatedHira._id?.toString() }),
      );

      return { ...updatedHira, traceId };
    } catch (error) {
      console.log('error in addRiskStepToRisk-->', error);

      this.logger.debug(
        `traceId=${traceId} - Error in addRiskStepToRisk`,
        JSON.stringify({ error }),
      );

      throw error;
    }
  }

  async updateRiskStep(dto: any, user: any, stepId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateRiskStep`,
      JSON.stringify({ stepId, dto }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: user.user.id }),
      );

      // 1) Who's doing the update?
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.user.id },
      });
      if (!activeUser) {
        this.logger.debug(
          `traceId=${traceId} - User not found`,
          JSON.stringify({ kcId: user.user.id }),
        );
        throw new NotFoundException('User not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({ userId: activeUser.id }),
      );

      // 2) Load the existing step (to know its parent HIRA)
      this.logger.debug(
        `traceId=${traceId} - Loading existing step`,
        JSON.stringify({ stepId }),
      );

      const existingStep = await this.hiraStepsModel.findById(stepId).lean();
      if (!existingStep) {
        this.logger.debug(
          `traceId=${traceId} - Step not found`,
          JSON.stringify({ stepId }),
        );
        throw new NotFoundException('Step not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Existing step loaded`,
        JSON.stringify({
          stepId: existingStep._id,
          categoryId: existingStep.categoryId,
        }),
      );

      // 4) Load the config for impactType logic
      this.logger.debug(
        `traceId=${traceId} - Loading HIRA config`,
        JSON.stringify({ categoryId: dto.categoryId }),
      );

      const cfg: any = await this.hiraConfigModel
        .findOne({ _id: dto.categoryId })
        .lean();
      if (!cfg) {
        this.logger.debug(
          `traceId=${traceId} - Invalid HIRA category`,
          JSON.stringify({ categoryId: dto.categoryId }),
        );
        throw new BadRequestException('Invalid HIRA category');
      }

      this.logger.debug(
        `traceId=${traceId} - HIRA config loaded`,
        JSON.stringify({
          impactTypeFormat: cfg?.impactTypeFormat,
          categoryId: cfg?.categoryId,
        }),
      );

      // 5) Destructure flat fields from DTO
      this.logger.debug(
        `traceId=${traceId} - Destructuring DTO fields`,
        JSON.stringify({ dto }),
      );

      const {
        riskType,
        riskCondition,
        currentControl,
        existingRiskRatingId,
        targetRiskRatingId,
        existingKeyControlId,
        actualRiskRatingId,
        currentControlEffectivenessId,
        riskManagementDecisionId,
        impactType,
        ...rest
      } = dto;

      // 6) Build the nested riskDetails object only if needed
      this.logger.debug(
        `traceId=${traceId} - Building risk details`,
        JSON.stringify({ riskType, riskCondition, currentControl, impactType }),
      );

      const riskDetails: any = {};
      if (riskType) riskDetails.riskTypeId = riskType;
      if (riskCondition) riskDetails.riskConditionId = riskCondition;
      if (currentControl) riskDetails.currentControlId = currentControl;
      if (existingRiskRatingId)
        riskDetails.existingRiskRatingId = existingRiskRatingId;
      if (targetRiskRatingId)
        riskDetails.targetRiskRatingId = targetRiskRatingId;
      if (existingKeyControlId)
        riskDetails.existingKeyControlId = existingKeyControlId;
      if (actualRiskRatingId)
        riskDetails.actualRiskRatingId = actualRiskRatingId;
      if (currentControlEffectivenessId)
        riskDetails.currentControlEffectivenessId =
          currentControlEffectivenessId;
      if (riskManagementDecisionId)
        riskDetails.riskManagementDecisionId = riskManagementDecisionId;

      if (cfg.impactTypeFormat === 'dropdown' && impactType) {
        riskDetails.impactType = { format: 'dropdown', id: impactType };
      } else if (cfg.impactTypeFormat === 'text' && impactType) {
        riskDetails.impactType = { format: 'text', text: impactType };
      }

      this.logger.debug(
        `traceId=${traceId} - Risk details built`,
        JSON.stringify({ riskDetails }),
      );

      // 7) Assemble the update document
      this.logger.debug(
        `traceId=${traceId} - Assembling update document`,
        JSON.stringify({ rest, riskDetails }),
      );

      const updateDoc: any = {
        ...rest,
        ...(Object.keys(riskDetails).length && { riskDetails }),
        updatedBy: activeUser.id,
      };

      this.logger.debug(
        `traceId=${traceId} - Update document prepared`,
        JSON.stringify({ updateDoc }),
      );

      // 8) Perform the update
      this.logger.debug(
        `traceId=${traceId} - Performing step update`,
        JSON.stringify({ stepId, updateDoc }),
      );

      const updatedStep = await this.hiraStepsModel.findByIdAndUpdate(
        stepId,
        { $set: updateDoc },
        { new: true },
      );

      this.logger.debug(
        `traceId=${traceId} - Step updated successfully`,
        JSON.stringify({ stepId: updatedStep._id?.toString() }),
      );

      return { ...updatedStep, traceId };
    } catch (err) {
      // console.error('Error in updateRiskStep', err);
      this.logger.debug(
        `traceId=${traceId} - Error in updateRiskStep`,
        JSON.stringify({ error: err }),
      );

      throw new InternalServerErrorException(
        'An error occurred while updating the HIRA Step.',
      );
    }
  }

  async deleteRiskStep(riskId: string, stepId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting deleteRiskStep`,
      JSON.stringify({ riskId, stepId }),
    );

    const session = await this.hiraModel.startSession(); // Start a transaction session
    session.startTransaction(); // Start the transaction

    try {
      this.logger.debug(
        `traceId=${traceId} - Deleting Risk step`,
        JSON.stringify({ stepId }),
      );

      // Find and delete the step in hiraStepsModel
      const deletedHiraStep = await this.hiraStepsModel.findOneAndDelete(
        { _id: stepId },
        { session },
      );

      if (!deletedHiraStep) {
        this.logger.debug(
          `traceId=${traceId} - Risk step not found`,
          JSON.stringify({ stepId }),
        );
        // If the step is not found, abort the transaction and throw an error
        await session.abortTransaction();
        throw new NotFoundException(`Risk step with id ${stepId} not found.`);
      }

      this.logger.debug(
        `traceId=${traceId} - Risk step deleted successfully`,
        JSON.stringify({ stepId: deletedHiraStep._id?.toString() }),
      );

      this.logger.debug(
        `traceId=${traceId} - Updating parent Risk to remove step reference`,
        JSON.stringify({ riskId, stepId }),
      );

      // Remove the reference from the hiraModel stepIds array
      const updatedHira = await this.hiraModel.findOneAndUpdate(
        { _id: riskId },
        { $pull: { stepIds: stepId } },
        { new: true, session },
      );

      if (!updatedHira) {
        this.logger.debug(
          `traceId=${traceId} - Risk not found`,
          JSON.stringify({ riskId }),
        );
        // If the Hira document is not found, abort the transaction and throw an error
        await session.abortTransaction();
        throw new NotFoundException(`Risk with id ${riskId} not found.`);
      }

      this.logger.debug(
        `traceId=${traceId} - Parent HIRA updated successfully`,
        JSON.stringify({ riskId: updatedHira._id?.toString() }),
      );

      // Commit the transaction after both operations succeed
      await session.commitTransaction();
      session.endSession(); // End the session after the transaction

      this.logger.debug(
        `traceId=${traceId} - Transaction committed successfully`,
        JSON.stringify({ success: true }),
      );

      return { ...updatedHira, traceId };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Transaction aborted due to error`,
        JSON.stringify({ error }),
      );

      // Rollback the transaction in case of any error
      await session.abortTransaction();
      session.endSession(); // Ensure session is ended
      // If an error occurred, rethrow it as an InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while deleting hira step.',
        error.message,
      );
    }
  }

  async updateRiskHeader(body: any, req: any, riskId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateRiskHeader`,
      JSON.stringify({ riskId, body }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Updating HIRA header`,
        JSON.stringify({ riskId, body }),
      );

      const updateHira = await this.hiraModel.findOneAndUpdate(
        { _id: riskId },
        {
          ...body,
        },
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA header updated successfully`,
        JSON.stringify({ riskId: updateHira._id?.toString() }),
      );

      return { ...updateHira, traceId };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Error in updateRiskHeader`,
        JSON.stringify({ error }),
      );

      // If any other error occurs (like database query failure), throw InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while updating risk details.',
      );
    }
  }

  async viewHiraWithStepsOld(hiraId: string, query: any) {
    try {
      const { page, pageSize, search } = query;
      // Fetch the HIRA document using the hiraId and ensure it belongs to the user's organization
      const hira = await this.hiraModel
        .findOne({
          _id: hiraId,
          status: 'active', // Ensure we fetch only active HIRA
        })
        .lean(); // Return plain JS object instead of Mongoose document

      // If HIRA not found, throw an exception
      if (!hira) {
        throw new NotFoundException(
          'HIRA not found or you do not have access to it.',
        );
      }
      let hiraCreatedAt = hira?.createdAt;
      // Calculate skip and limit for pagination
      const skip = (page - 1) * pageSize;
      // Build the search query for steps
      let searchQuery: any = {
        _id: { $in: hira.stepIds?.map((stepId: any) => new ObjectId(stepId)) },
        status: 'active',
      }; // Ensure only active steps are fetched
      if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
        searchQuery = {
          ...searchQuery,
          $or: [
            { jobBasicStep: searchRegex },
            { hazardDescription: searchRegex },
            { impactText: searchRegex },
            { existingControl: searchRegex },
            { additionalControlMeasure: searchRegex },
            { responsiblePerson: searchRegex },
            { implementationStatus: searchRegex },
          ],
        };
      }

      // console.log("search query for hirasteps-->", searchQuery);

      // Fetch all the steps associated with the HIRA with pagination and search
      // const hiraSteps = await this.hiraStepsModel.find(searchQuery)
      //   .sort({ sNo: 1, createdAt : 1 })
      //   .skip(skip) // Skip records for pagination
      //   .limit(pageSize) // Limit records to pageSize
      //   .lean() // Return plain JS object instead of Mongoose document
      //   .exec(); // Execute the query

      const hiraSteps = await this.hiraStepsModel.aggregate([
        {
          $match: searchQuery, // Apply the search query with any filters
        },
        {
          $addFields: {
            parsedSubStepNo: {
              $toDouble: {
                $substr: ['$subStepNo', 0, -1], // Parse 'subStepNo' as a number
              },
            },
          },
        },
        {
          $sort: {
            sNo: 1, // Sort by sNo first
            parsedSubStepNo: 1, // Sort numerically by parsedSubStepNo
            createdAt: 1, // Then sort by createdAt
          },
        },
        {
          $skip: skip, // For pagination
        },
        {
          $limit: parseInt(pageSize), // For pagination
        },
        {
          $project: {
            parsedSubStepNo: 0, // Exclude the temporary field from the final result
          },
        },
      ]);

      // console.log('hiraSteps--->', hiraSteps);

      const totalStepsCount = await this.hiraStepsModel.countDocuments(
        searchQuery,
      );

      const archivedHiraIds = new Set(
        hira.workflow.map((workflow: any) => workflow.hiraId).filter(Boolean),
      );

      const archivedHiraJobTitles = await this.hiraModel
        .find(
          { _id: { $in: Array.from(archivedHiraIds) } },
          { _id: 1, jobTitle: 1, createdAt: 1 },
        )
        .lean();

      // Construct a map of HIRA IDs to jobTitles

      const archivedHiraMap = new Map(
        archivedHiraJobTitles.map((hira) => [hira._id.toString(), hira]),
      );

      const stepsCreatedByIds = hiraSteps
        .map((step) => step.createdBy)
        .filter((id) => !!id);
      const responsiblePeopleIds = hiraSteps
        .map((step) => step?.responsiblePerson)
        .filter((id) => !!id);
      const getUserIdsFromAllWorkflow = hira?.workflow
        ?.map((workflow: any) => {
          return [
            ...workflow.reviewers,
            ...workflow.approvers,
            workflow.reviewStartedBy,
            workflow.reviewedBy,
            workflow.approvedBy,
            workflow.rejectedBy,
          ];
        })
        .flat()
        .filter((id) => !!id);
      const uniqueUserIdsFromAllWorkflow = new Set(getUserIdsFromAllWorkflow);
      const uniqueUserIdsFromAllWorkflowArray = Array.from(
        uniqueUserIdsFromAllWorkflow,
      );
      // console.log(
      //   'uniqueUserIdsFromAllWorkflowArray ------>>',
      //   uniqueUserIdsFromAllWorkflowArray,
      // );

      const allUserIds = new Set([
        ...stepsCreatedByIds,
        ...responsiblePeopleIds,
        ...getUserIdsFromAllWorkflow,
        ...hira.assesmentTeam,
        hira.createdBy,
      ]);

      // console.log('allUserIds ------>>', allUserIds);

      const [
        users,
        hiraHazardsList,
        locationData,
        entityData,
        sectionData,
        areaData,
        categoryData,
      ] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(allUserIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.hiraTypeConfigModel
          .find({
            deleted: false,
            organizationId: hira.organizationId,
          })
          .select('_id name')
          .lean(),
        hira?.locationId
          ? this.prisma.location.findFirst({
              where: { id: hira.locationId },
              select: { id: true, locationName: true },
            })
          : null,
        hira?.entityId
          ? this.prisma.entity.findFirst({
              where: { id: hira.entityId },
              select: { id: true, entityName: true },
            })
          : null,
        hira?.section
          ? this.prisma.section.findFirst({
              where: { id: hira.section },
              select: { id: true, name: true },
            })
          : null,
        hira?.area
          ? this.hiraAreaMasterModel
              .findOne({ _id: hira.area })
              .select('name')
              .lean()
          : null,
        hira?.categoryId
          ? this.hiraConfigModel
              .findOne({ _id: hira.categoryId })
              .select('id riskCategory titleLabel basicStepLabel')
              .lean()
          : null,
      ]);

      // console.log('sectionData --->', sectionData);
      // console.log('areaData--->', areaData);

      const hazardIds: any = new Set();
      const responsiblePersonIds: any = new Set();

      hiraSteps.forEach((step: any) => {
        step?.hazardType && hazardIds.add(step?.hazardType);
        step?.responsiblePerson?.length &&
          responsiblePersonIds.add(step?.responsiblePerson);
      });

      const hazardMap = new Map(
        hiraHazardsList.map((hazard) => [hazard._id?.toString(), hazard]),
      );

      const userMap = new Map(users.map((user) => [user.id, user]));

      const steps = hiraSteps.map((step: any) => ({
        ...step,
        hazardTypeDetails: hazardMap.get(step.hazardType),
        ...(step?.responsiblePerson && {
          responsiblePersonDetails: userMap.get(step.responsiblePerson),
        }),
        postMitigationScore:
          parseInt(step?.postProbability) > 0
            ? parseInt(step?.postProbability) * parseInt(step?.postSeverity)
            : 0,
      }));

      // Map user details to each workflow object
      const workflowsWithUserDetails = hira.workflow.map((workflow: any) => ({
        ...workflow,
        jobTitle:
          workflow.hiraId && archivedHiraMap.has(workflow.hiraId)
            ? archivedHiraMap.get(workflow.hiraId).jobTitle
            : hira.jobTitle,
        reviewedByUserDetails: userMap.get(workflow.reviewedBy),
        approvedByUserDetails: userMap.get(workflow.approvedBy),
        reviewersDetails: workflow.reviewers.map((reviewer: any) =>
          userMap.get(reviewer),
        ),
        approversDetails: workflow.approvers.map((approver: any) =>
          userMap.get(approver),
        ),
        workflowHistory: workflow.workflowHistory.map((history: any) => ({
          ...history,
          user: userMap.get(history.by), // Populate 'by' field with user details
        })),
      }));
      const assesmentTeamData = hira.assesmentTeam.map((userId: any) =>
        userMap.get(userId),
      );
      // console.log('assesmentTeamData ------>>', assesmentTeamData);

      if (hira.currentVersion > 0) {
        const firstArchivedWorkflow: any = hira.workflow.find(
          (w: any) => w.cycleNumber === 0 && w.hiraId,
        );
        if (firstArchivedWorkflow?.hiraId) {
          const archivedHira: any = archivedHiraMap.get(
            firstArchivedWorkflow?.hiraId,
          );
          if (archivedHira?.createdAt) {
            hiraCreatedAt = archivedHira.createdAt;
          }
        }
      }

      // Return the HIRA along with its associated steps
      return {
        hira: {
          ...hira,
          hiraCreatedAt,
          workflow: workflowsWithUserDetails,
          locationDetails: locationData,
          entityDetails: entityData,
          createdByUserDetails: userMap?.get(hira?.createdBy),
          areaDetails: areaData,
          sectionDetails: sectionData,
          assesmentTeamData: assesmentTeamData,
          categoryDetails: categoryData,
        },
        steps: steps,
        stepsCount: totalStepsCount,
      };
    } catch (error) {
      // console.log('error in getHiraWithSteps', error);

      if (error instanceof NotFoundException) {
        throw error; // Re-throw if HIRA not found
      } else {
        // Throw internal server error if something else goes wrong
        throw new InternalServerErrorException(error);
      }
    }
  }

  async viewRiskWithSteps(riskId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting viewRiskWithSteps`,
      JSON.stringify({ riskId, query }),
    );

    try {
      // 1) parse page, pageSize, search
      this.logger.debug(
        `traceId=${traceId} - Parsing query parameters`,
        JSON.stringify({ query }),
      );

      const page = Math.max(1, parseInt(query.page ?? '1', 10));
      const pageSize = Math.max(1, parseInt(query.pageSize ?? '10', 10));
      const search =
        typeof query.search === 'string' ? query.search.trim() : '';

      this.logger.debug(
        `traceId=${traceId} - Query parameters parsed`,
        JSON.stringify({ page, pageSize, search }),
      );

      // 2) fetch active HIRA
      this.logger.debug(
        `traceId=${traceId} - Fetching active Risk`,
        JSON.stringify({ riskId }),
      );

      const hira = await this.hiraModel
        .findOne({ _id: riskId, status: 'active' })
        .lean();
      if (!hira) {
        this.logger.debug(
          `traceId=${traceId} - Risk not found`,
          JSON.stringify({ riskId }),
        );
        throw new NotFoundException('Risk not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Risk found successfully`,
        JSON.stringify({ riskId: hira._id, categoryId: hira.categoryId }),
      );

      // 3) fetch its configuration
      this.logger.debug(
        `traceId=${traceId} - Fetching Risk configuration`,
        JSON.stringify({ categoryId: hira.categoryId }),
      );

      const riskConfig = await this.hiraConfigModel
        .findOne({ _id: hira.categoryId })
        .lean();
      if (!riskConfig) {
        this.logger.debug(
          `traceId=${traceId} - Risk configuration not found`,
          JSON.stringify({ categoryId: hira.categoryId }),
        );
        throw new NotFoundException('Risk configuration not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Risk configuration found`,
        JSON.stringify({ categoryId: riskConfig._id }),
      );

      // 4) build steps match condition
      this.logger.debug(
        `traceId=${traceId} - Building steps match condition`,
        JSON.stringify({ stepIdsCount: hira.stepIds?.length, search }),
      );

      const baseMatch: any = {
        _id: { $in: hira.stepIds.map((id: string) => new ObjectId(id)) },
        status: 'active',
      };
      if (search) {
        const re = new RegExp(search, 'i');
        baseMatch.$or = [
          { jobBasicStep: re },
          // { 'riskDetails.impactType.text': re },
          { additionalControlMeasure: re },
          { responsiblePerson: re },
        ];
      }

      this.logger.debug(
        `traceId=${traceId} - Steps match condition built`,
        JSON.stringify({ baseMatch }),
      );

      // 5) fetch steps (paginated) + total count in parallel
      this.logger.debug(
        `traceId=${traceId} - Fetching steps with pagination`,
        JSON.stringify({ page, pageSize, baseMatch }),
      );

      const [rawSteps, totalSteps] = await Promise.all([
        this.hiraStepsModel
          .aggregate([
            { $match: baseMatch },
            { $sort: { sNo: 1, createdAt: 1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
          ])
          .exec(),
        this.hiraStepsModel.countDocuments(baseMatch),
      ]);

      this.logger.debug(
        `traceId=${traceId} - Steps fetched successfully`,
        JSON.stringify({ rawStepsCount: rawSteps.length, totalSteps }),
      );

      // 6) fetch lookups in parallel
      this.logger.debug(
        `traceId=${traceId} - Fetching lookup data`,
        JSON.stringify({
          organizationId: hira.organizationId,
          locationId: hira.locationId,
          entityId: hira.entityId,
          categoryId: hira.categoryId,
        }),
      );

      const [
        hazardList,
        archivedHiras,
        locationDetails,
        entityDetails,
        categoryDetails,
      ] = await Promise.all([
        this.hiraTypeConfigModel
          .find({ organizationId: hira.organizationId, deleted: false })
          .select('_id name')
          .lean(),
        this.hiraModel
          .find({
            _id: {
              $in: hira.workflow.map((w: any) => w.hiraId).filter(Boolean),
            },
          })
          .select('_id jobTitle createdAt')
          .lean(),
        hira.locationId
          ? this.prisma.location.findFirst({
              where: { id: hira.locationId },
              select: { id: true, locationName: true },
            })
          : null,
        hira.entityId
          ? this.prisma.entity.findFirst({
              where: { id: hira.entityId },
              select: { id: true, entityName: true },
            })
          : null,
        hira.categoryId
          ? this.hiraConfigModel
              .findById(hira.categoryId)
              .select('id riskCategory titleLabel basicStepLabel')
              .lean()
          : null,
      ]);

      this.logger.debug(
        `traceId=${traceId} - Lookup data fetched`,
        JSON.stringify({
          hazardListCount: hazardList.length,
          archivedHirasCount: archivedHiras.length,
          hasLocationDetails: !!locationDetails,
          hasEntityDetails: !!entityDetails,
          hasCategoryDetails: !!categoryDetails,
        }),
      );

      const hazardMap = new Map(hazardList.map((h) => [h._id.toString(), h]));
      const archivedMap = new Map(
        archivedHiras.map((h) => [h._id.toString(), h]),
      );

      // 7) collect every user ID we'll need
      this.logger.debug(
        `traceId=${traceId} - Collecting user IDs`,
        JSON.stringify({
          createdBy: hira.createdBy,
          assesmentTeamCount: hira.assesmentTeam?.length,
          workflowCount: hira.workflow?.length,
        }),
      );

      const userIds = new Set<string>();
      userIds.add(hira.createdBy);
      (hira.assesmentTeam || []).forEach((i) => userIds.add(i));
      rawSteps.forEach((s) => {
        if (s.createdBy) userIds.add(s.createdBy);
        if (s.responsiblePerson) userIds.add(s.responsiblePerson);
      });
      hira.workflow.forEach((wf: any) => {
        (wf.reviewers || []).forEach((i) => userIds.add(i));
        (wf.approvers || []).forEach((i) => userIds.add(i));
        if (wf.reviewStartedBy) userIds.add(wf.reviewStartedBy);
        if (wf.reviewedBy) userIds.add(wf.reviewedBy);
        if (wf.approvedBy) userIds.add(wf.approvedBy);
        if (wf.rejectedBy) userIds.add(wf.rejectedBy);
      });

      this.logger.debug(
        `traceId=${traceId} - User IDs collected`,
        JSON.stringify({ userIdsCount: userIds.size }),
      );

      // 8) fetch those users
      this.logger.debug(
        `traceId=${traceId} - Fetching users`,
        JSON.stringify({ userIdsCount: userIds.size }),
      );

      const users = await this.prisma.user.findMany({
        where: { id: { in: Array.from(userIds) } },
        select: {
          id: true,
          username: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      this.logger.debug(
        `traceId=${traceId} - Users fetched`,
        JSON.stringify({ usersCount: users.length }),
      );

      // 9) map rawSteps → enriched steps
      this.logger.debug(
        `traceId=${traceId} - Enriching steps with details`,
        JSON.stringify({ rawStepsCount: rawSteps.length }),
      );

      const {
        riskTypeOptions,
        riskConditionOptions,
        currentControlOptions,
        existingRiskRatingOptions,
        targetRiskRatingOptions,
        existingKeyControlOptions,
        actualRiskRatingOptions,
        currentControlEffectivenessOptions,
        riskManagementDecisionOptions,
        impactTypeFormat,
        impactTypeOptions,
      } = riskConfig;

      const steps = rawSteps.map((step) => {
        const rd = step.riskDetails || {};

        // map each "Id" → "Details" object via the matching Option array
        const riskTypeDetails =
          riskTypeOptions.find(
            (o: any) => o._id.toString() === rd.riskTypeId,
          ) || null;
        const riskConditionDetails =
          riskConditionOptions.find(
            (o: any) => o._id.toString() === rd.riskConditionId,
          ) || null;
        const currentControlDetails =
          currentControlOptions.find(
            (o: any) => o._id.toString() === rd.currentControlId,
          ) || null;
        const existingRiskRatingDetails =
          existingRiskRatingOptions.find(
            (o: any) => o._id.toString() === rd.existingRiskRatingId,
          ) || null;
        const targetRiskRatingDetails =
          targetRiskRatingOptions.find(
            (o: any) => o._id.toString() === rd.targetRiskRatingId,
          ) || null;
        const existingKeyControlDetails =
          existingKeyControlOptions.find(
            (o: any) => o._id.toString() === rd.existingKeyControlId,
          ) || null;
        const actualRiskRatingDetails =
          actualRiskRatingOptions.find(
            (o: any) => o._id.toString() === rd.actualRiskRatingId,
          ) || null;
        const currentControlEffectivenessDetails =
          currentControlEffectivenessOptions.find(
            (o: any) => o._id.toString() === rd.currentControlEffectivenessId,
          ) || null;
        const riskManagementDecisionDetails =
          riskManagementDecisionOptions.find(
            (o: any) => o._id.toString() === rd.riskManagementDecisionId,
          ) || null;

        // impactType handling is unchanged
        let impactTypeDetails = null;
        if (impactTypeFormat === 'dropdown' && rd.impactType?.id) {
          impactTypeDetails =
            impactTypeOptions.find(
              (o: any) => o._id.toString() === rd.impactType.id,
            ) || null;
        } else if (impactTypeFormat === 'text') {
          impactTypeDetails = { text: rd.impactType?.text || '' };
        }

        return {
          ...step,
          responsiblePersonDetails: userMap.get(step.responsiblePerson) || null,
          createdByDetails: userMap.get(step.createdBy) || null,

          // new mappings:
          riskTypeDetails,
          riskConditionDetails,
          currentControlDetails,
          existingRiskRatingDetails,
          targetRiskRatingDetails,
          existingKeyControlDetails,
          actualRiskRatingDetails,
          currentControlEffectivenessDetails,
          riskManagementDecisionDetails,

          impactTypeDetails,
          postMitigationScore:
            Number(step.postProbability) * Number(step.postSeverity),
        };
      });

      this.logger.debug(
        `traceId=${traceId} - Steps enriched successfully`,
        JSON.stringify({ stepsCount: steps.length }),
      );

      // 10) map workflow
      this.logger.debug(
        `traceId=${traceId} - Mapping workflow`,
        JSON.stringify({ workflowCount: hira.workflow?.length }),
      );

      const workflows = hira.workflow.map((wf: any) => ({
        ...wf,
        jobTitle:
          wf.hiraId && archivedMap.has(wf.hiraId)
            ? archivedMap.get(wf.hiraId).jobTitle
            : hira.jobTitle,
        reviewers: wf.reviewers.map((r) => userMap.get(r) || null),
        approvers: wf.approvers.map((a) => userMap.get(a) || null),
        reviewedByUser: userMap.get(wf.reviewedBy) || null,
        approvedByUser: userMap.get(wf.approvedBy) || null,
        workflowHistory: wf.workflowHistory.map((h) => ({
          ...h,
          byUser: userMap.get(h.by) || null,
        })),
      }));

      this.logger.debug(
        `traceId=${traceId} - Workflow mapped successfully`,
        JSON.stringify({ workflowsCount: workflows.length }),
      );

      // 11) recalc createdAt if versioned
      this.logger.debug(
        `traceId=${traceId} - Calculating creation date`,
        JSON.stringify({ currentVersion: hira.currentVersion }),
      );

      let hiraCreatedAt = hira.createdAt;
      if (hira.currentVersion > 0) {
        const first0 = workflows.find((w) => w.cycleNumber === 0 && w.hiraId);
        if (first0?.hiraId) {
          const arch = archivedMap.get(first0.hiraId);
          if (arch?.createdAt) hiraCreatedAt = arch.createdAt;
        }
      }

      this.logger.debug(
        `traceId=${traceId} - Creation date calculated`,
        JSON.stringify({ hiraCreatedAt }),
      );

      // 12) assemble final payload
      this.logger.debug(
        `traceId=${traceId} - Assembling final payload`,
        JSON.stringify({
          stepsCount: steps.length,
          workflowsCount: workflows.length,
          totalSteps,
        }),
      );

      const result = {
        hira: {
          ...hira,
          hiraCreatedAt,
          workflow: workflows,
          locationDetails,
          entityDetails,
          categoryDetails,
        },
        steps,
        pagination: {
          page,
          pageSize,
          totalSteps,
          totalPages: Math.ceil(totalSteps / pageSize),
        },
      };

      this.logger.debug(
        `traceId=${traceId} - Final payload assembled successfully`,
        JSON.stringify({
          riskId: result.hira._id,
          stepsCount: result.steps.length,
          totalSteps: result.pagination.totalSteps,
        }),
      );

      return { ...result, traceId };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Error in viewRiskWithSteps`,
        JSON.stringify({ error }),
      );
      throw error;
    }
  }

  async getArchivedRiskWithSteps(riskId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getArchivedRiskWithSteps`,
      JSON.stringify({ riskId, query }),
    );

    try {
      // 1) pagination
      this.logger.debug(
        `traceId=${traceId} - Parsing pagination parameters`,
        JSON.stringify({ query }),
      );

      const page = Math.max(1, parseInt(query.page ?? '1', 10));
      const pageSize = Math.max(1, parseInt(query.pageSize ?? '10', 10));
      const skip = (page - 1) * pageSize;

      this.logger.debug(
        `traceId=${traceId} - Pagination parameters parsed`,
        JSON.stringify({ page, pageSize, skip }),
      );

      // 2) load the archived HIRA/risk
      this.logger.debug(
        `traceId=${traceId} - Loading archived Risk`,
        JSON.stringify({ riskId }),
      );

      const hira = await this.hiraModel
        .findOne({ _id: riskId, status: 'archived' })
        .lean();
      if (!hira) {
        this.logger.debug(
          `traceId=${traceId} - Archived Risk not found`,
          JSON.stringify({ riskId }),
        );
        throw new NotFoundException('Risk not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Archived Risk loaded successfully`,
        JSON.stringify({ riskId: hira._id, categoryId: hira.categoryId }),
      );

      let hiraCreatedAt = hira.createdAt;

      // 3) load its config
      this.logger.debug(
        `traceId=${traceId} - Loading Risk configuration`,
        JSON.stringify({ categoryId: hira.categoryId }),
      );

      const riskConfig = await this.hiraConfigModel
        .findOne({ _id: hira.categoryId })
        .lean();
      if (!riskConfig) {
        this.logger.debug(
          `traceId=${traceId} - Risk configuration not found`,
          JSON.stringify({ categoryId: hira.categoryId }),
        );
        throw new NotFoundException('Risk configuration not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Risk configuration loaded`,
        JSON.stringify({ categoryId: riskConfig._id }),
      );

      // 4) build search-and-pagination for steps
      this.logger.debug(
        `traceId=${traceId} - Building steps match condition`,
        JSON.stringify({ stepIdsCount: hira.stepIds?.length }),
      );

      const baseMatch: any = {
        _id: { $in: (hira.stepIds || []).map((id: any) => new ObjectId(id)) },
        status: 'archived',
      };

      this.logger.debug(
        `traceId=${traceId} - Steps match condition built`,
        JSON.stringify({ baseMatch }),
      );

      // 5) fetch paged steps + count
      this.logger.debug(
        `traceId=${traceId} - Fetching archived steps with pagination`,
        JSON.stringify({ page, pageSize, skip, baseMatch }),
      );

      const [rawSteps, totalStepsCount] = await Promise.all([
        this.hiraStepsModel
          .aggregate([
            { $match: baseMatch },
            { $sort: { sNo: 1, createdAt: 1 } },
            { $skip: skip },
            { $limit: pageSize },
          ])
          .exec(),
        this.hiraStepsModel.countDocuments(baseMatch),
      ]);

      this.logger.debug(
        `traceId=${traceId} - Archived steps fetched successfully`,
        JSON.stringify({ rawStepsCount: rawSteps.length, totalStepsCount }),
      );

      // 6) archived-HIRA lookup
      this.logger.debug(
        `traceId=${traceId} - Looking up archived HIRAs`,
        JSON.stringify({ workflowCount: hira.workflow?.length }),
      );

      const archivedHiraIds = Array.from(
        new Set(hira.workflow.map((w: any) => w.hiraId).filter(Boolean)),
      );
      const archivedHiras = await this.hiraModel
        .find(
          { _id: { $in: archivedHiraIds.map((id) => new ObjectId(id)) } },
          { _id: 1, jobTitle: 1, createdAt: 1 },
        )
        .lean();
      const archivedHiraMap = new Map(
        archivedHiras.map((h) => [h._id.toString(), h]),
      );

      this.logger.debug(
        `traceId=${traceId} - Archived HIRAs lookup completed`,
        JSON.stringify({
          archivedHiraIdsCount: archivedHiraIds.length,
          archivedHirasCount: archivedHiras.length,
        }),
      );

      // 7) collect all user-IDs
      this.logger.debug(
        `traceId=${traceId} - Collecting user IDs`,
        JSON.stringify({
          createdBy: hira.createdBy,
          assesmentTeamCount: hira.assesmentTeam?.length,
          workflowCount: hira.workflow?.length,
        }),
      );

      const ids = new Set<string>();
      ids.add(hira.createdBy);
      (hira.assesmentTeam || []).forEach((u: string) => ids.add(u));
      rawSteps.forEach((st) => {
        if (st.createdBy) ids.add(st.createdBy);
        if (st.responsiblePerson) ids.add(st.responsiblePerson);
      });
      hira.workflow.forEach((wf: any) => {
        (wf.reviewers || []).filter(Boolean).forEach((i) => ids.add(i));
        (wf.approvers || []).filter(Boolean).forEach((i) => ids.add(i));
        if (wf.reviewStartedBy) ids.add(wf.reviewStartedBy);
        if (wf.reviewedBy) ids.add(wf.reviewedBy);
        if (wf.approvedBy) ids.add(wf.approvedBy);
        if (wf.rejectedBy) ids.add(wf.rejectedBy);
      });

      this.logger.debug(
        `traceId=${traceId} - User IDs collected`,
        JSON.stringify({ userIdsCount: ids.size }),
      );

      // 8) fetch users & build map
      this.logger.debug(
        `traceId=${traceId} - Fetching users`,
        JSON.stringify({ userIdsCount: ids.size }),
      );

      const users = await this.prisma.user.findMany({
        where: { id: { in: Array.from(ids) } },
        select: { id: true, firstname: true, lastname: true, avatar: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      this.logger.debug(
        `traceId=${traceId} - Users fetched`,
        JSON.stringify({ usersCount: users.length }),
      );

      // 9) fetch hazards, location, entity, category
      this.logger.debug(
        `traceId=${traceId} - Fetching lookup data`,
        JSON.stringify({
          organizationId: hira.organizationId,
          locationId: hira.locationId,
          entityId: hira.entityId,
          categoryId: hira.categoryId,
        }),
      );

      const [hazards, locationDetails, entityDetails, categoryDetails] =
        await Promise.all([
          this.hiraTypeConfigModel
            .find({ organizationId: hira.organizationId, deleted: false })
            .select('_id name')
            .lean(),
          this.prisma.location.findFirst({
            where: { id: hira.locationId },
            select: { id: true, locationName: true },
          }),
          this.prisma.entity.findFirst({
            where: { id: hira.entityId },
            select: { id: true, entityName: true },
          }),
          this.hiraConfigModel
            .findById(hira.categoryId)
            .select('id riskCategory titleLabel basicStepLabel')
            .lean(),
        ]);
      const hazardMap = new Map(hazards.map((h: any) => [h._id.toString(), h]));

      this.logger.debug(
        `traceId=${traceId} - Lookup data fetched`,
        JSON.stringify({
          hazardsCount: hazards.length,
          hasLocationDetails: !!locationDetails,
          hasEntityDetails: !!entityDetails,
          hasCategoryDetails: !!categoryDetails,
        }),
      );

      // 10) enrich steps, mapping every new riskDetails.*Id → Details
      this.logger.debug(
        `traceId=${traceId} - Enriching steps with details`,
        JSON.stringify({ rawStepsCount: rawSteps.length }),
      );

      const {
        riskTypeOptions,
        riskConditionOptions,
        currentControlOptions,
        existingRiskRatingOptions,
        targetRiskRatingOptions,
        existingKeyControlOptions,
        actualRiskRatingOptions,
        currentControlEffectivenessOptions,
        riskManagementDecisionOptions,
        impactTypeFormat,
        impactTypeOptions,
      } = riskConfig;

      const steps = rawSteps.map((step: any) => {
        const rd = step.riskDetails || {};

        const riskTypeDetails =
          riskTypeOptions.find(
            (o: any) => o._id.toString() === rd.riskTypeId,
          ) || null;
        const riskConditionDetails =
          riskConditionOptions.find(
            (o: any) => o._id.toString() === rd.riskConditionId,
          ) || null;
        const currentControlDetails =
          currentControlOptions.find(
            (o: any) => o._id.toString() === rd.currentControlId,
          ) || null;
        const existingRiskRatingDetails =
          existingRiskRatingOptions.find(
            (o: any) => o._id.toString() === rd.existingRiskRatingId,
          ) || null;
        const targetRiskRatingDetails =
          targetRiskRatingOptions.find(
            (o: any) => o._id.toString() === rd.targetRiskRatingId,
          ) || null;
        const existingKeyControlDetails =
          existingKeyControlOptions.find(
            (o: any) => o._id.toString() === rd.existingKeyControlId,
          ) || null;
        const actualRiskRatingDetails =
          actualRiskRatingOptions.find(
            (o: any) => o._id.toString() === rd.actualRiskRatingId,
          ) || null;
        const currentControlEffectivenessDetails =
          currentControlEffectivenessOptions.find(
            (o: any) => o._id.toString() === rd.currentControlEffectivenessId,
          ) || null;
        const riskManagementDecisionDetails =
          riskManagementDecisionOptions.find(
            (o: any) => o._id.toString() === rd.riskManagementDecisionId,
          ) || null;

        let impactTypeDetails: any = null;
        if (impactTypeFormat === 'dropdown' && rd.impactType?.id) {
          impactTypeDetails =
            impactTypeOptions.find(
              (o: any) => o._id.toString() === rd.impactType.id,
            ) || null;
        } else if (impactTypeFormat === 'text') {
          impactTypeDetails = { text: rd.impactType?.text || '' };
        }

        return {
          ...step,
          regDate: step.regDate,
          targetDate: step.targetDate,
          hazardTypeDetails: hazardMap.get(step.hazardType) || null,
          responsiblePersonDetails: userMap.get(step.responsiblePerson) || null,
          createdByDetails: userMap.get(step.createdBy) || null,

          // all the newly‐added detail mappings:
          riskTypeDetails,
          riskConditionDetails,
          currentControlDetails,
          existingRiskRatingDetails,
          targetRiskRatingDetails,
          existingKeyControlDetails,
          actualRiskRatingDetails,
          currentControlEffectivenessDetails,
          riskManagementDecisionDetails,

          impactTypeDetails,
          preMitigationScore:
            Number(step.preProbability) * Number(step.preSeverity),
          postMitigationScore:
            Number(step.postProbability) * Number(step.postSeverity),
        };
      });

      this.logger.debug(
        `traceId=${traceId} - Steps enriched successfully`,
        JSON.stringify({ stepsCount: steps.length }),
      );

      // 11) enrich workflow (unchanged)
      this.logger.debug(
        `traceId=${traceId} - Enriching workflow`,
        JSON.stringify({ workflowCount: hira.workflow?.length }),
      );

      const workflows = hira.workflow.map((wf: any) => {
        const archived = archivedHiraMap.get(wf.hiraId);
        return {
          ...wf,
          jobTitle: archived?.jobTitle ?? hira.jobTitle,
          reviewedByUser: userMap.get(wf.reviewedBy) || null,
          approvedByUser: userMap.get(wf.approvedBy) || null,
          reviewers: (wf.reviewers || []).map((r: string) => userMap.get(r)),
          approvers: (wf.approvers || []).map((a: string) => userMap.get(a)),
          workflowHistory: (wf.workflowHistory || []).map((h: any) => ({
            ...h,
            byUser: userMap.get(h.by) || null,
          })),
        };
      });

      this.logger.debug(
        `traceId=${traceId} - Workflow enriched successfully`,
        JSON.stringify({ workflowsCount: workflows.length }),
      );

      // 12) preserve original createdAt if versioned
      this.logger.debug(
        `traceId=${traceId} - Calculating creation date`,
        JSON.stringify({ currentVersion: hira.currentVersion }),
      );

      if (hira.currentVersion > 0) {
        const firstZero = workflows.find(
          (w) => w.cycleNumber === 0 && w.hiraId,
        );
        const orig = firstZero && archivedHiraMap.get(firstZero.hiraId);
        if (orig?.createdAt) hiraCreatedAt = orig.createdAt;
      }

      this.logger.debug(
        `traceId=${traceId} - Creation date calculated`,
        JSON.stringify({ hiraCreatedAt }),
      );

      // 13) return full payload
      this.logger.debug(
        `traceId=${traceId} - Assembling final payload`,
        JSON.stringify({
          stepsCount: steps.length,
          workflowsCount: workflows.length,
          totalStepsCount,
        }),
      );

      const result = {
        hira: {
          ...hira,
          hiraCreatedAt,
          workflow: workflows,
          locationDetails,
          entityDetails,
          createdByUserDetails: userMap.get(hira.createdBy) || null,
          categoryDetails,
        },
        steps,
        stepsCount: totalStepsCount,
      };

      this.logger.debug(
        `traceId=${traceId} - Final payload assembled successfully`,
        JSON.stringify({
          riskId: result.hira._id,
          stepsCount: result.steps.length,
          totalStepsCount: result.stepsCount,
        }),
      );

      return { ...result, traceId };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Error in getArchivedRiskWithSteps`,
        JSON.stringify({ error }),
      );

      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async getHiraList(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getHiraList`,
      JSON.stringify({ orgId, query }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Parsing query parameters`,
        JSON.stringify({ query }),
      );

      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      //console.log('query', query);
      const { category, entityId, locationId, search, workflowStatus } = query;
      console.log('query-->', query);

      this.logger.debug(
        `traceId=${traceId} - Query parameters parsed`,
        JSON.stringify({
          page,
          pageSize,
          skip,
          category,
          entityId,
          locationId,
          search,
          workflowStatus,
        }),
      );

      // Fetch the HIRA document using the hiraId and ensure it belongs to the user's organization
      this.logger.debug(
        `traceId=${traceId} - Building HIRA query`,
        JSON.stringify({
          orgId,
          category,
          entityId,
          locationId,
          search,
          workflowStatus,
        }),
      );

      const hira = await this.hiraModel
        .find({
          organizationId: orgId,
          status: 'active', // Ensure we fetch only active HIRA
          ...(category && { categoryId: category }),
          ...(entityId && { entityId }),
          ...(locationId && { locationId }),
          ...(workflowStatus && { workflowStatus }),
          ...(search && { jobTitle: { $regex: new RegExp(search, 'i') } }),
        })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .skip(skip)
        .limit(pageSize)
        .lean();

      // console.log("hira-->", hira);

      this.logger.debug(
        `traceId=${traceId} - HIRA documents fetched`,
        JSON.stringify({ hiraCount: hira?.length }),
      );

      this.logger.debug(
        `traceId=${traceId} - Counting total HIRA documents`,
        JSON.stringify({
          orgId,
          category,
          entityId,
          locationId,
          search,
          workflowStatus,
        }),
      );

      const hiraTotalCount = await this.hiraModel.countDocuments({
        organizationId: orgId,
        status: 'active', // Ensure we fetch only active HIRA
        ...(category && { categoryId: category }),
        ...(entityId && { entityId }),
        ...(locationId && { locationId }),
        ...(workflowStatus && { workflowStatus }),
        ...(search && { jobTitle: { $regex: new RegExp(search, 'i') } }),
      });

      this.logger.debug(
        `traceId=${traceId} - Total HIRA count retrieved`,
        JSON.stringify({ hiraTotalCount }),
      );

      // If HIRA not found, throw an exception
      if (!hira) {
        this.logger.debug(
          `traceId=${traceId} - No HIRA found`,
          JSON.stringify({ orgId }),
        );
        throw new NotFoundException('No HIRA Found!');
      }

      this.logger.debug(
        `traceId=${traceId} - Loading HIRA configuration`,
        JSON.stringify({ category }),
      );

      let config: any = await this.hiraConfigModel
        .findOne({
          _id: new ObjectId(category),
          deleted: false,
          organizationId: orgId,
        })
        .select('condition riskType')
        .lean();

      this.logger.debug(
        `traceId=${traceId} - HIRA configuration loaded`,
        JSON.stringify({ hasConfig: !!config }),
      );

      // console.log("config-->", config)
      this.logger.debug(
        `traceId=${traceId} - Collecting related IDs`,
        JSON.stringify({ hiraCount: hira?.length }),
      );

      const userIds: any = new Set();
      const locationIds: any = new Set();
      const entityIds: any = new Set();
      const areaIds: any = new Set();
      const sectionIds: any = new Set();

      hira?.forEach((item: any) => {
        item?.createdBy && userIds.add(item?.createdBy);
        item?.locationId && locationIds.add(item?.locationId);
        item?.entityId && entityIds.add(item?.entityId);
        item?.area && areaIds.add(item?.area);
        item?.section && sectionIds.add(item?.section);
        item?.workflow?.forEach((workflow: any) => {
          workflow?.reviewers?.length &&
            workflow?.reviewers.forEach((reviewer: any) =>
              userIds.add(reviewer),
            );
          workflow?.approvers?.length &&
            workflow?.approvers.forEach((approver: any) =>
              userIds.add(approver),
            );
        });
      });

      this.logger.debug(
        `traceId=${traceId} - Related IDs collected`,
        JSON.stringify({
          userIdsCount: userIds.size,
          locationIdsCount: locationIds.size,
          entityIdsCount: entityIds.size,
          areaIdsCount: areaIds.size,
          sectionIdsCount: sectionIds.size,
        }),
      );

      // Fetch related data using Prisma
      this.logger.debug(
        `traceId=${traceId} - Fetching related data`,
        JSON.stringify({
          userIdsCount: userIds.size,
          locationIdsCount: locationIds.size,
          entityIdsCount: entityIds.size,
          areaIdsCount: areaIds.size,
          sectionIdsCount: sectionIds.size,
        }),
      );

      const [users, locations, entities, sections, areas] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds) } },
          select: { id: true, locationName: true },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: { id: true, entityName: true },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(sectionIds) } },
          select: { id: true, entityName: true },
        }),
        this.hiraAreaMasterModel
          .find({
            id: { $in: Array.from(areaIds) as any },
          })
          .select('id name'),
      ]);

      this.logger.debug(
        `traceId=${traceId} - Related data fetched`,
        JSON.stringify({
          usersCount: users?.length,
          locationsCount: locations?.length,
          entitiesCount: entities?.length,
          sectionsCount: sections?.length,
          areasCount: areas?.length,
        }),
      );

      // Create maps for quick lookup
      this.logger.debug(
        `traceId=${traceId} - Creating lookup maps`,
        JSON.stringify({
          usersCount: users?.length,
          locationsCount: locations?.length,
          entitiesCount: entities?.length,
          sectionsCount: sections?.length,
          areasCount: areas?.length,
        }),
      );

      const userMap = new Map(users?.map((user) => [user?.id, user]));
      const locationMap = new Map(
        locations?.map((location) => [location?.id, location]),
      );
      const entityMap = new Map(
        entities?.map((entity) => [entity?.id, entity]),
      );
      const sectionMap = new Map(
        sections?.map((section) => [
          section?.id,
          { id: section.id, name: section?.entityName },
        ]),
      );
      const areaMap = new Map(areas?.map((area) => [area?.id, area]));

      // Map the related data to the HIRA
      this.logger.debug(
        `traceId=${traceId} - Mapping HIRA data with related details`,
        JSON.stringify({ hiraCount: hira?.length }),
      );

      const hiraList = hira.map((item: any) => {
        // console.log("item --->", item);

        const latestWorkflowDetails = item?.workflow?.slice(
          item?.workflow?.length - 1,
        )[0];
        let reviewersDetails = [],
          approversDetails = [];
        if (latestWorkflowDetails) {
          reviewersDetails = latestWorkflowDetails?.reviewers?.map(
            (reviewerId: any) => userMap.get(reviewerId),
          );
          approversDetails = latestWorkflowDetails?.approvers?.map(
            (approverId: any) => userMap.get(approverId),
          );
        }
        return {
          ...item,
          createdByDetails: userMap.get(item?.createdBy) || '',
          locationDetails: locationMap.get(item?.locationId) || '',
          entityDetails: entityMap.get(item?.entityId) || '',
          areaDetails: areaMap.get(item?.area) || '',
          sectionDetails: sectionMap.get(item?.section) || '',
          riskTypeDetails: config?.riskType?.find(
            (riskType: any) => riskType?._id?.toString() === item?.riskType,
          ),
          conditionDetails: config?.condition?.find(
            (condition: any) => condition?._id?.toString() === item?.condition,
          ),
          reviewersDetails: reviewersDetails,
          approversDetails: approversDetails,
          latestWorkflowDetails: latestWorkflowDetails,
        };
      });

      this.logger.debug(
        `traceId=${traceId} - HIRA list mapped successfully`,
        JSON.stringify({
          hiraListCount: hiraList?.length,
          totalCount: hiraTotalCount,
        }),
      );

      const result = {
        list: hiraList,
        total: hiraTotalCount,
      };

      this.logger.debug(
        `traceId=${traceId} - Final result assembled`,
        JSON.stringify({
          listCount: result.list?.length,
          total: result.total,
        }),
      );

      return { ...result, traceId };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Error in getHiraList`,
        JSON.stringify({ error }),
      );

      if (error instanceof NotFoundException) {
        throw error; // Re-throw if HIRA not found
      } else {
        // Throw internal server error if something else goes wrong
        throw new InternalServerErrorException(
          'An error occurred while fetching HIRA List!',
        );
      }
    }
  }

  async updateHiraStep(body: UpdateHiraStepsDto, user: any, stepId: string) {
    try {
      let updateHiraStep;
      if (body?.workflowStatus === 'DRAFT' && body?.hiraId) {
        let updateStatusOfHira = await this.hiraModel.findOneAndUpdate(
          { _id: body?.hiraId },
          {
            workflowStatus: 'DRAFT',
          },
          { new: true },
        );
        // console.log("checkrisk5 updateStatusOfHira in updateHiraStep", updateStatusOfHira);
      } else {
        updateHiraStep = await this.hiraStepsModel.findOneAndUpdate(
          { _id: stepId },
          {
            ...body,
          },
        );
      }
      // console.log("checkrisk5 updateHiraStep in updateHiraStep", updateHiraStep);

      return updateHiraStep;
    } catch (error) {
      // If any other error occurs (like database query failure), throw InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while creating the HIRA Step.',
      );
    }
  }

  async updateHira(body: UpdateHiraDto, req: any, hiraId: string) {
    try {
      const updateHira = await this.hiraModel.findOneAndUpdate(
        { _id: hiraId },
        {
          ...body,
        },
      );
      return updateHira;
    } catch (error) {
      // If any other error occurs (like database query failure), throw InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while updating hira details.',
      );
    }
  }

  async deleteHira(hiraId: string, query: any): Promise<any> {
    try {
      console.log('query in deleteHira', query);

      const currentVersion = parseInt(query?.currentVersion) || 0;
      const workflowStatus = query?.workflowStatus || 'DRAFT';
      const { jobTitle, entityId } = query;
      const stepIds = query?.stepIds || [];
      if (currentVersion === 0 || currentVersion === 1) {
        const deleteAllSteps = await this.hiraStepsModel.deleteMany({
          _id: { $in: stepIds },
        });
        const deletedHira = await this.hiraModel.deleteOne({
          _id: hiraId,
        });

        console.log(
          'deleteing version 0 hira, delteallsteps deltehira',
          deleteAllSteps,
          deletedHira,
        );
      } else {
        const deleteAllSteps = await this.hiraStepsModel.deleteMany({
          _id: { $in: stepIds },
        });
        const deletedHira = await this.hiraModel.deleteOne({
          _id: hiraId,
        });
        console.log(
          'deleteing version 1 hira, delteallsteps deltehira',
          deleteAllSteps,
          deletedHira,
        );
        console.log('making active previous version');
        const previousVersion = currentVersion - 1;
        const updatePreviousHira = await this.hiraModel.findOneAndUpdate(
          {
            currentVersion: previousVersion,
            status: 'archived',
            jobTitle: jobTitle,
            entityId: entityId,
          },
          {
            status: 'active',
            $pull: { workflow: { cycleNumber: currentVersion } }, //wi
          },
          { new: true }, // This ensures you get the updated document in the result
        );
        const previousHiraStepIds = updatePreviousHira?.stepIds;
        const updateAllPreviousSteps = await this.hiraStepsModel.updateMany(
          { _id: { $in: previousHiraStepIds } },

          {
            status: 'active',
          },
        );
        console.log(
          'updatePreviousHira, updateAllPreviousSteps',
          updatePreviousHira,
          updateAllPreviousSteps,
        );
      }
    } catch (error) {}
  }

  async getAllUser(query, userId) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getAllUser`,
      JSON.stringify({ query, userId }),
    );

    const { search, location } = query;
    this.logger.debug(
      `traceId=${traceId} - Extracting query parameters`,
      JSON.stringify({ search, location }),
    );

    this.logger.debug(
      `traceId=${traceId} - Finding active user`,
      JSON.stringify({ kcId: userId }),
    );

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    this.logger.debug(
      `traceId=${traceId} - Active user found`,
      JSON.stringify({
        userId: activeUser?.id,
        organizationId: activeUser?.organizationId,
      }),
    );

    try {
      // Base conditions for the query
      this.logger.debug(
        `traceId=${traceId} - Building base query conditions`,
        JSON.stringify({ organizationId: activeUser.organizationId, search }),
      );

      let whereConditions: any = [
        { organizationId: activeUser.organizationId },
        { email: { contains: search, mode: 'insensitive' } },
      ];

      // If location is provided, handle the location filtering
      if (location !== undefined) {
        this.logger.debug(
          `traceId=${traceId} - Adding location filter`,
          JSON.stringify({ location }),
        );

        // Construct the condition for checking if "all" is in additionalUnits for globalRoles users
        whereConditions.push({
          OR: [
            // Users with "all" in additionalUnits (don't apply location filter)
            {
              additionalUnits: {
                has: 'All',
              },
            },
            // Users with matching locationId
            {
              locationId: location,
            },
            // Users with globalRoles and locationId in their additionalUnits
            {
              userType: 'globalRoles',
              additionalUnits: {
                has: location, // Check if location exists in the additionalUnits array
              },
            },
          ],
        });
      }

      this.logger.debug(
        `traceId=${traceId} - Final where conditions built`,
        JSON.stringify({ whereConditions }),
      );

      // Run the query
      this.logger.debug(
        `traceId=${traceId} - Executing user query`,
        JSON.stringify({ whereConditions }),
      );

      const result = await this.prisma.user.findMany({
        where: {
          AND: whereConditions, // Combine conditions using AND
        },
        // select: {
        //   id: true,
        //   username: true,
        //   email: true,
        //   firstname: true,
        //   lastname: true,
        //   avatar: true,
        // },
        include: {
          entity: true,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - User query executed successfully`,
        JSON.stringify({ resultCount: result?.length }),
      );

      this.logger.log(
        `trace id=${traceId}, GET 'api/risk-register/getuserlist jobTitle query success`,
        '',
      );
      return { ...result, traceId };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Error in getAllUser`,
        JSON.stringify({ error }),
      );

      this.logger.error(
        `trace id=${traceId}, GET /risk-register/getuserlist payload ${query} failed with error ${error}`,
      );
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateReviewers(riskId: any, data: any, userId: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateReviewers`,
      JSON.stringify({ riskId, data, userId }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: userId }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({
          userId: activeUser?.id,
          username: activeUser?.username,
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Updating risk with reviewers`,
        JSON.stringify({ riskId, data, updatedBy: activeUser.username }),
      );

      const result = await this.riskModel.findByIdAndUpdate(riskId, {
        ...data,
        updatedBy: activeUser.username,
      });

      this.logger.debug(
        `traceId=${traceId} - Risk updated successfully`,
        JSON.stringify({ riskId: result?._id }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching user emails for reviewers`,
        JSON.stringify({ reviewers: data.reviewers }),
      );

      const userEmails = await this.prisma.user.findMany({
        where: {
          id: { in: data.reviewers },
        },
        select: {
          email: true,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - User emails fetched`,
        JSON.stringify({ userEmailsCount: userEmails?.length }),
      );

      // Send email to all users
      this.logger.debug(
        `traceId=${traceId} - Sending emails to reviewers`,
        JSON.stringify({ userEmailsCount: userEmails?.length }),
      );

      for (const userEmail of userEmails) {
        this.logger.debug(
          `traceId=${traceId} - Sending email to reviewer`,
          JSON.stringify({ email: userEmail.email }),
        );

        await sgMail.send({
          to: userEmail.email, // recipient email
          from: process.env.FROM, // sender email
          subject: 'Risk Review Update',
          html: `<div>Risk Review Update</div>
          <div>Comment : ${data.comment}</div>
          
          `,
        });
      }

      this.logger.debug(
        `traceId=${traceId} - All emails sent successfully`,
        JSON.stringify({ emailsSent: userEmails?.length }),
      );

      return { success: true, traceId };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Error in updateReviewers`,
        JSON.stringify({ error }),
      );
      ////////console.log('error in update reviewers', error);
      throw error;
    }
  }

  async findAllUsersByLocation(orgId: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting findAllUsersByLocation`,
      JSON.stringify({ orgId }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Building where condition`,
        JSON.stringify({ orgId, hasOrgId: !!orgId }),
      );

      let whereCondtion = {};
      if (!!orgId) {
        whereCondtion = {
          organizationId: orgId,
          deleted: false,
        };
      }

      this.logger.debug(
        `traceId=${traceId} - Where condition built`,
        JSON.stringify({ whereCondtion }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching users`,
        JSON.stringify({ whereCondtion }),
      );

      const users = await this.prisma.user.findMany({
        where: {
          ...whereCondtion,
        },
        // select: {
        //   id: true,
        //   username: true,
        //   email: true,
        //   firstname: true,
        //   lastname: true,
        //   avatar: true,
        // },
        include: {
          entity: true,
          location: true,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Users fetched successfully`,
        JSON.stringify({ usersCount: users?.length }),
      );

      this.logger.debug(
        `traceId=${traceId} - Extracting distinct role IDs`,
        JSON.stringify({ usersCount: users?.length }),
      );

      const distinctRoleIds = Array.from(
        new Set(users.flatMap((u) => u.roleId)),
      );

      this.logger.debug(
        `traceId=${traceId} - Distinct role IDs extracted`,
        JSON.stringify({ distinctRoleIdsCount: distinctRoleIds?.length }),
      );

      // 3) Fetch all those roles in one go, filtering out REVIEWER/APPROVER
      this.logger.debug(
        `traceId=${traceId} - Fetching roles`,
        JSON.stringify({ distinctRoleIdsCount: distinctRoleIds?.length }),
      );

      const roles = await this.prisma.role.findMany({
        where: {
          id: { in: distinctRoleIds },
          NOT: [
            { roleName: { contains: 'REVIEWER' } },
            { roleName: { contains: 'APPROVER' } },
          ],
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Roles fetched successfully`,
        JSON.stringify({ rolesCount: roles?.length }),
      );

      // 4) Build a map from role ID → role object
      this.logger.debug(
        `traceId=${traceId} - Building role map`,
        JSON.stringify({ rolesCount: roles?.length }),
      );

      const roleMap = new Map(
        roles.map((r) => [r.id, { ...r, role: r.roleName }]),
      );

      this.logger.debug(
        `traceId=${traceId} - Role map built`,
        JSON.stringify({ roleMapSize: roleMap.size }),
      );

      this.logger.log(
        `trace id=${traceId}, GET 'api/risk-register/users jobTitle query  success`,
        '',
      );

      // 5) Attach `assignedRole` to each user by looking up in the map
      this.logger.debug(
        `traceId=${traceId} - Mapping users with assigned roles`,
        JSON.stringify({ usersCount: users?.length }),
      );

      const result = users.map((u) => ({
        ...u,
        assignedRole: u.roleId
          .map((rid: any) => roleMap.get(rid))
          .filter((r: any) => !!r),
        userId: u.id,
      }));

      this.logger.debug(
        `traceId=${traceId} - Users mapped with roles successfully`,
        JSON.stringify({ resultCount: result?.length }),
      );

      return result;
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - Error in findAllUsersByLocation`,
        JSON.stringify({ error }),
      );

      this.logger.error(
        `trace id=${traceId}, GET /risk-register/users/:orgId payload ${orgId}  failed with error ${error} `,
      );
      throw new InternalServerErrorException();
    }
  }

  async getAllDepartmentsByLocation(locationId: string) {
    try {
      const result = await this.prisma.entity.findMany({
        where: {
          locationId: locationId,
          deleted: false,
        },
        select: {
          id: true,
          entityName: true,
        },
        orderBy: {
          entityName: 'asc', // Sorts by locationName in ascending order
        },
      });

      if (!result) {
        return {
          data: null,
          status: '',
          message: 'No Departments found in the organinzation',
        };
      } else {
        this.logger.log(
          `trace id=${uuid()} GET /risk-register/getAllDepartmentsByLocation  payload locationId ${locationId} service successful`,
          '',
        );
        return {
          data: result,
          message: 'Departments Fetched Successfully',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/getAllDepartmentsByLocation/:locationId  $payload locationId ${locationId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getAllLocations(orgId: string) {
    try {
      const result = await this.prisma.location.findMany({
        where: {
          organizationId: orgId,
          deleted: false,
        },
        select: {
          id: true,
          locationName: true,
        },
        orderBy: {
          locationName: 'asc', // Sorts by locationName in ascending order
        },
      });

      if (!result) {
        return {
          data: null,
          status: '',
          message: 'No Units found in the organinzation',
        };
      } else {
        this.logger.log(
          `trace id=${uuid()} GET /risk-register/getAllLocations  payload orgId ${orgId} service successful`,
          '',
        );
        return {
          data: result,
          message: 'Units Fetched Successfully',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/getAllLocations/:orgId  $payload orgId ${orgId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async sendMailToReviewersFirstVersion(
    reviewers,
    url,
    hiraPageUrl,
    result,
    reviewStartedBy,
    payloadBody,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting sendMailToReviewersFirstVersion`,
      JSON.stringify({ reviewersCount: reviewers?.length, reviewStartedBy }),
    );

    const reviewerEmails = reviewers.map((userObj) => userObj.email);
    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const createdByUserDetails = await this.prisma.user.findFirst({
      where: {
        id: reviewStartedBy,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
        avatar: true,
      },
    });
    const htmlForReviewer = getReviewerMailTemplate(
      payloadBody?.jobTitle,
      payloadBody,
      formattedDate,
      url,
      hiraPageUrl,
      createdByUserDetails,
    );
    this.sendEmail(
      reviewerEmails,
      'Risk Initiated For Review',
      htmlForReviewer,
    );

    this.logger.debug(
      `traceId=${traceId} - Email sent to reviewers successfully`,
      JSON.stringify({ reviewerEmailsCount: reviewerEmails?.length }),
    );
  }

  async sendMailToApprovers(
    approvers,
    url,
    hiraPageUrl,
    result,
    reviewedBy,
    payloadBody,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting sendMailToApprovers`,
      JSON.stringify({ approversCount: approvers?.length, reviewedBy }),
    );

    // console.log("approvers in sendMail to approvers", approvers);
    // console.log("reviewedBy in sendMail to approvers", reviewedBy);

    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [...approvers, reviewedBy, result?.createdBy],
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const approverEmails = userDetails
      ?.filter((item: any) => approvers?.includes(item.id))
      .map((item) => item.email);
    // console.log("approver emails in sendMail to approvers", approverEmails);

    const reviewedByUserDetails = userDetails?.find(
      (item: any) => item.id === reviewedBy,
    );

    // console.log("reviewed by user details in sendMail to approvers", reviewedByUserDetails);
    const hiraCreatedByEmail = userDetails?.find(
      (item: any) => item.id === result?.createdBy,
    )?.email;
    const ccEmailsSet = new Set([
      hiraCreatedByEmail,
      reviewedByUserDetails?.email,
    ]);
    let ccEmails = Array.from(ccEmailsSet);
    // console.log("ccEmails in sendMail to approvers", ccEmails);

    const htmlForApprover = getApproverMailTemplate(
      payloadBody?.jobTitle,
      payloadBody,
      formattedDate,
      url,
      hiraPageUrl,
      reviewedByUserDetails,
    );
    // Filter out any email from ccEmails that is present in approverEmails
    ccEmails = ccEmails.filter((email) => !approverEmails.includes(email));
    this.sendEmailWithCcOption(
      approverEmails,
      ccEmails,
      'Risk Review Completed, Requested Approval',
      htmlForApprover,
    );

    this.logger.debug(
      `traceId=${traceId} - Email sent to approvers successfully`,
      JSON.stringify({
        approverEmailsCount: approverEmails?.length,
        ccEmailsCount: ccEmails?.length,
      }),
    );
  }

  async sendMailToUsersWhenHiraIsApproved(
    creator,
    reviewedBy,
    responsiblePersonIdArray = [],
    assesmentTeamUserIds = [],
    hiraPageUrl,
    result,
    approvedBy,
    payloadBody,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting sendMailToUsersWhenHiraIsApproved`,
      JSON.stringify({
        creator,
        reviewedBy,
        responsiblePersonCount: responsiblePersonIdArray?.length,
        assesmentTeamCount: assesmentTeamUserIds?.length,
        approvedBy,
      }),
    );

    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [
            approvedBy,
            creator,
            reviewedBy,
            ...responsiblePersonIdArray,
            ...assesmentTeamUserIds,
          ],
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
        avatar: true,
      },
    });
    const creatorEmail = userDetails?.find(
      (item: any) => item.id === creator,
    )?.email;
    // console.log("creator email in sendMailToCreatorWhenHiraIsApproved", creatorEmail);
    const approvedByUserDetails = userDetails?.find(
      (item: any) => item.id === approvedBy,
    );
    // console.log("approved by user details in sendMailToCreatorWhenHiraIsApproved", approvedByUserDetails);
    const htmlForCreator = getCreatorMailTemplateWhenHiraIsApproved(
      payloadBody,
      formattedDate,
      hiraPageUrl,
      approvedByUserDetails,
    );
    const reviewedByEmail = userDetails?.find(
      (item: any) => item.id === reviewedBy,
    )?.email;
    let responsiblePersonEmails = [];
    if (responsiblePersonIdArray.length) {
      responsiblePersonEmails = userDetails
        ?.filter((item: any) => responsiblePersonIdArray?.includes(item.id))
        .map((item) => item.email);
    }
    const assesmentTeamEmails = userDetails
      ?.filter((item: any) => assesmentTeamUserIds?.includes(item.id))
      .map((item) => item.email);
    // console.log("assesment team emails in sendMailToCreatorWhenHiraIsApproved", assesmentTeamEmails);

    //cc to reviewer, responsiblePeople, assesmentTeam People
    const ccEmailsSet = new Set([
      reviewedByEmail,
      ...responsiblePersonEmails,
      ...assesmentTeamEmails,
    ]);

    let ccEmailArray = Array.from(ccEmailsSet);

    // console.log("ccEmailArray in sendMailToUsersWhenHiraIsApproved", ccEmailArray);

    // Filter out the recipient's email from the ccEmailArray
    ccEmailArray = ccEmailArray.filter((email) => email !== creatorEmail);
    this.sendEmailWithCcOption(
      [creatorEmail],
      ccEmailArray,
      'Risk Approved',
      htmlForCreator,
    );

    this.logger.debug(
      `traceId=${traceId} - Email sent to users when HIRA is approved successfully`,
      JSON.stringify({
        creatorEmail,
        ccEmailCount: ccEmailArray?.length,
      }),
    );
  }

  async sendMailToResponsiblePersonWhenHiraIsApproved(
    responsiblePersonIdArray,
    hiraPageUrl,
    result,
    approvedBy,
    payloadBody,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting sendMailToResponsiblePersonWhenHiraIsApproved`,
      JSON.stringify({
        responsiblePersonCount: responsiblePersonIdArray?.length,
        approvedBy,
      }),
    );

    const responsiblePersonEmails = await this.prisma.user.findMany({
      where: {
        id: {
          in: responsiblePersonIdArray,
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
    const emails = responsiblePersonEmails.map((item) => item?.email);
    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const createdByUserDetails = await this.prisma.user.findFirst({
      where: {
        id: approvedBy,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
        avatar: true,
      },
    });
    // console.log("responsible person emails", emails);

    const htmlForResponsiblePeople =
      getResponsiblePersonMailTempalateWhenHiraIsApproved(
        payloadBody,
        formattedDate,
        hiraPageUrl,
        createdByUserDetails,
      );
    this.sendEmail(
      emails,
      'Risk Approval Notification',
      htmlForResponsiblePeople,
    );

    this.logger.debug(
      `traceId=${traceId} - Email sent to responsible persons successfully`,
      JSON.stringify({ emailsCount: emails?.length }),
    );
  }

  async sendMailToCreatorWhenHiraIsRejectedInReview(
    creator,
    hiraPageUrl,
    result,
    rejectedBy,
    payloadBody,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting sendMailToCreatorWhenHiraIsRejectedInReview`,
      JSON.stringify({ creator, rejectedBy }),
    );

    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [rejectedBy, creator],
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
        avatar: true,
      },
    });
    const creatorEmail = userDetails?.find(
      (item: any) => item.id === creator,
    )?.email;
    const rejectedByUserDetails = userDetails?.find(
      (item: any) => item.id === rejectedBy,
    );

    const htmlForCreatorAndReviewers =
      getCreatorAndReviewerMailTemplateWhenHiraIsRejected(
        payloadBody,
        hiraPageUrl,
        rejectedByUserDetails,
      );
    this.sendEmail([creatorEmail], 'Risk Rejected', htmlForCreatorAndReviewers);

    this.logger.debug(
      `traceId=${traceId} - Email sent to creator when HIRA is rejected in review successfully`,
      JSON.stringify({ creatorEmail }),
    );
  }

  async sendMailToCreatorAndReviewerOnHiraRejectionInApproval(
    creator,
    reviewedBy,
    hiraPageUrl,
    result,
    rejectedBy,
    payloadBody,
  ) {
    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [reviewedBy, rejectedBy, creator],
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
        avatar: true,
      },
    });
    const creatorEmail = userDetails?.find(
      (item: any) => item.id === creator,
    )?.email;
    const rejectedByUserDetails = userDetails?.find(
      (item: any) => item.id === rejectedBy,
    );
    const reviewerEmail = userDetails?.find(
      (item: any) => item.id === reviewedBy,
    )?.email;
    const htmlForCreatorAndReviewers =
      getCreatorAndReviewerMailTemplateWhenHiraIsRejected(
        payloadBody,
        hiraPageUrl,
        rejectedByUserDetails,
      );
    this.sendEmailWithCcOption(
      [creatorEmail],
      [reviewerEmail],
      'Risk Rejected',
      htmlForCreatorAndReviewers,
    );
  }

  async startReviewFirstVersion(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting startReviewFirstVersion`,
      JSON.stringify({ hiraId, body }),
    );

    try {
      // Input validation
      if (!hiraId || !body) {
        throw new Error('Invalid input: HIRA ID or body is missing');
      }
      const { reviewers, approvers, reviewStartedBy } = body;
      // console.log("body in start review first version", body);

      this.logger.debug(
        `traceId=${traceId} - Extracting request parameters`,
        JSON.stringify({
          reviewersCount: reviewers?.length,
          approversCount: approvers?.length,
          reviewStartedBy,
        }),
      );

      // Validate required fields
      if (!reviewStartedBy || !reviewers?.length || !approvers?.length) {
        throw new Error(
          'Missing required fields: reviewStartedBy, reviewers, or approvers',
        );
      }
      const existingHira = await this.hiraModel
        .findOne({
          _id: hiraId,
        })
        .select('currentVersion');
      const targetCycleNumber = existingHira.currentVersion + 1;
      // console.log("targetCcyclenumenr in startReviewFirstVersion status --- ", targetCycleNumber);

      this.logger.debug(
        `traceId=${traceId} - Retrieved existing HIRA`,
        JSON.stringify({
          currentVersion: existingHira?.currentVersion,
          targetCycleNumber,
        }),
      );

      const workflowObjectToBePushed: any = {
        cycleNumber: targetCycleNumber,
        status: 'IN_REVIEW',
        reviewStartedBy: reviewStartedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),
        comments: body?.comments || [],
        workflowHistory: [
          {
            action: 'Review Started',
            by: reviewStartedBy,
            datetime: new Date(), // Current date and time
          },
        ],
        reason: body?.reason || '',
      };

      this.logger.debug(
        `traceId=${traceId} - Created workflow object`,
        JSON.stringify({ workflowObject: workflowObjectToBePushed }),
      );

      const result = await this.hiraModel.findByIdAndUpdate(
        hiraId,
        {
          $push: { workflow: workflowObjectToBePushed }, // Push the new workflow entry to the workflow array
          $set: {
            workflowStatus: 'IN_REVIEW',
            createdBy: reviewStartedBy, // Optionally set the createdBy field
          },
        },
        { new: true }, // Return the updated document
      );
      // Check if the update operation succeeded
      if (!result) {
        throw new Error(`Failed to update HIRA record with ID ${hiraId}`);
      }

      this.logger.debug(
        `traceId=${traceId} - Updated HIRA with workflow`,
        JSON.stringify({
          updatedHiraId: result._id,
          workflowStatus: result.workflowStatus,
        }),
      );

      const workflowUrl = `${
        process.env.PROTOCOL + '://' + body.url + '/' + hiraId
      }`;
      const hiraPageUrl = `${
        process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
      }`;

      this.logger.debug(
        `traceId=${traceId} - Generated URLs for notifications`,
        JSON.stringify({ workflowUrl, hiraPageUrl }),
      );

      this.sendMailToReviewersFirstVersion(
        reviewers,
        workflowUrl,
        hiraPageUrl,
        result,
        reviewStartedBy,
        body,
      );

      this.logger.debug(
        `traceId=${traceId} - Sent notifications to reviewers`,
        JSON.stringify({ reviewersCount: reviewers?.length }),
      );

      this.logger.debug(
        `traceId=${traceId} - startReviewFirstVersion completed successfully`,
        JSON.stringify({ result }),
      );

      return { result, traceId };
    } catch (error) {
      // Log error for debugging
      console.error('Error in startReviewFirstVersion:', error);
      // Rethrow the error to be handled by the calling function or middleware
      throw new Error(`Unable to start review: ${error.message}`);
    }
  }

  async startHiraReviewOfRejectedHira(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting startHiraReviewOfRejectedHira`,
      JSON.stringify({ hiraId, body }),
    );

    try {
      // Input validation
      if (!hiraId || !body) {
        throw new Error('Invalid input: HIRA ID or body is missing');
      }
      const { reviewers, approvers, reviewStartedBy } = body;
      // console.log("body in start review first version", body);

      this.logger.debug(
        `traceId=${traceId} - Extracting request parameters`,
        JSON.stringify({
          reviewersCount: reviewers?.length,
          approversCount: approvers?.length,
          reviewStartedBy,
        }),
      );

      // Validate required fields
      if (!reviewStartedBy || !reviewers?.length || !approvers?.length) {
        throw new Error(
          'Missing required fields: reviewStartedBy, reviewers, or approvers',
        );
      }

      const existingHira = await this.hiraModel.findById(hiraId);
      // Check if the document exists
      if (!existingHira) {
        throw new Error(`No HIRA found with ID ${hiraId}`);
      }

      this.logger.debug(
        `traceId=${traceId} - Retrieved existing HIRA`,
        JSON.stringify({
          currentVersion: existingHira?.currentVersion,
          status: existingHira?.status,
        }),
      );

      // console.log("existingHira in startHiraReviewOfRejectedHira status --- ", body?.status,existingHira);

      // Determine the target cycle number for update
      const targetCycleNumber = existingHira.currentVersion + 1;

      this.logger.debug(
        `traceId=${traceId} - Calculating target cycle number`,
        JSON.stringify({ targetCycleNumber }),
      );

      let updateStatusQueryResult;
      updateStatusQueryResult = await this.hiraModel.updateOne(
        {
          _id: hiraId,
          'workflow.cycleNumber': targetCycleNumber,
        },
        {
          $set: {
            'workflow.$.status': body?.status,
            'workflow.$.reviewStartedBy': reviewStartedBy,
            'workflow.$.reviewedOn': '',
            reviewers: reviewers?.map((item: any) => item.id),
            approvers: approvers?.map((item: any) => item.id),
            comments: body?.comments || [],
            workflowStatus: body?.status,
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Review Started',
              by: reviewStartedBy,
              datetime: new Date(), // Current date and time
            },
          },
        },
      );

      this.logger.debug(
        `traceId=${traceId} - Updated workflow status`,
        JSON.stringify({ updateResult: updateStatusQueryResult }),
      );

      // Check if the update operation succeeded
      if (!updateStatusQueryResult?.modifiedCount) {
        throw new Error(`Failed to update HIRA record with ID ${hiraId}`);
      }
      const workflowUrl = `${
        process.env.PROTOCOL + '://' + body.url + '/' + hiraId
      }`;
      const hiraPageUrl = `${
        process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
      }`;

      this.logger.debug(
        `traceId=${traceId} - Generated URLs for notifications`,
        JSON.stringify({ workflowUrl, hiraPageUrl }),
      );

      this.sendMailToReviewersFirstVersion(
        reviewers,
        workflowUrl,
        hiraPageUrl,
        existingHira,
        reviewStartedBy,
        body,
      );

      this.logger.debug(
        `traceId=${traceId} - Sent notifications to reviewers`,
        JSON.stringify({ reviewersCount: reviewers?.length }),
      );

      this.logger.debug(
        `traceId=${traceId} - startHiraReviewOfRejectedHira completed successfully`,
        JSON.stringify({ updateStatusQueryResult }),
      );

      return { updateStatusQueryResult, traceId };
    } catch (error) {
      // Log error for debugging
      console.error('Error in startReviewFirstVersion:', error);
      // Rethrow the error to be handled by the calling function or middleware
      throw new Error(`Unable to start review: ${error.message}`);
    }
  }

  async approveHiraFirstVersionAndCreateHiraCopy(
    existingHira: any,
    hiraId: any,
    payloadBody: any,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting approveHiraFirstVersionAndCreateHiraCopy`,
      JSON.stringify({ hiraId, currentVersion: existingHira?.currentVersion }),
    );

    const session = await this.hiraModel.startSession();
    session.startTransaction();
    try {
      const targetCycleNumber = existingHira.currentVersion + 1;
      let serialNumber, mappedserialNumber;

      this.logger.debug(
        `traceId=${traceId} - Processing approval for cycle`,
        JSON.stringify({
          targetCycleNumber,
          isFirstVersion: existingHira?.currentVersion === 0,
        }),
      );

      if (existingHira?.currentVersion === 0) {
        //generate serial number and save it in the hira
        serialNumber = await this.serialNumberService.generateSerialNumber({
          moduleType: 'HIRA',
          location: payloadBody?.locationId,
          entity: payloadBody?.entityId,
          year: payloadBody?.year.toString(),
          createdBy: payloadBody?.updatedBy,
          organizationId: payloadBody.organizationId,
        });

        this.logger.debug(
          `traceId=${traceId} - Generated serial number`,
          JSON.stringify({ serialNumber }),
        );

        // console.log("GENERATE SERIAL NUMBER RESULT-->", serialNumber);

        if (serialNumber === undefined || serialNumber === '') {
          return new ConflictException({ status: 409 });
        }
        mappedserialNumber = await this.mapserialnumber(
          serialNumber,
          payloadBody?.locationId,
          payloadBody?.entityId,
          payloadBody.organizationId,
        );

        this.logger.debug(
          `traceId=${traceId} - Mapped serial number`,
          JSON.stringify({ mappedserialNumber }),
        );

        // console.log("MAPPED SERIAL NUMBER-->", mappedserialNumber);
      }
      const now = new Date();
      // Update the workflow status and add history for the existing HIRA before copying
      const updateStatusQueryResult = await this.hiraModel.updateOne(
        {
          _id: hiraId,
          'workflow.cycleNumber': targetCycleNumber,
        },
        {
          $set: {
            'workflow.$.status': 'APPROVED',
            'workflow.$.approvedBy': payloadBody?.updatedBy,
            'workflow.$.approvedOn': now,
            workflowStatus: 'APPROVED',
            ...(existingHira?.currentVersion === 0 && {
              prefixSuffix: mappedserialNumber,
            }),
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Approved',
              by: payloadBody?.updatedBy,
              datetime: now,
            },
            ...(payloadBody?.comments?.length && {
              'workflow.$.comments': {
                $each: payloadBody?.comments, // Push each comment to the existing comments array
              },
            }),
          },
        },
        { session },
      );
      this.logger.debug(
        `traceId=${traceId} - Updated workflow status to approved`,
        JSON.stringify({ updateResult: updateStatusQueryResult }),
      );

      // Check if the workflow update was successful before proceeding
      if (
        !updateStatusQueryResult ||
        updateStatusQueryResult.modifiedCount === 0
      ) {
        throw new Error('Failed to update workflow status.');
      }

      // Update the status of the original HIRA to "archived"
      await this.hiraModel.updateOne(
        { _id: hiraId },
        { $set: { status: 'archived' } },
        { session },
      );

      this.logger.debug(
        `traceId=${traceId} - Archived original HIRA`,
        JSON.stringify({ originalHiraId: hiraId }),
      );

      // Copy all steps associated with the original HIRA and set them to "active"
      const copiedSteps = await Promise.all(
        existingHira.stepIds.map(async (stepId: string) => {
          const step = await this.hiraStepsModel
            .findById(stepId)
            .session(session);

          if (!step) {
            throw new Error(`Step with ID ${stepId} not found`);
          }

          // Update the status of the original step to "archived"
          await this.hiraStepsModel.updateOne(
            { _id: stepId },
            { $set: { status: 'archived' } },
            { session },
          );

          // Create a copy of the step with status "active"
          const copiedStep = new this.hiraStepsModel({
            ...step.toObject(),
            _id: undefined, // Mongoose will create a new ID for this document
            status: 'active',
            // createdAt: now,
            // updatedAt: now,
          });

          // Save the copied step and return the new ID
          const savedStep = await copiedStep.save({ session });
          return savedStep._id;
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Copied HIRA steps`,
        JSON.stringify({
          originalStepsCount: existingHira.stepIds?.length,
          copiedStepsCount: copiedSteps?.length,
        }),
      );

      // Create a new copy of the HIRA with the updated fields
      const hiraCopyObject = existingHira.toObject(); // Convert the original HIRA to a plain object

      // Remove the fields that should be automatically generated or need to be updated
      delete hiraCopyObject._id; // Allow Mongoose to create a new ID for the copy
      // delete hiraCopyObject.createdAt; // Reset the createdAt date
      // delete hiraCopyObject.updatedAt; // Reset the updatedAt date

      // Update the necessary fields for the copy
      hiraCopyObject.stepIds = copiedSteps?.map((stepId: any) =>
        stepId?.toString(),
      ); // Assign the copied step IDs
      hiraCopyObject.status = 'active'; // Set the new status
      hiraCopyObject.workflowStatus = 'APPROVED'; // Set the workflow status to 'APPROVED'
      if (existingHira?.currentVersion === 0) {
        hiraCopyObject.prefixSuffix = mappedserialNumber;
      }

      hiraCopyObject.currentVersion = targetCycleNumber; // Set the new version
      // hiraCopyObject.createdAt = now // Set the current creation date
      // hiraCopyObject.updatedAt = now // Set the current update date

      this.logger.debug(
        `traceId=${traceId} - Prepared HIRA copy object`,
        JSON.stringify({
          newVersion: hiraCopyObject.currentVersion,
          status: hiraCopyObject.status,
        }),
      );

      // Update the workflow status directly in the copied object
      hiraCopyObject.workflow = hiraCopyObject.workflow.map((workflow: any) => {
        if (workflow.cycleNumber === targetCycleNumber) {
          // Update the workflow object for the target cycle number
          return {
            ...workflow,
            status: 'APPROVED',
            approvedBy: payloadBody?.updatedBy,
            approvedOn: now,
            workflowHistory: [
              ...(workflow.workflowHistory || []),
              {
                action: 'Approved',
                by: payloadBody?.updatedBy,
                datetime: now,
              },
            ],
            comments: [
              ...(workflow.comments || []),
              ...(payloadBody?.comments?.length ? payloadBody.comments : []),
            ],
            hiraId: hiraId, // Add the archived HIRA ID in the current workflow cycle
          };
        }
        return workflow;
      });
      // console.log("hiraCopyObject", hiraCopyObject);
      // Create a new HIRA document using the modified object
      const copiedHira = await this.hiraModel.create([hiraCopyObject], {
        session,
      });

      // Extract the created HIRA from the result (since create returns an array)
      const savedHiraCopy = copiedHira[0];

      this.logger.debug(
        `traceId=${traceId} - Created new HIRA copy`,
        JSON.stringify({
          newHiraId: savedHiraCopy._id,
          newVersion: savedHiraCopy.currentVersion,
        }),
      );

      // Check for references and update refTo to the new HIRA ID
      const existingRefs = await this.refsService.getAllById(hiraId);
      // console.log("existingRefs in approveHiraFirstVersionANdCreateHira--", existingRefs);

      this.logger.debug(
        `traceId=${traceId} - Retrieved existing references`,
        JSON.stringify({ existingRefsCount: existingRefs?.length }),
      );

      if (existingRefs && existingRefs.length > 0) {
        await Promise.all(
          existingRefs.map(async (ref: any) => {
            await this.refsService.update({
              refs: [{ ...ref, refTo: savedHiraCopy._id?.toString() }],
              id: hiraId,
            });
          }),
        );

        this.logger.debug(
          `traceId=${traceId} - Updated references to new HIRA`,
          JSON.stringify({ updatedRefsCount: existingRefs?.length }),
        );
      }
      // Commit the transaction if everything succeeds
      await session.commitTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction committed successfully`,
        JSON.stringify({ newHiraId: savedHiraCopy._id }),
      );

      // Send notifications outside the transaction after successful commit
      const hiraPageUrl = `${
        process.env.PROTOCOL +
        '://' +
        payloadBody.hiraPageUrl +
        '/' +
        savedHiraCopy._id
      }`;
      // console.log("createdBy in approveHiraFirstVersionANdCreateHira--", hiraCopyObject?.createdBy);

      const ongoingWorkflowObject = existingHira.workflow.find(
        (workflow) => workflow.cycleNumber === targetCycleNumber,
      );

      // Fetch the responsible persons from the copied steps for notifications
      const getResponsiblePersonFromSteps = await this.hiraStepsModel
        .find({
          _id: { $in: hiraCopyObject?.stepIds },
        })
        .select('responsiblePerson');

      const responsiblePersonIdArray = getResponsiblePersonFromSteps
        .map((item) => item?.responsiblePerson)
        .filter((item) => !!item);
      const assesmentTeamUserIds = hiraCopyObject?.assesmentTeam;

      this.logger.debug(
        `traceId=${traceId} - Prepared notification recipients`,
        JSON.stringify({
          responsiblePersonsCount: responsiblePersonIdArray?.length,
          assessmentTeamCount: assesmentTeamUserIds?.length,
        }),
      );

      // Send mail to the creator, cc to reviewedBy, responsiblePeople and assessMentTEam
      this.sendMailToUsersWhenHiraIsApproved(
        hiraCopyObject?.createdBy,
        ongoingWorkflowObject?.reviewedBy,
        responsiblePersonIdArray,
        assesmentTeamUserIds,
        hiraPageUrl,
        hiraCopyObject,
        payloadBody?.approvedBy,
        payloadBody,
      );

      this.logger.debug(
        `traceId=${traceId} - Sent approval notifications`,
        JSON.stringify({ notificationType: 'approval' }),
      );

      // console.log("responsiblePersonIdArray in approveHiraFirstVersionANdCreateHira", responsiblePersonIdArray);

      // Send mail to responsible persons if there are any
      if (responsiblePersonIdArray?.length) {
        this.sendMailToResponsiblePersonWhenHiraIsApproved(
          responsiblePersonIdArray,
          hiraPageUrl,
          hiraCopyObject,
          payloadBody?.approvedBy,
          payloadBody,
        );

        this.logger.debug(
          `traceId=${traceId} - Sent notifications to responsible persons`,
          JSON.stringify({
            responsiblePersonsCount: responsiblePersonIdArray?.length,
          }),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - approveHiraFirstVersionAndCreateHiraCopy completed successfully`,
        JSON.stringify({ newHiraId: savedHiraCopy._id }),
      );

      return savedHiraCopy;
    } catch (error) {
      // Rollback the transaction in case of any error
      await session.abortTransaction();
      session.endSession();
      console.log('Error in approveHiraFirstVersionAndCreateHiraCopy:', error);
      throw error;
    }
  }

  async updateWorkflowStatus(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateWorkflowStatus`,
      JSON.stringify({ hiraId, status: body?.status }),
    );

    // console.log("body in updateWorkflowStatus status ====", body?.status,  body);

    try {
      // Input validation
      if (!hiraId || !body) {
        throw new Error('Invalid input: HIRA ID or body is missing');
      }
      const { status, updatedBy, reviewedBy, comment } = body;
      // Validate required fields
      if (!updatedBy || !status) {
        throw new Error('Missing required fields: userId or status');
      }

      this.logger.debug(
        `traceId=${traceId} - Extracting request parameters`,
        JSON.stringify({ status, updatedBy, reviewedBy }),
      );

      // Find the document by ID
      const existingHira = await this.hiraModel.findById(hiraId);
      // Check if the document exists
      if (!existingHira) {
        throw new Error(`No HIRA found with ID ${hiraId}`);
      }

      this.logger.debug(
        `traceId=${traceId} - Retrieved existing HIRA`,
        JSON.stringify({
          currentVersion: existingHira?.currentVersion,
          currentStatus: existingHira?.workflowStatus,
        }),
      );

      // console.log("existingHira in updateWorkflowStatus status --- ", status,existingHira);

      // Determine the target cycle number for update
      const targetCycleNumber = existingHira.currentVersion + 1;

      this.logger.debug(
        `traceId=${traceId} - Processing workflow status update`,
        JSON.stringify({ targetCycleNumber, newStatus: status }),
      );

      let updateStatusQueryResult;
      if (status === 'IN_APPROVAL') {
        // Perform the update for the specific workflow with the target cycle number
        updateStatusQueryResult = await this.hiraModel.updateOne(
          {
            _id: hiraId,
            'workflow.cycleNumber': targetCycleNumber,
          },
          {
            $set: {
              'workflow.$.status': status,
              'workflow.$.reviewedBy': reviewedBy,
              'workflow.$.reviewedOn': new Date(),
              workflowStatus: status,
            },
            $push: {
              'workflow.$.workflowHistory': {
                action: 'Review Completed',
                by: reviewedBy,
                datetime: new Date(),
              },
              ...(body?.comments?.length && {
                'workflow.$.comments': {
                  $each: body?.comments, // Push each comment to the existing comments array
                },
              }),
            },
          },
        );

        this.logger.debug(
          `traceId=${traceId} - Updated workflow to IN_APPROVAL`,
          JSON.stringify({ updateResult: updateStatusQueryResult }),
        );

        // console.log(
        //   'updateStatusQueryResult in updateworkflowstatus status ==',
        //   status,
        //   updateStatusQueryResult,
        // );
        const ongoingWorkflowObject = existingHira.workflow.find(
          (workflow) => workflow.cycleNumber === targetCycleNumber,
        );

        this.logger.debug(
          `traceId=${traceId} - Retrieved ongoing workflow object`,
          JSON.stringify({
            approversCount: ongoingWorkflowObject?.approvers?.length,
          }),
        );

        // console.log(
        //   'ongoingWorkflowObject in updateworkflowstatus status ==',
        //   status,
        //   ongoingWorkflowObject,
        // );

        if (!!updateStatusQueryResult) {
          const workflowUrl = `${
            process.env.PROTOCOL + '://' + body.url + '/' + hiraId
          }`;
          const hiraPageUrl = `${
            process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
          }`;

          this.logger.debug(
            `traceId=${traceId} - Generated URLs for approver notifications`,
            JSON.stringify({ workflowUrl, hiraPageUrl }),
          );

          //send mail to approvers
          this.sendMailToApprovers(
            ongoingWorkflowObject?.approvers,
            workflowUrl,
            hiraPageUrl,
            existingHira,
            reviewedBy,
            body,
          );

          this.logger.debug(
            `traceId=${traceId} - Sent notifications to approvers`,
            JSON.stringify({
              approversCount: ongoingWorkflowObject?.approvers?.length,
            }),
          );
        }
        return updateStatusQueryResult;
      } else if (status === 'REJECTED') {
        const existingWorkflowStatus = existingHira.workflow.find(
          (workflow) => workflow.cycleNumber === targetCycleNumber,
        ).status;

        this.logger.debug(
          `traceId=${traceId} - Processing rejection`,
          JSON.stringify({
            existingWorkflowStatus,
            rejectedBy: body?.rejectedBy,
          }),
        );

        updateStatusQueryResult = await this.hiraModel.updateOne(
          {
            _id: hiraId,
            'workflow.cycleNumber': targetCycleNumber,
          },
          {
            $set: {
              'workflow.$.status': status,
              'workflow.$.rejectedBy': body?.rejectedBy,
              workflowStatus: status,
            },
            $push: {
              'workflow.$.workflowHistory': {
                action: 'Rejected',
                by: body?.rejectedBy,
                datetime: new Date(),
              },
              ...(body?.comments?.length && {
                'workflow.$.comments': {
                  $each: body?.comments, // Push each comment to the existing comments array
                },
              }),
            },
          },
        );

        this.logger.debug(
          `traceId=${traceId} - Updated workflow to REJECTED`,
          JSON.stringify({ updateResult: updateStatusQueryResult }),
        );

        // console.log(
        //   'updateStatusQueryResult in updateworkflowstatus status ==',
        //   status,
        //   updateStatusQueryResult,
        // );
        const ongoingWorkflowObject = existingHira.workflow.find(
          (workflow) => workflow.cycleNumber === targetCycleNumber,
        );

        this.logger.debug(
          `traceId=${traceId} - Retrieved ongoing workflow for rejection`,
          JSON.stringify({ reviewer: ongoingWorkflowObject?.reviewedBy }),
        );

        // console.log(
        //   'ongoingWorkflowObject in updateworkflowstatus status ==',
        //   status,
        //   ongoingWorkflowObject,
        // );

        if (!!updateStatusQueryResult) {
          const hiraPageUrl = `${
            process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
          }`;

          this.logger.debug(
            `traceId=${traceId} - Generated URL for rejection notifications`,
            JSON.stringify({ hiraPageUrl }),
          );

          if (existingWorkflowStatus === 'IN_REVIEW') {
            //send mail to creator when hira is reject in IN_REVIEW stage
            this.sendMailToCreatorWhenHiraIsRejectedInReview(
              existingHira?.createdBy,
              hiraPageUrl,
              existingHira,
              body?.rejectedBy,
              body,
            );

            this.logger.debug(
              `traceId=${traceId} - Sent rejection notification to creator (IN_REVIEW stage)`,
              JSON.stringify({ creator: existingHira?.createdBy }),
            );
          } else if (existingWorkflowStatus === 'IN_APPROVAL') {
            //send mail to creator and cc to reviewer
            this.sendMailToCreatorAndReviewerOnHiraRejectionInApproval(
              existingHira?.createdBy,
              ongoingWorkflowObject?.reviewedBy,
              hiraPageUrl,
              existingHira,
              body?.rejectedBy,
              body,
            );

            this.logger.debug(
              `traceId=${traceId} - Sent rejection notification to creator and reviewer (IN_APPROVAL stage)`,
              JSON.stringify({
                creator: existingHira?.createdBy,
                reviewer: ongoingWorkflowObject?.reviewedBy,
              }),
            );
          }
        }
        return updateStatusQueryResult;
      } else if (status === 'APPROVED') {
        this.logger.debug(
          `traceId=${traceId} - Processing approval`,
          JSON.stringify({ currentVersion: existingHira?.currentVersion }),
        );

        // if(existingHira?.currentVersion === 0) {
        this.approveHiraFirstVersionAndCreateHiraCopy(
          existingHira,
          hiraId,
          body,
        );

        this.logger.debug(
          `traceId=${traceId} - Completed approval process`,
          JSON.stringify({ approvalCompleted: true }),
        );
        // console.log("updateStatusQueryResult", updateStatusQueryResult);
        // }
      }

      this.logger.debug(
        `traceId=${traceId} - updateWorkflowStatus completed successfully`,
        JSON.stringify({ finalStatus: status }),
      );

      return updateStatusQueryResult;
    } catch (error) {
      console.log('Error in updateWorkflowStatus:', error);
    }
  }

  sendEmail = async (recipients, subject, html) => {
    // console.log("recipients in sendmail-->", recipients);

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendBulkEmails(
          recipients,
          subject,
          '',
          html,
        );
        this.logger.log(
          `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
          '',
        );
      } else {
        try {
          await sgMail.send({
            to: recipients,
            from: process.env.FROM,
            subject: subject,
            html: html,
          });
          this.logger.log(
            `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
            '',
          );
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, ERROR IN SENDING EMAIL sendEmail function in risk register service recipients  ${recipients} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  };

  sendEmailWithCcOption = async (
    recipients = [],
    cc = [],
    subject = '',
    html = '',
  ) => {
    // console.log("recipients in sendEmailWithCcOption-->", recipients);
    // console.log("cc in sendEmailWithCcOption-->", cc);

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendBulkEmails(
          [...recipients, ...cc],
          subject,
          '',
          html,
        );
        this.logger.log(
          `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
          '',
        );
      } else {
        try {
          await sgMail.send({
            to: recipients,
            cc: cc,
            from: process.env.FROM,
            subject: subject,
            html: html,
          });
          this.logger.log(
            `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
            '',
          );
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, ERROR IN SENDING EMAIL sendEmail function in risk register service recipients  ${recipients} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  };

  async mapserialnumber(serialnumber, locationId, entityId, organizationId) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting mapserialnumber`,
      JSON.stringify({ serialnumber, locationId, entityId, organizationId }),
    );

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

    this.logger.debug(
      `traceId=${traceId} - mapserialnumber completed successfully`,
      JSON.stringify({ serialNumber1 }),
    );

    return serialNumber1;
  }

  async getHiraForInbox(user, randomNumber) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getHiraForInbox`,
      JSON.stringify({ userId: user?.id, randomNumber }),
    );

    try {
      // console.log("user in getHiraForInbox>>>>>>>>>>", user);

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Retrieved active user`,
        JSON.stringify({
          activeUserId: activeUser?.id,
          organizationId: activeUser?.organizationId,
        }),
      );

      // Fetch HIRA records where the status is 'IN_REVIEW' and 'IN_APPROVAL' respectively
      const isReviewer = await this.hiraModel.find(
        {
          organizationId: activeUser.organizationId,
          workflowStatus: 'IN_REVIEW',
        },
        {
          jobTitle: 1,
          categoryId: 1,
          status: 1,
          updatedAt: 1,
          workflow: 1, // Include the workflow field to process it in the application code
        },
      );

      const isApprover = await this.hiraModel.find(
        {
          organizationId: activeUser.organizationId,
          workflowStatus: 'IN_APPROVAL',
        },
        {
          jobTitle: 1,
          categoryId: 1,
          status: 1,
          updatedAt: 1,
          workflow: 1, // Include the workflow field to process it in the application code
        },
      );

      this.logger.debug(
        `traceId=${traceId} - Retrieved Risk records`,
        JSON.stringify({
          reviewerRecordsCount: isReviewer?.length,
          approverRecordsCount: isApprover?.length,
        }),
      );

      // console.log("isReviewer ------>>>>>>", isReviewer);
      // console.log("isApprover ---------->>>>>>>>>>>>", isApprover);

      // Filter records where the active user is a reviewer in the last workflow entry
      const filteredReviewerRecords = isReviewer.filter((hira) => {
        // console.log("hira in filterReviewREcords", hira);

        const lastWorkflow = hira.workflow[hira.workflow.length - 1];
        // console.log("latestworkflow in filterReviewREcords", lastWorkflow);

        return lastWorkflow?.reviewers.includes(activeUser.id);
      });

      // Filter records where the active user is an approver in the last workflow entry
      const filteredApproverRecords = isApprover.filter((hira) => {
        // console.log("hira in filterApproverRecords", hira);

        const lastWorkflow = hira.workflow[hira.workflow.length - 1];
        // console.log("latestworkflow in filterApproverRecords", lastWorkflow);

        return lastWorkflow?.approvers.includes(activeUser.id);
      });

      this.logger.debug(
        `traceId=${traceId} - Filtered records for user`,
        JSON.stringify({
          filteredReviewerCount: filteredReviewerRecords?.length,
          filteredApproverCount: filteredApproverRecords?.length,
        }),
      );

      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraForInbox payload query ${user} success`,
        '',
      );

      const result = {
        reviewState: filteredReviewerRecords,
        approveState: filteredApproverRecords,
      };

      this.logger.debug(
        `traceId=${traceId} - getHiraForInbox completed successfully`,
        JSON.stringify({ result }),
      );

      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber}, GET /api/riskconfig/getHiraForInbox`,
        'riskconfig.controller',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getStepsCountByHazardType(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getStepsCountByHazardType`,
      JSON.stringify({ orgId, query }),
    );

    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      // console.log('QUERY getHiraCounByHazardType', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
        };
        if (!!query?.entity?.length) {
          whereCondition = {
            ...whereCondition,
            entityId: { $in: query?.entity },
          };
        }
        if (!!query?.unit?.length) {
          whereCondition = {
            ...whereCondition,
            locationId: { $in: query?.unit },
          };
        }
        if (!!query?.category?.length) {
          whereCondition = {
            ...whereCondition,
            categoryId: { $in: query?.category },
          };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        whereCondition = {
          status: 'active',
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }

        if (!!query?.categoryId) {
          whereCondition.categoryId = query?.categoryId;
        }

        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
      }

      this.logger.debug(
        `traceId=${traceId} - Built where condition`,
        JSON.stringify({ whereCondition }),
      );

      // console.log("WHERE CONDITION:", JSON.stringify(whereCondition));

      const hiraList = await this.hiraModel
        .find({
          ...whereCondition,
          ...(query?.inWorkflow && {
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          }),
        })
        .select('stepIds')
        .lean();

      const stepIds = hiraList?.map((hira) => hira?.stepIds).flat();

      this.logger.debug(
        `traceId=${traceId} - Retrieved Risk list`,
        JSON.stringify({
          hiraListCount: hiraList?.length,
          stepIdsCount: stepIds?.length,
        }),
      );

      const hiraStepsGroupedByHazardType = await this.hiraStepsModel.aggregate([
        {
          $match: {
            ...whereCondition,
          },
        },
        {
          $group: {
            _id: '$riskSource',
            stepIds: { $push: '$_id' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            riskSource: '$_id',
            stepIds: 1,
            count: 1,
            _id: 0,
          },
        },
      ]);

      this.logger.debug(
        `traceId=${traceId} - Aggregated steps by hazard type`,
        JSON.stringify({
          groupedStepsCount: hiraStepsGroupedByHazardType?.length,
        }),
      );

      const filteredStepsBasedOnHiraFitler =
        hiraStepsGroupedByHazardType.filter((item) => {
          return item?.stepIds?.some((stepId) =>
            stepIds.includes(stepId.toString()),
          );
        });

      this.logger.debug(
        `traceId=${traceId} - Filtered steps based on Risk filter`,
        JSON.stringify({
          filteredStepsCount: filteredStepsBasedOnHiraFitler?.length,
        }),
      );

      const hazardSet = new Set();
      const stepIdSet = new Set();
      filteredStepsBasedOnHiraFitler?.forEach((item) => {
        item.riskSource && hazardSet?.add(item.riskSource);
        item?.stepIds?.forEach((stepId) => {
          stepId && stepIdSet?.add(stepId.toString());
        });
      });

      this.logger.debug(
        `traceId=${traceId} - Created sets from filtered steps`,
        JSON.stringify({
          hazardSetSize: hazardSet.size,
          stepIdSetSize: stepIdSet.size,
        }),
      );

      if (!!filteredStepsBasedOnHiraFitler?.length) {
        const [hazardsList, hirasList] = await Promise.all([
          this.hiraTypeConfigModel
            .find({
              _id: {
                $in: Array.from(hazardSet),
              },
              type: 'hazard',
              deleted: false,
              organizationId: orgId,
            })
            .select('name _id')
            .lean(),
          this.hiraModel
            .find({
              stepIds: {
                $in: Array.from(stepIdSet),
              },
              organizationId: orgId,
              status: 'active',
              deleted: false,
            })
            .select('jobTitle stepIds'),
        ]);

        this.logger.debug(
          `traceId=${traceId} - Retrieved hazards and Risk`,
          JSON.stringify({
            hazardsListCount: hazardsList?.length,
            hirasListCount: hirasList?.length,
          }),
        );

        const hazardMap = new Map();
        hazardsList.forEach((hazard) => {
          hazardMap.set(hazard._id.toString(), hazard.name);
        });

        const stepIdToHiraMap = new Map();
        hirasList.forEach((hira) => {
          hira.stepIds.forEach((stepId) => {
            stepIdToHiraMap.set(stepId.toString(), {
              id: hira._id,
              jobTitle: hira.jobTitle,
            });
          });
        });

        const populatedResults = filteredStepsBasedOnHiraFitler.map((group) => {
          const hazardName = hazardMap.get(group.riskSource);
          const hira = group.stepIds.map((stepId) =>
            stepIdToHiraMap.get(stepId.toString()),
          );

          return {
            ...group,
            hazardName,
            hira,
            stepIds: group?.stepIds?.map((stepId) => stepId.toString()),
          };
        });

        const finalResult = populatedResults.filter((item) => item.riskSource);

        this.logger.debug(
          `traceId=${traceId} - getStepsCountByHazardType completed successfully`,
          JSON.stringify({ finalResultCount: finalResult?.length }),
        );

        // console.log('populatedResults--->>>', populatedResults);
        return finalResult;
      } else {
        this.logger.debug(
          `traceId=${traceId} - getStepsCountByHazardType completed with empty result`,
          JSON.stringify({ result: [] }),
        );

        return [];
      }
    } catch (error) {
      this.logger.error(
        `traceId=${uuid()} - Error in getStepsCountByHazardType`,
        JSON.stringify({ error: error.message }),
      );
    }
  }

  async getHiraCountByCondition(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getHiraCountByCondition`,
      JSON.stringify({ orgId, query }),
    );

    try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);

      let whereCondition: any = {
        status: 'active',
        organizationId: query?.organizationId,
      };

      this.logger.debug(
        `traceId=${traceId} - Initial where condition`,
        JSON.stringify({ whereCondition }),
      );

      if (query?.isPrimaryFilter) {
        if (!!query?.entity?.length) {
          whereCondition.entityId = { $in: query?.entity };
        }
        if (!!query?.unit?.length) {
          whereCondition.locationId = { $in: query?.unit };
        }
        if (!!query?.category?.length) {
          whereCondition.categoryId = { $in: query?.category };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition.createdAt = {
            $gte: new Date(query?.fromDate),
            $lt: new Date(query?.toDate),
          };
        }
      } else {
        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }
        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (!!query?.categoryId) {
          whereCondition.categoryId = query?.categoryId;
        }
        if (query?.inWorkflow) {
          whereCondition.workflowStatus = {
            $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'],
          };
        }
        if (query?.new) {
          whereCondition.createdAt = {
            $gte: currentYearStart,
            $lt: currentYearEnd,
          };
        }
        if (query?.significant) {
          whereCondition.preMitigationScore = { $gte: 8 };
        }
      }

      this.logger.debug(
        `traceId=${traceId} - Final where condition`,
        JSON.stringify({ whereCondition }),
      );

      // Create a master map for conditionId => name
      const conditionNameMap = new Map<string, string>();

      if (query?.categoryId) {
        // One specific HIRA config
        const config: any = await this.hiraConfigModel
          .findOne({
            _id: new ObjectId(query?.categoryId),
            deleted: false,
            organizationId: query?.organizationId,
          })
          .select('riskConditionOptions')
          .lean();

        if (config?.riskConditionOptions?.length) {
          for (const cond of config.riskConditionOptions) {
            if (cond?._id && cond?.label) {
              conditionNameMap.set(cond._id.toString(), cond.label);
            }
          }
        }

        this.logger.debug(
          `traceId=${traceId} - Retrieved specific Risk config`,
          JSON.stringify({
            categoryId: query?.categoryId,
            conditionOptionsCount: config?.riskConditionOptions?.length,
          }),
        );
      } else {
        // All HIRA configs under this org
        const allConfigs = await this.hiraConfigModel
          .find({
            deleted: false,
            organizationId: query?.organizationId,
          })
          .select('riskConditionOptions')
          .lean();

        for (const cfg of allConfigs) {
          cfg.riskConditionOptions?.forEach((cond: any) => {
            if (cond?._id && cond?.label) {
              conditionNameMap.set(cond._id.toString(), cond.label);
            }
          });
        }

        this.logger.debug(
          `traceId=${traceId} - Retrieved all Risk configs`,
          JSON.stringify({
            configsCount: allConfigs?.length,
            conditionMapSize: conditionNameMap.size,
          }),
        );
      }

      // Now run the actual aggregation
      const hiraData = await this.hiraModel.aggregate([
        { $match: whereCondition },
        {
          $group: {
            _id: '$condition',
            count: { $sum: 1 },
            hiras: {
              $push: {
                jobTitle: '$jobTitle',
                hiraId: '$_id',
              },
            },
          },
        },
        {
          $project: {
            conditionId: '$_id',
            count: 1,
            hiras: 1,
            _id: 0,
          },
        },
      ]);

      this.logger.debug(
        `traceId=${traceId} - Aggregated Risk data`,
        JSON.stringify({ hiraDataCount: hiraData?.length }),
      );

      if (hiraData?.length) {
        const result = hiraData.map((group) => ({
          ...group,
          conditionLabel: conditionNameMap.get(group.conditionId),
        }));

        this.logger.debug(
          `traceId=${traceId} - getHiraCountByCondition completed successfully`,
          JSON.stringify({ resultCount: result?.length }),
        );

        return result;
      } else {
        this.logger.debug(
          `traceId=${traceId} - getHiraCountByCondition completed with empty result`,
          JSON.stringify({ result: [] }),
        );

        return [];
      }
    } catch (error) {
      console.error('Error in getHiraCountByCondition:', error);
      return [];
    }
  }

  async getStepsCountByScore(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getStepsCountByScore`,
      JSON.stringify({ orgId, query }),
    );

    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      // console.log('QUERY getHiraCounByHazardType', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
        };
        if (!!query?.entity?.length) {
          whereCondition = {
            ...whereCondition,
            entityId: { $in: query?.entity },
          };
        }
        if (!!query?.unit?.length) {
          whereCondition = {
            ...whereCondition,
            locationId: { $in: query?.unit },
          };
        }
        if (!!query?.category?.length) {
          whereCondition = {
            ...whereCondition,
            categoryId: { $in: query?.category },
          };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        whereCondition = {
          status: 'active',
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (!!query?.categoryId) {
          whereCondition.categoryId = query?.categoryId;
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            baseScore: { $gte: 8 },
          };
        }
      }

      this.logger.debug(
        `traceId=${traceId} - Built where condition`,
        JSON.stringify({ whereCondition }),
      );

      // console.log("WHERE CONDITION IN getStepsCountByScore", whereCondition);

      const stepsData = await this.hiraStepsModel.aggregate([
        {
          // Matching valid preMitigationScore and applying additional conditions
          $match: {
            baseScore: { $exists: true, $ne: null },
            ...whereCondition, // Apply your custom whereCondition here
          },
        },
        {
          // Grouping by the risk levels based on preMitigationScore
          $group: {
            _id: null, // Single document as output, not grouping by any field
            green: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$baseScore', 1] },
                      { $lte: ['$baseScore', 3] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            yellow: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$baseScore', 3] },
                      { $lte: ['$baseScore', 7] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            orange: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$baseScore', 7] },
                      { $lte: ['$baseScore', 13] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            red: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$baseScore', 13] },
                      { $lte: ['$baseScore', 25] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      this.logger.debug(
        `traceId=${traceId} - Aggregated steps data by score`,
        JSON.stringify({ stepsData }),
      );

      // console.log('stepsData in score graph--->>>', stepsData);

      this.logger.debug(
        `traceId=${traceId} - getStepsCountByScore completed successfully`,
        JSON.stringify({ result: stepsData }),
      );

      return stepsData;
    } catch (error) {
      this.logger.error(
        `traceId=${uuid()} - Error in getStepsCountByScore`,
        JSON.stringify({ error: error.message }),
      );
      console.log('error in getHiraCounByHazardType', error);
    }
  }

  async getTopTenHiraByScore(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getTopTenHiraByScore`,
      JSON.stringify({ orgId, query }),
    );

    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      // console.log('QUERY getHiraCounByHazardType', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
        };
        if (!!query?.entity?.length) {
          whereCondition = {
            ...whereCondition,
            entityId: { $in: query?.entity },
          };
        }
        if (!!query?.unit?.length) {
          whereCondition = {
            ...whereCondition,
            locationId: { $in: query?.unit },
          };
        }
        if (!!query?.category?.length) {
          whereCondition = {
            ...whereCondition,
            categoryId: { $in: query?.category },
          };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        whereCondition = {
          status: 'active',
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (!!query?.categoryId) {
          whereCondition.categoryId = query?.categoryId;
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
        // if (query?.significant) {
        //   whereCondition = {
        //     ...whereCondition,
        //     preMitigationScore: { $gte: 8 },
        //   };
        // }
      }

      this.logger.debug(
        `traceId=${traceId} - Built where condition`,
        JSON.stringify({ whereCondition }),
      );

      // console.log('WHERE CONDITION IN getTopTenHiraByScore', whereCondition);

      const allHiraList = await this.hiraModel
        .find({
          ...whereCondition,
        })
        .select('jobTitle stepIds')
        .lean();

      this.logger.debug(
        `traceId=${traceId} - Retrieved all HIRA list`,
        JSON.stringify({ allHiraListCount: allHiraList?.length }),
      );

      // console.log('allHiraList in getTopTenHiraByScore', allHiraList);

      const hiraStepIds = allHiraList?.map((hira) => hira?.stepIds).flat();

      this.logger.debug(
        `traceId=${traceId} - Extracted HIRA step IDs`,
        JSON.stringify({ hiraStepIdsCount: hiraStepIds?.length }),
      );

      // console.log('hiraStepIds in getTopTenHiraByScore', hiraStepIds);

      const allStepsList = await this.hiraStepsModel
        .find({
          _id: {
            $in: hiraStepIds,
          },
        })
        .select('baseScore')
        .lean();

      this.logger.debug(
        `traceId=${traceId} - Retrieved all steps list`,
        JSON.stringify({ allStepsListCount: allStepsList?.length }),
      );

      // console.log('allStepsList in getTopTenHiraByScore', allStepsList);
      // Map stepId to preMitigationScore for quick lookup
      const stepScoresMap = allStepsList.reduce((acc, step) => {
        acc[step._id] = step.baseScore;
        return acc;
      }, {});

      this.logger.debug(
        `traceId=${traceId} - Created step scores map`,
        JSON.stringify({
          stepScoresMapSize: Object.keys(stepScoresMap).length,
        }),
      );

      // console.log('stepScoresMap in getTopTenHiraByScore', stepScoresMap);

      // Calculate the score for each Hira based on the maximum preMitigationScore of its steps
      const hiraScores = allHiraList.map((hira) => {
        const maxScore = hira.stepIds
          .map((stepId) => stepScoresMap[stepId] || 0) // Get the score for each stepId or default to 0
          .reduce((max, score) => Math.max(max, score), 0); // Get the maximum score
        return { ...hira, maxScore }; // Return Hira with its highest score
      });

      this.logger.debug(
        `traceId=${traceId} - Calculated HIRA scores`,
        JSON.stringify({ hiraScoresCount: hiraScores?.length }),
      );

      // console.log('hiraScores in getTopTenHiraByScore', hiraScores);

      // Sort Hira by their maxScore in descending order
      const sortedHiraScores = hiraScores.sort(
        (a, b) => b.maxScore - a.maxScore,
      );

      // Return the top 10 Hira
      const topTenHira = sortedHiraScores.slice(0, 10);

      this.logger.debug(
        `traceId=${traceId} - getTopTenHiraByScore completed successfully`,
        JSON.stringify({ topTenHiraCount: topTenHira?.length }),
      );

      // console.log('Top 10 Hira by Score:', topTenHira);
      return topTenHira;
    } catch (error) {
      this.logger.error(
        `traceId=${uuid()} - Error in getTopTenHiraByScore`,
        JSON.stringify({ error: error.message }),
      );
      console.log('error in getHiraCounByHazardType', error);
    }
  }

  async fetchHiraDashboardBoardCounts(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting fetchHiraDashboardBoardCounts`,
      JSON.stringify({ orgId, query }),
    );

    try {
      // console.log("qyeruuuuu--->", query)
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      if (query?.isPrimaryFilter) {
        this.logger.debug(
          `traceId=${traceId} - Processing primary filter`,
          JSON.stringify({ isPrimaryFilter: true }),
        );

        // console.log("PRIMARY FILTER APPPLIED---------");
        let whereConditionForSignificantSteps: any = {
          status: 'active',
          deleted: false,
          organizationId: orgId,
          preMitigationScore: { $gte: 8 },
        };

        let whereCondition: any = {
          organizationId: orgId, // Matching organization ID
          status: 'active',
        };
        let whereConditionForCurrentYear: any = {
          organizationId: orgId,
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        if (!!query?.entity?.length) {
          whereCondition.entityId = { $in: query.entity };
          whereConditionForSignificantSteps.entityId = { $in: query.entity };
          whereConditionForCurrentYear.entityId = { $in: query.entity };
        }
        if (!!query?.unit?.length) {
          whereCondition.locationId = { $in: query.unit };
          whereConditionForSignificantSteps.locationId = { $in: query.unit };
          whereConditionForCurrentYear.locationId = { $in: query.unit };
        }
        if (!!query?.category?.length) {
          whereCondition.categoryId = { $in: query.category };
          whereConditionForSignificantSteps.categoryId = {
            $in: query.category,
          };
          whereConditionForCurrentYear.categoryId = { $in: query.category };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition.createdAt = {
            $gte: new Date(query.fromDate),
            $lt: new Date(query.toDate),
          };
          whereConditionForSignificantSteps.createdAt = {
            $gte: new Date(query.fromDate),
            $lt: new Date(query.toDate),
          };
          whereConditionForCurrentYear = {
            ...whereConditionForCurrentYear,
            // createdAt: {
            //   $gte: new Date(query.fromDate),
            //   $lt: new Date(query.toDate),
            // },
          };
        }

        this.logger.debug(
          `traceId=${traceId} - Built where conditions for primary filter`,
          JSON.stringify({
            whereCondition,
            whereConditionForSignificantSteps,
            whereConditionForCurrentYear,
          }),
        );

        const resultsForTotalSteps = await this.hiraStepsModel.countDocuments({
          ...whereCondition,
        });
        const resultsForInWorkflowHira = await this.hiraModel.countDocuments({
          ...whereCondition,
          workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
        });

        const resultsForTotalCurrentYearHira =
          await this.hiraModel.countDocuments({
            ...whereConditionForCurrentYear,
          });

        const totalSignificantSteps = await this.hiraStepsModel.countDocuments({
          ...whereConditionForSignificantSteps,
        });

        this.logger.debug(
          `traceId=${traceId} - Retrieved counts for primary filter`,
          JSON.stringify({
            resultsForTotalSteps,
            resultsForInWorkflowHira,
            resultsForTotalCurrentYearHira,
            totalSignificantSteps,
          }),
        );

        const formattedResult = {
          totalSteps: resultsForTotalSteps,
          inWorkflowHira: resultsForInWorkflowHira,
          totalHiraTillDate: resultsForTotalCurrentYearHira,
          totalSignificantSteps,
        };

        this.logger.debug(
          `traceId=${traceId} - fetchHiraDashboardBoardCounts completed successfully (primary filter)`,
          JSON.stringify({ formattedResult }),
        );

        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/fetchOverallStatusCounts payload query ${query} success`,
          '',
        );
        return formattedResult;
      } else {
        this.logger.debug(
          `traceId=${traceId} - Processing default filter`,
          JSON.stringify({ isPrimaryFilter: false }),
        );

        // console.log("DEFAULT FILTER APPLIED");

        let entityQueryForTotal: any = {
          organizationId: orgId,
          entityId: { $in: query.entity },
          status: 'active',
          // workflowStatus: 'APPROVED',
        };
        let entityQueryForCurrentYear: any = {
          organizationId: orgId,
          entityId: { $in: query.entity },
          status: 'active',
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        let entityQueryForSignificantSteps: any = {
          status: 'active',
          entityId: { $in: query.entity },
          preMitigationScore: { $gte: 8 },
        };

        let locationQueryForTotal: any = {
          organizationId: orgId,
          locationId: query?.unit[0],
          status: 'active',
          // workflowStatus: 'APPROVED',
        };
        let locationQueryForCurrentYear: any = {
          organizationId: orgId,
          locationId: query?.unit[0],
          status: 'active',
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        let locationQueryForSignificantSteps: any = {
          status: 'active',
          locationId: query?.unit[0],
          preMitigationScore: { $gte: 8 },
        };

        this.logger.debug(
          `traceId=${traceId} - Built queries for default filter`,
          JSON.stringify({
            entityQueryForTotal,
            entityQueryForCurrentYear,
            entityQueryForSignificantSteps,
            locationQueryForTotal,
            locationQueryForCurrentYear,
            locationQueryForSignificantSteps,
          }),
        );

        const resultsForTotalStepsEntityWise =
          await this.hiraStepsModel.countDocuments({
            ...entityQueryForTotal,
          });
        const resultsForTotalStepsLocationWise =
          await this.hiraStepsModel.count({
            ...locationQueryForTotal,
          });
        const resultsForInWorkflowEntityWise =
          await this.hiraModel.countDocuments({
            ...entityQueryForCurrentYear,
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          });
        const resultsForInWorkflowLocationWise =
          await this.hiraModel.countDocuments({
            ...locationQueryForCurrentYear,
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          });
        const resultsForCurrentYearEntityWise =
          await this.hiraModel.countDocuments({
            ...entityQueryForCurrentYear,
          });
        const resultsForCurrentYearLocationWise =
          await this.hiraModel.countDocuments({
            ...locationQueryForCurrentYear,
          });
        const totalSignificantStepsEntityWise =
          await this.hiraStepsModel.countDocuments({
            ...entityQueryForSignificantSteps,
          });
        const totalSignificantStepsLocationWise =
          await this.hiraStepsModel.countDocuments({
            ...locationQueryForSignificantSteps,
          });

        this.logger.debug(
          `traceId=${traceId} - Retrieved counts for default filter`,
          JSON.stringify({
            resultsForTotalStepsEntityWise,
            resultsForTotalStepsLocationWise,
            resultsForInWorkflowEntityWise,
            resultsForInWorkflowLocationWise,
            resultsForCurrentYearEntityWise,
            resultsForCurrentYearLocationWise,
            totalSignificantStepsEntityWise,
            totalSignificantStepsLocationWise,
          }),
        );

        // console.log("Total HIRA Count Entity Wise:", resultsForTotalHiraEntityWise);
        // console.log("Total HIRA Count Location Wise:", resultsForTotalHiraLocationWise);
        // console.log("In Workflow HIRA Count Entity Wise:", resultsForInWorkflowEntityWise);
        // console.log("In Workflow HIRA Count Location Wise:", resultsForInWorkflowLocationWise);
        // console.log("Current Year HIRA Count Entity Wise:", resultsForCurrentYearEntityWise);
        // console.log("Current Year HIRA Count Location Wise:", resultsForCurrentYearLocationWise);
        // console.log("Total Significant Steps Entity Wise:", totalSignificantStepsEntityWise);
        // console.log("Total Significant Steps Location Wise:", totalSignificantStepsLocationWise);

        const formattedResult = {
          totalStepsEntityWise: resultsForTotalStepsEntityWise,
          totalStepsLocationWise: resultsForTotalStepsLocationWise,
          inWorkflowEntityWise: resultsForInWorkflowEntityWise,
          inWorkflowLocationWise: resultsForInWorkflowLocationWise,
          totalCurrentYearEntityWise: resultsForCurrentYearEntityWise,
          totalCurrentYearLocationWise: resultsForCurrentYearLocationWise,
          totalSignificantStepsEntityWise,
          totalSignificantStepsLocationWise,
        };

        this.logger.debug(
          `traceId=${traceId} - fetchHiraDashboardBoardCounts completed successfully (default filter)`,
          JSON.stringify({ formattedResult }),
        );

        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/fetchHiraDashboardBoardCounts payload query ${query} success`,
          '',
        );
        return formattedResult;
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/fetchOverallStatusCounts payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async fetchHiraCountsByEntityAndSection(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting fetchHiraCountsByEntityAndSection`,
      JSON.stringify({ orgId, query }),
    );

    try {
      // Fetch all records for the given organization
      const records = await this.hiraModel.find({
        organizationId: orgId,
        status: 'active',
      });

      // Group data by entityId
      const entityData = {};
      records.forEach((record) => {
        const entityId = record.entityId;
        if (!entityData[entityId]) {
          entityData[entityId] = {
            total: 0,
            inWorkflow: 0,
            DRAFT: 0,
            APPROVED: 0,
            locationId: record.locationId,
          };
        }

        if (record.status !== 'archived') {
          entityData[entityId].total++;
          if (
            ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'].includes(
              record.workflowStatus,
            )
          ) {
            entityData[entityId].inWorkflow++;
          }
          if (record.workflowStatus === 'DRAFT') {
            entityData[entityId].DRAFT++;
          }
          if (record.workflowStatus === 'APPROVED') {
            entityData[entityId].APPROVED++;
          }
        }
      });

      // Extract unique IDs for further lookups
      const entityIds = Object.keys(entityData);
      const locationIds = Array.from(
        new Set(records.map((r) => r.locationId).filter(Boolean)),
      );
      // Fetch related data from Prisma
      const [entities, locations] = await Promise.all([
        this.prisma.entity.findMany({
          where: { id: { in: entityIds } },
          select: { id: true, entityName: true },
        }),
        this.prisma.location.findMany({
          where: { id: { in: locationIds } },
          select: { id: true, locationName: true },
        }),
      ]);

      // Map related data for easy lookups
      const entityMap = Object.fromEntries(
        entities.map((e) => [e.id, e.entityName]),
      );
      const locationMap = Object.fromEntries(
        locations.map((l) => [l.id, l.locationName]),
      );

      // Format the results
      const mainTableResult = entityIds.map((id) => ({
        entityId: id,
        entityName: entityMap[id] || '',
        locationName: locationMap[entityData[id].locationId] || '',
        ...entityData[id],
      }));

      this.logger.debug(
        `traceId=${traceId} - fetchHiraCountsByEntityAndSection completed successfully`,
        JSON.stringify({ mainTableResultCount: mainTableResult?.length }),
      );

      return { mainTableResult, traceId };
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - GET 'api/risk-register/fetchStatusCountsByEntity payload query ${query} failed with error: ${error}`,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async checkIfUserIsMultiDeptHead(query) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - checkIfUserIsMultiDeptHead started`,
      JSON.stringify({ query }),
    );

    try {
      const { orgId, userId } = query;

      this.logger.debug(
        `traceId=${traceId} - checkIfUserIsMultiDeptHead input validation`,
        JSON.stringify({ orgId, userId }),
      );

      // Fetch all entities where the active user exists in the users array,check if he is dept head in any of the entity
      this.logger.debug(
        `traceId=${traceId} - checkIfUserIsMultiDeptHead executing database query`,
        JSON.stringify({
          organizationId: orgId,
          users: { has: userId },
        }),
      );

      const entities: any = await this.prisma.entity.findMany({
        where: {
          organizationId: orgId,
          users: { has: userId },
        },
        select: {
          entityName: true,
          // entityId: true,
          id: true,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - checkIfUserIsMultiDeptHead database query completed`,
        JSON.stringify({
          entitiesFound: entities?.length || 0,
          entityIds: entities?.map((e) => e.id) || [],
        }),
      );

      if (!entities || entities.length <= 1) {
        this.logger.debug(
          `traceId=${traceId} - checkIfUserIsMultiDeptHead insufficient entities found`,
          JSON.stringify({
            entitiesCount: entities?.length || 0,
            error: `No entities found for user ${userId} as dept head in organization ${orgId}`,
          }),
        );
        throw new NotFoundException(
          `No entities found for user ${userId} as dept head in organization ${orgId}`,
        );
      }

      this.logger.debug(
        `traceId=${traceId} - checkIfUserIsMultiDeptHead completed successfully`,
        JSON.stringify({
          entitiesCount: entities.length,
          entityNames: entities.map((e) => e.entityName),
        }),
      );

      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/checkIfUserIsMultiDeptHead payload query ${query} success`,
        '',
      );
      return entities;
    } catch (err) {
      if (err instanceof NotFoundException) {
        this.logger.debug(
          `traceId=${traceId} - checkIfUserIsMultiDeptHead NotFoundException thrown`,
          JSON.stringify({ error: err.message }),
        );
        throw err; // Rethrow the NotFoundException to be handled by the caller
      }
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/hira-register/checkIfUserIsMultiDeptHead payload query ${query} failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getHiraWithStepsWithFilters(orgId: any, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - getHiraWithStepsWithFilters started`,
      JSON.stringify({ orgId, query }),
    );

    try {
      const {
        hazard,
        condition,
        hiraIds,
        entity,
        unit,
        jobTitle,
        hira,
        entityFilter,
      } = query;

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters input parsing`,
        JSON.stringify({
          hazard,
          condition,
          hiraIds,
          entity,
          unit,
          jobTitle,
          hira,
          entityFilter,
        }),
      );

      let page = query?.page ? parseInt(query.page) : 1;
      let pageSize = query?.pageSize ? parseInt(query.pageSize) : 10;
      let hiraIdInObject = [];
      if (hiraIds?.length) {
        hiraIdInObject = hiraIds.map((id) => new ObjectId(id));
      }

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters pagination setup`,
        JSON.stringify({ page, pageSize, hiraIdInObject }),
      );

      // console.log('QUERY IN ALL HIRA API', query);
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      let whereCondition: any = {
        organizationId: orgId,
        status: 'active',
      };

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters initial where condition`,
        JSON.stringify({ whereCondition }),
      );

      if (!!query?.isPrimaryFilter) {
        this.logger.debug(
          `traceId=${traceId} - getHiraWithStepsWithFilters applying primary filter`,
          JSON.stringify({ isPrimaryFilter: true }),
        );

        whereCondition = {
          ...whereCondition,
        };
        if (!!jobTitle?.length) {
          whereCondition = {
            ...whereCondition,
          };
        }
        if (!!query?.entity?.length) {
          whereCondition = {
            ...whereCondition,
            entityId: { $in: query?.entity },
          };
        }
        if (!!query?.unit?.length) {
          whereCondition = {
            ...whereCondition,
            locationId: { $in: query?.unit },
          };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        this.logger.debug(
          `traceId=${traceId} - getHiraWithStepsWithFilters applying secondary filter`,
          JSON.stringify({ isPrimaryFilter: false }),
        );

        whereCondition = {
          status: 'active',
          organizationId: query?.organizationId,
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }
        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
        // if (query?.significant) {
        //   whereCondition = {
        //     ...whereCondition,
        //     preMitigationScore: { $gte: 8 },
        //   };
        // }
        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          };
        }
      }

      if (!!hazard) {
        // whereCondition.hazardType = hazard;
        whereCondition._id = { $in: hiraIdInObject };
      }
      if (!!condition) {
        whereCondition.condition = condition;
      }
      if (!!hira) {
        whereCondition._id = { $in: hira };
      }
      if (!!entityFilter) {
        whereCondition.entityId = entityFilter;
      }

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters final where condition`,
        JSON.stringify({ whereCondition }),
      );

      const shouldPaginate = query?.pagination !== 'false';

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters building query`,
        JSON.stringify({ shouldPaginate }),
      );

      let hiraQuery = this.hiraModel
        .find({
          ...whereCondition,
        })
        .sort({ createdAt: -1 }); // Sort by createdAt in descending order
      // console.log("hiraQuery", hiraQuery);

      if (shouldPaginate) {
        const skip = (page - 1) * pageSize;
        hiraQuery = hiraQuery.skip(skip).limit(pageSize);

        this.logger.debug(
          `traceId=${traceId} - getHiraWithStepsWithFilters pagination applied`,
          JSON.stringify({ skip, limit: pageSize }),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters executing risk query`,
        JSON.stringify({ whereCondition }),
      );

      const hiraList = await hiraQuery.lean();

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters risk query completed`,
        JSON.stringify({ hiraListCount: hiraList?.length || 0 }),
      );

      const totalHiraCount = await this.hiraModel.countDocuments({
        ...whereCondition,
      });

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters total count query completed`,
        JSON.stringify({ totalHiraCount }),
      );

      let hiraConfig: any = await this.hiraConfigModel
        .findOne({
          riskCategory: 'HIRA',
          deleted: false,
          organizationId: orgId,
        })
        .select('condition riskType')
        .lean();

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters risk config query completed`,
        JSON.stringify({
          hiraConfigFound: !!hiraConfig,
          hasCondition: !!hiraConfig?.condition,
          hasRiskType: !!hiraConfig?.riskType,
        }),
      );

      const userIds: any = new Set();
      const locationIds: any = new Set();
      const entityIds: any = new Set();
      const areaIds: any = new Set();
      const sectionIds: any = new Set();

      hiraList?.forEach((item: any) => {
        item?.createdBy && userIds.add(item?.createdBy);
        item?.locationId && locationIds.add(item?.locationId);
        item?.entityId && entityIds.add(item?.entityId);
        item?.area && areaIds.add(item?.area);
        item?.section && sectionIds.add(item?.section);
        item?.workflow?.forEach((workflow: any) => {
          workflow?.reviewers?.length &&
            workflow?.reviewers.forEach((reviewer: any) =>
              userIds.add(reviewer),
            );
          workflow?.approvers?.length &&
            workflow?.approvers.forEach((approver: any) =>
              userIds.add(approver),
            );
        });
      });

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters extracted IDs for related data`,
        JSON.stringify({
          userIdsCount: userIds.size,
          locationIdsCount: locationIds.size,
          entityIdsCount: entityIds.size,
          areaIdsCount: areaIds.size,
          sectionIdsCount: sectionIds.size,
        }),
      );

      // Fetch related data using Prisma
      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters fetching related data`,
        JSON.stringify({
          userIds: Array.from(userIds),
          locationIds: Array.from(locationIds),
          entityIds: Array.from(entityIds),
          sectionIds: Array.from(sectionIds),
          areaIds: Array.from(areaIds),
        }),
      );

      const [users, locations, entities, sections, areas] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds) } },
          select: { id: true, locationName: true },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: { id: true, entityName: true },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(sectionIds) } },
          select: { id: true, entityName: true },
        }),
        this.hiraAreaMasterModel
          .find({
            id: { $in: Array.from(areaIds) as any },
          })
          .select('id name'),
      ]);

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters related data fetched`,
        JSON.stringify({
          usersCount: users?.length || 0,
          locationsCount: locations?.length || 0,
          entitiesCount: entities?.length || 0,
          sectionsCount: sections?.length || 0,
          areasCount: areas?.length || 0,
        }),
      );

      // Create maps for quick lookup
      const userMap = new Map(users?.map((user) => [user?.id, user]));
      const locationMap = new Map(
        locations?.map((location) => [location?.id, location]),
      );
      const entityMap = new Map(
        entities?.map((entity) => [entity?.id, entity]),
      );
      const sectionMap = new Map(
        sections?.map((section) => [
          section?.id,
          { id: section?.id, name: section?.entityName },
        ]),
      );
      const areaMap = new Map(areas?.map((area) => [area?.id, area]));

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters maps created`,
        JSON.stringify({
          userMapSize: userMap.size,
          locationMapSize: locationMap.size,
          entityMapSize: entityMap.size,
          sectionMapSize: sectionMap.size,
          areaMapSize: areaMap.size,
        }),
      );

      const populatedHiraList = hiraList.map((item: any) => {
        let pendingWith: any = 'N/A';
        const latestWorkflowDetails = item?.workflow?.slice(
          item?.workflow?.length - 1,
        )[0];
        let reviewersDetails = [],
          approversDetails = [],
          approvedDate = '';
        if (latestWorkflowDetails) {
          reviewersDetails = latestWorkflowDetails?.reviewers?.map(
            (reviewerId: any) => userMap.get(reviewerId),
          );
          approversDetails = latestWorkflowDetails?.approvers?.map(
            (approverId: any) => userMap.get(approverId),
          );
          // console.log("item", item);
          // console.log("item?.workflowStatus", item?.workflowStatus);
          // console.log("reviewersDetails", reviewersDetails);
          // console.log("approversDetails", approversDetails);
          // console.log("begfore pending with", pendingWith);

          // console.log("latestWorkflowDetails", latestWorkflowDetails);
          approvedDate = latestWorkflowDetails?.approvedOn;
          if (approvedDate) {
            const dateObj = new Date(approvedDate);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            approvedDate = `${day}-${month}-${year}`;
          } else {
            approvedDate = 'N/A';
          }

          if (
            item?.workflowStatus === 'IN_REVIEW' &&
            reviewersDetails?.length
          ) {
            // console.log("hira in review");

            pendingWith = reviewersDetails
              .filter(Boolean)
              .map((u: any) =>
                `${u?.firstname || ''} ${u?.lastname || ''}`.trim(),
              )
              .join(', ');
          }
          if (
            item?.workflowStatus === 'IN_APPROVAL' &&
            approversDetails?.length
          ) {
            // console.log("hira in approval");
            pendingWith = approversDetails
              .filter(Boolean)
              .map((u: any) =>
                `${u?.firstname || ''} ${u?.lastname || ''}`.trim(),
              )
              .join(', ');
          }
          // console.log("pending with", pendingWith);
        }
        return {
          ...item,
          createdByDetails: userMap.get(item?.createdBy) || '',
          locationDetails: locationMap.get(item?.locationId) || '',
          entityDetails: entityMap.get(item?.entityId) || '',
          areaDetails: areaMap.get(item?.area) || '',
          sectionDetails: sectionMap.get(item?.section) || '',
          riskTypeDetails: hiraConfig?.riskType?.find(
            (riskType: any) => riskType?._id?.toString() === item?.riskType,
          ),
          conditionDetails: hiraConfig?.condition?.find(
            (condition: any) => condition?._id?.toString() === item?.condition,
          ),
          reviewersDetails: reviewersDetails,
          approversDetails: approversDetails,
          latestWorkflowDetails: latestWorkflowDetails,
          pendingWith,
          approvedDate,
        };
      });

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters data population completed`,
        JSON.stringify({
          populatedHiraListCount: populatedHiraList?.length || 0,
        }),
      );

      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getAllHiraTableDataBasedOnFilter payload query ${query} success`,
        '',
      );
      return {
        list: populatedHiraList,
        total: totalHiraCount,
      };

      // console.log('finalList length-->', finalList.length);1

      // return {
      //   data: finalList,
      //   total: uniqueRecords.length,
      // };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getAllHiraTableDataBasedOnFilter payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async changeReviewersApprovers(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - changeReviewersApprovers started`,
      JSON.stringify({ hiraId, body }),
    );

    try {
      // Input validation
      if (!hiraId || !body) {
        this.logger.debug(
          `traceId=${traceId} - changeReviewersApprovers input validation failed`,
          JSON.stringify({
            hiraId: !!hiraId,
            body: !!body,
            error:
              'Invalid input: risk ID, body, or targetCycleNumber is missing',
          }),
        );
        throw new Error(
          'Invalid input: risk ID, body, or targetCycleNumber is missing',
        );
      }
      const { reviewers, approvers, updatedBy } = body;

      this.logger.debug(
        `traceId=${traceId} - changeReviewersApprovers input parsing`,
        JSON.stringify({
          reviewersCount: reviewers?.length || 0,
          approversCount: approvers?.length || 0,
          updatedBy,
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - changeReviewersApprovers fetching existing HIRA`,
        JSON.stringify({ hiraId }),
      );

      const existingHira = await this.hiraModel
        .findOne({
          _id: hiraId,
        })
        .select('currentVersion');
      const targetCycleNumber = existingHira.currentVersion + 1;

      this.logger.debug(
        `traceId=${traceId} - changeReviewersApprovers existing risk fetched`,
        JSON.stringify({
          currentVersion: existingHira?.currentVersion,
          targetCycleNumber,
        }),
      );

      // Validate required fields
      if (!reviewers?.length || !approvers?.length || !updatedBy) {
        this.logger.debug(
          `traceId=${traceId} - changeReviewersApprovers validation failed`,
          JSON.stringify({
            hasReviewers: !!reviewers?.length,
            hasApprovers: !!approvers?.length,
            hasUpdatedBy: !!updatedBy,
            error:
              'Missing required fields: reviewers, approvers, or updatedBy',
          }),
        );
        throw new Error(
          'Missing required fields: reviewers, approvers, or updatedBy',
        );
      }

      this.logger.debug(
        `traceId=${traceId} - changeReviewersApprovers executing database update`,
        JSON.stringify({
          hiraId,
          targetCycleNumber,
          reviewersIds: reviewers.map((item: any) => item.id),
          approversIds: approvers.map((item: any) => item.id),
          updatedBy,
        }),
      );

      // Update reviewers and approvers for the specific workflow cycle
      const updatedResult = await this.hiraModel.findOneAndUpdate(
        { _id: hiraId, 'workflow.cycleNumber': targetCycleNumber },
        {
          $set: {
            'workflow.$.reviewers': reviewers.map((item: any) => item.id),
            'workflow.$.approvers': approvers.map((item: any) => item.id),
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Reviewers and Approvers Changed By IMSC',
              by: updatedBy,
              datetime: new Date(),
            },
          },
        },
        { new: true }, // Return the updated document
      );

      this.logger.debug(
        `traceId=${traceId} - changeReviewersApprovers database update completed`,
        JSON.stringify({
          updateSuccessful: !!updatedResult,
          updatedResultId: updatedResult?._id,
        }),
      );

      // Check if the update was successful
      if (!updatedResult) {
        this.logger.debug(
          `traceId=${traceId} - changeReviewersApprovers update failed`,
          JSON.stringify({
            targetCycleNumber,
            hiraId,
            error: `Failed to update reviewers and approvers for cycle number ${targetCycleNumber} in HIRA ID ${hiraId}`,
          }),
        );
        throw new Error(
          `Failed to update reviewers and approvers for cycle number ${targetCycleNumber} in HIRA ID ${hiraId}`,
        );
      }

      this.logger.debug(
        `traceId=${traceId} - changeReviewersApprovers completed successfully`,
        JSON.stringify({
          hiraId,
          targetCycleNumber,
          reviewersCount: reviewers.length,
          approversCount: approvers.length,
        }),
      );

      return updatedResult;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - changeReviewersApprovers failed with error`,
        JSON.stringify({
          hiraId,
          error: error.message,
          stack: error.stack,
        }),
      );
      console.error('Error in changeReviewersApprovers:', error);
      throw new Error(
        `Unable to replace reviewers and approvers: ${error.message}`,
      );
    }
  }

  async changeApprovers(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - changeApprovers started`,
      JSON.stringify({ hiraId, body }),
    );

    try {
      // Input validation
      if (!hiraId || !body) {
        this.logger.debug(
          `traceId=${traceId} - changeApprovers input validation failed`,
          JSON.stringify({
            hiraId: !!hiraId,
            body: !!body,
            error:
              'Invalid input: risk ID, body, or targetCycleNumber is missing',
          }),
        );
        throw new Error(
          'Invalid input: HIRA ID, body, or targetCycleNumber is missing',
        );
      }
      const { approvers, updatedBy } = body;

      this.logger.debug(
        `traceId=${traceId} - changeApprovers input parsing`,
        JSON.stringify({
          approversCount: approvers?.length || 0,
          updatedBy,
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - changeApprovers fetching existing risk`,
        JSON.stringify({ hiraId }),
      );

      const existingHira = await this.hiraModel
        .findOne({
          _id: hiraId,
        })
        .select('currentVersion');
      const targetCycleNumber = existingHira.currentVersion + 1;

      this.logger.debug(
        `traceId=${traceId} - changeApprovers existing risk fetched`,
        JSON.stringify({
          currentVersion: existingHira?.currentVersion,
          targetCycleNumber,
        }),
      );

      // Validate required fields
      if (!approvers?.length || !updatedBy) {
        this.logger.debug(
          `traceId=${traceId} - changeApprovers validation failed`,
          JSON.stringify({
            hasApprovers: !!approvers?.length,
            hasUpdatedBy: !!updatedBy,
            error: 'Missing required fields: approvers, or updatedBy',
          }),
        );
        throw new Error('Missing required fields:  approvers, or updatedBy');
      }

      this.logger.debug(
        `traceId=${traceId} - changeApprovers executing database update`,
        JSON.stringify({
          hiraId,
          targetCycleNumber,
          approversIds: approvers.map((item: any) => item.id),
          updatedBy,
        }),
      );

      // Update reviewers and approvers for the specific workflow cycle
      const updatedResult = await this.hiraModel.findOneAndUpdate(
        { _id: hiraId, 'workflow.cycleNumber': targetCycleNumber },
        {
          $set: {
            'workflow.$.approvers': approvers.map((item: any) => item.id),
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Approvers Changed By IMSC',
              by: updatedBy,
              datetime: new Date(),
            },
          },
        },
        { new: true }, // Return the updated document
      );

      this.logger.debug(
        `traceId=${traceId} - changeApprovers database update completed`,
        JSON.stringify({
          updateSuccessful: !!updatedResult,
          updatedResultId: updatedResult?._id,
        }),
      );

      // Check if the update was successful
      if (!updatedResult) {
        this.logger.debug(
          `traceId=${traceId} - changeApprovers update failed`,
          JSON.stringify({
            targetCycleNumber,
            hiraId,
            error: `Failed to update approvers for cycle number ${targetCycleNumber} in HIRA ID ${hiraId}`,
          }),
        );
        throw new Error(
          `Failed to update approvers for cycle number ${targetCycleNumber} in HIRA ID ${hiraId}`,
        );
      }

      this.logger.debug(
        `traceId=${traceId} - changeApprovers completed successfully`,
        JSON.stringify({
          hiraId,
          targetCycleNumber,
          approversCount: approvers.length,
        }),
      );

      return updatedResult;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - changeApprovers failed with error`,
        JSON.stringify({
          hiraId,
          error: error.message,
          stack: error.stack,
        }),
      );
      console.error('Error in changeApprovers:', error);
      throw new Error(
        `Unable to replace reviewers and approvers: ${error.message}`,
      );
    }
  }
}
