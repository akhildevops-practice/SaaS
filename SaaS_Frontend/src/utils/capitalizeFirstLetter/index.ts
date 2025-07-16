/**
 * @param  {string} string
 * 
 * @returns {string} Returns the string it receives with a capital first letter.
 */

function capitalizeFirstLetter(string:string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default capitalizeFirstLetter;