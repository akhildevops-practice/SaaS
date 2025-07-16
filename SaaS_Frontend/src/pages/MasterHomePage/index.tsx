// import { ReactComponent as UnitIcon } from "../../assets/icons/unitIcon.svg";

import { makeStyles, Theme } from "@material-ui/core/styles";
import ModuleNavigation from "../../components/Navigation/ModuleNavigation";
import Location from "./Location";
import LocationCorp from "./LocationCorp";
import Departments from "./Departments";
import UserMaster from "./UserMaster";
import MasterRoles from "./MasterRoles";
import SystemMaster from "./SystemMaster";
import UnitMaster from "./UnitMaster";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NewOrganization from "./NewOrganization";
import { ReactComponent as UOMIcon } from "../../assets/icons/uomIcon.svg";
// import { ReactComponent as DepartmentIcon } from "../../assets/icons/department.svg";
// import { ReactComponent as RolesIcon } from "../../assets/icons/rolesIcon.svg";
// import { ReactComponent as SystemIcon } from "../../assets/icons/system.svg";
// import { ReactComponent as UserIcon } from "../../assets/icons/userIcon.svg";
import { useNavigate } from "react-router-dom";
import FunctionsSetting from "pages/MasterHomePage/FunctionsSetting";
import checkRole from "utils/checkRoles";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";

import { ReactComponent as UnitIcon } from "assets/moduleIcons/Unit.svg";
import { ReactComponent as DepartmentIcon } from "assets/moduleIcons/Department.svg";
import { ReactComponent as UserIcon } from "assets/moduleIcons/user.svg";
import { ReactComponent as RolesIcon } from "assets/moduleIcons/roles.svg";
import { ReactComponent as SystemIcon } from "assets/moduleIcons/system.svg";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
import { ReactComponent as DeleteIcon } from "../../assets/documentControl/Delete.svg";
import RecycleBin from "./RecycleBin";
import checkRoles from "../../utils/checkRoles";
import Model from "./Model";
import Parts from "./Parts";
import ProblemsCategory from "./ProblemsCategory";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
} from "@material-ui/core";
const useStyles = makeStyles<Theme>((theme: Theme) => ({
  docNavIconStyle: {
    width: "28px",
    height: "28px",
    // paddingRight: "6px",
    cursor: "pointer",
  },
}));
const MasterHomePage = () => {
  const matches = useMediaQuery("(min-width:822px)");
  const [currentModuleName, setCurrentModuleName] = useState("Unit Management");
  const [acitveTab, setActiveTab] = useState<any>("1");
  const navigate = useNavigate();
  const classes = useStyles();
  const location = useLocation();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [filterOpen, setFilterOpen] = useState(false);
  const [addFlag, setAddFlag] = useState(false);
  const isMr = checkRoles("MR");
  const orgName = getAppUrl();
  const realmName = getAppUrl();
  const [activeModule, setActiveModule] = useState<any>([]);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);

  useEffect(() => {
    if (!!location.state?.redirectToTab) {
      const redirectedTab = location.state.redirectToTab;

      // Check if the redirectedTab exists in dynamic tabs
      const dynamicTab = entityTypes.find((type) => type.id === redirectedTab);

      if (dynamicTab) {
        setActiveTab(dynamicTab.id); // Set dynamic tab
      } else {
        // Handle static tabs
        switch (redirectedTab) {
          case "UNITS":
            setActiveTab("1");
            break;
          case "DEPARTMENTS":
            setActiveTab("2");
            break;
          case "USERS":
            setActiveTab("3");
            break;
          case "ROLES":
            setActiveTab("4");
            break;
          case "SYSTEM":
            setActiveTab("5");
            break;
          case "UOM":
            setActiveTab("6");
            break;
          case "SETTINGS":
            setActiveTab("7");
            break;
          case "MODELS":
            setActiveTab("10");
            break;
          case "PARTS":
            setActiveTab("11");
            break;
          case "Recycle Bin":
            setActiveTab("9");
            break;
          default:
            setActiveTab("1"); // Default tab
        }
      }
    } else {
      setActiveTab("1"); // Default tab if no state is passed
    }
  }, [location, entityTypes]);

  useEffect(() => {
    activeModules();
  }, []);

  const activeModules = async () => {
    const res = await axios(
      `/api/organization/getAllActiveModules/${realmName}`
    );
    const entityTypesRes = await axios.get(
      `api/entity/getEntityTypes/byOrg/${orgName}`
    );
    setEntityTypes(entityTypesRes.data);

    setActiveModule(res.data.activeModules);
  };
  const handleRedirect = (tabKey: any) => {
    navigate("/master", { state: { redirectToTab: tabKey, retain: true } });
  };
  const entityTabs = entityTypes.map((type) => ({
    key: type.id,
    name: type.name,
    icon: (
      <DepartmentIcon
        style={{ fill: acitveTab === type.id ? "white" : "black" }}
        className={classes.docNavIconStyle}
      />
    ),
    children: <Departments type={true} entityType={type.id} />,
    moduleHeader: `${type.name} Management`,
  }));

  // console.log("entityTabs", entityTabs);

  const tabs = [
    // {
    //   key: "8",
    //   name: "Functions",
    //   icon: (
    //     <OrgSettingsIcon
    //       style={{
    //         // stroke: "black",
    //         fill: `${acitveTab === "8" ? "white" : ""}`,
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <FunctionsSetting />,
    //   moduleHeader: "Functions",
    // },

    // {
    //   key: "14",
    //   name: "Corporate Function",
    //   icon: (
    //     <UnitIcon
    //       style={{
    //         fill: acitveTab === "14" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <LocationCorp />,
    //   moduleHeader: "Corporate Function",
    // },
    {
      key: "1",
      name: "Units",
      // path: "/master/unit", //just for information
      icon: (
        <UnitIcon
          style={{
            fill: acitveTab === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <Location />,
      moduleHeader: "Units Management",
    },
    ...entityTabs,
    // {
    //   key: "2",
    //   name: "Dept/Vertical",
    //   // path: "/master/department",
    //   icon: (
    //     <DepartmentIcon
    //       style={{
    //         fill: acitveTab === "2" ? "white" : "black",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <Departments type={false} />,
    //   moduleHeader: "Dept/Vertical Management",
    // },
    activeModule?.includes("CLAIM")
      ? {
          key: "10",
          name: "Models",
          // path: "/master/unit", //just for information
          icon: <AllDocIcon className={classes.docNavIconStyle} />,
          children: (
            <Model filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
          ),
          moduleHeader: "Model Management",
        }
      : "",
    activeModule?.includes("CLAIM")
      ? {
          key: "11",
          name: "Parts",
          // path: "/master/department",
          icon: <AllDocIcon className={classes.docNavIconStyle} />,
          children: (
            <Parts filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
          ),
          moduleHeader: "Parts Management",
        }
      : "",
    activeModule?.includes("CLAIM")
      ? {
          key: "12",
          name: "Problems Category",
          // path: "/master/user",
          icon: <AllDocIcon className={classes.docNavIconStyle} />,
          children: (
            <ProblemsCategory
              addFlag={addFlag}
              setAddFlag={setAddFlag}
              filterOpen={filterOpen}
              setFilterOpen={setFilterOpen}
            />
          ),
          moduleHeader: "Problems Category Management",
        }
      : "",
    {
      key: "3",
      name: "Users",
      // path: "/master/user",
      icon: (
        <UserIcon
          style={{
            fill: acitveTab === "3" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <UserMaster type={false} />,
      moduleHeader: "Users Management",
    },
    {
      key: "4",
      name: "Roles",
      // path: "/master/roles",
      icon: (
        <RolesIcon
          style={{
            fill: acitveTab === "4" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <MasterRoles />,
      moduleHeader: "Roles Management",
    },
    {
      key: "5",
      name: "System",
      // path: "/master/system",
      icon: (
        <SystemIcon
          style={{
            fill: acitveTab === "5" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <SystemMaster />,
      moduleHeader: "Systems Management",
    },
    {
      key: "6",
      name: "UoM",
      // path: "/master/uom",
      icon: (
        <UOMIcon
          style={{
            fill: acitveTab === "6" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <UnitMaster />,
      moduleHeader: "UOMs Management",
    },
    {
      key: "7",
      name: "Settings",
      // path: "/master/uom",
      icon: (
        <OrgSettingsIcon
          style={{
            // stroke: "black",
            fill: `${acitveTab === "7" ? "white" : "  "}`,
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <NewOrganization />,
      moduleHeader: "Settings",
    },

    {
      key: "9",
      name: "Recycle Bin",
      // path: "/master/uom",
      icon: (
        <DeleteIcon
          style={{
            // stroke: "black",
            fill: `${acitveTab === "7" ? "white" : "  "}`,
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <RecycleBin />,
      moduleHeader: "Delete or Restore",
    },
  ];

  const withoutClaimtabs = [
    // {
    //   key: "8",
    //   name: "Functions",
    //   // path: "/master/uom",
    //   icon: (
    //     <OrgSettingsIcon
    //       style={{
    //         fill: `${acitveTab === "8" ? "white" : ""}`,
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <FunctionsSetting />,
    //   moduleHeader: "Functions",
    // },

    // {
    //   key: "14",
    //   name: "Corporate Function",
    //   icon: (
    //     <UnitIcon
    //       style={{
    //         fill: acitveTab === "14" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <LocationCorp />,
    //   moduleHeader: "Corporate Function",
    // },
    {
      key: "1",
      name: "Units",
      // path: "/master/unit", //just for information
      icon: (
        <UnitIcon
          style={{
            fill: acitveTab === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <Location />,
      moduleHeader: "Units Management",
    },
    ...entityTabs,
    // {
    //   key: "2",
    //   name: "Dept/Vertical",
    //   // path: "/master/department",
    //   icon: (
    //     <DepartmentIcon
    //       style={{
    //         fill: acitveTab === "2" ? "white" : "black",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <Departments type={false} />,
    //   moduleHeader: "Dept/Vertical Management",
    // },

    {
      key: "3",
      name: "Users",
      // path: "/master/user",
      icon: (
        <UserIcon
          style={{
            fill: acitveTab === "3" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <UserMaster type={false} />,
      moduleHeader: "Users Management",
    },
    {
      key: "4",
      name: "Roles",
      // path: "/master/roles",
      icon: (
        <RolesIcon
          style={{
            fill: acitveTab === "4" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <MasterRoles />,
      moduleHeader: "Roles Management",
    },
    {
      key: "5",
      name: "System",
      // path: "/master/system",
      icon: (
        <SystemIcon
          style={{
            fill: acitveTab === "5" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <SystemMaster />,
      moduleHeader: "Systems Management",
    },
    {
      key: "6",
      name: "UoM",
      // path: "/master/uom",
      icon: (
        <UOMIcon
          style={{
            fill: acitveTab === "6" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <UnitMaster />,
      moduleHeader: "UOMs Management",
    },
    {
      key: "7",
      name: "Settings",
      // path: "/master/uom",
      icon: (
        <OrgSettingsIcon
          style={{
            // stroke: "black",
            fill: `${acitveTab === "7" ? "white" : "  "}`,
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <NewOrganization />,
      moduleHeader: "Settings",
    },

    {
      key: "9",
      name: "Recycle Bin",
      // path: "/master/uom",
      icon: (
        <DeleteIcon
          style={{
            // stroke: "black",
            fill: `${acitveTab === "7" ? "white" : "  "}`,
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <RecycleBin />,
      moduleHeader: "Delete or Restore",
    },
  ];
  const subtabs = [
    // {
    //   key: "8",
    //   name: "Functions",
    //   icon: (
    //     <OrgSettingsIcon
    //       style={{
    //         // stroke: "black",
    //         fill: `${acitveTab === "8" ? "white" : ""}`,
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <FunctionsSetting />,
    //   moduleHeader: "Functions",
    // },

    // {
    //   key: "14",
    //   name: "Corporate Function",
    //   icon: (
    //     <UnitIcon
    //       style={{
    //         fill: acitveTab === "14" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <LocationCorp />,
    //   moduleHeader: "Corporate Function",
    // },
    {
      key: "1",
      name: "Units",
      // path: "/master/unit", //just for information
      icon: (
        <UnitIcon
          style={{
            fill: acitveTab === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <Location />,
      moduleHeader: "Units Management",
    },
    ...entityTabs,
    // {
    //   key: "2",
    //   name: "Dept/Vertical",
    //   // path: "/master/department",
    //   icon: (
    //     <DepartmentIcon
    //       style={{
    //         fill: acitveTab === "2" ? "white" : "black",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <Departments type={false} />,
    //   moduleHeader: "Dept/Vertical Management",
    // },
    {
      key: "3",
      name: "Users",
      // path: "/master/user",
      icon: (
        <UserIcon
          style={{
            fill: acitveTab === "3" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <UserMaster type={false} />,
      moduleHeader: "Users Management",
    },
    {
      key: "4",
      name: "Roles",
      // path: "/master/roles",
      icon: (
        <RolesIcon
          style={{
            fill: acitveTab === "4" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <MasterRoles />,
      moduleHeader: "Roles Management",
    },
    {
      key: "5",
      name: "System",
      // path: "/master/system",
      icon: (
        <SystemIcon
          style={{
            fill: acitveTab === "5" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <SystemMaster />,
      moduleHeader: "Systems Management",
    },
    {
      key: "6",
      name: "UoM",
      // path: "/master/uom",
      icon: (
        <UOMIcon
          style={{
            fill: acitveTab === "6" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <UnitMaster />,
      moduleHeader: "UOMs Management",
    },
  ];

  const createHandler = (record: any = {}) => {
    const isEntityTab = entityTabs.some((tab) => tab.key === acitveTab);
    const selectedTab: any = entityTabs.find((tab) => tab.key === acitveTab);
    // console.log("selectedtab", selectedTab);
    if (isEntityTab) {
      navigate("/master/department/newdepartment", {
        state: {
          id: selectedTab.key,
          name: selectedTab.name,
          key: selectedTab.key,
        },
      });
    } else if (acitveTab === "1") {
      navigate("/master/unit/newlocation");
    } else if (acitveTab === "2") {
      navigate("/master/department/newdepartment");
    } else if (acitveTab === "3") {
      navigate("/master/user/newuser");
    } else if (acitveTab === "5") {
      navigate("/master/system/create");
    } else if (acitveTab === "6") {
      navigate("/master/uom/newunit");
    } else if (acitveTab === "10") {
      navigate("/master/models/newmodel");
    } else if (acitveTab === "11") {
      navigate("/master/parts/newpart");
    } else if (acitveTab === "12") {
      setAddFlag(true);
    }
  };

  const configHandler = () => {};

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Functions");
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      {/* <ModuleHeader
        moduleName="Masters"
        createHandler={createHandler}
        filterHandler={configHandler}
        configHandler={filterHandler}
        showSideNav={true}
      /> */}
      {matches ? (
        <ModuleNavigation
          tabs={
            isOrgAdmin
              ? activeModule?.includes("CLAIM")
                ? tabs
                : withoutClaimtabs
              : subtabs
          }
          activeTab={acitveTab}
          setActiveTab={setActiveTab}
          currentModuleName={currentModuleName}
          setCurrentModuleName={setCurrentModuleName}
          createHandler={
            (acitveTab === "6" && isMr) || //uom only for mcoe not for mr role
            acitveTab === "8" ||
            acitveTab === "4" ||
            acitveTab === "7" ||
            acitveTab === "9" ||
            (!isOrgAdmin && !isMr)
              ? false
              : acitveTab === "5" && isMr
              ? false
              : createHandler

            // : createHandler
          }
          configHandler={configHandler}
          filterHandler={false}
        />
      ) : (
        <div style={{ marginTop: "15px", padding: "0px 10px" }}>
          <FormControl
            variant="outlined"
            size="small"
            fullWidth
            //  className={classes.formControl}
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <InputLabel>Menu List</InputLabel>
            <Select
              label="Menu List"
              value={selectedValue}
              onChange={handleDataChange}
            >
              {/* <MenuItem value={"Functions"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Functions" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Functions" ? "white" : "black",
                  }}
                >
                  {" "}
                  Functions
                </div>
              </MenuItem>
              <MenuItem value={"Corporate"}>
                {" "}
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Corporate" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Corporate" ? "white" : "black",
                  }}
                >
                  Corporate Function
                </div>
              </MenuItem> */}
              <MenuItem value={"Units"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Units" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Units" ? "white" : "black",
                  }}
                >
                  Units
                </div>
              </MenuItem>
              <MenuItem value={"Dept/Vertical"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Dept/Vertical" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color:
                      selectedValue === "Dept/Vertical" ? "white" : "black",
                  }}
                >
                  Dept/Vertical
                </div>
              </MenuItem>
              <MenuItem value={"Users"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Users" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Users" ? "white" : "black",
                  }}
                >
                  {" "}
                  Users
                </div>
              </MenuItem>
              <MenuItem value={"Roles"}>
                {" "}
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Roles" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Roles" ? "white" : "black",
                  }}
                >
                  Roles
                </div>
              </MenuItem>
              <MenuItem value={"System"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "System" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "System" ? "white" : "black",
                  }}
                >
                  System
                </div>
              </MenuItem>
              <MenuItem value={"UoM"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "UoM" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "UoM" ? "white" : "black",
                  }}
                >
                  UoM
                </div>
              </MenuItem>
              <MenuItem value={"Recycle"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Recycle" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Recycle" ? "white" : "black",
                  }}
                >
                  Recycle Bin
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {matches ? (
        ""
      ) : (
        <div style={{ marginTop: "15px" }}>
          {/* {selectedValue === "Functions" ? (
            <div>
              <FunctionsSetting />
            </div>
          ) : (
            ""
          )}
          {selectedValue === "Corporate" ? (
            <div>
              {" "}
              <LocationCorp />
            </div>
          ) : (
            ""
          )} */}
          {selectedValue === "Units" ? (
            <div>
              {" "}
              <Location />
            </div>
          ) : (
            ""
          )}
          {selectedValue === "Dept/Vertical" ? (
            <div>
              {" "}
              <Departments type={false} />
            </div>
          ) : (
            ""
          )}
          {selectedValue === "Users" ? (
            <div>
              {" "}
              <UserMaster type={false} />
            </div>
          ) : (
            ""
          )}
          {selectedValue === "Roles" ? (
            <div>
              <MasterRoles />
            </div>
          ) : (
            ""
          )}
          {selectedValue === "System" ? (
            <div>
              <SystemMaster />
            </div>
          ) : (
            ""
          )}
          {selectedValue === "UoM" ? (
            <div>
              {" "}
              <UnitMaster />
            </div>
          ) : (
            ""
          )}
          {selectedValue === "Recycle" ? (
            <div>
              <RecycleBin />
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default MasterHomePage;
