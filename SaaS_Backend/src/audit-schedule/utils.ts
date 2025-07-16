import { InternalServerErrorException } from '@nestjs/common';

export const getAllAuditorsBasedFilters = async (user, orgId, auditorId) => {
  try {
    const data = await user.findMany({
      where: {
        organizationId: orgId,
        // assignedRole: {
        //   some: {
        //     role: {
        //       roleName: 'AUDITOR',
        //     },
        //   },
        // },
        roleId: { has: auditorId.id },
      },
      include: {
        location: { select: { id: true, locationName: true } },
        entity: { select: { entityName: true, id : true, } },
      },
    });
    return data;
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

export const getAllAuditorsBasedLocationFilters = async (
  user,
  orgId,
  location,
  auditorId,
) => {
  // try {
  const data = await user.findMany({
    where: {
      organizationId: orgId,
      locationId: location,
      // assignedRole: {
      //   some: {
      //     role: {
      //       roleName: 'AUDITOR',
      //     },
      //   },
      // },
      roleId: { has: auditorId.id },
    },
    include: {
      location: { select: { id: true, locationName: true } },
      entity: { select: { entityName: true, id : true, } },
    },
  });
  return data;
  // } catch (error) {
  //   throw new InternalServerErrorException(error);
  // }
};

export const filterAuditorBasedOnDepartment = async (data, dept, text) => {
  try {
    // //console.log("text",text)
    // //console.log("data",data)
    if (text === 'IN') {
      const finalResult = data.filter((value) => {
        if (value.entityId === dept) {
          return value;
        }
      });
      return finalResult;
    }
    if (text === 'NOTIN') {
      const finalResult = data.filter((value) => {
        if (value.entityId !== dept) {
          return value;
        }
      });
      return finalResult;
    }
  } catch (err) {
    throw new InternalServerErrorException(err);
  }
};
export const filterAuditorBasedOnFilterBySystem = async (
  data,
  model,
  orgId,
  system,
) => {
  try {
    const auditProfileData = await model.find({
      organizationId: orgId,
      'systemExpertise.id': {
        $in: system,
      },
    });

    const auditProfileAuditors = auditProfileData.map(
      (value) => value.auditorName.id,
    );

    const finalData = data.filter((value) => {
      if (auditProfileAuditors.includes(value.id)) {
        return value;
      }
    });
    return finalData;
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

export const filterAuditorBasedOnFilterByProficiencies = async (
  data,
  model,
  orgId,
  proficiencies = [],
) => {
  try {
    const auditProfileData = await model.find({
      organizationId: orgId,
      proficiencies: {
        $in: proficiencies,
      },
    });

    const auditProfileAuditors = auditProfileData.map(
      (value) => value.auditorName.id,
    );

    const finalData = data.filter((value) => {
      if (auditProfileAuditors.includes(value.id)) {
        return value;
      }
    });
    return finalData;
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

export const auditorsFromSameDept = async (data, dept) => {
  try {
    const finalResult = data.map((value) => {
      if (value.entityId === dept) {
        return value;
      }
    });
    return finalResult;
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

export const removeAuditorFromSameDept = async (data, dept) => {
  try {
    const finalResult = data.map((value) => {
      if (value.entityId !== dept) {
        return value;
      }
    });
    return finalResult;
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

export const filterByAuditReport = async (model, data, location, orgId) => {
  // try {
  const auditData: any = await model
    .find({ organization: orgId, location })
    .sort({ createdAt: -1 });
  const auditors = auditData[0].auditors;
  const finalresult = data.filter((value) => {
    if (!auditors.includes(value.id)) {
      return value;
    }
  });
  return finalresult;
  // } catch (error) {}
};

export const filterAuditorBasedOnFilterByLocationFunction = async (
  data,
  locationQuery,
  functionQuery,
  auditProfileQuery,
  location,
) => {
  try {
    const locationData = await locationQuery.findFirst({
      where: {
        id: location,
      },
    });
    const functionData = await functionQuery.findMany({
      where: {
        id: { in: locationData.functionId },
      },
    });
    const functionNames = functionData.map((value) => value.name);
    const auditorprofileData = await auditProfileQuery.find({
      functionproficiencies: { $in: functionNames },
    });
    const auditorData = auditorprofileData.map((value) => value.auditorName.id);

    const finalResult = data.filter((value) => {
      return auditorData.includes(value.id);
    });
    return finalResult;
  } catch (err) {
    throw new InternalServerErrorException(err);
  }
};

export const filterBasedOnDept = async (data, dept) => {
  try {
    const finalResult = await data.filter((value) => {
      if (value.entityId === dept) {
        return value;
      }
    });
    return finalResult;
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

export const dateCheckInAuditSchedule = async (data, date, model) => {
  try {
    const auditorId = data.map((value) => value.id);
    let finalResult = [];
    for (let value of data) {
      const auditScheuleData = await model.find({ auditor: value.id });
      if (auditScheuleData.length > 0) {
        const times = auditScheuleData.map((value) => formatDate(value.time));
        if (times.includes(formatDate(date))) {
          finalResult.push({ ...value, conflict: true });
        } else {
          finalResult.push({ ...value, conflict: false });
        }
        // for (let timeTocheck of times) {
        //   if (formatDate(date) === formatDate(timeTocheck)) {
        //     finalResult.push({ ...value, conflict: true });
        //   } else {
        //     finalResult.push({ ...value, conflict: false });
        //   }
        // }
      }
    }
    return finalResult;
    // const auditScheduleData = await model.find({
    //   auditor:{$in:auditorId}
    // })
  } catch (err) {}
};

function formatDate(inputDate) {
  const date = new Date(inputDate);

  // Get day, month, and year components
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-indexed, so add 1
  const year = date.getFullYear();

  // Ensure two-digit formatting (e.g., '01' instead of '1')
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');

  // Create the formatted date string
  const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;

  return formattedDate;
}

export const validateAuditorBasedOnAuditorProfile = async (
  data,
  model,
  auditType,
) => {
  try {
    const auditorDataFromAuditProfile = await model.find({
      'auditType.id': auditType,
    });
    // console.log("checkaudit auditor data validateAuditorBasedOnAuditorProfile", auditorDataFromAuditProfile);

    const auditorData = auditorDataFromAuditProfile.map(
      (value) => value.auditorName.id,
    );
    
    const finalResult = data.filter((value) => auditorData.includes(value.id)).map((auditor) => {
      const auditProfile = auditorDataFromAuditProfile.find(profile => profile.auditorName.id === auditor.id);
      return {
        ...auditor,
        systemExpertise: auditProfile ? auditProfile.systemExpertise : [],
        inLead: auditProfile ? auditProfile.inLead : [],
        functionproficiencies: auditProfile ? auditProfile.functionproficiencies : [],
        proficiencies: auditProfile ? auditProfile.proficiencies : []
      };
    });

    

    return finalResult;
  } catch (err) {
    throw new InternalServerErrorException(err);
  }
};

export const filterBasedDept = async (data, dept, location) => {
  try {
    const finalResult = await data.filter((value) => {
      if (value.entityId === dept && value.locationId === location) {
        return value;
      }
    });
    return finalResult;
  } catch (err) {}
};
export const filterBasedScopeUnit = async (data, unit) => {
  try {
    //console.log("unit",unit)
    const finalResult = data.filter((value) => {
      if (value.locationId !== unit) {
        return value;
      }
    });
    return finalResult;
  } catch (err) {
    throw new InternalServerErrorException(err);
  }
};
