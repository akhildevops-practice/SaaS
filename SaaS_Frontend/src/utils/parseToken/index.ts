/**
 * This function parses the token by converting it to the base64
 * 
 * @param token
 * @returns parsed data from the token
 */

function parseToken (token:any) {
  if(token){
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }
}

export default parseToken;
