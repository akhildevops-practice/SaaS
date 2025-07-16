
// const queryGeneratorDocuments = (realmName, filterCondArr, filterCondRelatedFieldsArr, skip, take, includeObj, userName) => {



//     if (userName) {
//         const nameArr = userName?.split(" ")
//         if (nameArr.length === 1 || 2) {
//             const firstName = nameArr[0];
//             const lastName = nameArr[1]
//             const query = {
//                 skip: skip,
//                 take: take,
//                 where: {
//                     AND: [

//                         {
//                             organization: {
//                                 realmName: realmName
//                             }
//                         },
//                         {
//                             OR: [
//                                 {
//                                     firstname: {
//                                         contains: firstName,
//                                         mode: 'insensitive',


//                                     }

//                                 },
//                                 {
//                                     lastname: {
//                                         contains: firstName,
//                                         mode: 'insensitive',


//                                     }
//                                 },
//                                 {
//                                     firstname: {
//                                         contains: firstName,
//                                         mode: 'insensitive',


//                                     }
//                                 },
//                                 {
//                                     lastname: {

//                                         contains: lastName,
//                                         mode: 'insensitive',


//                                     }
//                                 }

//                             ]
//                         }


//                     ]
//                 },
//                 include: includeObj
//             }

//             if (filterCondArr.length == 0) {
//                 filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {
                  

//                     query.where.AND.push({} as any);
       
//                     if (filterCondition.filterField == "businessType") {
//                         query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                             name: {
//                                 contains: filterCondition.filterString,
//                                 mode: 'insensitive'
//                             }
//                         }
                       
//                     } else if (filterCondition.filterField == "location") {
                    
//                         query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                             locationName: {
//                                 contains: filterCondition.filterString,
//                                 mode: 'insensitive'
//                             }
//                         }
//                     } else if (filterCondition.filterField == "entity") {
//                         query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                             entityName: {
//                                 contains: filterCondition.filterString,
//                                 mode: 'insensitive'
//                             }
//                         }
//                     } else if (filterCondition.filterField == "assignedRole") {
//                         query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                             some: {
//                                 role: {
//                                     roleName: {
//                                         contains: filterCondition.filterString,
//                                         mode: 'insensitive'

//                                     }
//                                 }
//                             }
//                         }
//                     } else {
//                         query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                             [filterCondition.filterField]: {
//                                 contains: filterCondition.filterString,
//                                 mode: 'insensitive'
//                             }
//                         }
//                     }


//                 })
//             } else {
//                 filterCondArr.forEach((filterCond, index) => {
                   
//                     query.where.AND.push({} as any);
                    
//                     query.where.AND[index + 1][filterCond.filterField] = {
//                         contains: filterCond.filterString,
//                         mode: 'insensitive'
//                     }
//                     if (index == (filterCondArr.length - 1) && filterCondRelatedFieldsArr.length >= 1) {

//                         filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {
                         

//                             query.where.AND.push({} as any);
                         
//                             if (filterCondition.filterField == "businessType") {
//                                 query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                     name: {
//                                         contains: filterCondition.filterString,
//                                         mode: 'insensitive'
//                                     }
//                                 }
//                             } else if (filterCondition.filterField == "location") {
                               
//                                 query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                     locationName: {
//                                         contains: filterCondition.filterString,
//                                         mode: 'insensitive'
//                                     }
//                                 }
//                             } else if (filterCondition.filterField == "entity") {
//                                 query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                     entityName: {
//                                         contains: filterCondition.filterString,
//                                         mode: 'insensitive'
//                                     }
//                                 }
//                             } else if (filterCondition.filterField == "assignedRole") {
//                                 query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                     some: {
//                                         role: {
//                                             roleName: {
//                                                 contains: filterCondition.filterString,
//                                                 mode: 'insensitive'

//                                             }
//                                         }
//                                     }
//                                 }
//                             } else {
//                                 query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                     [filterCondition.filterField]: {
//                                         contains: filterCondition.filterString,
//                                         mode: 'insensitive'
//                                     }
//                                 }
//                             }


//                         })
//                     }


//                 })

//             }



//             return query

//         } else {
//             return {}
//         }
//     } else {
        

//         const query = {
//             skip: skip,
//             take: take,
//             where: {
//                 AND: [{
//                     organization: {
//                         realmName: realmName
//                     }
//                 }]
//             },
//             include: includeObj
//         }


//         if (filterCondArr.length == 0) {
//             filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


//                 query.where.AND.push({} as any);
             
//                 if (filterCondition.filterField == "businessType") {
                   
//                     query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                         name: {
//                             contains: filterCondition.filterString,
//                             mode: 'insensitive'
//                         }
//                     }
//                 } else if (filterCondition.filterField == "location") {
                 
//                     query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                         locationName: {
//                             contains: filterCondition.filterString,
//                             mode: 'insensitive'
//                         }
//                     }
//                 } else if (filterCondition.filterField == "entity") {
//                     query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                         entityName: {
//                             contains: filterCondition.filterString,
//                             mode: 'insensitive'
//                         }
//                     }
//                 } else if (filterCondition.filterField == "assignedRole") {
//                     query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                         some: {
//                             role: {
//                                 roleName: {
//                                     contains: filterCondition.filterString,
//                                     mode: 'insensitive'

//                                 }
//                             }
//                         }
//                     }
//                 } else {
//                     query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                         [filterCondition.filterField]: {
//                             contains: filterCondition.filterString,
//                             mode: 'insensitive'
//                         }
//                     }
//                 }


//             })
//         } else {
//             filterCondArr.forEach((filterCond, index) => {

//                 query.where.AND.push({} as any);

//                 if (filterCond.filterField == "status") {

//                     query.where.AND[index + 1][filterCond.filterField] = {

//                         equals: Number(filterCond.filterString) == 0 ? false : true,

//                     }
//                 } else {
//                     query.where.AND[index + 1][filterCond.filterField] = {

//                         contains: filterCond.filterString,
//                         mode: "insensitive"

//                     }
//                 }




//                 if (index == (filterCondArr.length - 1) && filterCondRelatedFieldsArr.length >= 1) {

//                     filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {
                     

//                         query.where.AND.push({} as any);
                       
//                         if (filterCondition.filterField == "businessType") {
//                             query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                 name: {
//                                     contains: filterCondition.filterString,
//                                     mode: 'insensitive'
//                                 }
//                             }
//                         } else if (filterCondition.filterField == "location") {
                         
//                             query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                 locationName: {
//                                     contains: filterCondition.filterString,
//                                     mode: 'insensitive'
//                                 }
//                             }
//                         } else if (filterCondition.filterField == "entity") {
//                             query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                 entityName: {
//                                     contains: filterCondition.filterString,
//                                     mode: 'insensitive'
//                                 }
//                             }
//                         } else if (filterCondition.filterField == "assignedRole") {
//                             query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                 some: {
//                                     role: {
//                                         roleName: {
//                                             contains: filterCondition.filterString,
//                                             mode: 'insensitive'

//                                         }
//                                     }
//                                 }
//                             }
//                         } else {
//                             query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
//                                 [filterCondition.filterField]: {
//                                     contains: filterCondition.filterString,
//                                     mode: 'insensitive'
//                                 }
//                             }
//                         }


//                     })
//                 }


//             })

//         }

//         return query
//     }
// }