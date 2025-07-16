import { HttpException } from '@nestjs/common';

export const createBusinessConfigItem = async (
  businessConfigItem,
  tableOfItem,
  orgId,
) => {
  const itemsToBeDeletedRequests = [];
  const itemsToBeCreatedRequests = [];
  const itemsToBeUpdatedRequests = [];
  /**
   * () creating and updating entity
   */
  let itemsToBeUpdated = [];
  let itemsToBeCreated = [];
  businessConfigItem.filter((en) => {
    if (en.hasOwnProperty('id')) {
      itemsToBeUpdated.push(en);
    } else {
      itemsToBeCreated.push(en);
    }
  }).length > 0;
  if (tableOfItem.name === 'SystemType') {
    for (const item of itemsToBeCreated) {
      itemsToBeCreatedRequests.push(
        tableOfItem.create({
          data: {
            name: item.name,
            color: item.color,
            // default:item.default,
            organization: {
              connect: {
                id: orgId,
              },
            },
          },
        }),
      );
    }
  } else if(tableOfItem.name === 'EntityType'){
    for (const item of itemsToBeCreated) {
      itemsToBeCreatedRequests.push(
        tableOfItem.create({
          data: {
            name: item.name,
            default:item.default,
            organization: {
              connect: {
                id: orgId,
              },
            },
          },
        }),
      );
    }
  } else {
    for (const item of itemsToBeCreated) {
      itemsToBeCreatedRequests.push(
        tableOfItem.create({
          data: {
            name: item.name,
            organization: {
              connect: {
                id: orgId,
              },
            },
          },
        }),
      );
    }
  }
  //Create entityType to be created

  //update what needs to be updated
  if(tableOfItem.name === 'EntityType'){
    for (const item of itemsToBeUpdated) {
      // console.log("item",item)
      itemsToBeUpdatedRequests.push(
        tableOfItem.update({
          where: {
            id: item.id,
          },
          data: {
            name: item.name,
            color: item.color,
            default:item.default,
          },
        }),
      );
    }
  }else{
    for (const item of itemsToBeUpdated) {
      itemsToBeUpdatedRequests.push(
        tableOfItem.update({
          where: {
            id: item.id,
          },
          data: {
            name: item.name,
            color: item.color,
          },
        }),
      );
    }
  }
  

  const createItems = await Promise.all(itemsToBeCreatedRequests);
  const updateItems = await Promise.all(itemsToBeUpdatedRequests);

  //delete what is to be deleted
  const existingEntityData = await tableOfItem.findMany({
    where: {
      organizationId: orgId,
    },
  });

  let itemsToBeDeleted = existingEntityData.filter(
    (item1) => !businessConfigItem.find((item2) => item2.name === item1.name),
  );

  if (itemsToBeDeleted.length !== 0) {
    for (const item of itemsToBeDeleted) {
      itemsToBeDeletedRequests.push(
        tableOfItem.delete({
          where: {
            id: item.id,
          },
        }),
      );
    }
  }

  const deleteItems = await Promise.all(itemsToBeDeletedRequests);
};
