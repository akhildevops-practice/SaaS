import { BadRequestException, Catch } from '@nestjs/common';
import { includeObjUser } from './constants';




// const organizationFilterQuery = (skip, take, includeObj, filterCondArray) => {
//     const query = {
//         skip: skip,
//         take: take,
//         where: {
//             AND: [{

//             },]
//         },
//         include: includeObj
//     }



// }


// const userNameQuery = (skip, take, filterCondArray, includeObj, userName?) => {
//     const nameArr = userName?.split(" ")
//     if (nameArr.length === 1 || 2) {
//         const firstName = nameArr[0];
//         const lastName = nameArr[1]
//         const query = {
//             skip: skip,
//             take: take,
//             where: {
//                 AND: [



//                     {
//                         OR: [
//                             {
//                                 user: {
//                                     some: {
//                                         OR: [
//                                             {
//                                                 firstname: {
//                                                     contains: firstName,
//                                                     mode: 'insensitive',


//                                                 }

//                                             },
//                                             {
//                                                 lastname: {
//                                                     contains: firstName,
//                                                     mode: 'insensitive',


//                                                 }
//                                             }
//                                         ]

//                                     }
//                                 }
//                             },
//                             {
//                                 user: {
//                                     some: {
//                                         OR: [
//                                             {
//                                                 firstname: {
//                                                     contains: firstName,
//                                                     mode: 'insensitive',


//                                                 }
//                                             },
//                                             {
//                                                 lastname: {

//                                                     contains: lastName,
//                                                     mode: 'insensitive',


//                                                 }
//                                             }]

//                                     }

//                                 }
//                             }
//                         ]

//                     }
//                 ]
//             },
//             include: includeObj
//         }

//         filterCondArray.forEach((filterCond, index) => {

//             query.where.AND.push({} as any);
//             (query.where.AND[index + 1])

//             if (filterCond.filterField == "organizationName") {
//                 query.where.AND[index + 1][filterCond.filterField] = {
//                     contains: filterCond.filterString,
//                     mode: 'insensitive'
//                 }
//             }


//         })


//         return query

//     } else {
//         return {}
//     }
// }

// ///put filter conditeion object in AND array

// const createANDqueryConditions = (filterCondArray) => {
//     let andQueryArray = [];


//     filterCondArray.forEach((filterCond, index) => {




//         if (filterCond.filterField == "organizationName") {
//             const query = {
//                 [filterCond.filterField]: {
//                     contains: filterCond.filterString,
//                     mode: 'insensitive'
//                 }
//             }
//             andQueryArray.push(query)

//         } else if(filterCond.filterField == "userName") {
//             const nameArr = filterCond.filterString?.split(" ")
//             if (nameArr.length === 1 || 2) {
//                 const firstName = nameArr[0];
//                 const lastName = nameArr[1]
//                 const query = {
//                     OR: [
//                         {
//                             user: {
//                                 some: {
//                                     OR: [
//                                         {
//                                             firstname: {
//                                                 contains: firstName,
//                                                 mode: 'insensitive',


//                                             }

//                                         },
//                                         {
//                                             lastname: {
//                                                 contains: firstName,
//                                                 mode: 'insensitive',


//                                             }
//                                         }
//                                     ]

//                                 }
//                             }
//                         },
//                         {
//                             user: {
//                                 some: {
//                                     OR: [
//                                         {
//                                             firstname: {
//                                                 contains: firstName,
//                                                 mode: 'insensitive',


//                                             }
//                                         },
//                                         {
//                                             lastname: {

//                                                 contains: lastName,
//                                                 mode: 'insensitive',


//                                             }
//                                         }]

//                                 }

//                             }
//                         }
//                     ]
//                 }


//             }


//         }
//     } 
//         )

// }























const queryGenerator = (realmName, filterCondArr, skip, take, includeObj, userName?,) => {

    if (userName) {
        const nameArr = userName?.split(" ")
        if (nameArr.length === 1 || 2) {
            const firstName = nameArr[0];
            const lastName = nameArr[1]
            const query = {
                skip: skip,
                take: take,
                where: {
                    AND: [

                        {
                            organization: {
                                realmName: realmName
                            }
                        },

                        {
                            OR: [
                                {
                                    user: {
                                        some: {
                                            OR: [
                                                {
                                                    firstname: {
                                                        contains: firstName,
                                                        mode: 'insensitive',


                                                    }

                                                },
                                                {
                                                    lastname: {
                                                        contains: firstName,
                                                        mode: 'insensitive',


                                                    }
                                                }
                                            ]

                                        }
                                    }
                                },
                                {
                                    user: {
                                        some: {
                                            OR: [
                                                {
                                                    firstname: {
                                                        contains: firstName,
                                                        mode: 'insensitive',


                                                    }
                                                },
                                                {
                                                    lastname: {

                                                        contains: lastName,
                                                        mode: 'insensitive',


                                                    }
                                                }]

                                        }

                                    }
                                }
                            ]

                        }
                    ]
                },
                include: includeObj
            }

            filterCondArr.forEach((filterCond, index) => {

                query.where.AND.push({} as any);

                query.where.AND[index + 1][filterCond.filterField] = {
                    contains: filterCond.filterString,
                    mode: 'insensitive'
                }


            })


            return query

        } else {
            return {}
        }
    } else {

        const query = {
            skip: skip,
            take: take,
            where: {
                AND: [{
                    organization: {
                        realmName: realmName
                    }
                },]
            },
            include: includeObj
        }
        filterCondArr.forEach((filterCond, index) => {

            query.where.AND.push({} as any);

            query.where.AND[index][filterCond.filterField] = {
                contains: filterCond.filterString,
                mode: 'insensitive'
            }
        })

        return query
    }
}





export const createFieldsPairsFilter = async (realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => {

    const query: any = queryGenerator(realmName, filterCondArr, skip, take, userName, includeObj)


    try {
        const data = await prismaTableToBeFiltred.findMany(query)
        const newQuery = { where: query.where, orderBy: { locationName: "asc" } }

        const allData = await prismaTableToBeFiltred.findMany(newQuery)


        return { data: data, length: allData.length }
    } catch (err) {

        throw new BadRequestException("Some error occured")
    }


}
export const createFieldsPairsFilterDept = async (realmName, skip, take, prismaTableToBeFiltred, filterCondArr, businessType, location, includeObj) => {

    const query = queryGeneratorDept(realmName, filterCondArr, skip, take, includeObj, location, businessType)


    try {
        const data = await prismaTableToBeFiltred.findMany(query)

        const newQuery = { where: query.where }

        const allData = await prismaTableToBeFiltred.findMany(newQuery)


        return { data: data, length: allData.length }
    } catch (err) {
        (err)
        throw new BadRequestException("Some error occured")
    }


}
export const createFieldsPairsFilterUsers = async (realmName, skip, take, prismaTable, filterCondArr, filterCondRelatedFieldsArr, includeObj, userName?) => {

    const query: any = queryGeneratorUsers(realmName, filterCondArr, filterCondRelatedFieldsArr, skip, take, includeObj, userName)


    try {
        const data = await prismaTable.findMany(query)
        const newQuery = { where: query.where }

        const allData = await prismaTable.findMany(newQuery)


        return { data: data, length: allData.length }
    } catch (err) {
        (err)
        throw new BadRequestException("Some error occured")
    }


}
export const createFieldsPairsFilterOrgo = async (realmName, skip, take, prismaTable, filterCondArr, filterCondRelatedFieldsArr, includeObj, userName?) => {

    const query = queryGeneratorUsers(realmName, filterCondArr, filterCondRelatedFieldsArr, skip, take, includeObj, userName)


    try {
        const data = await prismaTable.findMany(query)

        return { data: data, length: data.length }
    } catch (err) {

        throw new BadRequestException("Some error occured")
    }


}


export const queryGeneratorDept = (realmName, filterCondArr, skip, take, includeObj, location?, businessType?,) => {

    if (businessType && location) {

        const query = {
            skip: skip,
            take: take,
            where: {
                AND: [
                    {
                        organization: {
                            realmName: realmName
                        }
                    },
                    {
                        businessType: {

                            businessType: {
                                contains: businessType,
                                mode: "insensitive"
                            }

                        }
                    },
                    {
                        location: {

                            locationName: {
                                contains: location,
                                mode: "insensitive"
                            }

                        }
                    }

                ]
            },
            include: includeObj
        }

        filterCondArr.forEach((filterCond, index) => {

            query.where.AND.push({} as any);

            query.where.AND[index + 1][filterCond.filterField] = {
                contains: filterCond.filterString,
                mode: 'insensitive'
            }


        })


        return query


    } else if (location && !businessType) {

        const query = {
            skip: skip,
            take: take,
            where: {
                AND: [
                    {
                        organization: {
                            realmName: realmName
                        }
                    },
                    {
                        location: {

                            locationName: {
                                contains: location,
                                mode: "insensitive"
                            }

                        }
                    }
                ]
            },
            include: includeObj
        }
        filterCondArr.forEach((filterCond, index) => {

            query.where.AND.push({} as any);

            query.where.AND[index][filterCond.filterField] = {
                contains: filterCond.filterString,
                mode: 'insensitive'
            }
        })

        return query
    } else if (!location && businessType) {

        const query = {
            skip: skip,
            take: take,
            where: {
                AND: [
                    {
                        organization: {
                            realmName: realmName
                        }
                    },
                    {
                        businessType: {

                            businessType: {
                                contains: businessType,
                                mode: "insensitive"
                            }

                        }
                    }
                ]
            },
            include: includeObj
        }
        filterCondArr.forEach((filterCond, index) => {

            query.where.AND.push({} as any);

            query.where.AND[index][filterCond.filterField] = {
                contains: filterCond.filterString,
                mode: 'insensitive'
            }
        })

        return query
    } else {
        const query = {
            skip: skip,
            take: take,
            where: {
                AND: [
                    {
                        organization: {
                            realmName: realmName
                        }
                    },
                ]
            },
            include: includeObj
        }
        filterCondArr.forEach((filterCond, index) => {

            query.where.AND.push({} as any);

            query.where.AND[index][filterCond.filterField] = {
                contains: filterCond.filterString,
                mode: 'insensitive'
            }
        })

        return query
    }
}


const queryGeneratorOrg = (realmName, filterCondArr, filterCondRelatedFieldsArr, skip, take, includeObj, userName) => {



    if (userName) {
        const nameArr = userName?.split(" ")
        if (nameArr.length === 1 || 2) {
            const firstName = nameArr[0];
            const lastName = nameArr[1]
            const query = {
                skip: skip,
                take: take,
                where: {
                    AND: [


                        {
                            OR: [
                                {
                                    firstname: {
                                        contains: firstName,
                                        mode: 'insensitive',


                                    }

                                },
                                {
                                    lastname: {
                                        contains: firstName,
                                        mode: 'insensitive',


                                    }
                                },
                                {
                                    firstname: {
                                        contains: firstName,
                                        mode: 'insensitive',


                                    }
                                },
                                {
                                    lastname: {

                                        contains: lastName,
                                        mode: 'insensitive',


                                    }
                                }

                            ]
                        }


                    ]
                },
                include: includeObj
            }

            if (filterCondArr.length == 0) {
                filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                    query.where.AND.push({} as any);

                    if (filterCondition.filterField == "businessType") {
                        query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                            name: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }

                    } else if (filterCondition.filterField == "location") {

                        query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                            locationName: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }
                    } else if (filterCondition.filterField == "entity") {
                        query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                            entityName: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }
                    } else if (filterCondition.filterField == "assignedRole") {
                        query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                            role: {
                                some: {
                                    roleName: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'

                                    }
                                }
                            }
                        }
                    } else {
                        query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                            [filterCondition.filterField]: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }
                    }


                })
            } else {
                filterCondArr.forEach((filterCond, index) => {

                    query.where.AND.push({} as any);

                    query.where.AND[index + 1][filterCond.filterField] = {
                        contains: filterCond.filterString,
                        mode: 'insensitive'
                    }
                    if (index == (filterCondArr.length - 1) && filterCondRelatedFieldsArr.length >= 1) {

                        filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                            query.where.AND.push({} as any);

                            if (filterCondition.filterField == "businessType") {
                                query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                    name: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            } else if (filterCondition.filterField == "location") {

                                query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                    locationName: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            } else if (filterCondition.filterField == "entity") {
                                query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                    entityName: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            } else if (filterCondition.filterField == "assignedRole") {
                                query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                    role: {
                                        some: {
                                            roleName: {
                                                contains: filterCondition.filterString,
                                                mode: 'insensitive'

                                            }
                                        }
                                    }
                                }
                            } else {
                                query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                    [filterCondition.filterField]: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            }


                        })
                    }


                })

            }



            return query

        } else {
            return {}
        }
    } else {


        const query = {
            skip: skip,
            take: take,
            where: {
                AND: [{
                    organization: {
                        realmName: realmName
                    }
                }]
            },
            include: includeObj
        }


        if (filterCondArr.length == 0) {
            filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                query.where.AND.push({} as any);

                if (filterCondition.filterField == "businessType") {

                    query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                        name: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                } else if (filterCondition.filterField == "location") {

                    query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                        locationName: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                } else if (filterCondition.filterField == "entity") {
                    query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                        entityName: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                } else if (filterCondition.filterField == "assignedRole") {
                    query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                        some: {
                            role: {
                                roleName: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'

                                }
                            }
                        }
                    }
                } else {
                    query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                        [filterCondition.filterField]: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                }


            })
        } else {
            filterCondArr.forEach((filterCond, index) => {

                query.where.AND.push({} as any);

                if (filterCond.filterField == "status") {

                    query.where.AND[index][filterCond.filterField] = {

                        equals: Number(filterCond.filterString) == 0 ? false : true,

                    }
                }




                if (index == (filterCondArr.length - 1) && filterCondRelatedFieldsArr.length >= 1) {

                    filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                        query.where.AND.push({} as any);

                        if (filterCondition.filterField == "businessType") {
                            query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                name: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        } else if (filterCondition.filterField == "location") {

                            query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                locationName: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        } else if (filterCondition.filterField == "entity") {
                            query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                entityName: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        } else if (filterCondition.filterField == "assignedRole") {
                            query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                role: {
                                    some: {
                                        roleName: {
                                            contains: filterCondition.filterString,
                                            mode: 'insensitive'

                                        }
                                    }
                                }
                            }
                        } else {
                            query.where.AND[indexB + filterCondArr.length][filterCondition.filterField] = {
                                [filterCondition.filterField]: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        }


                    })
                }


            })

        }

        return query
    }
}


const queryGeneratorUsers = (realmName, filterCondArr, filterCondRelatedFieldsArr, skip, take, includeObj, userName) => {



    if (userName) {
        const nameArr = userName?.split(" ")
        if (nameArr.length === 1 || 2) {
            const firstName = nameArr[0];
            const lastName = nameArr[1]
            const query = {
                skip: skip,
                take: take,
                where: {
                    AND: [

                        {
                            organization: {
                                realmName: realmName
                            }
                        },
                        {
                            OR: [
                                {
                                    firstname: {
                                        contains: firstName,
                                        mode: 'insensitive',


                                    }

                                },
                                {
                                    lastname: {
                                        contains: firstName,
                                        mode: 'insensitive',


                                    }
                                },
                                {
                                    firstname: {
                                        contains: firstName,
                                        mode: 'insensitive',


                                    }
                                },
                                {
                                    lastname: {

                                        contains: lastName,
                                        mode: 'insensitive',


                                    }
                                }

                            ]
                        }


                    ]
                },
                include: includeObj
            }

            if (filterCondArr.length == 0) {
                filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                    query.where.AND.push({} as any);

                    if (filterCondition.filterField == "businessType") {
                        query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                            name: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }

                    } else if (filterCondition.filterField == "location") {

                        query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                            locationName: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }
                    } else if (filterCondition.filterField == "entity") {
                        query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                            entityName: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }
                    } else if (filterCondition.filterField == "assignedRole") {
                        query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                            some: {
                                role: {
                                    roleName: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'

                                    }
                                }
                            }
                        }
                    } else {
                        query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                            [filterCondition.filterField]: {
                                contains: filterCondition.filterString,
                                mode: 'insensitive'
                            }
                        }
                    }


                })
            } else {
                filterCondArr.forEach((filterCond, index) => {

                    query.where.AND.push({} as any);

                    query.where.AND[index + 1][filterCond.filterField] = {
                        contains: filterCond.filterString,
                        mode: 'insensitive'
                    }
                    if (index == (filterCondArr.length - 1) && filterCondRelatedFieldsArr.length >= 1) {

                        filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                            query.where.AND.push({} as any);

                            if (filterCondition.filterField == "businessType") {
                                query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                    name: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            } else if (filterCondition.filterField == "location") {
                                query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                    locationName: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            } else if (filterCondition.filterField == "entity") {
                                query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                    entityName: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            } else if (filterCondition.filterField == "assignedRole") {
                                query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                    some: {
                                        role: {
                                            roleName: {
                                                contains: filterCondition.filterString,
                                                mode: 'insensitive'

                                            }
                                        }
                                    }
                                }
                            } else {
                                query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                    [filterCondition.filterField]: {
                                        contains: filterCondition.filterString,
                                        mode: 'insensitive'
                                    }
                                }
                            }


                        })
                    }


                })

            }



            return query

        } else {
            return {}
        }
    } else {


        const query = {
            skip: skip,
            take: take,
            where: {
                AND: [{
                    organization: {
                        realmName: realmName
                    }
                }]
            },
            include: includeObj
        }


        if (filterCondArr.length == 0) {
            filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                query.where.AND.push({} as any);

                if (filterCondition.filterField == "businessType") {

                    query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                        name: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                } else if (filterCondition.filterField == "location") {

                    query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                        locationName: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                } else if (filterCondition.filterField == "entity") {
                    query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                        entityName: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                } else if (filterCondition.filterField == "assignedRole") {
                    query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                        some: {
                            role: {
                                roleName: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'

                                }
                            }
                        }
                    }
                } else {
                    query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                        [filterCondition.filterField]: {
                            contains: filterCondition.filterString,
                            mode: 'insensitive'
                        }
                    }
                }


            })
        } else {
            filterCondArr.forEach((filterCond, index) => {

                query.where.AND.push({} as any);

                if (filterCond.filterField == "status") {

                    query.where.AND[index + 1][filterCond.filterField] = {

                        equals: Number(filterCond.filterString) == 0 ? false : true,

                    }
                } else {
                    query.where.AND[index + 1][filterCond.filterField] = {

                        contains: filterCond.filterString,
                        mode: "insensitive"

                    }
                }




                if (index == (filterCondArr.length - 1) && filterCondRelatedFieldsArr.length >= 1) {

                    filterCondRelatedFieldsArr.forEach((filterCondition, indexB) => {


                        query.where.AND.push({} as any);

                        if (filterCondition.filterField == "businessType") {
                            query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                name: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        } else if (filterCondition.filterField == "location") {

                            query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                locationName: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        } else if (filterCondition.filterField == "entity") {
                            query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                entityName: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        } else if (filterCondition.filterField == "assignedRole") {
                            query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                some: {
                                    role: {
                                        roleName: {
                                            contains: filterCondition.filterString,
                                            mode: 'insensitive'

                                        }
                                    }
                                }
                            }
                        } else {
                            query.where.AND[indexB + 1 + filterCondArr.length][filterCondition.filterField] = {
                                [filterCondition.filterField]: {
                                    contains: filterCondition.filterString,
                                    mode: 'insensitive'
                                }
                            }
                        }


                    })
                }


            })

        }

        return query
    }
}

