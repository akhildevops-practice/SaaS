export const filterGenerator = (query) => {
  const pipeline: any = [
    {
      $match: {},
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ];

  /** Iterating over all the properties from the query object  */
  for (const [key, value] of Object.entries(query)) {
    if (key === 'limit' && Number.isInteger(value)) {
      pipeline.push({ $limit: value });
    } else if (key === 'skip' && Number.isInteger(value)) {
      pipeline.push({ $skip: value });
    } else if (
      key === 'title' &&
      value !== '' &&
      value !== null &&
      value !== undefined
    ) {
      pipeline[0].$match[key] = { $regex: value, $options: 'i' };
    } else if (key !== 'sort' && key !== 'page' && key !== 'title') {
      if (value !== '' && value !== null && value !== undefined) {
        pipeline[0].$match[key] = { $regex: value, $options: 'i' };
      }
    }

    // else {

    //     if(key === "sort") {
    //         pipeline[1][key] = value;
    //     }

    // }
  }

  return pipeline;
};
