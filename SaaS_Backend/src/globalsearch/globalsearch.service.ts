import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import mongoose, { Model } from 'mongoose';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DashboardFilter } from 'src/dashboard/dto/dashboard-filter.dto';
import { AuditService } from 'src/audit/audit.service';
import { Types } from 'mongoose';
import {
  Nonconformance,
  NonconformanceDocument,
} from 'src/audit/schema/nonconformance.schema';
import { Clauses } from 'src/systems/schema/clauses.schema';
import { HiraRegister } from 'src/risk-register/hiraRegisterSchema/hiraRegister.schema';
import { Hira } from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { MongoClient, ObjectId } from 'mongodb';
import { cara } from 'src/cara//schema/cara.schema';
import { CIP } from 'src/cip/schema/cip.schema';
import { referenceDocuments } from 'src/reference-documents/schema/reference-documents.schema';
import { Documents } from 'src/documents/schema/document.schema';
import { Doctype } from 'src/doctype/schema/doctype.schema';
import { length } from 'class-validator';
@Injectable()
export class GlobalsearchService {
  constructor(
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(Clauses.name) private ClauseModel: Model<Clauses>,
    @InjectModel(Nonconformance.name)
    private readonly NcModel: Model<NonconformanceDocument>,
    @InjectModel(HiraRegister.name)
    private readonly hiraRegisterModel: Model<HiraRegister>,
    @InjectModel(Doctype.name)
    private doctypeModel: Model<Doctype>,
    @InjectModel(Documents.name)
    private documentModel: Model<Documents>,
    @InjectModel(Hira.name)
    private readonly hiraModel: Model<Hira>,
    private prisma: PrismaService,
    private dashboardService: DashboardService,
    @InjectModel(cara.name) private caraModel: Model<cara>,
    @InjectModel(CIP.name) private CIPModel: Model<CIP>,
    private auditService: AuditService,
    @InjectModel(referenceDocuments.name)
    private referenceDocumentsModel: Model<referenceDocuments>,
  ) {}

  async findAllModules(queryParams) {
    return [
      {
        name: 'Documents',
        count: 10,
      },
      {
        name: 'Audit',
        count: 10,
      },
    ];
  }

  buildClauseQuery(
    searchQuery: string,
    systemsArray: any,
    organizationId: string,
    queryParams: any,
  ) {
    const systems = systemsArray ? systemsArray.split(',') : [];
    let query: any = {
      $or: [
        { number: { $regex: new RegExp(searchQuery, 'i') } },
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        { description: { $regex: new RegExp(searchQuery, 'i') } },
      ],
      organizationId,
      deleted: false, // Ensuring deleted clauses are excluded
    };

    if (systems && systems?.length) {
      query.systemId = { $in: systems };
    }
    return query;
  }
  async fetchClauses(searchQuery, systemsArray, organizationId, queryParams) {
    const clauseSearchQuery = this.buildClauseQuery(
      searchQuery,
      systemsArray,
      organizationId,
      queryParams,
    );
    //console.log('clauseSearchQuery in fetchClauses', clauseSearchQuery);

    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    const [clauseResult, clauseCountResult] = await Promise.all([
      this.ClauseModel.aggregate([
        { $match: clauseSearchQuery },
        {
          $project: {
            _id: 1,
            number: 1,
            name: 1,
            description: 1,
            systemId: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]).exec(),
      this.ClauseModel.aggregate([
        { $match: clauseSearchQuery },
        { $count: 'count' },
      ]).exec(),
    ]);

    const count = clauseCountResult.length ? clauseCountResult[0].count : 0;

    const enrichedClauses = await Promise.all(
      clauseResult.map(async (clause) => {
        const system = await this.SystemModel.findById(clause.systemId);
        return {
          ...clause,
          systemName: system?.name || null,
          applicable_locations: system
            ? await this.mapLocationIdsToNames(
                system.applicable_locations,
                this.prisma.location,
              )
            : null,
        };
      }),
    );

    return { data: enrichedClauses, count };
  }

  async fetchNonConformances(
    searchQuery,
    organization,
    queryParams,
    userLocationId,
    userEntityId,
  ) {
    // console.log("NC---> searchQuery, organization, queryParams, userLocationId", searchQuery, organization, queryParams, userLocationId);

    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    let ncQuery: any = {};
    if (queryParams?.filter) {
      ncQuery = {
        $or: [
          { id: { $regex: queryParams?.searchQuery, $options: 'i' } },
          { status: { $regex: queryParams?.searchQuery, $options: 'i' } },
          { severity: { $regex: queryParams?.searchQuery, $options: 'i' } },
        ],
        organizationId: organization,
        ...(queryParams?.location?.length && {
          location: { $in: queryParams.location },
        }),
        ...(queryParams?.entity?.length && {
          auditedEntity: { $in: queryParams.entity },
        }),
      };
    } else {
      ncQuery = {
        $or: [
          { id: { $regex: searchQuery, $options: 'i' } },
          { status: { $regex: searchQuery, $options: 'i' } },
          { severity: { $regex: searchQuery, $options: 'i' } },
        ],
        organizationId: organization,
        ...(queryParams?.userFilter &&
          userLocationId && {
            location: { $in: [userLocationId] },
          }),
        ...(queryParams?.userFilter &&
          userEntityId && {
            auditedEntity: { $in: [userEntityId] },
          }),
      };
    }

    // Fetch Non-Conformance Data
    const [ncResult, ncCount] = await Promise.all([
      this.NcModel.find(ncQuery)
        .select(
          '_id id clause severity location auditedEntity audit system organization',
        )
        .skip(skip)
        .limit(limit)
        .lean(),
      this.NcModel.countDocuments(ncQuery),
    ]);

    // Fetch Location Details
    const locationIdSet = new Set(ncResult.map((nc) => nc.location));
    const locationIdArray = Array.from(locationIdSet)?.filter(
      (location) => !!location,
    );

    const locationResult = await this.prisma.location.findMany({
      where: {
        id: {
          in: locationIdArray,
        },
      },
      select: {
        id: true,
        locationName: true,
      },
    });

    // Fetch Entity Details
    const entityIdSet = new Set(ncResult.map((nc) => nc.auditedEntity));
    const entityIdArray: any = Array.from(entityIdSet)?.filter(
      (entityId) => !!entityId,
    );

    // console.log("NC---> entityIdArray", entityIdArray);
    // console.log("NC---> entityIdSet", entityIdSet);

    const entityResult = await this.prisma.entity.findMany({
      where: {
        id: {
          in: entityIdArray,
        },
      },
      select: {
        id: true,
        entityName: true,
      },
    });

    // Create Mapping for Location & Entity
    const locationMap = locationResult.reduce((acc, location) => {
      acc[location.id] = location;
      return acc;
    }, {});

    const entityMap = entityResult.reduce((acc, entity) => {
      acc[entity.id] = entity;
      return acc;
    }, {});

    // Add Location & Entity Details to Response
    const ncData = ncResult.map((item: any) => ({
      ...item,
      locationDetails: locationMap[item.location] || {},
      entityDetails: entityMap[item.auditedEntity] || {},
    }));

    return { data: ncData, count: ncCount };
  }

  private buildHiraQuery(
    organization,
    searchQuery,
    queryParams,
    userLocationId,
    userEntityId,
  ) {
    let hiraQuery;
    // console.log("organization searchquery entityId querparams userlocationid", organization, searchQuery, entityId, queryParams, userLocationId);
    if (queryParams?.filter) {
      hiraQuery = {
        organizationId: organization,
        status: 'active',
        jobTitle: { $regex: queryParams?.searchQuery, $options: 'i' },
        ...(queryParams?.entity?.length && {
          entityId: { $in: queryParams.entity },
        }),
        ...(queryParams?.location?.length && {
          locationId: { $in: queryParams.location },
        }),
      };
    } else {
      hiraQuery = {
        organizationId: organization,
        status: 'active',
        jobTitle: { $regex: searchQuery, $options: 'i' },
        ...(queryParams?.userFilter &&
          userLocationId && {
            locationId: { $in: [userLocationId] },
          }),
        ...(queryParams?.userFilter &&
          userEntityId && {
            entityId: { $in: [userEntityId] },
          }),
      };
    }

    return hiraQuery;
  }


  async fetchAllCapa(
    searchQuery,
    organization,
    queryParams,
    userLocationId,
    userEntityId,
  ) {
    let capaQuery: any = {};
    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    if (queryParams?.filter) {
      capaQuery = {
        organizationId: queryParams?.organizationId,

        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
        ...(queryParams?.entity?.length && {
          entityId: { $in: queryParams.entity },
        }),
        ...(queryParams?.location?.length && {
          locationId: { $in: queryParams.location },
        }),
      };
    } else {
      capaQuery = {
        organizationId: organization,
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
        ...(queryParams?.userFilter &&
          userLocationId && {
            locationId: { $in: [userLocationId] },
          }),
        ...(queryParams?.userFilter &&
          userEntityId && {
            entityId: { $in: [userEntityId] },
          }),
      };
    }
    // console.log("capa query in fetchAllCapa", capaQuery);

    const [capaResult, capaCount] = await Promise.all([
      this.caraModel
        .find(capaQuery)
        .select('title description locationId entityId')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.caraModel.countDocuments(capaQuery),
    ]);

    if (capaResult?.length) {
      const entityIdSet = new Set(capaResult.map((capa) => capa.entityId));
      const locationIdSet = new Set(capaResult.map((capa) => capa.locationId));

      const [entityResult, locationResult] = await Promise.all([
        this.prisma.entity.findMany({
          where: {
            id: {
              in: [...entityIdSet],
            },
          },
        }),
        this.prisma.location.findMany({
          where: {
            id: {
              in: [...locationIdSet],
            },
          },
        }),
      ]);

      const entityMap = entityResult.reduce((acc, entity) => {
        acc[entity.id] = entity;
        return acc;
      }, {});

      const locationMap = locationResult.reduce((acc, location) => {
        acc[location.id] = location;
        return acc;
      }, {});

      const capaData = capaResult.map((capa) => {
        return {
          ...capa,
          entityDetails: entityMap[capa.entityId],
          locationDetails: locationMap[capa.locationId],
        };
      });

      return { data: capaData, count: capaCount };
    } else {
      return { data: [], count: capaCount };
    }
  }

  async fetchAllCip(
    searchQuery,
    organization,
    queryParams,
    userLocationId,
    userEntityId,
  ) {
    let cipQuery: any = {};
    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    if (queryParams?.filter) {
      cipQuery = {
        organizationId: organization,
        title: { $regex: queryParams?.searchQuery || '', $options: 'i' }, // Use regex for case-insensitive search
        ...(queryParams?.entity?.length && {
          'entity.id': { $in: queryParams?.entity }, // Match entities
        }),
        ...(queryParams?.location?.length && {
          'location.id': { $in: queryParams?.location }, // Match location by `location.id`
        }),
      };
    } else {
      cipQuery = {
        organizationId: organization,
        title: { $regex: searchQuery || '', $options: 'i' },
        ...(queryParams?.userFilter &&
          userLocationId && {
            'location.id': { $in: [userLocationId] }, // Match user's location by `location.id`
          }),
        ...(queryParams?.userFilter &&
          userLocationId && {
            'entity.id': { $in: [userEntityId] }, // Match entities
          }),
      };
    }

    //console.log("cipquery in fetchAllCip", cipQuery);

    const [cipResult, cipCount] = await Promise.all([
      this.CIPModel.find(cipQuery).skip(skip).limit(limit).lean(),
      this.CIPModel.countDocuments(cipQuery),
    ]);

    if (cipResult?.length) {
      const cipData = cipResult.map((cip) => {
        return {
          ...cip,
          entityDetails: cip?.entity,
          locationDetails: cip?.location,
        };
      });

      return { data: cipData, count: cipCount };
    } else {
      return { data: [], count: cipCount };
    }
  }

  async getAllHiraWithSteps(
    searchQuery = '',
    queryParams,
    organization,
    userLocationId,
    userEntityId,
  ) {
    try {
      const hiraQuery = this.buildHiraQuery(
        organization,
        searchQuery,
        queryParams,
        userLocationId,
        userEntityId,
      );
      //console.log('hiraQuery in getAllHiraWithSteps', hiraQuery);
      const page = queryParams?.page ? parseInt(queryParams.page) : 1;
      const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
      const skip = (page - 1) * limit; // Calculate the number of documents to skip
      const hiraResult = await this.hiraModel
        .find(hiraQuery, '_id jobTitle entityId locationId stepIds')
        .skip(skip)
        .limit(limit)
        .lean();

      const hiraCount = await this.hiraModel.countDocuments(hiraQuery);
      if (hiraResult?.length > 0) {
        const entityIdsSet = new Set(hiraResult.map((hira) => hira.entityId));
        const locationIdSet = new Set(
          hiraResult.map((hira) => hira.locationId),
        );

        const [entityResult, locationResult] = await Promise.all([
          this.prisma.entity.findMany({
            where: {
              id: {
                in: [...entityIdsSet],
              },
            },
            select: {
              id: true,
              entityName: true,
            },
          }),
          this.prisma.location.findMany({
            where: {
              id: {
                in: [...locationIdSet],
              },
            },
            select: {
              id: true,
              locationName: true,
            },
          }),
        ]);

        const entityMap = entityResult.reduce((acc, entity) => {
          acc[entity.id] = entity;
          return acc;
        }, {});

        const locationMap = locationResult.reduce((acc, location) => {
          acc[location.id] = location;
          return acc;
        }, {});

        const hiraData = hiraResult.map((hira) => {
          return {
            ...hira,
            entityDetails: entityMap[hira.entityId],
            locationDetails: locationMap[hira.locationId],
          };
        });

        return {
          data: hiraData,
          count: hiraCount,
        };
      } else {
        return {
          data: [],
          count: hiraCount,
        };
      }
    } catch (error) {
      //console.log('error in get all hira with steps in global search', error);
    }
  }

async fetchAllDocuments(
  searchQuery,
  organization,
  queryParams,
  user,
  userLocationId,
  userEntityId,
) {
  try {
    const page = parseInt(queryParams?.page || '1', 10);
    const limit = parseInt(queryParams?.limit || '100', 10);
    const skip = (page - 1) * limit;

    // Build filter query
    const hasFilters = !!queryParams?.filter;
    const docQuery: any = {
      organizationId: organization,
      documentState: 'PUBLISHED',
      ...(hasFilters && queryParams?.entityFilter?.length && {
        entityId: queryParams.entityFilter,
      }),
      ...(hasFilters && queryParams?.locationFilter?.length && {
        locationId: queryParams.locationFilter,
      }),
      ...(!hasFilters && queryParams?.userFilter && userLocationId && {
        locationId: [userLocationId],
      }),
      ...(!hasFilters && queryParams?.userFilter && userEntityId && {
        entityId: [userEntityId],
      }),
    };

    // Fetch paginated documents
    let documents = await this.documentModel
      .find(docQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const [doctypeIds, entityIds, locationIds]:any= [
      new Set(),
      new Set(),
      new Set(),
    ];

    documents.forEach((doc) => {
      if (doc?.doctypeId) doctypeIds.add(new ObjectId(doc.doctypeId));
      if (doc?.entityId) entityIds.add(doc.entityId);
      if (doc?.locationId) locationIds.add(doc.locationId);
    });

    // Parallel fetch related metadata
    const [doctype, entityData, locationData, documentCount]:any =
      await Promise.all([
        this.doctypeModel.find({ _id: { $in: Array.from(doctypeIds) } }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds)||[] } },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds)||[] } },
        }),
        this.documentModel.count(docQuery),
      ]);

    // Map data for quick access
    const doctypeMap:any = new Map(
      doctype.map((d) => [d._id.toString(), d]),
    );
    const entityMap:any = new Map(entityData.map((e) => [e.id, e]));
    const locationMap:any = new Map(locationData.map((l) => [l.id, l]));

    // Final transformation
    const result = documents.map((doc) => {
      const d = doc.toObject();
      return {
        ...d,
        department: entityMap.get(d.entityId)?.entityName || '',
        location: locationMap.get(d.locationId)?.locationName || '',
        documentType: doctypeMap.get(d.doctypeId?.toString())?.documentTypeName || '',
      };
    });

    return { data: result, count: documentCount };
  } catch (error) {
    throw new Error(`Failed to fetch documents ${error}`);
  }
}


  async fetchAllRefDocs(
    searchQuery,
    organization,
    queryParams,
    userLocationId,
  ) {
    try {
      let docQuery: any = {};
      const page = queryParams?.page ? parseInt(queryParams.page) : 1;
      const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
      const skip = (page - 1) * limit;
      if (queryParams?.filter) {
        docQuery = {
          organizationId: organization,
          topic: { $regex: searchQuery, $options: 'i' },
          ...(queryParams?.locationFilter?.length &&
            !queryParams?.locationFilter?.includes('All') && {
              'location.id': { $in: queryParams?.locationFilter },
            }),
        };
      } else {
        docQuery = {
          organizationId: organization,
          topic: { $regex: searchQuery, $options: 'i' },
          ...(queryParams?.userFilter &&
            userLocationId && {
              'location.id': { $in: [userLocationId] },
            }),
        };
      }

      //console.log("ref doc query in fetchAllRefDocs", docQuery);

      const result = await this.referenceDocumentsModel
        .find(docQuery)
        .skip(skip)
        .limit(limit)
        .lean();
      const count = await this.referenceDocumentsModel.countDocuments(docQuery);
      return {
        data: result,
        count: count,
      };
    } catch (error) {
      //console.log('error in fetchAllRefDocs in global search', error);
    }
  }

  async findAll(queryParams: DashboardFilter, user, req) {
    try {
      const { searchQuery, systemsArray, organization, entityId } = queryParams;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: req.user.id,
        },
      });
      const modulesNameAndCount = [];
      const documents = await this.fetchAllDocuments(
        searchQuery,
        organization,
        queryParams,
        user,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'Documents',
        count: documents.count,
      });

      // Clauses Search
      const clauses = await this.fetchClauses(
        searchQuery,
        systemsArray && systemsArray !== 'undefined' ? systemsArray : undefined,
        organization,
        queryParams,
      );
      // console.log("clauses in global search", clauses);
      modulesNameAndCount.push({
        name: 'Clauses',
        count: clauses.count,
      });

      // Non-Conformance Search (NC)
      const ncData = await this.fetchNonConformances(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'NC',
        count: ncData.count,
      });

      // console.log("active user in global search", activeUser);
      // console.log("searchQuery in global search", searchQuery);

      // HIRA Search

      const hiraData = await this.getAllHiraWithSteps(
        searchQuery,
        queryParams,
        organization,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'HIRA',
        count: hiraData?.count || 0,
      });


      //Capa Search
      const capaData = await this.fetchAllCapa(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'CAPA',
        count: capaData.count,
      });

      //CIP Search
      const cipData = await this.fetchAllCip(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'CIP',
        count: cipData.count,
      });

      //ref doc search
      const refDocData = await this.fetchAllRefDocs(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
      );
      modulesNameAndCount.push({
        name: 'Ref Doc',
        count: refDocData.count,
      });

      return {
        modulesNameAndCount,
        result: {
          document: documents.data,
          clauses: clauses.data,
          nc: ncData.data,
          hira: hiraData?.data || [],
          capa: capaData.data,
          cip: cipData.data,
          refDoc: refDocData.data,
        },
      };
    } catch (error) {
      console.error('Error in findAll API:', error);
      throw new Error('Failed to fetch data');
    }
  }

  async mapLocationIdsToNames(locationIds, locationsTable) {
    if (!locationIds || !locationsTable) {
      return null;
    }
    // ////console.log('locatinionids', locationIds);
    let locs = [];
    for (let loc of locationIds) {
      if (loc.id == 'All') {
        //////console.log('inside if all');
        const data = {
          id: 'All',
          _id: 'All',
        };
        locs.push(data);
      } else {
        const location = await locationsTable.findFirst({
          where: {
            id: loc.id,
          },
        });
        const data = {
          id: location.locationName,
          _id: location.id,
        };
        locs.push(data);
      }
    }
    //////console.log('locs array', locs);
    return locs;
  }
  async recycleBinList(userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME); // Replace with your database name

    const collections = [
      'Functions',

      'Location',
      'Entity',
      'Business',

      'User',

      'systems',
      'unitType',
      'auditsettings',
      'meetingtypes',
      'schedulemrms',
      'kpis',
    ];

    try {
      let result = [];
      for (const collection of collections) {
        // //console.log('collection name', collection);
        const table = db.collection(collection);
        //  //console.log('table', table);
        const docs = await table
          .find({ deleted: true, organizationId: activeUser.organizationId })
          .toArray();
        ////console.log(`Results in collection: ${collection}`);
        ////console.log(docs);
        let reords = [];

        result.push({ type: collection, documents: docs });
      }
      // //console.log('result', result);
      return result;
    } catch (err) {
      console.error('An error occurred:', err);
    } finally {
      client.close();
    }
  }
  async restoreAll(body, userid) {
    // console.log('body', body);
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    const idsToUpdate = await this.convertids(body);
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME); // Replace with your database name

    const collections = [
      'Functions',

      'auditsettings',

      'Location',
      'Entity',
      'Business',
      'Doctype',
      'User',

      'systems',
      'unitType',
      'meetingtypes',
      'schedulemrms',
      'kpis',
    ];
    try {
      let result = [];
      for (const collection of collections) {
        const table = db.collection(collection);
        // Update documents in the collection
        // console.log('table', idsToUpdate);
        const updateResult = await table.updateMany(
          {
            $and: [
              { _id: { $in: idsToUpdate } }, // Condition 1: Filter by document IDs
              { deleted: true },
              { organizationId: activeUser.organizationId }, // Condition 2: Add your additional condition here
            ],
          },
          //  { _id: { $in: idsToUpdate } }, // Filter by document IDs
          { $set: { deleted: false } }, // Update the 'deleted' field
        );
        //console.log('update rest', updateResult);
        result.push({ type: collection, updateResult });
      }
      // console.log('result', result);
      return result;
    } catch (err) {
      console.error('An error occurred:', err);
    }
    // finally {
    //   client.close();
    // }
  }
  async deleteAllByIds(data, userid) {
    const idsToDelete = await this.convertids(data); // Assuming you have a list of IDs to delete
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME); // Replace with your database name

    try {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((collection) => collection.name);
      const filteredCollectionNames = collectionNames.filter(
        (name) => name !== 'auditTrail',
      );
      let result = [];

      for (const collectionInfo of filteredCollectionNames) {
        const collectionName = collectionInfo;

        const table = db.collection(collectionName);
        // console.log('table', table);

        // Find all documents in the collection
        const documents = await table.find({}).toArray();
        // console.log('documents of table', documents, table);
        //skip the audittrial table for search
        if (collectionName === 'auditTrial') {
          continue;
        }
        // Check each document for the presence of IDs to be deleted
        for (const document of documents) {
          let containsId = false;

          for (const [key, value] of Object.entries(document)) {
            if (key === '_id') {
              continue; // Skip checking the _id field itself
            }

            if (Array.isArray(value)) {
              //console.log('inside if');
              // Check if the array contains any of the IDs to be deleted
              for (const id of value) {
                if (idsToDelete.includes(id)) {
                  containsId = true;
                  break;
                }
              }
            } else {
              //console.log('inside else');
              // Code block remains the same for non-array values
              if (typeof value === 'string' && idsToDelete.includes(value)) {
                containsId = true;
                break;
              }

              if (
                typeof value === 'string' &&
                ObjectId.isValid(value) &&
                idsToDelete.some((objId) => objId.toString() === value)
              ) {
                containsId = true;
                break;
              }

              if (
                typeof value === 'object' &&
                value !== null &&
                value.constructor.name === 'ObjectID' &&
                !value.equals(new ObjectId(document._id.toString()))
              ) {
                containsId = idsToDelete.includes(value.toString());
                if (containsId) break;
              }
            }
          }

          // console.log('containsId', containsId);

          if (containsId) {
            // //console.log(
            //   `Cannot delete IDs from ${collectionName} as they are referenced in other tables.`,
            // );
            return new ConflictException();
          }
        }

        // Delete documents in the collection based on IDs
        const deleteResult = await table.deleteMany({
          _id: { $in: idsToDelete },
        });
        result.push({ type: collectionName, deleteResult });
      }

      return result;
    } catch (err) {
      console.error('An error occurred:', err);
    } finally {
      client.close();
    }
  }
  async convertids(data) {
    let ids = [];
    for (let obj of data) {
      if (
        obj.moduleType === 'Documents' ||
        obj.moduleType === 'User' ||
        obj.moduleType === 'Location' ||
        obj.moduleType === 'Doctype' ||
        obj.moduleType === 'Business' ||
        obj.moduleType === 'Entity' ||
        obj.moduleType === 'Functions' ||
        obj.moduleType === 'unitType'
      ) {
        // console.log('type of id in convertids', typeof obj.id);
        ids.push(obj.id);
      } else {
        ids.push(new ObjectId(obj.id));
      }
    }
    return ids;
  }
}
