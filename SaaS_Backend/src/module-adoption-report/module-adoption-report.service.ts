import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { moduleAdoptionReport } from './schema/module-adoption-report.schema';
import { objectiveMaster } from 'src/objective/schema/objectiveMaster.schema';
import {
  kpiReportInstance,
  kpiReportInstanceDocument,
} from 'src/kpi-report/schema/kpi-report-instance.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';
import { Hira } from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { AuditPlan } from 'src/audit-plan/schema/auditPlan.schema';
import { AuditPlanEntityWise } from 'src/audit-plan/schema/auditplanentitywise.schema';
import { AuditSchedule } from 'src/audit-schedule/schema/auditSchedule.schema';
import { AuditScheduleEntityWise } from 'src/audit-schedule/schema/auditScheduleEntityWise.schema';
import { Audit } from 'src/audit/schema/audit.schema';
import { Nonconformance } from 'src/audit/schema/nonconformance.schema';
import { CIP } from 'src/cip/schema/cip.schema';
import { cara } from 'src/cara/schema/cara.schema';
import { MRM } from 'src/mrm/schema/mrm.schema';
import { ScheduleMRM } from 'src/mrm/schema/scheduleMrm.schema';
import { Meeting } from 'src/mrm/schema/meeting.schema';

@Injectable()
export class moduleAdoptionReportService {
  constructor(
    @InjectModel(moduleAdoptionReport.name)
    private moduleAdoptionReportModel: Model<moduleAdoptionReport>,
    @InjectModel(Hira.name)
    private hiraModel: Model<Hira>,
    @InjectModel(objectiveMaster.name)
    private objectiveMaster: Model<objectiveMaster>,
    @InjectModel(kpiReportInstance.name)
    private readonly kpiReportInstanceModel: Model<kpiReportInstanceDocument>,
    @InjectModel(AuditPlan.name) private auditPlan: Model<AuditPlan>,
    @InjectModel(AuditPlanEntityWise.name)
    private auditPlanEntityWise: Model<AuditPlanEntityWise>,
    @InjectModel(AuditSchedule.name)
    private auditSchedule: Model<AuditSchedule>,
    @InjectModel(AuditScheduleEntityWise.name)
    private auditScheduleEntityWise: Model<AuditScheduleEntityWise>,
    @InjectModel(Audit.name) private audit: Model<Audit>,
    @InjectModel(Nonconformance.name)
    private nonconformance: Model<Nonconformance>,
    @InjectModel(CIP.name) private cip: Model<CIP>,
    @InjectModel(cara.name) private cara: Model<cara>,
    @InjectModel(MRM.name) private mrm: Model<MRM>,
    @InjectModel(ScheduleMRM.name) private scheduleMRM: Model<ScheduleMRM>,
    @InjectModel(Meeting.name) private meeting: Model<Meeting>,
    private prisma: PrismaService,
  ) {}

  async startCron() {
    const getAllOrganization = await this.prisma.organization.findMany();
    for (const org of getAllOrganization) {
      await this.createAllModuleAdoptionReport('', org.id);
    }
  }

  async createModuleAdoptionReport(data) {
    try {
      await this.moduleAdoptionReportModel.create(data);
    } catch {}
  }

  async createAllModuleAdoptionReport(req, cron) {
    try {
      let activeUser;
      let previousData;
      if (req) {
        activeUser = await this.prisma.user.findFirst({
          where: {
            kcId: req.user.id,
          },
        });
        // activeUser = {
        //   organizationId: 'clsa0oi82000jklfogtz3et9o',
        //   kcId: '26c12d0b-af2a-4eea-9051-4f77f46b7c62',
        // };
        previousData = await this.getModuleAdoptionReport(
          { date: 'Today' },
          req,
          '',
        );
      } else {
        activeUser = {
          organizationId: cron,
        };
        previousData = await this.getModuleAdoptionReport(
          { date: 'Today' },
          '',
          cron,
        );
      }

      const allLocation = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
          deleted: false,
        },
      });

      for (const location of allLocation) {
        let spoc = '';
        let docEstimateTotal = 0;
        let hiraEstimateTotal = 0;
        if (previousData) {
          const getLocationReport = previousData.find(
            (item: any) => item.locationId === location.id,
          );
          spoc = getLocationReport?.spoc;
          docEstimateTotal = getLocationReport?.documents?.estimatedTotal;
          hiraEstimateTotal = getLocationReport?.hira?.estimatedTotal;
        }
        // Get Document Count
        const getDocuments = await this.prisma.documents.groupBy({
          by: ['doctypeId'],
          where: {
            organizationId: activeUser.organizationId,
            locationId: location.id,
            documentState: {
              not: 'OBSOLETE',
            },
          },
          _count: {
            doctypeId: true,
          },
        });

        const totalDocuments = getDocuments.map((doc) => ({
          docTypeId: doc.doctypeId,
          count: doc._count.doctypeId,
        }));

        // Get Hira Count
        let hiraQuery = {
          organizationId: activeUser.organizationId,
          locationId: location.id,
          status: 'active',
        };

        const totalHira = await this.hiraModel.countDocuments(hiraQuery);
        let riskQuery: any = {
          organizationId: activeUser.organizationId,
          locationId: location.id,
          status: { $in: ['inWorkflow', 'active'] },
        };

        //Get Objectives
        const totalDepartments = await this.prisma.entity.count({
          where: {
            organizationId: activeUser.organizationId,
            locationId: location.id,
            deleted: false,
          },
        });

        const totalObjectives = await this.objectiveMaster.countDocuments({
          OrganizationId: activeUser.organizationId,
          locationId: location.id,
        });

        const uniqueScopeCount = await this.objectiveMaster.aggregate([
          {
            $match: {
              OrganizationId: activeUser.organizationId,
              locationId: location.id,
              ScopeType: 'Department', // Filter by ScopeType if needed
            },
          },
          {
            $group: {
              _id: '$Scope', // Group by the Scope field to get unique Scope values
            },
          },
          {
            $count: 'totalUniqueScopes', // Count the number of unique Scope values
          },
        ]);

        const noOfDeptWithObjective =
          uniqueScopeCount[0]?.totalUniqueScopes || 0;

        //Get KPIs
        const totalKpis = await this.kpiReportInstanceModel.countDocuments({
          organization: activeUser.organizationId,
          location: location.id,
        });

        //Get Audit Count
        const auditPlans = await this.auditPlan
          .find({
            organizationId: activeUser.organizationId,
            location: location.id,
          })
          .select('_id');

        const auditPlanIds = auditPlans.map((plan) => plan._id);

        const auditPlanEntityWise = await this.auditPlanEntityWise
          .find({
            auditPlanId: { $in: auditPlanIds },
          })
          .select('auditschedule');

        let totalAuditPlans = 0;
        auditPlanEntityWise.forEach((entity) => {
          if (Array.isArray(entity.auditschedule)) {
            totalAuditPlans += entity.auditschedule.filter(
              (schedule) => schedule === true,
            ).length;
          }
        });

        const auditSchedules = await this.auditSchedule.find({
          organizationId: activeUser.organizationId,
          locationId: location.id,
        }).select('_id');

        const auditScheduleIds = auditSchedules.map((plan) => plan._id);

        const totalAuditSchedules = await this.auditScheduleEntityWise
          .countDocuments({
            auditScheduleId: { $in: auditScheduleIds },
          })

        const totalAuditReports = await this.audit.countDocuments({
          organization: activeUser.organizationId,
          location: location.id,
        });

        const totalAuditFindings = await this.nonconformance.countDocuments({
          organization: activeUser.organizationId,
          location: location.id,
        });
        //Get CIP Count
        const totalCip = await this.cip.countDocuments({
          organizationId: activeUser.organizationId,
          'location.id': location.id,
        });
        //Get CAPA Count
        const totalCapa = await this.cara.countDocuments({
          organizationId: activeUser.organizationId,
          locationId: location.id,
        });
        //Get MRM Count
        const totalMrmPlan = await this.mrm.countDocuments({
          organizationId: activeUser.organizationId,
          unitId: location.id,
        });

        const totalMrmSchedule = await this.scheduleMRM.countDocuments({
          organizationId: activeUser.organizationId,
          unitId: location.id,
        });

        const totalMom = await this.meeting.countDocuments({
          organizationId: activeUser.organizationId,
          locationId: location.id,
        });

        const report = {
          organizationId: activeUser.organizationId,
          locationId: location.id,
          spoc: spoc,
          documents: {
            estimatedTotal: docEstimateTotal,
            currentTotal: totalDocuments,
          },
          hira: {
            estimatedTotal: hiraEstimateTotal,
            currentTotal: totalHira,
          },
          objAndKpi: {
            totalDepartments: totalDepartments,
            noOfDeptWithObjective: noOfDeptWithObjective,
            totalObjectives: totalObjectives,
            totalKpis: totalKpis,
          },
          audit: {
            totalAuditPlans: totalAuditPlans,
            totalAuditSchedules: totalAuditSchedules,
            totalAuditReports: totalAuditReports,
            totalAuditFindings: totalAuditFindings,
          },
          cip: {
            totalCip: totalCip,
          },
          capa: {
            totalCapa: totalCapa,
          },
          mrm: {
            totalMrmPlans: totalMrmPlan,
            totalMrmSchedule: totalMrmSchedule,
            totalMom: totalMom,
          },
        };

        await this.createModuleAdoptionReport(report);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getModuleAdoptionReport(query, req, cron) {
    try {
      let activeUser;
      const { date, business, units } = query;
      const selectedDate = await this.getDateRange(date ? date : 'Today');
      if (req) {
        activeUser = await this.prisma.user.findFirst({
          where: {
            kcId: req.user.id,
          },
        });
      } else {
        activeUser = {
          organizationId: cron,
        };
      }

      let matchQuery: any = {
        organizationId: activeUser.organizationId,
      };

      if (date !== 'Today') {
        matchQuery.createdAt = {
          $gte: selectedDate[0],
          $lte: selectedDate[1],
        };
      }

      if (business && units) {
        const selectedBusinesses = business.split(',').map((b) => b.trim());
        const selectedUnits = units.split(',').map((b) => b.trim());
        if (!selectedBusinesses.includes('All')) {
          if (!selectedUnits.includes('All')) {
            matchQuery = {
              ...matchQuery,
              locationId: { $in: selectedUnits },
            };
          } else {
            const allUnits = await this.prisma.location.findMany({
              where: {
                organizationId: activeUser.organizationId,
                businessTypeId: {
                  in: selectedBusinesses,
                },
                deleted: false,
              },
            });
            matchQuery = {
              ...matchQuery,
              locationId: { $in: allUnits.map((item) => item.id) },
            };
          }
        } else {
          if (!selectedUnits.includes('All')) {
            matchQuery = {
              ...matchQuery,
              locationId: { $in: selectedUnits },
            };
          }
        }
      }

      const result = await this.moduleAdoptionReportModel.aggregate([
        {
          $match: matchQuery,
        },
        {
          $sort: {
            createdAt: -1, // Sort by createdAt in descending order (most recent first)
          },
        },
        {
          $group: {
            _id: '$locationId', // Group by locationId
            mostRecentEntry: { $first: '$$ROOT' }, // Get the most recent entry for each locationId
          },
        },
      ]);

      // Extract the documents from the result
      const uniqueLocationResults = result.map(
        (group) => group.mostRecentEntry,
      );

      const updatedDocumentsData = await Promise.all(
        uniqueLocationResults.map(async (document: any) => {
          if (!document.locationId || !document.organizationId) {
            return;
          }
          // Get Location Name
          const location = await this.prisma.location.findUnique({
            where: {
              id: document.locationId,
              deleted: false,
            },
          });

          if (!location) {
            return;
          }

          // Get IMSC
          const roles = await this.prisma.role.findFirst({
            where: {
              organizationId: document.organizationId,
              roleName: 'MR',
            },
          });
          const imsc = await this.prisma.user.findFirst({
            where: {
              organizationId: document.organizationId,
              locationId: document.locationId,
              roleId: {
                has: roles.id,
              },
            },
          });

          //Get Total no of users
          const totalUsers = await this.prisma.user.count({
            where: {
              organizationId: document.organizationId,
              locationId: document.locationId,
              deleted: false,
            },
          });

          // Get Document Type Name and Total Upload for documents
          const currentTotalWithDocTypeName = await Promise.all(
            document.documents.currentTotal.map(async (doc: any) => {
              if (doc.docTypeId) {
                const docType = await this.prisma.doctype.findFirst({
                  where: {
                    id: doc.docTypeId,
                  },
                });
                return {
                  ...doc,
                  docTypeName: docType?.documentTypeName,
                };
              }
            }),
          );

          const currentTotalUploaded = currentTotalWithDocTypeName.reduce(
            (sum: number, doc: any) => sum + doc?.count,
            0,
          );

          const totalUploadedDocuments =
            document.documents.estimatedTotal > 0
              ? (
                  (currentTotalUploaded / document.documents.estimatedTotal) *
                  100
                ).toFixed(2)
              : 0;

          // Get Total Upload for HIRA
          const totalUploadedHira =
            document.hira.estimatedTotal > 0
              ? (
                  (document.hira.currentTotal / document.hira.estimatedTotal) *
                  100
                ).toFixed(2)
              : 0;



          // Get Total Upload for Objective
          const totalUploadedObjective = (
            (document.objAndKpi.noOfDeptWithObjective /
              document.objAndKpi.totalDepartments) *
            100
          ).toFixed(2);

          return {
            ...document._doc,
            locationId: location?.id,
            locationName: location?.locationName,
            spoc: document?.spoc,
            imsc: imsc?.firstname
              ? imsc?.firstname
              : '' + ' ' + imsc?.lastname
              ? imsc?.lastname
              : '',
            totalUsers: totalUsers,
            documents: {
              ...document.documents,
              currentTotal: currentTotalWithDocTypeName,
              currentTotalUploaded: currentTotalUploaded,
              totalUploaded: totalUploadedDocuments,
              score: await this.getScore(totalUploadedDocuments),
            },
            hira: {
              ...document.hira,
              totalUploaded: totalUploadedHira,
              score: await this.getScore(totalUploadedHira),
            },
            objAndKpi: {
              ...document.objAndKpi,
              totalUploaded: totalUploadedObjective,
              score: await this.getScore(totalUploadedObjective),
            },
            audit: {
              ...document.audit,
            },
            cip: {
              ...document.cip,
            },
            capa: {
              ...document.capa,
            },
            mrm: {
              ...document.mrm,
            },
          };
        }),
      );

      const sortedDocumentsData = updatedDocumentsData.sort((a, b) => {
        if (a.locationName < b.locationName) {
          return -1;
        }
        if (a.locationName > b.locationName) {
          return 1;
        }
        return 0;
      });

      const filteredData = sortedDocumentsData.filter(
        (item: any) => item?.locationName && item?.locationName !== '',
      );
      return filteredData;
    } catch (error) {
      console.error(error);
    }
  }

  async getDateRange(date: string) {
    let startDate: Date, endDate: Date;

    if (date === 'Today') {
      const now = new Date();
      startDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      ); // Start of today in UTC
      endDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      ); // End of today in UTC
    } else {
      // Parse the provided date string (e.g., '08-10-2024')
      const [day, month, year] = date.split('-').map(Number);
      startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)); // Start of the provided date in UTC
      endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)); // End of the provided date in UTC
    }

    // Return startDate and endDate as Date objects in UTC
    return [startDate, endDate];
  }

  async getScore(total) {
    if (total > 0 && total <= 20) {
      return 1;
    } else if (total > 20 && total <= 40) {
      return 2;
    } else if (total > 40 && total <= 60) {
      return 3;
    } else if (total > 60 && total <= 80) {
      return 4;
    } else if (total > 80) {
      return 5;
    } else {
      return 0;
    }
  }

  async getAllBusinessTypes(req) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: req.user.id,
      },
    });

    const allBusinessTypes = await this.prisma.businessType.findMany({
      where: {
        organizationId: activeUser.organizationId,
        deleted: false,
      },
    });

    return allBusinessTypes;
  }

  async getAllLocations(req) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: req.user.id,
      },
    });

    const allLocation = await this.prisma.location.findMany({
      where: {
        organizationId: activeUser.organizationId,
        deleted: false,
      },
    });

    return allLocation;
  }

  async getLocationsByBusinessType(req, query) {
    const { businessType } = query;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: req.user.id,
      },
    });
    const selectedBusinessTypes = businessType
      .split(',')
      .map((item: any) => item.trim());
    let result;
    if (!selectedBusinessTypes.includes('All')) {
      result = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
          businessTypeId: {
            in: selectedBusinessTypes,
          },
          deleted: false,
        },
      });
    } else {
      result = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
          deleted: false,
        },
      });
    }

    return result;
  }
}
