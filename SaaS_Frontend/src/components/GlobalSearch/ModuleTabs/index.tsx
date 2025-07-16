//react
import { useEffect, useState } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom } from "recoil/atom";

//antd
import { Tabs } from "antd";

//styles
import useStyles from "./style";

//components
import DocumentsTab from "components/GlobalSearch/DocumentTab";
// import ObjectiveTable from "pages/Objectives/ObjectiveTable";

//images
import noResultFoundImage from "assets/images/noresultfound.jpeg";
import ClausesTab from "components/GlobalSearch/ClausesTab";
import NcTab from "components/GlobalSearch/NcTab";
import HiraTab from "components/GlobalSearch/HiraTab";
import CapaTab from "components/GlobalSearch/CapaTab";
import CipTab from "components/GlobalSearch/CipTab";
import RefDocTab from "components/GlobalSearch/RefDocTab";
import AspectImpactTab from "components/GlobalSearch/AspectImpactTab";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
type Props = {
  documentsTableData?: any;
  clausesTableData?: any;
  ncTableData?: any;
  hiraTableData?: any;
  capaData?: any;
  cipData?: any;
  refDocData?: any;
  aspImpTableData?: any;
  searchValue?: string;
};

const ModuleTabs = ({
  documentsTableData = [],
  clausesTableData = [],
  ncTableData = [],
  hiraTableData = [],
  capaData = [],
  cipData = [],
  refDocData = [],
  aspImpTableData = [],
  searchValue = "",
}: Props) => {
  const classes = useStyles();
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [activeTabKey, setActiveTabKey] = useState<any>("1");
  const [showNoDataFlag, setShowNoDataFoundFlag] = useState<any>(false);
  const userDetails = getSessionStorage();
  console.log("checkref moduleNames in moduletabs-->",moduleNames);
  
  const tabs = [
    {
      label: "Documents",
      moduleName: "Documents",
      key: "1",
      children: (
        <DocumentsTab
          documentTableData={documentsTableData}
          locationOptions={locationOptions}
          searchValue={searchValue}
        />
      ),
    },
    {
      label: "Ref Doc",
      moduleName: "Ref Doc",
      key: "2",
      children: (
        <RefDocTab
          refDocData={refDocData}
          locationOptions={locationOptions}
          searchValue={searchValue}
        />
      ),
    },
    {
      label: "Findings",
      moduleName: "NC",
      key: "3",
      children: (
        <NcTab
          ncTableData={ncTableData}
          locationOptions={locationOptions}
          searchValue={searchValue}
        />
      ),
    },
    // {
    //   label: "KPI",
    //   moduleName: "KPI",
    //   key: "3",
    //   children: <>KPI</>,
    // },
    // {
    //   label: "Objectives",
    //   moduleName: "Objectives",
    //   key: "4",
    //   children: <ObjectiveTable />,
    // },
    {
      label: "HIRA",
      moduleName: "HIRA",
      key: "4",
      children: (
        <HiraTab
          hiraTableData={hiraTableData}
          locationOptions={locationOptions}
          searchValue={searchValue}
        />
      ),
    },
    {
      label: "Aspect Impact",
      moduleName: "AspectImpact",
      key: "5",
      children: (
        <AspectImpactTab
          aspectImpactTableData={aspImpTableData}
          locationOptions={locationOptions}
          searchValue={searchValue}
        />
      ),
    },
    {
      label: "Clauses",
      moduleName: "Clauses",
      key: "6",
      children: <ClausesTab clauseTableData={clausesTableData} searchValue={searchValue} />,
    },
    {
      label: "CAPA",
      moduleName: "CAPA",
      key: "7",
      children: (
        <CapaTab
          capaData={capaData}
          locationOptions={locationOptions}
          searchValue={searchValue}
        />
      ),
    },
    {
      label: "CIP",
      moduleName: "CIP",
      key: "8",
      children: (
        <CipTab
          cipData={cipData}
          locationOptions={locationOptions}
          searchValue={searchValue}
        />
      ),
    },
  ];
  const updateTabLabels = (tabs: any, moduleNames: any) => {
    return tabs.map((tab: any) => {
      const moduleData = moduleNames.find(
        (module: any) => module.name === tab.moduleName
      );
      return {
        ...tab,
        label: moduleData
          ? `${tab.moduleName} (${moduleData.count})`
          : tab.label,
      };
    });
  };
  const getLocationList = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          // enqueueSnackbar("No Departments Found", {
          //   variant: "warning",
          // });
        }
      } else {
        // setJobTitleOptions([]);
        // enqueueSnackbar("Error in fetching getAllDepartments", {
        //   variant: "error",
        // });
      }
    } catch (error) {
      
    }
  }
  const updatedTabs = updateTabLabels(tabs, moduleNames);
  useEffect(() => {
    console.log("activeTabKey in moduletabs-->", activeTabKey);
    
    // console.log("moduleNames in moduletabs-->", moduleNames);
    if (moduleNames?.length) {
      // Find the first module with count greater than 0
      // const firstNonZeroModule = moduleNames.find((module) => module.count > 0);

      // if (firstNonZeroModule) {
      //   // Find the corresponding tab
      //   const matchingTab = tabs.find(
      //     (tab) => tab.moduleName === firstNonZeroModule.name
      //   );
      //   // console.log("matchingTab-->", matchingTab);

      //   if (matchingTab) {
      //     setActiveTabKey(matchingTab.key);
      //     setShowNoDataFoundFlag(false);
      //   }
      // } else {
      //   setShowNoDataFoundFlag(true);
      // }
    } else {
      setShowNoDataFoundFlag(true);
    }
  }, [moduleNames]);
  useEffect(() => {
    // console.log("showNOdataflag-->", showNoDataFlag);
  }, [showNoDataFlag]);

  useEffect(()=>{
    getLocationList();
  },[])
  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  return (
    <>
      {showNoDataFlag ? (
        <div
          style={{
            backgroundImage: `url(${noResultFoundImage})`,
            backgroundSize: "cover", // Cover the entire div
            backgroundRepeat: "no-repeat", // Prevent image repetition
            backgroundPosition: "center", // Center the background image
            height: "500px", // You can set a specific height and width for the div
            width: "600px",
            margin: "auto",
          }}
        ></div>
      ) : (
        <div className={classes.tabsWrapper}>
          <Tabs
            defaultActiveKey="1"
            onChange={(key) => {
              onTabsChange(key);
            }}
            activeKey={activeTabKey}
            type="card"
            items={updatedTabs as any}
            animated={{ inkBar: true, tabPane: true }}
          />
        </div>
      )}
    </>
  );
};

export default ModuleTabs;
