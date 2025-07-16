/**
 * @param str The string that needs to be checked
 * @returns true if special characters used or else returns false
 */

function checkSpecialChar(str: string) {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}

export default checkSpecialChar