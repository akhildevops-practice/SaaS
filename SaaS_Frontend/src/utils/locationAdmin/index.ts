import getToken from "../getToken";
import parseToken from "../parseToken";
import capitalizeFirstLetter from "../capitalizeFirstLetter";
import getSessionStorage from "utils/getSessionStorage";

export default function locationAdmin(): string {
  const token = getToken();
  const parsedToken = parseToken(token);
  const userDetails = getSessionStorage();
  // console.log("userDetails in topNavBar", userDetails);

  // console.log("parsedToken", parsedToken);
  const rolesList = [
    "AUDITOR",
    "ENTITY-HEAD",
    "ORG-ADMIN",
    "admin",
    "LOCATION-ADMIN",
    "MR",
  ];

  let roleName = "";

  rolesList.forEach((item) => {
    if (parsedToken.realm_access?.roles?.includes(item)) {
      if (item === "MR") {
        roleName += userDetails?.organization?.applicationAdminTitle
          ? userDetails?.organization?.applicationAdminTitle
          : " IMSC";
      } else if (item === "ORG-ADMIN") {
        roleName += userDetails?.organization?.orgAdminTitle
          ? userDetails?.organization?.orgAdminTitle
          : " MCOE";
      } else {
        roleName += " " + item;
      }
    }
  });

  const roles = roleName.trim().replace("-", " ").split(" ");

  const capitalisedRoles = roles.map((role) => capitalizeFirstLetter(role));

  const locationAdmin = capitalisedRoles.join(" ");

  return locationAdmin;
}
