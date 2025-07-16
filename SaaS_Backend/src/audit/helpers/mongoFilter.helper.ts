import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

export const filterGenerator = (query: any) => {
  const sorting = {
    asc: 1,
    desc: -1,
  };

  const pipeline: any = [
    {
      $match: {},
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
  /** Iterating over all the properties from the query object  */
  for (const [key, value] of Object.entries(query)) {
    if (key === 'location' && value) {
      pipeline[0].$match[key] = String(value);
    } else if (key === 'limit' && Number.isInteger(value)) {
      pipeline.push({ $limit: value });
    } else if (key === 'skip' && Number.isInteger(value)) {
      pipeline.push({ $skip: value });
    } else if (
      key === 'selectedStatus' &&
      value !== undefined &&
      value !== 'undefined'
    ) {
      pipeline[0].$match['isDraft'] = value;
    } else if (key === 'sort' && Boolean(value)) {
      const sort = {};
      const parameters = String(value).split(':');
      sort[parameters[0]] = sorting[parameters[1]];
      pipeline[1].$sort = { ...sort, createdAt: 1 };
    } else if (key === 'status' && Boolean(value)) {
      if (value === 'OPEN')
        pipeline[0].$match['$or'] = [
          { status: 'OPEN' },
          { status: 'IN_PROGRESS' },
        ];
      else {
        pipeline[0].$match[key] = value;
      }
    } else if (
      key === 'selectedAuditee' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['auditees'] = { $in: value };
    } else if (
      key === 'selectedDepartment' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['auditedEntity'] = { $in: value };
    } else if (key === 'user') {
      pipeline[0].$match['$or'] = [
        { auditees: { $in: [value] } },
        { auditors: { $in: [value] } },
      ];
      // pipeline[0].$match['auditees'] = { $in: [value] };
      // pipeline[0].$match['auditors'] = { $in: [value] };
    } else if (
      key === 'selectedSystem' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['system'] = { $in: value };
    } else if (
      key === 'SelectedAuditor' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['auditors'] = { $in: value };
    } else if (
      key === 'selectedStatus' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['status'] = { $in: value };
    } else if (
      key === 'selectedType' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['type'] = { $in: value };
    } else if (
      key === 'selectedAudit' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      const valueArray = value as string[];
      const objectIdArray = valueArray?.map((id) => new ObjectId(id));
      pipeline[0].$match['audit'] = { $in: objectIdArray };
    } else if (
      key === 'selectedDepartment' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['auditedEntity'] = { $in: value };
    } else if (
      key === 'auditTypeNew' &&
      value !== 'undefined' &&
      value !== undefined &&
      value !== '' &&
      value !== 'All'
    ) {
      pipeline[0].$match['auditType'] = { $in: [value] };
    } else if (
      key === 'auditTypeId' &&
      value !== undefined &&
      value !== 'undefined' &&
      value !== '' &&
      value !== 'All'
    ) {
      pipeline[0].$match['auditTypeId'] = value;
    } else if (
      key === 'selectedClause' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['clause.id'] = { $in: value };
    } else if (key === 'system' && value) {
      pipeline[0].$match[key] = new Types.ObjectId(String(value));
    } else if (key === 'auditor' && value !== '') {
      pipeline[0].$match['auditors'] = { $in: [value] };
    } else if (key === 'auditYear' && value) {
      pipeline[0].$match[key] = String(value);
    } else if (key === 'myDept' && value === 'true') {
      pipeline[0].$match['auditedEntity'] = String(query.auditedEntity);
    } else if ((key === 'createdAt' || key === 'date') && value) {
      let val: any = value;

      if (!val.gte && !val.lte) {
        continue;
      }

      pipeline[0].$match[key] = {};

      if (val.gte) {
        pipeline[0].$match[key]['$gte'] = new Date(val.gte);
      }

      if (val.lte) {
        pipeline[0].$match[key]['$lte'] = new Date(val.lte);
      }
    } else if (key === 'clauseNumber' && value) {
      //const val = value.toString();
      pipeline[0].$match['clause.id'] = { $regex: value, $options: 'i' };
    } else if (
      key === 'locIds' &&
      value !== 'undefined' &&
      value !== undefined
    ) {
      pipeline[0].$match['location'] = { $in: value };
    } else if (typeof value === 'boolean') {
      pipeline[0].$match[key] = value;
    } else if (
      key !== 'sort' &&
      key !== 'page' &&
      key !== 'myDept' &&
      key !== 'auditedEntity' &&
      key !== 'auditTypeNew' &&
      key !== 'auditTypeId'
    ) {
      // if (value !== '' && value !== null && value !== undefined) {
      if (value && value !== undefined && value !== 'undefined') {
        // const val = value.toString();
        pipeline[0].$match[key] = { $regex: value, $options: 'i' };
      }
    }
  }
  ////////////////console.log('pipeline', pipeline);
  return pipeline;
};
