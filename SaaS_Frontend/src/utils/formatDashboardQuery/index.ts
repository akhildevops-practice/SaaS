export function formatDashboardQuery(
  url: string,
  queryParams: any = {},
  nourl?: boolean
) {
  const queryStrings = Object.keys(queryParams)
    .filter(
      (key) =>
        queryParams[key] !== undefined &&
        queryParams[key] !== null &&
        queryParams[key] !== ""
    )
    .flatMap((key) => {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        // Handle array values
        return value.map((v: any) => `${key}[]=${encodeURIComponent(v)}`);
      } else {
        // Handle single value
        return `${key}=${encodeURIComponent(value)}`;
      }
    });

  if (queryStrings.length === 0) {
    return url;
  }

  return nourl
    ? `${queryStrings.join("&")}`
    : `${url}?${queryStrings.join("&")}`;
}

export function formatModernQuery(
  url: string,
  queryParams: any = {},
  nourl?: boolean,
  search?: any,
  page?: any,
  limit?: any
) {
  const queryStrings = Object.keys(queryParams)
    .filter(
      (key) =>
        queryParams[key] !== undefined &&
        queryParams[key] !== null &&
        queryParams[key] !== ""
    )
    .flatMap((key) => {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        // Handle array values
        return value.map((v: any) => `${key}[]=${encodeURIComponent(v)}`);
      } else {
        // Handle single value
        return `${key}=${encodeURIComponent(value)}`;
      }
    });
  let finalUrl;
  if (queryStrings.length === 0) {
    finalUrl = `${url}?page=${page}&limit=${limit}`;
  }

  finalUrl = nourl
    ? `${queryStrings.join("&")}`
    : `${url}?${queryStrings.join("&")}&page=${page}&limit=${limit}`;

  if (
    search !== undefined &&
    search !== "undefined" &&
    search!== ""
  ) {
    finalUrl = `${finalUrl}&search=${search}`;
  }

  return finalUrl
}
