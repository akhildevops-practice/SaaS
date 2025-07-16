/**
 * This function deletes the token from the Session storage
 */

function deleteToken(){
  sessionStorage.removeItem('kc_token');
}

export default deleteToken;