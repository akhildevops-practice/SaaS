import { makeStyles, Theme } from "@material-ui/core/styles";
import ModuleNavigation from "../../components/Navigation/ModuleNavigation";

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuditPlan from "pages/AuditHomePage/AuditPlan";
import AuditReport from "pages/AuditHomePage/AuditReport";
import NcSummary from "pages/AuditHomePage/NCSummary";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { useSnackbar } from "notistack";
import { Tooltip, Tour } from "antd";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
} from "@material-ui/core";
import { ReactComponent as AuditPlanIcon } from "assets/moduleIcons/Audit-plan.svg";

import { ReactComponent as AuditReportIcon } from "assets/moduleIcons/Audit-report.svg";
import { ReactComponent as NcSummaryIcon } from "assets/moduleIcons/nc-summary.svg";
import { useRecoilState } from "recoil";
import "./style.css";
// import axios from "axios";
import axios from "apis/axios.global";
import { auditScheduleFormType } from "recoil/atom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  useTheme,
} from "@material-ui/core";
import type { TourProps } from "antd";
import React from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { MdOutlineFormatListBulleted } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import AuditSideNav from "./AuditSideNav";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import AuditSettings from "pages/AuditSettings";

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
  helpTourList: {
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  Buttons: {
    padding: "0px 15px",
    backgroundColor: "white !important",
    cursor: "pointer",
    "&.MuiButton-root": {
      minWidth: "0px",
      backgroundColor: "white !important",
      transition: "none",
    },
    "&.@font-face.MuiButtonBase-root MuiButton-root MuiButton-text makeStyles-Buttons-1452":
      {
        backgroundColor: "white !important",
      },
  },
}));

// export const SharedDataContext = createContext<any>("");
// type SharedData = {
//   propA: any;
//   propB: any;
// };

const AuditHomePage = () => {
  const [currentModuleName, setCurrentModuleName] = useState(
    "Audit Plan Management"
  );
  const [open, setOpen] = useState(false);
  const [graphComponent, setGraphComponent] = useState<any>({
    open: false,
    activeTab: "1",
  });
  const [displayIcon, setDisplayIcon] = useState(false);
  // const [acitveTab, setActiveTab] = useState<any>("1");
  const navigate = useNavigate();
  const classes = useStyles();
  const location = useLocation();
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const isMr = checkRoles(roles.MR);
  const { enqueueSnackbar } = useSnackbar();
  const [tourPopoverVisible, setTourPopoverVisible] = useState<boolean>(false);
  const [mode, setMode] = useState(false);
  //below toggle state to show and hide calendar
  const [view, setView] = useState(false);
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  const [reportOpen, setReportOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("audit-plan");
  const [collapseLevel, setCollapseLevel] = useState(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const matches = useMediaQuery("(min-width:786px)");

  // useEffect(() => {
  //   // console.log("checkaudit -->scheduleformtype ", scheduleFormType);

  //   if (location.state) {
  //     if (location?.state?.redirectToTab === "AUDIT SCHEDULE") {
  //       setActiveTab("2");
  //     } else if (location?.state?.redirectToTab === "AUDIT REPORT") {
  //       setActiveTab("3");
  //     } else if (location?.state?.redirectToTab === "List of Findings") {
  //       setActiveTab("4");
  //     }
  //   } else {
  //     setActiveTab("1");
  //   }
  // }, [location]);

  // useEffect(() => {}, [graphComponent]);

  const [selectCalenderview, setSelectCalenderview] = useState(false);
  const [selectListview, setSelectListview] = useState(true);
  const [selectCardview, setSelectCardview] = useState(false);
  // for tour guide

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const ref7 = useRef(null);

  const refForSchedule1 = useRef(null);
  const refForSchedule2 = useRef(null);
  const refForSchedule3 = useRef(null);
  const refForSchedule4 = useRef(null);
  const refForSchedule5 = useRef(null);
  const refForSchedule6 = useRef(null);
  const refForSchedule7 = useRef(null);
  const refForSchedule8 = useRef(null);
  const refForSchedule9 = useRef(null);
  const refForSchedule10 = useRef(null);

  const refForReport1 = useRef(null);
  const refForReport2 = useRef(null);
  const refForReport3 = useRef(null);
  const refForReport4 = useRef(null);
  const refForReport5 = useRef(null);
  const refForReport6 = useRef(null);
  const refForReport7 = useRef(null);
  // const refForReport8 = useRef(null);

  const refForFindings1 = useRef(null);
  const refForFindings2 = useRef(null);
  const refForFindings3 = useRef(null);
  const refForFindings4 = useRef(null);
  const refForFindings5 = useRef(null);
  const refForFindings6 = useRef(null);
  const refForFindings7 = useRef(null);

  const refForActionItem1 = useRef(null);
  const refForActionItem2 = useRef(null);
  const refForActionItem3 = useRef(null);
  const refForActionItem4 = useRef(null);
  const refForActionItem5 = useRef(null);
  const refForActionItem6 = useRef(null);
  const refForActionItem7 = useRef(null);

  const refForSettings1 = useRef(null);
  const refForSettings2 = useRef(null);
  const refForSettings3 = useRef(null);
  const refForSettings4 = useRef(null);
  const refForSettings5 = useRef(null);

  const [openTour, setOpenTour] = useState<boolean>(false);
  const [openTourForSchedule, setOpenTourForSchedule] =
    useState<boolean>(false);
  const [openTourForReport, setOpenTourForReport] = useState<boolean>(false);
  const [openTourForFindings, setOpenTourForFindings] =
    useState<boolean>(false);
  const [openTourForActionItem, setOpenTourForActionItem] =
    useState<boolean>(false);
  const [openTourForSettings, setOpenTourForSettings] =
    useState<boolean>(false);

  const stepsForSettings: TourProps["steps"] = [
    {
      title: "Settings",
      description:
        " All Audit related configuration are available here. Changes to these configurations can be done by MCOE’s and Unit MR’s",

      target: () => (refForSettings1.current ? refForSettings1.current : null),
    },

    // {
    //   title: "Audit Types",
    //   description:
    //     "MCOE’s can create Audit Types applicable for the organization including who can plan, schedule the audits and the kind of findings that can be created by Auditors for this Audit Type",

    //   target: () => (refForSettings2.current ? refForSettings2.current : null),
    // },
    // {
    //   title: "Audit Checklist",
    //   description:
    //     "This is a repository of the Audit checklist used for Audits. These  checklists can be selected  while scheduling audits and generating audit reports.",
    //   target: () => (refForSettings3.current ? refForSettings3.current : null),
    // },
    // {
    //   title: "Proficiencies",
    //   description:
    //     " Master List of Proficiencies that can be used in Auditpr Profile. These proficiencies can be used as a search criteria to select Auditors during Audit Planning and Scheduling ",
    //   target: () => refForSettings4.current,
    // },
    // {
    //   title: "Auditor Profile",
    //   description:
    //     " This view lists all the auditors in the organization. Use column filters to view Auditors by Unit, System Expertise and Proficiencies. Certification shows a list of certificates obtained by the Auditor",
    //   target: () => refForSettings5.current,
    // },
  ];

  const stepsForActionItem: TourProps["steps"] = [
    {
      title: "Action Item",
      description:
        "All the created action items for a finding can be viewed here",

      target: () =>
        refForActionItem1.current ? refForActionItem1.current : null,
    },
    {
      title: "Location",
      description:
        " Action Item can filtered by units and displayed in the view below , By default , your unit’s  Actions seen, You can change to Actions across ‘All’ units or specific unit",
      target: () =>
        refForActionItem2.current ? refForActionItem2.current : null,
    },
    {
      title: "Year",
      description:
        " By default , this view will show the Action Item created the current year . Click on this link < to see prior year schedule. Use > to move back to the current year",
      target: () => refForActionItem3.current,
    },
  ];

  const stepsForFindings: TourProps["steps"] = [
    {
      title: "List Of Findings",
      description: " List for findings created during audit can be viewed here",

      target: () => (refForFindings1.current ? refForFindings1.current : null),
    },
    {
      title: "Location",
      description:
        "List Of Findings can filtered by units and displayed in the view below , By default , your unit’s Findings are seen, You can change to Findings across ‘All’ units or specific unit",
      target: () => (refForFindings2.current ? refForFindings2.current : null),
    },
    {
      title: "Year",
      description:
        "  By default , this view will show the List Of Findings created the current year . Click on this link < to see prior year schedule. Use > to move back to the current year",
      target: () => refForFindings3.current,
    },
    {
      title: "Icon",
      description:
        " All theList Of Findings created by you (if any) can be viewed here",
      target: () => refForFindings4.current,
    },
    {
      title: "Hyper Link",
      description: "click on this hyperlink to view created Findings",
      target: () => refForFindings5.current,
    },
  ];

  const stepsForReport: TourProps["steps"] = [
    {
      title: "Audit Report",
      description:
        "Ad-hoc audit reports can be created from this tab. All the created audit reports can be viewed here.",

      target: () => (refForReport1.current ? refForReport1.current : null),
    },
    {
      title: "Location",
      description:
        "Audit reports can filtered by units and displayed in the view below , By default , your unit’s reports are seen, You can change to reports across ‘All’ units or specific unit ",
      target: () => (refForReport2.current ? refForReport2.current : null),
    },
    {
      title: "Year",
      description:
        " By default , this view will show the audit reports created the current year . Click on this link < to see prior year schedule. Use > to move back to the current year",
      target: () => refForReport3.current,
    },
    {
      title: "Audit",
      description:
        "All the audit reports created by you (if any) can be viewed here",

      target: () => (refForReport4.current ? refForReport4.current : null),
    },
    {
      title: "HyperLink",
      description: "click on this hyperlink to view created Audit Report",
      target: () => (refForReport5.current ? refForReport5.current : null),
    },
    {
      title: "PDF",
      description: "Click on this icon to download audit report in pdf format",
      target: () => refForReport6.current,
    },
    {
      title: "Checklist",
      description:
        "Click on this icon to download checklist scoring in pdf format",
      target: () => (refForReport7.current ? refForReport7.current : null),
    },
    // {
    //   title: "Year",
    //   description:
    //     " By default , this view will show the audit schedules created the current year . Click on this link < to see prior year schedule. Use > to move back to the current year",
    //   target: () => refForReport8.current,
    // },
  ];

  const stepsForSchedule: TourProps["steps"] = [
    {
      title: "Audit Schedule",
      description:
        "Create and View Audit Schedule by clicking on this link. Schedules can be created for Units , Departments , Corporate Functions and Verticals . Schedules for an Audit Plan can be created from the audit plan view. Adhoc schedules can be created via the Create button",

      target: () => (refForSchedule1.current ? refForSchedule1.current : null),
    },
    {
      title: "Location",
      description:
        "Audit schedules can filtered by units and displayed in the view below , By default , your unit’s schedules are seen, You can change to schedules across ‘All’ units or specific unit",
      target: () => (refForSchedule2.current ? refForSchedule2.current : null),
    },
    {
      title: "Year",
      description:
        " By default , this view will show the audit schedules created the current year . Click on this link < to see prior year schedule. Use > to move back to the current year",
      target: () => refForSchedule3.current,
    },
    {
      title: "Audit Type",
      description:
        " Audit schedules will show for all audit types by default , change the selection to show schedules for a specific audit type",
      target: () => refForSchedule4.current,
    },
    {
      title: "Calender",
      description:
        "  Click on this calendar icon to show the audit schedules in a calendar view, click on this icon to switch back to a table view of the schedule",
      target: () => refForSchedule5.current,
    },
    {
      title: "Auditor or Auditee",
      description:
        " Click on My Audit link to show only those schedules where I am an Auditor or Auditee . In the calendar view , clicking on this link will help the user understand the audit schedule",
      target: () => refForSchedule6.current,
    },
    {
      title: "Hyper Link",
      description: "click on this hyperlink to view created Audit Schedule",
      target: () => refForSchedule7.current,
    },
    {
      title: "Document",
      description:
        "Clicking on PDF link will generate a summary of all the audit reports created for this schedule. consolidated report will appear only after at least one audit report is generated",
      target: () => refForSchedule8.current,
    },
    ...(isOrgAdmin
      ? [
          {
            title: "Edit",
            description: "Click on this link to edit Audit Schedule",
            target: () => refForSchedule9.current,
          },
          {
            title: "Delete",
            description: "Click on this link to delete Audit Schedules",
            target: () => refForSchedule10.current,
          },
        ]
      : []),
  ];

  const steps: TourProps["steps"] = [
    {
      title: "Audit Plan",
      description:
        "Create and View Audit Plan by clicking on this link. Plans can be made for Units , Departments , Corporate Functions and Verticals . MCOE team can define who can create these plans",
      // cover: (
      //   <img
      //     alt="tour.png"
      //     src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
      //   />
      // ),
      target: () => (ref1.current ? ref1.current : null),
    },
    {
      title: "Location",
      description:
        "Plans are filtered by Units and displayed in the view below , By Default , your units plan are seen, You can change to see plans across ‘All’ units or specific unit ",
      target: () => ref2.current,
    },
    {
      title: "Year",
      description:
        " By default , this view will show the audit plans created the current year . Click on this link < to see prior year plans . Use > to move back to the current year",
      target: () => ref3.current,
    },
    {
      title: "Hyper Link",
      description: " click on this hyperlink to view created Audit Plan",
      target: () => ref4.current,
    },
    ...(isOrgAdmin
      ? [
          {
            title: "Delete",
            description: "Click on this link to edit Audit Plan ",
            target: () => ref7.current,
          },
        ]
      : []),
    ...(isOrgAdmin
      ? []
      : [
          {
            title: "Edit",
            description: "Click on this link to edit Audit Plan ",
            target: () => ref5.current,
          },
          {
            title: "Create Audit Schedule",
            description:
              "Create  Audit Schedule by clicking  on this link . These links are seen by those who can create Audit Schedule as specified in settings by MCOE",
            target: () => ref6.current,
          },
        ]),
  ];

  const tabs = [
    {
      key: "1",

      name: (
        <div ref={ref1} style={{ display: "flex", alignItems: "center" }}>
          <AuditPlanIcon
            style={{
              fill: activeTab === "1" ? "white" : "black",
            }}
            className={classes.docNavIconStyle}
          />
          Audit Plan
        </div>
      ),
      children: (
        <div>
          <AuditPlan
            refelemet2={ref2}
            refelemet3={ref3}
            refelemet4={ref4}
            refelemet5={ref5}
            refelemet6={ref6}
            refelemet7={ref7}
            mode={mode}
          />
        </div>
      ),

      moduleHeader: "Audit Plan Management",
    },
    // {
    //   key: "2",
    //   name: (
    //     <div
    //       ref={refForSchedule1}
    //       style={{ display: "flex", alignItems: "center" }}
    //     >
    //       <AuditScheduleIcon
    //         style={{
    //           fill: acitveTab === "2" ? "white" : "black",
    //         }}
    //         className={classes.docNavIconStyle}
    //       />
    //       Audit Schedule
    //     </div>
    //   ),
    //   children: (
    //     <AuditSchedule
    //       view={view}
    //       setView={setView}
    //       refelemetForSchedule2={refForSchedule2}
    //       refelemetForSchedule3={refForSchedule3}
    //       refelemetForSchedule4={refForSchedule4}
    //       refelemetForSchedule5={refForSchedule5}
    //       refelemetForSchedule6={refForSchedule6}
    //       refelemetForSchedule7={refForSchedule7}
    //       refelemetForSchedule8={refForSchedule8}
    //       refelemetForSchedule9={refForSchedule9}
    //       refelemetForSchedule10={refForSchedule10}
    //       mode={mode}
    //       selectCalenderview={selectCalenderview}
    //       selectListview={selectListview}
    //     />
    //   ),
    //   moduleHeader: "Audit Schedule Management",
    // },
    {
      key: "3",
      name: (
        <div
          ref={refForReport1}
          style={{ display: "flex", alignItems: "center" }}
        >
          <AuditReportIcon
            style={{
              fill: activeTab === "3" ? "white" : "black",
            }}
            className={classes.docNavIconStyle}
          />
          Audit Report
        </div>
      ),
      children: (
        <AuditReport
          refelemetForReport2={refForReport2}
          refelemetForReport3={refForReport3}
          refelemetForReport4={refForReport4}
          refelemetForReport5={refForReport5}
          refelemetForReport6={refForReport6}
          refelemetForReport7={refForReport7}
          // refelemetForReport8={refForReport8}
        />
      ),
      moduleHeader: "Audit Report Management",
    },
    {
      key: "4",
      name: (
        <div
          ref={refForFindings1}
          style={{ display: "flex", alignItems: "center" }}
        >
          <NcSummaryIcon
            style={{
              fill: activeTab === "4" ? "white" : "black",
            }}
            className={classes.docNavIconStyle}
          />
          List of Findings
        </div>
      ),

      children: (
        <NcSummary
          graphComponent={graphComponent}
          setGraphComponent={setGraphComponent}
          refelemetForFindings2={refForFindings2}
          refelemetForFindings3={refForFindings3}
          refelemetForFindings4={refForFindings4}
          refelemetForFindings5={refForFindings5}
          refelemetForFindings6={refForFindings6}
        />
      ),
      moduleHeader: "List of Findings Management",
    },
    // {
    //   key: "5",
    //   name: (
    //     <div
    //       ref={refForActionItem1}
    //       style={{ display: "flex", alignItems: "center" }}
    //     >
    //       <ActionItemIcon
    //         style={{
    //           fill: acitveTab === "5" ? "white" : "black",
    //         }}
    //         className={classes.docNavIconStyle}
    //       />
    //       Action Item
    //     </div>
    //   ),
    //   children: <ActionItemView
    //   refelemetForActionItem2 ={refForActionItem2}
    //   refelemetForActionItem3 ={refForActionItem3}
    //   refelemetForActionItem4 ={refForActionItem4}
    //   refelemetForActionItem5 ={refForActionItem5}
    //   refelemetForActionItem6 ={refForActionItem6}
    //   />,
    //   moduleHeader: "Action Item Management",
    // },
  ];
  const mobileTabs = [
    // {
    //   key: "2",
    //   name: "Audit Schedule",
    //   // path: "/master/roles",
    //   icon: (
    //     <AuditScheduleIcon
    //       style={{
    //         fill: acitveTab === "2" ? "white" : "black",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <AuditSchedule view={view} setView={setView} />,
    //   moduleHeader: "Audit Schedule Management",
    // },
    {
      key: "3",
      name: "Audit Report",
      // path: "/master/department",
      icon: (
        <AuditReportIcon
          style={{
            fill: activeTab === "3" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <AuditReport />,
      moduleHeader: "Audit Report Management",
    },
    {
      key: "4",
      name: "List of Findings",
      // path: "/master/user",
      icon: (
        <NcSummaryIcon
          style={{
            fill: activeTab === "4" ? "white" : "black",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: (
        <NcSummary
          graphComponent={graphComponent}
          setGraphComponent={setGraphComponent}
        />
      ),
      moduleHeader: "List of Findings Management",
    },
  ];

  const handleClose = () => {
    setOpen(false);
  };
  const handleReportClose = () => {
    setReportOpen(false);
  };
  const createHandler = async (record: any = {}) => {
    if (activeTab === "1") {
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
    } else if (activeTab === "2") {
      // navigate("/audit/auditschedule/auditscheduleform");
      const isloggedUserCreate = await axios.get(
        "/api/auditSchedule/isLoggedinUsercreateAuditSchedule"
      );

      if (isloggedUserCreate.data) {
        setOpen(true);
      } else
        enqueueSnackbar(`Your are not Authorized to Create Audit Schedule`, {
          variant: "error",
        });
    } else if (activeTab === "3") {
      setReportOpen(true);
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
    setGraphComponent({ open: !graphComponent.open, activeTab: activeTab });
  };
  const handleYes = () => {
    setScheduleFormType("adhoc-create");
    navigate("/audit/auditschedule/auditscheduleform");
  };
  const handleReportYes = () => {
    navigate("/audit/auditreport/newaudit");
  };

  // const sharedData = {
  //   propA: refForSettings2,
  //   propB: refForSettings3,
  // };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("AuditPlan");
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  const handleSettingsClick = () => {
    navigate("/auditsettings");
  };

  const renderComponents = () => {
    return (
      <>
        {activeTab === "audit-plan" ? (
          <AuditPlan
            refelemet2={ref2}
            refelemet3={ref3}
            refelemet4={ref4}
            refelemet5={ref5}
            refelemet6={ref6}
            refelemet7={ref7}
            mode={mode}
            collapseLevel={collapseLevel}
          />
        ) : activeTab === "audit-report" ? (
          <AuditReport
            refelemetForReport2={refForReport2}
            refelemetForReport3={refForReport3}
            refelemetForReport4={refForReport4}
            refelemetForReport5={refForReport5}
            refelemetForReport6={refForReport6}
            refelemetForReport7={refForReport7}
          />
        ) : activeTab === "nc-summary" ? (
          <NcSummary
            graphComponent={graphComponent}
            setGraphComponent={setGraphComponent}
            refelemetForFindings2={refForFindings2}
            refelemetForFindings3={refForFindings3}
            refelemetForFindings4={refForFindings4}
            refelemetForFindings5={refForFindings5}
            refelemetForFindings6={refForFindings6}
          />
        ) : (
          <AuditSettings />
        )}
      </>
    );
  };
  return (
    <>
      {/* <ModuleHeader
        moduleName="Audit Management"
        createHandler={createHandler}
        filterHandler={configHandler}
        configHandler={filterHandler}
        showSideNav={true}
      /> */}
      {/* <div className={classes.floatButtonWrapper}>
        <FloatButton
          onClick={handleGraphToggle}
          icon={<ExpandIcon />}
          description={graphComponent.open ? "Hide Charts" : "Show Charts"}
          shape="square"
          // className={classes.floatButton}
          rootClassName={classes.floatButton}
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div> */}

      {matches ? (
        <>
          <div
            className={classes.root}
            style={{
              display: "flex",
              width: "100%",
              // height: "100vh",
              overflow: "hidden",
              position: "relative", // <- Important
            }}
          >
            <div>
              <AuditSideNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapseLevel={collapseLevel}
                isSettingsAccess={true}
                onSettingsClick={handleSettingsClick}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "absolute",
                top: 4,
                left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
                zIndex: 10,
              }}
            >
              {/* Icon Button */}
              <div
                // style={{
                //   width: 55,
                //   height: 55,
                //   display: "flex",
                //   alignItems: "center",
                //   justifyContent: "center",
                //   backgroundColor: "#fff",
                //   border: "1px solid #ccc",
                //   borderRadius: "12px",
                //   boxShadow: "0 0 4px rgba(0,0,0,0.1)",
                //   cursor: "pointer",
                //   transition: "left 0.3s ease",
                // }}
                style={{
                  // position: "absolute", // <- Makes it float above content
                  // top: 4,
                  left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
                  // zIndex: 10,
                  // backgroundColor: "#fff",
                  // border: "1px solid #ccc",
                  // borderRadius: "50%",
                  width: 55,
                  height: 55,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // boxShadow: "0 0 4px rgba(0,0,0,0.1)",
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

              {/* Label Outside */}
              <span style={{ marginLeft: 3, fontSize: 24, fontWeight: 600 }}>
                {activeTab === "audit-report"
                  ? "Audit Report"
                  : activeTab === "audit-plan"
                  ? "Audit Plan"
                  : activeTab === "nc-summary"
                  ? "List of Findings "
                  : "Audit Settings"}
              </span>
            </div>

            {activeTab === "audit-report" && (
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 16, // Small margin from right edge
                  zIndex: 10,
                }}
              >
                <button
                  style={{
                    padding: "8px 20px",
                    fontSize: "14px",
                    backgroundColor: "#00305d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                  onClick={() => {
                    setReportOpen(true);
                  }}
                >
                  Create
                </button>
              </div>
            )}

            <div style={{ width: collapseLevel === 0 ? "97%" : "100%" }}>
              {renderComponents()}
            </div>
          </div>
        </>
      ) : (
        <div style={{ marginTop: "30px", width: "70%" }}>
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
              <MenuItem value={"AuditPlan"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "AuditPlan" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "AuditPlan" ? "white" : "black",
                  }}
                >
                  {" "}
                  Audit Plan
                </div>
              </MenuItem>
              {/* <MenuItem value={"Schedule"}>
                {" "}
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Schedule" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Schedule" ? "white" : "black",
                  }}
                >
                  Audit Schedule
                </div>
              </MenuItem> */}
              <MenuItem value={"Report"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Report" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Report" ? "white" : "black",
                  }}
                >
                  Audit Report
                </div>
              </MenuItem>
              <MenuItem value={"Findings"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Findings" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Findings" ? "white" : "black",
                  }}
                >
                  List of Findings
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {matches ? null : (
        <div>
          {selectedValue === "AuditPlan" ? (
            <div>
              <AuditPlan
                refelemet2={ref2}
                refelemet3={ref3}
                refelemet4={ref4}
                refelemet5={ref5}
                refelemet6={ref6}
                refelemet7={ref7}
                mode={mode}
              />
            </div>
          ) : (
            ""
          )}

          {/* {selectedValue === "Schedule" ? (
            <div>
              <AuditSchedule
                view={view}
                setView={setView}
                refelemetForSchedule2={refForSchedule2}
                refelemetForSchedule3={refForSchedule3}
                refelemetForSchedule4={refForSchedule4}
                refelemetForSchedule5={refForSchedule5}
                refelemetForSchedule6={refForSchedule6}
                refelemetForSchedule7={refForSchedule7}
                refelemetForSchedule8={refForSchedule8}
                refelemetForSchedule9={refForSchedule9}
                refelemetForSchedule10={refForSchedule10}
                mode={mode}
                selectCalenderview={selectCalenderview}
                selectListview={selectListview}
              />
            </div>
          ) : (
            ""
          )} */}

          {selectedValue === "Report" ? (
            <div>
              <AuditReport
                refelemetForReport2={refForReport2}
                refelemetForReport3={refForReport3}
                refelemetForReport4={refForReport4}
                refelemetForReport5={refForReport5}
                refelemetForReport6={refForReport6}
                refelemetForReport7={refForReport7}
                // refelemetForReport8={refForReport8}
              />
            </div>
          ) : (
            ""
          )}

          {selectedValue === "Findings" ? (
            <div>
              <NcSummary
                graphComponent={graphComponent}
                setGraphComponent={setGraphComponent}
                refelemetForFindings2={refForFindings2}
                refelemetForFindings3={refForFindings3}
                refelemetForFindings4={refForFindings4}
                refelemetForFindings5={refForFindings5}
                refelemetForFindings6={refForFindings6}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      )}

      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <DialogContentText>
            You are about to create Ad-hoc schedule without Plan. Do you want to
            continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            No
          </Button>
          <Button
            // disabled={!isLocAdmin}
            onClick={() => {
              // handleDiscard();
              handleYes();
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullScreen={fullScreen}
        open={reportOpen}
        onClose={handleReportClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <DialogContentText>
            You are about to create Ad-hoc report without Schedule. Do you want
            to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleReportClose} color="primary">
            No
          </Button>
          <Button
            // disabled={!isLocAdmin}
            onClick={() => {
              // handleDiscard();
              handleReportYes();
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {activeTab === "2" ? (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "110px",
            display: "flex",
            gap: "10px",
            backgroundColor: "white",
          }}
          // className={classes.Buttons}
        >
          {selectCalenderview === false ? (
            <Tooltip
              title={"Calendar View"}
              style={{ backgroundColor: "white" }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",

                  backgroundColor: "white",
                }}
                onClick={() => {
                  setSelectCalenderview(true);
                  setSelectListview(false);
                  setSelectCardview(false);
                  setMode(true);
                }}
                className={classes.Buttons}
              >
                <MdOutlineCalendarToday
                  style={{ padding: "0px", margin: "0px" }}
                />
                {/* <img
                  src={calenderview}
                  alt=""
                  style={{ width: "20px", height: "20px" }}
                /> */}
              </div>
            </Tooltip>
          ) : (
            <></>
          )}
          {selectCardview === false ? (
            <Tooltip title={"Board View"} style={{ backgroundColor: "white" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",

                  backgroundColor: "white",
                }}
                onClick={() => {
                  setSelectCardview(true);
                  setSelectListview(false);
                  setSelectCalenderview(false);
                  setMode(false);
                }}
                className={classes.Buttons}
              >
                {/* <img
                  src={boardView}
                  alt=""
                  style={{ width: "20px", height: "20px" }}
                /> */}
                <MdOutlineDashboard style={{ padding: "0px", margin: "0px" }} />
              </div>
            </Tooltip>
          ) : (
            <></>
          )}

          {selectListview === false ? (
            <Tooltip title={"List View"} style={{ backgroundColor: "white" }}>
              <div
                style={{
                  width: "25px",
                  height: "25px",

                  backgroundColor: "white",
                }}
                onClick={() => {
                  setSelectListview(true);
                  setSelectCalenderview(false);
                  setSelectCardview(false);
                  setMode(true);
                }}
                className={classes.Buttons}
              >
                {/* <img
                  src={listview}
                  alt=""
                  style={{ width: "25px", height: "25px" }}
                /> */}
                <MdOutlineFormatListBulleted
                  style={{ padding: "0px", margin: "0px" }}
                />
              </div>
            </Tooltip>
          ) : (
            <></>
          )}
        </div>
      ) : null}

      {/* {selectedValue === "AuditPlan" ? (
        <div
          style={{
            position: "fixed",
            top: matches ? "79px" : "90px",
            right: matches ? "120px" : "30px",
          }}
        >
          {acitveTab === "1" ? (
            <Tooltip
              title={mode ? "Board View" : "List View"}
              style={{ backgroundColor: "white" }}
            >
              {mode ? (
                <MdOutlineDashboard
                  onClick={() => {
                    setMode(!mode);
                  }}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <MdOutlineFormatListBulleted
                  onClick={() => {
                    setMode(!mode);
                  }}
                  style={{ cursor: "pointer" }}
                />
              )}
          
            </Tooltip>
          ) : (
            ""
          )}
         
        </div>
      ) : (
        ""
      )} */}
      {/* <div style={{ position: "fixed", top: "77px", right: "100px" }}>
        <div style={{ marginRight: "20px" }}>
          <Tooltip title="Help Tours!" color="blue">
            <Popover
              content={
                <div>
                  <p
                    className={classes.helpTourList}
                    onClick={() => {
                      setOpenTour(true);
                      setTourPopoverVisible(false);
                    }}
                  >
                    Audit Plan
                  </p>
                  <p
                    className={classes.helpTourList}
                    onClick={() => {
                      {
                        setOpenTourForSchedule(true);
                        setTourPopoverVisible(false);
                      }
                    }}
                  >
                    Audit Schedule
                  </p>
                  <p
                    className={classes.helpTourList}
                    onClick={() => {
                      {
                        setOpenTourForReport(true);
                        setTourPopoverVisible(false);
                      }
                    }}
                  >
                    Audit Report
                  </p>
                  <p
                    className={classes.helpTourList}
                    onClick={() => {
                      {
                        setOpenTourForFindings(true);
                        setTourPopoverVisible(false);
                      }
                    }}
                  >
                    List of Findings
                  </p>
                  <p
                    className={classes.helpTourList}
                    onClick={() => {
                      {
                        setOpenTourForActionItem(true);
                        setTourPopoverVisible(false);
                      }
                    }}
                  >
                    Action Item
                  </p>
                  <p
                    className={classes.helpTourList}
                    onClick={() => {
                      {
                        setOpenTourForSettings(true);
                        setTourPopoverVisible(false);
                      }
                    }}
                  >
                    Settings
                  </p>
                </div>
              }
              trigger="click"
              open={tourPopoverVisible}
              onOpenChange={(visible) => setTourPopoverVisible(visible)}
            ></Popover>

            <MdTouchApp
              style={{ cursor: "pointer" }}
              onClick={() => {
                // setTourPopoverVisible(true);
                setOpenTourForSchedule(true);
              }}
            />
          </Tooltip>
        </div>
      </div> */}

      <Tour open={openTour} onClose={() => setOpenTour(false)} steps={steps} />
      <Tour
        open={openTourForSchedule}
        onClose={() => setOpenTourForSchedule(false)}
        steps={stepsForSchedule}
      />
      <Tour
        open={openTourForReport}
        onClose={() => setOpenTourForReport(false)}
        steps={stepsForReport}
      />
      <Tour
        open={openTourForFindings}
        onClose={() => setOpenTourForFindings(false)}
        steps={stepsForFindings}
      />
      <Tour
        open={openTourForActionItem}
        onClose={() => setOpenTourForActionItem(false)}
        steps={stepsForActionItem}
      />
      <Tour
        open={openTourForSettings}
        onClose={() => setOpenTourForSettings(false)}
        steps={stepsForSettings}
      />

      {/* <SharedDataContext.Provider value={sharedData}>
          <AuditSettings/>
      </SharedDataContext.Provider> */}
    </>
  );
};

export default AuditHomePage;
