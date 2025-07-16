//react
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//material-ui

import {
  // Tabs,
  // Tab,
  Box,
  Button,
  useTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

//antd
import { Tabs } from "antd";

//css
import "./temp.css";
import { ReactComponent as SelectedTabArrow } from "assets/icons/SelectedTabArrow.svg";
import ModuleHeader from "../ModuleHeader";
import { MdChevronLeft } from "react-icons/md";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
// import useMediaQuery from "@material-ui/core";
import { useMediaQuery } from "@material-ui/core";

import getSessionStorage from "utils/getSessionStorage";
import checkRoles from "utils/checkRoles";

const { TabPane } = Tabs;
// const matches = useMediaQuery("(min-width:786px)");

type Props = {
  tabs: any;
  activeTab: any;
  setActiveTab: any;
  currentModuleName?: string;
  setCurrentModuleName?: any;
  createHandler?: any;
  configHandler?: any;
  filterHandler?: any;
  handleGraphToggle?: any; //only for audit home page
  graphComponent?: any; // only for audit home page
  mainModuleName?: any;
  refelemetForSettings1?: any;
};

const ModuleNavigation = ({
  tabs,
  activeTab,
  setActiveTab,
  currentModuleName,
  setCurrentModuleName,
  createHandler,
  configHandler,
  filterHandler,
  handleGraphToggle,
  graphComponent,
  mainModuleName = "",
  refelemetForSettings1,
}: Props) => {
  const [optionStatus, setOptionStatus] = useState(false);
  const theme = useTheme();
  const useStyles = makeStyles((theme) => ({
    // "& .ant-tabs-nav": {
    //   backgroundColor: "#efefef !important",
    // },
    tabWrapper: {
      // boxShadow: "0px 7px 9px 5px rgba(0,0,0,0.1)",
      "& .ant-tabs-nav": {
        backgroundColor: "#efefef !important",
      },
      "& .ant-tabs-nav-list .ant-tabs-tab + .ant-tabs-tab": {
        margin: "0 0 0 7px !important",
      },
      // [theme.breakpoints.down('sm')]: {
      //   display: "flex",
      //   FlexDirection:"column"
      // }
    },
    tabStyle: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    docNavIconStyle: {
      // width: "23.88px",
      // height: "20px",
      width: "22px",
      height: "25px",
      // paddingRight: "6px",
      cursor: "pointer",
      // marginLeft: "4x",
    },
    masterNavIconStyle: {
      width: "22px",
      height: "19px",
      // paddingRight: "6px",
      cursor: "pointer",
    },
    auditNavIconStyle: {
      width: "18px",
      height: "18px",
      // paddingRight: "6px",
      cursor: "pointer",
    },
    firstNavIconStyle: {
      width: "23.88px",
      height: "20px",
      // paddingRight: "6px",
      cursor: "pointer",
      marginLeft: "4px",
    },
    docNavDivider: {
      // top: "0.94em",
      height: "1.02em",
      background: "black",
    },
    docNavText: {
      // fontFamily: "Poppins",
      fontWeight: 600,
      fontSize: "16px",
      letterSpacing: "0.3px",
      lineHeight: "24px",
      // color: "#000",
      // marginLeft: "5px",
    },

    selectedTab: {
      color: "#334D6E",
    },
    tabListStyles: {
      position: "absolute",
      display: optionStatus ? "block" : "none",
      boxShadow:
        "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
      backgroundColor: "#ffffff",
      width: "60%",
      margin: "auto",
      top: "-10px",
      right: "0",
      left: "0",
      color: "#ffffff",
      borderRadius: "5px",
    },
  }));
  const matches = useMediaQuery("(min-width:822px)");
  const userDetails = getSessionStorage();
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const classes = useStyles();

  const navigate = useNavigate();
  const params = useParams();
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
    const index = parseInt(activeKey);
    // setCurrentModuleName(tabs[index - 1].moduleHeader);
  };

  // const menuRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const handleClickOutside = (event:any) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setOptionStatus(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  // useEffect(() => {
  //   console.log("checkrisk configHandler", configHandler);
  // }, [configHandler]);

  const handlerMenu = () => {
    if (optionStatus === true) {
      setOptionStatus(false);
    } else {
      setOptionStatus(true);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        marginTop: "10px",
        position: "relative",
      }}
    >
      {/* <div style={{ display: matches ? "none" : "block" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            onClick={() => {
              handlerMenu();
            }}
            style={{
              fontSize: "18px",
              padding: "10px",
              width: "30px",
              height: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#dbecff",
              borderRadius: "5px",
              color: "rgb(53, 118, 186)",
            }}
          >
            <ViewHeadlineIcon style={{ padding: "0px", color: "#00224E" }} />
          </div>{" "}
          <span
            style={{
              fontSize: "20px",
              paddingRight: "10px",
              color: "rgb(53, 118, 186)",
            }}
          >
          
          </span>
        </div>
      </div> */}

      <div
        className={classes.tabWrapper}
        //  style={{ zIndex: matches ? "0" : "10" }}
      >
        <div
          style={{
            display: "flex",
            // padding: "8px 10px",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "8px 10px 8px 10px",
              alignItems: "center",
              cursor: "pointer",
              justifyContent: "flex-start !important",
            }}
          >
            <div
              style={{
                display: "flex",
                // gap: matches ? "0px" : "15px",
                alignItems: "center",
                border: "2px solid #ededed",
                padding: "3px",
                borderRadius: "6px",
                // padding : matches ? "4px 10px 4px 10px" : '4px 10px 4px 10px'
              }}
            >
              {tabs.map((item: any, index: number) => (
                <React.Fragment key={item.key}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 10px 4px 10px",
                      cursor: "pointer !important",
                      borderRadius: "6px",
                      position: "relative",
                      backgroundColor: activeTab === item.key ? "#3576BA" : "",
                      marginRight: index !== tabs.length - 1 ? "7px" : "0px",
                      // width: matches ? "auto" : "180px",
                      // gap: matches ? "0px" : "5px",
                      fontSize: "16px",
                      fontWeight: "400px",
                    }}
                    onClick={() => {
                      if (item?.key !== "2") {
                        sessionStorage.setItem(
                          "selectedLocation",
                          JSON.stringify(null)
                        );
                        sessionStorage.setItem("entityPage", "");
                        sessionStorage.setItem("entitySearch", "");
                        sessionStorage.setItem("searchUserText", "");
                        sessionStorage.setItem("userPage", "");
                        sessionStorage.setItem("userRows", "");
                        sessionStorage.setItem("entityRow", "");
                      } else if (item?.key !== "3") {
                        sessionStorage.setItem(
                          "selectedLocationNew",
                          JSON.stringify(null)
                        );
                        sessionStorage.setItem("entityPage", "");
                        sessionStorage.setItem("entitySearch", "");
                        sessionStorage.setItem(
                          "selectedEntityNew",
                          JSON.stringify(null)
                        );
                        sessionStorage.setItem("searchUserText", "");
                        sessionStorage.setItem("userPage", "");
                        sessionStorage.setItem("userRows", "");
                        sessionStorage.setItem("entityRow", "");
                      }
                      setActiveTab(item.key);
                      setOptionStatus(false);
                      setCurrentModuleName && setCurrentModuleName(item.name);
                    }}
                  >
                    {item.icon}
                    <span
                      className={`${classes.docNavText} ${
                        activeTab === item.key ? classes.selectedTab : ""
                      }`}
                      style={{
                        color: activeTab === item.key ? "white" : "black",
                        // fontWeight: activeTab === item.key ? "100" : "600", // conditional background color
                        marginLeft: "5px",
                        // margin: 0,
                      }}
                    >
                      {item.name}
                    </span>
                    {/* {activeTab === item.key && (
                      <SelectedTabArrow
                        style={{
                          position: "absolute",
                          bottom: -13, // Adjusting the position to account for the arrow size
                          left: "53%",
                          transform: "translateX(-50%)",
                          width: 13,
                          height: 11,
                        }}
                      />
                    )} */}
                  </div>
                </React.Fragment>
              ))}
            </div>
            {mainModuleName == "Risk Settings" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() =>
                  navigate(`/risk/riskregister/${params.riskcategory}`)
                }
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}
            {mainModuleName == "Audit Settings" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/audit`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}
            {mainModuleName == "Mrm Settings" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/mrm`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}
            {mainModuleName == "CIP Settings" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/cip/management`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}
            {mainModuleName == "Hira Configuation" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/risk/riskregister/HIRA`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}
            {mainModuleName == "Aspect Configuration" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/risk/riskregister/AspectImpact`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}
            {mainModuleName == "Document" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/processdocuments/processdocument`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}
            {mainModuleName == "KPI Settings" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/kpi`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}

            {/* {mainModuleName == "Mrm Settings" && (
            <Button
              data-testid="single-form-wrapper-button"
              onClick={() => navigate(`/mrm`)}
              style={{
                marginLeft: "15px",
              }}
            >
              <MdChevronLeft fontSize="small" />
              Back
            </Button>
          )} */}

            {matches === true ? (
              <>
                {mainModuleName == "Audit" && (
                  <div
                    onClick={configHandler}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      // gap: "8px",
                      // justifyContent: "center",
                      // padding: "4px 10px 4px 14px",
                      // cursor: "pointer",
                      // borderRadius: "5px",
                      // position: "relative", // this is needed for the pseudo-element arrow
                      // backgroundColor: tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                    }}
                    ref={refelemetForSettings1}
                  >
                    <OrgSettingsIcon
                    // fill={tabFilter === "inWorkflow" ? "white" : "black"}
                    // className={classes.docNavIconStyle}
                    />
                    <span
                      className={`${classes.docNavText}`}
                      style={{
                        color: "black",
                        // fontWeight: "600", // conditional background color
                      }}
                    >
                      Settings
                    </span>
                  </div>
                )}
              </>
            ) : (
              <></>
            )}

            {mainModuleName == "Hira Register" && configHandler && (
              <div
                onClick={configHandler}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px 4px 10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative", // this is needed for the pseudo-element arrow
                  // backgroundColor: tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                }}
              >
                <OrgSettingsIcon
                // fill={tabFilter === "inWorkflow" ? "white" : "black"}
                // className={classes.docNavIconStyle}
                />
                <span
                  className={`${classes.docNavText}`}
                  style={{
                    color: "black",
                    // fontWeight: "600", // conditional background color
                  }}
                >
                  Settings
                </span>
              </div>
            )}

            {mainModuleName == "Risk Register" && configHandler && (
              <div
                onClick={configHandler}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px 4px 10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative", // this is needed for the pseudo-element arrow
                  // backgroundColor: tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                }}
              >
                <OrgSettingsIcon
                // fill={tabFilter === "inWorkflow" ? "white" : "black"}
                // className={classes.docNavIconStyle}
                />
                <span
                  className={`${classes.docNavText}`}
                  style={{
                    color: "black",
                    // fontWeight: "600", // conditional background color
                  }}
                >
                  Settings
                </span>
              </div>
            )}

            {mainModuleName == "Risk Register" && (
              <div
                onClick={() =>
                  navigate(`/risk/riskregister/AspectImpact/Dashboard`)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px 4px 10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative", // this is needed for the pseudo-element arrow
                  // backgroundColor: tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                }}
              >
                <OrgSettingsIcon
                // fill={tabFilter === "inWorkflow" ? "white" : "black"}
                // className={classes.docNavIconStyle}
                />
                <span
                  className={`${classes.docNavText}`}
                  style={{
                    color: "black",
                    // fontWeight: "600", // conditional background color
                  }}
                >
                  View Dashboard
                </span>
              </div>
            )}
            {mainModuleName == "Objectives & KPI" && (
              <div
                onClick={() => {
                  navigate(`/kpi/Settings`);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px 4px 10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative", // this is needed for the pseudo-element arrow
                  // backgroundColor: tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                }}
              >
                <OrgSettingsIcon
                // fill={tabFilter === "inWorkflow" ? "white" : "black"}
                // className={classes.docNavIconStyle}
                />
                <span
                  className={`${classes.docNavText}`}
                  style={{
                    color: "black",
                    // fontWeight: "600", // conditional background color
                  }}
                >
                  Settings
                </span>
              </div>
            )}
            {mainModuleName == "AuditChecksheets" && (
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/checksheet`)}
                style={{
                  marginLeft: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}

            {/* {mainModuleName == "Findings" && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "auto",
                    cursor: "pointer",
                  }}
                  onClick={handleGraphToggle}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 20px 4px 20px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      position: "relative",
                      order: 1, // Ensure it comes first in the flex container
                    }}
                  >
                    <ExpandIcon
                      className={classes.docNavIconStyle}
                      style={{
                        width: "21px",
                        height: "21px",
                        marginRight: "8px",
                        // marginLeft: "7px",
                      }}
                    />
                    <span
                      className={`${classes.docNavText}`}
                      style={{
                        color: "black",
                        fontWeight: "600", // conditional background color
                      }}
                    >
                      {graphComponent?.open ? "Hide Charts" : "Show Charts"}
                    </span>
                  </div>
                </div>
              </>
            )} */}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <ModuleHeader
          moduleName="Masters"
          createHandler={createHandler}
          filterHandler={filterHandler}
          configHandler={configHandler}
          showSideNav={true}
        />
        {/* <CancelIcon style={{position:"absolute",bottom:"0px", right:"2px",zIndex:"10"}} /> */}
      </div>
      {/* Render the tab content */}
      {tabs.map((item: any) => {
        if (activeTab === item.key) {
          return <div key={item.key}>{item.children}</div>;
        }
        return null;
      })}
    </Box>
  );
};

export default ModuleNavigation;
