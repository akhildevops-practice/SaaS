
import { axiosKc } from "./axios.global"
export const createRolesInKc = async (roles, token, api) => {
    const singleRolePromise = []

    roles.forEach(async (role) => {
        let newObj = { name: role }

        singleRolePromise.push(axiosKc(api, "POST", token, newObj))

    }
    )

    const rolesResponse = await Promise.all(singleRolePromise)
    const rolesRes = rolesResponse.map((roleRes) => {
        if (roleRes.status != 201) {
            return {
                statusString: "Failed",
                msg: "Roles Creation Failed"
            }
        }
        else {
            return roleRes.status
        }
    })

    return rolesRes

}

export const Error = (err, res, msg?) => {
    const error = JSON.parse(JSON.stringify(err))
    res.status(error.status).send({
        status: err.message,
        message: msg
    });
}


export const getCurrentDate = () => {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const date2 = yyyy + '-' + mm + '-' + dd
    return date2
}

export const createdBy = async (prismaUserTable, prismaTableToBeUpdated, id, req) => {

    const kcUserId = req.user.id


    const userInDb = await prismaUserTable.findFirst({
        where: {
            kcId: {
                contains: kcUserId
            }
        }
    })

    const data = await prismaTableToBeUpdated.update({
        where: {
            id: id
        },
        data: {
            createdBy: userInDb.id
        },
    })

    return data

}

export const createCompositeKey = async (prismaTableToBeUpdated, orgId: string, locationId, entryId: string) => {
    const compositeKey = `${orgId}__${locationId}__${entryId}`

    const data = await prismaTableToBeUpdated.update({
        where: {
            id: entryId
        },
        data: {
            compositeKey: compositeKey
        },
    })

}

export const decodeCompositeKey = (compositeKey: string) => {
    const keysArray = compositeKey.split('__')
    return {
        orgId: keysArray[0],
        locationId: keysArray[1],
        departmentId: keysArray[2],
        entryId: keysArray[3]
    }

}

export const filterOrganizations = async (skip, take, prismaTableToBeFiltered, orgName?, firstName?, lastName?) => {

    //filter when orgName firstName and LastName is provided
    if (orgName && firstName && (!lastName || lastName)) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
                AND: [
                    {
                        organizationName: {
                            contains: orgName,
                            mode: 'insensitive',


                        },
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


                ],
            },
            include: {
                entityType: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                organizationName: "asc"
            }

        })).length


        const data = await prismaTableToBeFiltered.findMany({
            skip: skip,
            take: take,
            where: {
                AND: [
                    {
                        organizationName: {
                            contains: orgName,
                            mode: 'insensitive',


                        },
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


                ],
            },
            include: {
                entityType: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                organizationName: "asc"
            }

        });
        return { data, dataCount }
        //FILTER WHEN ORG NAME,AND ORGAdmin not provided
    } else if (orgName && (!firstName) && (!lastName)) {
        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
                organizationName: {
                    contains: orgName,
                    mode: 'insensitive',


                }
            },
            include: {
                entityType: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                organizationName: "asc"
            }
        })).length
        const data = await prismaTableToBeFiltered.findMany({
            skip: skip,
            take: take,
            where: {
                organizationName: {
                    contains: orgName,
                    mode: 'insensitive',


                }
            },
            include: {
                entityType: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                organizationName: "asc"
            }
        })
        return { data, dataCount }
        //when only orgadmin is provided
    } else if (!orgName && firstName && (!lastName || lastName)) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
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
                                    },
                                ]

                            }

                        }
                    },
                    {
                        user: {
                            some: {
                                OR: [{
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

                ],
            },

            include: {
                entityType: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            },
            orderBy: {
                organizationName: "asc"
            }
        })).length




        const data = await prismaTableToBeFiltered.findMany({
            skip: skip,
            take: take,
            where: {
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
                                    },
                                ]

                            }

                        }
                    },
                    {
                        user: {
                            some: {
                                OR: [{
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

                ],
            },

            include: {
                entityType: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN",
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            },
            orderBy: {
                organizationName: "asc"
            }
        })

        return { data, dataCount }
    }




}

export const filterLocations = async (skip, take, prismaTableToBeFiltered, locationName?, firstName?, lastName?, locationType?) => {

    //when location name ,admin,location type all three are applied
    if (locationName && firstName && (!lastName || lastName) && locationType) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
                AND: [
                    {
                        locationName: {
                            contains: locationName,
                            mode: 'insensitive',


                        },
                    },
                    {
                        locationType: {
                            contains: locationType,
                            mode: 'insensitive'
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


                ],
            },
            include: {

                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            }
        })).length


        const data = await prismaTableToBeFiltered.findMany({
            skip: skip,
            take: take,
            where: {
                AND: [
                    {
                        locationName: {
                            contains: locationName,
                            mode: 'insensitive',


                        },
                    },
                    {
                        locationType: {
                            contains: locationType,
                            mode: 'insensitive'
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


                ],
            },
            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            }
        }

        );
        return { data, dataCount }

        //when locationName, and location type are provided and not admin
    } else if (locationName && (!firstName) && (!lastName) && locationType) {
        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
                AND: [
                    {
                        locationName: {
                            contains: locationName,
                            mode: 'insensitive',

                        }
                    }, {
                        locationType: {
                            contains: locationType,
                            mode: 'insensitive'
                        }
                    }

                ]

            },
            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            }
        })).length
        const data = await prismaTableToBeFiltered.findMany({
            where: {
                AND: [
                    {
                        locationName: {
                            contains: locationName,
                            mode: 'insensitive',

                        }
                    }, {
                        locationType: {
                            contains: locationType,
                            mode: 'insensitive'
                        }
                    }

                ]

            },
            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }
            }
        })
        return { data, dataCount }
        //filter when only orgadmin is provided
    } else if (!locationName && firstName && (!lastName || lastName) && !locationType) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
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
                                    },
                                ]

                            }

                        }
                    },
                    {
                        user: {
                            some: {
                                OR: [{
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

                ],
            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })).length




        const data = await prismaTableToBeFiltered.findMany({
            skip: skip,
            take: take,
            where: {
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
                                    },
                                ]

                            }

                        }
                    },
                    {
                        user: {
                            some: {
                                OR: [{
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

                ],
            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN",
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })

        return { data, dataCount }
        //FILTER WHEN ONLY LOCATIONTYPE IS PROVIDED
    } else if (!locationName && !firstName && (!lastName || lastName) && locationType) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
                AND: [
                    {
                        locationType: {
                            contains: locationType,
                            mode: 'insensitive'
                        }
                    },

                ]

            },

            include: {

                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })).length




        const data = await prismaTableToBeFiltered.findMany({
            skip: skip,
            take: take,
            where: {

                AND: [{
                    locationType: {
                        contains: locationType,
                        mode: 'insensitive'
                    }
                },

                ]

            },

            include: {

                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "ORG-ADMIN",
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })

        return { data, dataCount }
        //FILTER WHEN LOCATION NAME AND ADMIN IS PROVIDED
    } else if (locationName && firstName && (!lastName || lastName) && !locationType) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {

                AND: [
                    {
                        locationName: {
                            contains: locationName,
                            mode: 'insensitive'
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
                                            },
                                        ]

                                    }

                                }
                            },
                            {
                                user: {
                                    some: {
                                        OR: [{
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

                        ],
                    }]

            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })).length




        const data = await prismaTableToBeFiltered.findMany({
            skip: skip,
            take: take,
            where: {

                AND: [{
                    locationName: {
                        contains: locationName,
                        mode: 'insensitive',

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
                                        },
                                    ]

                                }

                            }
                        },
                        {
                            user: {
                                some: {
                                    OR: [{
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

                    ],
                }

                ]

            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN",
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })

        return { data, dataCount }
        //LOCATION TYPE AND ADMIN
    } else if (!locationName && firstName && (!lastName || lastName) && locationType) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {

                AND: [{
                    locationType: {
                        contains: locationType
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
                                        },
                                    ]

                                }

                            }
                        },
                        {
                            user: {
                                some: {
                                    OR: [{
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

                    ],
                }
                ]

            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })).length




        const data = await prismaTableToBeFiltered.findMany({
            where: {

                AND: [{
                    locationType: {
                        contains: locationType
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
                                        },
                                    ]

                                }

                            }
                        },
                        {
                            user: {
                                some: {
                                    OR: [{
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

                    ],
                }
                ]

            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })

        return { data, dataCount }
        //WHEN ONLY LOCATION NAME IS PROVIDED AS A FILTER CRITERIA
    } else if (locationName && !firstName && (!lastName || lastName) && !locationType) {

        const dataCount = (await prismaTableToBeFiltered.findMany({
            where: {
                locationName: {
                    contains: locationName,
                    mode: 'insensitive'
                }
            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })).length




        const data = await prismaTableToBeFiltered.findMany({
            where: {
                locationName: {
                    contains: locationName,
                    mode: 'insensitive'
                }
            },

            include: {
                entity: true,
                businessUnit: true,
                section: true,
                user: {
                    where: {
                        assignedRole: {
                            some: {
                                role: {
                                    roleName: {
                                        equals: "LOCATION-ADMIN"
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        email: true
                    }
                }

            }
        })

        return { data, dataCount }
    }




}

export const duplicateFinder = (arry) => arry.filter((item, index) => arry.indexOf(item) !== index)


