// ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import checkRoles from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";

type ProtectedRouteProps = {
  isProtected?: boolean;
  children: JSX.Element; // Children element to render if access is granted
};

const permissions: any = {
  superAdmin: [{ path: "/settings", matchType: "prefix" }],
  orgAdmin: [{ path: "/master", matchType: "prefix" }],
  mcoe: [
    { path: "/master", matchType: "prefix" },
    { path: "/processdocuments/documenttype", matchType: "exact" },
    { path: "/processdocuments/documenttype/form", matchType: "exact" },
    { path: "/auditsettings", matchType: "prefix" },
    { path: "/audit/auditsettings/auditTypeForm", matchType: "prefix" },
    { path: "/cipsettings", matchType: "prefix" },
    { path: "/cara/settings", matchType: "exact" },
  ],
  imsc: [
    { path: "/master", matchType: "prefix" },
    { path: "/processdocuments/documenttype", matchType: "exact" },
    { path: "/auditsettings", matchType: "prefix" },
    { path: "/audit/auditsettings/auditTypeForm", matchType: "prefix" },
    { path: "/cipsettings", matchType: "prefix" },
    { path: "/cara/settings", matchType: "exact" },
  ],
};

const checkAccess = (role: any, route: any) => {
  if (!role) return false;
  return (
    permissions[role]?.some((permission: any) => {
      if (permission.matchType === "prefix") {
        return route?.startsWith(permission.path);
      } else if (permission.matchType === "exact") {
        return route === permission.path;
      }
      return false;
    }) ?? false
  );
};

const ProtectedRoute = ({
  isProtected = false,
  children,
}: ProtectedRouteProps) => {
  const userDetails = getSessionStorage();
  const isAdmin = checkRoles("admin");
  const isMCOE = checkRoles("ORG-ADMIN") && userDetails?.location?.id;
  const isOrgAdmin = checkRoles("ORG-ADMIN") && !userDetails?.location;
  const isMR = checkRoles("MR");

  const getRole = () => {
    if (isOrgAdmin) {
      return "orgAdmin";
    } else if (isMCOE) {
      return "mcoe";
    } else if (isMR) {
      return "imsc";
    } else if (isAdmin) {
      return "superAdmin";
    }
    return null;
  };

  const userRole = getRole();
  // console.log("checkp user role", userRole);

  const path = window.location.pathname; // Get the current path
  // Check access based on role and current path
  console.log("admin role",isAdmin, isProtected, checkAccess(userRole, path),userRole)

  if (!!isProtected && !checkAccess(userRole, path)) {
    return <Navigate to="/noaccess" replace />;
  }

  // If access is granted, render the children
  return children;
};

export default ProtectedRoute;
