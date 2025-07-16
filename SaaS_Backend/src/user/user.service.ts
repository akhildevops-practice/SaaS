import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Inject,
} from '@nestjs/common';
// import { Prisma } from '@prisma/client';
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SMTP_PASSWORD);
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { axiosKc } from '../utils/axios.global';
import { createRolesInKc, Error } from '../utils/helper';
import { UserMaster } from './dto/user-master.dto';

import { getUserRoleDetails, createRolesConfigInKc } from './helper';
import { findAllUsers } from './userFilter';
import { userInfo } from 'os';
import { CreateUserRating } from './dto/create-rating.dto';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import common = require('oci-common');
import * as objectstorage from 'oci-objectstorage';

import {
  transferredUser,
  TransferredUserDocument,
} from './schema/transferredUser.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { EmailService } from 'src/email/email.service';
const XLSX = require('xlsx');
import crypto from 'crypto';
interface AuditScheduleEntity {
  auditee: string[]; // or the correct type for your use case
  auditor: string[];
  // other fields...
}

import { GlobalRoles } from './schema/globlaRoles.schema';
import { LicenseService } from 'src/license/license.service';
import { License } from 'src/license/schema/license.schema';
import generateUserKeyPair from 'src/digital-signature/generateKey';
import { ObjectStore } from 'src/object-store/schema/object-store.schema';
import axios from 'axios';
import { OciUtils } from 'src/documents/oci_utils';

const oci = require('oci-sdk');
const { createVerify, createSign } = require('crypto');
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(transferredUser.name)
    private readonly transferredUser: Model<TransferredUserDocument>,
    @InjectModel(License.name)
    private readonly licenseModel: Model<License>,
    @Inject('Logger') private readonly logger: Logger,
    private readonly emailService: EmailService,
    private readonly licenseService: LicenseService,
    private readonly ociUtils: OciUtils,

    @InjectModel(ObjectStore.name)
    private ObjectStoreModel: Model<ObjectStore>,
    @InjectModel(GlobalRoles.name)
    private readonly globalRolesModel: Model<GlobalRoles>,
  ) {}

  /**
   *
   * @param createUserDto contains all the fields requied for creating a user
   * @param res to send back the desired HTTP response
   * @param token token requied for authentication
   */
  async createAdmin(createUserDto: CreateUserDto, res: any, token: any) {
    const {
      realm,
      username,
      firstName,
      lastName,
      email,
      userRole,
      locationId,
      entityId,
    } = createUserDto;
    const url = process.env.BASE + realm + '/users';
    //////////////////console.log('url', url);
    //////////////////console.log('url', url);
    const createUserKcApi = process.env.KEYCLOAK_API + url;
    //////////////////console.log('createUserKcApi', createUserKcApi);
    //////////////////console.log('createUserKcApi', createUserKcApi);
    const userPayload = {
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: email,
      enabled: true,
      requiredActions: ['UPDATE_PASSWORD'],
      // requiredActions is required for the user to update password during first time login
    };
    try {
      // creating user in keycloak
      const createUserResponse = await axiosKc(
        createUserKcApi,
        'POST',
        token,
        userPayload,
      );
      if (createUserResponse.status === 201) {
        // spliting out the keycloak user id
        const id = createUserResponse.headers.location.split('/users/');
        const userKcId = id[1];
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // fetching the role data from keycloak
        const getRoleKcApi =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          `${realm}/roles/${userRole}`;

        try {
          const getRoleResponse = await axiosKc(getRoleKcApi, 'GET', token);
          //console

          if (getRoleResponse.status === 200) {
            const baseRoleMapping =
              process.env.BASE +
              realm +
              '/users/' +
              userKcId +
              '/role-mappings/realm';
            const roleMappingApi = process.env.KEYCLOAK_API + baseRoleMapping;
            const clientRolePayload = [
              { id: getRoleResponse.data.id, name: userRole },
            ];
            try {
              // assigning client role to user in keycloak
              const assignClientRoleResponse = await axiosKc(
                roleMappingApi,
                'POST',
                token,
                clientRolePayload,
              );
              //console

              if (assignClientRoleResponse.status === 204) {
                const getRealmManagementKcApi =
                  process.env.KEYCLOAK_API +
                  process.env.BASE +
                  realm +
                  '/clients?clientId=realm-management';
                try {
                  // fetching client realm management data from keycloak
                  const realmManagementResponse = await axiosKc(
                    getRealmManagementKcApi,
                    'GET',
                    token,
                  );
                  //console
                  if (realmManagementResponse.status === 200) {
                    const clientId = realmManagementResponse.data[0].id;
                    const getManageRealmKcApi =
                      process.env.KEYCLOAK_API +
                      process.env.BASE +
                      realm +
                      '/clients/' +
                      clientId +
                      '/roles/realm-admin';
                    try {
                      // fetching manage realm data from keycloak
                      const manageRealmResponse = await axiosKc(
                        getManageRealmKcApi,
                        'GET',
                        token,
                      );

                      if (manageRealmResponse.status === 200) {
                        const assign_role_api =
                          process.env.KEYCLOAK_API +
                          process.env.BASE +
                          realm +
                          '/users/' +
                          id[1] +
                          '/role-mappings/clients/' +
                          clientId;

                        const role_data = [
                          {
                            id: manageRealmResponse.data.id,
                            name: manageRealmResponse.data.name,
                          },
                        ];
                        try {
                          // assigning realm role to user in keycloak
                          const assignRealmRoleResponse = await axiosKc(
                            assign_role_api,
                            'POST',
                            token,
                            role_data,
                          );
                          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                          const organizationData =
                            await this.prisma.organization.findFirst({
                              where: {
                                realmName: {
                                  contains: realm,
                                },
                              },
                            });

                          let locationData: any;
                          if (userRole === 'LOCATION-ADMIN') {
                            locationData = await this.prisma.location.findFirst(
                              {
                                where: {
                                  id: locationId,
                                },
                              },
                            );
                          }
                          let entityData;
                          if (userRole === 'ENTITY-HEAD') {
                            entityData = await this.prisma.entity.findFirst({
                              where: {
                                id: entityId,
                              },
                            });
                          }

                          const role = await this.prisma.role.findFirst({
                            where: {
                              AND: [
                                { roleName: { equals: userRole } },
                                {
                                  organizationId: {
                                    equals: organizationData.id,
                                  },
                                },
                              ],
                            },
                          });
                          const roleData = [role.id];
                          const userId: any = id[1];
                          let user: any;
                          user = {
                            kcId: userId,
                            email: email,
                            username: username,
                            firstname: firstName,
                            lastname: lastName,
                            // roleId:role.id,
                            roleId: roleData,
                            status: true,
                            organization: {
                              connect: { id: organizationData.id },
                            },
                          };

                          if (userRole === 'LOCATION-ADMIN') {
                            user = {
                              kcId: userId,
                              email: email,
                              username: username,
                              firstname: firstName,
                              lastname: lastName,
                              status: true,
                              organization: {
                                connect: { id: organizationData.id },
                              },
                              location: {
                                connect: { id: locationData.id },
                              },
                            };
                          }

                          if (userRole === 'ENTITY-HEAD') {
                            user = {
                              kcId: userId,
                              email: email,
                              username: username,
                              firstname: firstName,
                              lastname: lastName,
                              status: true,
                              organization: {
                                connect: { id: organizationData.id },
                              },
                              entity: {
                                connect: { id: entityData.id },
                              },
                              location: {
                                connect: {
                                  id: entityData.locationId,
                                },
                              },
                            };
                          }

                          let createdUser: any;
                          try {
                            createdUser = await this.prisma.user.create({
                              data: user,
                            });
                            //await createCompositeKey(this.prisma.user, organizationData.id, createdUser.id)
                            try {
                              // await this.prisma.userRole.create({
                              //   data: {
                              //     role: {
                              //       connect: {
                              //         id: role.id,
                              //       },
                              //     },
                              //     user: {
                              //       connect: {
                              //         id: createdUser.id,
                              //       },
                              //     },
                              //   },
                              // });
                              // sending invite to user

                              try {
                                const send_invite_api =
                                  process.env.KEYCLOAK_API +
                                  process.env.BASE +
                                  realm +
                                  '/users/' +
                                  createdUser.kcId +
                                  `/execute-actions-email?redirect_uri=${process.env.PROTOCOL}://${realm}.${process.env.REDIRECT}&client_id=admin-cli`;

                                const response = await axiosKc(
                                  send_invite_api,
                                  'PUT',
                                  token,
                                  ['UPDATE_PASSWORD'],
                                );
                                //////////////////console.log("response",response)
                                if (response.status === 204) {
                                  res
                                    .status(HttpStatus.CREATED)
                                    .send(createdUser);
                                }
                              } catch (err) {
                                const msg = 'Unable to send invite';
                                return Error(err, res, msg);
                              }
                            } catch (err) {
                              const msg =
                                'Unable to create user role in database';
                              return Error(err, res, msg);
                            }
                          } catch (err) {
                            const msg = 'Unable to create user in database';
                            return Error(err, res, msg);
                          }
                        } catch (err) {
                          const msg =
                            'Unable to assign realm roles in keycloak';
                          return Error(err, res, msg);
                        }
                      }
                    } catch (err) {
                      const msg = 'Unable to fetch realm roles in keycloak';
                      return Error(err, res, msg);
                    }
                  }
                } catch (err) {
                  const msg = 'Unable to fetch realm management in keycloak';
                  return Error(err, res, msg);
                }
              }
            } catch (err) {
              const msg = 'Unable to assign role in keycloak';
              return Error(err, res, msg);
            }
          }
        } catch (err) {
          const msg = 'Unable to fetch roles from keycloak';
          return Error(err, res, msg);
        }
      }
    } catch (err) {
      const msg = 'Unable to create user in keycloak';
      return Error(err, res, msg);
    }
  }

  /**
   *
   * @param realm required realm for api request
   * @returns an array of all the organization admins of a particular organization
   */
  async getOrgAdmin(realm: any) {
    // fetching the required organization data from database
    const organizationData = await this.prisma.organization.findFirst({
      where: {
        realmName: {
          contains: realm,
        },
      },
    });
    if (organizationData) {
      // fetching the required role data from database
      const role = await this.prisma.role.findFirst({
        where: {
          AND: [
            { roleName: { equals: 'ORG-ADMIN' } },
            {
              organizationId: {
                equals: organizationData.id,
              },
            },
          ],
        },
      });

      if (role) {
        // fetching all the organization admins from database
        const users = await this.prisma.user.findMany({
          where: {
            roleId: { has: role.id },
            deleted: false,
            // assignedRole: {
            //   some: {
            //     roleId: {
            //       equals: role.id,
            //     },
            //   },
            // },
          },
          select: {
            id: true,
            kcId: true,
            username: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        });
        return users;
      } else {
        throw new NotFoundException();
      }
    } else {
      throw new NotFoundException();
    }
  }

  /**
   *
   * @param id auto generated uuid of user
   * @param realm required realm for api request
   * @param token token requied for authentication
   * @returns returns the deleted user
   */
  async permanentdeleteAdmin(id: string, realm: string, token: string) {
    // finding the user from the database
    const userToBeDeleted = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    // checking if the user exists
    if (userToBeDeleted) {
      const kcId = userToBeDeleted.kcId;
      const deleteUserKcApi =
        process.env.KEYCLOAK_API + process.env.BASE + realm + '/users/' + kcId;
      try {
        // deleting the user from keycloak
        const deleteFromKc = await axiosKc(deleteUserKcApi, 'DELETE', token);

        const userFromDB = await this.prisma.user.delete({
          where: {
            id: id,
          },
        });

        return userFromDB;
      } catch (err) {
        throw new HttpException(err.message, 400);
      }
    } else {
      throw new NotFoundException();
    }
  }
  async deleteAdmin(id: string, realm: string, token: string) {
    const userToBeDeleted = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    // checking if the user exists
    if (userToBeDeleted) {
      // const kcId = userToBeDeleted.kcId;
      // const deleteUserKcApi =
      //   process.env.KEYCLOAK_API + process.env.BASE + realm + '/users/' + kcId;
      try {
        // deleting the user from keycloak
        // const deleteFromKc = await axiosKc(deleteUserKcApi, 'DELETE', token);

        const userFromDB = await this.prisma.user.update({
          where: {
            id: id,
          },
          data: {
            deleted: true,
          },
        });

        return userFromDB;
      } catch (err) {
        throw new HttpException(err.message, 400);
      }
    } else {
      throw new NotFoundException();
    }
  }
  async restoreAdmin(id: string, realm: string, token: string) {
    const userToBeDeleted = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    // checking if the user exists
    if (userToBeDeleted) {
      // const kcId = userToBeDeleted.kcId;
      // const deleteUserKcApi =
      //   process.env.KEYCLOAK_API + process.env.BASE + realm + '/users/' + kcId;
      try {
        // deleting the user from keycloak
        // const deleteFromKc = await axiosKc(deleteUserKcApi, 'DELETE', token);

        const userFromDB = await this.prisma.user.update({
          where: {
            id: id,
          },
          data: {
            deleted: false,
          },
        });

        return userFromDB;
      } catch (err) {
        throw new HttpException(err.message, 400);
      }
    } else {
      throw new NotFoundException();
    }
  }

  /**
   *
   * @param id auto generated uuid of user
   * @param realm required realm for api request
   * @param token token requied for authentication
   */
  async sendInvite(id: any, realm: any, token: any) {
    const send_invite_api =
      process.env.KEYCLOAK_API +
      process.env.BASE +
      realm +
      '/users/' +
      id +
      `/execute-actions-email?redirect_uri=${process.env.PROTOCOL}://${realm}.localhost:3000&client_id=admin-cli`;

    const response = await axiosKc(send_invite_api, 'PUT', token, [
      'UPDATE_PASSWORD',
    ]);

    if (response.status === 204) {
      return { msg: 'Email sent' };
    }
  }

  /**
   *
   * @param id auto generated uuid of user
   * @param realm required realm for api request
   * @param token token requied for authentication
   * @param body contains all the fields requied for updating a user
   * @returns returns the updated organization admin
   */
  async updateAdmin(id: string, realm: any, token: any, body: CreateUserDto) {
    const { firstName, lastName, email } = body;
    //finding the user from the database
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
        deleted: false,
      },
    });

    // checking if the user exists
    if (user) {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          firstname: firstName,
          lastname: lastName,

          email: email,
        },
      });

      const kcId = updatedUser.kcId;

      const updateUserKcApi =
        process.env.KEYCLOAK_API + process.env.BASE + realm + '/users/' + kcId;
      const data = {
        firstName,
        lastName,
        email,
      };

      // updating the user in keycloak
      await axiosKc(updateUserKcApi, 'PUT', token, data);
      const sendInviteKcApi =
        process.env.KEYCLOAK_API +
        process.env.BASE +
        realm +
        '/users/' +
        updatedUser.kcId +
        `/execute-actions-email?redirect_uri=${process.env.PROTOCOL}://${realm}.${process.env.REDIRECT}&client_id=admin-cli`;
      await axiosKc(sendInviteKcApi, 'PUT', token, ['UPDATE_PASSWORD']);
      return {
        msg: 'User updated',
      };
    } else {
      return { msg: 'user not found' };
    }
  }

  async updateUserMaster(id: string, payload: UserMaster, token: string, res) {
    const {
      realm,
      userType,
      status,
      username,
      firstName,
      lastName,
      email,
      location,
      roleName,
      additionalUnits,
      // business,
      entity,
      functionId,
      signature,
      // section,
    } = payload;
    // console.log('payload', payload);
    const locationInfo: any = location ? location : null;
    const entityInfo: any = entity ? entity : null;
    let roles: any = payload?.roles;
    //finding the user from the database
    const user: any = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        // assignedRole: {
        //   include: {
        //     role: true,
        //   },
        // },
      },
    });
    // getting current user roles
    const roleInfo = await this.prisma.role.findMany({
      where: {
        id: { in: user.roleId },
      },
    });
    const userRoles = roleInfo?.map((item) => item.roleName);
    if (roles.length === 0) {
      const set = new Set(userRoles);
      set.delete('MR');
      set.delete('AUDITOR');
      roles = Array.from(set);
    } else {
      const set = new Set([...userRoles, ...roles]);

      if (roles.includes('MR') && roles.length === 1) {
        set.delete('AUDITOR');
      }

      if (roles.includes('AUDITOR') && roles.length === 1) {
        set.delete('MR');
      }

      roles = Array.from(set);
    }

    // if no roles assiged for the current user we assign `GENERAL-USER` role
    if (roles.length === 0) {
      roles.push('GENERAL-USER');
    }
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realm,
      },
    });

    let dataUser;
    if (userType === 'globalRoles' && roleName !== null) {
      const checkUnique = await this.prisma.role.findFirst({
        where: {
          roleName: {
            equals: roleName,
            mode: 'insensitive',
          },
        },
      });
      if (checkUnique) {
        //if exists then just pushed the roleName into roles array
        roles = [];
        roles.push(roleName);
      } else {
        roles = [];
        const createRoleKcApi =
          process.env.KEYCLOAK_API + '/auth/admin/realms/' + realm + '/roles';
        const keyCloakResult = await createRolesInKc(
          [roleName],
          token,
          createRoleKcApi,
        );
        // console.log('result', keyCloakResult);
        // try {

        roles.push(roleName);
        const getAllRolesKcApi =
          process.env.KEYCLOAK_API + process.env.BASE + realm + '/roles';
        const getRolesfromKc = await axiosKc(getAllRolesKcApi, 'GET', token);
        //console.log('roleName', getRolesfromKc);
        const createdRole = getRolesfromKc?.data?.find(
          (item) => item.name === roleName,
        );
        let data: any = {
          kcId: createdRole.id,
          roleName: createdRole.name,
          organization: {
            connect: {
              id: organization.id,
            },
          },
        };
        try {
          await this.prisma.role.create({ data });
        } catch (err) {
          res.status(400).send({
            status: err.message,
            message: 'Unable to create role in database',
          });
        }
      }
      // console.log('roles', roles);
      const rolesData = await this.prisma.role.findMany({
        where: {
          organizationId: organization.id,
          roleName: { in: roles },
        },
      });
      // const set = new Set([...userRoles, ...roles]);
      // console.log('rolesData', rolesData);

      const finalRoleData = rolesData.map((value) => value.id);
      // console.log('finalRoleData', finalRoleData);
      dataUser = {
        email: email,
        userType: userType,
        username: username,
        firstname: firstName,
        lastname: lastName,
        roleId: finalRoleData,
        signature,
        functionId,
        entity:
          entityInfo && entityInfo !== 'All'
            ? { connect: { id: entity } }
            : {
                disconnect: true, // Disconnect the relationship to set `entityId` to null
              },
        // role:{connect:{id:finalRoleData}},
        organization: {
          connect: { id: organization.id },
        },

        additionalUnits: additionalUnits,
      };
    } else {
      dataUser = {
        firstname: firstName,
        lastname: lastName,
        username: username,
        email: email,
        status: status,
        signature: signature,
        userType: userType,
        functionId,
        organization: {
          connect: { id: organization.id },
        },
        location: {
          connect: { id: locationInfo },
        },
        // business: {
        //   connect: { id: business },
        // },
        //  entityId:entityInfo||null,
        entity: entityInfo
          ? { connect: { id: entityInfo } }
          : {
              disconnect: true, // Disconnect the relationship to set `entityId` to null
            },
        // entityId:entityInfo
        // section: {
        //   connect: { id: section },
        // },
        // assignedRole: {
        //   deleteMany: {},
        // },
      };
    }

    // checking if the user exists
    if (user) {
      const updatedUser: any = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: dataUser,
        // include: {
        //   assignedRole: true,
        // },
      });

      const kcId = updatedUser.kcId;

      const updateUserKcApi =
        process.env.KEYCLOAK_API + process.env.BASE + realm + '/users/' + kcId;
      const data = {
        firstName,
        lastName,
        email,
      };
      //if usertype is globalroles dont do anything in keycloak wrt roles just update firstname,lastname,email
      if (userType === 'globalRoles') {
        const roleNameToCheck = roleName;
        const organizationId = updatedUser.organizationId;
        const userId = updatedUser.id;

        // Check if the role already exists
        const existingRole = await this.globalRolesModel.findOne({
          roleName: roleNameToCheck,
          organizationId: organizationId,
        });

        if (existingRole) {
          // Role exists — append user ID if not already present
          if (!existingRole.assignedTo.includes(userId)) {
            await this.globalRolesModel.updateOne(
              { _id: existingRole._id },
              { $addToSet: { assignedTo: userId } }, // $addToSet avoids duplicates
            );
          }
        } else {
          // Role does not exist — create new role entry
          const globalRolesData: any = {
            roleName: roleNameToCheck,
            organizationId: organizationId,
            assignedTo: [userId],
          };

          await this.globalRolesModel.create(globalRolesData);
        }
        res.status(200).send(updatedUser);
      } else {
        try {
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
                realm +
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
            const createRolesConfigurationForUserInKc =
              await createRolesConfigInKc(roles, realm, token, kcId, userKcId);

            if (createRolesConfigurationForUserInKc !== 204) {
              throw new HttpException(
                'Roles config for user failed in keycloak',
                503,
              );
            }

            roles.forEach(async (role) => {
              const roleData = await this.prisma.role.findFirst({
                where: {
                  AND: [
                    { organizationId: organization.id },
                    { roleName: role },
                  ],
                },
              });
              // console.log('roleData before deletion', roleData);
              //create  roles again
              // await this.prisma.userRole.create({
              //   data: {
              //     role: {
              //       connect: {
              //         id: roleData.id,
              //       },
              //     },
              //     user: {
              //       connect: {
              //         id: updatedUser.id,
              //       },
              //     },
              //   },
              // });
            });
            // if (userType === 'globalRoles') {
            // const globalRolesData: any = {
            //   roleName: roleName,
            //   organizationId: updatedUser.organizationId,
            //   assignedTo: [updatedUser.id],
            // };
            // console.log('created global roles payload', globalRolesData);
            // const rolesResult = await this.globalRolesModel.create(
            //   globalRolesData,
            // );
            // console.log('globalresultdata', rolesResult);
            // }
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

            // return {
            //   status: 200,
            //   body: updatedUser,
            // };
            res.status(200).send(updatedUser);
          }
        } catch (err) {
          throw new HttpException(err.message, 400);
        }
      }

      // updating the user in keycloak
    } else {
      return { msg: 'user not found' };
    }
  }

  async createUser(payload: UserMaster, token: string, res: any) {
    const {
      realm,
      userType,
      status,
      username,
      firstName,
      lastName,
      email,
      location,
      roleName,
      additionalUnits,
      // business,
      entity,
      // section,
      functionId,
      roles,
      signature,
      kcId,
    }: any = payload;
    // console.log('payload', payload);
    //get user count from realm license if it is less than allow user to be added else throw error

    const locationInfo: any = location ? location?.id : null;
    const entityInfo: any = entity?.id || null;
    let userPayload;

    // if (entity.hasOwnProperty('id') && userType == 'department') {
    if (roles.length === 0 && userType !== 'globalRoles') {
      roles.push('GENERAL-USER');
    }

    const url = process.env.BASE + realm + '/users';
    const createUserKcApi = process.env.KEYCLOAK_API + url;
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realm,
      },
    });
    const userCount: any = await this.licenseService.getRealmLicenseCount(
      organization?.id,
    );
    // console.log('usercount', userCount);
    if (userCount?.authorizedUsers > userCount?.addedUsers) {
      let key, trimmedPublicKey;
      let privateKeyRes: any = 'no private key found';
      if (organization.digitalSignature === true) {
        key = generateUserKeyPair();

        trimmedPublicKey = key?.publicKey
          ?.replace(/\n/g, '')
          .replace(/-----.*?-----/g, '');

        if (key?.privateKey) {
          privateKeyRes = await this.writePrivateKeyIntoVault(
            key.privateKey,
            organization?.id,
            username,
          );
        }
      }
      // console.log('provateKeyRes', privateKeyRes);

      // console.log('generated keys', key);

      // if (userCount?.authorizedUsers > userCount?.addedUsers) {
      if (userType === 'IDP') {
        userPayload = {
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email.trim(),
          enabled: true,
          attributes: {
            publicKey: [trimmedPublicKey], // ✅ must be an array
          },

          // requiredActions is required for the user to update password during first time login
        };
      } else if (userType === 'globalRoles') {
        // console.log('inside if');
        //check if this rolename already exists
        const checkUnique = await this.prisma.role.findFirst({
          where: {
            roleName: {
              equals: roleName,
              mode: 'insensitive', // Case-insensitive comparison
            },
          },
        });
        if (checkUnique) {
          //if exists then just pushed the roleName into roles array
          roles.push(roleName);
        } else {
          const createRoleKcApi =
            process.env.KEYCLOAK_API + '/auth/admin/realms/' + realm + '/roles';
          const keyCloakResult = await createRolesInKc(
            [roleName],
            token,
            createRoleKcApi,
          );
          // console.log('result', keyCloakResult);
          // try {

          roles.push(roleName);
          const getAllRolesKcApi =
            process.env.KEYCLOAK_API + process.env.BASE + realm + '/roles';
          const getRolesfromKc = await axiosKc(getAllRolesKcApi, 'GET', token);
          // console.log('roleName', getRolesfromKc);
          const createdRole = getRolesfromKc?.data?.find(
            (item) => item.name === roleName,
          );
          let data: any = {
            kcId: createdRole.id,
            roleName: createdRole.name,
            organization: {
              connect: {
                id: organization.id,
              },
            },
          };
          try {
            await this.prisma.role.create({ data });
          } catch (err) {
            res.status(400).send({
              status: err.message,
              message: 'Unable to create role in database',
            });
          }
        }
        userPayload = {
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email.trim(),
          enabled: true,
          requiredActions: ['UPDATE_PASSWORD'],
          attributes: {
            publicKey: [trimmedPublicKey],
          },

          // requiredActions is required for the user to update password during first time login
        };
      } else {
        userPayload = {
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email.trim(),
          enabled: true,
          attributes: {
            publicKey: [trimmedPublicKey],
          },
          requiredActions: ['UPDATE_PASSWORD'],
        };
      }
      // console.log('user payload', userPayload);
      //if userType is global roles add this new role to the keycloak and once it is created make sure to write it into the roles table of the realm

      const createUserResponse = await axiosKc(
        createUserKcApi,
        'POST',
        token,
        userPayload,
      );
      // console.log('createuserreponse', createUserResponse);

      if (createUserResponse.status === 201) {
        // console.log('inside user reponse', roles);
        //if user is created add private key to the oci vault

        const id = createUserResponse.headers.location.split('/users/');
        const userKcId = id[1];

        roles.forEach(async (role) => {
          const getRoleKcApi =
            process.env.KEYCLOAK_API +
            process.env.BASE +
            `${realm}/roles/${role}`;

          const getRoleResponse = await axiosKc(getRoleKcApi, 'GET', token);

          const baseRoleMapping =
            process.env.BASE +
            realm +
            '/users/' +
            userKcId +
            '/role-mappings/realm';

          const roleMappingApi = process.env.KEYCLOAK_API + baseRoleMapping;
          const clientRolePayload = [
            { id: getRoleResponse.data.id, name: role },
          ];

          try {
            await axiosKc(roleMappingApi, 'POST', token, clientRolePayload);
          } catch (error) {
            throw new BadRequestException(error.message);
          }
        });

        const getRealmManagementKcApi =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          realm +
          '/clients?clientId=realm-management';
        const realmManagementResponse = await axiosKc(
          getRealmManagementKcApi,
          'GET',
          token,
        );
        const clientId = realmManagementResponse.data[0].id;
        //(clientId)
        const getManageRealmKcApi =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          realm +
          '/clients/' +
          clientId +
          '/roles/realm-admin';
        //(getManageRealmKcApi)
        const manageRealmResponse = await axiosKc(
          getManageRealmKcApi,
          'GET',
          token,
        );
        const assign_role_api =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          realm +
          '/users/' +
          userKcId +
          '/role-mappings/clients/' +
          clientId;
        //(assign_role_api)
        const role_data = [
          {
            id: manageRealmResponse.data.id,
            name: manageRealmResponse.data.name,
          },
        ];

        await axiosKc(assign_role_api, 'POST', token, role_data);

        const rolesData = await this.prisma.role.findMany({
          where: {
            organizationId: organization.id,
            roleName: { in: roles },
          },
        });
        //  console.log('rolesData', rolesData);
        const roleInfo = rolesData.map((value) => value.id);
        const finalRoleData = rolesData.map((value) => value.id);
        let user;

        if (entity.hasOwnProperty('id')) {
          user = {
            kcId: userKcId,
            status: status,
            email: email,
            signature,
            userType: userType,
            username: username,
            firstname: firstName,
            lastname: lastName,
            roleId: finalRoleData,
            secretId: privateKeyRes,
            functionId,
            // role:{connect:{id:finalRoleData}},
            organization: {
              connect: { id: organization.id },
            },
            location: {
              connect: { id: locationInfo },
            },
            // business: {
            //   connect: { id: business },
            // },
            entity: {
              connect: { id: entityInfo },
            },
            // section: {
            //   connect: { id: section },
            // },
          };
        } else if (userType === 'globalRoles') {
          user = {
            kcId: userKcId,
            status: status,
            email: email,
            userType: userType,
            username: username,
            firstname: firstName,
            lastname: lastName,
            roleId: finalRoleData,
            secretId: privateKeyRes,
            functionId,
            signature,

            // role:{connect:{id:finalRoleData}},
            organization: {
              connect: { id: organization.id },
            },

            additionalUnits: additionalUnits,
          };
          const isValidEntity =
            typeof entity === 'string' &&
            entity.trim() !== '' &&
            entity !== 'All' &&
            !entity.startsWith('{');
          if (isValidEntity) {
            user.entity = {
              connect: { id: entity },
            };
          }
        } else {
          // console.log('inside else');
          user = {
            kcId: userKcId,
            status: status,
            email: email,
            userType: userType,
            username: username,
            firstname: firstName,
            lastname: lastName,
            roleId: finalRoleData,
            signature,
            secretId: privateKeyRes,
            functionId,
            // role:{connect:{id:finalRoleData}},
            organization: {
              connect: { id: organization.id },
            },
            location: {
              connect: { id: locationInfo },
            },
            // business: {
            //   connect: { id: business },
            // },
            // entity: {
            //   connect: { id: entityInfo },
            // },
            // section: {
            //   connect: { id: section },
            // },
          };
        }
        //console.log('user', user, roleName);
        let createdUser = await this.prisma.user.create({
          data: user,
          // include: { assignedRole: true },
        });

        roles.forEach(async (role) => {
          const roleData = await this.prisma.role.findFirst({
            where: {
              AND: [{ organizationId: organization.id }, { roleName: role }],
            },
          });
        });
        if (userType === 'globalRoles') {
          const roleNameToCheck = roleName;
          const organizationId = createdUser.organizationId;
          const userId = createdUser.id;

          // Check if the role already exists
          const existingRole = await this.globalRolesModel.findOne({
            roleName: roleNameToCheck,
            organizationId: organizationId,
          });

          if (existingRole) {
            // Role exists — append user ID if not already present
            if (!existingRole.assignedTo.includes(userId)) {
              await this.globalRolesModel.updateOne(
                { _id: existingRole._id },
                { $addToSet: { assignedTo: userId } }, // $addToSet avoids duplicates
              );
            }
          } else {
            // Role does not exist — create new role entry
            const globalRolesData: any = {
              roleName: roleNameToCheck,
              organizationId: organizationId,
              assignedTo: [userId],
            };

            await this.globalRolesModel.create(globalRolesData);
          }
        }
        const sendInviteKcApi =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          realm +
          '/users/' +
          createdUser.kcId +
          `/execute-actions-email?redirect_uri=${process.env.PROTOCOL}://${realm}.${process.env.REDIRECT}&client_id=admin-cli`;

        if (userType === 'IDP') {
          await axiosKc(sendInviteKcApi, 'PUT', token, []);

          //ADD IDP SETTINGS FOR THE IDP USER
          //Add a social login provider to the user

          const idpId = email.split('@')[1].split('.')[0];

          const loginProviderApi = `${process.env.KEYCLOAK_API}/auth/admin/realms/${realm}/users/${createdUser.kcId}/federated-identity/${idpId}`;

          const idpppp = await axiosKc(loginProviderApi, 'POST', token, {
            identityProvider: idpId,
            userId: email,
            userName: email,
          });
        } else {
          try {
            await axiosKc(sendInviteKcApi, 'PUT', token, ['UPDATE_PASSWORD']);
          } catch {}
        }
        //  update relam license once successfully added
        await this.licenseModel.findOneAndUpdate(
          { organizationId: organization.id },
          { $inc: { addedUsers: 1 } },
          { new: true },
        );
        res.status(200).send(createdUser);
      }

      // } catch (error) {
      //   // console.log('error', error);
      //   throw new ConflictException(error);
      // }
      // } else {
      //   throw new ConflictException('No Department Error');
      // }
    } else {
      // console.log('inside else');
      res.status(404).send('License exceeded');
    }
  }

  async getLdapUsers(realmName: string, ldapId: string) {
    //make a request to keycloak to get sync all users from ldap
    //once synchronised fetch all users
    //then filter users based on user federation provided id
    //send to frontend the filtred list of users
  }

  async checkIfUserActive(realm: string, user: any) {
    const userExistInDb = await this.prisma.user.findFirst({
      where: {
        kcId: user.sub,
      },
    });

    return true;
  }
  ///for doctype filter
  async getUsersFilter(realmName, email, user, locationId) {
    let users;
    const currentUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    if (locationId === 'allusers') {
      users = await this.prisma.user.findMany({
        where: {
          organization: {
            realmName: realmName,
          },
          email: {
            contains: email,
            mode: 'insensitive',
          },
          deleted: false,
        },
        include: {
          // assignedRole: true,
        },
      });

      const resolvedUsers = await getUserRoleDetails(
        users,
        this.prisma.role,
        // this.prisma.userRole,
      );

      return resolvedUsers;
    } else if (locationId === 'all') {
      users = await this.prisma.user.findMany({
        where: {
          organization: {
            realmName: realmName,
          },
          deleted: false,
          email: {
            contains: email,
            mode: 'insensitive',
          },
          location: {
            id: currentUser.locationId,
          },
        },
        include: {
          // assignedRole: true,
        },
      });

      const resolvedUsers = await getUserRoleDetails(
        users,
        this.prisma.role,
        // this.prisma.userRole,
      );

      return resolvedUsers;
    } else {
      users = await this.prisma.user.findMany({
        where: {
          organization: {
            realmName: realmName,
          },
          deleted: false,
          email: {
            contains: email,
            mode: 'insensitive',
          },
          location: {
            id: locationId,
          },
        },
        include: {
          // assignedRole: true,
        },
      });

      const resolvedUsers = await getUserRoleDetails(
        users,
        this.prisma.role,
        // this.prisma.userRole,
      );

      return resolvedUsers;
    }
  }

  async getAllUsers(
    realmName,
    location,
    entity,
    filterString: string,
    user,
    page?: number,
    limit?: number,
    searchItem?: any,
  ) {
    const skipValue = (page - 1) * Number(limit);
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    const orgAdminRoleId = await this.prisma.role.findFirst({
      where: {
        roleName: 'ORG-ADMIN',
        organizationId: activeUser.organizationId,
      },
      select: { id: true },
    });

    if (realmName === 'master') {
      const allLocations = await this.prisma.user.findMany({
        skip: skipValue,
        take: Number(limit),
        orderBy: [{ firstname: 'asc' }],
        where: {
          deleted: false,
        },
      });
      const noPageLocations = await this.prisma.user.findMany({});
      return { data: allLocations, length: noPageLocations.length };
    }
    //userName,byRole,locationName,status,departmentName,bussinessType

    // const filterResponse = filterUsers(userName, business, locationName, departmentName, byRole, status, realmName, skipValue, limit, this.prisma.user, this.prisma.userRole)
    // return filterResponse

    const filteredUsers = await findAllUsers(
      filterString,
      location,
      entity,
      page,
      limit,
      realmName,
      user,
      searchItem,
      this.prisma.user,
      this.prisma.role,
      this.prisma.location,
      this.prisma.entity,

      // this.prisma.userRole,
    );

    //chck permission for edit loca admin which users are editable
    if (user.kcRoles.roles.includes('MR')) {
      const usersWithPermissions = [];
      //pull the location admin from db
      const locationAdmin = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      const checkPermissionsForUserEdit = (locationAdmin, user) => {
        let access = false;
        if (user.roleId.includes(orgAdminRoleId.id)) {
          return access;
        } else {
          if (
            locationAdmin.locationId === user.location?.id ||
            activeUser.additionalUnits?.includes(user.locationId)
          ) {
            access = true;
            return access;
          } else {
            return access;
          }
        }
      };

      for (const user of filteredUsers.data) {
        const access = await checkPermissionsForUserEdit(locationAdmin, user);
        let additionalUnits;
        if (user.additionalUnits.includes('All')) {
          additionalUnits = [{ id: 'All', locationName: 'All' }];
        } else {
          additionalUnits = await this.prisma.location.findMany({
            where: {
              id: {
                in: user.additionalUnits,
              },
            },
          });
        }

        if (activeUser.id === user.id) {
          usersWithPermissions.push({
            ...user,
            access: false,
            isEdit: true,
            additionalUnits:
              user.userType === 'globalRoles'
                ? additionalUnits
                : user?.additionalUnits,
          });
        } else {
          usersWithPermissions.push({
            ...user,
            access: access,
            isEdit: access,
            additionalUnits:
              user.userType === 'globalRoles'
                ? additionalUnits
                : user?.additionalUnits,
          });
        }
      }

      return { data: usersWithPermissions, length: filteredUsers.length };
    } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      const usersWithPermissions = [];

      //pull the location admin from db
      // const locationAdmin = await this.prisma.user.findFirst({
      //   where: {
      //     kcId: user.id,
      //   },
      // });

      // const checkPermissionsForUserEdit = (locationAdmin, user) => {
      //   let access = false;

      //   if (locationAdmin.locationId === user.location?.id) {
      //     access = true;
      //     return access;
      //   } else {
      //     return access;
      //   }
      // };

      for (const user of filteredUsers.data) {
        // const access = await checkPermissionsForUserEdit(locationAdmin, user);
        let additionalUnits;
        if (user.additionalUnits.includes('All')) {
          additionalUnits = [{ id: 'All', locationName: 'All' }];
        } else {
          additionalUnits = await this.prisma.location.findMany({
            where: {
              id: {
                in: user.additionalUnits,
              },
            },
          });
        }

        if (activeUser.id === user.id) {
          usersWithPermissions.push({
            ...user,
            access: false,
            isEdit: true,
            additionalUnits:
              user.userType === 'globalRoles'
                ? additionalUnits
                : user?.additionalUnits,
          });
        } else {
          usersWithPermissions.push({
            ...user,
            access: true,
            isEdit: true,
            additionalUnits:
              user.userType === 'globalRoles'
                ? additionalUnits
                : user?.additionalUnits,
          });
        }
      }

      return { data: usersWithPermissions, length: filteredUsers.length };
    } else {
      // const checkPermissionsForUserEdit = (activeUser, user) => {
      //   let access = false;

      //   if ((user.organizationId = activeUser.organizationId)) {
      //     access = true;
      //     return access;
      //   } else {
      //     return access;
      //   }
      // };

      const usersWithPermissions = [];
      for (const filteredUser of filteredUsers.data) {
        let additionalUnits;
        if (filteredUser.additionalUnits.includes('All')) {
          additionalUnits = [{ id: 'All', locationName: 'All' }];
        } else {
          additionalUnits = await this.prisma.location.findMany({
            where: {
              id: {
                in: filteredUser.additionalUnits,
              },
            },
          });
        }

        // const access = await checkPermissionsForUserEdit(
        //   activeUser,
        //   filteredUser,
        // );
        if (activeUser.id === user.id) {
          usersWithPermissions.push({
            ...filteredUser,
            access: false,
            isEdit: true,
            additionalUnits:
              filteredUser.userType === 'globalRoles'
                ? additionalUnits
                : filteredUser?.additionalUnits,
          });
        } else {
          usersWithPermissions.push({
            ...filteredUser,
            access: false,
            isEdit: false,
            additionalUnits:
              filteredUser.userType === 'globalRoles'
                ? additionalUnits
                : filteredUser?.additionalUnits,
          });
        }
        // usersWithPermissions.push({ ...filteredUser, access: false });
      }

      return { data: usersWithPermissions, length: filteredUsers.length };
    }
  }

  async getUserById(id) {
    try {
      //console.log('id ', id);
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          // assignedRole: true,
          organization: true,
          entity: {
            select: {
              id: true,
              entityName: true,
            },
          },
          // business: {
          //   select: {
          //     id: true,
          //     name: true,
          //   },
          // },
          // section: {
          //   select: {
          //     id: true,
          //     name: true,
          //   },
          // },
          location: {
            select: {
              id: true,
              locationName: true,
            },
          },
        },
      });

      const resolvedUser = await getUserRoleDetails(
        [user],
        this.prisma.role,
        // this.prisma.userRole,
      );
      // console.log('resolved user', resolvedUser);
      return resolvedUser[0];
    } catch (err) {
      throw new NotFoundException('Error occured while fetching the user');
    }
  }

  /**
   * @method getUserInfo
   *  This method gets the user using the auth token from the req object
   * @param id kcId of the user
   * @returns returns the user
   */
  // async getUserInfo(kcId: string) {
  //   try {
  //     const user = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: kcId,
  //         deleted: false,
  //       },
  //       include: {
  //         entity: true,
  //         location: true,
  //         organization: true,
  //       },
  //     });

  //     return user;
  //   } catch (err) {
  //     throw new InternalServerErrorException();
  //   }
  // }
  async getUserInfo(kcId: any) {
    // try {
    // Fetch user information
    // console.log('kcId of logged', kcId);

    const user: any = await this.prisma.user.findFirst({
      where: {
        kcId: kcId.id,
        deleted: false,
      },
      include: {
        entity: true,
        location: true,
        organization: true,
      },
    });

    // If userType is 'globalRoles', fetch role information from role master table
    if (user?.userType === 'globalRoles') {
      if (user && user.roleId && Array.isArray(user.roleId)) {
        const roleInfo = await this.prisma.role.findMany({
          where: {
            id: { in: user.roleId },
          },
        });

        user.roleInfo = roleInfo;
      } else {
        user.roleInfo = [];
      }
      let additionalUnits;
      if (user.additionalUnits?.includes('All')) {
        additionalUnits = [{ id: 'All', locationName: 'All' }];
      } else {
        additionalUnits = await this.prisma.location.findMany({
          where: {
            id: {
              in: user.additionalUnits,
            },
          },
        });
      }
      user.additionalUnits = additionalUnits;
    }
    // console.log('user', user);
    return user;
    // } catch (err) {
    //   throw new InternalServerErrorException();
    // }
  }
  async getGlobalRoles(id: string) {
    // try {
    //get all created global roles from org
    const roles = await this.globalRolesModel.find({ organizationId: id });

    // get assignedTo users for this global roles one by one
    const results = await Promise.all(
      roles.map(async (role: any) => {
        const users = await this.prisma.user.findMany({
          where: {
            id: {
              in: role.assignedTo || [],
            },
          },
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        });

        return {
          roleName: role.roleName,
          users,
        };
      }),
    );

    return results;
    // }
    // catch (error) {
    //   console.error('Error fetching global roles:', error);
    //   throw error;
    // }
  }

  async getAllGlobalRoles(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const getAllGlobalRoles = await this.globalRolesModel
        .find({
          organizationId: activeUser.organizationId,
        })
        .select('roleName');
      return getAllGlobalRoles;
    } catch (error) {
      console.error('Error fetching global roles:', error);
      throw error;
    }
  }

  /**
   * @method uploadAvatar
   *  This method updates the profile picture of a user
   * @param file Image file
   * @param id User kcId
   * @returns updated user
   */
  async uploadAvatar(file: any, id: string) {
    // try {
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: id,
      },
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
      },
    });
    const realmName = await this.prisma.organization.findFirst({
      where: {
        user: {
          some: {
            id: user.id,
          },
        },
      },
    });
    // updating the user avatar in db
    const locationName = user?.location?.locationName;
    let path = '';
    if (process.env.IS_OBJECT_STORE === 'true') {
      path = await this.ociUtils.addDocumentToOS(file,user, locationName);
    } else {
      path = locationName
        ? `${realmName.realmName.toLowerCase()}/${locationName.toLowerCase()}/avatar/${
            file.filename
          }`
        : `${realmName.realmName.toLowerCase()}/avatar/${file.filename}`;
    }

    // console.log('path', path);
    // updating the user avatar in db
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: path,
      },
    });

    return updatedUser;
    // } catch (err) {
    //   throw new InternalServerErrorException();
    // }
  }

  async addDocumentToOS(file, locationName) {
    const fs = require('fs');
    const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
      where: {
        sourceName: process.env.CONNECTED_APPS_OB,
      },
    });

    //console.log('getObjectStoreContents', getObjectStoreContents);
    const tenancy = getObjectStoreContents.clientId;
    const userId = Buffer.from(getObjectStoreContents.user, 'base64').toString(
      'ascii',
    );
    const fingerprint = Buffer.from(
      getObjectStoreContents.password,
      'base64',
    ).toString('ascii');
    let privateKey =
      '-----BEGIN PRIVATE KEY-----\n' +
      Buffer.from(getObjectStoreContents.clientSecret, 'base64')
        .toString('ascii')
        .replace(/ /g, '\n') +
      '\n-----END PRIVATE KEY-----';
    const passphrase = null;
    const region = common.Region.fromRegionId(process.env.REGION);
    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancy,
      userId,
      fingerprint,
      privateKey,
      passphrase,
      region,
    );

    const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    const bucketName = process.env.BUCKET_NAME;
    const objectName =
      process.env.OB_ORG_NAME +
      locationName +
      '/' +
      uuid() +
      '-' +
      file.originalname;
    let contentType;
    if (['png', 'jpg', 'jpeg'].includes(file.originalname.split('.').pop())) {
      contentType = 'image/jpeg'; // assuming JPEG content type, you can adjust as needed
    }

    const fileContent = fs.readFileSync(file.path);
    client.putObject({
      namespaceName: process.env.NAMESPACE,
      bucketName: bucketName,
      objectName: objectName,
      putObjectBody: fileContent,
      contentType: contentType,
    });

    return objectName;
  }

  /**
   * @method getAuditorsOfOrg
   *  This method gets all the auditors of an Organization
   * @param realmName Realm name
   * @returns Array of  auditors
   */
  async getAuditorsOfOrg(realmName: string, user: any) {
    const currentUser = await this.getUserInfo(user.id);
    const locId = currentUser.locationId ?? undefined;
    const auditorId: any = await this.prisma.role.findFirst({
      where: {
        roleName: 'AUDITOR',
        organizationId: currentUser.organizationId,
      },
    });
    // else to go to find all users by the org
    const users = await this.prisma.user.findMany({
      where: {
        organizationId: currentUser.organizationId,
        roleId: { has: auditorId.id },
        locationId: locId,
        deleted: false,
        // assignedRole: {
        //   some: {
        //     role: {
        //       roleName: 'AUDITOR',
        //     },
        //   },
        // },
      },
    });
    // ////////////////console.log('users', users);
    // ////////////////console.log('users', users);
    return users;
  }

  /**
   * @method getAllUsersOfEntity
   *  This method gets All the users of a particular entity by its ID
   * @param entityId Entity ID
   * @returns Array of users
   */
  async getAllUsersOfEntity(entityId: string) {
    const activeUser: any = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
        deleted: false,
      },
    });

    const auditorId = await this.prisma.role.findFirst({
      where: { organizationId: activeUser.organizationId, roleName: 'AUDITOR' },
    });

    const additionAuditee: any =
      activeUser?.additionalAuditee?.map((item: any) => item?.id) ?? [];

    return await this.prisma.user.findMany({
      where: {
        OR: [
          {
            AND: [
              { entityId },
              { deleted: false },
              {
                NOT: {
                  roleId: { has: auditorId.id },
                },
              },
            ],
          },
          {
            id: { in: additionAuditee },
          },
        ],
      },
    });
  }

  async getAllTemplateAuthors(realmName: string) {
    const org = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    // if no org is found , its a case for super admin
    if (!org) {
      return [];
    }
    const orgAdminId: any = await this.prisma.role.findFirst({
      where: {
        roleName: 'ORG-ADMIN',
        organizationId: org.id,
      },
    });

    const mrId: any = await this.prisma.role.findFirst({
      where: {
        roleName: 'MR',
        organizationId: org.id,
      },
    });
    const users = await this.prisma.user.findMany({
      where: {
        organizationId: org.id,
        deleted: false,
        OR: [
          {
            roleId: { has: orgAdminId.id },
            // assignedRole: {
            //   some: {
            //     role: {
            //       roleName: 'ORG-ADMIN',
            //     },
            //   },
            // },
          },
          {
            // assignedRole: {
            //   some: {
            //     role: {
            //       roleName: 'LOCATION-ADMIN',
            //     },
            //   },
            // },
          },
          {
            roleId: { has: mrId.id },
            // assignedRole: {
            //   some: {
            //     role: {
            //       roleName: 'MR',
            //     },
            //   },
            // },
          },
        ],
      },
    });

    return users;
  }

  async getAllMrOfOrg(orgId: string) {
    const mrId: any = await this.prisma.role.findFirst({
      where: {
        roleName: 'MR',
        organizationId: orgId,
      },
    });
    return await this.prisma.user.findMany({
      where: {
        organizationId: orgId,
        roleId: { has: mrId.id },
        deleted: false,
        // assignedRole: {
        //   some: {
        //     role: {
        //       roleName: 'MR',
        //     },
        //   },
        // },
      },
    });
  }

  async getUserInfoByName(name, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user,
      },
    });

    try {
      const result = await this.prisma.user.findFirst({
        where: { id: name, deleted: false },
        include: {
          // assignedRole: true,
        },
      });
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  async searchUser(organizationId, querystring, user) {
    const query = querystring.query;
    const limit = Number(querystring?.limit) || 10;
    const page = Number(querystring?.page) || 1;
    const skip = Number((page - 1) * limit);

    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    const locationId = await this.prisma.location.findFirst({
      where: {
        locationName: {
          contains: query,
          mode: 'insensitive',
        },
        organizationId,
        deleted: false,
      },
    });
    const entityId = await this.prisma.entity.findFirst({
      where: {
        entityName: { contains: query, mode: 'insensitive' },
        organizationId,
        deleted: false,
      },
    });
    const roleId: any = await this.prisma.role.findFirst({
      where: {
        roleName: { contains: query, mode: 'insensitive' },
        organizationId,
      },
    });

    ////////console.log('connect', con);
    const users = await this.prisma.user.findMany({
      where: {
        organizationId: organizationId,
        deleted: false,
        OR: [
          // { id: { contains: query, mode: 'insensitive' } },
          { roleId: { has: roleId?.id } },
          { username: { contains: query, mode: 'insensitive' } },
          { firstname: { contains: query, mode: 'insensitive' } },
          { lastname: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { locationId: { contains: locationId?.id, mode: 'insensitive' } },
          { entityId: { contains: entityId?.id, mode: 'insensitive' } },
          // { assignedRole: { some: { roleId: roleId?.id } } },
        ],
      },
      include: {
        // assignedRole: true,
        entity: {
          select: {
            id: true,
            entityName: true,
          },
        },

        location: {
          select: {
            id: true,
            locationName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    let userdetails = [];
    if (user.kcRoles.roles.includes('MR')) {
      const usersWithPermissions = [];
      //pull the location admin from db
      const locationAdmin = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const checkPermissionsForUserEdit = (locationAdmin, user) => {
        let access = false;

        if (locationAdmin.locationId === user.location?.id) {
          access = true;
          return access;
        } else {
          return access;
        }
      };

      for (const user of users) {
        // const roleName = await this.prisma.userRole.findMany({
        //   where: { userId: user.id },
        //   include: {
        //    role:true
        //   },
        // });
        // const assignedRole=roleName.map((value)=>{
        //   return{
        //     id:value.id,
        //     userId:value.userId,
        //     roleId:value.roleId,
        //     role:value.role.roleName
        //   }
        // })
        const access = await checkPermissionsForUserEdit(locationAdmin, user);
        if (activeUser.id === user.id) {
          usersWithPermissions.push({
            ...user,
            access: false,
            isEdit: true,
            // assignedRole,
          });
        } else {
          usersWithPermissions.push({
            ...user,
            access: access,
            isEdit: access,
            // assignedRole
          });
        }
      }

      return { data: usersWithPermissions, length: users.length };
    } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      const usersWithPermissions = [];
      //pull the location admin from db
      ////console.log('orgAdmin else');
      // const locationAdmin = await this.prisma.user.findFirst({
      //   where: {
      //     kcId: user.id,
      //   },
      // });

      // const checkPermissionsForUserEdit = (locationAdmin, user) => {
      //   let access = false;

      //   if (locationAdmin.locationId === user.location?.id) {
      //     access = true;
      //     return access;
      //   } else {
      //     return access;
      //   }
      // };

      for (const user of users) {
        // const access = await checkPermissionsForUserEdit(locationAdmin, user);
        // const roleName = await this.prisma.userRole.findMany({
        //   where: { userId: user.id },
        //   include: {
        //    role:true
        //   },
        // });
        // const assignedRole=roleName.map((value)=>{
        //   return{
        //     id:value.id,
        //     userId:value.userId,
        //     roleId:value.roleId,
        //     role:value.role.roleName
        //   }
        // })
        if (activeUser.id === user.id) {
          usersWithPermissions.push({
            ...user,
            access: false,
            isEdit: true,
            // assignedRole
          });
        } else {
          usersWithPermissions.push({
            ...user,
            access: true,
            isEdit: true,
            // assignedRole
          });
        }
      }

      return { data: usersWithPermissions, length: users.length };
    } else {
      // const checkPermissionsForUserEdit = (activeUser, user) => {
      //   let access = false;

      //   if ((user.organizationId = activeUser.organizationId)) {
      //     access = true;
      //     return access;
      //   } else {
      //     return access;
      //   }
      // };

      const usersWithPermissions = [];
      for (const filteredUser of users) {
        // const roleName = await this.prisma.userRole.findMany({
        //   where: { userId: user.id },
        //   include: {
        //    role:true
        //   },
        // });
        // const assignedRole=roleName.map((value)=>{
        //   return{
        //     id:value.id,
        //     userId:value.userId,
        //     roleId:value.roleId,
        //     role:value.role.roleName
        //   }
        // })
        // const access = await checkPermissionsForUserEdit(
        //   activeUser,
        //   filteredUser,
        // );
        if (activeUser.id === user.id) {
          usersWithPermissions.push({
            ...filteredUser,
            access: false,
            isEdit: true,
            // assignedRole
          });
        } else {
          usersWithPermissions.push({
            ...filteredUser,
            access: false,
            isEdit: false,
            // assignedRole
          });
        }
        // usersWithPermissions.push({ ...filteredUser, access: false });
      }

      return { data: usersWithPermissions, length: users.length };
    }
  }

  async importUser(req: string, res, file, orgName) {
    try {
      const fs = require('fs');
      const XLSX = require('xlsx');

      const fileContent = fs.readFileSync(file.path);
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let invalidUsers = [
        [
          'Username',
          'First Name',
          'Last Name',
          'Email',
          'Location Id',
          'Entity Id',
          'Reason',
        ],
      ];
      const userFormat = [
        'UserName',
        'FirstName',
        'LastName',
        'Email',
        'LocationName',
        'DepartmentName',
      ];
      let reason = '';

      let firstIteration = true;
      mainLoop: for (const rowData of excelData) {
        if (firstIteration) {
          if (!rowData.every((value, index) => value === userFormat[index])) {
            return res.status(200).json({ wrongFormat: true });
          }
          firstIteration = false;
          continue;
        }

        for (let i = 0; i < 6; i++) {
          if (!rowData[i]) {
            rowData[6] = 'SOME OF THE DATAS ARE MISSING';
            invalidUsers.push(rowData);
            continue mainLoop;
          }
        }

        const username = rowData[0]?.trim();
        const firstName = rowData[1]?.trim();
        const lastName = rowData[2]?.trim();
        const email = rowData[3]?.trim();
        if (!(await this.isValidEmail(email))) {
          rowData.push('Email format is not correct');
          invalidUsers.push(rowData);
          continue;
        }
        const roles = ['GENERAL-USER'];

        const locationName = rowData[4]?.trim();
        const location = await this.getLocationId(locationName);
        if (location === null) {
          rowData.push('Location Not Found');
          invalidUsers.push(rowData);
          continue;
        }

        const entityName = rowData[5]?.trim();
        const entity = await this.getEntityId(entityName, location);
        if (entity === null) {
          rowData.push('Department Not Found');
          invalidUsers.push(rowData);
          continue;
        }

        const realm = orgName;
        const status = true;
        const userType = 'Local';
        const userPayload: any = {
          username,
          firstName,
          lastName,
          email,
          roles,
          entity,
          location,
          realm,
          status,
          userType,
        };
        let uniqueEmail = await this.getUserByEmail(email.trim());
        let uniqueUsername = await this.getUserByUsername(username);
        if (uniqueEmail && uniqueUsername) {
          await this.createUserFromImport(userPayload, req, res);
        } else {
          if (!uniqueEmail && !uniqueUsername)
            reason = 'Email and Username Is Duplicate';
          else {
            if (!uniqueEmail) reason = 'Email Is Duplicate';
            if (!uniqueUsername) reason = 'Username Is Duplicate';
          }
          rowData.push(reason);
          invalidUsers.push(rowData);
        }
      }
      if (invalidUsers.length > 1) {
        return res.status(200).json({ success: true, invalidUsers });
      }
      return res.sendStatus(200);
    } catch (err) {
      return res.status(500);
    }
  }

  async isValidEmail(email) {
    try {
      const pattern = /^[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return pattern.test(email);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: {
            contains: email,
            mode: 'insensitive',
          },
        },
      });
      if (user !== null) return false;
      if (user === null) return true;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getUserByUsername(username) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          username: {
            contains: username,
            mode: 'insensitive',
          },
        },
      });
      if (user !== null) return false;
      if (user === null) return true;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getLocationId(locationName) {
    try {
      const locationId = await this.prisma.location.findFirst({
        where: {
          locationName: {
            contains: locationName,
            mode: 'insensitive',
          },
        },
      });
      if (locationId !== null) return locationId.id;
      else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getEntityId(entityName, locationId) {
    try {
      const location = await this.prisma.entity.findFirst({
        where: {
          AND: [
            {
              locationId: {
                contains: locationId,
                mode: 'insensitive',
              },
            },
            {
              entityName: {
                contains: entityName,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
      if (location !== null) return location.id;
      else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async createUserFromImport(payload: UserMaster, token: string, res: any) {
    const {
      realm,
      userType,
      status,
      username,
      firstName,
      lastName,
      email,
      location,
      entity,
      roles,
      kcId,
    } = payload;
    const locationInfo: any = location;
    const entityInfo: any = entity;
    let userPayload;

    const url = process.env.BASE + realm + '/users';
    const createUserKcApi = process.env.KEYCLOAK_API + url;

    userPayload = {
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: email,
      enabled: true,
      requiredActions: ['UPDATE_PASSWORD'],
    };

    const createUserResponse = await axiosKc(
      createUserKcApi,
      'POST',
      token,
      userPayload,
    );

    if (createUserResponse.status === 201) {
      const id = createUserResponse.headers.location.split('/users/');
      const userKcId = id[1];

      roles.forEach(async (role) => {
        const getRoleKcApi =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          `${realm}/roles/${role}`;

        const getRoleResponse = await axiosKc(getRoleKcApi, 'GET', token);

        const baseRoleMapping =
          process.env.BASE +
          realm +
          '/users/' +
          userKcId +
          '/role-mappings/realm';

        const roleMappingApi = process.env.KEYCLOAK_API + baseRoleMapping;
        const clientRolePayload = [{ id: getRoleResponse.data.id, name: role }];

        try {
          await axiosKc(roleMappingApi, 'POST', token, clientRolePayload);
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      });

      const getRealmManagementKcApi =
        process.env.KEYCLOAK_API +
        process.env.BASE +
        realm +
        '/clients?clientId=realm-management';
      const realmManagementResponse = await axiosKc(
        getRealmManagementKcApi,
        'GET',
        token,
      );
      const clientId = realmManagementResponse.data[0].id;
      //(clientId)
      const getManageRealmKcApi =
        process.env.KEYCLOAK_API +
        process.env.BASE +
        realm +
        '/clients/' +
        clientId +
        '/roles/realm-admin';
      //(getManageRealmKcApi)
      const manageRealmResponse = await axiosKc(
        getManageRealmKcApi,
        'GET',
        token,
      );
      const assign_role_api =
        process.env.KEYCLOAK_API +
        process.env.BASE +
        realm +
        '/users/' +
        userKcId +
        '/role-mappings/clients/' +
        clientId;
      //(assign_role_api)
      const role_data = [
        {
          id: manageRealmResponse.data.id,
          name: manageRealmResponse.data.name,
        },
      ];

      await axiosKc(assign_role_api, 'POST', token, role_data);
      const organization = await this.prisma.organization.findFirst({
        where: {
          realmName: realm,
        },
      });
      const rolesData = await this.prisma.role.findMany({
        where: {
          organizationId: organization.id,
          roleName: { in: roles },
        },
      });
      const roleInfo = rolesData.map((value) => value.id);
      const finalRoleData = rolesData.map((value) => value.id);
      const user = {
        kcId: userKcId,
        status: status,
        email: email,
        userType: userType,
        username: username,
        firstname: firstName,
        lastname: lastName,
        roleId: finalRoleData,
        organization: {
          connect: { id: organization.id },
        },
        location: {
          connect: { id: locationInfo },
        },
        entity: {
          connect: { id: entityInfo },
        },
      };
      ////console.log("USER UUSER ",user)
      let createdUser = await this.prisma.user.create({
        data: user,
      });
      roles.forEach(async (role) => {
        const roleData = await this.prisma.role.findFirst({
          where: {
            AND: [{ organizationId: organization.id }, { roleName: role }],
          },
        });
      });
      const sendInviteKcApi =
        process.env.KEYCLOAK_API +
        process.env.BASE +
        realm +
        '/users/' +
        createdUser.kcId +
        `/execute-actions-email?redirect_uri=${process.env.PROTOCOL}://${realm}.${process.env.REDIRECT}&client_id=admin-cli`;

      try {
        await axiosKc(sendInviteKcApi, 'PUT', token, ['UPDATE_PASSWORD']);
      } catch {}
    }
  }
  async getUserByIdWithEntity(id) {
    try {
      //console.log('id ', id);
      const userDetails = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!userDetails) {
        throw new NotFoundException('User not found');
      }

      // Check if the user's userType is 'globalRoles'
      const includeData: any = {};

      if (userDetails.userType !== 'globalRoles') {
        // If user is NOT of globalRoles, include entity and location
        includeData.entity = {
          select: {
            id: true,
            entityName: true,
          },
        };
        includeData.location = {
          select: {
            id: true,
            locationName: true,
          },
        };
      }

      // Fetch the user again with the conditional include object
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: includeData,
      });
      // console.log('user', user);
      let entities = [];
      if (userDetails?.userType !== 'globalRoles') {
        entities = await this.prisma.entity.findMany({
          where: {
            organizationId: user.organizationId,
            deleted: false,
            users: { has: user.id },
          },
        });
      } else {
        if (userDetails?.additionalUnits?.includes('All')) {
          entities = await this.prisma.entity.findMany({
            where: {
              organizationId: user.organizationId,
              deleted: false,
            },
          });
        } else {
          entities = await this.prisma.entity.findMany({
            where: {
              organizationId: user.organizationId,
              deleted: false,
              locationId: { in: userDetails?.additionalUnits },
            },
          });
        }
      }
      let otherLocations;
      if (user.additionalUnits?.length > 0) {
        otherLocations = await this.prisma.location.findMany({
          where: {
            organizationId: user.organizationId,
            deleted: false,
            id: {
              in: user.additionalUnits,
            },
          },
        });
      }
      // console.log('otherlocations', otherLocations);
      let data = {};
      // if (entities.length > 0) {
      data = {
        location: user?.location,
        entity: user?.entity,
        otherEntities: entities,
        otherLocations: otherLocations,
      };
      // }
      const resolvedUser = await getUserRoleDetails(
        [user],
        this.prisma.role,
        // this.prisma.userRole,
      );
      // console.log('resolved user', resolvedUser[0]);
      return {
        user: resolvedUser[0],
        otherEntities: entities,
        otherLocations: otherLocations,
      };
    } catch (err) {
      throw new NotFoundException('Error occured while fetching the user');
    }
  }

  async getEntityByLocation(user, data) {
    // try {
    const { location } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });

    if (
      location !== undefined &&
      location?.length > 0 &&
      location !== 'undefined'
    ) {
      let entityData = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          locationId: { in: location },
        },
        select: { id: true, entityName: true },
      });

      entityData.sort((a, b) => {
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
      return entityData;
    } else {
      return [];
    }

    // } catch (err) {}
  }

  async locationData(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const locationData = await this.prisma.location.findMany({
        where: { organizationId: activeUser.organizationId },
      });
      return locationData;
    } catch (err) {}
  }

  async getUserByRoleInfoById(id, user, query) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let result = [];
      const client = new MongoClient(process.env.MONGO_DB_URI1);
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      // const documentData = await this.prisma.additionalDocumentAdmins.findMany({
      //   where: {
      //     userId: id,
      //     document: {
      //       documentState: {
      //         notIn: [
      //           'PUBLISHED',
      //           'OBSOLETE',
      //           'RETIRE_INREVIEW',
      //           'RETIRE_INAPPROVE',
      //           'RETIRE',
      //         ],
      //       },
      //     },
      //   },
      // });

      const documentData = await this.prisma.documents.findMany({
        where: {
          documentState: {
            notIn: [
              'PUBLISHED',
              'OBSOLETE',
              'RETIRE_INREVIEW',
              'RETIRE_INAPPROVE',
              'RETIRE',
            ],
          },
          AdditionalDocumentAdmins: {
            some: { type: { in: ['REVIEWER', 'APPROVER'] }, userId: id },
          },
        },
        include: { AdditionalDocumentAdmins: true },
      });

      const findingsData = await db
        .collection('nonconformances')
        .aggregate([
          {
            $match: {
              $or: [{ auditees: id }, { auditors: id }],
              status: 'OPEN',
            },
          },
          {
            $lookup: {
              from: 'audits',
              localField: 'audit',
              foreignField: '_id',
              as: 'auditDetails',
            },
          },
          {
            $unwind: {
              path: '$auditDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .toArray();

      const hiraData = await db
        .collection('hiras')
        .find({
          $or: [
            { 'workflow.reviewers': id },
            { 'workflow.approvers': id },
            { status: { in: ['IN_REVIEW', 'IN_APPROVAL'] } },
          ],
        })
        ?.toArray();
      const actionItemData = await db
        .collection('actionitems')
        .find({
          'owner.id': id,
          deleted: false,
          status: true,
        })
        ?.toArray();

      const cipData = await db
        .collection('cips')
        .find({
          $or: [
            { 'reviewers.id': id },
            { 'approvers.id': id },
            {
              status: {
                in: [
                  'InReview',
                  'InApproval',
                  'Approved',
                  'InProgress',
                  'Complete',
                  'InVerification',
                ],
              },
            },
          ],
        })
        ?.toArray();
      // console.log('cipdata', cipData);
      cipData
        .map((item: any) => {
          result.push({
            type: 'CIP',
            name: item?.title,
            // number: item?.prefixSuffix,
            roles: [
              item?.reviewers?.some((reviewer) => reviewer.id === id)
                ? 'REVIEWER'
                : '',
              item?.approvers?.some((approver) => approver.id === id)
                ? 'APPROVER'
                : '',
            ].filter(Boolean),
            id: item?._id,
            status: item?.status,
            creatorName: item?.createdBy.name,
            createdAt: item?.createdAt,
          });
        })
        .filter(Boolean);

      const documentCreatorData = await this.prisma.user.findMany({
        where: { id: { in: documentData?.map((item) => item?.createdBy) } },
      });
      documentData?.map((item: any) => {
        const documentCreator = documentCreatorData?.find(
          (docu) => docu.id === item?.createdBy,
        );

        result.push({
          type: 'Document',
          name: item?.documentName,
          number: item?.documentNumbering,
          roles:
            item.reviewers?.includes(id) && item?.approvers?.includes(id)
              ? ['REVIEWER', 'APPROVER']
              : item.reviewers?.includes(id)
              ? ['REVIEWER']
              : item?.approvers?.includes(id)
              ? ['APPROVER']
              : '',
          id: item?.id,
          status: item?.documentState,
          creatorName: documentCreator?.email,
          createdAt: item?.createdAt,
        });
      });

      findingsData?.map((item) => {
        let roles = [];
        if (item?.auditees?.includes(id)) {
          roles.push('Auditee');
        }

        if (item?.auditors?.includes(id)) {
          roles.push('Auditor');
        }
        result.push({
          type: 'Audit',
          name: item?.type,
          number: `${item?.id}`,
          roles: [...new Set(roles)],
          id: item?._id,
          status: item?.status,
          creatorName: '',
          createdAt: item?.createdAt,
        });
      });
      actionItemData?.map((item) => {
        result.push({
          type: 'Action Item' + '-' + item.source,
          name: item?.title,
          number: item?.prefixSuffix,
          roles: ['Owner'],
          id: item?._id,
          status: item?.status === true ? 'Open' : 'Close',
          creatorName: '',
          createdAt: item?.createdAt,
        });
      });
      // let rolesData=hiraData?.workflow?.map((value)=>{})

      hiraData?.map((item) => {
        const roleData = item?.workflow?.map((value) => {
          if (value?.reviewers.includes(id)) {
            return 'REVIEWER';
          } else if (value?.approvers.includes(id)) {
            return 'APPROVER';
          }
        });
        result.push({
          type: 'HIRA',
          name: item?.jobTitle,
          number: item?.prefixSuffix,
          roles: [...new Set(roleData)],
          id: item?._id,
          status: item?.status,
          creatorName: '',
          createdAt: item?.createdAt,
        });
      });
   

      if (
        query.search &&
        query.search !== '' &&
        query.search !== null &&
        query.search !== undefined
      ) {
        result = result.filter((item) => {
          return (
            item.name &&
            item.name.toLowerCase().includes(query.search.toLowerCase())
          );
        });
      }
      this.logger.log(
        `GET api/user/getUserByRoleInfoById service successful for ${query}`,
        '',
      );
      return result;
    } catch (err) {
      this.logger.error(
        `GET api/user/getUserByRoleInfoById service failed for ${query}`,
        '',
      );
    }
  }

  async updateRoleforOtherUser(datas, user) {
    try {
      const { id, userId, data } = datas;
      // console.log('Datas', data);
      const client = new MongoClient(process.env.MONGO_DB_URI1);
      await client.connect();
      const db = client.db(process.env.MONGO_DB_NAME);
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const userData = await this.prisma.user.findFirst({
        where: { id: userId.id },
      });

      for (let i of data) {
        //audit findings
        if (i.type === 'Audit') {
          const findData = await db
            .collection('nonconformances')
            .findOne({ _id: new ObjectId(i.id) });
          let auditees = findData?.auditees.includes(id?.id)
            ? [
                ...new Set([
                  ...findData?.auditees.filter((item) => item !== id.id),
                  userId.id,
                ]),
              ]
            : findData?.auditees;
          let auditors = findData?.auditors.includes(id?.id)
            ? [
                ...new Set([
                  ...findData?.auditors.filter((item) => item !== id.id),
                  userId.id,
                ]),
              ]
            : findData?.auditors;

          // console.log('user', userId.id, auditees, auditors);
          const findingsData = await db.collection('nonconformances').updateOne(
            { _id: new ObjectId(i.id) }, // Match the document
            {
              $set: {
                auditees,
                auditors,
              },
            },
          );
        }
        //for document
        else if (i.type === 'Document') {
          // console.log('inside doc', i);
          if (i.roles.includes('REVIEWER') && i.status === 'IN_REVIEW') {
            // console.log('inside in review', i, id.id);
            const res = await db
              .collection('AdditionalDocumentAdmins')
              .updateMany(
                {
                  documentId: i.id,
                  type: 'REVIEWER',
                  userId: id.id,
                },
                {
                  $set: {
                    firstname: userData?.firstname,
                    lastname: userData?.lastname,
                    email: userData?.email,
                    userId: userData?.id,
                  },
                },
              );
            const doc = await db.collection('Documents').updateOne(
              {
                _id: i.id, // Assuming `id` is the unique identifier of the document
                reviewers: { $in: [id.id] }, // Ensure the oldUserId exists in the reviewers array
              },
              {
                $set: {
                  reviewers: {
                    $map: {
                      input: '$reviewers',
                      as: 'reviewer',
                      in: {
                        $cond: {
                          if: { $eq: ['$$reviewer', id.id] }, // Check if the reviewer matches the old userId
                          then: userData?.id, // Replace with new userId
                          else: '$$reviewer', // Otherwise, keep the current reviewer
                        },
                      },
                    },
                  },
                },
              },
            );
          } else if (i.roles.includes('APPROVER')) {
            await db.collection('AdditionalDocumentAdmins').updateMany(
              {
                documentId: i.id,
                type: 'APPROVER',
                userId: id.id,
              },
              {
                $set: {
                  firstname: userData?.firstname,
                  lastname: userData?.lastname,
                  email: userData?.email,
                  userId: userData?.id,
                },
              },
            );
            const doc = await db.collection('Documents').updateOne(
              {
                _id: id, // Assuming `id` is the unique identifier of the document
                approvers: { $in: [id.id] }, // Ensure the oldUserId exists in the approvers array
              },
              {
                $set: {
                  approvers: {
                    $map: {
                      input: '$approvers',
                      as: 'approver',
                      in: {
                        $cond: {
                          if: { $eq: ['$$approver', id.id] }, // Check if the reviewer matches the old userId
                          then: userData?.id, // Replace with new userId
                          else: '$$approver', // Otherwise, keep the current reviewer
                        },
                      },
                    },
                  },
                },
              },
            );
          }
        } else if (i.type === 'CIP') {
          // console.log('inside cip', i);

          // Check if the roles array includes 'APPROVER'
          if (i.roles?.includes('APPROVER')) {
            const res = await db.collection('cips').updateOne(
              {
                _id: new ObjectId(i.id),
                'approvers.approverId': id?.id,
              },
              {
                $set: {
                  'approvers.$.approverName': userId?.username,
                  'approvers.$.avatar': userId?.avatar,
                  'approvers.$.email': userId?.email,
                  'approvers.$.id': userId?.id,
                  'approvers.$.approverId': userId?.id,
                },
              },
            );
            // console.log('res', res);
          } else if (i.roles?.includes('REVIEWER')) {
            // Perform the update on the 'cips' collection
            const res = await db.collection('cips').updateOne(
              {
                _id: new ObjectId(i.id),
                'approvers.reviewerId': id?.id,
              },
              {
                $set: {
                  'reviewers.$.reviewerName': userId?.username,
                  'reviewers.$.avatar': userId?.avatar,
                  'reviewers.$.email': userId?.email,
                  'reviewers.$.id': userId?.id,
                  'reviewers.$.reviewerId': userId?.id,
                },
              },
            );
          }
        } else if (i.type === 'HIRA') {
          // console.log('inside hira', userId, id.id);
          const updateHira = async (role) => {
            const fieldName = role === 'APPROVER' ? 'approvers' : 'reviewers';
            const updateQuery = {
              _id: new ObjectId(i.id),
              // [`workflow.${i.cycleNumber - 1}.${fieldName}`]: id?.id,
              status: 'active',
            };

            const updateResult = await db.collection('hiras').updateOne(
              updateQuery,
              {
                $set: {
                  // Update the approver ID within the correct workflow object
                  'workflow.$[workflowApprover].approvers.$[approver]':
                    userId.id,
                  // Update the reviewer ID within the correct workflow object
                  'workflow.$[workflowReviewer].reviewers.$[reviewer]':
                    userId.id,
                },
              },
              {
                arrayFilters: [
                  // Find the workflow object that contains the approver to update
                  { 'workflowApprover.approvers': id?.id },
                  // Find the workflow object that contains the reviewer to update
                  { 'workflowReviewer.reviewers': id?.id },
                  // Specific filter for the approver ID in the approvers array
                  { approver: id?.id },
                  // Specific filter for the reviewer ID in the reviewers array
                  { reviewer: id?.id },
                ],
              },
            );

            // console.log('Update Result:', updateResult);
            // console.log(`HIRA ${role} Updated:`, updateHira);
          };

          // Update APPROVER role
          if (i.roles?.includes('APPROVER')) {
            // console.log('inside approver', id.id);
            await updateHira('APPROVER');
          }
          if (i.roles?.includes('REVIEWER')) {
            await updateHira('REVIEWER');
          }
        } else if (i.type.toLowerCase().includes('action item'.toLowerCase())) {
          // console.log('inside action item', i);
          const res = await db.collection('actionitems').updateOne(
            {
              _id: new ObjectId(i.id),
              'owner.id': id?.id,
            },
            {
              $set: {
                'owner.$.username': userId?.username,
                'owner.$.avatar': userId?.avatar,
                'owner.$.email': userId?.email,
                'owner.$.label': userId?.email,
                'owner.$.id': userId?.id,
                'owner.$.value': userId?.id,
                'owner.$.fullname': userId?.firstname + '' + userId?.lastname,
              },
            },
          );
        }
      }

      // return documentData;
    } catch (err) {}
  }

  async getAllUsersByLocation(loc, id) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: id },
    });
    const userData = await this.prisma.user.findMany({
      where: { locationId: loc, organizationId: activeUser.organizationId },
      select: {
        id: true,
        email: true,
        lastname: true,
        firstname: true,
        username: true,
      },
    });
    return userData;
  }

  async getUserRoleById(id, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const userData = await this.prisma.user.findFirst({
        where: { id: id, organizationId: activeUser.organizationId },
      });
      let roleData = await this.prisma.role.findMany({
        where: {
          id: { in: userData?.roleId },
          organizationId: activeUser.organizationId,
        },
        select: { roleName: true },
      });
      const finalData = roleData?.map((value) => value?.roleName);
      return finalData;
    } catch (err) {}
  }
  //apis for transferring the user from one unit to another
  async transferUsers(dataArray, req, res) {
    // console.log('dataArray', req);
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: req.user.id,
        },
      });
      // console.log('activeuser', activeuser);
      if (
        !Array.isArray(dataArray.selectedUsers) ||
        dataArray.selectedUsers?.length === 0
      ) {
        throw new NotFoundException();
      }
      //for each object destructure and store it an array

      const transformedData = dataArray.selectedUsers?.map((item) => {
        const {
          username,
          userId,
          fromUnit,
          toUnit,
          status,
          transferredBy,
          initiatedOn,
          completedOn,
          organizationId,
        } = item;

        return {
          username,
          userId,
          fromUnit,
          toUnit,
          status,
          transferredBy,
          initiatedOn,
          completedOn,
          organizationId,
        };
      });
      //insert many for the mapped array

      // console.log('createusers', createUsers);
      const orgData = await this.prisma.organization.findFirst({
        where: {
          id: activeuser.organizationId,
        },
      });

      const genUserRoleId = await this.prisma.role.findFirst({
        where: {
          roleName: 'GENERAL-USER', // Ensure roleName is the correct field
          organizationId: activeuser.organizationId, // Ensure activeuser.organizationId exists
        },
      });

      // console.log('general user id', genUserRoleId);
      const token = req.user?.kcToken;
      const createUsers = await this.transferredUser.insertMany(
        transformedData,
      );

      for (let user of createUsers) {
        //update user master for each user, change their location from old to new Unit and set dept to empty, also remeove all roles
        const userId = await this.prisma.user.findFirst({
          where: {
            id: user.userId,
          },
        });
        // console.log('user inside', user);

        const baseRoleMapping =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          orgData.realmName +
          '/users/' +
          userId.kcId +
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
        const role = 'GENERAL-USER';
        const getRoleKcApi =
          process.env.KEYCLOAK_API +
          process.env.BASE +
          `${orgData.realmName}/roles/${role}`;
        // console.log('getRoleKcApi', getRoleKcApi);

        const getRoleResponse = await axiosKc(getRoleKcApi, 'GET', token);
        //(getRoleResponse)

        const baseRoleMapping1 =
          process.env.BASE +
          `${orgData.realmName}` +
          '/users/' +
          userId.kcId +
          '/role-mappings/realm';

        const roleMappingApi = process.env.KEYCLOAK_API + baseRoleMapping1;
        const clientRolePayload = [{ id: getRoleResponse.data.id, name: role }];
        //(clientRolePayload)
        //////////console.log('clientRolePayload', clientRolePayload);
        try {
          await axiosKc(roleMappingApi, 'POST', token, clientRolePayload);
        } catch (error) {
          throw new BadRequestException(error.message);
        }
        const result = await this.prisma.user.update({
          where: {
            id: user.userId,
          },
          data: {
            locationId: user.toUnit,
            entityId: null,
            roleId: [genUserRoleId.id],
          },
        });
        // console.log('Result', result);
      }
      const groupedUsersByUnit = dataArray.selectedUsers.reduce((acc, item) => {
        const { toUnit } = item;
        if (!acc[toUnit]) {
          acc[toUnit] = [];
        }
        acc[toUnit].push(item); // Add the user to the corresponding unit
        return acc;
      }, {});
      let unit, usersInUnit: any;
      // Loop over each unit, get MRs for that unit and send emails
      for ([unit, usersInUnit] of Object.entries(groupedUsersByUnit)) {
        // Step 1: Get the MRs for this unit using the `getAllMrsoflocation` API
        const mrs = await this.getAllMrsOfLocation(unit); // Assuming this is the API call

        // Step 2: Get the emails of the users in this unit
        const userIds = usersInUnit.map((user) => user.userId);
        const usersWithEmails = await this.prisma.user.findMany({
          where: {
            id: {
              in: userIds, // Get users whose userIds match those in the selected array
            },
          },
          select: {
            email: true, // Select email of each user
          },
        });

        const emailList = usersWithEmails.map((user) => user.email);
        const mrsMails = mrs.map((user) => user.email);

        const allEmails = [...emailList, ...mrsMails];
        const emailMessageIP = `
         <p> Hello</p>
      
         <p>This is to inform you that few users have been transferred to your unit. Please assign the users to their respective departments for a complete and smooth transfer process.</p>
        <p> Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/master" click for details</p>

         <p>PS:Roles have to be reassigned if required. All roles have been removed</p>
        
            `;
        const subject = `Users have been transferred`;
        if (createUsers?.length > 0) {
          this.sendEmail(allEmails, subject, emailMessageIP);
        }
        return res.send('successfull');
      }
    } catch (error) {
      // console.error('Error in transferring users:', error);
    }
  }
  async sendEmail(recipients, subject, html) {
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendBulkEmails(
          recipients,
          subject,
          '',
          html,
        );
        ////console.log('sent mail');
      } else {
        try {
          await sgMail.send({
            to: recipients,
            from: process.env.FROM,
            subject: subject,
            html: html,
          });
          // console.log('Email sent successfully to:', recipients);
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      // console.error('Error sending email:', error);
    }
  }
  async getAllMrsOfLocation(id) {
    const orgId = await this.prisma.location.findFirst({
      where: {
        id: id,
      },
    });
    const roleId = await this.prisma.role.findFirst({
      where: {
        organizationId: orgId.organizationId,
        roleName: 'MR',
      },
    });
    const mrs = await this.prisma.user.findMany({
      where: {
        locationId: id,
        deleted: false,
        roleId: { has: roleId.id },
        // assignedRole: {
        //   some: {
        //     role: {
        //       roleName: 'MR',
        //     },
        //   },
        // },
      },
      // include: { location: { select: { id: true, locationName: true } } },
    });
    return mrs;
  }
  async updateTransferredUser(dataArray) {
    try {
      // console.log('dataArray', dataArray);
      // Iterate over each data object in the array
      for (const data of dataArray) {
        // Prepare the data for the transferredUser update
        const updateData = {
          completedOn: new Date(),
          status: 'completed',
        };

        const res = await this.transferredUser.updateOne(
          { userId: data.userId, _id: data._id, completedOn: null },
          { $set: updateData },
        );

        if (res) {
          // Update the user record for each data object
          if (
            (!!data.entityId && data.entityId !== null) ||
            data.entityId !== undefined
          ) {
            const user = await this.prisma.user.update({
              where: {
                id: data.userId,
              },
              data: {
                entityId: data.entityId,
              },
            });
          }
        }
      }
    } catch (error) {
      // console.error('Error updating transferred users:', error);
    }
  }

  async getPendingForActionUsers(locid) {
    try {
      const result = await this.transferredUser.find({
        toUnit: locid,
        status: 'pending',
      });
      let list = [];
      // console.log('result', result);
      for (let user of result) {
        const userDetails = await this.prisma.user.findFirst({
          where: {
            id: user.userId,
          },
          include: {
            location: true,
          },
        });
        const data = {
          _id: user?._id,
          userDetails: userDetails,
        };

        list.push(data);
      }
      // console.log('list', list);
      return list;
    } catch (error) {}
  }
  async getUserAttributes(token, user) {
    const url =
      process.env.KEYCLOAK_API +
      process.env.BASE +
      user?.organization?.realmName +
      '/users/' +
      user.kcId;

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.get(url, { headers });
      const user = response.data;

      const publicKey = user?.attributes?.publicKey?.[0] ?? null;
      const pemPublicKey = `-----BEGIN RSA PUBLIC KEY-----\n${publicKey
        .match(/.{1,64}/g)
        .join('\n')}\n-----END RSA PUBLIC KEY-----`;

      return pemPublicKey;
    } catch (err) {
      console.error(
        'Error fetching user from Keycloak:',
        err.response?.data || err.message,
      );
      throw err;
    }
  }
  async writePrivateKeyIntoVault(privateKey, activeuser, username) {
    // console.log('activeuser', privateKey);
    try {
      let getObjectStoreContents = await this.ObjectStoreModel.findOne({
        // organizationId: activeuser?.organizationId,
        organizationId: 'master',
      });

      const userId = Buffer.from(
        getObjectStoreContents.userId,
        'base64',
      ).toString('ascii');
      // console.log('userID', userId);
      const base64Key = Buffer.from(privateKey).toString('base64');
      const apiKey = getObjectStoreContents.privateKey.toString('ascii');
      const region = common.Region.fromRegionId(
        Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
      );
      const tenancyId = Buffer.from(
        getObjectStoreContents.tenancyId,
        'base64',
      ).toString('ascii');
      const fingerprint = Buffer.from(
        getObjectStoreContents.fingerprint,
        'base64',
      ).toString('ascii');
      const passphrase = null;
      const provider = new common.SimpleAuthenticationDetailsProvider(
        tenancyId,
        userId,
        fingerprint,
        apiKey,
        passphrase,
        region,
      );
      // console.log('secresClient', provider);
      const vaultsClient = new oci.vault.VaultsClient({
        authenticationDetailsProvider: provider,
      });

      const request = {
        createSecretDetails: {
          compartmentId: process.env.CompartmentId,
          secretName: `user-${username}-private-key`,
          vaultId: process.env.VaultId,
          keyId: process.env.MasterKey,
          secretContent: {
            contentType: 'BASE64',
            content: base64Key,
          },
          description: 'Private key for document signing',
        },
      };

      const result = await vaultsClient.createSecret(request);
      // console.log('result', result);
      return result.secret?.id;
    } catch (error) {}
  }
  async getPrivateKeyFromVault(activeuser) {
    try {
      let getObjectStoreContents = await this.ObjectStoreModel.findOne({
        organizationId: 'master',
        // organizationId: activeuser?.organizationId,
      });
      // console.log('getOBjectstore', getObjectStoreContents);
      const userId = Buffer.from(
        getObjectStoreContents.userId,
        'base64',
      ).toString('ascii');
      // console.log('userID', userId);

      const apiKey = getObjectStoreContents.privateKey.toString('ascii');
      const region = common.Region.fromRegionId(
        Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
      );
      const tenancyId = Buffer.from(
        getObjectStoreContents.tenancyId,
        'base64',
      ).toString('ascii');
      const fingerprint = Buffer.from(
        getObjectStoreContents.fingerprint,
        'base64',
      ).toString('ascii');
      const passphrase = null;
      const provider = new common.SimpleAuthenticationDetailsProvider(
        tenancyId,
        userId,
        fingerprint,
        apiKey,
        passphrase,
        region,
      );
      // console.log('provider', provider);
      const secretId = activeuser?.secretId;
      // console.log('secretId', secretId);
      const secretsClient: any = new oci.secrets.SecretsClient({
        authenticationDetailsProvider: provider,
      });

      const result = await secretsClient.getSecretBundle({ secretId });
      // console.log('result', result);
      const base64Content = result.secretBundle.secretBundleContent.content;
      return Buffer.from(base64Content, 'base64').toString();
    } catch (error) {}
  }
  async getUserKeys(id, token) {
    try {
      const userDetails = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
        include: {
          organization: true,
        },
      });

      const publicKey = await this.getUserAttributes(token, userDetails);
      const privateKey = await this.getPrivateKeyFromVault(userDetails);
      // console.log('publickey and private kye', publicKey, privateKey);
      return { publicKey, privateKey };
    } catch (error) {}
  }
  // async signDocument(file, userid, id, status) {
  //   //get user details
  //   const userDetails = await this.prisma.user.findFirst({
  //     where: {
  //       id: userid,
  //     },
  //     include: {
  //       organization: true,
  //     },
  //   });

  //   const fs = require('fs');

  //   const content = fs.readFileSync('filepath');
  //   const sign = crypto.createSign('RSA-SHA256');
  //   sign.update(content);
  //   sign.end();
  //   const privateKeyPem = await this.getPrivateKeyFromVault(userDetails);
  //   const signaturePayload = {
  //     id,
  //     action: '',
  //     by: userDetails?.id,
  //     at: new Date().toISOString(),
  //   };

  //   const stringToSign = JSON.stringify(signaturePayload);
  //   const signature = sign.sign(privateKeyPem, 'base64');
  //   // return sign.sign(privateKeyPem, 'base64');
  //   let digitalSignature = {
  //     signedBy: userDetails?.id,
  //     signedAt: new Date(),
  //     signature,

  //     stringSigned: stringToSign,
  //     algorithm: 'RSA-SHA256',
  //     keyId: uuid(), // optional key identifier
  //   };
  //   //updte th document or checksheet with this digiatalSignature
  // }

  async signDocumentStage(query) {
    // get the action user details
    // console.log('query', query);
    try {
      const { userId, docId, action, comment } = query;
      const userDetails = await this.prisma.user.findFirst({
        where: { id: userId },
        include: { organization: true },
      });
      const privateKeyPem = await this.getPrivateKeyFromVault(userDetails);
      // console.log('privateKeyPem', privateKeyPem);
      if (!userDetails) {
        throw new NotFoundException('User not found');
      }

      // get private key from the vault

      // console.log('privatekyPem', privateKeyPem);
      // ready the paylod
      const signaturePayload = {
        docId,
        action,
        by: userDetails.id,
        at: new Date().toISOString(),
      };

      const stringToSign = JSON.stringify(signaturePayload);

      // Step 4: Sign the payload
      const sign = createSign('RSA-SHA256');
      sign.update(stringToSign);
      sign.end();
      // console.log('sign', sign);
      const signature = !!privateKeyPem && sign.sign(privateKeyPem, 'base64');

      const digitalSignature = {
        signedBy: userDetails.id,
        action: action,
        username: userDetails?.firstname + ' ' + userDetails?.lastname,
        personalSignature: userDetails.signature,
        signedAt: new Date(),
        signature,
        comment: comment,
        // stringSigned: stringToSign,
        // algorithm: 'RSA-SHA256',
        // keyId: uuid(), // optional key ID for traceability
      };

      // TODO: Store this signature in the workflow history or a signatures collection

      return digitalSignature;
    } catch (error) {}
  }

  async verifySignature(documentBuffer, publicKeyPem, signature) {
    const verify = createVerify('SHA256');
    verify.update(documentBuffer);
    verify.end();

    return verify.verify(publicKeyPem, signature, 'base64');
  }

  async patchUser(body, id) {
    try {
      // console.log('body', body);
      const user = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          ...body,
        },
      });
      return user;
    } catch (error) {}
  }

  async getGlobalUsersLocations(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      let allLocations;
      if (activeUser.additionalUnits.includes('All')) {
        allLocations = await this.prisma.location.findMany({
          where: {
            organizationId: activeUser.organizationId,
          },
          select: {
            id: true,
            locationName: true,
            locationId: true,
          },
        });
      } else {
        allLocations = await this.prisma.location.findMany({
          where: {
            organizationId: activeUser.organizationId,
            OR: [
              {
                id: {
                  in: activeUser.additionalUnits,
                },
              },
            ],
          },
          select: {
            id: true,
            locationName: true,
            locationId: true,
          },
        });
      }
      return allLocations;
    } catch (error) {
      console.error('Error fetching global roles:', error);
      throw error;
    }
  }
}
