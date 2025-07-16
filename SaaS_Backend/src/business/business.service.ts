import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';
import { LocationService } from 'src/location/location.service';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
    private readonly locationservice: LocationService,
    private readonly roleService: RolesService,
  ) {}
  //api for creating businesstype
  async createBusinessType(data) {
    const { name, createdBy, organizationId } = data;
    try {
      this.logger.log('createfunctionervice started', 'createBusinessType');
      const btid = await this.prisma.businessType.create({
        data: {
          name,
          createdBy,
          organizationId,
        },
      });
      return { businesstypeid: btid.id, businesstypename: btid.name };
    } catch (error) {
      this.logger.log(
        'cannot create business type:exception occured',
        'createBusinessType',
      );
    }
  }
  //api to get businesstype by id
  async getBusinessTypeById(id) {
    try {
      this.logger.log(
        'getbusinesstypebyid service started',
        'getBusiessTypeById',
      );
      const businesstype = await this.prisma.businessType.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      });
      return businesstype;
    } catch (error) {
      this.logger.error(
        'exception occured:unable to find businesstypebyid',
        error,
      );
      return error;
    }
  }
  //this api get all businesstypes by org id
  async getAllBusinessTypes(orgid) {
    try {
      this.logger.log(
        'getAllBusinessTypes service started',
        'getAllBusinessTypes',
      );
      const businessType = await this.prisma.businessType.findMany({
        where: {
          organizationId: orgid,
          deleted: false,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return businessType;
    } catch (error) {
      this.logger.error(
        'exception occured:unables to find businesstypes',
        error,
      );
      return error;
    }
  }
  //this api is used to update buisnesstype,param-id of the bt to be updated
  async updateBusinessType(id, data) {
    const { name } = data;
    try {
      this.logger.log(
        'updatebusinesstype service started',
        'updatebusinesstype',
      );
      const ubt = await this.prisma.businessType.update({
        where: {
          id: id,
        },
        data: {
          name: name,
        },
      });
      return { businesstypeid: id, businesstypename: ubt.name };
    } catch (error) {
      this.logger.log(
        'exception occured:cannot update businesstype',
        'updateBusinessType',
      );
      return error;
    }
  }
  async permanentDeleteBusinessTypeById(id) {
    try {
      this.logger.log(
        `permanentdeletebusinesstypebyid service started ${id}`,
        'permanentDelete',
      );

      const result = await this.prisma.businessType.delete({
        where: {
          id: id,
        },
      });
      return result.id;
    } catch (error) {
      this.logger.error(
        'exception occured:deletebusinesstypebyid',
        'deletebusinesstypebyid',
      );
      return error;
    }
  }
  //this api is used to create business for businesstype,param-id of
  async createBusinessForBusinessType(data) {
    const { name, createdBy, organizationId } = data;
    try {
      this.logger.log(
        'createBusinessforBusinesstype started',
        'createBusinessForBusinessType',
      );

      const bus = await this.prisma.business.create({
        data: {
          name: name,
          //  businessTypeId: id,
          organizationId: organizationId,
          createdBy: createdBy,
        },
      });
      return bus.id, bus.name;
    } catch (error) {
      this.logger.error('exception occured while creating business', error);
      return error;
    }
  }
  //this api is used to get business by businesstype
  // async getBusinessByBusinessType(id) {
  //   try {
  //     this.logger.log(
  //       'getBusinessByBusinessType service started',
  //       'getBusinessByBusinessType',
  //     );
  //     const business = await this.prisma.business.findMany({
  //       where: {
  //         businessTypeId: id,
  //       },
  //     });

  //     return business;
  //   } catch (error) {
  //     this.logger.error('exception occured:getBusinessByBusinessType', error);
  //     return error;
  //   }
  // }
  //this api is used to update business,param business id to be updated
  async updateBusiness(id, data) {
    //////console.log('updateBusiness');
    const { name, updatedBy } = data;
    try {
      this.logger.log(
        'updatebusiness service started',
        'updateBusinessByBusinessType',
      );
      const bus = await this.prisma.business.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          updatedBy: updatedBy,
        },
      });
      return bus;
    } catch (error) {
      this.logger.error(
        'exception occured:updateBusinessByBusinessType',
        'updateBusinessByBusinessType',
      );
      return error;
    }
  }
  //this api is used to get business details,param-business id
  async getBusinessById(id) {
    try {
      this.logger.log('getBusinessById started', this.getBusinessById);
      const business = await this.prisma.business.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
      return business;
    } catch (error) {
      this.logger.error('exception occured:getBusinessById', 'getBusinessById');
      return error;
    }
  }
  //this api is used to delete a business type and also deletes all business under it,param-businesstype id to be deleted
  async deleteBusinessTypeById(id) {
    try {
      this.logger.log(
        'deletebusinesstypebyid service started',
        'deleteBusinessById',
      );
      //first delete all business under business type
      // const business = await this.prisma.business.deleteMany({
      //   where: {
      //     businessTypeId: id,
      //   },
      // });
      const result = await this.prisma.businessType.update({
        where: {
          id: id,
        },
        data: {
          deleted: true,
        },
      });
      return result.id;
    } catch (error) {
      this.logger.error(
        'exception occured:deletebusinesstypebyid',
        'deletebusinesstypebyid',
      );
      return error;
    }
  }
  async restoreBusinessTypeById(id) {
    try {
      this.logger.log(
        `restore /restoreBusinessTypeById/${id}`,
        'restoreBusinesstypeById',
      );
      //first delete all business under business type
      // const business = await this.prisma.business.deleteMany({
      //   where: {
      //     businessTypeId: id,
      //   },
      // });
      const result = await this.prisma.businessType.update({
        where: {
          id: id,
        },
        data: {
          deleted: false,
        },
      });
      return result.id;
    } catch (error) {
      this.logger.error(
        'exception occured:deletebusinesstypebyid',
        'deletebusinesstypebyid',
      );
      return error;
    }
  }

  async filterValue(userId, query) {
    try {
      const { searchFunction } = query;
      // ////////////////console.log('query', query);
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
      });

      let allFunctions = [];

      if (searchFunction) {
        allFunctions = await this.prisma.functions.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              name: { contains: searchFunction, mode: 'insensitive' },
              deleted: false,
            },
          },
        });
      }
      return {
        functions: allFunctions,
      };
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async getAllUser(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const allUsers = await this.prisma.user.findMany({
        where: { organizationId: activeUser.organizationId },
        select: { id: true, username: true, avatar: true, email: true },
      });
      return allUsers;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  //this api is used to create a function
  async createFunction(data, user, res) {
    const {
      name,
      createdBy,
      organizationId,
      description,
      functionHead,
      functionId,
      functionSpoc,
      type,
    } = data;
    // try {
    this.logger.log('createfunction service started', 'createFunction');
    const isFunctionExist = await this.prisma.functions.findFirst({
      where: {
        AND: [
          { organizationId: organizationId },
          {
            name: {
              equals: name.trim(),
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    if (!isFunctionExist) {
      const fun = await this.prisma.functions.create({
        data: {
          name: name,
          createdBy: createdBy,
          organizationId: organizationId,
          description: description,
          functionHead: functionHead,
          functionId,
          functionSpoc,
          type,
        },
      });

      if (type === true) {
        const locationData = await this.createLocation(
          { ...data, functionData: fun },
          user,
        );
        await this.prisma.functions.update({
          where: { id: fun.id },
          data: { unitId: locationData.id },
        });
        await this.updateUserRoles(data, user, res);
      }
      return res.send({ funid: fun.id, funname: fun.name });
    } else {
      return new ConflictException();
    }
    // } catch (error) {
    //   this.logger.error('createfunction', 'createFunction');
    //   console.log('error', error);
    // }
  }

  async updateUserRoles(data: any, user: any, res) {
    // try{

    console.log('user', user.kcRoles);
    for (let value of data.functionSpoc) {
      console.log('value', value);
      const userInfo = await this.prisma.user.findFirst({
        where: {
          id: value,
        },
        include: {
          organization: true,
          location: true,
          entity: true,
        },
      });
      const userRole = await this.prisma.role.findFirst({
        where: {
          roleName: 'MR',
          organizationId: userInfo.organizationId,
        },
      });
      // const includesItem = a2.some(item => a1.includes(item));
      if (!userInfo.roleId.includes(userRole.id)) {
        const keyToken = user.kcToken;
        const sendData = {
          ...userInfo,
          userId: userInfo.id,
          firstName: userInfo.firstname,
          lastName: userInfo.lastname,

          entity: userInfo.entityId,
          roles: ['MR'],
        };
        const updateKeycloak = await this.roleService.updateUserMaster(
          value,
          sendData,
          keyToken,
        );
      }
    }
    return 'successfull';
    // }catch(err){}
  }

  async createLocation(data: any, user) {
    const {
      name,
      createdBy,
      organizationId,
      description,
      functionHead,
      functionId,
      functionSpoc,
      functionData,
      type,
    } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
      include: { organization: true },
    });
    let userData: any = await this.prisma.user.findMany({
      where: { id: { in: functionHead } },
      select: {
        id: true,
        avatar: true,
        email: true,
        username: true,
      },
    });

    userData = userData.map((item) => {
      return { ...item, name: item.username };
    });

    const business = await this.prisma.business.findFirst({
      where: {
        organizationId: activeUser.organizationId,
        name: { contains: 'CORPORATE', mode: 'insensitive' },
      },
    });
    const locationData = {
      locationName: name,
      locationType: '',
      description: '',
      organization: activeUser.organization.realmName,
      locationId: functionId,
      business: [business.id],
      users: userData,
      functionId: [
        {
          id: functionData.id,
          name: functionData.name,
        },
      ],
      id: '',
      businessTypeId: '',
      type: 'Function',
    };
    const result = await this.locationservice.createLocation(
      locationData,
      user,
    );
    return result;
  }

  //this api is used to get function details based on id
  async getFunctionById(id) {
    try {
      this.logger.log('getFunction service started', this.getFunctionById);
      const fun = await this.prisma.functions.findUnique({
        where: {
          id: id,
        },
      });
      return fun;
    } catch (error) {
      this.logger.error(
        'exception occured:getFunctionById',
        this.getFunctionById,
      );
      return error;
    }
  }
  async getFunctionByLocation(locid) {
    // try {
    console.log('locid', locid);

    this.logger.log(
      'getFunctionBylocation service started',
      this.getFunctionByLocation,
    );

    const location = JSON.parse(locid);

    const func = await this.prisma.functions.findMany({
      where: {
        locationId: { hasSome: location },
        deleted: false,
      },
    });
    let funarray = [];

    return func;
    // } catch (error) {
    //   this.logger.error(
    //     'exception occured:getFunctionByLocation',
    //     this.getFunctionByLocation,
    //   );
    //   return error;
    // }
  }

  async getFunctionBySingleLocation(locid: any) {
    // try {
    console.log('locid', locid);

    this.logger.log(
      'getFunctionBylocation service started',
      this.getFunctionByLocation,
    );

    const func = await this.prisma.location.findMany({
      where: {
        id: locid,
        deleted: false,
      },
      select: {
        functionId: true,
      },
    });
    console.log('func', func);
    let funids = func[0].functionId;
    let funcdata = [];
    for (let fun of funids) {
      const data = await this.prisma.functions.findFirst({
        where: {
          id: fun,
        },
      });
      const info = {
        id: data.id,
        name: data.name,
      };
      funcdata.push(info);
    }

    return funcdata;
    // } catch (error) {
    //   this.logger.error(
    //     'exception occured:getFunctionByLocation',
    //     this.getFunctionByLocation,
    //   );
    //   return error;
    // }
  }
  //this api is used to delete a function based on id
  async deleteFunctionById(id) {
    try {
      this.logger.log(
        'deleteFunctionById service started',
        this.deleteFunctionById,
      );
      const fun = await this.prisma.functions.update({
        where: {
          id: id,
        },
        data: {
          deleted: true,
        },
      });
      return fun.id;
    } catch (error) {
      this.logger.error('exception occured:deleteFunctionById', error);
      return error;
    }
  }
  //this api is used to delete a function based on id
  async restoreFunctionById(id) {
    try {
      this.logger.log(
        'restoreFunctionById service started',
        this.deleteFunctionById,
      );
      const fun = await this.prisma.functions.update({
        where: {
          id: id,
        },
        data: {
          deleted: false,
        },
      });
      return fun.id;
    } catch (error) {
      this.logger.error('exception occured:deleteFunctionById', error);
      return error;
    }
  }
  //this api is used to delete a function based on id
  async permanentDeleteFunctionById(id) {
    try {
      this.logger.log(
        'permanentdeleteFunctionById service started',
        this.deleteFunctionById,
      );
      const fun = await this.prisma.functions.delete({
        where: {
          id: id,
        },
      });
      return fun.id;
    } catch (error) {
      this.logger.error('exception occured:deleteFunctionById', error);
      return error;
    }
  }
  //this api is used to delete a function,parm-id
  async updateFunctionById(id, data, user, res) {
    const {
      name,
      updatedBy,
      description,
      functionHead,
      functionId,
      functionSpoc,
      type,
    } = data;
    // try {
    this.logger.log(
      'updateFunctionById service started',
      this.updateFunctionById,
    );
    const fun = await this.prisma.functions.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        updatedBy: updatedBy,
        description,
        functionHead,
        functionId,
        functionSpoc,
        type,
      },
    });
    if (type === true) {
      if (fun.unitId === null) {
        const locationData = await this.createLocation(
          { ...data, functionData: fun },
          user,
        );
        await this.prisma.functions.update({
          where: { id: fun.id },
          data: { unitId: locationData.id },
        });
      } else {
        let userData: any = await this.prisma.user.findMany({
          where: { id: { in: functionHead } },
          select: {
            id: true,
            avatar: true,
            email: true,
            username: true,
          },
        });

        userData = userData.map((item) => {
          return { ...item, name: item.username };
        });

        const updateLocation = await this.prisma.location.update({
          where: { id: fun.unitId },
          data: {
            locationName: name,
            locationId: functionId,
            users: userData,
          },
        });
      }

      await this.updateUserRoles(data, user, res);
    }
    return res.send({ funid: fun.id, funname: fun.name });
    // } catch (error) {
    //   this.logger.error(
    //     'exception occured:updateFunctionById',
    //     this.updateFunctionById,
    //   );
    // return error;
    // }
  }
  //this api is used to delete a business based on its id
  async deleteBusinessById(id) {
    try {
      this.logger.log(
        'deleteBusinessById service started',
        this.deleteBusinessById,
      );
      const bus = await this.prisma.business.update({
        where: {
          id: id,
        },
        data: {
          deleted: true,
        },
      });
      return bus.id;
    } catch (error) {
      this.logger.error('exception occured:deleteBusinessById', error);
      return error;
    }
  }
  //this api is used to delete a business based on its id
  async restoreBusinessById(id) {
    try {
      this.logger.log(
        'restoreBusinessById service started',
        this.restoreBusinessById,
      );
      const bus = await this.prisma.business.update({
        where: {
          id: id,
        },
        data: {
          deleted: false,
        },
      });
      return bus.id;
    } catch (error) {
      this.logger.error('exception occured:deleteBusinessById', error);
      return error;
    }
  }
  //this api is used to delete a business based on its id
  async permanentDeleteBusinessById(id) {
    try {
      this.logger.log(
        'permanentdeleteBusinessById service started',
        this.permanentDeleteBusinessById,
      );
      const bus = await this.prisma.business.delete({
        where: {
          id: id,
        },
      });
      return bus.id;
    } catch (error) {
      this.logger.error('exception occured:deleteBusinessById', error);
      return error;
    }
  }

  //this api is used to get all the functions in a given org
  async getAllFunctionsByOrgId(id) {
    try {
      this.logger.log(
        'getAllFunctionsByOrgId service started',
        this.getAllFunctionsByOrgId,
      );
      const funs = await this.prisma.functions.findMany({
        where: {
          organizationId: id,
          deleted: false,
        },
      });
      return funs;
    } catch (error) {
      this.logger.error(
        'exception occured:getAllFunctionsByOrgId',
        this.getAllFunctionsByOrgId,
      );
      return error;
    }
  }
  //this function is used to get all businesses in an org
  async getAllBusinessByOrgId(id) {
    try {
      // ////////////////console.log(id);
      this.logger.log(
        'getAllBusinessByOrgId service started',
        this.getAllBusinessByOrgId,
      );
      const business = await this.prisma.business.findMany({
        where: {
          organizationId: id,
          deleted: false,
        },
        select: {
          id: true,
          name: true,
          // businessTypeId: true,
        },
      });
      console.log(business);
      return business;
    } catch (error) {
      this.logger.error(
        'exception occured:getAllBusinessByOrgId failed',
        error,
      );
      return error;
    }
  }
  //this api is used to get all functions in a location
  async getAllFunctionsInALoc(id) {
    // try {
    ////////////////console.log(id);
    this.logger.log(
      'getAllFunctionsInALoc service started',
      this.getAllFunctionsInALoc,
    );
    const funs = await this.prisma.location.findUnique({
      where: {
        id: id,
      },
      select: {
        functionId: true,
      },
    });

    const functionIds = await this.prisma.functions.findMany({
      where: {
        id: { in: funs.functionId },
      },
      select: { id: true, name: true },
    });
    let loc = [];
    return functionIds;
  }
  catch(error) {
    this.logger.error('exception occured:getAllFunctionsInALoc', error);
    return error;
  }

  //this api is used to return all entities or departments associated with a given function,param-functionid
  async getAllDepartmentsOfAFunction(id) {
    try {
      this.logger.log(
        'getAllDepartmentsOfAFunction service started',
        this.getAllDepartmentsOfAFunction,
      );
      const dept = await this.prisma.functions.findMany({
        where: { id: id, deleted: false },
        select: {
          entity: true,
        },
      });
      ////////////////console.log('entity ids', dept);
      // for(let entity of dept)
      //     {
      //       const dName=await this.prisma.entity.findUnique({
      //         where:{
      //           id:entity
      //         }
      //       })
      //     }
    } catch (error) {
      this.logger.error(
        'exception occured:getAllDepartmentsOfAFunction',
        error,
      );
      return error;
    }
  }

  async helloWorld() {
    ////console.log('service called');
  }

  async importFunction(file, createdBy, organizationId) {
    const fs = require('fs');
    const XLSX = require('xlsx');

    const description = null;
    const functionHead = [];
    let firstIteration = true;

    const fileContent = fs.readFileSync(file.path);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    for (const rowData of excelData) {
      if (firstIteration) {
        if (rowData[0] !== 'FunctionName') {
          return true;
        }
        firstIteration = false;
        continue;
      }
      const name = rowData[0]?.trim();

      const functionExists = await this.prisma.functions.findFirst({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });
      if (functionExists !== null) {
        continue;
      }

      const fun = await this.prisma.functions.create({
        data: {
          name: name,
          createdBy: createdBy,
          organizationId: organizationId,
          description: description,
          functionHead: functionHead,
        },
      });
    }
  }
  async createSection(data) {
    const { name, createdBy, organizationId } = data;
    try {
      this.logger.log('createSection service started', 'createSection');

      const btid = await this.prisma.section.create({
        data: {
          name,
          createdBy,
          organizationId,
        },
      });
      return { id: btid.id, name: btid.name };
    } catch (error) {
      this.logger.log(
        'cannot create section:exception occured',
        'createBusinessType',
      );
    }
  }
  //api to get businesstype by id
  async getSectionById(id) {
    try {
      this.logger.log('getSectionbyid service started', 'getBusiessTypeById');
      const businesstype = await this.prisma.section.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      });
      return businesstype;
    } catch (error) {
      this.logger.error(
        `exception occured:unable to find section with id${id}`,
        error,
      );
      return error;
    }
  }
  //this api get all businesstypes by org id
  async getAllSections(orgid) {
    // try {
    this.logger.log(
      'getAllBusinessTypes service started',
      'getAllBusinessTypes',
    );

    const businessType = await this.prisma.section.findMany({
      where: {
        organizationId: orgid,
        deleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
    console.log('businesstype', businessType);
    return businessType;
    // } catch (error) {
    //   this.logger.error(
    //     'exception occured:unables to find businesstypes',
    //     error,
    //   );
    //   return error;
    // }
  }
  //this api is used to update buisnesstype,param-id of the bt to be updated
  async updateSection(id, data) {
    const { name } = data;
    // try {
    this.logger.log('updatesection service started', 'updatesection');
    const ubt = await this.prisma.section.update({
      where: {
        id: id,
      },
      data: {
        name: name,
      },
    });
    return { sectionId: id, sectionName: ubt.name };
    // } catch (error) {
    //   this.logger.log(
    //     'exception occured:cannot update section',
    //     'updateBusinessType',
    //   );
    //   return error;
    // }
  }
  async deleteSectionById(id) {
    try {
      this.logger.log(
        'deleteSecctionById service started',
        this.deleteFunctionById,
      );
      const fun = await this.prisma.section.update({
        where: {
          id: id,
        },
        data: {
          deleted: true,
        },
      });
      return fun.id;
    } catch (error) {
      this.logger.error('exception occured:deleteFunctionById', error);
      return error;
    }
  }
  async getAllSectionsForEntity(id) {
    // try {
    this.logger.log(
      'getAllSectionsForEntity service started',
      this.deleteFunctionById,
    );
    const sectionidsdata: any = await this.prisma.entity.findFirst({
      where: {
        id: id,
      },
      // select: {
      //   sections: true,
      // },
    });
    // const sectionids = sectionidsdata?.flatMap(({ sections }) => sections);
    // const sectionInfo = await Promise.all(
    //   sectionids.map(async (sectionId: any) => {
    //     const section = await this.prisma.section.findFirst({
    //       where: {
    //         id: sectionId, // Use the sectionId directly
    //       },
    //       select: {
    //         id: true,
    //         name: true,
    //         organizationId: true,
    //       },
    //       orderBy: {
    //         name: 'asc', // Sorts by locationName in ascending order
    //       },
    //     });
    //     return section;
    //   }),
    // );
    let result: any = await this.prisma.entity.findMany({
      where: {
        id: { in: sectionidsdata?.hierarchyChain?.filter((item)=>item !==id) || [] },

        deleted: false,
      },
    });
    result = result?.map((item) => ({ id: item?.id, name: item?.entityName }));
    return result;
    // } catch (error) {
    //   this.logger.error('exception occured:deleteFunctionById', error);
    //   return error;
    // }
  }
}
