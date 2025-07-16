/**
 * This function takes the token as argument and stores it in session storage
 *
 * @param token The token that keycloak Provides
 */

function setToken(token: any) {
  sessionStorage.setItem("kc_token", token);
}

export default setToken;
