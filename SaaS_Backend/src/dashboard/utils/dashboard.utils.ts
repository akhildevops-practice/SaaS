import { DashboardFilter } from '../dto/dashboard-filter.dto';
interface IKeyType {
  entityName?: string;
  id?: string;
  documentName?: string;
  documentState?: string;
  documentTypeName?: string;
  currentVersion?: string;
  locationName?: string;
  createdBy?: string;
  tags?: string;
  [key: string]: any;
}
// api query key to prisma field map
const keyMapping = {
  department: 'entityName',
  documentId: 'id',
  documentName: 'documentName',
  documentStatus: 'documentState',
  documentType: 'documentTypeName',
  documentVersion: 'currentVersion',
  location: 'locationName',
  creator: 'createdBy',
  documentTag: 'tags',
  readAccess: 'readAccess',
};
export interface IChartInputDataType {
  count: number;
  locationName?: string;
  [key: string]: any;
}
/**
 * @param filterObj - api query object used for filtering the dashboard
 * @returns - array of mapped prisma query filter object [and, or]
 */
export function QueryFilterPreprocessing(filterObj: DashboardFilter) {
  const filterObjPreprocessedAND: IKeyType = {};
  const filterObjPreprocessedOR: IKeyType = {};
  if (filterObj.searchQuery) {
    // if search query is applied, create filter obj for OR operation
    Object.entries(keyMapping).forEach(([_, value]) => {
      filterObjPreprocessedOR[value] = filterObj.searchQuery;
    });
  }
  filterObjPreprocessedAND['createdAt'] = [];
  if (filterObj['documentStartDate']) {
    filterObjPreprocessedAND['createdAt'].push(filterObj.documentStartDate);
  }
  if (filterObj['documentEndDate']) {
    filterObjPreprocessedAND['createdAt'].push(filterObj.documentEndDate);
  }
  if (filterObjPreprocessedAND['createdAt'].length === 0) {
    delete filterObjPreprocessedAND['createdAt'];
  }
  delete filterObj['documentStartDate'];
  delete filterObj['documentEndDate'];
  Object.keys(filterObj).forEach((key) => {
    let mappedKey;
    let value;
    if (key !== 'documentStartDate' && key !== 'documentEndDate') {
      // get mapped key
      mappedKey = keyMapping[key];
    }
    value = filterObj[key];
    if (value !== undefined)
      mappedKey
        ? (filterObjPreprocessedAND[mappedKey] = value) // if mapped key exist set mapped key to value
        : (filterObjPreprocessedAND[key] = value); // else set the key to value
  }); // remove the searchQuery, limit, page - not part of prisma field
  delete filterObjPreprocessedAND['searchQuery'];
  delete filterObjPreprocessedAND['limit'];
  delete filterObjPreprocessedAND['page']; // remove the keys to be used in AND operation from the OR operation obj
  for (let [key, _] of Object.entries(filterObjPreprocessedAND)) {
    delete filterObjPreprocessedOR[key];
  }
  return [filterObjPreprocessedAND, filterObjPreprocessedOR];
}
/**
 *
 * @param field - field name for the chart data
 * @param data - query data for chart field
 * @returns - formated chartjs data for the required field
 */
export function TransformToChartData(
  field: 'documentType' | 'documentState' | 'readAccess' | 'tags',
  data: IChartInputDataType[],
) {
  let labels: Array<string> | Set<string> = [];
  let datasets = [];
  if (field === 'documentState' || field === 'readAccess') {
    let labelIndexMap = {};
    labels = new Set(data.map((item) => item.locationName));
    labels = Array.from(labels);

    labels.forEach((label, index) => {
      labelIndexMap[label] = index;
    });

    const datasetLabels = new Set(data.map((p_item) => p_item[field]));


    datasetLabels.forEach((label) => {
      const countByLocation = Array(Object.keys(labelIndexMap).length).fill(0);
      const childrenSet = data.filter((item) => item[field] === label);

      childrenSet.forEach((item) => {
        countByLocation[labelIndexMap[item.locationName]] += Number(item.count);
      });

      datasets.push({
        label,
        data: countByLocation,
      });
    });

    const toUpdateIndex = datasets.findIndex(
      (item) => item['label'] === 'AMMEND',
    );

    if (toUpdateIndex > -1) {
      const item = datasets[toUpdateIndex];
      item['label'] = 'AMENDED';
      datasets[toUpdateIndex] = item;
    }

    return {
      labels: Array.from(labels),
      datasets,
    };
  }
  if (field === 'documentType') {
    labels = new Set(data.map((item) => item[field]));
    datasets = data.map((p_item) => ({
      label: p_item[field],
      data: (() => {
        const labelData = [];
        data.forEach((item) => {
          if (
            item[field] === p_item[field] &&
            p_item.locationName === item.locationName
          ) {
            labelData.push(Number(item.count));
          }
        });
        return labelData;
      })(),
    }));
    return {
      labels: Array.from(labels),
      datasets,
    };
  }
  if (field === 'tags') {
    labels = new Set(data.map((item) => item[field]));
    datasets = data.map((p_item) => Number(p_item.count));
    return {
      labels: Array.from(labels),
      datasets,
    };
  }
}
/**
 *  Function to flatten the nested obj data for the Dashboard API ONLY!
 * @param nestedObj - nested object to be flattened
 * @param obj - recursive object to be flattened
 * @returns - flatted object in a single level
 */
export function flattenNestedObjToObj(nestedObj, obj = {}) {
  const flattenObj = Object.keys(obj).length > 0 ? obj : {};
  for (let key in nestedObj) {
    if (
      typeof nestedObj[key] === 'object' &&
      nestedObj[key] !== null &&
      !Array.isArray(nestedObj[key])
    ) {
      flattenNestedObjToObj(nestedObj[key], flattenObj);
    } else {
      flattenObj[key] = nestedObj[key];
    }
  }
  return flattenObj;
}
