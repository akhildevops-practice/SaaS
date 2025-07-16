export interface IRelationMap {
  // field name
  [key: string]: {
    relationship: string[]; // field relationships
    actions: {
      [key: string]: any; // field actions (contains, mode, etc)
    };
  };
}

/**
 *
 * @param baseKey - base key to use for the filter
 * @param relationKeysArr - array of keys to use for the relation builder
 * @param value - value to use for the filter
 * @returns - returns a filter object
 */
function makeNestedObjFromArray(
  baseKey: string,
  relationKeysArr: string[],
  value: {
    [key: string]: any;
  },
): Object {
  let filters = {};
  if (relationKeysArr.length > 0) {
    // if relation array length is greater than 0,
    filters = (relationKeysArr as string[]).reduceRight(
      (nestedObj, ikey, index) => {
        if (index === relationKeysArr.length - 1) {
          return { [ikey]: { [baseKey]: value } };
        }
        return { [ikey]: nestedObj };
      },
      {},
    );
  } else {
    // if relation array length is 0,
    filters = {
      [baseKey]: value,
    };
  }
  return filters;
}

/**
 *
 * @param filterObj - object with filter key: values
 * @param relationMap - nested relationship map
 * @returns array of filter objects
 *
 */
export function makeFilters<T>(
  filterObj: T,
  relationMap: IRelationMap,
): Object[] {
  const relationFilters: { [key: string]: any }[] = [];
  Object.entries(filterObj).forEach(([key, value]) => {
    const actionsCopy = JSON.stringify(relationMap[key]?.actions);
    if (relationMap.hasOwnProperty(key)) {
      const filters = makeNestedObjFromArray(
        key,
        relationMap[key].relationship,
        JSON.parse(actionsCopy),
      );
      relationFilters.push(filters);
    } else {
      relationFilters.push({
        [key]: value,
      });
    }
  });
  return relationFilters;
}
