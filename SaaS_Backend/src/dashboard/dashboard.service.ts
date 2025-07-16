import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DashboardFilter } from './dto/dashboard-filter.dto';
import { IRelationMap, makeFilters } from '../utils/makeFilter.helper';
import { FavoritesService } from 'src/favorites/favorites.service';
import {
  IChartInputDataType,
  QueryFilterPreprocessing,
  TransformToChartData,
} from './utils/dashboard.utils';
import { ChartFilter } from './dto/dashboard-chart-filter.dto';
import { DocumentsService } from 'src/documents/documents.service';
import { Audit, AuditDocument } from 'src/audit/schema/audit.schema';
import {
  Nonconformance,
  NonconformanceDocument,
} from 'src/audit/schema/nonconformance.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { filterGenerator } from '../audit/helpers/mongoFilter.helper';
import { OrganizationService } from 'src/organization/organization.service';
import { UserService } from 'src/user/user.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { LocationService } from 'src/location/location.service';
import { Types } from 'mongoose';
import { getNcCount } from 'src/audit/helpers/NcCounter.helper';
import { SystemsService } from 'src/systems/systems.service';
import { EntityService } from 'src/entity/entity.service';
import { AuditService } from 'src/audit/audit.service';
import { MongoClient, MongoClientOptions, ObjectId } from 'mongodb';

import { DocumentChartFilter } from './dto/chart-filter.dto';

import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
import { Documents } from 'src/documents/schema/document.schema';
import { Doctype } from 'src/doctype/schema/doctype.schema';
import { DocUtils } from 'src/documents/doc_utils';
function getRelationshipMap(valueObj: { [key: string]: any }): IRelationMap {
  const relationMap: IRelationMap = {
    locationName: {
      relationship: ['doctype', 'location'],
      actions: {
        contains: valueObj.locationName ?? '',
        mode: 'insensitive',
      },
    },
    readAccess: {
      relationship: ['doctype'],
      actions: {
        contains: valueObj.readAccess ?? '',
        mode: 'insensitive',
      },
    },
    documentTypeName: {
      relationship: ['doctype'],
      actions: {
        contains: valueObj.documentTypeName ?? '',
        mode: 'insensitive',
      },
    },
    entityName: {
      relationship: ['creatorEntity'],
      actions: {
        contains: valueObj.entityName ?? '',
        mode: 'insensitive',
      },
    },
    documentName: {
      relationship: [],
      actions: {
        contains: valueObj.documentName ?? '',
      },
    },
    // documentState: {
    //   relationship: [],
    //   actions: {
    //     equals: valueObj.documentState ?? '',
    //     mode: 'insensitive',
    //   },
    // },
    currentVersion: {
      relationship: [],
      actions: {
        equals: valueObj.currentVersion ?? '',
        mode: 'insensitive',
      },
    },
    tags: {
      relationship: [],
      actions: {
        hasEvery: [valueObj.tags ?? ''],
      },
    },
    createdAt: {
      relationship: [],
      actions: {
        lte: valueObj.createdAt ? valueObj.createdAt[1] : '',
        gte: valueObj.createdAt ? valueObj.createdAt[0] : '',
      },
    },
    createdBy: {
      relationship: [],
      actions: {
        contains: valueObj.createdBy ?? '',
        mode: 'insensitive',
      },
    },
  };
  if (valueObj.documentState) {
    relationMap.documentState = {
      relationship: [],
      actions: {
        in: valueObj.documentState ?? [],
        mode: 'insensitive',
      },
    };
  }
  return relationMap;
}
function getChartQuery(
  field: string,
  value?: {
    organizationId: string;
    location?: string;
    department?: string;
    creator?: string;
    documentStartDate?: string;
    documentEndDate?: string;
  },
): string {
  let query = ``;
  delete value['filterField'];
  let where = `where ${
    field === 'documentState' ? 't' : 'd2'
  }."organizationId" = '${value.organizationId}' `;
  delete value['organizationId'];
  Object.entries(value).forEach(([key, value]) => {
    // if (key === 'location') {
    //   where += `and `;
    //   where += `lower(${
    //     field === 'documentState' ? 't' : 'l'
    //   }."locationName") similar to '%${value
    //     .toLowerCase()
    //     .split(' ')
    //     .join('%')}%' `;
    // }
    if (key === 'department') {
      where += `and `;
      where += `lower(${
        field === 'documentState' ? 't' : 'e'
      }."entityName") similar to '%${value
        .toLowerCase()
        .split(' ')
        .join('%')}%' `;
    }
    if (key === 'creator') {
      where += `and `;
      where += `lower(${
        field === 'documentState' ? 't' : 'd'
      }."createdBy") similar to '%${value
        .toLowerCase()
        .split(' ')
        .join('%')}%' `;
    }
    if (key === 'documentStartDate') {
      where += `and `;
      where += `${
        field === 'documentState' ? 't' : 'd2'
      }."createdAt" >= '${value}'::date `;
    }
    if (key === 'documentEndDate') {
      where += `and `;
      where += `${
        field === 'documentState' ? 't' : 'd2'
      }."createdAt" <= '${value}'::date `;
    }
  });

  switch (field) {
    case 'documentType':
      query = `
        SELECT
          d2."documentTypeName" as "documentType",
          COUNT(*) AS count
        FROM
          "Documents" d
        LEFT JOIN
          "Doctype" d2
        ON
          d."doctypeId" = d2.id
        
        LEFT JOIN
          "Entity" e 
        ON
          d."entityId" = e."id" 
        ${where.length > 0 ? `${where}` : ''}
        GROUP BY
          d2."documentTypeName"
        ORDER BY d2."documentTypeName"
      `;
      return query;
    case 'readAccess':
      where += `AND LOWER(d2."readAccess") in ('organization', 'creator''s location', 'restricted access', 'creator''s entity') `;
      query = `
        SELECT
          d2."readAccess",
          COUNT(*) AS count
        FROM
          "Documents" d
        LEFT JOIN
          "Doctype" d2
        ON
          d."doctypeId" = d2.id
        
        LEFT JOIN
          "Entity" e 
        ON
          d."entityId" = e."id" 
        ${where.length > 0 ? `${where}` : ''}
        GROUP BY
         d2."readAccess"
        ORDER BY d2."readAccess";
        `;
      return query;
    case 'tags':
      query = `
      SELECT
        d.count,
        d.tags
      FROM
      (
        SELECT
        COUNT(*) as count,
          tag as "tags",
          d."doctypeId",
          d."entityId",
          d."createdBy" 
        FROM "Documents" d , UNNEST(d.tags) tag
        GROUP BY tag, d."doctypeId", d."entityId" , d."createdBy" 
      ) d
      LEFT JOIN
        "Doctype" d2
      ON
        d."doctypeId" = d2.id
      
      LEFT JOIN
        "Entity" e 
      ON
        d."entityId" = e."id" 
      ${where.length > 0 ? `${where}` : ''}
      ORDER BY count DESC
      limit 10;
    `;
      return query;
    case 'documentState':
      query = `
        SELECT 
          t."documentState", 
          t."count" 
        FROM (
          (
            SELECT
              d."documentState",
              d2."organizationId",
              e."entityName",
              d."createdAt",
              d."createdBy",
              COUNT(*) AS count
            FROM
              "Documents" d
            LEFT JOIN
              "Doctype" d2
            ON
              d."doctypeId" = d2.id
        
            LEFT JOIN
              "Entity" e 
            ON
              d."entityId" = e."id" 
            GROUP by
              d."documentState",
              d2."organizationId",
              e."entityName",
              d."createdAt",
              d."createdBy"
            ORDER BY d."documentState"
          )
        UNION 
          (
            SELECT
              'OBSOLETE' as documentState,
              d2."organizationId",
              e."entityName",
              d."createdAt",
              d."createdBy",
              COUNT(*) as count
            FROM "DocumentVersions" dv 
            left JOIN
              "Documents" d 
            ON 
              d.id = dv."documentId" 
            LEFT JOIN
              "Doctype" d2
            ON
              d."doctypeId" = d2.id
            
            LEFT JOIN
              "Entity" e 
            ON
              d."entityId" = e."id" 
            GROUP BY 
            d2."organizationId" ,
            e."entityName",
            d."createdAt",
            d."createdBy"
          )
        ) t
        ${where.length > 0 ? `${where}` : ''}
      `;
      return query;
    default:
      query = `
        SELECT "${field}" as "${field}",
        COUNT(*) as count
        FROM "Documents" 
        GROUP BY "${field}"
        ORDER BY "${field}"`;
      return query;
  }
}

function getTableQuery(
  filter: DashboardFilter & { organizationId: string },
  flag: boolean,
  entityDataIds: any,
) {
  const aggregationPipeline: any[] = [];
  // console.log('filter in getTableQuery', filter);
  // Initial match stage
  const matchStage = {
    $match: {
      organizationId: filter.organizationId,
      documentState: 'PUBLISHED',
    },
  };
  aggregationPipeline.push(matchStage);

  // Dynamic match stages

  Object.entries(filter).forEach(([key, value]) => {
    if (typeof value === 'string') {
      value = value.replace("'", "''");
    }
    switch (key) {
      case 'documentId':
        if (value !== undefined) {
          aggregationPipeline.push({ $match: { id: value } });
        }
        break;
      case 'documentIds':
        if (value !== 'undefined' && value !== null) {
          aggregationPipeline.push({ $match: { documentId: value } });
        }
        break;
      case 'locationId':
        if (value !== 'undefined' && value !== 'All') {
          aggregationPipeline.push({ $match: { locationId: value } });
        }
        break;
      case 'locationIds':
        if (value !== 'undefined' && value !== 'All') {
          aggregationPipeline.push({ $match: { locationId: { $in: value } } });
        }
        break;
      case 'documentTag':
        if (value !== undefined) {
          aggregationPipeline.push({ $match: { tags: value } });
        }
        break;
      case 'readAccess':
        if (value !== 'undefined') {
          aggregationPipeline.push({
            $match: {
              readAccess: { $regex: new RegExp(value as string, 'i') },
            },
          });
        }
        break;
      case 'documentType':
        if (value !== 'undefined') {
          aggregationPipeline.push({ $match: { docType: value } });
        }
        break;
      case 'documentTypes':
        if (value !== undefined) {
          aggregationPipeline.push({
            $match: { docType: { $in: value as string[] } },
          });
        }
        break;
      case 'section':
        if (value !== undefined) {
          aggregationPipeline.push({
            $match: { section: { $in: value as string[] } },
          });
        }
        break;
      case 'department':
        if (
          value !== 'undefined' &&
          value !== undefined &&
          value !== '' &&
          value !== 'All'
          // &&
          // filter?.dept === null
        ) {
          aggregationPipeline.push({ $match: { entityId: value } });
        }
        break;
      case 'dept':
        if (value !== 'undefined') {
          aggregationPipeline.push({ $match: { entityId: { $in: value } } });
        }
        break;
      case 'documentVersion':
        if (value !== undefined) {
          aggregationPipeline.push({
            $match: { version: { $regex: new RegExp(value as string, 'i') } },
          });
        }
        break;
      case 'documentStatus':
        if (
          value !== undefined &&
          typeof value === 'string' &&
          !value.includes('undefined')
        ) {
          aggregationPipeline.push({
            $match: {
              documentState: { $regex: new RegExp(`^${value}$`, 'i') },
            },
          });
        } else if (
          Array.isArray(value) &&
          value.every((v) => v !== 'undefined')
        ) {
          aggregationPipeline.push({
            $match: { documentState: { $in: value } },
          });
        }
        break;
      case 'system':
        if (
          value !== undefined &&
          typeof value === 'string' &&
          !value.includes('undefined')
        ) {
          aggregationPipeline.push({
            $match: { system: { $regex: new RegExp(`^${value}$`, 'i') } },
          });
        } else if (
          Array.isArray(value) &&
          value.every((v) => v !== 'undefined')
        ) {
          aggregationPipeline.push({ $match: { system: { $in: value } } });
        }
        break;
      case 'documentStartDate':
        if (value !== 'Invalid Date') {
          aggregationPipeline.push({
            $match: { approvedDate: { $gte: new Date(value as string) } },
          });
        }
        break;
      case 'documentEndDate':
        if (value !== 'Invalid Date') {
          aggregationPipeline.push({
            $match: { approvedDate: { $lte: new Date(value as string) } },
          });
        }
        break;
      case 'creator':
        if (value !== 'undefined') {
          aggregationPipeline.push({
            $match: { createdBy: { $regex: new RegExp(value as string, 'i') } },
          });
        }
        break;
      case 'departments':
        if (value !== 'undefined' && value?.length) {
          aggregationPipeline.push({ $match: { entityId: { $in: value } } });
        }
        break;
      default:
        break;
    }
  });

  // $or condition for searchQuery
  if (filter.searchQuery !== 'undefined' && filter.searchQuery !== undefined) {
    const searchQuery = (filter.searchQuery as string)
      .replace("'", "''")
      .toLowerCase();
    const orCondition = [
      { id: searchQuery },
      { tags: searchQuery },
      { readAccess: { $regex: new RegExp(searchQuery, 'i') } },
      { documentType: { $regex: new RegExp(searchQuery, 'i') } },
      { department: { $regex: new RegExp(searchQuery, 'i') } },
      { version: { $regex: new RegExp(searchQuery, 'i') } },
      { documentState: { $regex: new RegExp(searchQuery, 'i') } },
      { documentName: { $regex: new RegExp(searchQuery, 'i') } },
      { documentNumbering: { $regex: new RegExp(searchQuery, 'i') } },
    ];
    aggregationPipeline[0]['$match']['$or'] = orCondition;
  }

  // Add the $lookup and $project stages for joining and shaping the output
  aggregationPipeline.push(
    {
      $lookup: {
        from: 'Doctype',
        localField: 'doctypeId',
        foreignField: '_id',
        as: 'd2',
      },
    },
    {
      $lookup: {
        from: 'DocumentVersions',
        localField: '_id',
        foreignField: 'documentId',
        as: 'docVersion',
      },
    },
    {
      $lookup: {
        from: 'Location',
        localField: 'locationId',
        foreignField: '_id',
        as: 'l',
      },
    },
    {
      $lookup: {
        from: 'Entity',
        localField: 'entityId',
        foreignField: '_id',
        as: 'e',
      },
    },
  );

  // $unwind stages for handling the joined arrays
  aggregationPipeline.push(
    { $unwind: '$d2' },
    { $unwind: '$l' },
    { $unwind: '$e' },
    // { $unwind: '$docVersion' }
  );

  // $project stage for shaping the output
  aggregationPipeline.push({
    $project: {
      id: '$_id',
      documentLinkNew: '$documentLink',
      status: '$documentState',
      documentName: '$documentName',
      issueNumber: '$issueNumber',
      system: '$system',
      location: '$l.locationName',
      organizationId: '$d2.organizationId',
      documentNumbering: '$documentNumbering',
      documentType: '$d2.documentTypeName',
      documentTypeId: '$d2._id',
      version: '$currentVersion',
      department: '$e.entityName',
      entityId: '$e._id',
      createdAt: '$createdAt',
      createdBy: '$createdBy',
      nextRevisionDate: '$nextRevisionDate',
      tags: '$tags',
      documentLink: 1,
      reviewFrequency: '$d2.reviewFrequency',
      readAccess: '$d2.readAccess',
      readAccessUsers: '$d2.readAccessUsers',
      approvedDate: '$approvedDate',
      isVersion: '$isVersion',
      locationId: '$locationId',
      section: '$section',
    },
  });

  // Pagination using $skip and $limit stages
  if (flag) {
    if (!!filter.limit && !!filter.page) {
      const limit = filter.limit || 10;
      const page = filter.page || 1;
      const skip = (page - 1) * limit;
      aggregationPipeline.push({ $skip: skip }, { $limit: limit });
    }
  }

  return aggregationPipeline;
}

function getDocumentChartsQuery(orgId: string, filter: DocumentChartFilter) {
  const aggregationPipeline = [];

  // Match stage to filter based on organizationId
  aggregationPipeline.push({
    $match: {
      organizationId: orgId,
      deleted: false,
    },
  });

  // Add additional match stages based on the provided filters
  if (filter.documentType) {
    aggregationPipeline.push({
      $lookup: {
        from: 'Doctype',
        localField: 'doctypeId',
        foreignField: '_id',
        as: 'd2',
      },
    });
    aggregationPipeline.push({ $unwind: '$d2' });
    aggregationPipeline.push({
      $match: {
        docType: filter.documentType,
      },
    });
  }

  if (filter.documentStatus) {
    if (Array.isArray(filter.documentStatus)) {
      aggregationPipeline.push({
        $match: {
          documentState: { $in: filter.documentStatus },
        },
      });
    } else {
      aggregationPipeline.push({
        $match: {
          documentState: {
            $regex: new RegExp(`^${filter.documentStatus}$`, 'i'),
          },
        },
      });
    }
  }

  if (filter.system) {
    aggregationPipeline.push({
      $match: {
        system: { $in: filter.system },
      },
    });
  }
  if (filter.locationId) {
    aggregationPipeline.push({ $match: { locationId: filter.locationId } });
    aggregationPipeline.push({
      $lookup: {
        from: 'Location',
        localField: 'locationId',
        foreignField: '_id',
        as: 'l',
      },
    });
    aggregationPipeline.push({ $unwind: '$l' });
  }
  if (filter.department) {
    aggregationPipeline.push({
      $match: { entityId: filter.department },
    });
    aggregationPipeline.push({
      $lookup: {
        from: 'Entity',
        localField: 'entityId',
        foreignField: '_id',
        as: 'e',
      },
    });
    aggregationPipeline.push({ $unwind: '$e' });
  }

  if (filter.creator) {
    aggregationPipeline.push({
      $match: { createdBy: { $regex: new RegExp(filter.creator, 'i') } },
    });
  }

  if (filter.searchQuery) {
    const searchQuery = filter.searchQuery.replace("'", "''").toLowerCase();
    const orCondition = [
      { id: searchQuery },
      { tags: searchQuery },
      { readAccess: { $regex: new RegExp(searchQuery, 'i') } },
      { documentType: { $regex: new RegExp(searchQuery, 'i') } },
      { department: { $regex: new RegExp(searchQuery, 'i') } },
      { version: { $regex: new RegExp(searchQuery, 'i') } },
      { documentState: { $regex: new RegExp(searchQuery, 'i') } },
      { documentName: { $regex: new RegExp(searchQuery, 'i') } },
      { documentNumbering: { $regex: new RegExp(searchQuery, 'i') } },
    ];
    aggregationPipeline.push({ $match: { $or: orCondition } });
  }

  // ... Continue adding more match stages for other filters

  // Add the lookup and unwind stages for joining and shaping the output
  // ...

  // Add the project stage for shaping the output
  // ...

  // Pagination using $skip and $limit stages
  // ...

  return aggregationPipeline;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Audit.name) private readonly auditModel: Model<AuditDocument>,
    @InjectModel(Nonconformance.name)
    private readonly NcModel: Model<NonconformanceDocument>,
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @Inject('Logger') private readonly logger: Logger,
    private prisma: PrismaService,
    private documentsService: DocumentsService,
    private organizationService: OrganizationService,
    private userService: UserService,
    private locationService: LocationService,
    private readonly systemService: SystemsService,
    private readonly entityService: EntityService,
    private readonly auditService: AuditService,
    private readonly favoriteService: FavoritesService,
    @InjectModel(Documents.name)
    private documentModel: Model<Documents>,
    @InjectModel(Doctype.name)
    private doctypeModel: Model<Doctype>,
    private readonly docUtils: DocUtils,
  ) {}
  async checkAccess(userid, documentId) {
    let accessflag = false;
    const activeuser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });
    const docdetails: any = await this.prisma.documents.findUnique({
      where: {
        id: documentId,
      },
    });
    if (activeuser.id === docdetails.createdBy) {
      accessflag = true;
      return accessflag;
    }
    // let userarray: any = JSON.parse(docdetails.readAccessUsers);
    else if (docdetails.readAccess === 'All Users') {
      accessflag = true;
      return accessflag;
    } else if (docdetails.readAccess === 'All in Units(S)') {
      let admin = await this.prisma.additionalDocumentAdmins.findMany({
        where: {
          AND: [{ userId: activeuser.id }, { documentId: documentId }],
        },
      });
      if (
        docdetails.readAccessUsers.some(
          (user) => user.id === activeuser.locationId,
        ) ||
        admin.length > 0
      ) {
        accessflag = true;
        return accessflag;
      }
    } else if (docdetails.readAccess === 'All in Department(S)') {
      let admin = await this.prisma.additionalDocumentAdmins.findMany({
        where: {
          AND: [{ userId: activeuser.id }, { documentId: documentId }],
        },
      });
      if (
        docdetails.readAccessUsers.some(
          (user) => user.id === activeuser.entityId,
        ) ||
        admin.length > 0
      )
        accessflag = true;
      return accessflag;
    } else if (docdetails.readAccess === 'Selected Users') {
      let admin = await this.prisma.additionalDocumentAdmins.findMany({
        where: {
          AND: [{ userId: activeuser.id }, { documentId: documentId }],
        },
      });
      if (
        docdetails.readAccessUsers.some((user) => user.id === activeuser.id) ||
        admin.length > 0
      )
        accessflag = true;
      return accessflag;
    } else {
      return accessflag;
    }
  }

  async versionSorter(arr: any) {
    const final = arr.sort(function (a, b) {
      // Extract the numeric part of the string and convert it to a number
      var numA = parseInt(a.slice(0, 3), 10);
      var numB = parseInt(b.slice(0, 3), 10);

      // Compare the numeric parts
      if (numA < numB) {
        return -1;
      }
      if (numA > numB) {
        return 1;
      }

      // If the numeric parts are equal, compare the letter part
      return a.slice(3).localeCompare(b.slice(3));
    });

    return final;
  }

  async displayVersionDocs(documentData) {
    const docNumb = [];
    const pushData = `${documentData.issueNumber}${documentData.version}`;
    docNumb.push(pushData);
    for (let version of documentData.documentVersion) {
      const pushData = `${version.issueNumber}${version.versionName}`;
      docNumb.push(pushData);
    }
    const versionData = await this.versionSorter(docNumb);
  }

  async filteredVersionDoc(document, user, documents) {
    if (documents.length > 0) {
      let versionDocument = [];
      let mainDocument;
      let insidedocument;
      let VersionDocs = [];

      // await Promise.all(
      // documents.map(async (value) =>

      for (let value of documents) {
        const { editAcess, deleteAccess, readAccess } =
          await this.accesforDocument(value.id, user);
        value = {
          id: value.id,
          documentLinkNew: value.documentLink,
          status: value.documentState,
          documentName: value.documentName,
          issueNumber: value.issueNumber,
          system: value.system,
          location: value.creatorLocation.locationName,
          organizationId: value.organizationId,
          documentNumbering: value.documentNumbering,
          documentType: value.doctype.documentTypeName,
          documentTypeId: value.doctype.id,
          version: value.currentVersion,
          department: value.creatorEntity.entityName,
          createdAt: value.createdAt,
          createdBy: value.createdBy,
          tags: value.tags,
          documentLink: value.documentLink,
          readAccess: value.doctype.readAccess,
          readAccessUsers: value.readAccessUsers,
          approvedDate: value.approvedDate,
          isVersion: value.isVersion,
          locationId: value.locationId,
          access: true,
          editAcess,
          deleteAccess,
          type: document.type,
          readDocAccess: readAccess,
        };
        if (document.status === 'PUBLISHED') {
          // return { ...document, documentVersions: versionDocument };
          mainDocument = { ...document };
          VersionDocs.push({ ...value });
        } else {
          // let docDisplay = await versionDocument.map((value) =>
          if (
            value?.status === 'PUBLISHED' ||
            value?.status === 'RETIRE_INREVIEW' ||
            value?.status === 'RETIRE_INAPPROVE'
          ) {
            mainDocument = { ...value };
          } else {
            if (user.kcRoles.roles.includes('ORG-ADMIN')) {
              VersionDocs.push({ ...value, access: true, isCreator: true });
            } else {
              VersionDocs.push({ ...value, access: true, isCreator: true });
            }
          }
          // VersionDocs.push({ ...document });
          insidedocument = { ...document };
          // const finalDocument = {
          //   ...document,

          // };
          // return {
          //   ...mainDocument,
          //   documentVersions: [...VersionDocs, finalDocument],
          // };
        }
      }
      if (insidedocument?.hasOwnProperty('id')) {
        VersionDocs.push({ ...insidedocument });
      }
      return {
        ...mainDocument,
        documentVersions: [
          ...VersionDocs,
          // insidedocument.hasOwnProperty('id') && insidedocument,
        ],
      };
      // ),
      // );
    } else {
      // const { editAcess, deleteAccess, readAccess } =
      //   await this.accesforDocument(document.id, user);
      return { ...document };
    }
  }
  async findAll(filterObj: DashboardFilter, user: any) {
    // console.log('inside find all', filterObj);
    const randomNumber = uuid();
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard service started`,
        '',
      );
      await client.connect();
      const dbname = process.env.MONGO_DB_URI.split('/');

      const db = client.db(process.env.MONGO_DB_NAME); // Replace 'yourDatabaseName' with your actual database name
      // const activeUser = await db.collection('User').findOne({
      //   kcId: user.id,
      // });
      const activeUser: any = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      let entityDataIds = [],
        filter: any;

      if (activeUser.userType === 'Local') {
        const entityData = await this.prisma.entity.findMany({
          where: { locationId: activeUser.locationId },
        });
        entityDataIds = entityData?.map((value) => value?.id);
      } else if (
        activeUser?.functionId?.hasOwnProperty('id') &&
        activeUser?.userType === 'function'
      ) {
        const entityData = await this.prisma.entity.findMany({
          where: { functionId: activeUser?.functionId?.id },
        });
        entityDataIds = entityData?.map((value) => value?.id);
      } else if (activeUser.userType === 'globalRoles') {
        const locations = await this.prisma.location.findMany({
          where: {
            organizationId: activeUser.organizationId,
          },
        });
        // console.log('getAllLocations');
        const entityData = await this.prisma.entity.findMany({
          where: {
            // Check if additionalUnits contains 'all' or match locationId in the array
            locationId: activeUser?.additionalUnits?.includes('All')
              ? undefined // If 'all' is in additionalUnits, no filter on locationId
              : { in: activeUser?.additionalUnits }, // Otherwise, match locationId in the array
          },
        });
        // console.log('entityData', entityData);
        entityDataIds = entityData?.map((value) => value?.id);
        let locIDs = locations?.map((value) => value?.id);
        filter = {
          // locationName: {
          //   locationName: '',
          //   id: activeUser?.additionalUnits?.includes('All')
          //     ? locations[0] // If 'all' is in additionalUnits, use the first location  on locationId
          //     : activeUser?.additionalUnits,
          // },
          locationIds: activeUser?.additionalUnits?.includes('All')
            ? locIDs // If 'all' is in additionalUnits, send all locationIDs
            : activeUser?.additionalUnits,
          page: filterObj.page,
          limit: filterObj?.limit,
        };
      }

      const documentsWithPermissions = [];
      let query: any;
      if (activeUser?.userType === 'globalRoles') {
        query = await getTableQuery(
          {
            ...filter,
            organizationId: activeUser.organizationId,
            documentIds: null,
          },
          true,
          entityDataIds,
        );
      } else {
        query = await getTableQuery(
          {
            ...filterObj,
            organizationId: activeUser.organizationId,
            documentIds: null,
          },
          true,
          entityDataIds,
        );
      }
      // console.log('query', query);
      const countQuery: any = await getTableQuery(
        {
          ...filterObj,
          organizationId: activeUser.organizationId,
          documentIds: null,
        },
        false,
        entityDataIds,
      );
      // const cursor = db.collection('Documents').aggregate(query);
      const cursor = db.collection('Documents').aggregate([
        ...query, // Include your existing aggregation stages
        {
          $sort: {
            createdAt: -1, // 1 for ascending order, -1 for descending order
          },
        },
      ]);

      const countCursor = db.collection('Documents').aggregate([
        ...countQuery, // Include your existing aggregation stages
        {
          $sort: {
            createdAt: -1, // 1 for ascending order, -1 for descending order
          },
        },
      ]);
      const documentsArray = await cursor.toArray();
      const documentsArrayCount = await countCursor.toArray();
      for (let document of documentsArray) {
        let publishAcess = false;
        // let access = await this.checkAccess(user.id, document.id);

        let writeAccess = false;
        let [
          admin,
          documentVersion,
          systemData,
          access,
          { editAcess, deleteAccess, readAccess },
          section,
        ] = await Promise.all([
          this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [
                { userId: activeUser.id },
                { documentId: document.id },
                {
                  OR: [
                    { type: 'CREATOR' },
                    { type: 'APPROVER' },
                    { type: 'REVIEWER' },
                  ],
                },
              ],
            },
          }),
          this.prisma.documentVersions.findMany({
            where: {
              documentId: document.id,
            },
          }),
          this.SystemModel.find({
            _id: document.system,
          }).select('name _id type'),
          this.checkAccess(user.id, document.id),
          this.accesforDocument(document.id, user),
          document?.section !== null && document?.section !== undefined
            ? this.prisma.entity.findFirst({
                where: {
                  organizationId: activeUser.organizationId,
                  id: document.section,
                },
                select: {
                  entityName: true,
                },
              })
            : null,
        ]);
        document = { ...document, documentVersion };
        if (admin.length > 0) {
          writeAccess = true;
        } else if (document.status === 'PUBLISHED') {
          if (document.locationId === activeUser.locationId) writeAccess = true;
          publishAcess = true;
        }

        if (
          user.kcRoles?.roles?.includes('ORG-ADMIN') // Your other conditions for access
        ) {
          documentsWithPermissions.push({
            ...document,
            isVersion: document.isVersion,
            system: systemData,
            access: true,
            sectionName: section?.entityName || null,
            isCreator: true,
            editAcess,
            deleteAccess,
            readAccess,
          });
        } else {
          documentsWithPermissions.push({
            ...document,
            isVersion: document.isVersion,
            system: systemData,
            access: access,
            editAcess,
            sectionName: section?.entityName || null,
            deleteAccess,
            readAccess,
            isCreator: publishAcess ? publishAcess : writeAccess,
          });
        }
      }

      const documentCount = await db.collection('Documents').countDocuments({
        organizationId: activeUser.organizationId,
        // deleted: false,
      });

      return {
        data: documentsWithPermissions,
        data_length: documentsWithPermissions.length,
        total: documentsArrayCount.length,
        status: 200,
        message: 'success',
      };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard   service failed ${error}`,
        '',
      );
      throw error;
    } finally {
      await client.close();
    }
  }

  /**
   * @method getAuditChartData
   *  This method fetches the chart data according to the passed parameters
   * @param query filter parameters
   * @param user current user
   * @returns Chart data
   */
  async getAuditChartData(query: any, user: any) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/chart/audit service started`,
        '',
      );
      const response = {
        labels: [],
        datasets: [],
      };
      const { filterField, ...rest } = query;
      query = rest;

      const dataset = {};

      const currentUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });

      // if filtering by auditType
      if (filterField === 'auditType') {
        const { auditType, to, from, ...rest } = query;
        const dataset = [];
        const filter = filterGenerator({
          ...rest,
          date: { gte: from, lte: to },
          auditType,
          isDraft: false,
        });

        const types = await this.auditModel.aggregate([
          { $match: filter[0].$match },
          { $project: { _id: 0, auditType: 1 } },
          { $group: { _id: '$auditType', count: { $sum: 1 } } },
        ]);

        for (let type of types) {
          const auditTypeInfo =
            await this.organizationService.getSystemTypeById(type._id);
          response.labels.push({
            label: auditTypeInfo.name,
            id: auditTypeInfo.id,
          });
          dataset.push(type.count);
        }

        response.datasets = dataset;
        return { data: response };
      }

      // if filtering by system / system Name
      if (filterField === 'system') {
        const { organization, to, from, ...fields } = query;

        // if(user.kcRoles.roles.includes("MR")) {
        const filter = filterGenerator({
          ...fields,
          organization,
          isDraft: false,
          date: { gte: from, lte: to },
        });
        const audits = await this.auditModel.aggregate([
          { $match: filter[0].$match },
          { $project: { _id: 0, system: 1, location: 1 } },
          {
            $group: {
              _id: { location: '$location', system: '$system' },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: '$_id.location',
              systems: { $push: { system: '$_id.system', count: '$count' } },
            },
          },
        ]);

        // looping through data to generate labels
        for (let i = 0; i < audits.length; i++) {
          for (let system of audits[i].systems) {
            if (!dataset[system.system]) {
              let res = await this.SystemModel.findById(system.system);
              let data = { label: res?.name, data: [], id: res._id.toString() };
              dataset[system.system] = true;
              response.datasets.push(data);
            }
          }
        }

        // looping over to get the legends aka labels
        for (let i = 0; i < audits.length; i++) {
          const systemsMap = {};

          audits[i].systems.forEach((item: any) => {
            if (!systemsMap[item.system]) {
              systemsMap[item.system] = item.count;
            } else {
              systemsMap[item.system] += item.count;
            }
          });

          response.datasets.forEach((item: any) => {
            const count = systemsMap[item.id] ? systemsMap[item.id] : 0;
            item.data.push(count);
          });

          const location = await this.locationService.getLocationById(
            audits[i]._id,
          );
          response.labels.push({
            label: location?.locationName,
            id: location?.id,
          });
        }

        return { data: response };
      }

      //  if filtering by auditedDocuments
      if (filterField === 'auditedDocuments') {
        const { to, from, ...rest } = query;
        const filter = filterGenerator({
          ...rest,
          isDraft: false,
          date: { gte: from, lte: to },
        });
        const audits = await this.auditModel.aggregate([
          {
            $match: {
              'auditedDocuments.0': { $exists: true },
              ...filter[0].$match,
            },
          },
          { $project: { _id: 0, auditedDocuments: 1 } },
          { $unwind: '$auditedDocuments' },
          { $group: { _id: '$auditedDocuments', count: { $sum: 1 } } },
          { $project: { _id: 0, document: '$_id', count: 1 } },
          { $sort: { count: -1 } },
        ]);
        const length = audits.length < 5 ? audits.length : 5;

        // looping over for 5 top most audited documents
        for (let i = 0; i < length; i++) {
          const doc = await this.prisma.documents.findUnique({
            where: {
              id: audits[i].document,
            },
          });
          response.labels.push({ label: doc?.documentName, id: doc?.id });
          response.datasets.push(audits[i].count);
        }

        return { data: response, totalCount: audits.length };
      }
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/chart/audit service successful`,
        '',
      );
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/documentFilterList/chart/audit  service failed ${err}`,
        '',
      );
    }
  }

  /**
   * @method auditDataFilter
   *  This method filters audits according to the filter passed by the user
   * @param query filters
   * @param user current user
   * @returns array of matched audits
   */

  async auditDataFilter(query: any, user: any) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/audit/filter service started`,
        '',
      );
      const response = [];
      const currentUser = await this.userService.getUserInfo(user.id);
      const organization = await this.organizationService.getOrgById(
        currentUser.organizationId,
      );
      const { from, to, ...rest } = query;
      const filter = filterGenerator({
        ...rest,
        organization: organization.id,
        isDraft: false,
        date: { gte: from, lte: to },
      });

      // counting documents
      const auditCount = await this.auditModel.countDocuments(filter[0].$match);
      const audits = await this.auditModel.aggregate(filter);

      // looping through all audits
      for (let i = 0; i < audits.length; i++) {
        const audit: any = audits[i];
        let systemtype: any = this.organizationService.getSystemTypeById(
          audit.auditType,
        );
        let organization: any = this.organizationService.getOrgById(
          audit.organization,
        );
        let location: any = this.locationService.getLocationById(
          audit.location,
        );
        let system: any = this.systemService.findById(audit.system);
        let auditors: any = audit.auditors.map((item) =>
          this.userService.getUserById(item),
        );
        let auditees: any = audit.auditees.map((item) =>
          this.userService.getUserById(item),
        );

        let rest: any;

        // Resolving promises
        [rest, auditors, auditees] = await Promise.all([
          Promise.all([systemtype, organization, location, system]),
          Promise.all(auditors),
          Promise.all(auditees),
        ]);

        let auditedEntity;
        if (audit.auditedEntity) {
          auditedEntity = await this.entityService.getEntityById(
            audit.auditedEntity,
          );
        }

        const isAccessible =
          audit.auditors.includes(currentUser.id) ||
          audit.auditees.includes(currentUser.id);

        response.push({
          ...audit,
          auditType: rest[0],
          organization: rest[1],
          location: rest[2],
          auditors,
          auditees,
          system: rest[3],
          auditedEntity,
          businessUnit: auditedEntity?.businessType,
          isAccessible,
        });
      }
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/audit/filter service successful`,
        '',
      );

      return { audits: response, count: auditCount };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/audit/filter  service failed ${err}`,
        '',
      );
      throw new InternalServerErrorException();
    }
  }

  async getNcChartData(query: any, user: any) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/chart/nc service started`,
        '',
      );
      const { filterField, organization, location, to, from, ...rest } = query;

      const response = {
        labels: [],
        datasets: [
          {
            label: 'Open',
            data: [],
          },
          {
            label: 'Closed',
            data: [],
          },
        ],
      };
      let labels = [];
      let dataset = [];
      if (filterField === 'ncObsType') {
        let filters;

        if (location === 'All' || location === 'undefined') {
          filters = filterGenerator({
            organization,
            ...rest,
            date: { gte: from, lte: to },
          });
        } else {
          filters = filterGenerator({
            organization,
            // location,
            ...rest,
            date: { gte: from, lte: to },
          });
        }

        const audits = await this.auditModel.aggregate(filters);
        const ids = audits.map((item) => item._id);

        const findings = await this.NcModel.find({ organization }).distinct(
          'type',
        );
        // const ncCount = await this.NcModel.countDocuments({
        //   audit: { $in: ids },
        //   type: 'NC',
        // });
        // const obsCount = await this.NcModel.countDocuments({
        //   audit: { $in: ids },
        //   type: 'Observation',
        // });
        // const ofiCount = await this.NcModel.countDocuments({
        //   audit: { $in: ids },
        //   type: 'OFI',
        // });
        for (let value of findings) {
          const count = await this.NcModel.countDocuments({
            audit: { $in: ids },
            type: value,
          });
          labels.push(value);
          dataset.push(count);
        }

        return {
          labels,
          dataset,
        };
      }

      if (filterField === 'ncType') {
        // if location exists that means user do not have role of org admin
        // he gets to see data of his location only
        if (location) {
          const currentLocation = await this.prisma.location.findUnique({
            where: {
              id: location,
            },
          });

          const filters = filterGenerator({
            organization,
            location,
            ...rest,
            date: { gte: from, lte: to },
          });
          const audits = await this.auditModel.aggregate(filters);
          const ids = audits.map((item) => item._id);
          const totalOpen = [];
          const totalClose = [];

          const findings = await this.NcModel.find({ organization }).distinct(
            'type',
          );
          for (let value of findings) {
            const ncCountOpen = await this.NcModel.countDocuments({
              audit: { $in: ids },
              type: value,
              $or: [
                { status: 'OPEN' },
                { status: 'IN_PROGRESS' },
                { status: 'ACCEPTED' },
              ],
            });
            const ncCountClosed = await this.NcModel.countDocuments({
              audit: { $in: ids },
              type: value,
              status: 'CLOSED',
            });
            totalOpen.push({ type: value, count: ncCountOpen });
            totalClose.push({ type: value, count: ncCountClosed });
          }

          response.labels.push({
            label: currentLocation?.locationName,
            id: currentLocation?.id,
          });
          response.datasets[0].data.push(totalOpen);
          response.datasets[1].data.push(totalClose);
          return response;
        }
        // if no location exists we fetch all locations i.e, user has role of org admin
        // he gets to see data of all location
        else {
          // getting all locations for the current org
          const allLocations = await this.prisma.location.findMany({
            where: {
              organizationId: organization,
            },
          });

          for (const location of allLocations) {
            const filters = filterGenerator({
              organization,
              location: location?.id,
              ...rest,
              date: { gte: from, lte: to },
            });
            const audits = await this.auditModel.aggregate(filters);
            const findings = await this.NcModel.find({ organization }).distinct(
              'type',
            );
            // const audits = await this.auditModel.find({ organization, location: location?.id });
            const ids = audits.map((item) => item._id);
            const totalOpen = [];
            const totalClose = [];
            for (let value of findings) {
              let ncCountOpen: any = await this.NcModel.countDocuments({
                audit: { $in: ids },
                type: value,
                $or: [
                  { status: 'OPEN' },
                  { status: 'IN_PROGRESS' },
                  { status: 'ACCEPTED' },
                ],
              });
              let ncCountClosed: any = await this.NcModel.countDocuments({
                audit: { $in: ids },
                type: value,
                status: 'CLOSED',
              });

              totalOpen.push({ type: value, count: ncCountOpen });
              totalClose.push({ type: value, count: ncCountClosed });
            }

            // resolving promises

            response.labels.push({
              label: location?.locationName,
              id: location?.id,
            });
            response.datasets[0].data.push(totalOpen);
            response.datasets[1].data.push(totalClose);
          }

          return response;
        }
      }

      if (filterField === 'ncAgeAnalysis') {
        response.labels = ['<15', '<30', '<60', '>60'];
        let ids = [];
        const offset = [15, 30, 60];
        let filters;

        if (location === 'All' || location === 'undefined') {
          filters = filterGenerator({
            organization,
            ...rest,
            date: { gte: from, lte: to },
          });
        } else {
          filters = filterGenerator({
            organization,
            location,
            ...rest,
            date: { gte: from, lte: to },
          });
        }
        const audits = await this.auditModel.aggregate(filters);
        ids = audits.map((item) => item._id);

        for (let i = 0; i < response.labels.length; i++) {
          const label = response.labels[i];
          const numArr = label.split('');
          const num = parseInt(numArr[1] + numArr[2]) - 1;
          let totalOpenCount = [];
          let totalClosedCount = [];
          const findings = await this.NcModel.find({ organization }).distinct(
            'type',
          );
          if (i === 0) {
            for (let value of findings) {
              let openCount = await this.NcModel.countDocuments({
                audit: { $in: ids },
                type: value,
                $or: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }],
                date: {
                  // $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000))),
                  $gte: new Date(
                    new Date().setHours(0, 0, 0) - 15 * 24 * 60 * 60 * 1000,
                  ),
                },
              });

              let closedCount = await this.NcModel.countDocuments({
                audit: { $in: ids },
                type: value,
                status: 'CLOSED',
                date: {
                  // $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000))),
                  $gte: new Date(
                    new Date().setHours(0, 0, 0) - 15 * 24 * 60 * 60 * 1000,
                  ),
                },
              });
              totalOpenCount.push(openCount);
              totalClosedCount.push(closedCount);
            }

            response.datasets[0].data.push(totalOpenCount);
            response.datasets[1].data.push(totalClosedCount);
          } else if (i === response.labels.length - 1) {
            for (let value of findings) {
              let openCount = await this.NcModel.countDocuments({
                audit: { $in: ids },
                type: value,
                $or: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }],
                date: {
                  $lte: new Date(
                    new Date().setHours(23, 59, 999) - 60 * 24 * 60 * 60 * 1000,
                  ),
                },
              });

              let closedCount = await this.NcModel.countDocuments({
                audit: { $in: ids },
                type: value,
                status: 'CLOSED',
                date: {
                  $lte: new Date(
                    new Date().setHours(23, 59, 999) - 60 * 24 * 60 * 60 * 1000,
                  ),
                },
              });
              totalOpenCount.push(openCount);
              totalClosedCount.push(closedCount);
            }

            response.datasets[0].data.push(totalOpenCount);
            response.datasets[1].data.push(totalClosedCount);
          } else {
            for (let value of findings) {
              let openCount = await this.NcModel.countDocuments({
                audit: { $in: ids },
                $or: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }],
                type: value,
                date: {
                  $gte: new Date(
                    new Date().setHours(0, 0, 0) - num * 24 * 60 * 60 * 1000,
                  ),
                  $lte: new Date(
                    new Date().setHours(23, 59, 999) -
                      offset[i - 1] * 24 * 60 * 60 * 1000,
                  ),
                },
              });

              let closedCount = await this.NcModel.countDocuments({
                audit: { $in: ids },
                type: value,
                status: 'CLOSED',
                date: {
                  $gte: new Date(
                    new Date().setHours(0, 0, 0) - num * 24 * 60 * 60 * 1000,
                  ),
                  $lte: new Date(
                    new Date().setHours(23, 59, 999) -
                      offset[i - 1] * 24 * 60 * 60 * 1000,
                  ),
                },
              });
              totalOpenCount.push(openCount);
              totalClosedCount.push(closedCount);
            }

            response.datasets[0].data.push(totalOpenCount);
            response.datasets[1].data.push(totalClosedCount);
          }
        }

        response.labels = response.labels.reverse();
        response.datasets[0].data = response.datasets[0].data.reverse();
        response.datasets[1].data = response.datasets[1].data.reverse();
        return response;
      }

      if (filterField === 'topClauses') {
        let ids;
        const filters = filterGenerator({
          organization,
          location,
          ...rest,
          date: { gte: from, lte: to },
        });
        const audits = await this.auditModel.aggregate(filters);
        ids = audits.map((item) => item._id);
        const findings = await this.NcModel.find({ organization }).distinct(
          'type',
        );
        let totalLength = [];
        for (let value of findings) {
          const ncs = await this.NcModel.aggregate([
            {
              $match: {
                audit: { $in: ids },
                type: value,
              },
            },
            { $project: { _id: 0, clause: 1 } },
            { $unwind: '$clause' },
            { $project: { _id: '0', cid: '$clause.id' } },
            { $group: { _id: '$cid', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]);
          totalLength.push(...ncs);
        }

        const size = totalLength.length < 5 ? totalLength.length : 5;
        for (let i = 0; i < size; i++) {
          const doc = await this.systemService.getClauseById(
            totalLength[i]?._id,
          );
          response.labels.push({ label: doc?.name, id: doc?._id });
        }

        return { labels: response.labels, totalClauses: totalLength.length };
      }

      if (filterField === 'entityInfo') {
        const response = [];

        const filter = filterGenerator({
          organization,
          location,
          ...rest,
          date: { gte: from, lte: to },
        });
        const entities = await this.auditModel.aggregate([
          { $match: filter[0].$match },
          { $project: { _id: 1, entity: '$auditedEntity' } },
          { $group: { _id: '$entity', audit: { $push: '$_id' } } },
        ]);

        for (let entity of entities) {
          const auditedEntity = await this.entityService.getEntityById(
            entity?._id,
          );
          const ids = entity.audit.map((item) => new Types.ObjectId(item));
          const findings = await this.NcModel.find({ organization }).distinct(
            'type',
          );
          let findingsTypeCount = [];
          for (let value of findings) {
            let ncCount: any = await this.NcModel.countDocuments({
              type: value,
              audit: { $in: ids },
            }).lean();

            findingsTypeCount.push({ type: value, count: ncCount });
          }

          response.push({
            label: auditedEntity?.entityName,
            findingsTypeCount,
            id: auditedEntity?.id,
          });
        }

        return response;
      }

      const backgroundColor = ['#0075a4', '#7cbf3f', '#4682a9', '#0a6ebd'];
      if (filterField === 'stackBarChart') {
        const response = {
          labels: [],
          datasets: [],
        };

        let finalResult = {
          labels: [],
          datasets: [
            {
              label: 'OPEN',
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(75,192,192,0.4)',
              hoverBorderColor: 'rgba(75,192,192,1)',
              data: [],
            },
            {
              label: 'IN_PROGRESS',
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(75,192,192,0.4)',
              hoverBorderColor: 'rgba(75,192,192,1)',
              data: [],
            },

            {
              label: 'CLOSED',
              backgroundColor: 'rgba(255,99,132,0.2)',
              borderColor: 'rgba(255,99,132,1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(255,99,132,0.4)',
              hoverBorderColor: 'rgba(255,99,132,1)',
              data: [],
            },
          ],
        };

        const filters = filterGenerator({
          organization,
          location,
          ...rest,
          date: { gte: from, lte: to },
        });
        const audits = await this.auditModel.aggregate(filters);
        const ids = audits.map((item) => item._id);
        let findingType = await this.NcModel.find({
          audit: { $in: ids },
        }).distinct('type');
        for (let nc of findingType) {
          let typeOpen = await this.NcModel.countDocuments({
            organization,
            type: nc,
            status: 'OPEN',
          });
          let typeInprogress = await this.NcModel.countDocuments({
            organization,
            type: nc,
            status: 'IN_PROGRESS',
          });
          let typeClosed = await this.NcModel.countDocuments({
            organization,
            type: nc,
            status: 'CLOSED',
          });
          finalResult.labels.push(nc);
          finalResult.datasets[0].data.push(typeOpen);
          finalResult.datasets[1].data.push(typeInprogress);
          finalResult.datasets[2].data.push(typeClosed);
          //
          // {
          //   label: 'OFI Open',
          //   data: [],
          //   backgroundColor: '#4682a9',
          //   stack: 'OFI',
          //   grouped: true,
          //   categoryPercentage: 0.5,
          //   barPercentage: 0.8,
          // },

          // const clause_id = nc.clause[0].id;
          // const system_type = await this.clause_id_to_system_type(
          //   clause_id,
          //   organization,
          // );
          // if (!counts[nc.type][nc.status][system_type]) {
          //   counts[nc.type][nc.status][system_type] = 0;
          // }
          // counts[nc.type][nc.status][system_type]++;
        }

        this.logger.log(
          `trace id=${randomNumber} Get api/dashboard/chart/nc service successful`,
          '',
        );
        return finalResult;
      }
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/chart/nc  service failed ${err}`,
        '',
      );
    }
  }
  async clause_id_to_system_type(clause_id: any, orgId: any) {
    // Iterate over systems
    const system = await this.SystemModel.findOne(
      { 'clauses._id': clause_id },
      { type: 1 },
    );
    if (system) {
      const systemType = await this.prisma.systemType.findFirst({
        where: {
          id: system.type,
          organizationId: orgId,
        },
      });

      return systemType.name;
    } else {
    }
  }
  /**
   * @method searchAuditData
   *  This method will search data from the audits collection aand return the matched results
   * @param query query params
   * @param user current user
   * @returns Array of audits
   */
  async searchAuditData(query: any, user: any) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/audit/search service started`,
        '',
      );

      const { text, organization, skip, limit } = query;
      const response = [];

      let locations: any = this.prisma.location.findMany({
        where: {
          AND: [
            { organizationId: organization },
            { locationName: { contains: text, mode: 'insensitive' } },
          ],
        },
      });

      let auditTypes: any = this.prisma.systemType.findMany({
        where: {
          AND: [
            { organizationId: organization },
            { name: { contains: text, mode: 'insensitive' } },
          ],
        },
      });

      let systems: any = this.SystemModel.aggregate([
        {
          $match: {
            organizationId: organization,
            name: { $regex: text, $options: 'i' },
          },
        },
      ]);

      let users: any = this.prisma.user.findMany({
        where: {
          AND: [
            { organizationId: organization },
            { OR: [{ email: { contains: text, mode: 'insensitive' } }] },
          ],
        },
      });

      // resolving all promises
      [locations, auditTypes, systems, users] = await Promise.all([
        locations,
        auditTypes,
        systems,
        users,
      ]);

      // getting all ids
      const locIds = locations.map((item) => item.id);
      const auditTypeIds = auditTypes.map((item) => item.id);
      const systemsIds = systems.map((item) => item._id);
      const userIds = users.map((item) => item.id);

      const audits: any = await this.auditModel
        .find({
          $or: [
            {
              $and: [
                { auditNumber: { $regex: text, $options: 'i' } },
                { organization },
              ],
            },
            { location: { $in: locIds } },
            { auditType: { $in: auditTypeIds } },
            { system: { $in: systemsIds } },
            { auditors: { $elemMatch: { $in: userIds } } },
            { auditees: { $elemMatch: { $in: userIds } } },
          ],
        })
        .select('-sections')
        .populate('system', 'name')
        .select('-sections')
        .skip(skip)
        .limit(limit)
        .lean();

      const count = await this.auditModel
        .countDocuments({
          $or: [
            {
              $and: [
                { auditNumber: { $regex: text, $options: 'i' } },
                { organization },
              ],
            },
            { location: { $in: locIds } },
            { auditType: { $in: auditTypeIds } },
            { system: { $in: systemsIds } },
            { auditors: { $elemMatch: { $in: userIds } } },
            { auditees: { $elemMatch: { $in: userIds } } },
          ],
        })
        .lean();

      for (let i = 0; i < audits.length; i++) {
        const audit = audits[i];
        let auditType: any = this.organizationService.getSystemTypeById(
          audit.auditType,
        );
        let auditedEntity: any = this.entityService.getEntityById(
          audit.auditedEntity,
        );
        let location: any = this.locationService.getLocationById(
          audit.location,
        );
        let auditors: any = audit.auditors.map((item) =>
          this.userService.getUserById(item),
        );
        let auditees: any = audit.auditees.map((item) =>
          this.userService.getUserById(item),
        );
        let rest: any;
        // [auditType, auditedEntity, location] = await Promise.all([auditType, auditedEntity, location]);

        [rest, auditors, auditees] = await Promise.all([
          Promise.all([auditType, auditedEntity, location]),
          Promise.all(auditors),
          Promise.all(auditees),
        ]);

        auditType = rest[0];
        auditedEntity = rest[1];
        location = rest[2];

        response.push({
          ...audit,
          auditedEntity,
          auditors,
          auditees,
          location,
          auditType,
          businessUnit: auditedEntity?.businessType,
        });
      }

      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/audit/search service successful`,
        '',
      );

      return { audits: response, count };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/audit/search  service failed ${err}`,
        '',
      );
    }
  }

  /**
   * @method searchNcData
   * @desc This method searches NC / Obs  from the database to the text provided
   * @param query query params
   * @param user current user
   * @returns Array of NCs
   */
  async searchNcData(query: any, user: any) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/nc/search service started`,
        '',
      );

      const { text, organization, skip, limit } = query;
      const response = [];

      let locations: any = this.prisma.location.findMany({
        where: {
          AND: [
            { organizationId: organization },
            { locationName: { contains: text, mode: 'insensitive' } },
          ],
        },
      });

      let entities: any = this.prisma.entity.findMany({
        where: {
          AND: [
            { organizationId: organization },
            { entityName: { contains: text, mode: 'insensitive' } },
          ],
        },
      });

      let systems: any = this.SystemModel.aggregate([
        {
          $match: {
            organizationId: organization,
            name: { $regex: text, $options: 'i' },
          },
        },
      ]);

      let users: any = this.prisma.user.findMany({
        where: {
          AND: [
            { organizationId: organization },
            { OR: [{ email: { contains: text, mode: 'insensitive' } }] },
          ],
        },
      });

      // resolving all promises
      [locations, systems, users, entities] = await Promise.all([
        locations,
        systems,
        users,
        entities,
      ]);

      // getting all ids
      const locIds = locations.map((item) => item.id);
      const entityIds = entities.map((item) => item.id);
      const systemsIds = systems.map((item) => item._id);
      const userIds = users.map((item) => item.id);

      const audits = await this.auditModel
        .find({
          $or: [
            {
              $and: [
                { auditNumber: { $regex: text, $options: 'i' } },
                { organization },
              ],
            },
            { location: { $in: locIds } },
            { auditedEntity: { $in: entityIds } },
            { system: { $in: systemsIds } },
            { auditors: { $elemMatch: { $in: userIds } } },
            { auditees: { $elemMatch: { $in: userIds } } },
          ],
        })
        .select('_id');

      const auditIds = audits.map((item) => item._id); // getting all matching audit ids

      const ncs = await this.NcModel.find({
        $or: [
          { audit: { $in: auditIds } },
          { type: { $regex: text, $options: 'i' } },
          { id: { $regex: text, $options: 'i' } },
          { 'clause.clauseNumber': { $regex: text, $options: 'i' } },
          { status: { $regex: text, $options: 'i' } },
        ],
      })
        .skip(skip)
        .limit(limit)
        .populate('audit audit.system');

      const count = await this.NcModel.countDocuments({
        $or: [
          { audit: { $in: auditIds } },
          { type: { $regex: text, $options: 'i' } },
          { id: { $regex: text, $options: 'i' } },
          { 'clause.clauseNumber': { $regex: text, $options: 'i' } },
          { status: { $regex: text, $options: 'i' } },
        ],
      }).lean();

      //  looping over ncs and populating data
      for (let i = 0; i < ncs.length; i++) {
        const nc: any = ncs[i].toObject();
        let auditedEntity: any = this.entityService.getEntityById(
          nc.audit.auditedEntity,
        );
        let system: any = this.systemService.findById(nc.audit.system);
        let location: any = this.locationService.getLocationById(
          nc.audit.location,
        );

        // [auditedEntity, system, location] = await Promise.all([auditedEntity, system, location]);
        let auditors: any = nc.audit.auditors.map((item) =>
          this.userService.getUserById(item),
        );
        let auditees: any = nc.audit.auditees.map((item) =>
          this.userService.getUserById(item),
        );
        let rest: any;

        // resolving all promises parallely
        [rest, auditors, auditees] = await Promise.all([
          Promise.all([auditedEntity, system, location]),
          Promise.all(auditors),
          Promise.all(auditees),
        ]);

        nc.audit.auditedEntity = rest[0];
        nc.audit.system = rest[1];
        nc.audit.location = rest[2];
        nc.audit.auditors = auditors;
        nc.audit.auditees = auditees;
        response.push(nc);
      }
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/nc/search service successful`,
        '',
      );

      return { nc: response, count };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/nc/search  service failed ${err}`,
        '',
      );
    }
  }

  /**
   * @method getFinancialYear
   *  This method fetches all the uniques audited Year
   * @returns Array of unique financial years
   */
  async getFinancialYear(organization) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/getFinancialYear/${organization} service started`,
        '',
      );

      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/getFinancialYear/${organization} service successful`,
        '',
      );

      return await this.auditModel.aggregate([
        { $match: { _id: { $exists: true }, organization } },
        { $project: { _id: 0, auditYear: 1 } },
        { $group: { _id: '$auditYear' } },
        { $project: { _id: 0, year: '$_id' } },
      ]);
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/getFinancialYear/${organization}  service failed ${err}`,
        '',
      );
    }
  }
  async findAllBydocumentsBySystems(filterObj: DashboardFilter, user, system) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/systems/${system} service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const skipValue = (filterObj.page - 1) * Number(filterObj.limit); // preprocess filter obj to make it usable by makeFilter helper
      const [filterObjPreprocessedAND, filterObjPreprocessedOR] =
        QueryFilterPreprocessing(filterObj); // relation map used to make the query
      const relationMapAND: IRelationMap = getRelationshipMap(
        filterObjPreprocessedAND,
      );
      const relationMapOR: IRelationMap = getRelationshipMap(
        filterObjPreprocessedOR,
      ); // build query using preprocessed filter obj and relation map
      const relationFiltersAND = makeFilters<{
        [key: string]: any;
      }>(filterObjPreprocessedAND, relationMapAND);

      const relationFiltersOR = makeFilters<{
        [key: string]: any;
      }>(filterObjPreprocessedOR, relationMapOR);
      const filters = {}; // AND operation
      filters['AND'] = relationFiltersAND; // if search query is applied - OR operation
      if (relationFiltersOR.length > 0) filters['OR'] = relationFiltersOR; // promise: get all the documents - applied filters if any

      // promise: get all the documents - applied filters if any
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(filterObj.limit),
        where: {
          system: system,
          AND: [
            {
              ...filters,
              organizationId: activeUser.organizationId,
              // deleted: false,
            },
          ],
        },
        include: {
          creatorEntity: true,
          doctype: true,
          creatorLocation: true,
        },
      });

      const transformedData = filteredDocuments.map((document) => ({
        id: document.id,
        documentNumbering: document.documentNumbering,
        documentName: document.documentName,
        documentType: document.doctype.documentTypeName,
        version: document.currentVersion,
        status: document.documentState,
        department: document.creatorEntity.entityName,
        location: document.creatorLocation.locationName,
      }));

      const documentsWithPermssions = [];

      for (const document of transformedData) {
        const access: any =
          await this.documentsService.checkPermissionsForPreviewPage(
            user,
            document.id,
          );
        const isUserCreator =
          await this.documentsService.checkIfUserCreatorForDocument(
            user,
            document.id,
          );
        if (
          user.kcRoles.roles.includes('ORG-ADMIN') ||
          access.access === true
        ) {
          documentsWithPermssions.push({
            ...document,
            access: access.access,
            isCreator: isUserCreator,
          });
        }
      }

      // promise: get total count of documents
      const totalCount = await this.prisma.documents.count({
        where: {
          system,
          organizationId: activeUser.organizationId,
          // deleted: false,
        },
      });

      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/systems/${system} service successful`,
        '',
      );

      return {
        data: documentsWithPermssions, // documents
        data_length: documentsWithPermssions.length, // total data return by the query
        total: totalCount, // total data for documents
        status: 200,
        message: 'success',
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/systems/${system}  service failed ${err}`,
        '',
      );
      throw new InternalServerErrorException(err);
    }
  }

  async findAllBydocumentsByEntity(
    filterObj: DashboardFilter,
    user,
    entityNew,
  ) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/entity/${entityNew} service started`,
        '',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      const skipValue = (filterObj.page - 1) * Number(filterObj.limit); // preprocess filter obj to make it usable by makeFilter helper
      const [filterObjPreprocessedAND, filterObjPreprocessedOR] =
        QueryFilterPreprocessing(filterObj); // relation map used to make the query
      const relationMapAND: IRelationMap = getRelationshipMap(
        filterObjPreprocessedAND,
      );
      const relationMapOR: IRelationMap = getRelationshipMap(
        filterObjPreprocessedOR,
      ); // build query using preprocessed filter obj and relation map
      const relationFiltersAND = makeFilters<{
        [key: string]: any;
      }>(filterObjPreprocessedAND, relationMapAND);

      const relationFiltersOR = makeFilters<{
        [key: string]: any;
      }>(filterObjPreprocessedOR, relationMapOR);
      const filters = {}; // AND operation
      filters['AND'] = relationFiltersAND; // if search query is applied - OR operation
      if (relationFiltersOR.length > 0) filters['OR'] = relationFiltersOR; // promise: get all the documents - applied filters if any

      const entity = await this.prisma.entity.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          id: entityNew,
          // deleted: false,
        },
      });
      // promise: get all the documents - applied filters if any
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(filterObj.limit),
        where: {
          entityId: entity.id,
          AND: [
            {
              ...filters,
              organizationId: activeUser.organizationId,
              //deleted: false,
            },
          ],
        },
        include: {
          creatorEntity: true,
          doctype: true,
          creatorLocation: true,
        },
      });

      const transformedData = filteredDocuments.map((document) => ({
        id: document.id,
        documentNumbering: document.documentNumbering,
        documentName: document.documentName,
        documentType: document.doctype.documentTypeName,
        version: document.currentVersion,
        status: document.documentState,
        department: document.creatorEntity.entityName,
        location: document.creatorLocation.locationName,
      }));

      const documentsWithPermssions = [];

      for (const document of transformedData) {
        const access =
          await this.documentsService.checkPermissionsForPreviewPage(
            user,
            document.id,
          );
        const isUserCreator =
          await this.documentsService.checkIfUserCreatorForDocument(
            user,
            document.id,
          );
        if (
          user.kcRoles.roles.includes('ORG-ADMIN') ||
          access.access === true
        ) {
          documentsWithPermssions.push({
            ...document,
            access: access.access,
            isCreator: isUserCreator,
          });
        }
      }

      // promise: get total count of documents
      const totalCount = await this.prisma.documents.count({
        where: {
          entityId: entity.id,
          organizationId: activeUser.organizationId,
          //deleted: false,
        },
      });
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/entity/${entityNew} service successful`,
        '',
      );
      return {
        data: documentsWithPermssions, // documents
        data_length: documentsWithPermssions.length, // total data return by the query
        total: totalCount, // total data for documents
        status: 200,
        message: 'success',
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/entity/${entityNew}  service failed ${err}`,
        '',
      );
      throw new InternalServerErrorException(err);
    }
  }

  async findAllBydocumentsByEntityAndSystem(
    filterObj: DashboardFilter,
    user,
    entityNew,
    system,
  ) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/findAllByDocumentsByEntityandSystem/${entityNew}/${system} service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const skipValue = (filterObj.page - 1) * Number(filterObj.limit); // preprocess filter obj to make it usable by makeFilter helper
      const [filterObjPreprocessedAND, filterObjPreprocessedOR] =
        QueryFilterPreprocessing(filterObj); // relation map used to make the query
      const relationMapAND: IRelationMap = getRelationshipMap(
        filterObjPreprocessedAND,
      );
      const relationMapOR: IRelationMap = getRelationshipMap(
        filterObjPreprocessedOR,
      ); // build query using preprocessed filter obj and relation map
      const relationFiltersAND = makeFilters<{
        [key: string]: any;
      }>(filterObjPreprocessedAND, relationMapAND);

      const relationFiltersOR = makeFilters<{
        [key: string]: any;
      }>(filterObjPreprocessedOR, relationMapOR);
      const filters = {}; // AND operation
      filters['AND'] = relationFiltersAND; // if search query is applied - OR operation
      if (relationFiltersOR.length > 0) filters['OR'] = relationFiltersOR; // promise: get all the documents - applied filters if any

      const entity = await this.prisma.entity.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          id: entityNew,
        },
      });

      // promise: get all the documents - applied filters if any
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(filterObj.limit),
        where: {
          entityId: entity.id,
          system: system,
          AND: [
            {
              ...filters,
              organizationId: activeUser.organizationId,
              // deleted: false,
            },
          ],
        },
        include: {
          creatorEntity: true,
          doctype: true,
          creatorLocation: true,
        },
      });

      const transformedData = filteredDocuments.map((document) => ({
        id: document.id,
        documentNumbering: document.documentNumbering,
        documentName: document.documentName,
        documentType: document.doctype.documentTypeName,

        version: document.currentVersion,
        status: document.documentState,
        department: document.creatorEntity.entityName,
        location: document.creatorLocation.locationName,
      }));

      const documentsWithPermssions = [];

      for (const document of transformedData) {
        const access =
          await this.documentsService.checkPermissionsForPreviewPage(
            user,
            document.id,
          );

        const isUserCreator =
          await this.documentsService.checkIfUserCreatorForDocument(
            user,
            document.id,
          );
        if (
          user.kcRoles.roles.includes('ORG-ADMIN') ||
          access.access === true
        ) {
          documentsWithPermssions.push({
            ...document,
            access: access.access,
            isCreator: isUserCreator,
          });
        }
      }

      // promise: get total count of documents
      const totalCount = await this.prisma.documents.count({
        where: {
          entityId: entity.id,
          system,
          organizationId: activeUser.organizationId,
          // deleted: false,
        },
      });
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/findAllByDocumentsByEntityandSystem/${entityNew}/${system} service successful`,
        '',
      );
      return {
        data: documentsWithPermssions, // documents
        data_length: documentsWithPermssions.length, // total data return by the query
        total: totalCount, // total data for documents
        status: 200,
        message: 'success',
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/findAllByDocumentsByEntityandSystem/${entityNew}/${system}  service failed ${err}`,
        '',
      );
      throw new InternalServerErrorException(err);
    }
  }
  async findAllByFavorite(filterObj: DashboardFilter, user) {
    const randomNumber = uuid();

    // try {
    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/favorite service started`,
      '',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const skipValue = (filterObj.page - 1) * Number(filterObj.limit); // preprocess filter obj to make it usable by makeFilter helper

    const userInfo = await this.favoriteService.getFavoriteByUserId(
      activeUser.id,
    );

    if (!userInfo) {
      return {
        status: 200,
        message: 'No Favorites for this user',
      };
    } else {
      const result = [];
      try {
        const userInformation = await userInfo.map(async (value) => {
          result.push(value.id);
          return result;
        });
      } catch {
        return 'no favorites';
      }

      let whereCondition = {
        id: { in: result },
        // createdBy: activeUser.id,
        documentState: { notIn: ['RETIRE'] },
        organizationId: activeUser.organizationId,
      } as any;

      if (filterObj.documentTypes !== undefined) {
        if (filterObj?.documentTypes?.length > 0) {
          whereCondition = {
            ...whereCondition,
            docType: { in: filterObj?.documentTypes },
          };
        }
      }
      if (filterObj.system !== undefined) {
        if (filterObj?.system?.length > 0) {
          whereCondition = {
            ...whereCondition,
            system: { hasSome: filterObj?.system },
          };
        }
      }
      if (filterObj.documentStatus !== undefined) {
        if (filterObj?.documentStatus?.length > 0) {
          whereCondition = {
            ...whereCondition,
            documentState: { in: filterObj?.documentStatus },
          };
        }
      }
      if (filterObj.section !== undefined) {
        if (filterObj?.section?.length > 0) {
          whereCondition = {
            ...whereCondition,
            section: { in: filterObj?.section },
          };
        }
      }
      if (filterObj.dept !== undefined) {
        if (filterObj?.dept?.length > 0) {
          whereCondition = {
            ...whereCondition,
            entityId: { in: filterObj?.dept },
          };
        }
      }

      if (
        filterObj.searchQuery !== undefined &&
        filterObj.searchQuery !== 'undefined'
      ) {
        whereCondition = {
          ...whereCondition,
          OR: [
            {
              readAccess: {
                contains: filterObj.searchQuery,
                mode: 'insensitive',
              },
            },
            {
              docType: {
                contains: filterObj.searchQuery,
                mode: 'insensitive',
              },
            },
            // { department: { contains:filterObj.searchQuery,mode:'insensitive'  } },
            {
              currentVersion: {
                contains: filterObj.searchQuery,
                mode: 'insensitive',
              },
            },
            {
              documentState: {
                contains: filterObj.searchQuery,
                mode: 'insensitive',
              },
            },
            {
              documentName: {
                contains: filterObj.searchQuery,
                mode: 'insensitive',
              },
            },
            {
              documentNumbering: {
                contains: filterObj.searchQuery,
                mode: 'insensitive',
              },
            },
          ],
        };
      }

      // promise: get all the documents - applied filters if any
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(filterObj.limit),
        where: whereCondition,
        include: {
          creatorEntity: true,
          doctype: true,
          creatorLocation: true,
        },
      });

      const transformedData = filteredDocuments.map((document) => ({
        id: document.id,
        documentNumbering: document.documentNumbering,
        documentName: document.documentName,
        documentType: document?.doctype?.documentTypeName || '',
        issueNumber: document.issueNumber,
        version: document.currentVersion,
        status: document.documentState,
        system: document.system,
        department: document.creatorEntity.entityName,
        location: document.creatorLocation.locationName,
        approvedDate: document.approvedDate,
        isVersion: document.isVersion,
        section: document.section,
      }));

      const documentsWithPermssions = [];

      for (let document of transformedData) {
        let [
          { editAcess, deleteAccess, readAccess },
          access,
          systemData,
          isUserCreator,
          section,
        ]: any = await Promise.all([
          this.accesforDocument(document.id, user),
          this.documentsService.checkPermissionsForPreviewPage(
            user,
            document.id,
          ),
          this.SystemModel.find({
            _id: document.system,
          }).select('name _id type'),
          this.documentsService.checkIfUserCreatorForDocument(
            user,
            document.id,
          ),
          document?.section !== null && document?.section !== undefined
            ? this.prisma.entity.findFirst({
                where: {
                  id: document.section,
                  organizationId: activeUser.organizationId,
                },
              })
            : null,
        ]);
        document = { ...document, system: systemData };
        documentsWithPermssions.push({
          ...document,
          access: access.access,
          isCreator: isUserCreator,
          editAcess,
          deleteAccess,
          readAccess,
          sectionName: section !== null ? section?.entityName : null,
        });
      }

      const totalCount = await this.prisma.documents.count({
        where: whereCondition,
      });
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/favorite service successful`,
        '',
      );
      return {
        data: documentsWithPermssions, // documents
        data_length: documentsWithPermssions.length, // total data return by the query
        total: totalCount, // total data for documents
        status: 200,
        message: 'success',
      };
    }
    // } catch (err) {
    //   this.logger.error(
    //     `trace id=${randomNumber} Get api/dashboard/favorite  service failed ${err}`,
    //     '',
    //   );
    //   throw new InternalServerErrorException(err);
    // }
  }
  async findAllBydocuments(filterObj: DashboardFilter, user) {
    const randomNumber = uuid();

    // try {
    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/mydocuments service started`,
      '',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const skipValue = (filterObj.page - 1) * Number(filterObj.limit); // preprocess filter obj to make it usable by makeFilter helper

    // Extract unique documentIds using a Set

    // Convert Set back to an array if needed

    let whereCondition = {
      // AdditionalDocumentAdmins: { some: { userId: activeUser.id } },

      // id: { in: uniqueDocumentIdsArray },
      OR: [
        { creators: { has: activeUser?.id } },
        { reviewers: { has: activeUser?.id } },
        { approvers: { has: activeUser?.id } },
      ],
      organizationId: activeUser.organizationId,
      // createdBy:activeUser?.id,
      countNumber: 1,
      documentState: { notIn: ['RETIRE'] },
    } as any;

    // const addids = await this.prisma.additionalDocumentAdmins.findMany({
    //   where: { userId: activeUser.id },
    //   select: { documentId: true },
    // });

    // Extract unique documentIds using a Set
    // const uniqueDocumentIds = new Set(
    //   addids.map((entry) =>
    //     entry.documentId !== null ? entry.documentId : '',
    //   ),
    // );

    // Convert Set back to an array if needed
    // const uniqueDocumentIdsArray = Array.from(uniqueDocumentIds);

    // let whereCondition = {
    //   // AdditionalDocumentAdmins: { some: { userId: activeUser.id } },

    //   id: { in: uniqueDocumentIdsArray },
    //   organizationId: activeUser.organizationId,
    //   countNumber: 1,
    //   documentState: { notIn: ['RETIRE'] },
    // } as any;

    if (filterObj.dept !== undefined) {
      if (filterObj.dept.length > 0) {
        whereCondition = {
          ...whereCondition,
          entityId: { in: filterObj.dept },
        };
      }
    }

    if (filterObj.loc !== undefined) {
      if (filterObj.loc.length > 0) {
        whereCondition = {
          ...whereCondition,
          locationId: { in: filterObj.loc },
        };
      }
    }
    if (filterObj.documentTypes !== undefined) {
      if (filterObj?.documentTypes?.length > 0) {
        whereCondition = {
          ...whereCondition,
          docType: { in: filterObj?.documentTypes },
        };
      }
    }
    if (filterObj.system !== undefined) {
      if (filterObj?.system?.length > 0) {
        whereCondition = {
          ...whereCondition,
          system: { hasSome: filterObj?.system },
        };
      }
    }
    if (filterObj.documentStatus !== undefined) {
      if (filterObj?.documentStatus?.length > 0) {
        whereCondition = {
          ...whereCondition,
          documentState: { in: filterObj?.documentStatus },
        };
      }
    }

    if (filterObj.dept !== undefined) {
      if (filterObj?.dept?.length > 0) {
        whereCondition = {
          ...whereCondition,
          entityId: { in: filterObj?.dept },
        };
      }
    }

    if (filterObj.section !== undefined) {
      if (filterObj?.section?.length > 0) {
        whereCondition = {
          ...whereCondition,
          section: { in: filterObj?.section },
        };
      }
    }

    if (filterObj.role !== undefined) {
      if (filterObj?.role?.length > 0) {
        whereCondition = {
          ...whereCondition,
          AdditionalDocumentAdmins: {
            some: { type: { in: filterObj?.role }, userId: activeUser.id },
          },
        };
      }
    }

    if (
      filterObj.searchQuery !== undefined &&
      filterObj.searchQuery !== 'undefined'
    ) {
      whereCondition = {
        ...whereCondition,
        OR: [
          {
            readAccess: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            docType: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            currentVersion: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            documentState: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            documentName: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            documentNumbering: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      };
    }
    const filteredDocuments: any = await this.prisma.documents.findMany({
      skip: skipValue,
      take: Number(filterObj.limit),
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        creatorEntity: true,
        doctype: true,
        creatorLocation: true,
        AdditionalDocumentAdmins: {
          select: { type: true, userId: true, id: true },
        },
      },
    });
    const transformedData = [];

    for (let document of filteredDocuments) {
      const rolesForDocument = document.AdditionalDocumentAdmins.filter(
        (value) => {
          if (activeUser.id === value.userId) {
            return { type: value.type, id: value.id };
          }
        },
      );
      let [
        { editAcess, deleteAccess, readAccess },
        systemData,
        access,
        isUserCreator,
        section,
        documents,
      ]: any = await Promise.all([
        this.accesforDocument(document.id, user),
        this.SystemModel.find({
          _id: document.system,
        }).select('name _id type'),
        this.documentsService.checkPermissionsForPreviewPage(user, document.id),
        this.documentsService.checkIfUserCreatorForDocument(user, document.id),
        document?.section !== null && document?.section !== undefined
          ? this.prisma.entity.findFirst({
              where: {
                organizationId: activeUser.organizationId,
                id: document?.section,
              },
            })
          : null,

        this.prisma.documents.findMany({
          where: {
            documentId: document.id,
            // deleted: false,
          },
          include: {
            creatorLocation: true,
            doctype: true,
            creatorEntity: true,
          },
        }),
      ]);

      document = {
        id: document.id,
        documentNumbering: document.documentNumbering,
        documentName: document.documentName,
        documentType: document?.doctype?.documentTypeName || '',
        issueNumber: document.issueNumber,
        version: document.currentVersion,
        status: document.documentState,
        system: document.system,
        department: document.creatorEntity?.entityName,
        location: document.creatorLocation?.locationName,
        approvedDate: document.approvedDate,
        type: rolesForDocument,
        isVersion: document.isVersion,
        section: document.section,
        editAcess: editAcess,
        deleteAccess,
        access: access.access,
      };
      document = await this.filteredVersionDoc(
        {
          ...document,
        },
        user,
        documents,
      );
      document = { ...document, system: systemData };
      transformedData.push({
        ...document,

        sectionName: section === null ? null : section.entityName,
        isCreator: isUserCreator,
        readAccess,
      });
    }
    const loopEndTime = Date.now();

    const totalCount = await this.prisma.documents.count({
      where: whereCondition,
    });
    const endTime = Date.now();

    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/mydocuments service successful`,
      '',
    );
    return {
      data: transformedData, // documents
      data_length: transformedData.length, // total data return by the query
      total: totalCount, // total data for documents
      status: 200,
      message: 'success',
    };
    // } catch (err) {
    //   this.logger.error(
    //     `trace id=${randomNumber} Get api/dashboard/mydocuments  service failed ${err}`,
    //     '',
    //   );
    //   throw new InternalServerErrorException(err);
    // }
  }

  async findAllMyDistributeddocuments(filterObj: DashboardFilter, user) {
    const randomNumber = uuid();

    // try {
    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/myDistributedDocuments service started`,
      '',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const skipValue = (filterObj.page - 1) * Number(filterObj.limit); // preprocess filter obj to make it usable by

    let whereCondition: any = {
      $and: [
        { organizationId: activeUser.organizationId },
        { documentState: 'PUBLISHED' },
        {
          $or: [
            {
              distributionList: 'All Users',
            },
            {
              $and: [
                { distributionList: 'All in Units(S)' },
                { 'distributionUsers.id': { $in: [activeUser?.locationId] } },
              ],
            },
            {
              $and: [
                { distributionList: 'All in Department(S)' },
                { 'distributionUsers.id': { $in: [activeUser?.entityId] } },
              ],
            },
            {
              $and: [
                { distributionList: 'Selected Users' },
                { 'distributionUsers.id': { $in: [activeUser?.id] } },
              ],
            },

            {
              $and: [
                { distributionList: 'Respective Department' },
                { 'distributionUsers.id': { $in: [activeUser?.entityId] } },
              ],
            },
            {
              $and: [
                { distributionList: 'Respective Unit' },
                { 'distributionUsers.id': { $in: [activeUser?.locationId] } },
              ],
            },
          ],
        },
        // { deleted: false }, // Uncomment if needed
      ],
    };

    // Using the query in Mongoose

    if (filterObj.documentTypes !== undefined) {
      if (filterObj?.documentTypes?.length > 0) {
        whereCondition = {
          ...whereCondition,
          docType: { $in: filterObj?.documentTypes },
        };
      }
    }
    if (filterObj.system !== undefined) {
      if (filterObj?.system?.length > 0) {
        whereCondition = {
          ...whereCondition,
          system: { $in: filterObj?.system },
        };
      }
    }

    if (filterObj.section !== undefined) {
      if (filterObj?.section?.length > 0) {
        whereCondition = {
          ...whereCondition,
          section: { $in: filterObj?.section },
        };
      }
    }
    if (filterObj.documentStatus !== undefined) {
      if (filterObj?.documentStatus?.length > 0) {
        whereCondition = {
          ...whereCondition,
          documentState: { $in: filterObj?.documentStatus },
        };
      }
    }

    if (filterObj.dept !== undefined) {
      if (filterObj?.dept?.length > 0) {
        whereCondition = {
          ...whereCondition,
          entityId: { $in: filterObj?.dept },
        };
      }
    }
    if (
      filterObj.searchQuery !== undefined &&
      filterObj.searchQuery !== 'undefined'
    ) {
      whereCondition.$or = [
        // ...whereCondition.$or,
        { readAccess: { $regex: filterObj.searchQuery, $options: 'i' } },
        { docType: { $regex: filterObj.searchQuery, $options: 'i' } },
        { currentVersion: { $regex: filterObj.searchQuery, $options: 'i' } },
        { documentState: { $regex: filterObj.searchQuery, $options: 'i' } },
        { documentName: { $regex: filterObj.searchQuery, $options: 'i' } },
        {
          documentNumbering: { $regex: filterObj.searchQuery, $options: 'i' },
        },
      ];
    }

    const client = new MongoClient(process.env.MONGO_DB_URI1);
    const dbname = process.env.MONGO_DB_URI.split('/');

    const db = client.db(process.env.MONGO_DB_NAME);
    // db.Documents.find({})
    // console.log("whereCondition",whereCondition.$or)
    const cursor = db
      .collection('Documents')
      .find(whereCondition)
      .sort({ createdAt: -1 }) // Adjust this based on your requirement

      .skip(skipValue)
      .limit(filterObj.limit);
    const filteredDocuments = await cursor.toArray();

    // const filteredDocuments = await this.prisma.documents.findMany({
    //   skip: skipValue,
    //   take: Number(filterObj.limit),
    //   where: whereCondition,
    //   orderBy: { createdAt: 'desc' },

    //   include: {
    //     creatorEntity: true,
    //     doctype: true,
    //     creatorLocation: true,
    //   },
    // });
    const transformedData = [];

    for (let document of filteredDocuments) {
      let [
        { editAcess, deleteAccess, readAccess },
        isUserCreator,
        access,
        systemData,
        section,
        location,
        doctype,
        entity,
      ]: any = await Promise.all([
        this.accesforDocument(document.id, user),
        this.documentsService.checkIfUserCreatorForDocument(
          user,
          document?._id,
        ),
        this.documentsService.checkPermissionsForPreviewPage(
          user,
          document?._id,
        ),
        this.SystemModel.find({
          _id: document.system,
        }).select('name _id type'),
        document?.section !== null && document?.section !== undefined
          ? this.prisma.entity.findFirst({
              where: {
                organizationId: activeUser.organizationId,
                id: document.section,
              },
            })
          : null,
        this.prisma.location.findUnique({
          where: { id: document?.locationId },
        }),
        this.prisma.doctype.findUnique({
          where: { id: document?.doctypeId || '' },
        }),
        this.prisma.entity.findUnique({ where: { id: document?.entityId } }),
      ]);
      const data = {
        id: document?._id,
        documentNumbering: document?.documentNumbering,
        sectionName: section !== null ? section.entityName : null,
        documentName: document?.documentName,
        documentType: doctype?.documentTypeName || '',
        issueNumber: document?.issueNumber,
        version: document?.currentVersion,
        status: document?.documentState,
        department: entity?.entityName,
        location: location?.locationName,
        distributionList: document?.distributionList,
        distributionUsers: document?.distributionUsers,
        access: access?.access,
        isCreator: isUserCreator,
        system: systemData,
        editAcess,
        approvedDate: document?.approvedDate,
      };
      transformedData.push(data);
    }

    const totalCount = await db.collection('Documents').count(whereCondition);

    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/myDistributedDocuments service successful`,
      '',
    );

    return {
      data: transformedData, // documents
      data_length: transformedData.length, // total data return by the query
      total: totalCount, // total data for documents
      status: 200,
      message: 'success',
    };
    // } catch (err) {
    //   this.logger.error(
    //     `trace id=${randomNumber} Get api/dashboard/myDistributedDocuments  service failed ${err}`,
    //     '',
    //   );
    //   throw new InternalServerErrorException(err);
    // }
  }

  async findWorkFlowdocuments(filterObj: DashboardFilter, user) {
    const randomNumber = uuid();

    // try {
    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/workFlowDocuments service started`,
      '',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    const skipValue = (filterObj.page - 1) * Number(filterObj.limit); // preprocess filter obj to make it usable by makeFilter helper

    let whereCondition = {
      AND: [
        {
          organizationId: activeUser.organizationId,
          // deleted: false,
        },
        {
          documentState: {
            in: [
              'DRAFT',
              'IN_REVIEW',
              'IN_APPROVAL',
              // 'PUBLISHED',
              'SEND_FOR_EDIT',
            ],
          },
        },
      ],
    } as any;

    if (
      user.kcRoles?.roles?.includes('ORG-ADMIN') ||
      user.kcRoles?.roles?.includes('MR')
    ) {
      whereCondition = {
        ...whereCondition,
        locationId: activeUser?.locationId,
        // entityId: activeUser.entityId,
      };
    } else {
      let location;
      if (activeUser.userType !== 'globalRoles') {
        whereCondition = {
          ...whereCondition,
          locationId: activeUser?.locationId,
          entityId: activeUser?.entityId,
        };
      } else {
        if (activeUser?.additionalUnits?.includes?.('All')) {
          whereCondition = {
            ...whereCondition,
          };
        } else {
          whereCondition = {
            ...whereCondition,
            locationId: {
              in: activeUser?.additionalUnits || [],
            },
          };
        }
      }
    }
    if (filterObj.dept !== undefined) {
      if (filterObj.dept.length > 0) {
        whereCondition = {
          ...whereCondition,
          entityId: { in: filterObj.dept },
        };
      }
    }
    if (filterObj.documentTypes !== undefined) {
      if (filterObj?.documentTypes?.length > 0) {
        whereCondition = {
          ...whereCondition,
          docType: { in: filterObj?.documentTypes },
        };
      }
    }
    if (filterObj.system !== undefined) {
      if (filterObj?.system?.length > 0) {
        whereCondition = {
          ...whereCondition,
          system: { hasSome: filterObj?.system },
        };
      }
    }
    if (filterObj.section !== undefined) {
      if (filterObj?.section?.length > 0) {
        whereCondition = {
          ...whereCondition,
          section: { in: filterObj?.section },
        };
      }
    }
    if (filterObj.documentStatus !== undefined) {
      if (filterObj?.documentStatus?.length > 0) {
        whereCondition = {
          ...whereCondition,
          documentState: { in: filterObj?.documentStatus },
        };
      }
    }

    if (filterObj.dept !== undefined) {
      if (filterObj?.dept?.length > 0) {
        whereCondition = {
          ...whereCondition,
          entityId: { in: filterObj?.dept },
        };
      }
    }
    if (
      filterObj.searchQuery !== undefined &&
      filterObj.searchQuery !== 'undefined'
    ) {
      whereCondition = {
        ...whereCondition,
        OR: [
          {
            readAccess: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            docType: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          // { department: { contains:filterObj.searchQuery,mode:'insensitive'  } },
          {
            currentVersion: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            documentState: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            documentName: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
          {
            documentNumbering: {
              contains: filterObj.searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      };
    }
    // console.log('where condition in findworkflowdocuments', whereCondition);
    const filteredDocuments = await this.prisma.documents.findMany({
      skip: skipValue,
      take: Number(filterObj.limit),
      where: whereCondition,
      orderBy: { createdAt: 'desc' },

      include: {
        creatorEntity: true,
        doctype: true,
        creatorLocation: true,
        AdditionalDocumentAdmins: true,
      },
    });

    const transformedData = filteredDocuments.map((document) => {
      let pendingWith;
      if (document.documentState === 'DRAFT') {
        pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
          if (value.type === 'CREATOR') {
            return value;
          }
        });
      } else if (document.documentState === 'IN_REVIEW') {
        pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
          if (value.type === 'REVIEWER') {
            return value;
          }
        });
      } else if (document.documentState === 'IN_APPROVAL') {
        pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
          if (value.type === 'APPROVER') {
            return value;
          }
        });
      } else if (document.documentState === 'SEND_FOR_EDIT') {
        pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
          if (value.type === 'CREATOR') {
            return value;
          }
        });
      }
      return {
        id: document.id,
        documentNumbering: document?.documentNumbering,
        documentName: document?.documentName,
        documentType: document?.doctype?.documentTypeName || '',
        issueNumber: document?.issueNumber,
        version: document?.currentVersion,
        status: document?.documentState,
        system: document?.system,
        department: document?.creatorEntity?.entityName,
        location: document?.creatorLocation?.locationName,
        distributionList: document?.distributionList,
        distributionUsers: document?.distributionUsers,
        approvedDate: document?.approvedDate,
        isVersion: document?.isVersion,
        pendingWith,
        section: document?.section,
      };
    });

    const documentsWithPermssions = [];

    for (let document of transformedData) {
      let [
        systemData,
        access,
        isUserCreator,
        { editAcess, deleteAccess, readAccess },
        section,
      ]: any = await Promise.all([
        this.SystemModel.find({
          _id: document.system,
        }).select('name _id type'),
        this.documentsService.checkPermissionsForPreviewPage(user, document.id),
        this.documentsService.checkIfUserCreatorForDocument(user, document.id),
        this.accesforDocument(document.id, user),
        document?.section !== null && document?.section !== undefined
          ? this.prisma.entity.findFirst({
              where: {
                organizationId: activeUser.organizationId,
                id: document.section,
              },
            })
          : null,
      ]);

      document = { ...document, system: systemData };
      if (user.kcRoles?.roles?.includes('ORG-ADMIN')) {
        documentsWithPermssions.push({
          ...document,
          access: true,
          isCreator: true,
          editAcess,
          deleteAccess,
          readAccess,
          sectionName: section !== null ? section.entityName : null,
        });
      } else {
        documentsWithPermssions.push({
          ...document,
          access: access?.access,
          isCreator: isUserCreator,
          editAcess,
          deleteAccess,
          readAccess,
          sectionName: section !== null ? section.entityName : null,
        });
      }
    }
    // }

    const totalCount = await this.prisma.documents.count({
      where: whereCondition,
    });
    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/workFlowDocuments service successful`,
      '',
    );
    return {
      data: documentsWithPermssions, // documents
      data_length: documentsWithPermssions.length, // total data return by the query
      total: totalCount, // total data for documents
      status: 200,
      message: 'success',
    };
    // } catch (err) {
    //   this.logger.error(
    //     `trace id=${randomNumber} Get api/dashboard/workFlowDocuments  service failed ${err}`,
    //     '',
    //   );
    //   throw new InternalServerErrorException(err);
    // }
  }
  async findAllBySystem(user) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/systemchart service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const allDocuments = await this.prisma.documents.findMany({
        where: {
          organizationId: activeUser.organizationId,
          // deleted: false,
        },
      });
      let allSystemData = [];
      for (const document of allDocuments as any[]) {
        const systemData = await this.SystemModel.findById(
          document.system,
        ).select('name _id type');
        allSystemData.push(systemData);
      }
      const countSystemOccurrences = (data: any) => {
        // Construct an object where keys are system names and values are counts
        const countMap: { [key: string]: number } = {};

        data.forEach((item) => {
          if (countMap[item.name]) {
            countMap[item.name] += 1;
          } else {
            countMap[item.name] = 1;
          }
        });

        // Convert the countMap into labels and datasets for the graph
        const graphData = {
          labels: Object.keys(countMap),
          datasets: Object.values(countMap),
        };
        this.logger.log(
          `trace id=${randomNumber} Get api/dashboard/systemchart service successful`,
          '',
        );
        return graphData;
      };
      return countSystemOccurrences(allSystemData);
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/systemchart  service failed ${err}`,
        '',
      );
    }
  }

  async findAllMyDistributeddocumentsWithoutPagination(user) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/myAllDistributedDocuments service started`,
        '',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      // promise: get all the documents - applied filters if any
      const filteredDocuments = await this.prisma.documents.findMany({
        where: {
          organizationId: activeUser.organizationId,
          documentState: 'PUBLISHED',
          //deleted: false,
        },
        include: {
          creatorEntity: {
            select: {
              entityName: true,
              id: true,
            },
          },
          doctype: {
            select: {
              documentTypeName: true,
              id: true,
            },
          },
          creatorLocation: {
            select: {
              locationName: true,
              id: true,
            },
          },
        },
      });

      const transformedData = filteredDocuments.map((document) => ({
        id: document.id,
        documentNumbering: document.documentNumbering,
        documentName: document.documentName,
        documentType: document.doctype.documentTypeName,
        issueNumber: document.issueNumber,
        version: document.currentVersion,
        status: document.documentState,
        department: document.creatorEntity.entityName,
        location: document.creatorLocation.locationName,
        distributionList: document.distributionList,
        distributionUsers: document.distributionUsers,
        isVersion: document.isVersion,
      }));

      const documentsWithPermssions = [];
      for (const document of transformedData) {
        const { editAcess, deleteAccess, readAccess } =
          await this.accesforDocument(document.id, user);

        let store = false;
        if (document.distributionList === 'All Users') {
          store = true;
        } else if (document.distributionList === 'All in Units(S)') {
          const unit = document?.distributionUsers?.map(
            (value: any) => value.id,
          );
          if (unit.includes(activeUser.locationId)) {
            store = true;
          }
        } else if (document.distributionList === 'All in Department(S)') {
          const entity = document?.distributionUsers?.map(
            (value: any) => value.id,
          );
          if (entity.includes(activeUser.entityId)) {
            store = true;
          }
        } else if (document.distributionList === 'Selected Users') {
          const users = document?.distributionUsers?.map(
            (value: any) => value.id,
          );
          if (users.includes(activeUser.id)) {
            store = true;
          }
        }
        if (store) {
          const access =
            await this.documentsService.checkPermissionsForPreviewPage(
              user,
              document.id,
            );
          const isUserCreator =
            await this.documentsService.checkIfUserCreatorForDocument(
              user,
              document.id,
            );

          documentsWithPermssions.push({
            ...document,
            access: access,
            isCreator: isUserCreator,
            editAcess,
            deleteAccess,
            readAccess,
          });
        }
      }

      // promise: get total count of documents
      const totalCount = await this.prisma.documents.count({
        where: {
          createdBy: `${activeUser.firstname} ${activeUser.lastname}`,
          organizationId: activeUser.organizationId,
          // deleted: false,
        },
      });

      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/myAllDistributedDocuments service successful`,
        '',
      );

      return {
        data: documentsWithPermssions, // documents
        data_length: documentsWithPermssions.length, // total data return by the query
        total: totalCount, // total data for documents
        status: 200,
        message: 'success',
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/myAllDistributedDocuments  service failed ${err}`,
        '',
      );
      throw new InternalServerErrorException(err);
    }
  }

  async findAllChartData(orgId, queryParams, user) {
    const filterObj: any = {};
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/chart service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      // Check if queryParams.filter is truthy
      if (!!queryParams) {
        // Add properties to filterObj if they exist in queryParams
        if (queryParams.documentType) {
          filterObj.documentType = queryParams.documentType;
        }
        if (queryParams.documentStatus) {
          filterObj.documentStatus = JSON.parse(queryParams.documentStatus);
        }
        if (queryParams.system) {
          filterObj.system = queryParams.system;
        }
        if (queryParams.systems) {
          filterObj.system = queryParams.systems;
        }
        if (queryParams.department) {
          filterObj.department = queryParams.department;
        }
        if (queryParams.creator) {
          filterObj.creator = queryParams.creator;
        }
        if (queryParams.searchQuery) {
          filterObj.searchQuery = queryParams.searchQuery;
        }
        if (queryParams.locationId) {
          filterObj.locationId = queryParams.locationId;
        }
      }

      if (queryParams && queryParams.allDoc === 'true') {
        let resultingIds = [];
        let whereCondition: any = {};
        // Use the getTableQuery function to generate the MongoDB aggregation pipeline
        const aggregationPipeline = await getDocumentChartsQuery(
          activeUser.organizationId,
          filterObj,
        );

        // Use explain() to log the actual MongoDB query
        // Use the generated aggregation pipeline to fetch data
        const client = new MongoClient(process.env.MONGO_DB_URI1);
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        const documents = await db
          .collection('Documents')
          .aggregate(aggregationPipeline)
          .toArray();

        // Adjust the Prisma queries based on the fetched MongoDB documents
        const filteredDocumentIds = documents.map((doc) => doc._id);

        if (!!queryParams.filter) {
          resultingIds = filteredDocumentIds;
        }

        if (!!queryParams.filter) {
          whereCondition = {
            organizationId: activeUser.organizationId,
            // deleted: false,
            id: { in: filteredDocumentIds },
          };
        } else {
          whereCondition = {
            organizationId: activeUser.organizationId,
            //  deleted: false,
            id: { in: filteredDocumentIds },
          };
        }
        const docTypeChartResult = await this.prisma.documents.groupBy({
          by: ['docType'],
          where: {
            ...whereCondition,
            documentState: 'PUBLISHED',
          },
          _count: {
            _all: true,
          },
        });

        const docStateChartResult = await this.prisma.documents.groupBy({
          by: ['documentState'],
          where: {
            ...whereCondition,
            documentState: 'PUBLISHED',
          },
          _count: {
            _all: true,
          },
        });
        const systemWiseChartResultRaw = await this.prisma.documents.findMany({
          where: {
            ...whereCondition,
            documentState: 'PUBLISHED',
          },
          select: {
            system: true,
          },
        });

        // Create the necessary data structures for system chart
        const systemLabels = [];
        const systemCountData = [];

        // Fetch system names for all unique system IDs using the Prisma model
        const systems = await this.SystemModel.find({
          _id: { $in: systemWiseChartResultRaw.flatMap((doc) => doc.system) },
        }).exec();

        // Create a map to convert system IDs to system names
        const idToNameMap = new Map<string, string>();
        systems.forEach((system) => {
          idToNameMap.set(system.id, system.name);
        });

        // Create a map to count occurrences of each unique system combination (by name)
        const systemCombinationCounts = new Map<string, number>();

        systemWiseChartResultRaw.forEach((doc) => {
          // Convert system IDs to names, sort, and join to create a unique key for each combination
          const key = doc.system
            .map((id) => idToNameMap.get(id) || id)
            .sort()
            .join(',');

          // Count the occurrences for each combination
          systemCombinationCounts.set(
            key,
            (systemCombinationCounts.get(key) || 0) + 1,
          );
        });

        // Extract data for the system chart
        systemCombinationCounts.forEach((count, systemCombination) => {
          // Get the original system IDs for the given combination
          const systemIds = systemCombination.split(',').map((name) => {
            for (const [id, systemName] of idToNameMap) {
              if (systemName === name) {
                return id;
              }
            }
          });

          systemLabels.push({
            id: systemIds.join(','), // Use the original system IDs as the ID
            systemName: systemCombination, // Use the combined system names as the systemName
          });
          systemCountData.push(count);
        });

        const systemWiseChartDataNew = {
          labels: systemLabels,
          count: systemCountData,
        };

        const docTypeChartData = {
          labels: docTypeChartResult.map((result) => result.docType),
          count: docTypeChartResult.map((result) => result._count._all),
        };

        const docStateChartData = {
          labels: docStateChartResult.map((result) => result.documentState),
          count: docStateChartResult.map((result) => result._count._all),
        };

        return {
          docTypeChartData,
          docStateChartData,
          systemWiseChartData: systemWiseChartDataNew,
        };
      }

      if (queryParams && queryParams.allDoc === 'false') {
        let resultingIds = [];
        let whereCondition: any = {};
        // Use the getTableQuery function to generate the MongoDB aggregation pipeline
        const aggregationPipeline = await getDocumentChartsQuery(
          activeUser.organizationId,
          filterObj,
        );

        // Use explain() to log the actual MongoDB query

        // Use the generated aggregation pipeline to fetch data
        const client = new MongoClient(process.env.MONGO_DB_URI1);
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        const documents = await db
          .collection('Documents')
          .aggregate(aggregationPipeline)
          .toArray();

        // Adjust the Prisma queries based on the fetched MongoDB documents
        const filteredDocumentIds = documents.map((doc) => doc._id);

        if (!!queryParams.filter) {
          resultingIds = filteredDocumentIds;
        }

        if (!!queryParams.filter) {
          whereCondition = {
            organizationId: activeUser.organizationId,
            AdditionalDocumentAdmins: { some: { userId: activeUser.id } },

            // deleted: false,
            id: { in: resultingIds },
          };
        } else {
          whereCondition = {
            organizationId: activeUser.organizationId,
            AdditionalDocumentAdmins: { some: { userId: activeUser.id } },
            // deleted: false,
          };
        }

        const docTypeChartResult = await this.prisma.documents.groupBy({
          by: ['docType'],
          where: {
            ...whereCondition,
          },
          _count: {
            _all: true,
          },
        });

        const docStateChartResult = await this.prisma.documents.groupBy({
          by: ['documentState'],
          where: {
            ...whereCondition,
          },
          _count: {
            _all: true,
          },
        });

        const systemWiseChartResultRaw = await this.prisma.documents.findMany({
          where: {
            ...whereCondition,
          },
          select: {
            system: true,
          },
        });

        // Create the necessary data structures for system chart
        const systemLabels = [];
        const systemCountData = [];

        // Fetch system names for all unique system IDs using the Prisma model
        const systems = await this.SystemModel.find({
          _id: { $in: systemWiseChartResultRaw.flatMap((doc) => doc.system) },
        }).exec();

        // Create a map to convert system IDs to system names
        const idToNameMap = new Map<string, string>();
        systems.forEach((system) => {
          idToNameMap.set(system.id, system.name);
        });

        // Create a map to count occurrences of each unique system combination (by name)
        const systemCombinationCounts = new Map<string, number>();

        systemWiseChartResultRaw.forEach((doc) => {
          // Convert system IDs to names, sort, and join to create a unique key for each combination
          const key = doc.system
            .map((id) => idToNameMap.get(id) || id)
            .sort()
            .join(',');

          // Count the occurrences for each combination
          systemCombinationCounts.set(
            key,
            (systemCombinationCounts.get(key) || 0) + 1,
          );
        });

        // Extract data for the system chart
        systemCombinationCounts.forEach((count, systemCombination) => {
          // Get the original system IDs for the given combination
          const systemIds = systemCombination.split(',').map((name) => {
            for (const [id, systemName] of idToNameMap) {
              if (systemName === name) {
                return id;
              }
            }
          });

          systemLabels.push({
            id: systemIds.join(','), // Use the original system IDs as the ID
            systemName: systemCombination, // Use the combined system names as the systemName
          });
          systemCountData.push(count);
        });

        const systemWiseChartDataNew = {
          labels: systemLabels,
          count: systemCountData,
        };

        const docTypeChartData = {
          labels: docTypeChartResult.map((result) => result.docType),
          count: docTypeChartResult.map((result) => result._count._all),
        };

        const docStateChartData = {
          labels: docStateChartResult.map((result) => result.documentState),
          count: docStateChartResult.map((result) => result._count._all),
        };

        return {
          docTypeChartData,
          docStateChartData,
          systemWiseChartData: systemWiseChartDataNew,
        };
      }

      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/chart service successful`,
        '',
      );
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/chart  service failed ${err}`,
        '',
      );
    }
  }

  async documentFilterList(user, filter, data) {
    const randomNumber = uuid();
    try {
      const { location } = data;

      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/documentFilterList/{filter} service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      //check if user has globarol then assign his location to the loc filter

      let whereCondition: any = { organizationId: activeUser.organizationId };
      if (filter === 'myDoc') {
        const documentIds: any =
          await this.prisma.additionalDocumentAdmins.findMany({
            where: { userId: activeUser.id },
            select: { documentId: true },
          });
        const docIds = await documentIds
          ?.map((value) => value?.documentId)
          .filter((value) => value !== null);
        whereCondition = { ...whereCondition, id: { in: docIds } };
      } else if (filter === 'myFavDocs') {
        const userInfo = await this.favoriteService.getFavoriteByUserId(
          activeUser.id,
        );
        const docIds = userInfo.map((value) => value.id);
        whereCondition = { ...whereCondition, id: { in: docIds } };
      } else if (filter === 'distributedDoc') {
        whereCondition = {
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
          AND: [
            // Uncomment if organizationId and documentState filters are needed
            // { organizationId: activeUser.organizationId },
            // { documentState: 'PUBLISHED' },
            {
              OR: [
                {
                  distributionList: 'All Users',
                },
                {
                  AND: [
                    { distributionList: 'All in Units(S)' },
                    {
                      distributionUsers: { hasSome: [activeUser?.locationId] },
                    },
                  ],
                },
                {
                  AND: [
                    { distributionList: 'All in Department(S)' },
                    { distributionUsers: { hasSome: [activeUser?.entityId] } },
                  ],
                },
                {
                  AND: [
                    { distributionList: 'Selected Users' },
                    { distributionUsers: { hasSome: [activeUser?.id] } },
                  ],
                },
                {
                  AND: [
                    { distributionList: 'Respective Department' },
                    { distributionUsers: { hasSome: [activeUser?.entityId] } },
                  ],
                },
                {
                  AND: [
                    { distributionList: 'Respective Unit' },
                    {
                      distributionUsers: { hasSome: [activeUser?.locationId] },
                    },
                  ],
                },
              ],
            },
            // Uncomment if needed
            // { deleted: false },
          ],
        };
      } else if (filter === 'inWorkflow') {
        // console.log('inside workflow');
        whereCondition = {
          ...whereCondition,
          documentState: {
            in: [
              'DRAFT',
              'IN_REVIEW',
              'IN_APPROVAL',
              // 'PUBLISHED',
              'SEND_FOR_EDIT',
            ],
          },
        };
        if (
          user.kcRoles?.roles?.includes('ORG-ADMIN') ||
          user.kcRoles?.roles?.includes('MR')
        ) {
          whereCondition = {
            ...whereCondition,
            locationId: activeUser.locationId,
            // entityId: activeUser.entityId,
          };
        } else {
          let loc;
          if (activeUser.userType === 'globalRoles') {
            //if he manages all locations then set location to first from all loc of org else set to first in his additionalunits

            const locations = await this.prisma.location.findMany({
              where: {
                organizationId: activeUser.organizationId,
              },
            });
            if (activeUser?.additionalUnits?.includes('All')) {
              whereCondition = {
                ...whereCondition,
              };
            } else {
              whereCondition = {
                ...whereCondition,
                locationId: {
                  in: activeUser?.additionalUnits || [], // Ensure it's an array, fallback to empty array if undefined
                },
              };
            }
          } else {
            whereCondition = {
              ...whereCondition,
              locationId: location,
              entityId: activeUser.entityId ? activeUser.entityId : undefined,
            };
          }
        }
      } else if (filter === 'allDoc') {
        if (activeUser.userType === 'globalRoles') {
          // console.log('inside allDoc');
          if (activeUser.additionalUnits?.includes('All')) {
            whereCondition = {
              ...whereCondition,
            };
          } else {
            whereCondition = {
              ...whereCondition,
              locationId: { in: activeUser.additionalUnits },
            };
          }
        } else {
          if (location !== 'All') {
            whereCondition = { ...whereCondition, locationId: location };
          }
        }
      }
      // console.log('allDoc', filter, whereCondition);
      const finalData = await this.prisma.documents.findMany({
        where: whereCondition,
        // select: { doctypeId: true, system: true, documentState: true },
        include: { creatorEntity: true, creatorLocation: true },
      });
      // console.log('finaldata', finalData);
      let systemData = [];

      const entities = finalData?.map((value) => {
        return {
          id: value?.creatorEntity?.id || '',
          name: value?.creatorEntity?.entityName || '',
        };
      });

      const uniqueEntities = entities.filter(
        (obj, index, self) => index === self.findIndex((t) => t.id === obj.id),
      );

      uniqueEntities.sort((a: any, b: any) =>
        a?.name.toLowerCase().localeCompare(b?.name.toLowerCase()),
      );
      const locations = finalData?.map((value) => {
        return {
          id: value.creatorLocation?.id,
          name: value.creatorLocation?.locationName,
        };
      });
      const uniqueLocations = locations.filter(
        (obj, index, self) => index === self.findIndex((t) => t.id === obj.id),
      );

      uniqueLocations.sort((a: any, b: any) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
      let docTypeIds = finalData
        ?.map((value) => value.doctypeId)
        .filter((item) => item !== null);
      let status = finalData.map((value) => value.documentState);

      const sectionIds = finalData?.map((value) => value.section);

      const sectionUniqueData = [
        ...new Set(
          sectionIds.filter(
            (item) =>
              item !== undefined &&
              item !== null &&
              item.trim() !== '' &&
              item !== 'null',
          ),
        ),
      ];

      let sectionData: any = await this.prisma.entity.findMany({
        where: { id: { in: sectionUniqueData } },
        select: { entityName: true, id: true },
        orderBy: { entityName: 'asc' },
      });
      sectionData = sectionData?.map((item) => ({
        id: item.id,
        name: item.entityName,
      }));
      for (let value of finalData) {
        for (let system of value.system) {
          systemData.push(system);
        }
      }
      docTypeIds = docTypeIds?.filter((item) => item !== null);
      const doctypeData = await this.prisma.doctype.findMany({
        where: { id: { in: docTypeIds } },
        select: { documentTypeName: true },
        orderBy: { documentTypeName: 'asc' },
      });
      const finalDoctypeData = doctypeData.map(
        (value) => value?.documentTypeName || '',
      );

      finalDoctypeData.sort((a: any, b: any) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );
      const systemData1 = await this.SystemModel.find({
        _id: { $in: systemData },
      }).select('name');

      const finalSystem = systemData1.map((value) => {
        return { name: value.name, id: value.id };
      });
      finalSystem.sort((a: any, b: any) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase),
      );
      status = [...new Set(status)];

      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/documentFilterList/{filter} service successful`,
        '',
      );
      return {
        doctype: finalDoctypeData,
        system: finalSystem,
        status,
        entity: uniqueEntities,
        location: uniqueLocations,
        section: [
          ...sectionData,
          //  { id: '', name: 'None' }
        ],
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/documentFilterList/{filter}  service failed ${err}`,
        '',
      );
      throw new InternalServerErrorException(err);
    }
  }
  async accesforDocument(documentId, user) {
    let deleteAccess = false;
    let editAcess = false;
    let reviewersData = [],
      approversData = [];

    const [activeUser, documentData, additionalAdmins]: any = await Promise.all(
      [
        this.prisma.user.findFirst({
          where: { kcId: user.id },
        }),
        await this.prisma.documents.findFirst({
          where: { id: documentId },
        }),
        this.prisma.additionalDocumentAdmins.findMany({
          where: { documentId: documentId },
        }),
      ],
    );

    const reviewerdata = additionalAdmins.map((value) => {
      if (value.type === 'REVIEWER') {
        reviewersData.push(value);
      }
      if (value.type === 'APPROVER') {
        approversData.push(value);
      }
    });

    reviewersData = reviewersData.map((value) => value.userId);
    approversData = approversData.map((value) => value.userId);

    if (user.kcRoles?.roles?.includes('ORG-ADMIN')) {
      deleteAccess = true;
      editAcess = true;
    } else if (
      user?.kcRoles?.roles?.includes('MR') &&
      (documentData.locationId === activeUser.locationId ||
        activeUser?.additionalUnits?.includes(documentData.locationId))
    ) {
      deleteAccess = true;
      editAcess = true;
    } else if (
      (documentData.documentState === 'DRAFT' &&
        documentData.createdBy === activeUser.id) ||
      (documentData.documentState === 'SEND_FOR_EDIT' &&
        documentData.createdBy === activeUser.id)
    ) {
      editAcess = true;
      deleteAccess = true;
    } else if (
      documentData.documentState === 'IN_REVIEW' ||
      (documentData.documentState === 'RETIRE_INREVIEW' &&
        reviewersData.includes(activeUser.id))
    ) {
      deleteAccess = false;
      editAcess = true;
    } else if (
      documentData.documentState === 'IN_APPROVAL' ||
      (documentData.documentState === 'RETIRE_INAPPROVE' &&
        approversData.includes(activeUser.id))
    ) {
      deleteAccess = false;
      editAcess = true;
    } else if (
      documentData.documentState === 'PUBLISHED' &&
      documentData.locationId === activeUser.locationId &&
      // documentData.documentState === 'PUBLISHED' &&
      documentData.entityId === activeUser.entityId
    ) {
      deleteAccess = false;
      editAcess = true;
    } else {
      deleteAccess = false;
      editAcess = false;
    }

    return { deleteAccess, editAcess, readAccess: true };
  }

  async dashboardData(query, user) {
    const randomNumber = uuid();

    // try {
    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/dashboardData service started`,
      '',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });

    let [leaderBoradData, chartData, docType]: any = await Promise.all([
      this.leaderBoradData(activeUser, query),
      this.chartData(activeUser, query),
      this.docTypeData(activeUser),
    ]);
    this.logger.log(
      `trace id=${randomNumber} Get api/dashboard/dashboardData service successful`,
      '',
    );

    return { leaderBoard: leaderBoradData, chartData, docTypeData: docType };
    // } catch (err) {
    //   this.logger.error(
    //     `trace id=${randomNumber} Get api/dashboard/dashboardData  service failed ${err}`,
    //     '',
    //   );
    // }
  }

  async docTypeData(activeUser): Promise<any> {
    try {
      const [data, draftData, publishedData]: any = await Promise.all([
        this.prisma.documents.groupBy({
          by: ['doctypeId', 'locationId', 'entityId'],
          _count: { id: true },
          where: {
            organizationId: activeUser.organizationId,
            documentState: { notIn: ['DRAFT', 'PUBLISHED', 'OBSOLETE'] },
          },
        }),
        this.prisma.documents.groupBy({
          by: ['doctypeId', 'locationId', 'entityId'],
          _count: { id: true },
          where: {
            organizationId: activeUser.organizationId,
            documentState: { in: ['DRAFT'] },
          },
        }),
        this.prisma.documents.groupBy({
          by: ['doctypeId', 'locationId', 'entityId'],
          _count: { id: true },
          where: {
            organizationId: activeUser.organizationId,
            documentState: { in: ['PUBLISHED'] },
          },
        }),
      ]);

      let [inWorkFlowData, newDraftData, newPublishedData]: any =
        await Promise.all([
          this.dataExtract(data),
          this.dataExtract(draftData),
          this.dataExtract(publishedData),
        ]);

      let finalData = await this.combinedAllData(
        newDraftData,
        inWorkFlowData,
        newPublishedData,
      );
      return finalData;
    } catch (err) {}
  }

  async dataExtract(data) {
    try {
      const loctionIds = data?.map((value) => value?.locationId);
      const entityIds = data?.map((value) => value?.entityId);
      const doctypeIds = data?.map((value) => value?.doctypeId);
      let [locationData, entityData, doctypeData]: any = await Promise.all([
        this.prisma.location.findMany({
          where: { id: { in: loctionIds } },
          select: { locationName: true, id: true },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: entityIds } },
          select: { entityName: true, id: true },
        }),
        this.prisma.doctype.findMany({
          where: { id: { in: doctypeIds } },
          select: { documentTypeName: true, id: true },
        }),
      ]);
      const finalResult = data?.map((value) => {
        const docType = doctypeData?.find(
          (item) => item?.id == value?.doctypeId,
        );
        const location = locationData?.find(
          (item) => item?.id === value?.locationId,
        );
        const entity = entityData?.find((item) => item?.id === value?.entityId);
        return {
          docTypeId: value?.doctypeId,
          docTypeName: docType?.documentTypeName,
          locationId: value?.locationId,
          locationName: location?.locationName,
          entityId: value?.entityId,
          entityName: entity?.entityName,
          count: value?._count?.id,
        };
      });
      return finalResult;
    } catch (err) {}
  }

  async combinedAllData(draft, workFlow, published) {
    const mergeCounts = (map, dataArray, statusKey) => {
      dataArray.forEach(
        ({
          docTypeId,
          docTypeName,
          locationId,
          locationName,
          entityId,
          entityName,
          count,
        }) => {
          if (!map[locationId]) {
            map[locationId] = {
              locationName,
              entities: {},
            };
          }

          if (!map[locationId].entities[entityId]) {
            map[locationId].entities[entityId] = {
              entityName,
              docTypes: {},
            };
          }

          if (!map[locationId].entities[entityId].docTypes[docTypeId]) {
            map[locationId].entities[entityId].docTypes[docTypeId] = {
              name: docTypeName,
              Pushlished: 0,
              WorkFlow: 0,
              Draft: 0,
            };
          }

          map[locationId].entities[entityId].docTypes[docTypeId][statusKey] +=
            count;
        },
      );
    };

    // Initialize map
    const map = {};

    // Merge data from all arrays
    mergeCounts(map, published, 'Pushlished');
    mergeCounts(map, workFlow, 'WorkFlow');
    mergeCounts(map, draft, 'Draft');

    // Convert map to desired output format
    const result = Object.values(map)
      .map(({ locationName, entities }) => {
        return Object.values(entities).map(({ entityName, docTypes }) => ({
          locationName,
          entityName,
          docTypes: Object.values(docTypes),
        }));
      })
      .flat();

    return result;
  }
  async leaderBoradData(activeUser, query) {
    // try {
    const { location, entity, type, name } = query;
    const date = await this.yearFormater(new Date().getFullYear(), activeUser);

    // const currentYear = new Date().getFullYear();

    const currentDate = new Date(); //get the current date
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    const locationCondition =
      location !== undefined
        ? location?.length == 1 && location[0] === activeUser.locationId
          ? true
          : false
        : false;

    const entityCondition =
      entity !== undefined
        ? entity?.length == 1 && entity[0] === activeUser.entityId
          ? true
          : false
        : false;
    if (locationCondition && entityCondition) {
      let [
        totalPublishedByDept,
        totalPublishedByLoc,
        yearPublishedByDept,
        yearPublishedByLoc,
        revisedCurrentYearByloc,
        revisedCurrentYearByDept,
        revisedOverDueDept,
        revisedOverDueLoc,
        inWorkFlowDept,
        inWorkFlowLoc,
        totalDocByDept,
        totalDocByLoc,
      ]: any = await Promise.all([
        this.prisma.documents.count({
          where: {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            entityId: activeUser.entityId,
          },
        }),
        this.prisma.documents.count({
          where: {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
          },
        }),
        this.prisma.documents.count({
          where: {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            entityId: activeUser.entityId,
            updatedAt: { gt: date[0], lt: date[1] },
          },
        }),
        this.prisma.documents.count({
          where: {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
            updatedAt: { gt: date[0], lt: date[1] },
          },
        }),
        this.prisma.documents.count({
          where: {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            updatedAt: { gte: date[0], lt: date[1] },
          },
        }),
        this.prisma.documents.count({
          where: {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            updatedAt: { gte: date[0], lt: date[1] },
          },
        }),
        this.prisma.documents.count({
          where: {
            OR: [
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate within next two months
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate in the past
                  lt: currentDate,
                },
              },
            ],
            documentState: 'PUBLISHED',
            nextRevisionDate: { not: null },
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
          },
        }),
        this.prisma.documents.count({
          where: {
            OR: [
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate within next two months
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate in the past
                  lt: currentDate,
                },
              },
            ],
            nextRevisionDate: { not: null },
            documentState: 'PUBLISHED',
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
          },
        }),
        this.prisma.documents.count({
          where: {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          },
        }),
        this.prisma.documents.count({
          where: {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          },
        }),
        this.prisma.documents.count({
          where: {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          },
        }),
        this.prisma.documents.count({
          where: {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          },
        }),
      ]);
      return {
        totalPublishedByDept,
        totalPublishedByLoc,
        yearPublishedByDept,
        yearPublishedByLoc,
        revisedCurrentYearByDept,
        revisedCurrentYearByloc,
        revisedOverDueDept,
        revisedOverDueLoc,
        inWorkFlowDept,
        inWorkFlowLoc,
        totalDocByDept,
        totalDocByLoc,
        type: 'activeuser',
      };
    } else {
      let whereSecond: any = {};
      if (
        location !== undefined &&
        location !== '' &&
        location.length > 0 &&
        !location.includes('All') &&
        location[0] !== ''
      ) {
        whereSecond = { ...whereSecond, locationId: { in: [...location] } };
      }
      if (
        entity !== undefined &&
        entity !== '' &&
        entity.length > 0 &&
        entity[0] !== 'undefined' &&
        !entity.includes('All') &&
        entity[0] !== ''
      ) {
        whereSecond = { ...whereSecond, entityId: { in: [...entity] } };
      }

      // whereSecond =
      //   Object.keys(whereSecond).length !== 0
      //     ? whereSecond
      //     : { locationId: { in: [] } };
      let [
        totalPublished,
        yearPublished,
        revisedCurrentYear,
        revisedOverDue,
        inWorkFlow,
        totalDoc,
      ]: any = await Promise.all([
        this.prisma.documents.count({
          where: {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            ...whereSecond,
          },
        }),
        this.prisma.documents.count({
          where: {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            ...whereSecond,

            createdAt: { gt: date[0], lt: date[1] },
          },
        }),

        this.prisma.documents.count({
          where: {
            ...whereSecond,

            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            updatedAt: { gt: date[0], lt: date[1] },
          },
        }),

        this.prisma.documents.count({
          where: {
            OR: [
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate within next two months
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate in the past
                  lt: currentDate,
                },
              },
            ],
            ...whereSecond,
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
          },
        }),

        this.prisma.documents.count({
          where: {
            ...whereSecond,

            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          },
        }),
        this.prisma.documents.count({
          where: {
            ...whereSecond,

            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          },
        }),
      ]);

      return {
        totalPublished: totalPublished || 0,
        yearPublished: yearPublished || 0,
        revisedCurrentYear: revisedCurrentYear || 0,
        revisedOverDue: revisedOverDue || 0,
        inWorkFlow: inWorkFlow || 0,
        totalDoc,
        type: 'customized',
      };
    }
    // } catch (err) {}
  }

  async chartData(activeUser, query) {
    // try {
    const { name, type, location, entity } = query;
    const locationCondition =
      location !== undefined
        ? location?.length == 1 && location[0] === activeUser.locationId
          ? true
          : false
        : false;

    const entityCondition =
      entity !== undefined
        ? entity?.length == 1 && entity[0] === activeUser.entityId
          ? true
          : false
        : false;

    let whereCondition: any = {};
    if (
      location !== undefined &&
      location !== '' &&
      location.length > 0 &&
      location[0] !== 'undefined' &&
      !location.includes('All') &&
      location[0] !== ''
    ) {
      whereCondition = {
        ...whereCondition,
        locationId: { in: [...location] },
      };
    }
    if (
      entity !== undefined &&
      entity !== '' &&
      entity.length > 0 &&
      entity[0] !== 'undefined' &&
      !entity.includes('All') &&
      entity[0] !== ''
    ) {
      whereCondition = { ...whereCondition, entityId: { in: [...entity] } };
    }

    // whereCondition =
    //   Object.keys(whereCondition).length !== 0
    //     ? whereCondition
    //     : { locationId: { in: [] } };

    if (locationCondition && entityCondition) {
      if (name === 'totalPublished' && type === 'myDept') {
        whereCondition = {
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
          entityId: activeUser.entityId,
        };
      } else if (name === 'totalPublished' && type === 'myLoc') {
        whereCondition = {
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
          locationId: activeUser.locationId,
        };
      } else if (name === 'yearPublished' && type === 'myDept') {
        const date = await this.yearFormater(
          new Date().getFullYear(),
          activeUser,
        );
        whereCondition = {
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
          entityId: activeUser.entityId,
          updatedAt: { gt: date[0], lt: date[1] },
        };
      } else if (name === 'yearPublished' && type === 'myLoc') {
        const date = await this.yearFormater(
          new Date().getFullYear(),
          activeUser,
        );
        whereCondition = {
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
          locationId: activeUser.locationId,
          updatedAt: { gt: date[0], lt: date[1] },
        };
      } else if (name === 'revisedCurrentYear' && type === 'myDept') {
        const date = await this.yearFormater(
          new Date().getFullYear(),
          activeUser,
        );
        // const currentYear = new Date().getFullYear();
        whereCondition = {
          entityId: activeUser.entityId,
          organizationId: activeUser.organizationId,
          documentState: 'PUBLISHED',
          countNumber: {
            gt: 1,
          },
          currentVersion: {
            not: 'A',
          },
          documentId: {
            not: null,
          },
          // createdAt: {
          //   gte: new Date(currentYear, 0, 1),
          //   lt: new Date(currentYear + 1, 0, 1),
          // },
          updatedAt: { gte: date[0], lt: date[1] },
        };
      } else if (name === 'revisedCurrentYear' && type === 'myLoc') {
        const date = await this.yearFormater(
          new Date().getFullYear(),
          activeUser,
        );
        const currentYear = new Date().getFullYear();
        whereCondition = {
          locationId: activeUser.locationId,
          organizationId: activeUser.organizationId,
          documentState: 'PUBLISHED',
          countNumber: {
            gt: 1,
          },
          currentVersion: {
            not: 'A',
          },
          documentId: {
            not: null,
          },
          updatedAt: { gte: date[0], lt: date[1] },
        };

        // ------------------------------------------------------------------------------------
      } else if (name === 'revisedue' && type === 'myDept') {
        const currentDate = new Date(); //get the current date
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
        whereCondition = {
          OR: [
            {
              nextRevisionDate: {
                // Documents with nextRevisionDate within next two months
                gte: currentDate,
                lte: twoMonthsFromNow,
              },
            },
            {
              nextRevisionDate: {
                // Documents with nextRevisionDate in the past
                lt: currentDate,
              },
            },
          ],
          nextRevisionDate: { not: null },

          entityId: activeUser.entityId,
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
        };
      } else if (name === 'revisedue' && type === 'myLoc') {
        const currentDate = new Date(); //get the current date
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
        whereCondition = {
          OR: [
            {
              nextRevisionDate: {
                gte: currentDate,
                lte: twoMonthsFromNow,
              },
            },
            {
              nextRevisionDate: {
                lt: currentDate,
              },
            },
          ],
          nextRevisionDate: { not: null },

          documentState: 'PUBLISHED',
          locationId: activeUser.locationId,
          organizationId: activeUser.organizationId,
        };
      } else if (name === 'inWorkFlow' && type === 'myDept') {
        whereCondition = {
          entityId: activeUser.entityId,
          organizationId: activeUser.organizationId,
          documentState: {
            in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
          },
        };
      } else if (name === 'inWorkFlow' && type === 'myLoc') {
        whereCondition = {
          locationId: activeUser.locationId,
          organizationId: activeUser.organizationId,
          documentState: {
            in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
          },
        };
      } else if (name === 'totaldocs' && type === 'myLoc') {
        whereCondition = {
          locationId: activeUser.locationId,
          organizationId: activeUser.organizationId,
          documentState: {
            in: [
              'IN_REVIEW',
              'SEND_FOR_EDIT',
              'IN_APPROVAL',
              'DRAFT',
              'PUBLISHED',
            ],
          },
        };
      } else if (name === 'totaldocs' && type === 'myDept') {
        whereCondition = {
          entityId: activeUser.entityId,
          organizationId: activeUser.organizationId,
          documentState: {
            in: [
              'IN_REVIEW',
              'SEND_FOR_EDIT',
              'IN_APPROVAL',
              'DRAFT',
              'PUBLISHED',
            ],
          },
        };
      }
    } else {
      if (name === 'totalPublished') {
        whereCondition = {
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
          ...whereCondition,
        };
      } else if (name === 'yearPublished') {
        const date = await this.yearFormater(
          new Date().getFullYear(),
          activeUser,
        );
        whereCondition = {
          documentState: 'PUBLISHED',
          organizationId: activeUser.organizationId,
          ...whereCondition,
          createdAt: { gt: date[0], lt: date[1] },
        };
      } else if (name === 'revisedCurrentYear') {
        const currentYear = await this.yearFormater(
          new Date().getFullYear(),
          activeUser,
        );
        whereCondition = {
          ...whereCondition,

          organizationId: activeUser.organizationId,
          documentState: 'PUBLISHED',
          countNumber: {
            gt: 1,
          },
          currentVersion: {
            not: 'A',
          },
          documentId: {
            not: null,
          },
          updatedAt: {
            gt: currentYear[0],
            lt: currentYear[1],
          },
        };
      } else if (name === 'revisedue') {
        const currentDate = new Date(); //get the current date
        // console.log('whereCondition', whereCondition);
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
        whereCondition = {
          OR: [
            {
              nextRevisionDate: {
                // Documents with nextRevisionDate within next two months
                gte: currentDate,
                lte: twoMonthsFromNow,
              },
            },
            {
              nextRevisionDate: {
                // Documents with nextRevisionDate in the past
                lt: currentDate,
              },
            },
          ],
          documentState: 'PUBLISHED',

          ...whereCondition,

          organizationId: activeUser.organizationId,
        };
      } else if (name === 'inWorkFlow') {
        whereCondition = {
          ...whereCondition,

          organizationId: activeUser.organizationId,
          documentState: {
            in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
          },
        };
      } else if (name === 'totaldocs') {
        whereCondition = {
          ...whereCondition,

          organizationId: activeUser.organizationId,
          documentState: {
            in: [
              'IN_REVIEW',
              'SEND_FOR_EDIT',
              'IN_APPROVAL',
              'DRAFT',
              'PUBLISHED',
            ],
          },
        };
      }
    }
    const docTypeData = await this.prisma.documents.groupBy({
      by: ['doctypeId'],
      _count: { id: true },
      where: whereCondition,
    });
    const docTypeDataIdData = await this.prisma.doctype.findMany({
      where: {
        id: {
          in: docTypeData
            ?.map((value) => value?.doctypeId)
            .filter((item) => item !== null),
        },
      },
    });

    const finalDataForDoctypeData = docTypeData?.map((item) => {
      const doctypeFindData = docTypeDataIdData?.find(
        (value) => value.id === item.doctypeId,
      );
      return {
        docTypeName: doctypeFindData?.documentTypeName,
        id: doctypeFindData?.id,
        count: item._count.id,
      };
    });

    let chartedData: any = await this.chartedData(whereCondition);
    return {
      type: chartedData.typeData,
      doctypeData: chartedData.docTypeData,
      systemData: chartedData.systemData,
      deptData: chartedData.deptData,
      deptStatusData: chartedData.deptStatusData,
      monthData: chartedData.monthData,
      // tableData: data,
      docTypeData: finalDataForDoctypeData,
    };
    // } catch (err) {}
  }

  async displayDocData(query, user) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/displayDocData service started`,
        '',
      );
      const {
        name,
        type,
        location,
        entity,
        typeData,
        entityId,
        system,
        status,
        skip,
        limit,
        asc,
        sectionId,
        month,
      } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const skipValue = (skip - 1) * Number(limit);

      const locationCondition =
        location !== undefined
          ? location?.length == 1 && location[0] === activeUser.locationId
            ? true
            : false
          : false;

      const entityCondition =
        entity !== undefined
          ? entity?.length == 1 && entity[0] === activeUser.entityId
            ? true
            : false
          : false;

      let whereCondition: any = {};
      if (
        location !== undefined &&
        location !== '' &&
        location.length > 0 &&
        location[0] !== 'undefined' &&
        !location.includes('All')
      ) {
        whereCondition = {
          ...whereCondition,
          locationId: { in: [...location] },
        };
      }
      if (
        entity !== undefined &&
        entity !== '' &&
        entity.length > 0 &&
        entity[0] !== 'undefined' &&
        !entity.includes('All')
      ) {
        whereCondition = { ...whereCondition, entityId: { in: [...entity] } };
      }

      if (
        location.includes('All') &&
        entityId !== undefined &&
        entityId !== 'undefined' &&
        entityId?.length > 0
      ) {
        whereCondition = { ...whereCondition, locationId: entityId };
      }
      // whereCondition =
      //   Object.keys(whereCondition).length !== 0
      //     ? whereCondition
      //     : { locationId: { in: [] } };

      if (locationCondition && entityCondition) {
        if (name === 'totalPublished' && type === 'myDept') {
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            entityId: activeUser.entityId,
          };
        } else if (name === 'totalPublished' && type === 'myLoc') {
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
          };
        } else if (name === 'yearPublished' && type === 'myDept') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            entityId: activeUser.entityId,
            updatedAt: { gt: date[0], lt: date[1] },
          };
        } else if (name === 'yearPublished' && type === 'myLoc') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
            updatedAt: { gt: date[0], lt: date[1] },
          };
        } else if (name === 'revisedCurrentYear' && type === 'myDept') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            updatedAt: { gte: date[0], lt: date[1] },
          };
        } else if (name === 'revisedCurrentYear' && type === 'myLoc') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          // const currentYear = new Date().getFullYear();
          whereCondition = {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            // createdAt: {
            //   gte: new Date(currentYear, 0, 1),
            //   lt: new Date(currentYear + 1, 0, 1),
            // },
            updatedAt: { gte: date[0], lt: date[1] },
          };
        } else if (name === 'revisedue' && type === 'myDept') {
          const currentDate = new Date(); //get the current date
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          whereCondition = {
            OR: [
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate within next two months
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate in the past
                  lt: currentDate,
                },
              },
            ],
            nextRevisionDate: { not: null },
            documentState: 'PUBLISHED',
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
          };
        } else if (name === 'revisedue' && type === 'myLoc') {
          const currentDate = new Date(); //get the current date
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          whereCondition = {
            OR: [
              {
                nextRevisionDate: {
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  lt: currentDate,
                },
              },
            ],
            nextRevisionDate: { not: null },
            documentState: 'PUBLISHED',
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
          };
        } else if (name === 'inWorkFlow' && type === 'myDept') {
          whereCondition = {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          };
        } else if (name === 'inWorkFlow' && type === 'myLoc') {
          whereCondition = {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          };
        } else if (name === 'totaldocs' && type === 'myLoc') {
          whereCondition = {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          };
        } else if (name === 'totaldocs' && type === 'myDept') {
          whereCondition = {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          };
        }
      } else {
        if (name === 'totalPublished') {
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            ...whereCondition,
          };
        } else if (name === 'yearPublished') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            ...whereCondition,
            createdAt: { gt: date[0], lt: date[1] },
          };
        } else if (name === 'revisedCurrentYear') {
          const currentYear = new Date().getFullYear();
          whereCondition = {
            ...whereCondition,

            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            createdAt: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1),
            },
          };
        } else if (name === 'revisedue') {
          const currentDate = new Date(); //get the current date
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          whereCondition = {
            OR: [
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate within next two months
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate in the past
                  lt: currentDate,
                },
              },
            ],
            ...whereCondition,

            organizationId: activeUser.organizationId,
          };
        } else if (name === 'inWorkFlow') {
          whereCondition = {
            ...whereCondition,

            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          };
        } else if (name === 'totaldocs') {
          whereCondition = {
            ...whereCondition,

            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          };
        }
      }
      if (
        typeData !== undefined &&
        typeData !== 'undefined' &&
        typeData !== ''
      ) {
        whereCondition = { ...whereCondition, doctypeId: typeData };
      }

      if (
        entityId !== undefined &&
        entityId !== 'undefined' &&
        entityId !== '' &&
        !location.includes('All')
      ) {
        whereCondition = { ...whereCondition, entityId: entityId };
      }

      if (
        system !== undefined &&
        system !== 'undefined' &&
        system !== '' &&
        system?.length > 0
      ) {
        const systemData = system?.map((value) => ({ system: { has: value } }));

        whereCondition = { ...whereCondition, AND: systemData };
      }
      if (status !== undefined && status !== 'undefined' && status !== '') {
        whereCondition = { ...whereCondition, documentState: status };
      }
      if (sectionId !== undefined && sectionId !== 'undefined') {
        whereCondition = { ...whereCondition, section: sectionId ?? '' };
      }

      if (month !== undefined && month !== 'undefined') {
        function getMonthDateRange(monthAbbr) {
          const currentYear = new Date().getFullYear();
          const monthIndex = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ].indexOf(monthAbbr);

          if (monthIndex === -1) {
            throw new Error('Invalid month abbreviation');
          }

          // Start of the month
          const startOfMonth = new Date(
            Date.UTC(currentYear, monthIndex, 1, 0, 0, 0, 0),
          );

          // End of the month
          const endOfMonth = new Date(
            Date.UTC(currentYear, monthIndex + 1, 0, 23, 59, 59, 999),
          );

          return { startOfMonth, endOfMonth };
        }

        const { startOfMonth, endOfMonth } = getMonthDateRange(month);

        whereCondition = {
          ...whereCondition,
          approvedDate: { gte: startOfMonth, lte: endOfMonth },
        };
      }

      let documentData: any = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: whereCondition,
        orderBy: { documentNumbering: asc === 'true' ? 'asc' : 'desc' },
        include: {
          creatorLocation: true,
          creatorEntity: true,
          doctype: true,
          AdditionalDocumentAdmins: true,
        },
      });
      documentData = documentData.map((document) => {
        let pendingWith;
        if (document.documentState === 'DRAFT') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'CREATOR') {
              return value;
            }
          });
        } else if (document.documentState === 'IN_REVIEW') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'REVIEWER') {
              return value;
            }
          });
        } else if (document.documentState === 'IN_APPROVAL') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'APPROVER') {
              return value;
            }
          });
        } else if (document.documentState === 'SEND_FOR_EDIT') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'CREATOR') {
              return value;
            }
          });
        }
        return {
          ...document,
          pendingWith,
        };
      });

      if (
        system !== undefined &&
        system !== 'undefined' &&
        system !== '' &&
        system?.length > 0
      ) {
        documentData = documentData?.filter(
          (value) => value.system.length === system.length,
        );
      }

      const totalDocument = await this.prisma.documents.count({
        where: whereCondition,
      });
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/displayDocData service successful`,
        '',
      );
      return { data: documentData, count: totalDocument };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/displayDocData  service failed ${err}`,
        '',
      );
    }
  }

  async displayDocumentData(query, user) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/displayDocData service started`,
        '',
      );
      const {
        name,
        type,
        location,
        entity,
        typeData,
        entityId,
        system,
        status,
        skip,
        limit,
        asc,
        sectionId,
        month,
      } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      // const skipValue = (skip - 1) * Number(limit);

      const locationCondition =
        location !== undefined
          ? location?.length == 1 && location[0] === activeUser.locationId
            ? true
            : false
          : false;

      const entityCondition =
        entity !== undefined
          ? entity?.length == 1 && entity[0] === activeUser.entityId
            ? true
            : false
          : false;

      let whereCondition: any = {};
      if (
        location !== undefined &&
        location !== '' &&
        location.length > 0 &&
        location[0] !== 'undefined' &&
        !location.includes('All')
      ) {
        whereCondition = {
          ...whereCondition,
          locationId: { in: [...location] },
        };
      }
      if (
        entity !== undefined &&
        entity !== '' &&
        entity.length > 0 &&
        entity[0] !== 'undefined' &&
        !entity.includes('All')
      ) {
        whereCondition = { ...whereCondition, entityId: { in: [...entity] } };
      }

      if (
        location.includes('All') &&
        entityId !== undefined &&
        entityId !== 'undefined' &&
        entityId?.length > 0
      ) {
        whereCondition = { ...whereCondition, locationId: entityId };
      }
      // whereCondition =
      //   Object.keys(whereCondition).length !== 0
      //     ? whereCondition
      //     : { locationId: { in: [] } };

      if (locationCondition && entityCondition) {
        if (name === 'totalPublished' && type === 'myDept') {
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            entityId: activeUser.entityId,
          };
        } else if (name === 'totalPublished' && type === 'myLoc') {
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
          };
        } else if (name === 'yearPublished' && type === 'myDept') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            entityId: activeUser.entityId,
            updatedAt: { gt: date[0], lt: date[1] },
          };
        } else if (name === 'yearPublished' && type === 'myLoc') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
            updatedAt: { gt: date[0], lt: date[1] },
          };
        } else if (name === 'revisedCurrentYear' && type === 'myDept') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            updatedAt: { gte: date[0], lt: date[1] },
          };
        } else if (name === 'revisedCurrentYear' && type === 'myLoc') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          // const currentYear = new Date().getFullYear();
          whereCondition = {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            // createdAt: {
            //   gte: new Date(currentYear, 0, 1),
            //   lt: new Date(currentYear + 1, 0, 1),
            // },
            updatedAt: { gte: date[0], lt: date[1] },
          };
        } else if (name === 'revisedue' && type === 'myDept') {
          const currentDate = new Date(); //get the current date
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          whereCondition = {
            OR: [
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate within next two months
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate in the past
                  lt: currentDate,
                },
              },
            ],
            nextRevisionDate: { not: null },
            documentState: 'PUBLISHED',
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
          };
        } else if (name === 'revisedue' && type === 'myLoc') {
          const currentDate = new Date(); //get the current date
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          whereCondition = {
            OR: [
              {
                nextRevisionDate: {
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  lt: currentDate,
                },
              },
            ],
            nextRevisionDate: { not: null },
            documentState: 'PUBLISHED',
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
          };
        } else if (name === 'inWorkFlow' && type === 'myDept') {
          whereCondition = {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          };
        } else if (name === 'inWorkFlow' && type === 'myLoc') {
          whereCondition = {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          };
        } else if (name === 'totaldocs' && type === 'myLoc') {
          whereCondition = {
            locationId: activeUser.locationId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          };
        } else if (name === 'totaldocs' && type === 'myDept') {
          whereCondition = {
            entityId: activeUser.entityId,
            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          };
        }
      } else {
        if (name === 'totalPublished') {
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            ...whereCondition,
          };
        } else if (name === 'yearPublished') {
          const date = await this.yearFormater(
            new Date().getFullYear(),
            activeUser,
          );
          whereCondition = {
            documentState: 'PUBLISHED',
            organizationId: activeUser.organizationId,
            ...whereCondition,
            createdAt: { gt: date[0], lt: date[1] },
          };
        } else if (name === 'revisedCurrentYear') {
          const currentYear = new Date().getFullYear();
          whereCondition = {
            ...whereCondition,

            organizationId: activeUser.organizationId,
            documentState: 'PUBLISHED',
            countNumber: {
              gt: 1,
            },
            currentVersion: {
              not: 'A',
            },
            documentId: {
              not: null,
            },
            createdAt: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1),
            },
          };
        } else if (name === 'revisedue') {
          const currentDate = new Date(); //get the current date
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          whereCondition = {
            OR: [
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate within next two months
                  gte: currentDate,
                  lte: twoMonthsFromNow,
                },
              },
              {
                nextRevisionDate: {
                  // Documents with nextRevisionDate in the past
                  lt: currentDate,
                },
              },
            ],
            ...whereCondition,

            organizationId: activeUser.organizationId,
          };
        } else if (name === 'inWorkFlow') {
          whereCondition = {
            ...whereCondition,

            organizationId: activeUser.organizationId,
            documentState: {
              in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT'],
            },
          };
        } else if (name === 'totaldocs') {
          whereCondition = {
            ...whereCondition,

            organizationId: activeUser.organizationId,
            documentState: {
              in: [
                'IN_REVIEW',
                'SEND_FOR_EDIT',
                'IN_APPROVAL',
                'DRAFT',
                'PUBLISHED',
              ],
            },
          };
        }
      }
      if (
        typeData !== undefined &&
        typeData !== 'undefined' &&
        typeData !== ''
      ) {
        whereCondition = { ...whereCondition, doctypeId: typeData };
      }

      if (
        entityId !== undefined &&
        entityId !== 'undefined' &&
        entityId !== '' &&
        !location.includes('All')
      ) {
        whereCondition = { ...whereCondition, entityId: entityId };
      }

      if (
        system !== undefined &&
        system !== 'undefined' &&
        system !== '' &&
        system?.length > 0
      ) {
        const systemData = system?.map((value) => ({ system: { has: value } }));

        whereCondition = { ...whereCondition, AND: systemData };
      }
      if (status !== undefined && status !== 'undefined' && status !== '') {
        whereCondition = { ...whereCondition, documentState: status };
      }
      if (sectionId !== undefined && sectionId !== 'undefined') {
        whereCondition = { ...whereCondition, section: sectionId ?? '' };
      }

      if (month !== undefined && month !== 'undefined') {
        function getMonthDateRange(monthAbbr) {
          const currentYear = new Date().getFullYear();
          const monthIndex = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ].indexOf(monthAbbr);

          if (monthIndex === -1) {
            throw new Error('Invalid month abbreviation');
          }

          // Start of the month
          const startOfMonth = new Date(
            Date.UTC(currentYear, monthIndex, 1, 0, 0, 0, 0),
          );

          // End of the month
          const endOfMonth = new Date(
            Date.UTC(currentYear, monthIndex + 1, 0, 23, 59, 59, 999),
          );

          return { startOfMonth, endOfMonth };
        }

        const { startOfMonth, endOfMonth } = getMonthDateRange(month);

        whereCondition = {
          ...whereCondition,
          approvedDate: { gte: startOfMonth, lte: endOfMonth },
        };
      }

      let documentData: any = await this.prisma.documents.findMany({
        // skip: skipValue,
        // take: Number(limit),
        where: whereCondition,
        orderBy: { documentNumbering: asc === 'true' ? 'asc' : 'desc' },
        include: {
          creatorLocation: true,
          creatorEntity: true,
          doctype: true,
          AdditionalDocumentAdmins: true,
        },
      });
      documentData = documentData.map((document) => {
        let pendingWith;
        if (document.documentState === 'DRAFT') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'CREATOR') {
              return value;
            }
          });
        } else if (document.documentState === 'IN_REVIEW') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'REVIEWER') {
              return value;
            }
          });
        } else if (document.documentState === 'IN_APPROVAL') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'APPROVER') {
              return value;
            }
          });
        } else if (document.documentState === 'SEND_FOR_EDIT') {
          pendingWith = document.AdditionalDocumentAdmins.filter((value) => {
            if (value.type === 'CREATOR') {
              return value;
            }
          });
        }
        return {
          ...document,
          pendingWith,
        };
      });

      if (
        system !== undefined &&
        system !== 'undefined' &&
        system !== '' &&
        system?.length > 0
      ) {
        documentData = documentData?.filter(
          (value) => value.system.length === system.length,
        );
      }

      const totalDocument = await this.prisma.documents.count({
        where: whereCondition,
      });
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/displayDocData service successful`,
        '',
      );
      return { data: documentData, count: totalDocument };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/displayDocData  service failed ${err}`,
        '',
      );
    }
  }

  async chartedData(whereCondition) {
    // try {
    let [
      doctypeData,
      systemData,
      deptStatusData,
      typeData,
      entityData,
      monthData,
    ]: any = await Promise.all([
      this.doctypeDataFormater(whereCondition),
      this.systemDataFormater(whereCondition),
      this.deptDataFormater(whereCondition),
      this.documentStatusData(whereCondition),
      this.entityData(whereCondition),
      this.monthData(whereCondition),
    ]);
    return {
      typeData,
      docTypeData: doctypeData,
      systemData: systemData,
      deptStatusData: deptStatusData,
      deptData: entityData,
      monthData,
    };
    // } catch (err) {}
  }

  async monthData(whereCondition) {
    // try {
    function getMonthName(monthNumber) {
      const date = new Date();
      date.setMonth(monthNumber - 1);
      return date.toLocaleString('en-US', { month: 'short' });
    }
    function transformData(data) {
      const result = [];
      data.forEach((item) => {
        let entity = result.find((r) => r.entityId === item.entityId);
        if (!entity) {
          entity = {
            entityId: item.entityId,
            // section: item?.section,
            data: [],
          };
          result.push(entity);
        }
        entity.data.push({ month: item.month, count: item.count });
      });

      return result;
    }
    function getMonthlyCount(data) {
      const monthlyCounts = data.reduce((acc, curr) => {
        const date = new Date(curr.approvedDate);
        const month =
          date.getFullYear() +
          '-' +
          (date.getMonth() + 1).toString().padStart(2, '0') +
          '-' +
          curr.entityId;
        // +
        // curr.section; // Format as 'YYYY-MM';
        const monthName = getMonthName(date.getMonth() + 1);

        if (!acc[month]) {
          acc[month] = {
            entityId: curr.entityId,
            month: monthName,
            // section: curr?.section,
            count: 0,
          };
        }
        acc[month].count += curr._count.id;

        return acc;
      }, {});

      return Object.values(monthlyCounts);
    }
    //  console.log("whereCondition1",whereCondition)
    // whereCondition = {
    //   ...whereCondition,
    //   documentState: {
    //     in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT', 'PUBLISHED'],
    //   },
    // };

    const countData = await this.prisma.documents.count({
      where: whereCondition,
    });
    const data = await this.prisma.documents.groupBy({
      by: ['entityId', 'approvedDate'],
      _count: { id: true },
      where: {
        ...whereCondition,
        approvedDate: {
          not: null,
        },
        // section: { not: null },
      },
    });

    const transData = transformData(getMonthlyCount(data));
    const entityIds = transData?.map((value) => value?.entityId);
    const entityData = await this.prisma.entity.findMany({
      where: { id: { in: entityIds } },
      include: { location: true },
    });
    // const sectionIds = transData
    //   ?.map((value) => value?.section)
    //   .filter((value) => value !== '');
    // const sectionData = await this.prisma.section.findMany({
    //   where: { id: { in: sectionIds } },
    //   select: { id: true, name: true },
    // });
    let finalResult = transData?.map((item) => {
      // const sectionDataNew = sectionData?.find(
      //   (value) => value?.id === item?.section,
      // );
      const entityFindData = entityData?.find(
        (value) => value?.id == item?.entityId,
      );
      return {
        // sectionId: sectionDataNew?.id,
        // sectionName: sectionDataNew?.name,
        locationName: entityFindData?.location?.locationName,
        entityId: item?.entityId,
        entityName: entityFindData?.entityName,
        ...item,
      };
    });

    finalResult.sort((a, b) => {
      let nameA = a.entityName.toLowerCase();
      let nameB = b.entityName.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return finalResult;

    // return transformData(getMonthlyCount(data))
    // } catch (err) {}
  }
  async documentStatusData(whereCondition) {
    try {
      const data = await this.prisma.documents.groupBy({
        by: ['documentState'],
        _count: { id: true },
        where: whereCondition,
      });
      const finalresult = data?.map((value) => {
        return { status: value?.documentState, count: value?._count?.id };
      });
      return finalresult;
    } catch (err) {}
  }

  async entityData(whereCondition) {
    try {
      let finalResult;
      if (
        whereCondition.hasOwnProperty('locationId') ||
        whereCondition.hasOwnProperty('entityId')
      ) {
        const data = await this.prisma.documents.groupBy({
          by: ['entityId'],
          _count: { id: true },
          where: whereCondition,
        });
        const entityIds = data?.map((value) => value?.entityId);
        const entityData = await this.prisma.entity.findMany({
          where: { id: { in: entityIds } },
          orderBy: { entityName: 'asc' },
        });
        finalResult = data?.map((item) => {
          const entityFindData = entityData?.find(
            (value) => value?.id == item?.entityId,
          );
          return {
            entityId: item?.entityId,
            entityName: entityFindData?.entityName,
            count: item?._count?.id,
          };
        });
      } else {
        const data = await this.prisma.documents.groupBy({
          by: ['locationId'],
          _count: { id: true },
          where: whereCondition,
        });
        const locationIds = data?.map((value) => value?.locationId);
        const entityData = await this.prisma.location.findMany({
          where: { id: { in: locationIds } },
          orderBy: { locationName: 'asc' },
        });
        finalResult = data?.map((item) => {
          const entityFindData = entityData?.find(
            (value) => value?.id == item?.locationId,
          );
          return {
            entityId: item?.locationId,
            entityName: entityFindData?.locationName,
            count: item?._count?.id,
          };
        });
      }

      finalResult.sort((a, b) => {
        let nameA = a.entityName.toLowerCase();
        let nameB = b.entityName.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      return finalResult;
    } catch (err) {}
  }
  async doctypeDataFormater(whereCondition) {
    try {
      const typeData = await this.prisma.documents.groupBy({
        by: ['doctypeId'],
        _count: { id: true },
        where: whereCondition,
      });

      const docTypeDetails = await this.prisma.doctype.findMany({
        where: {
          id: {
            in: typeData
              ?.map((value) => value?.doctypeId)
              .filter((item) => item !== null),
          },
        },
        orderBy: { documentTypeName: 'desc' },
      });

      let finalDocTypeData = typeData.map((item) => {
        const findDoctypeData = docTypeDetails.find(
          (value) => value?.id === item?.doctypeId,
        );
        return {
          doctypeId: item?.doctypeId,
          docTypeName: findDoctypeData?.documentTypeName,
          count: item?._count.id,
        };
      });

      finalDocTypeData.sort((a, b) => {
        let nameA = a?.docTypeName?.toLowerCase();
        let nameB = b?.docTypeName?.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      return finalDocTypeData;
    } catch (err) {}
  }

  async deptDataFormater(whereCondition) {
    // try {
    whereCondition = {
      ...whereCondition,
      documentState: {
        in: ['IN_REVIEW', 'SEND_FOR_EDIT', 'IN_APPROVAL', 'DRAFT', 'PUBLISHED'],
      },
    };

    let deptStatusData;
    let finalResult = [];

    // if (
    //   whereCondition.hasOwnProperty('locationId') ||
    //   whereCondition.hasOwnProperty('entityId')
    // ) {
    deptStatusData = await this.prisma.documents.groupBy({
      by: ['documentState', 'section', 'doctypeId', 'entityId'],
      where: { ...whereCondition, section: { not: null } },
      _count: { id: true },
    });

    const result = deptStatusData.reduce((acc, curr) => {
      if (
        !acc.some(
          (item) =>
            item.entityId === curr.entityId &&
            item?.section === curr.section &&
            item?.docTypeId === curr.doctypeId,
        )
      ) {
        acc.push({
          entityId: curr.entityId,
          section: curr.section,
          docTypeId: curr.doctypeId,
        });
      }
      const entity = acc.find(
        (item) =>
          item.entityId === curr.entityId &&
          item?.section === curr.section &&
          item?.docTypeId === curr.doctypeId,
      );
      entity[curr.documentState] = curr._count.id;
      entity['status'] = curr.documentState;
      return acc;
    }, []);

    const deptIds = result?.map((value) => value?.entityId);
    const sectionIds = result
      ?.map((value) => value?.section)
      .filter((value) => value !== '');

    const notData = ['', null, 'null', undefined, 'undefined'];
    const docTypeIds = result
      ?.map((value) => value?.docTypeId)
      .filter((value) => !notData?.includes(value));

    const deptAllData = await this.prisma.entity.findMany({
      where: { id: { in: deptIds } },
      include: { location: true },
    });

    const docTypeData = await this.prisma.doctype.findMany({
      where: { id: { in: docTypeIds } },
    });
    const sectionData = await this.prisma.entity.findMany({
      where: { id: { in: sectionIds } },
    });
    result?.map((item) => {
      const findEntity = deptAllData?.find(
        (value) => value.id === item?.entityId,
      );

      const findDoctype = docTypeData?.find(
        (value) => value.id === item?.docTypeId,
      );
      const findSection = sectionData?.find(
        (value) => value.id === item?.section,
      );
      finalResult.push({
        count: item?._count?.id,
        sectionId: findSection?.id,
        locationName: findEntity?.location?.locationName || '',
        sectionName: findSection?.entityName,
        entityId: item?.entityId,
        docTypeId: findDoctype?.id || '',
        docTypeName: findDoctype?.documentTypeName || '',
        entityName: findEntity?.entityName,
        ...item,
      });
    });
    // } else {
    //   deptStatusData = await this.prisma.documents.groupBy({
    //     by: ['documentState', 'section', 'locationId'],
    //     where: { ...whereCondition, section: { not: null } },
    //     _count: { id: true },
    //   });

    //   // console.log("deptStatusData",deptStatusData)
    //   const result = deptStatusData.reduce((acc, curr) => {
    //     if (
    //       !acc.some(
    //         (item) =>
    //           item.locationId === curr.locationId &&
    //           item?.section === curr.section,
    //       )
    //     ) {
    //       acc.push({ locationId: curr.locationId, section: curr.section });
    //     }
    //     const entity = acc.find(
    //       (item) =>
    //         item.locationId === curr.locationId &&
    //         item?.section === curr.section,
    //     );
    //     entity[curr.documentState] = curr._count.id;
    //     entity['status'] = curr.documentState;
    //     return acc;
    //   }, []);

    //   const deptIds = result?.map((value) => value?.locationId);
    //   const sectionIds = result
    //     ?.map((value) => value?.section)
    //     .filter((value) => value !== '');
    //   const deptAllData = await this.prisma.location.findMany({
    //     where: { id: { in: deptIds } },
    //   });

    //   const sectionData = await this.prisma.section.findMany({
    //     where: { id: { in: sectionIds } },
    //   });
    //   result?.map((item) => {
    //     const findEntity = deptAllData?.find(
    //       (value) => value.id === item?.locationId,
    //     );

    //     const findSection = sectionData?.find(
    //       (value) => value.id === item?.section,
    //     );
    //     finalResult.push({
    //       count: item?._count?.id,
    //       sectionId: findSection?.id,
    //       sectionName: findSection?.name,
    //       entityId: item?.entityId,
    //       entityName: findEntity.locationName,
    //       ...item,
    //     });
    //   });
    // }

    finalResult.sort((a, b) => {
      let nameA = a.locationName.toLowerCase();
      let nameB = b.locationName.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return finalResult;
    // } catch (err) {}
  }

  async systemDataFormater(whereCondition) {
    try {
      const systemData = await this.prisma.documents.groupBy({
        by: ['system'],
        _count: { id: true },
        where: whereCondition,
      });

      const systemIds = systemData?.flatMap((value) => value.system);
      const allSystemData = await this.SystemModel.find({
        _id: { $in: systemIds },
      }).sort({ name: 1 });

      const aggregatedData = systemData.reduce((acc, item) => {
        // Sort the system array for consistent comparison
        const sortedSystem = item.system.sort().join(',');

        if (acc[sortedSystem]) {
          // If the sorted system array already exists, add the count
          acc[sortedSystem]._count.id += item._count.id;
        } else {
          // Otherwise, add the new entry
          acc[sortedSystem] = { ...item };
        }

        return acc;
      }, {});

      // Convert the aggregated object back into an array
      const result = Object.values(aggregatedData);
      const finalSystemData = result?.map((itemFirst: any) => {
        const systemData = itemFirst?.system.map((itemSecond) => {
          const systemFind = allSystemData.find(
            (value) => value._id.toString() === itemSecond,
          );
          return systemFind.name;
        });
        return {
          count: itemFirst?._count?.id,
          systemIds: itemFirst?.system,
          systemName: systemData?.join(','),
        };
      });
      return finalSystemData;
    } catch (err) {}
  }

  async yearFormater(currentYear, activeUser) {
    try {
      const fiscalYearFormat = await this.prisma.organization.findFirst({
        where: { id: activeUser.organizationId },
      });
      if (fiscalYearFormat.fiscalYearQuarters === 'Jan - Dec') {
        const startDate = new Date(Date.UTC(currentYear, 0, 1));
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        return [startDate, endDate];
      } else {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        let startYear, endYear;

        if (currentMonth >= 3) {
          // April is index 3
          startYear = currentYear;
          endYear = currentYear + 1;
        } else {
          startYear = currentYear - 1;
          endYear = currentYear;
        }

        const startDate = new Date(Date.UTC(startYear, 3, 1)); // April 1st of start year
        const endDate = new Date(Date.UTC(endYear, 2, 31, 23, 59, 59, 999)); // March 31st of end year
        return [startDate, endDate];
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async dummyDocument(data, user) {
    // try {
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    const dbname = process.env.MONGO_DB_URI.split('/');

    const db = client.db(process.env.MONGO_DB_NAME);
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    const cursor = db.collection('AdditionalDocumentAdmins').aggregate([
      {
        $match: {
          // organizationId: activeUser.organizationId,
          userId: activeUser.id,
        },
      },
      {
        $lookup: {
          from: 'Documents',
          let: { documentId: '$documentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$documentId'] },
                    // { $eq: ['$status', 'PUBLISHED'] },
                  ],
                },
              },
            },
          ],
          as: 'd2',
        },
      },
      {
        $skip: 1,
      },
      {
        $limit: 10,
      },
    ]);
    const documentsArray = await cursor.toArray();

    // Iterate over the cursor if needed
    // } catch (err) {}
  }

  async retireDocument(query, user) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/retireDocument service started`,
        '',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      // const skipValue = (filterObj.page - 1) * Number(filterObj.limit);
      const filteredDocuments = await this.prisma.documents.findMany({
        // skip: skipValue,
        // take: Number(filterObj.limit),
        where: {
          organizationId: activeUser.organizationId,
          documentState: 'RETIRE',
          countNumber: 1,
        },
        include: {
          creatorEntity: true,
          doctype: true,
          creatorLocation: true,
        },
      });

      const transformedData: any = filteredDocuments.map((document) => ({
        id: document.id,
        documentNumbering: document.documentNumbering,
        documentName: document.documentName,
        documentType: document.doctype.documentTypeName,
        issueNumber: document.issueNumber,
        version: document.currentVersion,
        status: document.documentState,
        system: document.system,
        department: document.creatorEntity.entityName,
        location: document.creatorLocation.locationName,
        approvedDate: document.approvedDate,
        isVersion: document.isVersion,
        section: document.section,
      }));

      const documentsWithPermssions = [];

      for (let document of transformedData) {
        let [
          { editAcess, deleteAccess, readAccess },
          access,
          systemData,
          isUserCreator,
          section,
          versiondocs,
        ]: any = await Promise.all([
          this.accesforDocument(document.id, user),
          this.documentsService.checkPermissionsForPreviewPage(
            user,
            document.id,
          ),
          this.SystemModel.find({
            _id: document.system,
          }).select('name _id type'),
          this.documentsService.checkIfUserCreatorForDocument(
            user,
            document.id,
          ),
          document?.section !== null && document?.section !== undefined
            ? this.prisma.entity.findFirst({
                where: {
                  id: document.section,
                  organizationId: activeUser.organizationId,
                },
              })
            : null,
          this.prisma.documents.findMany({
            where: { documentId: document?.id },
            include: {
              creatorEntity: true,
              doctype: true,
              creatorLocation: true,
            },
          }),
        ]);

        const versionDocs = [];
        for (let document of versiondocs) {
          let { editAcess, deleteAccess, readAccess } =
            await this.accesforDocument(document?.id, user);
          versionDocs.push({
            id: document.id,
            documentNumbering: document.documentNumbering,
            documentName: document.documentName,
            documentType: document.doctype.documentTypeName,
            issueNumber: document.issueNumber,
            version: document.currentVersion,
            status: document.documentState,
            system: document.system,
            department: document.creatorEntity.entityName,
            location: document.creatorLocation.locationName,
            approvedDate: document.approvedDate,
            isVersion: document.isVersion,
            section: document.section,
            editAcess,
            deleteAccess,
            readAccess,
          });
        }
        document = {
          ...document,
          system: systemData,
          versionDocument: versionDocs,
        };

        documentsWithPermssions.push({
          ...document,
          access: access.access,
          isCreator: isUserCreator,
          editAcess,
          deleteAccess,
          readAccess,
          sectionName: section !== null ? section?.entityName : null,
        });
      }

      const totalCount = await this.prisma.documents.count({
        where: {
          organizationId: activeUser.organizationId,
          documentState: 'RETIRE',
        },
      });
      this.logger.log(
        `trace id=${randomNumber} Get api/dashboard/retireDocument service successful`,
        '',
      );
      return {
        data: documentsWithPermssions, // documents
        data_length: documentsWithPermssions.length, // total data return by the query
        total: totalCount, // total data for documents
        status: 200,
        message: 'success',
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/dashboard/retireDocument  service failed ${err}`,
        '',
      );
    }
  }

  async getDashboardDocumentCounts(query: any) {
    const { locationIds = [], entityIds = [], organizationId } = query;

    const baseFilters: any = {
      organizationId,
    };

    if (!!locationIds.length) {
      baseFilters.locationId = { $in: locationIds };
    }

    if (!!entityIds.length) {
      baseFilters.entityId = { $in: entityIds };
    }

    const currentYear = new Date().getFullYear();
    const jan1 = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const dec31 = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const [totalDocs, totalPublishedDocs, approvedDocs, inWorkflowDocs] =
      await Promise.all([
        this.documentModel.countDocuments(baseFilters),
        this.documentModel.countDocuments({
          ...baseFilters,
          documentState: 'PUBLISHED',
        }),
        this.documentModel.countDocuments({
          ...baseFilters,
          documentState: 'PUBLISHED',
          approvedDate: { $gte: jan1, $lte: dec31 },
        }),
        this.documentModel.countDocuments({
          ...baseFilters,
          documentState: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'Sent_For_Edit'] },
        }),
      ]);

    return {
      totalDocuments: totalDocs,
      totalPublishedDocuments: totalPublishedDocs,
      publishedThisYear: approvedDocs,
      inWorkflow: inWorkflowDocs,
    };
  }

  async getDocumentChartDataBySystem(query: any) {
    const { organizationId, locationIds = [], entityIds = [] } = query;

    const matchStage: any = {
      organizationId,
      documentState: 'PUBLISHED',
    };

    if (!!locationIds.length) {
      matchStage.locationId = { $in: locationIds };
    }

    if (!!entityIds.length) {
      matchStage.entityId = { $in: entityIds };
    }
    // Step 1: Aggregate unique sorted combinations of systemIds
    const aggregation = await this.documentModel.aggregate([
      { $match: matchStage },
      {
        $project: {
          sortedSystem: {
            $cond: [
              { $gt: [{ $size: '$system' }, 0] },
              { $setUnion: ['$system', []] }, // sort + remove dupes
              [],
            ],
          },
        },
      },
      {
        $group: {
          _id: '$sortedSystem',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          systemIds: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
    // Step 2: Fetch system names in one go
    const allSystemIds = [
      ...new Set(aggregation.flatMap((entry) => entry.systemIds)),
    ];

    const systems = await this.SystemModel.find({
      _id: { $in: allSystemIds },
    })
      .select('_id name')
      .lean();

    const systemNameMap = new Map(
      systems.map((sys) => [String(sys._id), sys.name]),
    );

    // Step 3: Construct final output with names
    const finalResult = aggregation.map((entry) => {
      const names = entry.systemIds.map((id) => systemNameMap.get(String(id)));
      return {
        count: entry.count,
        systemIds: entry.systemIds,
        systemName: names.join(','),
      };
    });

    return finalResult;
  }

  async getDocumentChartDataByStatus(query: {
    organizationId: string;
    locationIds?: string[];
    entityIds?: string[];
  }) {
    const { organizationId, locationIds = [], entityIds = [] } = query;

    const matchStage: any = {
      organizationId,
    };

    if (!!locationIds.length) {
      matchStage.locationId = { $in: locationIds };
    }

    if (!!entityIds.length) {
      matchStage.entityId = { $in: entityIds };
    }
    const aggregation = await this.documentModel.aggregate([
      {
        $match: {
          ...matchStage,
          documentState: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$documentState',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    return aggregation;
  }

  async getDocumentChartDataByDocType(query: {
    organizationId: string;
    locationIds?: string[];
    entityIds?: string[];
  }) {
    const { organizationId, locationIds = [], entityIds = [] } = query;

    const matchStage: any = {
      organizationId,
      documentState: 'PUBLISHED',
    };

    if (!!locationIds.length) {
      matchStage.locationId = { $in: locationIds };
    }

    if (!!entityIds.length) {
      matchStage.entityId = { $in: entityIds };
    }

    // console.log('matchStage', matchStage);
    // const totalDocs = await this.documentModel.countDocuments(matchStage);
    // console.log('Total matching documents:', totalDocs);

    // Step 1: Aggregate counts by doctypeId
    const aggregation = await this.documentModel.aggregate([
      {
        $match: {
          ...matchStage,
          doctypeId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$doctypeId',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          id: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
    // console.log('aggregation', aggregation);

    const allDoctypeObjectIds = aggregation
      .map((entry) => {
        try {
          return new Types.ObjectId(entry.id);
        } catch (e) {
          return null; // Skip invalid IDs
        }
      })
      .filter(Boolean);

    // Step 3: Fetch doctype names
    const doctypeList = await this.doctypeModel
      .find({ _id: { $in: allDoctypeObjectIds } })
      .select('_id documentTypeName')
      .lean();

    const doctypeMap = new Map(
      doctypeList.map((dt) => [String(dt._id), dt.documentTypeName]),
    );

    // Step 4: Format result
    const finalResult = aggregation.map((entry) => ({
      id: entry.id,
      count: entry.count,
      docTypeName: doctypeMap.get(entry.id) || 'Unknown',
    }));

    return finalResult;
  }

  async getDocumentChartDataByDepartment(query: {
    organizationId: string;
    locationIds?: string[];
    entityIds?: string[];
  }) {
    const { organizationId, locationIds = [], entityIds = [] } = query;

    const matchStage: any = {
      organizationId,
      documentState: 'PUBLISHED',
    };

    if (locationIds.length > 0) {
      matchStage.locationId = { $in: locationIds };
    }

    if (entityIds.length > 0) {
      matchStage.entityId = { $in: entityIds };
    }

    // Step 1: Group by entityId and count
    const aggregation = await this.documentModel.aggregate([
      {
        $match: {
          ...matchStage,
          entityId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$entityId',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          entityId: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Step 2: Fetch entity names
    const allEntityIds = aggregation.map((entry) => entry.entityId);

    const entities = await this.prisma.entity.findMany({
      where: {
        id: { in: allEntityIds },
      },
      select: {
        id: true,
        entityName: true,
      },
    });

    const entityNameMap = new Map(entities.map((e) => [e.id, e.entityName]));

    // Step 3: Construct final output
    const finalResult = aggregation.map((entry) => ({
      entityId: entry.entityId,
      count: entry.count,
      entityName: entityNameMap.get(entry.entityId) || 'Unknown',
    }));

    return finalResult;
  }

  async getDocumentChartDataByLocation(orgId) {
    const matchStage: any = {
      organizationId: orgId,
      documentState: 'PUBLISHED',
    };

    // Step 1: Group by locationId
    const aggregation = await this.documentModel.aggregate([
      {
        $match: {
          ...matchStage,
          organizationId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$locationId',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          locationId: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // console.log("aggregation",aggregation);
    // Step 2: Fetch location names
    const locationIdsToFetch = aggregation.map((entry) => entry.locationId);

    const locations = await this.prisma.location.findMany({
      where: {
        id: { in: locationIdsToFetch },
      },
      select: {
        id: true,
        locationName: true,
      },
    });

    const locationNameMap = new Map(
      locations.map((l) => [l.id, l.locationName]),
    );

    // Step 3: Format final result
    const finalResult = aggregation.map((entry) => ({
      locationId: entry.locationId,
      count: entry.count,
      locationName: locationNameMap.get(entry.locationId) || 'Unknown',
    }));

    return finalResult;
  }

  async populateFilteredDocumentList(documents: any[]) {
    const entityIds = new Set<string>();
    const locationIds = new Set<string>();
    const doctypeIds = new Set<string>();

    for (const doc of documents) {
      doc?.entityId && entityIds.add(doc.entityId);
      doc?.locationId && locationIds.add(doc.locationId);
      doc?.doctypeId && doctypeIds.add(doc.doctypeId);
    }

    const [entities, locations, doctypes] = await Promise.all([
      this.prisma.entity.findMany({
        where: { id: { in: Array.from(entityIds) } },
        select: { id: true, entityName: true },
      }),
      this.prisma.location.findMany({
        where: { id: { in: Array.from(locationIds) } },
        select: { id: true, locationName: true },
      }),
      this.doctypeModel
        .find({ _id: { $in: Array.from(doctypeIds) } })
        .select('documentTypeName _id')
        .lean(),
    ]);

    const entityMap = new Map(entities.map((e) => [e.id, e.entityName]));
    const locationMap = new Map(locations.map((l) => [l.id, l.locationName]));
    const doctypeMap = new Map(
      doctypes.map((d) => [String(d._id), d.documentTypeName]),
    );

    return documents.map((doc) => ({
      ...(doc.toObject?.() ?? doc),
      entityName: entityMap.get(doc.entityId) || 'Unknown',
      locationName: locationMap.get(doc.locationId) || 'Unknown',
      docTypeName: doctypeMap.get(String(doc.doctypeId)) || 'Unknown',
    }));
  }

  async getFilteredDocumentTableData(query: {
    organizationId: string;
    locationId?: string;
    entityId?: string;
    locationIds?: string[];
    entityIds?: string[];
    system?: string[];
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      organizationId,
      locationId,
      entityId,
      locationIds,
      entityIds,
      system,
      status,
      type,
      page = 1,
      limit = 10,
    } = query;

    const skipValue = (Number(page) - 1) * Number(limit);

    const matchStage: any = { organizationId };

    if (locationId) {
      matchStage.locationId = locationId;
      matchStage.documentState = 'PUBLISHED';
    }
    if (entityId) {
      matchStage.entityId = entityId;
      matchStage.documentState = 'PUBLISHED';
    }
    if (!!locationIds && !!locationIds?.length) {
      matchStage.locationId = { $in: locationIds };
    }
    if (!!entityIds && !!entityIds?.length) {
      matchStage.entityId = { $in: entityIds };
    }
    if (system && system.length > 0) {
      matchStage.system = { $eq: system };
      matchStage.documentState = 'PUBLISHED';
    }
    if (status) {
      matchStage.documentState = status;
    }
    if (type) {
      matchStage.docTypeId = type;
      matchStage.documentState = 'PUBLISHED';
    }

    // console.log("matchStage in getFilteredDocumentTableData",matchStage);

    const [documents, totalDocuments] = await Promise.all([
      this.documentModel
        .find(matchStage)
        .skip(skipValue)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      this.documentModel.countDocuments(matchStage),
    ]);

    const populatedDocs = await this.populateFilteredDocumentList(documents);

    return {
      data: populatedDocs,
      total: totalDocuments,
      page: Number(page),
      limit: Number(limit),
    };
  }
}
