import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { LocationDto } from './dto/location.dto';

import { createFieldsPairsFilter } from '../utils/filterGenerator';
import { includeObjLoc } from '../utils/constants';

import { getBTDetails } from '../user/helper';
import { UserService } from '../user/user.service';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
// import { User } from '../../dist/authentication/user.model';

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createLocation(locationData: LocationDto, user, file?) {
    const fs = require('fs');
    let logo: Buffer | null = null;
    if (file) {
      logo = fs.readFileSync(file.path);
    }
    if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      const {
        locationName,
        locationType,
        locationId,
        description,
        organization,
        business,
        functionId,
        users,
        businessTypeId,
        type,
      } = locationData;

      // const userinfo = users?.map((value: any) => value?.id);
      const organiationName = await this.prisma.organization.findFirst({
        where: {
          realmName: organization,
        },
      });

      const functionIds = functionId?.map((value: any) => value?.id);
      const isLocationExist = await this.prisma.location.findFirst({
        where: {
          AND: [
            { organizationId: organiationName.id },
            {
              locationName: {
                equals: locationName,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
      const data1: any = {
        locationName,
        locationType,
        description,
        type,
        locationId,
        functionId: functionIds,
        businessTypeId,
        users,
        organization: {
          connect: {
            id: organiationName.id,
          },
        },
        logo: logo,
      };
      if (!isLocationExist) {
        const createdLocation = await this.prisma.location.create({
          data: data1,
        });

        const buPromise = [];
        new Promise((resolve) => {
          business.forEach(async (bu, index) => {
            buPromise.push(
              await this.prisma.locationBusiness.create({
                data: {
                  location: {
                    connect: {
                      id: createdLocation.id,
                    },
                  },
                  business: {
                    connect: {
                      id: bu,
                    },
                  },
                },
              }),
            );
            if (business.length - 1 === index) {
              resolve(buPromise);
            }
          });
        });
        const getCraetedLocation = await this.prisma.location.findFirst({
          where: {
            id: createdLocation.id,
          },
          include: {
            business: {
              select: {
                id: true,
                business: true,
              },
            },
            // functionId: {
            //   select: {
            //     id: true,
            //     name: true,
            //   },
            // },
          },
        });
        // ////////////////console.log('loc details', getCraetedLocation);
        // ////////////////console.log('loc details', getCraetedLocation);
        return getCraetedLocation;
      } else {
        throw new ConflictException();
      }
    } else {
      throw new NotFoundException();
    }
  }

  async locationManagement() {
    const data: any = this.prisma.location.findMany({
      include: {
        user: {
          where: {
            // assignedRole: {
            //   some: {
            //     role: {
            //       roleName: 'LOCATION-ADMIN',
            //     },
            //   },
            // },
          },
          select: {
            firstname: true,
            lastname: true,
            id: true,
            email: true,
          },
        },
        business: {
          select: {
            business: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    let newData: any;
    const nd = (await data).map((d) => {
      const { business } = d;
      newData = business.map((b) => {
        return b.business;
      });
      return newData;
    });

    const newObj = (await data).map((d, index) => {
      let obj = {
        id: d.id,
        locationName: d.locationName,
        locationType: d.locationType,
        locationId: d.locationId,
        description: d.description,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        organizationId: d.organizationId,
        user: d.user,
        business: nd[index],
      };
      return obj;
    });
    return newObj;
  }
  // User master apis

  //if user is orgAdmin all locations in that pariticular org
  //if user is locAdmin all location in that
  async getLocationforOrg(realmName: string, user: any) {
    try {
      const organization = await this.prisma.organization.findFirst({
        where: { realmName },
      });

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user?.id },
        include: {
          entity: true,
          location: true,
          organization: true,
        },
      });

      if (!activeUser) throw new NotFoundException('Active user not found');

      const userRoles = user.kcRoles?.roles ?? [];

      // Non-global users
      if (activeUser.userType !== 'globalRoles') {
        // ORG-ADMIN has the highest precedence
        if (userRoles.includes('ORG-ADMIN')) {
          if (!organization)
            throw new NotFoundException('Organization not found');

          const locations = await this.prisma.location.findMany({
            where: {
              organizationId: organization.id,
              deleted: false,
              type: 'Unit',
            },
            select: {
              id: true,
              locationId: true,
              locationName: true,
            },
            orderBy: { locationName: 'asc' },
          });

          return locations;
        }

        // MR role only if not ORG-ADMIN
        if (userRoles.includes('MR')) {
          const locationIds = [
            ...(activeUser.locationId ? [activeUser.locationId] : []),
            ...(activeUser?.entity?.locationId
              ? [activeUser.entity.locationId]
              : []),
            ...(Array.isArray(activeUser.additionalUnits)
              ? activeUser.additionalUnits
              : []),
          ];

          const uniqueLocIds = [...new Set(locationIds)];

          const locations = await this.prisma.location.findMany({
            where: {
              id: { in: uniqueLocIds },
              deleted: false,
              type: 'Unit',
            },
            orderBy: { locationName: 'asc' },
          });

          return locations;
        }

        // Other non-global roles
        const locId = activeUser?.locationId ?? activeUser.entity?.locationId;

        if (!locId) throw new NotFoundException('No location found for user');

        const location = await this.prisma.location.findFirst({
          where: {
            id: locId,
            deleted: false,
          },
        });

        if (!location) throw new NotFoundException('Location not found');

        return [location];
      }

      // For globalRoles userType
      const additionalUnits = activeUser.additionalUnits;

      let locations;

      if (Array.isArray(additionalUnits) && additionalUnits.includes('All')) {
        locations = await this.prisma.location.findMany({
          where: {
            organizationId: activeUser.organizationId,
            deleted: false,
            type: 'Unit',
          },
          orderBy: { locationName: 'asc' },
        });
      } else {
        locations = await this.prisma.location.findMany({
          where: {
            id: {
              in: Array.isArray(additionalUnits) ? additionalUnits : [],
            },
            deleted: false,
            type: 'Unit',
          },
          orderBy: { locationName: 'asc' },
        });
      }

      return locations;
    } catch (error) {
      // Add proper error logging here if needed
      throw error;
    }
  }

  async getEntityForLocation(realmName: string, locationId: string) {
    try {
      const deptForLocation = await this.prisma.entity.findMany({
        where: {
          organization: {
            realmName: {
              contains: realmName,
            },
          },
          location: {
            id: {
              contains: locationId,
            },
          },
          deleted: false,
        },
        // select: {
        //   entityId: true,
        //   entityName: true,
        //   entityType: true,
        //   entityTypeId: true,
        // },
        // select: {
        //   entityId: true,
        //   entityName: true,
        //   entityType: true,
        //   entityTypeId: true,
        // },
      });

      return deptForLocation;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  // async getBusinessTypeForDept(deptId: string) {
  //   const businessTypeForDept = await this.prisma.business.findMany({
  //     where: {
  //       entity: {
  //         some: {
  //           id: {
  //             contains: deptId,
  //           },
  //         },
  //       },
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //     },
  //   });

  //   return businessTypeForDept;
  // }

  async getSectionsForOrg(realmName: string) {
    try {
      const sectionsInOrg = await this.prisma.section.findMany({
        where: {
          organization: {
            realmName: realmName,
          },
        },
      });

      const sections = sectionsInOrg.map((section) => {
        return {
          sectionId: section.id,
          name: section.name,
        };
      });

      return sections;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  //get location by id
  async getLocationById(id) {
    try {
      let location;

      location = await this.prisma.location.findUnique({
        where: {
          id: id,
        },
        include: {
          business: true,
        },
      });
      const functionData = await this.prisma.functions.findMany({
        where: { id: { in: location.functionId } },
        select: { id: true, name: true },
      });
      location = { ...location, functionId: functionData };
      const Locbusiness = await this.prisma.locationBusiness.findMany({
        where: {
          locationId: location.id,
        },
      });

      if (location.logo) {
        // Convert Buffer to Base64
        const logoBase64: any = `data:image/png;base64,${location.logo.toString(
          'base64',
        )}`;
        location.logo = logoBase64;
      }

      // const users = await this.prisma.user.findMany({
      //   where: { id: { in: location.users } },
      // });

      // ////////////////console.log('locbt', LocbusinessType);
      // ////////////////console.log('locbt', LocbusinessType);
      const btPromiseArr = [];
      const btDetails = Locbusiness.map(async (bt, index) => {
        const btPromise = new Promise(async (resolve, reject) => {
          const singleBt = await this.prisma.locationBusiness.findFirst({
            where: {
              id: bt.id,
            },
            include: {
              business: {
                select: {
                  name: true,
                },
              },
            },
          });
          resolve(singleBt);
        });

        btPromiseArr.push(btPromise);
        if (index === Locbusiness.length - 1) {
          const result = await Promise.all(btPromiseArr);

          const finalResult = result.map((bt) => {
            return {
              businessId: bt.businessId,
              business: bt.business.name,
            };
          });
          return finalResult;
        }
      });
      const btResolved = await Promise.all(btDetails);
      // ////////////////console.log('btresolved', btResolved);

      const finalbt = btResolved.filter((role) => {
        if (role != null || undefined) {
          return true;
        }
        return false;
      });

      // (businessType)

      return { ...location, business: finalbt[0] };
    } catch {
      throw new NotFoundException('Error while fetching location');
    }
  }
  //get all locations of organization without anyfilters
  async getAllLocations(id) {
    //const user = await this.userService.getUserInfo(kcId);
    const locations = await this.prisma.location.findMany({
      where: {
        organizationId: id,
        deleted: false,
      },
      select: {
        id: true,
        locationId: true,
        locationName: true,
      },
    });

    locations.sort((a, b) =>
      a.locationName
        .toLocaleLowerCase()
        .localeCompare(b.locationName.toLocaleLowerCase()),
    );
    return locations;
  }

  async getAllLocationsForExport(id) {
    const locations = await this.prisma.location.findMany({
      where: {
        organizationId: id,
        deleted: false,
      },
      select: {
        locationName: true,
        locationId: true,
        business: true,
        functionId: true,
        businessTypeId: true,
        users: true,
      },
    });

    let updatedLocations = await Promise.all(
      locations.map(async (location: any) => {
        const functionNames = await Promise.all(
          location.functionId.map(async (item: any) => {
            return await this.getFunctionName(item);
          }),
        );
        const businessNames = await Promise.all(
          location.business.map(async (businessItem: any) => {
            return await this.getBusinessName(businessItem.businessId);
          }),
        );
        const businessTypeName = await this.getBusinessTypeName(
          location.businessTypeId,
        );
        return {
          ...location,
          functionNames: functionNames,
          businessNames: businessNames,
          businessTypeName: businessTypeName,
        };
      }),
    );

    return updatedLocations;
  }
  //user master apis

  async getLocationAdmin(id: string) {
    const data = await this.prisma.location.findMany({
      where: {
        id: id,
      },
      select: { users: true },
    });

    // Extract unique user IDs from data[0].users
    const userIds = [...new Set(data[0].users.map((user: any) => user.id))];

    // Fetch user details based on the unique user IDs
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return { users };
  }

  async getLocations(
    realmName,
    locationName?: string,
    locAdmin?: string,
    locationType?: string,
    page?: number,
    limit?: number,
    functions?: any,
    user?,
    search?,
    type?: any,
  ) {
    ////////console.log('limit', limit, page);
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    const skipValue = (page - 1) * Number(limit);
    let functionData;
    let functionIds;
    let orQuery;
    if (search !== 'undefined' && search !== undefined) {
      functionData = await this.prisma.functions.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive', // Case-insensitive search
          },
          // organizationId: organizationId,
          organization: {
            organizationName: realmName,
          },
        },
        select: {
          id: true, // Select only the id of matching functions
        },
      });
    }
    if (search !== 'undefined' && search !== undefined) {
      functionIds = functionData.map((func) => func.id);
    }
    if (search !== 'undefined' && search !== undefined) {
      orQuery = {
        organization: {
          realmName: realmName,
        },
        type,
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { locationName: { contains: search, mode: 'insensitive' } },
          { locationId: { contains: search, mode: 'insensitive' } },
          // { functionId: { contains: query, mode: 'insensitive' } },
          {
            functionId: {
              hasSome: functionIds,
            },
          },
          // { businessId: { contains: query, mode: 'insensitive' } },
          { businessTypeId: { contains: search, mode: 'insensitive' } },
        ],
        deleted: false,
      };
    } else {
      orQuery = {
        organization: {
          realmName: realmName,
        },
        type,

        deleted: false,
      };
    }

    // const currentUser = await this.prisma.user.findUnique({
    //     where:{
    //         id:user.id
    //     }
    // })
    //////////////console.log('functions:', functions);
    //when user is locationAdmin only and below orgadmin in heriarchy
    if (
      (user.kcRoles.roles.includes('LOCATION-ADMIN') &&
        !user.kcRoles.roles.includes('ORG-ADMIN')) ||
      user.kcRoles.roles.includes('MR') ||
      user.kcRoles.roles.includes('ENTITY-HEAD') ||
      user.kcRoles.roles.includes('GENERAL-USER') ||
      user.kcRoles.roles.includes('AUDITOR')
    ) {
      ////console.log('test mr');
      const locationUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          entity: true,
        },
      });

      // const locationId =
      //   locationUser.locationId ?? locationUser.entity.locationId;
      // const location = await this.prisma.location.findFirst({
      //   where: {
      //     id: locationId,
      //   },
      //   include: {
      //     business: true,
      //   },
      // });
      // ////////////////console.log('location', location);
      // const Locbusiness = await this.prisma.locationBusiness.findMany({
      //   where: {
      //     locationId: location.id,
      //   },
      // });
      // ////////////////console.log('Locbusiness', Locbusiness);
      // const btPromiseArr = [];
      // const btDetails = Locbusiness.map(async (bt, index) => {
      //   const btPromise = new Promise(async (resolve, reject) => {
      //     const singleBt = await this.prisma.locationBusiness.findFirst({
      //       where: {
      //         id: bt.id,
      //       },
      //       include: {
      //         business: {
      //           select: {
      //             name: true,
      //           },
      //         },
      //       },
      //     });
      //     resolve(singleBt);
      //   });

      //   btPromiseArr.push(btPromise);
      //   if (index === Locbusiness.length - 1) {
      //     const result = await Promise.all(btPromiseArr);

      //     const finalResult = result.map((bt) => {
      //       return {
      //         businessId: bt.businessId,
      //         business: bt.business.name,
      //       };
      //     });

      //     return finalResult;
      //   }
      // });
      // const btResolved = await Promise.all(btDetails);

      // const finalbt = btResolved.filter((role) => {
      //   if (role != null || undefined) {
      //     return true;
      //   }
      //   return false;
      // });

      // // (businessType)
      // ////////////////console.log('finalbt', finalbt);
      // return { ...location, business: finalbt[0] };

      const allData = await this.prisma.location.findMany({
        where: orQuery,
        include: {
          user: true,
          business: true,
        },
        orderBy: {
          locationName: 'asc',
        },
      });
      let data: any = await this.prisma.location.findMany({
        skip: skipValue,
        take: Number(limit),
        where: orQuery,
        include: {
          user: true,
          business: true,
        },
        orderBy: {
          locationName: 'asc',
        },
      });
      data = data.map((value) => {
        if (user.kcRoles.roles.includes('ORG-ADMIN')) {
          return { ...value, editAccess: true };
        } else if (
          user.kcRoles.roles.includes('MR') &&
          activeUser.locationId === value.id
        ) {
          return { ...value, editAccess: true };
        } else {
          return { ...value, editAccess: false };
        }
      });
      const addedFunction = [];
      for (let value of data) {
        const functionsData = await this.prisma.functions.findMany({
          where: { id: { in: value.functionId } },
          select: { id: true, name: true },
        });
        addedFunction.push({ ...value, functionId: functionsData });
      }
      ////////console.log('datalength', data.length);
      const resolvedUsers = await getBTDetails(
        addedFunction,
        this.prisma.locationBusiness,
      );

      const finalResult = await this.addFunction(resolvedUsers);
      ////////console.log('finalresultLength', finalResult.length);
      return { data: finalResult, length: allData.length };
    }

    if (realmName === 'master') {
      const allLocations = await this.prisma.location.findMany({
        skip: skipValue,
        take: Number(limit),
        orderBy: {
          locationName: 'asc',
        },
        where: {
          deleted: false,
        },
      });
      const noPageLocations = await this.prisma.location.findMany({});
      return { data: allLocations, length: noPageLocations.length };
    }

    //when orgadmin

    //filtering of organization both by locationName and locationAdmin
    try {
      if (locationName && locAdmin && !locationType) {
        const filteredData = await createFieldsPairsFilter(
          realmName,
          skipValue,
          Number(limit),
          this.prisma.location,
          [{ filterField: 'locationName', filterString: locationName }],
          locAdmin,
          includeObjLoc,
        );
        const resolvedUsers = await getBTDetails(
          filteredData.data,
          this.prisma.locationBusiness,
        );

        return { data: resolvedUsers, length: resolvedUsers.length };

        //filtering if only orgName is provided
      } else if (locationName && !locAdmin && !locationType) {
        const filteredData = await createFieldsPairsFilter(
          realmName,
          skipValue,
          Number(limit),
          this.prisma.location,
          [{ filterField: 'locationName', filterString: locationName }],
          false,
          includeObjLoc,
        );
        const resolvedUsers = await getBTDetails(
          filteredData.data,
          this.prisma.locationBusiness,
        );

        return { data: resolvedUsers, length: resolvedUsers.length };

        //filtering if only orgAdmin is provided
      } else if (!locationName && locAdmin && !locationType) {
        const filteredData = await createFieldsPairsFilter(
          realmName,
          skipValue,
          Number(limit),
          this.prisma.location,
          [],
          locAdmin,
          includeObjLoc,
        );
        const resolvedUsers = await getBTDetails(
          filteredData.data,
          this.prisma.locationBusiness,
        );

        return { data: resolvedUsers, length: resolvedUsers.length };

        //  Location type and location admin
      } else if (locationType && locAdmin && !locationName) {
        const filteredData = await createFieldsPairsFilter(
          realmName,
          skipValue,
          Number(limit),
          this.prisma.location,
          [{ filterField: 'locationType', filterString: locationType }],
          locAdmin,
          includeObjLoc,
        );
        const resolvedUsers = await getBTDetails(
          filteredData.data,
          this.prisma.locationBusiness,
        );

        return { data: resolvedUsers, length: resolvedUsers.length };

        //WHEN ONLY LOCATIONTYPE IS PROVIDRD
      } else if (locationType && !locationName && !locAdmin) {
        const filteredData = await createFieldsPairsFilter(
          realmName,
          skipValue,
          Number(limit),
          this.prisma.location,
          [{ filterField: 'locationType', filterString: locationType }],
          false,
          includeObjLoc,
        );
        const resolvedUsers = await getBTDetails(
          filteredData.data,
          this.prisma.locationBusiness,
        );

        return { data: resolvedUsers, length: resolvedUsers.length };
      } else if (locationName && locationType && locAdmin) {
        const filteredData = await createFieldsPairsFilter(
          realmName,
          skipValue,
          Number(limit),
          this.prisma.location,
          [
            { filterField: 'locationName', filterString: locationName },
            { filterField: 'locationType', filterString: locationType },
          ],
          locAdmin,
          includeObjLoc,
        );
        const resolvedUsers = await getBTDetails(
          filteredData.data,
          this.prisma.locationBusiness,
        );

        return { data: resolvedUsers, length: resolvedUsers.length };
      } else {
        ////console.log('else');
        const allData = await this.prisma.location.findMany({
          where: orQuery,
          orderBy: {
            locationName: 'asc',
          },
          include: {
            user: true,
            business: true,
          },
          // include: {
          //   user: {
          //     where: {
          //       assignedRole: {
          //         some: {
          //           role: {
          //             roleName: {
          //               equals: 'LOCATION-ADMIN',
          //             },
          //           },
          //         },
          //       },
          //     },
          //     select: {
          //       email: true,
          //     },
          //   },
          //   business: true,
          // },
        });

        let data: any = await this.prisma.location.findMany({
          skip: skipValue,
          take: Number(limit),
          where: orQuery,
          include: {
            user: true,
            business: true,
          },
          orderBy: {
            locationName: 'asc',
          },
          // include: {
          //   user: {
          //     where: {
          //       assignedRole: {
          //         some: {
          //           role: {
          //             roleName: {
          //               equals: 'LOCATION-ADMIN',
          //             },
          //           },
          //         },
          //       },
          //     },
          //     select: {
          //       email: true,
          //     },
          //   },
          //   business: true,
          // },
        });
        data = data.map((value) => {
          if (user.kcRoles.roles.includes('ORG-ADMIN')) {
            return { ...value, editAccess: true };
          } else if (
            user.kcRoles.roles.includes('MR') &&
            activeUser.locationId === value.id
          ) {
            return { ...value, editAccess: true };
          } else {
            return { ...value, editAccess: false };
          }
        });
        const addedFunction = [];
        for (let value of data) {
          const functionsData = await this.prisma.functions.findMany({
            where: { id: { in: value.functionId } },
            select: { id: true, name: true },
          });

          addedFunction.push({ ...value, functionId: functionsData });
        }

        const resolvedUsers = await getBTDetails(
          addedFunction,
          this.prisma.locationBusiness,
        );
        ////console.log('resolvedUsers', resolvedUsers);
        const finalResult = await this.addFunction(resolvedUsers);
        ////console.log('finalResult', finalResult);
        return { data: finalResult, length: allData.length };
      }
    } catch (err) {
      console.error(err);
      throw new BadRequestException();
    }
  }

  async getLocationsforFilter(
    realmName,
    locationName?: string,
    locAdmin?: string,
    locationType?: string,
    page?: number,
    limit?: number,
    user?,
    functions?: any,
  ) {
    //////////////console.log('func', functions);
    try {
      const skipValue = (page - 1) * Number(limit);
      const allData = await this.prisma.location.findMany({
        where: {
          organization: { realmName: realmName },
          deleted: false,
        },
      });
      let data: any = await this.prisma.location.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          organization: { realmName: realmName },
          functionId: { hasSome: functions },
          deleted: false,
        },
        include: {
          user: {
            // where: {
            //   assignedRole: {
            //     some: { role: { roleName: { equals: 'LOCATION-ADMIN' } } },
            //   },
            // },
            // select: { email: true },
          },
          business: true,
        },
      });

      data = data.map(async (value) => {
        const functionsData = await this.prisma.functions.findMany({
          where: { id: { in: value.functionId } },
        });

        return { ...value, functionId: functionsData };
      });
      const resolvedUsers = await getBTDetails(
        data,
        this.prisma.locationBusiness,
      );
      const finalResult = await this.addFunction(resolvedUsers);

      return { data: finalResult, length: allData.length };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateLocation(locationData: LocationDto, id: string, user, file) {
    const fs = require('fs');
    let logo: Buffer | null = null;
    if (file) {
      logo = fs.readFileSync(file.path);
    }
    if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      const {
        locationName,
        locationType,
        locationId,
        description,
        organization,
        business,
        functionId,
        users,
        businessTypeId,
      } = locationData;

      const functionIds = functionId?.map((value: any) => value?.id);
      const organiationName = await this.prisma.organization.findFirst({
        where: {
          realmName: organization,
        },
      });
      const isLocationExist = await this.prisma.location.findFirst({
        where: {
          AND: [{ organizationId: organiationName.id }, { id: id }],
        },
      });

      ////////////////console.log('IsLocationExisst', isLocationExist);
      if (isLocationExist) {
        const location = await this.prisma.location.findUnique({
          where: {
            id: id,
          },
        });

        if (location) {
          const data1: any = {
            locationName,
            locationType,
            description,
            locationId,
            functionId: functionIds,
            businessTypeId,
            users,
            organization: {
              connect: {
                id: organiationName.id,
              },
            },
            logo: logo,
          };
          const updateLocation = await this.prisma.location.update({
            where: {
              id: id,
            },
            data: data1,
          });

          await this.prisma.location.update({
            where: {
              id: id,
            },
            data: {
              business: {
                deleteMany: {},
              },
            },
          });

          const buPromise = [];
          new Promise((resolve) => {
            business.forEach(async (bu, index) => {
              buPromise.push(
                await this.prisma.locationBusiness.create({
                  data: {
                    location: {
                      connect: {
                        id: updateLocation.id,
                      },
                    },
                    business: {
                      connect: {
                        id: bu,
                      },
                    },
                  },
                }),
              );
              if (business.length - 1 === index) {
                resolve(buPromise);
              }
            });
          });
          return updateLocation;
        } else {
          throw new NotFoundException();
        }
      } else {
        throw new ConflictException();
      }
    } else if (user.kcRoles.roles.includes('MR')) {
      const { functionId, users, locationId, description } = locationData;
      const data1: any = {
        functionId: functionId.map((value: any) => value.id),
        users: users,
        locationId: locationId,
        description: description,
      };
      const updatedbymr = await this.prisma.location.update({
        where: {
          id: id,
        },
        data: data1,
      });
      return updatedbymr;
    } else {
      return new NotFoundException();
    }
  }

  async searchLocation(organizationId, querystring) {
    const aggregationPipeline = [];
    const query = querystring.query;

    const limit = Number(querystring?.limit) || 10;
    const page = Number(querystring?.page) || 1;
    const skip = Number((page - 1) * limit);

    const functions = await this.prisma.functions.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        },
        organizationId: organizationId,
        deleted: false,
      },
      select: {
        id: true, // Select only the id of matching functions
      },
    });

    const functionIds: any[] = functions.map((func) => func.id);

    const locations: any = await this.prisma.location.findMany({
      where: {
        organizationId,
        deleted: false,
        OR: [
          { id: { contains: query, mode: 'insensitive' } },
          { locationName: { contains: query, mode: 'insensitive' } },
          { locationId: { contains: query, mode: 'insensitive' } },
          // { functionId: { contains: query, mode: 'insensitive' } },
          {
            functionId: {
              hasSome: functionIds,
            },
          },
          // { businessId: { contains: query, mode: 'insensitive' } },
          { businessTypeId: { contains: query, mode: 'insensitive' } },
        ],
      },
      // include:{business:{include:{business:true}}},
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const finalResult = [];
    for (let value of locations) {
      const functions = await this.prisma.functions.findMany({
        where: { id: { in: value.functionId } },
      });

      const businessTypeId: any = await this.prisma.locationBusiness.findMany({
        where: { locationId: value.id },
        include: { business: true },
      });
      finalResult.push({
        ...value,
        functionId: functions,
        businessType: businessTypeId,
      });
    }
    return { data: finalResult, data_length: locations.length };
  }

  async deleteLocation(id: string) {
    const location = await this.prisma.location.findUnique({
      where: {
        id: id,
      },
    });
    if (location) {
      const deletedLocation = await this.prisma.location.update({
        where: {
          id: id,
        },
        data: {
          deleted: true,
        },
      });
      ////////////////console.log(deletedLocation.id);
      return deletedLocation.id;
      ////////////////console.log(deletedLocation.id);
      return deletedLocation.id;
    } else {
      throw new NotFoundException();
    }
  }
  async restoreLocation(id: string) {
    const location = await this.prisma.location.findUnique({
      where: {
        id: id,
      },
    });
    if (location) {
      const deletedLocation = await this.prisma.location.update({
        where: {
          id: id,
        },
        data: {
          deleted: false,
        },
      });
      ////////////////console.log(deletedLocation.id);
      return deletedLocation.id;
      ////////////////console.log(deletedLocation.id);
      return deletedLocation.id;
    } else {
      throw new NotFoundException();
    }
  }

  async permanetDeleteLocation(id: string) {
    const location = await this.prisma.location.findUnique({
      where: {
        id: id,
      },
    });
    if (location) {
      const deletedLocation = await this.prisma.location.delete({
        where: {
          id: id,
        },
      });
      //////////////////console.log(deletedLocation.id);
      return deletedLocation.id;
      //////////////////console.log(deletedLocation.id);
      return deletedLocation.id;
    } else {
      throw new NotFoundException();
    }
  }

  async addFunction(data) {
    const returnData = [];

    for (let value of data) {
      if (value.functionId && Array.isArray(value.functionId)) {
        const functionIds = value.functionId.map((item) => item.id);

        const functionData = await this.prisma.functions.findMany({
          where: {
            id: {
              in: functionIds, // Use the array of 'id' strings
            },
          },
        });
        const finalData = { ...value, functionId: functionData };
        returnData.push(finalData);
      }
    }

    //////console.log('returnData', returnData);
    return returnData;
  }

  // async createHolidayList(userid, data) {
  //   try {
  //     const result = await this.holidayModel.create(data);
  //     return result.id;
  //   } catch (error) {
  //     return error;
  //   }
  // }
  // async updateHolidayList(id, data, userid) {
  //   try {
  //     const update = await this.holidayModel.findByIdAndUpdate(id, data);
  //     return update;
  //   } catch (error) {
  //     return error;
  //   }
  // }
  // async deleteHolidayList(id, userid) {
  //   try {
  //     const deleteList = await this.holidayModel.findByIdAndDelete(id);
  //     return deleteList.id;
  //   } catch (error) {
  //     return error;
  //   }
  // }

  // async getHolidayListForLocation(id, userid) {
  //   try {
  //     const holidayList = await this.holidayModel.findOne(id);
  //     return holidayList;
  //   } catch (error) {
  //     return error;
  //   }
  // }

  // async getAllHolidayListForOrg(id) {
  //   try {
  //     const holidayList = await this.holidayModel.find({
  //       where: {
  //         organizationId: id,
  //       },
  //     });
  //     return holidayList;
  //   } catch (error) {
  //     return error;
  //   }
  // }

  async importUnit(file, orgName, user, res) {
    if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      const fs = require('fs');
      const XLSX = require('xlsx');

      const fileContent = fs.readFileSync(file.path);
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let firstIteration = true;
      const organization = orgName;
      const locationType = '';
      const description = '';

      let invalidUnits = [
        [
          'UnitName',
          'UnitID',
          'Businesses',
          'BusinessType',
          'Functions',
          'Users',
          'Reason',
        ],
      ];
      const unitFormat = [
        'UnitName',
        'UnitID',
        'Businesses',
        'BusinessType',
        'Functions',
        'Users',
      ];

      mainLoop: for (const rowData of excelData) {
        let functionIds = [];
        let business = [];
        let users = [];
        let businessTypeId = '';
        if (firstIteration) {
          if (!rowData.every((value, index) => value === unitFormat[index])) {
            return res.status(200).json({ wrongFormat: true });
          }
          firstIteration = false;
          continue;
        }

        const locationName = rowData[0]?.trim();
        const locationId = rowData[1]?.trim();
        if (locationId.length > 3) {
          rowData[6] = 'Location ID Is More Than 3 Characters';
          invalidUnits.push(rowData);
          continue;
        }

        const businessName = rowData[2]
          ?.split(',')
          .map((item: any) => item.trim());
        for (const busi of businessName) {
          const businessExists = await this.getBusinessId(busi);
          if (businessExists === null) {
            rowData[6] = 'Business ' + busi + ' Does Not Exist';
            invalidUnits.push(rowData);
            continue mainLoop;
          }
          business.push(businessExists);
        }

        const businessTypeName = rowData[3]?.trim();
        if (businessTypeName) {
          businessTypeId = await this.getBusinessTypeId(businessTypeName);
          if (businessTypeId === null) {
            rowData[6] = 'Business Type Does Not Exist';
            invalidUnits.push(rowData);
            continue;
          }
        }

        const functionName = rowData[4]
          ?.split(',')
          .map((item: any) => item.trim());
        for (const func of functionName) {
          const functionExists = await this.getFunctionId(func);
          if (functionExists === null) {
            rowData[6] = 'Function ' + func + ' Does Not Exist';
            invalidUnits.push(rowData);
            continue mainLoop;
          }
          functionIds.push(functionExists);
        }

        const usersEmails = rowData[5]
          ?.split(',')
          .map((item: any) => item.trim());
        if (usersEmails) {
          for (const user of usersEmails) {
            const userExists = await this.getUserDetails(user);
            if (userExists === null) {
              users = [];
              break;
            }
            users.push(userExists);
          }
        }

        const organiationName = await this.prisma.organization.findFirst({
          where: {
            realmName: organization,
          },
        });

        const isLocationExist = await this.prisma.location.findFirst({
          where: {
            AND: [
              { organizationId: organiationName.id },
              // { deleted: false },
              {
                locationName: {
                  contains: locationName,
                  mode: 'insensitive',
                },
              },
            ],
          },
        });

        const data1: any = {
          locationName,
          locationType,
          description,
          locationId,
          functionId: functionIds,
          businessTypeId,
          users,
          organization: {
            connect: {
              id: organiationName.id,
            },
          },
        };

        if (!isLocationExist) {
          const createdLocation = await this.prisma.location.create({
            data: data1,
          });

          const buPromise = [];
          new Promise((resolve) => {
            business.forEach(async (bu, index) => {
              buPromise.push(
                await this.prisma.locationBusiness.create({
                  data: {
                    location: {
                      connect: {
                        id: createdLocation.id,
                      },
                    },
                    business: {
                      connect: {
                        id: bu,
                      },
                    },
                  },
                }),
              );
              if (business.length - 1 === index) {
                resolve(buPromise);
              }
            });
          });
        } else {
          rowData[6] = 'Location Already Exists';
          invalidUnits.push(rowData);
          continue;
        }
      }
      if (invalidUnits.length > 1) {
        return res.status(200).json({ success: true, invalidUnits });
      }
      return res.sendStatus(200);
    } else {
      throw new NotFoundException();
    }
  }

  async getFunctionId(functionName) {
    try {
      const functionId = await this.prisma.functions.findFirst({
        where: {
          name: {
            contains: functionName,
            mode: 'insensitive',
          },
        },
      });
      if (functionId !== null) return functionId.id;
      else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getBusinessId(businessName) {
    try {
      const BusinessId = await this.prisma.business.findFirst({
        where: {
          name: {
            contains: businessName,
            mode: 'insensitive',
          },
        },
      });
      if (BusinessId !== null) return BusinessId.id;
      else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getBusinessTypeId(businessTypeName) {
    try {
      const businessTypeId = await this.prisma.businessType.findFirst({
        where: {
          name: {
            contains: businessTypeName,
            mode: 'insensitive',
          },
        },
      });
      if (businessTypeId !== null) return businessTypeId.id;
      else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getBusinessTypeName(businessTypeId) {
    try {
      const businessTypeName = await this.prisma.businessType.findFirst({
        where: {
          id: {
            contains: businessTypeId,
            mode: 'insensitive',
          },
        },
      });
      if (businessTypeName !== null) return businessTypeName.name;
      else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getUserDetails(userEmail) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: {
            contains: userEmail,
            mode: 'insensitive',
          },
        },
      });
      if (user !== null) {
        const userDetails = {
          id: user.id,
          name: user.username,
          avatar: user.avatar,
          email: user.email,
          username: user.username,
        };
        return userDetails;
      } else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getAllLocation(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });
      const locations = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
          deleted: false,
        },
        select: { id: true, locationName: true },
        orderBy: { locationName: 'asc' },
      });
      return locations;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getBusinessName(businessId) {
    try {
      const getName = await this.prisma.business.findFirst({
        where: {
          id: businessId,
        },
        select: {
          name: true,
        },
      });
      return getName.name;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFunctionName(functionId) {
    try {
      const getName = await this.prisma.functions.findFirst({
        where: {
          id: functionId,
        },
        select: {
          name: true,
        },
      });
      return getName.name;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLogo(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });
      const locations = await this.prisma.location.findUnique({
        where: {
          id: activeUser?.locationId,
        },
      });
      if (locations.logo) {
        // Convert Buffer to Base64
        const logoBase64: any = `data:image/png;base64,${locations.logo.toString(
          'base64',
        )}`;
        locations.logo = logoBase64;
        return locations.logo;
      } else {
        const org = await this.prisma.organization.findFirst({
          where: {
            id: activeUser.organizationId,
          },
        });
        if (org.logoUrl) {
          // Convert Buffer to Base64
          const logoBase64: any = `data:image/png;base64,${org.logoUrl.toString(
            'base64',
          )}`;
          org.logoUrl = logoBase64;
          return org.logoUrl;
        } else {
          return null;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getGlobalUsersLocation(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });
      const locations = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
          deleted: false,
        },
        select: { id: true, locationName: true },
        orderBy: { locationName: 'asc' },
      });
      return locations;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
