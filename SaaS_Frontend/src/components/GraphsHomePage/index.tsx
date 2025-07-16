import React, { useEffect, useRef, useState } from "react";
import { MdSpeed } from "react-icons/md";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import KpiGraphs from "components/KpiGraphs";
import KraGraph from "components/KraGraph";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import { MdEqualizer } from "react-icons/md";
import UserStats from "pages/UserStats";
import DocumentDashBoard from "pages/DocumentDashBoard";
import AuditDashboard from "pages/AuditDashboard";
import { ReactComponent as DocControlIcon } from "assets/appsIcon/Doc Control.svg";
import { ReactComponent as CIPIcon } from "assets/appsIcon/cip.svg";
import { ReactComponent as HIRAIcon } from "assets/appsIcon/Hira.svg";
import { ReactComponent as AspImpIcon } from "assets/appsIcon/ASP-IMP.svg";
import { ReactComponent as KPIIcon } from "assets/appsIcon/KPI.svg";
import { ReactComponent as DocumentIcon } from "assets/dashboardIcons/Process-Doc_1.svg";
import { ReactComponent as KPIWhiteIcon } from "assets/dashboardIcons/KPI.svg";
import { ReactComponent as HIRAWhiteIcon } from "assets/dashboardIcons/Hira.svg";
import { ReactComponent as AspImpWhiteIcon } from "assets/dashboardIcons/ASP-IMP.svg";
import CapaDashBoard from "pages/CapaDashBoard";
import CipDashboard from "pages/CipDashboard";
import checkRoles from "utils/checkRoles";
import HiraDashboard from "components/Dashboard/HiraDashboard";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";
// import ObjectiveReportDashboard from "components/ObjectiveReportDashboard";
import SideNavbar from "./SideNavbar";
import { Typography } from "antd";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import ObjectiveReportDashboard from "components/ObjectiveReportDashboard";
import { useLocation, useParams } from "react-router-dom";

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
  root: {
    width: "100%",
    maxHeight: "100%",
    // maxHeight: "calc(80vh - 12vh)",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px",
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    paddingTop: theme.typography.pxToRem(0),
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

const GraphsHomePage = () => {
  const matches = useMediaQuery("(min-width:786px)");
  const [currentModuleName, setCurrentModuleName] = useState("");
  const userDetails = getSessionStorage();
  const classes = useStyles();
  const [activeTab2, setActiveTab2] = useState("Document");
  const [collapseLevel, setCollapseLevel] = useState(0);
  const { Title } = Typography;
  const { id } = useParams();
  const [showShadow, setShowShadow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const realmName = getAppUrl();
  const [activeModule, setActiveModule] = useState<any>([]);

  // console.log("showShadow", showShadow, location.pathname);

  useEffect(() => {
    activeModules();
  }, []);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      const container = scrollRef.current;

      const handleScroll = () => {
        if (container) {
          const scrollTop = container.scrollTop;
          setShowShadow(scrollTop > 0);
        }
      };

      container?.addEventListener("scroll", handleScroll);
      return () => {
        container?.removeEventListener("scroll", handleScroll);
      };
    }
  }, [activeTab2, location.pathname, activeModule]);

  const activeModules = async () => {
    const res = await axios(
      `/api/organization/getAllActiveModules/${realmName}`
    );
    let data = [];
    const isOrgAdmin = checkRoles("ORG-ADMIN");
    const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;

    // if (!!isOrgAdmin || !!isMCOE) {
    //   data = [...res?.data?.activeModules, "User Analytics"];
    // } else {
    //   data = [...res?.data?.activeModules];
    // }
    data = [...res?.data?.activeModules, "User Analytics"];
    setActiveModule([...data]);
  };

  // const tabs = [
  //   activeModule.includes("ProcessDocuments")
  //     ? {
  //         key: "3",
  //         name: "Document",
  //         // path: "/master/unit", //just for information
  //         icon:
  //           acitveTab === "3" ? (
  //             <DocumentIcon className={classes.docNavIconStyle} />
  //           ) : (
  //             <DocControlIcon
  //               style={{
  //                 fill: acitveTab === "3" ? "white" : "black",
  //               }}
  //               className={classes.docNavIconStyle}
  //             />
  //           ),
  //         children: <DocumentDashBoard />,
  //         moduleHeader: "Document",
  //       }
  //     : null,
  //   activeModule.includes("Audit")
  //     ? {
  //         key: "4",
  //         name: "Audit",
  //         // path: "/master/unit", //just for information
  //         icon: (
  //           <MdSpeed
  //             style={{
  //               fill: acitveTab === "4" ? "white" : "black",
  //             }}
  //             className={classes.docNavIconStyle}
  //           />
  //         ),
  //         children: <AuditDashboard />,
  //         moduleHeader: "Audit",
  //       }
  //     : null,
  //   activeModule.includes("Risk")
  //     ? {
  //         key: "5",
  //         name: "Risk",
  //         // path: "/master/roles",
  //         icon:
  //           acitveTab === "5" ? (
  //             <HIRAWhiteIcon className={classes.docNavIconStyle} />
  //           ) : (
  //             <HIRAIcon
  //               style={{
  //                 fill: acitveTab === "5" ? "white" : "black",
  //               }}
  //               className={classes.docNavIconStyle}
  //             />
  //           ),
  //         children: <HiraDashboard />,
  //         moduleHeader: "HIRA",
  //       }
  //     : null,
  //   // activeModule.includes("Risk")
  //   //   ? {
  //   //       key: "6",
  //   //       name: "Aspect Impact",
  //   //       // path: "/master/roles",
  //   //       icon:
  //   //         acitveTab === "6" ? (
  //   //           <AspImpWhiteIcon className={classes.docNavIconStyle} />
  //   //         ) : (
  //   //           <AspImpIcon
  //   //             style={{
  //   //               fill: acitveTab === "6" ? "white" : "black",
  //   //             }}
  //   //             className={classes.docNavIconStyle}
  //   //           />
  //   //         ),
  //   //       children: <AspectImpactDashboardPage />,
  //   //       moduleHeader: "Aspect Impact",
  //   //     }
  //   //   : null,

  //   activeModule.includes("CIP")
  //     ? {
  //         key: "8",
  //         name: "CIP",
  //         // path: "/master/roles",
  //         icon: (
  //           <CIPIcon
  //             style={{
  //               fill: acitveTab === "8" ? "white" : "black",
  //             }}
  //             className={classes.docNavIconStyle}
  //           />
  //         ),
  //         children: <CipDashboard />,
  //         moduleHeader: "Cip",
  //       }
  //     : null,

  //   activeModule.includes("CAPA")
  //     ? {
  //         key: "7",
  //         name: "CAPA",
  //         // path: "/master/roles",
  //         icon: (
  //           <CIPIcon
  //             style={{
  //               fill: acitveTab === "7" ? "white" : "black",
  //             }}
  //             className={classes.docNavIconStyle}
  //           />
  //         ),
  //         children: <CapaDashBoard />,
  //         moduleHeader: "Capa",
  //       }
  //     : null,
  //   activeModule?.includes("Objectives & KPI")
  //     ? {
  //         key: "2",
  //         name: "Objective Report",
  //         // path: "/master/roles",
  //         icon:
  //           acitveTab === "2" ? (
  //             <KPIWhiteIcon className={classes.docNavIconStyle} />
  //           ) : (
  //             <KPIIcon
  //               style={{
  //                 fill: acitveTab === "2" ? "white" : "black",
  //               }}
  //               className={classes.docNavIconStyle}
  //             />
  //           ),
  //         children: <KraGraph />,
  //         moduleHeader: "KRA Report",
  //       }
  //     : null,
  //   activeModule.includes("Objectives & KPI")
  //     ? {
  //         key: "1",
  //         name: "KPI Report",
  //         // path: "/master/unit", //just for information
  //         icon:
  //           acitveTab === "1" ? (
  //             <KPIWhiteIcon className={classes.docNavIconStyle} />
  //           ) : (
  //             <KPIIcon
  //               style={{
  //                 fill: acitveTab === "1" ? "white" : "black",
  //               }}
  //               className={classes.docNavIconStyle}
  //             />
  //           ),
  //         children: <KpiGraphs />,
  //         moduleHeader: "KPI Report",
  //       }
  //     : null,

  //   activeModule.includes("User Analytics")
  //     ? {
  //         key: "9",
  //         name: "User Analytics",
  //         // path: "/master/roles",
  //         icon: (
  //           <MdEqualizer
  //             style={{
  //               fill: acitveTab === "9" ? "white" : "black",
  //             }}
  //             className={classes.docNavIconStyle}
  //           />
  //         ),
  //         children: <UserStats />,
  //         moduleHeader: "User Stats",
  //       }
  //     : null,
  // ].filter((tab) => tab !== null);

  // useEffect(() => {
  //   if (tabs.length > 0 && !acitveTab) {
  //     const firstTab = tabs[0];
  //     if (firstTab) {
  //       setActiveTab(firstTab.key);
  //       setCurrentModuleName(firstTab.name);
  //     }
  //   }
  //   // if(tabs.length && )
  // }, [tabs, acitveTab]);

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("KPIReport");
  console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      {matches ? (
        // <div className={classes.root}>
        //   <ModuleNavigation
        //     tabs={tabs}
        //     activeTab={acitveTab}
        //     setActiveTab={setActiveTab}
        //     currentModuleName={currentModuleName}
        //     setCurrentModuleName={setCurrentModuleName}
        //     filterHandler={false}
        //     // mainModuleName={"KPI Report"}
        //   />
        // </div>

        <div
          // className={classes.root}
          style={{
            display: "flex",
            width: "100%",
            height: "90vh",
            overflow: "hidden",
            position: "relative", // <- Important
            paddingTop: "4px",
          }}
        >
          <SideNavbar
            collapseLevel={collapseLevel}
            activeTab2={activeTab2}
            setActiveTab2={setActiveTab2}
          />

          {/* //---------main components----------------- */}
          <div
            style={{
              flex: 1,
              // height: "100vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 4,
                left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
                width: "100%",
                backgroundColor: "white",
                boxShadow: showShadow
                  ? "0 0 6px 0 rgba(0, 0, 0, 0.25)"
                  : "none",
                // overflow: "hidden",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                onClick={() => setCollapseLevel((prev) => (prev + 1) % 3)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {collapseLevel === 2 ? (
                  <RiSidebarUnfoldLine size={24} />
                ) : (
                  <RiSidebarFoldLine size={24} />
                )}
              </div>
              <div>
                <Title level={3} style={{ fontWeight: 600, margin: "0px 0px" }}>
                  {activeTab2}
                </Title>
              </div>
            </div>
            <div
              ref={scrollRef}
              style={{ flex: 1, overflow: "auto", marginTop: "50px" }}
            >
              {activeTab2 === "Document" ? (
                <div>
                  <DocumentDashBoard />{" "}
                </div>
              ) : null}
              {activeTab2 === "Audit" ? (
                <div>
                  <AuditDashboard />{" "}
                </div>
              ) : null}
              {activeTab2 === "Risk" ? (
                <div>
                  {" "}
                  <HiraDashboard />
                </div>
              ) : null}
              {activeTab2 === "CIP" ? (
                <div>
                  <CipDashboard />{" "}
                </div>
              ) : null}
              {activeTab2 === "CAPA" ? (
                <div>
                  <CapaDashBoard />{" "}
                </div>
              ) : null}
              {activeTab2 === "Objective Report" ? (
                <div>
                  <ObjectiveReportDashboard />
                </div>
              ) : null}
              {activeTab2 === "KPI Report" ? (
                <div>
                  <KpiGraphs />{" "}
                </div>
              ) : null}
              {activeTab2 === "User Analytics" ? (
                <div>
                  <UserStats />{" "}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "15px", width: "70%" }}>
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
              {activeModule.includes("Objectives & KPI") ? (
                <MenuItem value={"KPIReport"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "KPIReport" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "KPIReport" ? "white" : "black",
                    }}
                  >
                    {" "}
                    KPI Report
                  </div>
                </MenuItem>
              ) : null}
              {activeModule?.includes("Objectives & KPI") ? (
                <MenuItem value={"ObjectiveReport"}>
                  {" "}
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "ObjectiveReport"
                          ? "#3576BA"
                          : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color:
                        selectedValue === "ObjectiveReport" ? "white" : "black",
                    }}
                  >
                    Objective Report
                  </div>
                </MenuItem>
              ) : null}

              {activeModule.includes("ProcessDocuments") ? (
                <MenuItem value={"Document"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Document" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Document" ? "white" : "black",
                    }}
                  >
                    Document
                  </div>
                </MenuItem>
              ) : null}

              {activeModule.includes("Audit") ? (
                <MenuItem value={"Audit"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Audit" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Audit" ? "white" : "black",
                    }}
                  >
                    Audit
                  </div>
                </MenuItem>
              ) : null}

              {activeModule.includes("Risk") ? (
                <MenuItem value={"Risk"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Risk" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Risk" ? "white" : "black",
                    }}
                  >
                    Risk
                  </div>
                </MenuItem>
              ) : null}

              {activeModule.includes("Risk") ? (
                <MenuItem value={"AspectImpact"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "AspectImpact" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color:
                        selectedValue === "AspectImpact" ? "white" : "black",
                    }}
                  >
                    Aspect Impact
                  </div>
                </MenuItem>
              ) : null}

              {activeModule.includes("CAPA") ? (
                <MenuItem value={"CAPA"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "CAPA" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "CAPA" ? "white" : "black",
                    }}
                  >
                    CAPA
                  </div>
                </MenuItem>
              ) : null}

              {activeModule.includes("CIP") ? (
                <MenuItem value={"CIP"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "CIP" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "CIP" ? "white" : "black",
                    }}
                  >
                    CIP
                  </div>
                </MenuItem>
              ) : null}

              {activeModule.includes("User Analytics") ? (
                <MenuItem value={"UserAnalytics"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "UserAnalytics" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color:
                        selectedValue === "UserAnalytics" ? "white" : "black",
                    }}
                  >
                    User Analytics
                  </div>
                </MenuItem>
              ) : null}
            </Select>
          </FormControl>
        </div>
      )}

      {matches ? (
        ""
      ) : (
        <div>
          {selectedValue === "KPIReport" ? (
            <div>
              <KpiGraphs />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "ObjectiveReport" ? (
            <div>
              <KraGraph />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "Document" ? (
            <div>
              <DocumentDashBoard />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "Audit" ? (
            <div>
              <AuditDashboard />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "Risk" ? (
            <div>
              <HiraDashboard />
            </div>
          ) : (
            ""
          )}


          {selectedValue === "CAPA" ? (
            <div>
              <CapaDashBoard />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "CIP" ? (
            <div>
              <CipDashboard />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "UserAnalytics" ? (
            <div>
              <UserStats />
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default GraphsHomePage;
