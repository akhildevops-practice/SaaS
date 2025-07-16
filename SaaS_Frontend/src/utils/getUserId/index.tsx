/**
 * @method getUserId
 * @description Function to extract user id from session storage
 * @returns a user id
 */
const getUserId = () => {
  const userInfo: any = sessionStorage.getItem("userDetails");
  const parseData = JSON.parse(userInfo);
  return parseData.id;
};

export default getUserId;
