/**
 *  This function is used to get the current route
 */

const getAppUrl = () => {
  // eslint-disable-next-line no-restricted-globals
  const link = location.href.split('/');
  const appUrl = link[2].split('.');
  return appUrl[0];
}

export default getAppUrl;