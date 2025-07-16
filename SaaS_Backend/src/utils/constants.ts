import { entity } from '../organization/dto/business-config.dto';
export const includeObj = {
  entity: true,
  business: true,
  businessType: true,
  section: true,
  user: {
    where: {
      assignedRole: {
        some: {
          role: {
            roleName: {
              equals: 'ORG-ADMIN',
            },
          },
        },
      },
    },
    select: {
      email: true,
    },
  },
};
export const includeObjLoc = {
  user: {
    where: {
      assignedRole: {
        some: {
          role: {
            roleName: {
              equals: 'LOCATION-ADMIN',
            },
          },
        },
      },
    },
    select: {
      email: true,
    },
  },
  businessType: true,
  business: true,
};
export const includeObjDept = {
  location: {
    select: {
      id: true,
      locationName: true,
    },
  },
  businessType: {
    select: {
      id: true,
      name: true,
    },
  },
  busines: {
    select: {
      id: true,
      name: true,
    },
  },
  section: true,
  entityType: true,
};
export const includeObjUser = {
  assignedRole: true,
  location: true,
};
