import parseToken from "../parseToken";
import getToken from "../getToken";

/**
 * @param value Access Value (Either true or false)
 * @param action Array of actions
 * @param checkAccess Optional argument, determines whether to look at the token or not for checking access
 * @returns The specific access the role has to actions
 */

function checkActionsAllowed(
  value: any,
  action: string[],
  checkAccess = false
) {
  const access: any = [];
  if (checkAccess) {
    if (!value) return action;
    return [];
  } else {
    const token = getToken();
    const parsedToken = parseToken(token);
    const username = parsedToken?.preferred_username;
    if (username) {
      if (value === username) {
        action.forEach((item) => {
          access.push(item);
        });
      }
    }
    return access;
  }
}

export default checkActionsAllowed;
