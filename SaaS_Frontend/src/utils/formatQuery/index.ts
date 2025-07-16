/**
 * This function is used the format the API url according to the filters.
 *
 * @param  {string} url
 * @param  {any} filters
 * @param  {any[]=[]} params
 * @param  {any} newFilterFormat
 *
 * @returns The formatted url.
 */

export default function formatQuery(
  url: string,
  filters: any = {},
  params: any = [],
  newFilterFormat: any = false
) {

  let query = url + "?";
  const construct: string[] = [];
  if (newFilterFormat) {
    const filterString: any = [];
    Object.keys(filters).forEach((param) => {
      // console.log("inside filters", filters, param);
    
      if (filters[param]) {
        filterString.push(`${param}|${filters[param]}`);
      }
    });

    filterString.length && construct.push(`filter=${filterString.join(",")}`);

    const queryParam: [] = params.map((param: any) => {
      return `${param.name}=${param.value}`;
    });
    queryParam.length && construct.push(queryParam.join("&"));

    return `${query}` + construct.join("&");
  } else if (!newFilterFormat) {
    params.forEach((param: string) => {
      // console.log("inside params", params, param);
      if (filters[param]) {
        // if (param === 'status') {
        // let encodedStatus = encodeURIComponent(filters[param]);
        // query += `${param}=${encodedStatus}&`;
        // } else {
        query += `${param}=${filters[param]}&`;
        // }

        // console.log("inside query", query);
      }
    });
    return query;
  }
}
