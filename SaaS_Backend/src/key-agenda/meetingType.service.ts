import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MeetingType } from './schema/meetingType.schema';
import { PrismaService } from 'src/prisma.service';

import { System, SystemDocument } from 'src/systems/schema/system.schema';

// import auditTrial from '../watcher/changesStream';
import { Agenda } from 'src/mrm/schema/agenda.schema';
import { Logger } from 'winston';
import { error } from 'console';

@Injectable()
export class MeetingTypeService {
  constructor(
    @InjectModel(MeetingType.name) private keyAgendaModel: Model<MeetingType>,
    @InjectModel(Agenda.name) private AgendaModel: Model<Agenda>,
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @Inject('Logger') private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}
  async create(data: any, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      this.logger.debug(
        `createMeetingType started for $${activeUser} with data ${data}`,
      );
      // const auditTrail = await auditTrial(
      //   'meetingtypes',
      //   'MRM',
      //   'Meeting Types',
      //   user.user,
      //   activeUser,
      //   '',
      // );
      // setTimeout(async () => {
      const keyAgenda = new this.keyAgendaModel({
        ...data,
      });

      const result = await keyAgenda.save();
      this.logger.debug(`created meeting type`);
      return result;
      // }, 1000);
    } catch (err) {
      ////////////////console.log(err, 'err');
      throw new InternalServerErrorException();
    }
  }
  async getKeyAgendaByUnits(
    orgId: string,
    locationId: any,
    currentYear: any,
    user,
  ) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    try {
      this.logger.debug(
        `getKeyAgendaByUnits service started for ${activeUser} and orgId ${orgId}`,
      );
      ////console.log('active user', activeUser);
      const condition = {
        organizationId: orgId,
        $or: [
          { location: { $elemMatch: { $in: locationId } } }, // Include specific locations
          { location: 'All' }, // Include records with location set to 'All'
        ],
        deleted: false,
        // currentYear: currentYear ? currentYear : moment().year(),
      };
      // //console.log('condition', condition);
      this.logger.debug(
        `if location is All then remve specific location condition`,
      );
      if (locationId.includes('All') || locationId === '') {
        delete condition['location'];
      }
      this.logger.debug(`built condition to fetch ${condition}`);
      let keyAgenda = await this.keyAgendaModel.find(condition);
      if (user.kcRoles.roles.includes('ORG-ADMIN')) {
        this.logger.debug(`user is org dmin return all data ${keyAgenda}`);
        return keyAgenda;
      }

      // Filter key agendas where the logged-in user is in the owner list
      const filteredData = keyAgenda.filter((item: any) =>
        item.owner.some((owner: any) => owner.id === activeUser.id),
      );
      // //console.log('filtered data', filteredData);
      //fetch agenda of each meeting type
      this.logger.debug(
        `user is not org admin so return meeting types where he is owner`,
      );
      return filteredData;
      // return keyAgenda;
    } catch (err) {
      this.logger.error(
        `getKeyAgendaByUnits failed for ${activeUser}`,
        err?.stack || err?.message,
      );
      throw new InternalServerErrorException();
    }
  }
  async getKeyAgendaByUnitsWithoutFilter(query, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    try {
      this.logger.debug(
        `getKeyAgendaByunitsWithoutFilter ${query} for user ${activeUser}`,
      );
      const pages = Number(query.page) || 1;
      const skip = (pages - 1) * Number(query.limit);
      // console.log('query', query);

      const condition: any = {
        organizationId: query.orgId,
        deleted: false,
      };

      // Determine the location criteria based on filterLocations
      const locations =
        query.filteredLocations && query.filteredLocations.length > 0
          ? query.filteredLocations
          : query.locationId;
      // console.log('locations', locations);
      // Check if locations are provided and are an array
      if (Array.isArray(locations) && locations.length > 0) {
        // Always include 'All' in the condition if it's not already present
        const locationConditions: any = [
          { location: { $in: locations } }, // Match specified locations
        ];

        // Include 'All' if it's not in the locations array
        if (!locations.includes('All')) {
          locationConditions.push({ location: 'All' });
        }

        // Set up the final location condition
        condition.$or = locationConditions;
      }
      this.logger.debug(`condition formed ${condition}`);
      const count = await this.keyAgendaModel.countDocuments(condition);

      let keyAgenda = await this.keyAgendaModel
        .find(condition)
        .skip(skip)
        .sort({ name: 1 })
        .limit(query.limit);
      this.logger.debug(`fetched meetingtypes ${count}`);
      let keyagendas = [];
      const keyAgendaWithAgendas = await Promise.all(
        keyAgenda.map(async (agendaItem) => {
          // Fetch agendas where meetingType matches the _id in keyAgenda
          const agendas = await this.AgendaModel.find({
            meetingType: agendaItem._id.toString(),
          }).lean();
          const agendasmapped = agendas.map((item: any) => item.name);
          const data = {
            _id: agendaItem?._id,

            organizationId: agendaItem?.organizationId,

            name: agendaItem?.name,

            creator: agendaItem?.creator,

            owner: agendaItem?.owner,

            applicableSystem: agendaItem?.applicableSystem,

            applicableLocation: agendaItem?.applicableLocation,

            location: agendaItem?.location,

            description: agendaItem?.description,

            deleted: agendaItem?.deleted,

            createdAt: agendaItem?.createdAt,
            updatedAt: agendaItem?.updatedAt,

            participants: agendaItem?.participants,
            agendas: agendasmapped,
          };
          keyagendas.push(data);
        }),
      );
      // console.log('keyagendawith names', keyagendas);

      return { keyAgenda: keyagendas, count: count };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  //getKeyAgendaByOrgId
  async getKeyAgendaByOrgId(query) {
    try {
      this.logger.debug(`getKeyAgnedaByOrgId started for ${query}`);
      const page = query.page || 1; // Default to page 1 if not provided
      const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
      const skip = (page - 1) * limit;
      const keyAgenda = await this.keyAgendaModel
        .find({
          organizationId: query.orgId,
          // currentYear: query.currentYear ? query.currentYear : moment().year(),
          deleted: false,
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
      //fetch agenda of each meeting type
      let keyagendas = [];
      const keyAgendaWithAgendas = await Promise.all(
        keyAgenda.map(async (agendaItem) => {
          this.logger.debug(`processing meeting type ${agendaItem}`);
          // Fetch agendas where meetingType matches the _id in keyAgenda
          const agendas = await this.AgendaModel.find({
            meetingType: agendaItem._id.toString(),
          }).lean();
          const agendasmapped = agendas.map((item: any) => item.name);
          const data = {
            _id: agendaItem?._id,

            organizationId: agendaItem?.organizationId,

            name: agendaItem?.name,

            creator: agendaItem?.creator,

            owner: agendaItem?.owner,

            applicableSystem: agendaItem?.applicableSystem,

            applicableLocation: agendaItem?.applicableLocation,

            location: agendaItem?.location,

            description: agendaItem?.description,

            deleted: agendaItem?.deleted,

            createdAt: agendaItem?.createdAt,
            updatedAt: agendaItem?.updatedAt,

            participants: agendaItem?.participants,
            agendas: agendasmapped,
          };
          keyagendas.push(data);
        }),
      );

      return { keyAgenda: keyagendas, count: keyagendas.length };
    } catch (err) {
      ////////////////console.log(err, 'err');
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      // const auditTrail = await auditTrial(
      //   'meetingtypes',
      //   'MRM',
      //   'Meeting Types',
      //   user.user,
      //   activeUser,
      //   '',
      // );
      // setTimeout(async () => {
      this.logger.debug(`deleting meeting type ${id}`);
      const data: any = {
        deleted: true,
      };
      const result = await this.keyAgendaModel.findByIdAndUpdate(id, data);
      return result;
      // }, 1000);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, data: any, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      // const auditTrail = await auditTrial(
      //   'meetingtypes',
      //   'MRM',
      //   'Meeting Types',
      //   user.user,
      //   activeUser,
      //   '',
      // );
      // setTimeout(async () => {
      this.logger.debug(`update meeting type service called by ${activeUser}`);
      const result = await this.keyAgendaModel.findByIdAndUpdate(id, {
        ...data,
      });
      this.logger.log(
        `update meeting type api successful ${result} for ${id} user=${activeUser}`,
        '',
      );
      return result;
      // }, 1000);
    } catch (err) {
      console.error(err);
      this.logger.error(
        `update/${id} meeting type failed for ${activeUser}`,
        err?.stack || err?.message,
      );
      throw new InternalServerErrorException();
    }
  }
  async getMeetingTypeById(id: string) {
    try {
      this.logger.debug(`getMEetingTypeById/${id} service started`);
      const result = await this.keyAgendaModel.findById(id);
      this.logger.log(`getMeetingTypeId/${id} service successful `, '');
      return result;
    } catch (err) {
      // console.error(err);
      this.logger.error(
        `getMeetingTypeById/${id} failed`,
        err?.stack || err?.message,
      );
      throw new InternalServerErrorException();
    }
  }

  async getKeyAgendaMRMByUnitName(query, user: any) {
    // //console.log('system value', query.applicationSystemID);
    const page = query.page || 1; // Default to page 1 if not provided
    const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided
    const skip = (page - 1) * limit;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    this.logger.debug(
      `getKeyAgendaMRMByUnitName service started for ${activeUser} with ${query}`,
    );
    try {
      const keyAgenda = await this.keyAgendaModel
        .aggregate([
          {
            $match: {
              organizationId: query.orgId,
              deleted: false,
              $or: [
                {
                  location: {
                    $in: query.unitId, // Match any of the locations in the query array
                  },
                }, // Match specific location
                { location: 'All' }, // Match "All"
              ],
              // applicableSystem: { $in: systems },
              // currentYear: query.currentYear
              //   ? query.currentYear
              //   : moment().year(),
            },
          },
          {
            $sort: { createdAt: -1 }, // Sort by createdAt field in descending order (latest first)
          },
          {
            $lookup: {
              from: 'mrms',
              localField: '_id',
              foreignField: 'keyAgendaId',
              as: 'mrmData',
            },
          },
          {
            $project: {
              _id: 1,
              owner: 1,
              name: 1,
              participants: 1,
              mrmData: { $first: '$mrmData' },
              applicableSystem: 1,
              location: 1,
            },
          },
        ])
        .skip(skip)
        .limit(limit);
      this.logger.debug(
        `getKeyAgendaMRMByUnitName fetched MeetingTypes ${keyAgenda?.length}`,
      );
      // console.log('keyagenda', keyAgenda);
      let finalresult = [];
      for (let data of keyAgenda) {
        this.logger.debug(`processing meeting type ${data}`);
        let location;
        if (data.location[0] == 'All') location = 'All';
        else {
          location = await this.prisma.location.findMany({
            where: {
              id: data.location[0], // Assuming unitId is an array of location IDs
            },
          });
        }
        this.logger.debug(`fetched location ${location}`);
        // //console.log('location', location);
        let system: any = await this.SystemModel.find({
          _id: { $in: data.applicableSystem },
        });
        this.logger.debug(`fetched system ${system}`);

        const data1: any = {
          _id: data._id,
          name: data.name,
          owner: data.owner,
          applicableSystem: system,
          participants: data.participants,
          unitId: location,
          mrmData: data.mrmData,
        };
        finalresult.push(data1);
      }
      // if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      //   return keyAgenda;
      // }
      let count = await this.keyAgendaModel.aggregate([
        {
          $match: {
            organizationId: query.orgId,
            deleted: false,
            $or: [
              { location: { $in: query.unitId } }, // Match specific location (handle unitId correctly)
              { location: 'All' }, // Match "All"
            ],
          },
        },
        {
          $count: 'totalCount', // Use $count to return a single field with the total count
        },
      ]);
      console.log('result', finalresult);
      const totalCount = count.length > 0 ? count[0].totalCount : 0;
      this.logger.log(
        `getKeyAgendMRMByUnitName successful ${totalCount} for query ${query}`,
        '',
      );
      return { result: finalresult, count: totalCount };
    } catch (err) {
      this.logger.error(`failed ${error}`);
      console.log(err, 'err');
      throw new InternalServerErrorException();
    }
    // } else return [];
  }

  async getSchedulePeriodByUnit(
    orgId: string,
    locationID: string,
    systemID: any,
  ) {
    try {
      this.logger.debug(
        `getSchedulePeriodByUnit service started orgId= ${orgId} locatonId=${locationID} systemId=${systemID}`,
      );
      const keyAgenda = await this.keyAgendaModel.aggregate([
        {
          $match: {
            organizationId: orgId,
            deleted: false,
            $or: [
              { location: { $in: [locationID] } }, // Match specific location
              { location: 'All' }, // Match "All"
            ],
            applicableSystem: { $in: [...systemID] },
          },
        },
        {
          $lookup: {
            from: 'mrms',
            localField: '_id',
            foreignField: 'keyAgendaId',
            as: 'mrmData',
          },
        },
        {
          $project: {
            _id: 1,
            owner: 1,
            name: 1,
            mrmData: { $first: '$mrmData' },
          },
        },
      ]);
      this.logger.debug(`fetched meetingTypes ${keyAgenda}`);
      this.logger.log(
        `getSchedulePEriodByUnit service successful for orgid=${orgId} system=${systemID} locationId=${locationID}`,
        '',
      );
      //////console.log('keyagenda', keyAgenda);
      return keyAgenda;
    } catch (err) {
      this.logger.error(
        `getSchedulePEriodByUnit failed for orgid=${orgId} system=${systemID} locationId=${locationID} ${error}`,
        err?.stack || err?.message,
      );
      ////////////////console.log(err, 'err');
      throw new InternalServerErrorException();
    }
  }

  async searchSchedule(query, user) {
    try {
      this.logger.debug(
        `searchSchedule(meeting type) service started for ${query}`,
      );
      const pages = Number(query.page) || 1;
      //console.log('querytext', query.search, typeof query.text);
      const skip = (pages - 1) * Number(query.limit);

      const newRes = await this.keyAgendaModel
        .find({
          organizationId: query.orgId,
          deleted: false,

          $or: [
            { description: { $regex: query.search, $options: 'i' } },
            {
              name: { $regex: query.search, $options: 'i' },
            },
            { 'owner.username': { $regex: query.search, $options: 'i' } },
            { 'owner.email': { $regex: query.search, $options: 'i' } },
          ],
        })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(query.limit);
      this.logger.debug(``);
      return newRes;
    } catch (err) {
      //////////////console.log(err, 'err');
      throw new InternalServerErrorException();
    }
  }
  async getColumnFilterList(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    this.logger.debug(
      `getcolunFilterList for meeting type started for ${activeUser}`,
    );
    try {
      const locationData = await this.keyAgendaModel
        .find({
          organizationId: activeUser.organizationId,
        })
        .select('applicableLocation.id applicableLocation.locationName')
        .lean();
      this.logger.debug(`found locations ${locationData}`);
      const allLocations = locationData.flatMap(
        (item) => item.applicableLocation,
      );

      const uniqueLocations = Array.from(
        new Map(allLocations.map((loc: any) => [loc.id, loc])).values(),
      );

      const sortedUniqueLocations = uniqueLocations.sort((a, b) =>
        a.locationName.localeCompare(b.locationName),
      );

      // Format the sorted locations
      const formattedLocations = sortedUniqueLocations.map((loc) => ({
        id: loc.id,
        locationName: loc.locationName,
      }));
      this.logger.debug(
        `getColumnFilterList service successful ${formattedLocations?.length} for user ${activeUser}`,
      );
      // console.log(formattedLocations);
      this.logger.log(
        `getColumnFilterList service successful ${formattedLocations?.length} for user ${activeUser}`,
        '',
      );
      return formattedLocations;
    } catch (err) {
      // this.logger.log(
      //   `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForSchedule failed`,
      //   'MRM-Controller',
      // );
    }
  }
}
