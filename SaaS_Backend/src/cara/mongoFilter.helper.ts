const generateCaraQuery = (filters: any) => {
  const query: any = {};

  // Iterate over filters
  for (const [key, value] of Object.entries(filters)) {
    switch (key) {
      // Handle properties that may be single or array
      case 'caraOwner':
      case 'locationId':
      case 'serialNumber':
      case 'entityId':
      case 'type':
      case 'origin':
        if (Array.isArray(value)) {
          // If value is an array, apply $in operator
          query[key] = { $in: value };
        } else {
          // If it's a single value, directly assign it
          query[key] = value;
        }
        break;
      case 'organizationId':
      case 'kpiId':
      case 'title':
      case 'registeredBy':
      case 'year':
        // For single value properties
        query[key] = value;
        break;

      case 'status':
        // For status with multiple values
        if (Array.isArray(value)) {
          query['status'] = { $in: value };
        } else {
          query['status'] = value;
        }
        break;
      case 'systemId':
      case 'files':
      case 'attachments':
      case 'rootCauseAnalysis':
      case 'containmentAction':
        // For properties which are arrays
        if (Array.isArray(value)) {
          query[key] = { $in: value };
        } else {
          query[key] = value;
        }
        break;
      // Add other specific cases if any
      default:
        break;
    }
  }

  return query;
};
