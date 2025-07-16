//react, react-router, recoil
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

//material-ui
import { Theme, makeStyles } from "@material-ui/core";
//antd
import { Layout } from "antd";

//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import checkRoles from "utils/checkRoles";



//assets
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
//components
import HiraHazardTypesTab from "components/Risk/Hira/HiraConfiguration/HiraHazardTypesTab";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import getSessionStorage from "utils/getSessionStorage";
import HiraAreaMasterTab from "components/Risk/Hira/HiraConfiguration/HiraAreaMasterTab";
import RiskCategoriesListTab from "components/Risk/RiskConfiguration/RiskCategoriesListTab";
import RiskConfigurationForm from "components/Risk/RiskConfiguration/RiskConfigurationForm";

type Props = {};
const { Content, Header } = Layout;
const useStyles = makeStyles((theme: Theme) => ({
  actionHeader: {
    "& .ant-btn-default": {
      backgroundColor: "#e8f3f9",
      borderColor: "#0e497a",
      "& svg": {
        color: "#0e497a",
      },
    },
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  fullformtabs: {
    margin: "14px 3px 0",
    [theme.breakpoints.up("lg")]: {
      height: "90vh", // Adjust the max-height value as needed for large screens
      overflowY: "auto",
    },
    [theme.breakpoints.up("xl")]: {
      height: "80vh",
      overflowY: "auto",
    },
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    // Additional styles for the backButton class
    "&:hover": {
      color: "#003566 !important",
      borderColor: "#003566 !important",
    },
  },
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
}));

const HiraConfigurationPage = ({}: Props) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const params = useParams<any>();
  const id = params.id;
  // const edit = !!id ? true : false;
  const steps = ["Risk Configuration", "Risk Significance Settings"];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const userDetails = getSessionStorage();
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;



  const [loading, setLoading] = useState<boolean>(false);
  const [isHiraConfigExist, setIsHiraConfigExist] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<any>("1");
  const [categoryId, setCategoryId] = useState<any>(false)
  const { enqueueSnackbar } = useSnackbar();
  const goBack = () => {
    navigate("/risk/riskregister/HIRA");
  };

  const onTabsChange = (key: any) => {
    setActiveTabKey(key);
  };


  //tabs for module navigation
  const tabs = [
    {
      key: "1",
      name: "Risk Categories",
      // path: "/master/unit", //just for information
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: (
        <RiskCategoriesListTab
          activeTab={activeTabKey}
          setActiveTab={setActiveTabKey}
          setCategoryId={setCategoryId}
          setIsHiraConfigExist={setIsHiraConfigExist}
          setHiraConfigData={()=>{}}
        />
      ),
      moduleHeader: "Risk Categories Tab",
    },
    // {
    //   key: "2",
    //   name: "Risk Configuration",
    //   // path: "/master/unit", //just for information
    //   icon: (
    //     <AllDocIcon
    //       style={{
    //         fill: activeTabKey === "1" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: (
    //     <HiraConfigurationTab
    //       hiraConfigData={hiraConfigData}
    //       setHiraConfigData={setHiraConfigData}
    //       edit={isHiraConfigExist}
    //       id={categoryId}
          
    //     />
    //   ),
    //   moduleHeader: "Hira Configuration Tab",
    // },
    {
      key: "3",
      name: "Risk Sources",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "2" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <HiraHazardTypesTab />,
      moduleHeader: "Hazard Types Tab",
    },
    {
      key: "4",
      name: "Area Master",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "3" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <HiraAreaMasterTab />,
      moduleHeader: "Area Master Tab",
    },
  ];

  const tabsForMR = [
    {
      key: "1",
      name: "Area Master",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <HiraAreaMasterTab />,
      moduleHeader: "Area Master Tab",
    },
  ];

  return (
    <>
      {/* <Content className={classes.fullformtabs}> */}
      {/* <div style={{ textAlign: "left" }}>
          <Button
            className={classes.backButton} // Apply custom class
            type="default"
            icon={<MdKeyboardArrowLeft />}
            // style={{display : "flex"}}
            onClick={goBack}
          >
            Back
          </Button>
        </div> */}
      <ModuleNavigation
        tabs={isMCOE ? tabs : isMR ? tabsForMR : []}
        activeTab={activeTabKey}
        setActiveTab={setActiveTabKey}
        currentModuleName={`Hira Configuation`}
        createHandler={false}
        configHandler={false}
        filterHandler={false}
        mainModuleName={`Hira Configuation`}
      />
      {/* </Content> */}
    </>
  );
};

export default HiraConfigurationPage;
