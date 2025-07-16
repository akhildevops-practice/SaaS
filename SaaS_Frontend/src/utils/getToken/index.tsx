/**
 * This function retrieves the token from the session storage.
 *
 * @returns token
 */

function getToken() {
  const token = sessionStorage.getItem("kc_token");
  return token;
}

export default getToken;
