import { HttpException } from "@nestjs/common"

export const getUserDetails = async (userArr, prismaUserTable) => {
    const creatorsPromiseArr = []

    //map start
    const creatorDetails = userArr.map(async (creator, index) => {


        const userDetailsPromise = new Promise(async (resolve, reject) => {
            const userDetails = await prismaUserTable.findUnique({
                where: {
                    id: creator
                }
            })
            resolve(userDetails)

        })

        creatorsPromiseArr.push(userDetailsPromise)

        if (index === userArr.length - 1) {
            const result = await Promise.all(creatorsPromiseArr)

            const finalResult = result.map((user) => {
                const name = user.firstname + " " + user.lastname
                return { id: user.id, email: user.email, name: name }
            })
            return finalResult
        }
    })
    //map end
    const detailsResolved = await Promise.all(creatorDetails)

    const finalDetails = detailsResolved.filter((role) => {
        if (role != null || undefined) {
            return true
        }
        return false
    })

    return finalDetails[0]
}


export const doctypeAdminsCreator = async (adminsArray, documentAdminsTable, idOfDocumentTobeLinkedWith, adminType) => {
    try {

     

        for (const creator of adminsArray) {
            

            await documentAdminsTable.create({
                data: {
                    type: adminType,
                    firstname: creator.firstname,
                    lastname: creator.lastname,
                    email: creator.email,
                    user: {
                        connect: {
                            id: creator.userId
                        }
                    },
                    doctype: {
                        connect: {
                            id: idOfDocumentTobeLinkedWith
                        }
                    }

                }
            })

        }

    } catch (err) {
     

        throw new HttpException("Error occured while linking documents with creators,approvers and reviewers", 404)
    }

}

export const adminsSeperators = (documentAdmins) => {
    const creators = []
    const approvers = []
    const reviewers = []
    const readers = []

    documentAdmins.forEach(item => {
        if (item.type == "CREATOR") {
            const name = `${item.firstname} ${item.lastname}`
            const data = {...item,userName:name}
            creators.push(data)
        } else if (item.type == "REVIEWER") {
            const name = `${item.firstname} ${item.lastname}`
            const data = {...item,userName:name}
            reviewers.push(data)
        } else if (item.type == "READER") {
            const name = `${item.firstname} ${item.lastname}`
            const data = {...item,userName:name}
            readers.push(data)
        } else {
            const name = `${item.firstname} ${item.lastname}`
            const data = {...item,userName:name}
            approvers.push(data)
        }
    });

    return {
        creators: creators,
        approvers: approvers,
        reviewers: reviewers,
        readers: readers
    }
}


export const formatDoctypes = (doctypes) => {
    const formattedDoctypes = []
    for (const doctype of doctypes) {

        const documentAdmins = doctype.documentAdmins

        const seperatedAdmins = adminsSeperators(documentAdmins)
        formattedDoctypes.push({ ...doctype, creators: seperatedAdmins.creators, reviewers: seperatedAdmins.reviewers, approvers: seperatedAdmins.approvers, readAccess: { type: doctype.readAccess, usersWithAccess: seperatedAdmins.readers } })

    }

    return formattedDoctypes
}