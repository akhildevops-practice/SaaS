import { HttpException } from "@nestjs/common";

export const createBusinessConfigItem = async (businessConfigItem, tableOfItem, orgId) => {

    const itemsToBeDeletedRequests = []
    const itemsToBeCreatedRequests = []
    const itemsToBeUpdatedRequests = []

    //delete what is to be deleted
    const existingEntityData = await tableOfItem.findMany({
        where: {
            id: orgId
        }
    })
    let itemsToBeDeleted = existingEntityData.filter(o1 => !businessConfigItem.some(o2 => o1.name === o2.name));

    if (itemsToBeDeleted.length !== 0) {
        for (const item of itemsToBeDeleted) {
            itemsToBeDeletedRequests.push(
                tableOfItem.delete({
                    where: {
                        id: item.id
                    }
                })
            )
        }
    }


    /**
     * () creating and updating entity
     */

    let itemsToBeUpdated = []
    let itemsToBeCreated = []

    businessConfigItem.filter((en) => {
        if (en.hasOwnProperty("id")) {
            itemsToBeUpdated.push(en)
        }
        else {
            itemsToBeCreated.push(en)
        }
    }).length > 0;

    //Create entityType to be created

    for (const item of itemsToBeCreated) {
        const isDuplicate = await tableOfItem.findFirst({
            where: {
                name: item.name
            }
        })
        if (isDuplicate) {
            throw new HttpException("Duplicate entries found while creating entityType", 409)
        } else {
            itemsToBeCreatedRequests.push(
                tableOfItem.create({
                    data: {
                        name: item.name
                    }
                }))


        }
    }
    //update what needs to be updated
    for (const item of itemsToBeCreated) {
        const isDuplicate = await tableOfItem.findFirst({
            where: {
                name: item.name
            }
        })

        if (isDuplicate) {
            throw new HttpException("Duplicate entries found while creating entityType", 409)
        } else {
            itemsToBeUpdatedRequests.push(
                tableOfItem.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        name: item.name
                    }
                })
            )

        }

    }

    const deleteItems = await Promise.all(itemsToBeDeletedRequests)
    const createItems = await Promise.all(itemsToBeCreatedRequests)
    const updateItems = await Promise.all(itemsToBeUpdatedRequests)


}