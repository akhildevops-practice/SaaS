import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { createRoles } from './dto/createRoles.dto';
import { UserService } from 'src/user/user.service';
import { axiosKc } from 'src/utils/axios.global';
import { createRolesConfigInKc } from 'src/user/helper';
@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createRoles(data: createRoles, req, res) {
    try {
      const { orgId, unitId, users, roleId } = data;
      // console.log('unitid', unitId);
      if (
        data.roleId.includes('MR') ||
        data.roleId.includes('ORG-ADMIN') ||
        data.roleId.includes('AUDITOR')
      ) {
        try {
          for (let user of data.users) {
            const userInfo = await this.prisma.user.findFirst({
              where: {
                id: user,
              },
              include: {
                organization: true,
                location: true,
                entity: true,
              },
            });
            const userRole = await this.prisma.role.findMany({
              where: {
                id: { in: userInfo.roleId },
                organizationId: userInfo.organizationId,
              },
            });
            const roleids = userRole.map((value) => value.roleName);
            // console.log('roleids', roleids);
            // const includesItem = a2.some(item => a1.includes(item));
            if (!data.roleId.some((item) => roleids.includes(item))) {
              // console.log('inside if of roleid');
              const keyToken = req.kcToken;
              const sendData = {
                ...userInfo,
                userId: userInfo.id,
                firstName: userInfo.firstname,
                lastName: userInfo.lastname,

                entity: userInfo.entityId,
                roles: roleId,
                additionalUnits: [
                  ...new Set([
                    ...(Array.isArray(userInfo.additionalUnits)
                      ? userInfo.additionalUnits
                      : []), // Existing additional units
                    ...(unitId ? [unitId] : []), // Add unitId only if it exists
                  ]),
                ],
              };
              // console.log('senddata', sendData.additionalUnits);
              const updateKeycloak = await this.updateUserMaster(
                user,
                sendData,
                keyToken,
              );
            } else if (
              data.roleId.some((item) => roleids.includes(item)) &&
              roleids.includes('MR')
            ) {
              const updatedUser = await this.prisma.user.update({
                where: {
                  id: userInfo.id,
                },
                data: {
                  additionalUnits: [
                    ...new Set([
                      ...(Array.isArray(userInfo.additionalUnits)
                        ? userInfo.additionalUnits
                        : []),
                      ...(unitId ? [unitId] : []),
                    ]),
                  ],
                },
              });
            }
          }
          return res.send('successfull');
        } catch (err) {
          throw new BadRequestException(
            'Error occurred while updating roles in keycloak',
          );
        }
      } else {
        const activeUser = await this.prisma.user.findFirst({
          where: { id: data.users[0] },
        });
        const roleInfo = await this.prisma.role.findFirst({
          where: {
            roleName: roleId[0],
            organizationId: activeUser.organizationId,
          },
        });
        for (let user of data.users) {
          const userData = await this.prisma.user.findFirst({
            where: { id: user },
          });
          const updateRoles = [...userData.roleId, roleInfo.id];
          const removeDuplicate = [...new Set(updateRoles)];
          const updateUser = await this.prisma.user.update({
            where: { id: user },
            data: { roleId: removeDuplicate },
          });
        }
        // const userData = [...isUnqiue[0].users, ...users];
        // const upadate = await this.prisma.rolesTable.update({
        //   where: {
        //     id: isUnqiue[0].id,
        //   },
        //   data: {
        //     users: userData,
        //   },
        // });
        return res.send('successfull');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateRole(id, data, req, res) {
    try {
      const { users, rolesData, selectedUnit } = data;
      // console.log('users,rolesData', data);
      const userInfo: any = await this.prisma.user.findFirst({
        where: {
          id: users,
        },
        include: {
          organization: true,
          location: true,
          entity: true,
        },
      });
      // console.log('userInfo', userInfo);
      const keyToken = req.kcToken;

      const allRolesData = await this.prisma.role.findMany({
        where: {
          id: { in: userInfo.roleId },
          // NOT: [{ roleName: 'APPROVER' }, { roleName: 'REVIEWER' }],
        },
      });
      let userRoles: any = allRolesData.map((value) => value.id);
      const hasMRRole = allRolesData.some((role) =>
        role.roleName.includes('MR'),
      );
      const hasMCOERole = allRolesData.some((role) =>
        role.roleName.includes('ORG-ADMIN'),
      );
      // console.log('hasMCOERole', hasMCOERole);
      if (
        rolesData.roleName !== 'APPROVER' &&
        rolesData.roleName !== 'REVIEWER'
      ) {
        //check if he is mr in other units,if he is so just remove unit from the additional units not from the roleId entry
        if (hasMRRole && userInfo.additionalUnits?.length > 0) {
          // Check if there are any units other than selectedUnit
          // console.log('inside if he is mr condition');
          const updatedAdditionalUnits = userInfo.additionalUnits.filter(
            (unit) => {
              console.log('Comparing:', unit, selectedUnit);
              return unit !== selectedUnit;
            },
          );
          // console.log('updatedAdditionalUnits', updatedAdditionalUnits);
          if (updatedAdditionalUnits.length !== 0) {
            const updatedUser = await this.prisma.user.update({
              where: {
                id: id,
              },
              data: {
                additionalUnits:
                  userInfo.additionalUnits?.filter(
                    (unit) => unit !== selectedUnit,
                  ) || [],
              },
            });
          } else if (updatedAdditionalUnits.length === 0) {
            // console.log('inside else');
            const sendData = {
              ...userInfo,
              userId: userInfo.id,
              firstName: userInfo.firstname,
              lastName: userInfo.lastname,
              realm: userInfo.organization.realmName,
              location: userInfo.location.id,
              additionalUnits:
                userInfo.additionalUnits?.filter(
                  (unit) => unit !== selectedUnit,
                ) || [],
              entity: userInfo.entityId,
              roles: [rolesData.roleName],
            };
            // console.log('inside role update', sendData.additionalUnits);
            const updateKeycloak = await this.updateUserMaster(
              userInfo.id,
              sendData,
              keyToken,
            );
          }
        } else if (hasMCOERole) {
          // console.log('inside mcoe');
          const sendData = {
            ...userInfo,
            userId: userInfo.id,
            firstName: userInfo.firstname,
            lastName: userInfo.lastname,
            realm: userInfo.organization.realmName,
            location: userInfo.location.id,
            entity: userInfo.entityId,
            roles: [rolesData.roleName],
          };
          const updateKeycloak = await this.updateUserMaster(
            userInfo.id,
            sendData,
            keyToken,
          );
          // console.log('update keycloak', updateKeycloak);
        }
      } else {
        // const filteredArr = arr1.filter(item => item !== elementToRemove);
        const finalData = userRoles.filter((value) => value !== rolesData.id);
        await this.prisma.user.update({
          where: {
            id: users,
          },
          data: {
            roleId: finalData,
          },
        });
      }

      return res.send('success');
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserBasedOnFilter(filterData, userId) {
    // try {
    let finalResult = [];
    let results = [];
    const { roleId, locationId, searchUser } = filterData;
    console.log('roleId', locationId, roleId, searchUser);
    let result;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });
    // console.log('activeuser', activeUser);
    const roleInformation = await this.prisma.role.findFirst({
      where: {
        roleName: roleId,
        organizationId: activeUser.organizationId,
      },
    });
    // if (activeUser.userType !== 'globalRoles') {
    //  console.log('roleInformation', locationId);
    if (roleId === 'MR') {
      if (roleId !== 'null' && locationId !== 'null') {
        result = await this.prisma.user.findMany({
          where: {
            organization: {
              id: activeUser.organizationId,
            },
            roleId: {
              has: roleInformation.id,
            },
            OR: [
              {
                additionalUnits: {
                  has: locationId,
                },
              },
            ],
          },
          include: {
            entity: true,
          },
        });
        // console.log('result', result);
      } else if (roleId !== 'null' && locationId === 'null') {
        ////console.log('secnd if');
        result = await this.prisma.user.findMany({
          where: {
            organization: {
              id: activeUser.organizationId,
            },
            roleId: {
              has: roleId,
            },
          },
        });
      } else if (locationId !== 'null' && roleId === 'null') {
        ////console.log('third if');
        result = await this.prisma.user.findMany({
          where: {
            organization: {
              id: activeUser.organizationId,
            },
            OR: [
              {
                additionalUnits: {
                  has: locationId,
                },
              },
            ],
          },
          include: {
            entity: true,
          },
        });
      }
    } else {
      if (roleId !== 'null' && locationId !== 'null') {
        // result = await this.prisma.user.findMany({
        //   where: {
        //     organization: {
        //       id: activeUser.organizationId,
        //     },
        //     roleId: {
        //       has: roleInformation.id,
        //     },
        //     location: {
        //       id: locationId,
        //     },
        //   },
        //   include: {
        //     entity: true,
        //   },
        // });
        result = await this.prisma.user.findMany({
          where: {
            organization: {
              id: activeUser.organizationId,
            },
            roleId: {
              has: roleInformation.id,
            },
            // Dynamically apply location filtering based on additionalUnits
            AND: [
              {
                // If "All" is not in additionalUnits, apply location filtering
                OR: [
                  {
                    additionalUnits: {
                      has: 'All',
                    },
                  },
                  {
                    location: {
                      id: locationId,
                    },
                  },
                  {
                    additionalUnits: {
                      has: locationId,
                    },
                  },
                ],
              },
            ],
          },
          include: {
            entity: true,
          },
        });
      } else if (roleId !== 'null' && locationId === 'null') {
        ////console.log('secnd if');
        result = await this.prisma.user.findMany({
          where: {
            organization: {
              id: activeUser.organizationId,
            },
            roleId: {
              has: roleId,
            },
          },
        });
      } else if (locationId !== 'null' && roleId === 'null') {
        ////console.log('third if');
        result = await this.prisma.user.findMany({
          where: {
            organization: {
              id: activeUser.organizationId,
            },
            location: {
              id: locationId,
            },
          },
          include: {
            entity: true,
          },
        });
      }
    }
    if (
      !!searchUser &&
      searchUser !== undefined &&
      searchUser !== null &&
      searchUser !== 'undefined' &&
      searchUser !== ''
    ) {
      // console.log('inside if');
      const searchConditions: any = {
        OR: [
          { username: { contains: searchUser, mode: 'insensitive' } },
          { firstname: { contains: searchUser, mode: 'insensitive' } },
          { lastname: { contains: searchUser, mode: 'insensitive' } },
          { email: { contains: searchUser, mode: 'insensitive' } },
        ],
      };

      // Perform search with the provided search term
      const searchedUsers = await this.prisma.user.findMany({
        where: {
          organizationId: activeUser.organizationId,
          ...searchConditions, // spread the search conditions
        },
        select: {
          id: true,
        },
      });

      const searchedUserIds = searchedUsers.map((user) => user.id);

      // Filter the result by matching the ids from searched users
      result =
        result.length > 0 &&
        result.filter((user) => searchedUserIds.includes(user.id));
    }
    for (let user of result) {
      let location;
      if (user.userType !== 'globalRoles') {
        location = await this.prisma.location.findFirst({
          where: {
            id: user.locationId,
          },
        });
      } else {
        location = await this.prisma.location.findMany({
          where: {
            id: { in: user?.additionalUnits },
          },
        });
      }
      // const userInfo = await this.getAllUsers(roles.users);
      // const role = roleId !== 'null' ? [roleId] : roles.roleId;
      let roles: any = await this.prisma.role.findMany({
        where: {
          id: { in: user.roleId },
          NOT: { roleName: { contains: 'GENERAL-USER' } },
        },
        select: { id: true, roleName: true },
      });

      roles = roles.map((value) => {
        if (userId.kcRoles.roles.includes('ORG-ADMIN')) {
          return {
            ...value,
            isEdit: value.roleName !== 'AUDITOR' ? true : false,
          };
        } else if (userId.kcRoles.roles.includes('MR')) {
          if (value.roleName !== 'ORG-ADMIN' && value.roleName !== 'MR') {
            if (activeUser.locationId === user.locationId) {
              return {
                ...value,
                isEdit: value.roleName !== 'AUDITOR' ? true : false,
              };
            } else {
              return { ...value, isEdit: false };
            }
          } else {
            return { ...value, isEdit: false };
          }
        } else {
          return { ...value, isEdit: false };
        }
      });
      let userRoleInfo;
      if (roles.length > 0) {
        userRoleInfo = {
          roleTableId: user.id,
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email,
          userId: user.id,
          roles: roles,
          unitName: Array.isArray(location)
            ? 'multiple'
            : location.locationName,
          unitId: location?.id,
          entityName: user?.entity?.entityName,
          // };
        };
      }
      // for (let user of userInfo) {
      if (userRoleInfo !== undefined) {
        finalResult.push(userRoleInfo);
      }
    }
    // console.log('finalResult', finalResult);
    return finalResult;
    // }
    // } catch (err) {
    //   throw new NotFoundException(err);
    // }
  }
  // async getUserBasedOnFilter(filterData, userId) {
  //   try {
  //     let finalResult = [];
  //     let results = [];
  //     const { roleId, locationId } = filterData;
  //     let result;
  //     const activeUser = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: userId.id,
  //       },
  //     });
  //     const roleInformation = await this.prisma.role.findFirst({
  //       where: {
  //         roleName: roleId,
  //         organizationId: activeUser.organizationId,
  //       },
  //     });
  //     if (roleId !== 'null' && locationId !== 'null') {
  //       ////console.log('1 st if');
  //       ////console.log('roleId', roleId);
  //       result = await this.prisma.user.findMany({
  //         where: {
  //           organization: {
  //             id: activeUser.organizationId,
  //           },
  //           roleId: {
  //             has: roleInformation.id,
  //           },
  //           location: {
  //             id: locationId,
  //           },
  //         },
  //         include: {
  //           entity: true,
  //         },
  //       });
  //     } else if (roleId !== 'null' && locationId === 'null') {
  //       ////console.log('secnd if');
  //       result = await this.prisma.user.findMany({
  //         where: {
  //           organization: {
  //             id: activeUser.organizationId,
  //           },
  //           roleId: {
  //             has: roleId,
  //           },
  //         },
  //       });
  //     } else if (locationId !== 'null' && roleId === 'null') {
  //       ////console.log('third if');
  //       result = await this.prisma.user.findMany({
  //         where: {
  //           organization: {
  //             id: activeUser.organizationId,
  //           },
  //           location: {
  //             id: locationId,
  //           },
  //         },
  //         include: {
  //           entity: true,
  //         },
  //       });
  //     }

  //     for (let user of result) {
  //       const location = await this.prisma.location.findFirst({
  //         where: {
  //           id: user.locationId,
  //         },
  //       });
  //       // const userInfo = await this.getAllUsers(roles.users);
  //       // const role = roleId !== 'null' ? [roleId] : roles.roleId;
  //       let roles: any = await this.prisma.role.findMany({
  //         where: {
  //           id: { in: user.roleId },
  //           NOT: { roleName: { contains: 'GENERAL-USER' } },
  //         },
  //         select: { id: true, roleName: true },
  //       });

  //       roles = roles.map((value) => {
  //         if (userId.kcRoles.roles.includes('ORG-ADMIN')) {
  //           return { ...value, isEdit: true };
  //           return { ...value, isEdit: value.roleName !=="AUDITOR"?true:false };
  //         } else if (userId.kcRoles.roles.includes('MR')) {
  //           if (value.roleName !== 'ORG-ADMIN' && value.roleName !== 'MR') {
  //             if (activeUser.locationId === user.locationId) {
  //               return {
  //                 ...value,
  //                 isEdit: true,
  //                 isEdit: value.roleName !=="AUDITOR"?true:false,
  //               };
  //             } else {
  //               return { ...value, isEdit: false };
  //             }
  //           } else {
  //             return { ...value, isEdit: false };
  //           }
  //         } else {
  //           return { ...value, isEdit: false };
  //         }
  //       });
  //       let userRoleInfo;
  //       if (roles.length > 0) {
  //         userRoleInfo = {
  //           roleTableId: user.id,
  //           firstName: user.firstname,
  //           lastName: user.lastname,
  //           email: user.email,
  //           userId: user.id,
  //           roles: roles,
  //           unitName: location.locationName,
  //           unitId: location.id,
  //           entityName: user?.entity?.entityName,
  //           // };
  //         };
  //       }
  //       // for (let user of userInfo) {
  //       if (userRoleInfo !== undefined) {
  //         finalResult.push(userRoleInfo);
  //       }
  //     }
  //     return finalResult;
  //   } catch (err) {
  //     throw new NotFoundException(err);
  //   }
  // }

  async getAllRoles(userId) {
    try {
      let result = [];
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const allroles = await this.prisma.rolesTable.findMany({
        where: {
          orgId: activeUser.organizationId,
        },
      });

      for (let roles of allroles) {
        const location = await this.prisma.location.findFirst({
          where: {
            id: roles.unitId,
          },
        });
        const userInfo = await this.getAllUsers(roles.users);
        for (let user of userInfo) {
          const roleData = {
            roleTableId: roles.id,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            userId: user.id,
            roles: roles.roleId,
            unitName: location.locationName,
            unitId: location.id,
          };

          result.push(roleData);
        }
      }

      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
  async getAllRolesInOrg(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
        include: {
          organization: true,
        },
      });
      const excludedRoles = [
        `default-roles-${activeUser.organization?.realmName}`,
        'offline_access',
        'GENERAL-USER',
        'ORG-ADMIN',
        'MR',
        'uma_authorization',
        'AUDITOR',
        'LOCATION-ADMIN',
        'ENTITY-HEAD',
        'REVIEWER',
        'APPROVER',
      ];

      const allroles = await this.prisma.role.findMany({
        where: {
          organizationId: activeUser.organizationId,
          roleName: {
            notIn: excludedRoles, // Exclude the listed roles
          },
        },
      });

      return allroles;
    } catch (error) {
      console.log('err', error);
    }
  }

  async getAllUsers(ids: any) {
    try {
      const result = await this.prisma.user.findMany({
        where: {
          id: { in: ids },
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          avatar: true,
          entity: {
            select: {
              id: true,
              entityName: true,
            },
          },
        },
      });
      return result;
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async deleteRolesById(id) {
    try {
      const deleteRole = await this.prisma.rolesTable.delete({
        where: {
          id,
        },
      });
      return deleteRole;
    } catch {}
  }

  async workFlowDistribution(userId) {
    try {
      let approver = [];
      let reviewer = [];
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const result = await this.prisma.rolesTable.findMany({
        where: {
          unitId: activeUser.locationId,
        },
      });

      for (let value of result) {
        if (value.roleId.includes('REVIEWER')) {
          const result = await this.getAllUsers(value.users);
          reviewer.push(...result);
        }

        if (value.roleId.includes('APPROVER')) {
          const result = await this.getAllUsers(value.users);
          approver.push(...result);
        }
      }
      return { approver: approver, reviewer: reviewer };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async workFlowDistributionReviewer(userId) {
    // try {
    let reviewer = [];
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    const reviewerId: any = await this.prisma.role.findFirst({
      where: {
        roleName: 'REVIEWER',
        organizationId: activeUser.organizationId,
      },
    });
    const finalResult = await this.prisma.user.findMany({
      where: {
        roleId: { has: reviewerId.id },
        // locationId: activeUser.locationId,
        status: true,
        organizationId: activeUser.organizationId,
        deleted: false,
      },
      include: {
        entity: true,
        location: true,
      },
    });
    return finalResult;
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }

  async workFlowDistributionApprover(userId) {
    try {
      let reviewer = [];
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const reviewerId: any = await this.prisma.role.findFirst({
        where: {
          roleName: 'APPROVER',
          organizationId: activeUser.organizationId,
        },
      });
      const finalResult = await this.prisma.user.findMany({
        where: {
          roleId: { has: reviewerId.id },
          // locationId: activeUser.locationId,
          organizationId: activeUser.organizationId,
          status: true,
          deleted: false,
        },
        include: {
          entity: true,
          location: true,
        },
      });
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  async getLocations(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const locations = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
          deleted: false,
          type: 'Unit',
        },
      });
      return locations;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  isUserInApprovers(loggedInUser: any, approvers: any) {
    return approvers.some(
      (approver: any) => approver.email === loggedInUser.email,
    );
  }

  async updateUserMaster(id: string, payload, token: string) {
    const {
      realm,
      userType,
      status,
      username,
      firstName,
      lastName,
      email,
      location,
      businessType,
      additionalUnits,
      entity,
      section,
    } = payload;
    let roles: any = payload?.roles;
    //finding the user from the database
    let user: any = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        organization: true,
      },
    });

    const roleData = await this.prisma.role.findMany({
      where: {
        id: { in: user.roleId },
        organizationId: user.organizationId,
        NOT: [{ roleName: 'APPROVER' }, { roleName: 'REVIEWER' }],
      },
    });

    const reviewerAndApprover = await this.prisma.role.findMany({
      where: {
        id: { in: user.roleId },
        organizationId: user.organizationId,
        NOT: [
          { roleName: 'MR' },
          { roleName: 'ORG-ADMIN' },
          { roleName: 'AUDITOR' },
          { roleName: 'GENERAL-USER' },
        ],
      },
    });

    const reviewerAndApproverIds = reviewerAndApprover?.map(
      (value) => value.id,
    );
    const userRoles = roleData.map((item) => item.roleName);
    if (roles.length === 0) {
      const set = new Set(userRoles);
      set.delete('MR');
      set.delete('AUDITOR');
      roles = Array.from(set);
    } else if (userRoles.includes(roles[0])) {
      const set = new Set([...userRoles, ...roles]);
      set.delete(roles[0]);
      roles = Array.from(set);
    } else {
      const set = new Set([...userRoles, ...roles]);
      set.delete('GENERAL-USER');
      roles = Array.from(set);
    }

    // if no roles assiged for the current user we assign `GENERAL-USER` role
    if (roles.length === 0) {
      roles.push('GENERAL-USER');
    }

    console.log('roles', roles);
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: user.organizationId,
      },
    });
    const roleIds = await this.prisma.role.findMany({
      where: { roleName: { in: roles }, organizationId: user.organizationId },
    });
    const finalroleIds = roleIds.map((value) => value.id);

    if (user) {
      const kcId = user.kcId;

      const updateUserKcApi =
        process.env.KEYCLOAK_API +
        process.env.BASE +
        user.organization.realmName +
        '/users/' +
        kcId;
      const data = {
        firstName,
        lastName,
        email,
      };

      // try {
      const updateUserResponse = await axiosKc(
        updateUserKcApi,
        'PUT',
        token,
        data,
      );

      if (updateUserResponse.status === 204) {
        //Delete any previosly assigned roles
        try {
          const baseRoleMapping =
            process.env.KEYCLOAK_API +
            process.env.BASE +
            user.organization.realmName +
            '/users/' +
            kcId +
            '/role-mappings/realm';
          const getBaseRoleResponse = await axiosKc(
            baseRoleMapping,
            'GET',
            token,
          );
          const deleteBaseRoleResponse = await axiosKc(
            baseRoleMapping,
            'DELETE',
            token,
            getBaseRoleResponse.data,
          );
        } catch (err) {
          throw new BadRequestException(
            'Error occured while updating roles in keycloak',
          );
        }

        const userKcId = kcId;

        //creating and assiging roles on keycloak
        const createRolesConfigurationForUserInKc = await createRolesConfigInKc(
          roles,
          user.organization.realmName,
          token,
          kcId,
          userKcId,
        );

        if (createRolesConfigurationForUserInKc !== 204) {
          throw new HttpException(
            'Roles config for user failed in keycloak',
            503,
          );
        }
        const removedDuplicate: any = Array.from(
          new Set([...finalroleIds, ...reviewerAndApproverIds]),
        );
        const updatedUser = await this.prisma.user.update({
          where: {
            id: id,
          },
          data: {
            roleId: removedDuplicate,
            additionalUnits: additionalUnits,
          },
        });
        // roles.forEach(async (role) => {
        //   const roleData = await this.prisma.role.findFirst({
        //     where: {
        //       AND: [{ organizationId: organization.id }, { roleName: role }],
        //     },
        //   });

        //   //create  roles again
        //   // await this.prisma.userRole.create({
        //   //   data: {
        //   //     role: {
        //   //       connect: {
        //   //         id: roleData.id,
        //   //       },
        //   //     },
        //   //     user: {
        //   //       connect: {
        //   //         id: updatedUser.id,
        //   //       },
        //   //     },
        //   //   },
        //   // });
        // });

        const sendInviteKcApi =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          realm +
          '/users/' +
          updatedUser.kcId +
          `/execute-actions-email?redirect_uri=${process.env.PROTOCOL}://${realm}.${process.env.REDIRECT}&client_id=admin-cli`;
        try {
          await axiosKc(sendInviteKcApi, 'PUT', token, ['UPDATE_PASSWORD']);
        } catch {}

        return {
          status: 200,
          body: updatedUser,
        };
        // res.status(200).send(updatedUser);
      }
      // } catch (err) {
      //   throw new HttpException(err.message, 400);
      // }

      // updating the user in keycloak
    } else {
      return { msg: 'user not found' };
    }
  }

  async updateRoleTest(id, data, req) {
    // try {
    const { users, rolesData } = data;
    const userInfo: any = await this.prisma.user.findFirst({
      where: {
        id: users,
      },
      include: {
        organization: true,
        location: true,
        entity: true,
      },
    });
    const keyToken = req.kcToken;

    const allRolesData = await this.prisma.role.findMany({
      where: {
        id: { in: userInfo.roleId },
        // NOT: [{ roleName: 'APPROVER' }, { roleName: 'REVIEWER' }],
      },
    });
    let userRoles: any = allRolesData.map((value) => value.id);

    if (
      rolesData.roleName !== 'APPROVER' &&
      rolesData.roleName !== 'REVIEWER'
    ) {
      const sendData = {
        ...userInfo,
        userId: userInfo.id,
        firstName: userInfo.firstname,
        lastName: userInfo.lastname,
        realm: userInfo.organization.realmName,
        location: userInfo.location.id,
        entity: userInfo.entityId,
        roles: [rolesData.roleName],
      };
      const updateKeycloak = await this.updateUserMaster(
        userInfo.id,
        sendData,
        keyToken,
      );
    } else {
      // const filteredArr = arr1.filter(item => item !== elementToRemove);
      const finalData = userRoles.filter((value) => value !== rolesData.id);
      await this.prisma.user.update({
        where: {
          id: users,
        },
        data: {
          roleId: finalData,
        },
      });
    }

    return 'sucesss';
    // } catch (error) {
    //   throw new InternalServerErrorException(error);
    // }
  }

  async getFilterListForRoles(userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });
    const rolesData = await this.prisma.role.findMany({
      where: {
        organizationId: activeUser.organizationId,
      },
    });
  }
}
