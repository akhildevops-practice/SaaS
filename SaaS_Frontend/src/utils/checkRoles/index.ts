import parseToken from "../parseToken";
import getToken from "../getToken";
/**
 * This function checks if a specific role is present in the token
 * 
 * @param token This is the token
 * @param {string} checkRole This is the role to be checked
 * @returns a Boolean true or false 
 */

function checkRole(checkRole: string){
  const token = getToken();
  const parsedToken = parseToken(token);
  const roles = parsedToken?.realm_access?.roles
  if(roles){
    if(roles.includes(checkRole)){
      return true
    }
    return false
  }
}

export default checkRole;