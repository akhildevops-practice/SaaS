/**
 * This function is required to sync the current active route with the side bar icons.
 *
 * @returns {string} url
 */

export const navActiveCheck = () => {
  const url = window.location.pathname;
  return url.split("/")[1];
};

/**
 * This function is required to sync the current active route with the side bar icons, This specifically is for the Sub Menu.
 * @returns {string} url
 */

export const navActiveSubCheck = () => {
  const url = window.location.pathname;
  return url.split("/")[2];
};
