import {
  All,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UpdateSystemDto } from './dto/update-system.dto';
import { CreateSystemDto } from './dto/create-system.dto';
import { System, SystemDocument } from './schema/system.schema';
import { mongoFilterGenerator } from '../utils/mongoFilterGenerator.helper';
import { Types } from 'mongoose';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { PrismaService } from 'src/prisma.service';
import { Console } from 'node:console';
import { ObjectId } from 'mongodb';
import { Clauses } from './schema/clauses.schema';

@Injectable()
export class SystemsService {
  constructor(
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(Clauses.name) private ClauseModel: Model<Clauses>,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private prisma: PrismaService,
  ) {}

  /**
   * @method create
   *  This method creates a new system
   * @param userKcId User Kc id
   * @param createSystemDto system data
   * @returns created system
   */

  async create(userKcId: string, createSystemDto: CreateSystemDto) {
    // try {
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: userKcId,
      },
    });
    const isUnique = await this.isSystemNameUnique(
      user.organizationId,
      createSystemDto.name,
    );

    //////////console.log('isUnique', isUnique);
    // checking if the system name is unique organization wide
    if (!isUnique) {
      throw new ConflictException();
    }

    const newSystem = new this.SystemModel({
      ...createSystemDto,
      organizationId: user.organizationId,
    });
    const system: any = await newSystem.save();

    const promises = system.applicable_locations.map((item: any) => {
      if (item.id == 'All') return;
      else {
        return this.locationService.getLocationById(item.id);
      }
    });
    const res = await Promise.all(promises);

    return { ...system._doc, applicable_locations: res };
    // } catch (err) {
    //   // if system name exists we thorw conflict error
    //   if (err.message === 'Conflict') {
    //     throw new ConflictException('System name already exists');
    //   }

    //   throw new InternalServerErrorException();
    // }
  }

  /**
   * @method findAll
   * @param userKcId user KC id
   * @param skip number of entries to skip
   * @param limit number of entries to return
   * @returns array of systems
   */
  async findAll(userKcId: any, skip: number, limit: number) {
    try {
      const response = [];
      const user = await this.prisma.user.findFirst({
        where: {
          kcId: userKcId.id,
        },
      });
      const count: number = await this.SystemModel.countDocuments({
        organizationId: { $regex: user.organizationId, $options: 'i' },
        deleted: false,
      });

      const systems = await this.SystemModel.find({
        organizationId: { $regex: user.organizationId, $options: 'i' },
        deleted: false,
      })
        .skip(skip)
        .limit(limit);

      // looping through all of the systems
      interface ApplicableLocation {
        id: string;
        // Add other properties if needed
      }

      let access;
      for (let i = 0; i < systems.length; i++) {
        const item: any = systems[i];
        // ////////////////console.log('jv', i);
        // populating locations from postgres db
        if (userKcId.kcRoles.roles.includes('ORG-ADMIN')) {
          access = true;
        } else {
          // if (systems[i].applicable_locations.find((value)=>value.id ===user.locationId)) {
          //   access = true;
          // } else {
          //   access = false;
          // }
          access = systems[i].applicable_locations.some(
            (location: ApplicableLocation) => location?.id === user.locationId,
          );
        }
        const res = systems[i].applicable_locations.map((item: any) => {
          if (item.id === 'All') {
            return { id: 'All', locationName: 'All' };
          } else {
            //////////////console.log('inside else');
            return this.locationService.getLocationById(item?.id);
          }
        });

        const locData = await Promise.all(res); // resolving all pending promises
        const systemType = await this.organizationService.getSystemTypeById(
          item.type,
        );
        const clausedata = await this.getClausesForSystemId(item._id);
        response.push({
          ...item._doc,
          applicable_locations: locData,
          type: systemType?.name,
          clauses: clausedata,
          access,
        });
      }
      return { systems: response, count };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method findById
   *  This method finds a document by its ID and returns
   * @param id System id
   * @returns System
   */
  async findById(id: string) {
    try {
      const response = [];
      const system = await this.SystemModel.findById(id);
      let item: any = system;

      // populating locations from postgres db
      const res = system.applicable_locations.map((item: any) => {
        if (item.id === 'All') {
          return { id: 'All', locationName: 'All' };
        } else {
          return this.locationService.getLocationById(item.id);
        }
      });

      const locData = await Promise.all(res); // resolving all pending promises
      const clauses = await this.getClausesForSystemId(id);
      const systemType = await this.organizationService.getSystemTypeById(
        item.type,
      );
      return {
        ...item._doc,
        applicable_locations: locData,
        type: systemType,
        clauses: clauses,
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  async getAllSystemFromOrg(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      let systemData: any = await this.SystemModel.find({
        organizationId: activeUser.organizationId,
        deleted: false,
      }).select('_id name');
      systemData = systemData.map((value: any) => ({
        id: value?.id,
        name: value?.name,
      }));
      return systemData;
    } catch (err) {}
  }

  /**
   * @method update
   *  This method updates a system
   * @param id System ID
   * @param updateSystemDto Updated System ID
   * @param userKcId User KcId
   * @returns Updated system
   */
  async update(id: string, updateSystemDto: UpdateSystemDto, userKcId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: userKcId,
      },
    });
    const currentSystem = await this.SystemModel.findById(id);

    if (currentSystem.name !== updateSystemDto.name) {
      const isUnique = await this.isSystemNameUnique(
        user.organizationId,
        updateSystemDto.name,
      );

      const systemData = await this.SystemModel.find({
        organizationId: user.organizationId,
        //deleted: false,
        name: { $regex: updateSystemDto.name, $options: 'i' },
      });
      const systemIds: any = systemData.map((value) => value._id.toString());
      if (!systemIds.includes(id)) {
        if (!isUnique) {
          throw new ConflictException('System name already exists');
        }
      }
    }

    const system: any = await this.SystemModel.findByIdAndUpdate(
      id,
      updateSystemDto,
      { new: true },
    );

    const promises = system.applicable_locations.map((item: any) => {
      if (item.id === 'All') {
        return { id: 'All', locationName: 'All' };
      } else {
        return this.locationService.getLocationById(item.id);
      }
    });
    const locData = await Promise.all(promises);
    const systemType = await this.organizationService.getSystemTypeById(
      system.type,
    );
    return { ...system._doc, applicable_locations: locData, type: systemType };
  }

  /**
   * @method update
   *  This method update a system by its ID
   * @param id System ID
   * @returns Returns deleted system
   */
  async remove(id: string) {
    try {
      return await this.SystemModel.findByIdAndUpdate(id, {
        deleted: true,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
  async restoreSystem(id: string) {
    try {
      return await this.SystemModel.findByIdAndUpdate(id, {
        deleted: false,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
  async deleteSystem(id: string) {
    try {
      return await this.SystemModel.findByIdAndRemove(id);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method isSystemNameUnique
   *  This method checks if system name is unique for that organization
   * @param orgId Org ID
   * @param text System name
   * @returns Boolean
   */
  async isSystemNameUnique(orgId: string, text: string) {
    try {
      const system = await this.SystemModel.find({
        organizationId: { $regex: orgId, $options: 'i' },
        name: { $regex: text, $options: 'i' },
      });
      //////////console.log('system', system);
      return system.length === 0;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method searchSystem
   *  This method search for systems with provided filter parameters
   * @param query Filter parameters
   * @param user  Current user
   * @param realmName RealName
   * @returns Array of Systems
   */
  async searchSystem(query, user, realmName) {
    try {
      const response = [];

      if (query.location !== '') {
        const allLocations = await this.locationService.getLocationforOrg(
          realmName,
          user,
        );
        const location: any = allLocations.filter((item: any) => {
          return (
            item.locationName.toLowerCase() === query.location.toLowerCase()
          );
        });
        query.location = location[0].id;
      }

      const filters = mongoFilterGenerator(query);

      const count: any = await this.SystemModel.countDocuments(
        filters[0].$match,
      );
      const systems = await this.SystemModel.aggregate(filters);

      for (let i = 0; i < systems.length; i++) {
        const item: any = systems[i];
        const res = systems[i].applicable_locations.map((item: any) => {
          return this.locationService.getLocationById(item.id);
        });

        const locData = await Promise.all(res);
        const systemType = await this.organizationService.getSystemTypeById(
          item.type,
        );
        response.push({
          ...item,
          applicable_locations: locData,
          type: systemType.name,
        });
      }
      return { systems: response, count };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method duplicateSystem
   *  This method creates a duplicate system from the given system ID
   * @param id System ID
   * @returns Newly created System
   */
  async duplicateSystem(id: string) {
    try {
      const system = await this.SystemModel.findById(id).select(
        '-__v -_id -clauses._id -applicable_locations._id -createdAt -updatedAt',
      );

      if (system === null) {
        throw new InternalServerErrorException();
      }

      const newSystem = new this.SystemModel({
        type: system.type,
        name: '',
        applicable_locations: system.applicable_locations,
        // clauses: system.clauses,
        description: system.description,
      });

      return await newSystem.save();
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method AddNewClause
   *  This method adds a new clause to a system
   * @param systemId System ID
   * @param data Clause data
   * @returns Updated System
   */
  async AddNewClause(systemId: string, data: any) {
    try {
      // const system = await this.SystemModel.findByIdAndUpdate(
      //   systemId,
      //   {
      //     $push: { clauses: data },
      //   },
      //   { new: true },
      // );
      // return system;
      const clauseadded: any = await this.ClauseModel.create(data);
      const system = await this.SystemModel.findById(clauseadded.systemId);
      const organization = await this.prisma.organization.findUnique({
        where: {
          id: clauseadded.organizationId,
        },
      });
      const finalClause = {
        ...clauseadded.toObject(),
        system: system.name,
        orgName: organization.realmName,
      };
      return finalClause;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method updateClauses
   *  This method updates a clause of a system
   * @param systemId System ID
   * @param clauseId Clause ID
   * @param data Clause data to update
   * @returns Updates system
   */
  async updateClauses(clauseId: string, data: any) {
    try {
      const clauses: any = await this.ClauseModel.findByIdAndUpdate(
        clauseId,
        data,
        { new: true, runValidators: true },
      );

      if (!clauses) {
      } else {
        // Handle the updated document (system) here
        const system = await this.SystemModel.findById(clauses.systemId);
        const organization = await this.prisma.organization.findUnique({
          where: {
            id: clauses.organizationId,
          },
        });
        const finalClause = {
          ...clauses.toObject(),
          system: system.name,
          orgName: organization.realmName,
        };
        return finalClause;
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  /**
   * @method removeClause
   *  This method removes clause from a system
   * @param systemId System ID
   * @param clauseId Clause ID
   * @returns Returns updated System
   */
  async removeClause(clauseId: string) {
    try {
      const clause = await this.ClauseModel.findOneAndUpdate(
        { _id: clauseId },
        { deleted: true },
      );
      return clause._id;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
  async restoreClause(clauseId: string) {
    try {
      const clause = await this.ClauseModel.findOneAndUpdate(
        { _id: clauseId },
        { deleted: false },
      );
      return clause._id;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
  async deleteClause(clauseId: string) {
    try {
      const clause = await this.ClauseModel.findOneAndDelete({ _id: clauseId });
      return clause._id;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method getSystemBySystemType
   *  This method fetches all systems by system type
   * @param type System type
   * @returns Array of systems
   */
  async getSystemBySystemType(type: string) {
    return this.SystemModel.find({
      type: { $regex: type, $options: 'i' },
    });
  }

  /**
   * @method getClauses
   *  This method fetches all the clauses for a given system ID
   * @param id System ID
   * @returns Clauses
   */
  async getClauses(query) {
    const sys = query.split(',');
    ////////////////console.log('query', sys);
    interface Clause extends Document {
      number: string;
      name: string;
      description: string;
      _id: mongoose.Types.ObjectId;
    }

    ////console.log("sys",sys)

    let clauses = await this.ClauseModel.find({ systemId: { $in: sys } });

    let finalResult = [];

    for (let value of clauses) {
      let system = await this.SystemModel.findById(value.systemId).select(
        'name',
      );
      finalResult.push({
        id: value._id,
        name: `${value.number} - ${value.name} - ${system.name}`,
        number: value.number,
      });
    }
    //////////////console.log('cvalue', c);
    // for (let clause of c) {
    //   ////////////////console.log('clause value', clause);
    //   let clausevalue = clause.clauses;
    //   for (let value of clausevalue) {
    //     let newval: any = value;
    //     ////////////////console.log('clauses valuein for loop', newval.number);
    //     const data = {
    //       number: newval.number,
    //       name1: newval.name,
    //       id: newval._id,
    //       systemId: clause._id,
    //       systemName: clause.name,
    //       name: `${clause.name}-${newval.name}-${newval.number}`,
    //     };
    //     clauses.push(data);
    //   }
    // }

    return finalResult;
  }
  async getClausesForSystemId(systemId) {
    let clauses = [];
    const result = await this.ClauseModel.find({
      systemId: systemId,
      deleted: false,
    });
    ////console.log('clauses', result);
    return result;
  }

  /**
   * @method getClauseById
   *  This method fetches a clauses for a given clause ID
   * @param id Clause ID
   * @returns Clause
   */
  async getClauseById(id: string) {
    const res = await this.ClauseModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      // { $project: { _id: '0', clauses: 1 } },
      // { $unwind: '$clauses' },
      // { $match: { 'clauses._id': new Types.ObjectId(id) } },
    ]);
    return res[0];
  }

  async displaySystem(location: any, userId: any) {
    try {
      const orgId = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });

      try {
        let result;
        const finalResult = [];
        if (userId.kcRoles.roles.includes('ORG-ADMIN')) {
          if (location.includes('All')) {
            result = await this.SystemModel.find({
              // 'applicable_locations.id': locid.id,
              organizationId: orgId.organizationId,
              deleted: false,
            });
          } else {
            // const locIds = location.map((value) => value.id);
            let locations = [...location, 'All'];
            result = await this.SystemModel.find({
              // 'applicable_locations.id': { $in: locations },
              organizationId: orgId.organizationId,
              deleted: false,
            });
          }
        } else {
          const locations = ['All', orgId.locationId];
          // ////////////////console.log("locations",locations)
          result = await this.SystemModel.find({
            // 'applicable_locations.id': { $in: locations },
            organizationId: orgId.organizationId,
            deleted: false,
          });
        }

        for (let value of result) {
          const objectValue = {
            id: value._id,
            name: value.name,
          };
          finalResult.push(objectValue);
        }
        //////////////console.log('finalResult', finalResult);
        return finalResult;
      } catch (error) {
        return {
          'Error Message': error.message,
          message: 'Problem in finding Location in system master',
        };
      }
    } catch (error) {
      return {
        'Error Message': error.message,
        message: 'Problem in finding Location id',
      };
    }
  }
  async displaySystemForGivenlocation(location: any, userId: any) {
    try {
      const orgId = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });
      // console.log('location', location);
      try {
        let result;
        const finalResult = [];
        if (userId.kcRoles.roles.includes('ORG-ADMIN')) {
          if (location.includes('All')) {
            result = await this.SystemModel.find({
              // 'applicable_locations.id': locid.id,
              organizationId: orgId.organizationId,
              deleted: false,
            });
          } else {
            const locationArray = Array.isArray(location)
              ? location
              : [location];

            // Add 'All' only if it's not already in the array
            const locations = Array.from(new Set(['All', ...locationArray]));
            result = await this.SystemModel.find({
              'applicable_locations.id': { $in: locations },
              organizationId: orgId.organizationId,
              deleted: false,
            });
          }
        } else {
          const locationArray = Array.isArray(location) ? location : [location];

          // Add 'All' only if it's not already in the array
          const locations = Array.from(new Set(['All', ...locationArray]));
          // console.log('locations', locations);
          result = await this.SystemModel.find({
            'applicable_locations.id': { $in: locations },
            organizationId: orgId.organizationId,
            deleted: false,
          });
        }

        for (let value of result) {
          const objectValue = {
            id: value._id,
            name: value.name,
          };
          finalResult.push(objectValue);
        }
        console.log('finalResult', finalResult);
        return finalResult;
      } catch (error) {
        return {
          'Error Message': error.message,
          message: 'Problem in finding Location in system master',
        };
      }
    } catch (error) {
      return {
        'Error Message': error.message,
        message: 'Problem in finding Location id',
      };
    }
  }
  async displayAllSystemsForOrg(user, loc) {
    try {
      const finalResult = [];
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      let result;
      if (loc.includes('All')) {
        result = await this.SystemModel.find({
          organizationId: activeUser.organizationId,
          deleted: false,
          // 'applicable_locations.id': { $in: [...loc, 'All'] },
        }).select('_id name');
      } else {
        result = await this.SystemModel.find({
          organizationId: activeUser.organizationId,
          deleted: false,
          'applicable_locations.id': { $in: [loc, 'All'] },
        }).select('_id name');
      }

      ////////////////console.log('result', result);
      result.map((value) => {
        const pushValue = {
          id: value._id,
          name: value.name,
        };
        finalResult.push(pushValue);
      });
      return finalResult;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getAllClausesByOrgId(orgId) {
    let clauses = await this.ClauseModel.find({
      organizationId: orgId,
      deleted: false,
    });

    return clauses;
  }
}
