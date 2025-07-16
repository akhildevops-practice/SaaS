import { BadRequestException } from '@nestjs/common';
import { axiosKc } from '../utils/axios.global';
import { roles } from 'src/utils/roles.global';

export const getUserRoleDetails = async (allUsers, userRoleTable) => {
  const users = allUsers.map(async (user) => {
    let rolesPromiseArr = [];
    // let roles = user.roleId.map(async (role, index) => {
    //   const rolesPromise = new Promise(async (resolve, reject) => {
    //     const roleName = await userRoleTable.findFirst({
    //       where: {
    //         id: role.id,
    //       },
    //       include: {
    //         role: {
    //           select: {
    //             roleName: true,
    //           },
    //         },
    //       },
    //     });

    //     resolve(roleName);
    //   });

    //   rolesPromiseArr.push(rolesPromise);

    //   if (index === user.roleId.length - 1) {
    //     const result = await Promise.all(rolesPromiseArr);

    //     const finalResult = result.map((role) => {
    //       return { ...role, role: role.role.roleName };
    //     });

    //     return finalResult;
    //   }
    // });
    // const rolesResolved = await Promise.all(roles);

    // const finalRoles = rolesResolved.filter((role) => {
    //   if (role != null || undefined) {
    //     return true;
    //   }
    //   return false;
    // });
    const rolesData = await userRoleTable.findMany({
      where: {
        id: { in: user.roleId },
        NOT: [
          { roleName: { contains: 'REVIEWER' } },
          { roleName: { contains: 'APPROVER' } },
        ],
      },
    });
    const finalRoleData = rolesData.map((value) => {
      return {
        ...value,
        role: value.roleName,
      };
    });
    return { ...user, assignedRole: finalRoleData, userId: user.id };
  });

  const resolvedUsers = await Promise.all(users);
  return resolvedUsers;
};

export const getBTDetails = async (allLocation, locationBizTable) => {
  const users = allLocation?.map(async (location) => {
    let rolesPromiseArr = [];
    let roles = location?.business?.map(async (bt, index) => {
      const rolesPromise = new Promise(async (resolve, reject) => {
        const roleName = await locationBizTable.findFirst({
          where: {
            id: bt?.id,
          },
          include: {
            business: {
              select: {
                name: true,
              },
            },
          },
        });

        resolve(roleName);
      });

      rolesPromiseArr?.push(rolesPromise);

      if (index === location.business.length - 1) {
        const result = await Promise?.all(rolesPromiseArr);

        const finalResult = result?.map((bt) => {
          return { ...bt, businessType: bt.businessType?.name };
        });

        return finalResult;
      }
    });
    const rolesResolved = await Promise?.all(roles);

    const finalRoles = rolesResolved?.filter((role) => {
      if (role != null || undefined) {
        return true;
      }
      return false;
    });

    return { ...location, businessType: finalRoles[0] };
  });

  const resolvedUsers = await Promise.all(users);
  return resolvedUsers;
};

export const createRolesConfigInKc = async (
  roles,
  realm,
  token,
  kcId,
  userKcId,
) => {
  //////////////console.log("createRolesConfigInKcroles",roles)
  roles.forEach(async (role) => {
    const getRoleKcApi =
      process.env.KEYCLOAK_API + process.env.BASE + `${realm}/roles/${role}`;
    //////////console.log('getRoleKcApi', getRoleKcApi);

    const getRoleResponse = await axiosKc(getRoleKcApi, 'GET', token);
    //(getRoleResponse)

    const baseRoleMapping =
      process.env.BASE + realm + '/users/' + kcId + '/role-mappings/realm';

    const roleMappingApi = process.env.KEYCLOAK_API + baseRoleMapping;
    const clientRolePayload = [{ id: getRoleResponse.data.id, name: role }];
    //(clientRolePayload)
    //////////console.log('clientRolePayload', clientRolePayload);
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

  const manageRealmResponse = await axiosKc(getManageRealmKcApi, 'GET', token);

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

  const rolesConfig = await axiosKc(assign_role_api, 'POST', token, role_data);

  return rolesConfig.status;
};

// export const getUserDetails = async (allDoctypes, userTable) => {

//     const users = allDoctypes.map(async (doctype) => {
//         let usersPromiseArr = []
//         let roles = doctype.creators.map(async (user, index) => {

//             const usersPromise = new Promise(async (resolve, reject) => {
//                 const userDetails = await userTable.findFirst(({
//                     where: {
//                         id: user
//                     }
//                 }))

//                 resolve(userDetails)
//             })

//             usersPromiseArr.push(usersPromise);

//             if (index === allDoctypes.creator.length - 1) {
//                 const result = await Promise.all(usersPromiseArr)

//                 const finalResult = result.map((user) => {
//                     return { ...user, businessType: bt.businessType?.name }
//                 })

//                 return finalResult
//             }

//         })
//         const rolesResolved = await Promise.all(roles)

//         const finalRoles = rolesResolved.filter((role) => {
//             if (role != null || undefined) {
//                 return true
//             }
//             return false
//         })

//         return { ...location, businessType: finalRoles[0] }
//     })

//     const resolvedUsers = await Promise.all(users);
//     return resolvedUsers
// }

// export const getBTDetails = async (, locationBizTable) => {

//     const users = allLocation.map(async (location) => {
//         let rolesPromiseArr = []
//         let roles = location.businessType.map(async (bt, index) => {

//             const rolesPromise = new Promise(async (resolve, reject) => {
//                 const roleName = await locationBizTable.findFirst(({
//                     where: {
//                         id: bt.id
//                     },
//                     include: {
//                         businessType: {
//                             select: {
//                                 name: true
//                             }
//                         }
//                     }
//                 }))

//                 resolve(roleName)
//             })

//             rolesPromiseArr.push(rolesPromise);

//             if (index === location.businessType.length - 1) {
//                 const result = await Promise.all(rolesPromiseArr)

//                 const finalResult = result.map((bt) => {
//                     return { ...bt, businessType: bt.businessType?.name }
//                 })

//                 return finalResult
//             }

//         })
//         const rolesResolved = await Promise.all(roles)

//         const finalRoles = rolesResolved.filter((role) => {
//             if (role != null || undefined) {
//                 return true
//             }
//             return false
//         })

//         return { ...location, businessType: finalRoles[0] }
//     })

//     const resolvedUsers = await Promise.all(users);
//     return resolvedUsers
// }
