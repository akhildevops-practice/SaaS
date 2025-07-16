import { makeStyles, Theme } from "@material-ui/core/styles";
import ModuleNavigation from "../../components/Navigation/ModuleNavigation";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { useSnackbar } from "notistack";
import KpiReport from "./KpiReport";
import { ReactComponent as AuditReportIcon } from "assets/moduleIcons/Audit-report.svg";
import { useRecoilState } from "recoil";
import "./style.css";
// import axios from "axios";
import axios from "apis/axios.global";
import { auditScheduleFormType } from "recoil/atom";
import ObjectiveTable from "pages/Objectives/ObjectiveTable";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import KpiSideNav from "./KPISideNavBar";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import { FloatButton } from "antd";
const useStyles = makeStyles<Theme>((theme: Theme) => ({
  docNavIconStyle: {
    width: "27px",
    height: "27px",
    // paddingRight: "6px",
    cursor: "pointer",
  },
  floatButtonWrapper: {
    "& .ant-float-btn-default": {
      backgroundColor: "transparent",
      background: "none",
    },
    "& .ant-float-btn": {
      boxShadow: "none",
    },
    "& .ant-float-btn-body:hover": {
      backgroundColor: "transparent",
    },
    "& .ant-float-btn-default .ant-float-btn-body": {
      backgroundColor: "transparent",
    },
  },

  floatButton: {
    color: "#000",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "24px",
    letterSpacing: "0.8px",
    position: "fixed",
    right: "23px",
    top: "146px", //14 for big screem 21 for laptop scren
    bottom: "90vh",
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    "& .ant-float-btn-content": {
      flexDirection: "row-reverse",
    },
    "& .ant-float-btn-content .ant-float-btn-icon": {
      marginLeft: "10px !important",
    },
    "& .ant-float-btn-default .ant-float-btn-body": {
      backgroundColor: "transparent",
    },
  },
  "@global": {
    ":where(.css-dev-only-do-not-override-byeoj0).ant-tabs-top >.ant-tabs-nav, :where(.css-dev-only-do-not-override-byeoj0).ant-tabs-bottom >.ant-tabs-nav, :where(.css-dev-only-do-not-override-byeoj0).ant-tabs-top >div>.ant-tabs-nav, :where(.css-dev-only-do-not-override-byeoj0).ant-tabs-bottom >div>.ant-tabs-nav":
      {
        margin: "0px 0px 5px 0px",
      },
  },
}));
const KpiHomePage = () => {
  const matches = useMediaQuery("(min-width:786px)");
  const [currentModuleName, setCurrentModuleName] = useState(
    "Audit Plan Management"
  );
  const [graphComponent, setGraphComponent] = useState<any>({
    open: false,
    activeTab: "1",
  });
  const [acitveTab, setActiveTab] = useState<any>("1");
  const navigate = useNavigate();
  const classes = useStyles();
  const location = useLocation();
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const isMr = checkRoles(roles.MR);

  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const { enqueueSnackbar } = useSnackbar();

  //below toggle state to show and hide calendar
  const [view, setView] = useState(false);
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );

  useEffect(() => {
    // console.log("checkaudit -->scheduleformtype ", scheduleFormType);

    if (location.state) {
      if (location?.state?.redirectToTab === "KPI Entry") {
        setActiveTab("2");
      }
    } else {
      setActiveTab("1");
    }
  }, [location]);
  // console.log("location.state", location.state);

  useEffect(() => {}, [graphComponent]);
  // const tabs1 = [];
  // if (isMr || isMCOE) {
  //   tabs1.push(
  //     {
  //       key: "1",
  //       name: "KPI",
  //       // path: "/master/unit", //just for information
  //       icon: (
  //         <AuditPlanIcon
  //           style={{
  //             fill: acitveTab === "1" ? "white" : "black",
  //           }}
  //           className={classes.docNavIconStyle}
  //         />
  //       ),
  //       children: <KpiDefinition />,
  //       moduleHeader: "Kpi",
  //     },
  //     {
  //       key: "2",
  //       name: "Report Templates",
  //       // path: "/master/roles",
  //       icon: (
  //         <AuditScheduleIcon
  //           style={{
  //             fill: acitveTab === "2" ? "white" : "black",
  //           }}
  //           className={classes.docNavIconStyle}
  //         />
  //       ),
  //       children: <KpiReportTemplate />,
  //       moduleHeader: "Kpi Report Template",
  //     }
  //   );
  // }

  // tabs1.push({
  //   key: "3",
  //   name: "Reports",
  //   // path: "/master/department",
  //   icon: (
  //     <AuditReportIcon
  //       style={{
  //         fill: acitveTab === "3" ? "white" : "black",
  //       }}
  //       className={classes.docNavIconStyle}
  //     />
  //   ),
  //   children: <KpiReport />,
  //   moduleHeader: "Kpi Report",
  // });

  const tabs = [
    // {
    //   key: "1",
    //   name: "KPI",
    //   // path: "/master/unit", //just for information
    //   icon: (
    //     <AuditPlanIcon
    //       style={{
    //         fill: acitveTab === "1" ? "white" : "black",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <KpiDefinition />,
    //   moduleHeader: "Kpi",
    // },
    // {
    //   key: "2",
    //   name: "Report Templates",
    //   // path: "/master/roles",
    //   icon: (
    //     <AuditScheduleIcon
    //       style={{
    //         fill: acitveTab === "2" ? "white" : "black",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <KpiReportTemplate />,
    //   moduleHeader: "Kpi Report Template",
    // },
    {
      key: "1",
      name: "Objectives",
      // path: "/master/department",
      icon: (
        <AuditReportIcon
          style={{
            fill: acitveTab === "1" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <ObjectiveTable />,
      moduleHeader: "Objectives",
    },
    {
      key: "2",
      name: "KPI Entry",
      // path: "/master/department",
      icon: (
        <AuditReportIcon
          style={{
            fill: acitveTab === "2" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <KpiReport />,
      moduleHeader: "Kpi Report",
    },

    // {
    //   key: "4",
    //   name: "Settings",
    //   // path: "/master/unit", //just for information
    //   icon: (
    //     <AuditPlanIcon
    //       style={{
    //         fill: acitveTab === "4" ? "white" : "black",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <KpiDefinition />,
    //   moduleHeader: "Kpi",
    // },
  ];

  const createHandler = async (record: any = {}) => {
    if (acitveTab === "1") {
      try {
        const isloggedUserCreate = await axios.get(
          "/api/auditPlan/isLoggedinUsercreateAuditPlan"
        );

        if (isloggedUserCreate.data) {
          navigate("/audit/auditplan/auditplanform");
        } else
          enqueueSnackbar(`Your are not Authorized to Create Audit Plan`, {
            variant: "error",
          });
      } catch {
        enqueueSnackbar(`Your are not Authorized to Create Audit Plan`, {
          variant: "error",
        });
      }
    } else if (acitveTab === "2") {
      // navigate("/audit/auditschedule/auditscheduleform");
      const isloggedUserCreate = await axios.get(
        "/api/auditSchedule/isLoggedinUsercreateAuditSchedule"
      );

      if (isloggedUserCreate.data) {
        setScheduleFormType("adhoc-create");
        navigate("/audit/auditschedule/auditscheduleform");
      } else
        enqueueSnackbar(`Your are not Authorized to Create Audit Schedule`, {
          variant: "error",
        });
    } else if (acitveTab === "3") {
      navigate("/audit/auditreport/newaudit");
    }
    // else if (acitveTab === "4") {
    //   navigate("");
    // }
  };

  const configHandler = () => {
    navigate("/auditsettings");
  };

  const filterHandler = () => {};

  const handleGraphToggle = () => {
    setGraphComponent({ open: !graphComponent.open, activeTab: acitveTab });
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Objectives");
  const [collapseLevel, setCollapseLevel] = useState(0);
  // console.log("selectedValue", selectedValue);
  const handleSettingsClick = () => {
    navigate("/kpi/Settings");
  };
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      {matches ? (
        <div
          className={classes.root}
          style={{
            display: "flex",
            width: "100%",
            height: "100vh",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Sidebar Navigation */}
          <KpiSideNav
            activeTab={acitveTab}
            setActiveTab={setActiveTab}
            collapseLevel={collapseLevel}
            isSettingsAccess={true}
            onSettingsClick={handleSettingsClick}
          />

          {/* Collapse Button */}
          <div
            style={{
              position: "absolute",
              top: 4,
              left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
              zIndex: 10,
              width: 55,
              height: 55,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "left 0.3s ease",
            }}
            onClick={() => setCollapseLevel((prev) => (prev + 1) % 3)}
          >
            {collapseLevel === 2 ? (
              <RiSidebarUnfoldLine size={24} />
            ) : (
              <RiSidebarFoldLine size={24} />
            )}
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "0px 16px" }}>
            <div
              className={classes.titleRow}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 3%",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <Typography variant="h5" style={{ fontWeight: 600 }}>
                {acitveTab === "1"
                  ? "Objectives"
                  : acitveTab === "2"
                  ? "KPI Entry"
                  : acitveTab === "settings"
                  ? "KPI Settings"
                  : ""}
              </Typography>

              {/* Add any control buttons here if needed */}
              {/* {acitveTab === "kpi" && (
              // <FloatButton
              //   onClick={handleGraphToggle}
              //   icon={<ExpandIcon />}
              //   description={graphComponent.open ? "Hide Charts" : "Show Charts"}
              //   shape="square"
              //   rootClassName={classes.floatButton}
              //   style={{
              //     display: "flex",
              //     flexDirection: "row-reverse",
              //     alignItems: "center",
              //     justifyContent: "center",
              //   }}
              // />
            )} */}
            </div>

            {/* Render based on tab */}
            {acitveTab === "1" && <ObjectiveTable />}
            {acitveTab === "2" && <KpiReport />}
            {acitveTab === "settings"}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "15px", width: "200px" }}>
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
              <MenuItem value={"Objectives"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Objectives" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Objectives" ? "white" : "black",
                  }}
                >
                  {" "}
                  Objectives
                </div>
              </MenuItem>
              <MenuItem value={"KPIEntry"}>
                {" "}
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "KPIEntry" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "KPIEntry" ? "white" : "black",
                  }}
                >
                  KPI Entry
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {matches ? (
        ""
      ) : (
        <div>
          {selectedValue === "Objectives" ? (
            <div style={{ marginTop: "15px" }}>
              <ObjectiveTable />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "KPIEntry" ? (
            <div style={{ marginTop: "15px" }}>
              <KpiReport />
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default KpiHomePage;
