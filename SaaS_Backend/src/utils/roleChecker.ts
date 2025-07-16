
/**
 * 
 * @param userRoles All the roles of the current user
 * @param allowedRoles All the allowed role for the route
 * @returns True or False
 */
export const roleChecker = (userRoles = [], allowedRoles = []) => {

    for (const role of allowedRoles) {
        
        if(userRoles.includes(role)){
            return true
        }
    }
    return false;
}