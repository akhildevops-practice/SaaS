import { includeObjUser } from '../utils/constants';
import { createFieldsPairsFilterUsers } from '../utils/filterGenerator';
import { getUserRoleDetails } from './helper';

// export const filterUsers = async (userName, businessType, locationName, departmentName, byRole, status, realmName, skipValue, limit, userTable, userRoleTable,) => {
//     //userName
//     if (userName && !businessType && !locationName && !departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [], includeObjUser, userName)

//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName
//     } else if (!userName && !businessType && locationName && !departmentName && !byRole && !status) {
//         (locationName)
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName
//     } else if (!userName && !businessType && !locationName && departmentName && !byRole && !status) {
//         (departmentName)

//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }

//         //businessTYpe

//     } else if (!userName && businessType && !locationName && !departmentName && !byRole && !status) {
//         (businessType)
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }

//         //BYRole
//     } else if (!userName && !businessType && !locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         /// status

//     } else if (!userName && !businessType && !locationName && !departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName  //locationName
//     } else if (userName && !businessType && locationName && !departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName    //departName
//     } else if (userName && !businessType && !locationName && departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName       //businessTYpe
//     } else if (userName && businessType && !locationName && !departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName        //BYRole
//     } else if (userName && !businessType && !locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName    //   status
//     } else if (userName && !businessType && !locationName && !departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName   //departName
//     } else if (!userName && !businessType && locationName && departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName    //businessTYpe
//     } else if (!userName && businessType && locationName && !departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName    //BYRole
//     } else if (!userName && !businessType && locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName        /// status
//     } else if (!userName && !businessType && locationName && !departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName       //businessTYpe
//     } else if (!userName && businessType && !locationName && departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName       //BYRole
//     } else if (!userName && !businessType && !locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName     /// status
//     } else if (!userName && !businessType && !locationName && departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //businessTYpe   //BYRole
//     } else if (!userName && businessType && !locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //businessTYpe     /// status
//     } else if (!userName && businessType && !locationName && !departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //ByRole      /// status
//     } else if (!userName && !businessType && !locationName && !departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //////////////////////////////////////////////////
//         //userName   //locationName    //departName
//     } else if (userName && !businessType && locationName && departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName      //locationName            //businessTYpe
//     } else if (userName && businessType && locationName && !departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName       //locationName    //BYRole
//     } else if (userName && !businessType && locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName    //locationName     //status
//     } else if (userName && !businessType && locationName && !departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //departName  //businessTYpe
//     } else if (userName && businessType && !locationName && departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //departName   //BYRole
//     } else if (userName && !businessType && !locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //departName   //status
//     } else if (userName && !businessType && !locationName && departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //businessTYpe  //BYRole
//     } else if (userName && businessType && !locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName  //businessTYpe //status
//     } else if (userName && businessType && !locationName && !departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName  //BYRole  //status
//     } else if (userName && !businessType && !locationName && !departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName    //departName  //businessTYpe
//     } else if (!userName && businessType && locationName && departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName  //departName //BYRole
//     } else if (!userName && !businessType && locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName   //departName //status
//     } else if (!userName && !businessType && locationName && departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName //businessTYpe  //BYRole
//     } else if (!userName && businessType && locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName  //businessTYpe  //status
//     } else if (!userName && businessType && locationName && !departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName //BYRole   //status
//     } else if (!userName && !businessType && locationName && !departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName  //businessTYpe   //BYRole
//     } else if (!userName && businessType && !locationName && !departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName  //businessTYpe  //status
//     } else if (!userName && businessType && !locationName && departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName //BYRole  //status
//     } else if (!userName && !businessType && !locationName && departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "entity", filterString: departmentName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //businessTYpe   //BYRole //status
//     } else if (!userName && businessType && !locationName && !departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         /////////////////////////////////////////////////////////////
//         //userName   //locationName    //departName  //businessTYpe
//     } else if (userName && businessType && locationName && departmentName && !byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //locationName    //departName   //BYRole
//     } else if (userName && !businessType && locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //locationName    //departName  //status
//     } else if (userName && !businessType && locationName && departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName  //departName //businessTYpe //BYRole
//     } else if (userName && businessType && !locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName  //departName //businessTYpe   //status
//     } else if (userName && businessType && !locationName && departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName //businessTYpe //BYRole //status
//     } else if (userName && businessType && !locationName && !departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName //departName  //businessTYpe //BYRole
//     } else if (!userName && businessType && locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName //departName //businessTYpe //status
//     } else if (!userName && businessType && locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //locationName //businessTYpe //BYRole //status
//     } else if (!userName && businessType && locationName && !departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //departName //businessTYpe  //BYRole //status
//     } else if (!userName && businessType && !locationName && departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //locationName    //departName  //businessTYpe  //BYRole
//     } else if (userName && businessType && locationName && departmentName && byRole && !status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //locationName    //departName  //businessTYpe //status
//     } else if (userName && businessType && locationName && departmentName && !byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }
//         //userName   //locationName    //departName  //businessTYpe  //BYRole //status
//     } else if (userName && businessType && locationName && departmentName && byRole && status) {
//         const filteredData = await createFieldsPairsFilterUsers(realmName, skipValue, Number(limit), userTable, [{ filterField: "status", filterString: status }], [{ filterField: "location", filterString: locationName }, { filterField: "entity", filterString: departmentName }, { filterField: "businessType", filterString: businessType }, { filterField: "assignedRole", filterString: byRole }], includeObjUser, userName)
//         const resolvedUsers = await getUserRoleDetails(filteredData.data, userRoleTable)
//         return { data: resolvedUsers, length: filteredData.length }

//     } else {
//         ("skip", skipValue, limit)
//         const totalData = await userTable.findMany({
//             where: {
//                 organization: {
//                     realmName: {
//                         contains: realmName
//                     }
//                 },

//             },
//             include: {
//                 assignedRole: true,
//                 entity: {
//                     select: {
//                         id: true,
//                         entityName: true
//                     }
//                 },
//                 businessType: {
//                     select: {
//                         id: true,
//                         name: true
//                     }
//                 },
//                 section: {
//                     select: {
//                         id: true,
//                         name: true
//                     }
//                 },
//                 location: {
//                     select: {
//                         id: true,
//                         locationName: true
//                     }
//                 }
//             }
//         })
//         const filteredData = await userTable.findMany({
//             skip: skipValue,
//             take: Number(limit),
//             where: {
//                 organization: {
//                     realmName: {
//                         contains: realmName
//                     }
//                 }
//             },
//             include: {
//                 assignedRole: true,
//                 entity: {
//                     select: {
//                         id: true,
//                         entityName: true
//                     }
//                 },
//                 businessType: {
//                     select: {
//                         id: true,
//                         name: true
//                     }
//                 },
//                 section: {
//                     select: {
//                         id: true,
//                         name: true
//                     }
//                 },
//                 location: {
//                     select: {
//                         id: true,
//                         locationName: true
//                     }
//                 }
//             }
//         })

//         const resolvedUsers = await getUserRoleDetails(filteredData, userRoleTable)

//         return { data: resolvedUsers, length: totalData.length }
//     }
// }

export const findAllUsers = async (
  filterString,
  location,
  entity,
  page,
  limit,
  realmName,
  user,
  search,
  userTable,
  userRoleTable,
  locationTable,
  entityTable,
) => {
  const skipValue = (page - 1) * Number(limit);

  const searchQuery = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { firstname: { contains: search, mode: 'insensitive' } },
          { lastname: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  // console.log('searchQuery', searchQuery);

  const baseQuery = {
    AND: [{ organization: { realmName: realmName } }, { deleted: false }],
  };

  const getLocationEntityRole = async () => {
    if (!search) return {};
    const [locationQuery, entityQuery, roleQuery] = await Promise.all([
      locationTable.findFirst({
        where: {
          locationName: { contains: search, mode: 'insensitive' },
          organization: { organizationName: realmName },
          deleted: false,
        },
      }),
      entityTable.findFirst({
        where: {
          entityName: { contains: search, mode: 'insensitive' },
          organization: { organizationName: realmName },
          deleted: false,
        },
      }),
      userRoleTable.findFirst({
        where: {
          roleName: { contains: search, mode: 'insensitive' },
          organization: { organizationName: realmName },
        },
      }),
    ]);
    return { locationQuery, entityQuery, roleQuery };
  };

  const applyFilters = (filterString) => {
    if (!filterString) return [];
    return filterString.split(',').map((item) => {
      const [fieldName, fieldValue] = item.split('|');
      return { filterField: fieldName, filterString: fieldValue };
    });
  };

  const filterQuery = filterString
    ? queryGeneartorForDocumentsFilter(applyFilters(filterString))
    : [];

  const { locationQuery, entityQuery } = await getLocationEntityRole();

  // const finalQuery = {
  //   ...baseQuery,
  //   ...searchQuery,
  //   ...(entity?.length ? { entityId: { in: entity } } : {}),
  //   ...(locationQuery
  //     ? { locationId: { contains: locationQuery?.id, mode: 'insensitive' } }
  //     : {}),
  //   ...(location?.length
  //     ? {
  //         OR: [
  //           { locationId: { in: location } },
  //           { additionalUnits: { hasSome: location } }, // ← matches any location ID in the array
  //         ],
  //       }
  //     : {}),
  //   ...(entityQuery
  //     ? { entityId: { contains: entityQuery?.id, mode: 'insensitive' } }
  //     : {}),
  //   AND: [...baseQuery.AND, ...filterQuery],
  // };
  const searchConditions = search
    ? [
        {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { firstname: { contains: search, mode: 'insensitive' } },
            { lastname: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    : [];
  const finalQuery = {
    AND: [
      { organization: { realmName } },
      { deleted: false },
      ...filterQuery,
      ...(entity?.length ? [{ entityId: { in: entity } }] : []),
      ...(location?.length
        ? [
            {
              OR: [
                { locationId: { in: location } },
                { additionalUnits: { hasSome: location } },
              ],
            },
          ]
        : []),
      ...(locationQuery
        ? [
            {
              locationId: {
                contains: locationQuery.id,
                mode: 'insensitive',
              },
            },
          ]
        : []),
      ...(entityQuery
        ? [
            {
              entityId: {
                contains: entityQuery.id,
                mode: 'insensitive',
              },
            },
          ]
        : []),
      ...searchConditions,
    ],
  };
  // console.log('finalquery', finalQuery);
  const [filteredUsers, length] = await Promise.all([
    userTable.findMany({
      skip: skipValue,
      take: Number(limit),
      where: finalQuery,
      include: {
        entity: { select: { id: true, entityName: true } },
        location: { select: { id: true, locationName: true } },
      },
      orderBy: [{ firstname: 'asc' }],
    }),
    userTable.count({ where: finalQuery }),
  ]);

  const resolvedUsers = await getUserRoleDetails(filteredUsers, userRoleTable);

  return { data: resolvedUsers, length };
};

export const queryGeneartorForDocumentsFilter = (filterArray) => {
  const filterCondtions = [];

  for (const element of filterArray) {
    if (element.filterField == 'departmentName') {
      filterCondtions.push({
        entity: {
          entityName: {
            contains: element.filterString,
            mode: 'insensitive',
          },
        },
      });
    } else if (element.filterField == 'locationName') {
      filterCondtions.push({
        location: {
          [element.filterField]: {
            contains: element.filterString,
            mode: 'insensitive',
          },
        },
      });
    } else if (element.filterField == 'businessType') {
      filterCondtions.push({
        businessType: {
          name: {
            contains: element.filterString,
            mode: 'insensitive',
          },
        },
      });
    } else if (element.filterField == 'user') {
      let firstName, lastName;

      const nameArr = element.filterString?.split(' ');
      if (nameArr.length === 1 || 2) {
        firstName = nameArr[0];
        lastName = nameArr[1];
      }

      filterCondtions.push({
        OR: [
          {
            firstname: {
              contains: firstName,
              mode: 'insensitive',
            },
          },
          {
            firstname: {
              contains: lastName,
              mode: 'insensitive',
            },
          },
          {
            lastname: {
              contains: firstName,
              mode: 'insensitive',
            },
          },
          {
            lastname: {
              contains: lastName,
              mode: 'insensitive',
            },
          },
        ],
      });
    } else if (element.filterField == 'byRole') {
      filterCondtions.push({
        assignedRole: {
          some: {
            role: {
              roleName: {
                contains: element.filterString,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    } else if (element.filterField == 'status') {
      filterCondtions.push({
        status: element.filterString == 'true' ? true : false,
      });
    }
  }

  return filterCondtions;
};
