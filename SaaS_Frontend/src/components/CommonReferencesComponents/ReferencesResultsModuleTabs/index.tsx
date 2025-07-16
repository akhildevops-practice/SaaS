//react
import { useEffect, useState } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom } from "recoil/atom";

//antd

//styles
import useStyles from "./style";

//images
import noResultFoundImage from "assets/images/noresultfound.jpeg";

//components
import DocumentsTab from "components/CommonReferencesComponents/DocumentTab";
import ClausesTab from "components/CommonReferencesComponents/ClausesTab";
import NcTab from "components/CommonReferencesComponents/NcTab";
import HiraTab from "components/CommonReferencesComponents/HiraTab";
import AspectImpactTab from "components/CommonReferencesComponents/AspectImpactTab";
import CapaTab from "components/CommonReferencesComponents/CapaTab";
import CipTab from "components/CommonReferencesComponents/CipTab";
import RefDocTab from "components/CommonReferencesComponents/RefDocTab";

type Props = {
  documentsTableData?: any;
  clausesTableData?: any;
  ncTableData?: any;
  hiraTableData?: any;
  aspectImpactTableData?: any;
  searchValue?: string;
  selected?: any;
  setSelected?: any;
  isModalVisible?: boolean;
  activeTab?: string;
  clauseSearch?: boolean;
  onlyClauseRef?: boolean;
  onlySopRef?: boolean;
  onlyHiraRef?: boolean;
  onlyCapaRef?: boolean;
  capaData?: any;
  cipData?: any;
  refDocData?: any;
  locationOptions?: any;
  departmentOptions?: any;
  getAllDepartmentsByOrgAndUnitFilter?: any;
};

const updateTabLabels = (tabs: any, moduleNames: any) => {
  return tabs.map((tab: any) => {
    const moduleData = moduleNames?.find(
      (module: any) => module.name === tab.moduleName
    );
    return {
      ...tab,
      label: moduleData ? `${tab.moduleName}(${moduleData.count})` : tab.label,
    };
  });
};

const ReferencesResultsModuleTabs = ({
  documentsTableData = [],
  clausesTableData = [],
  ncTableData = [],
  hiraTableData = [],
  aspectImpactTableData = [],
  capaData = [],
  cipData = [],
  refDocData = [],
  searchValue = "",
  selected,
  setSelected,
  isModalVisible,
  activeTab,
  clauseSearch,
  onlyClauseRef,
  onlySopRef,
  onlyHiraRef,
  onlyCapaRef,
  locationOptions = [],
  departmentOptions = [],
  getAllDepartmentsByOrgAndUnitFilter,
}: Props) => {
  // console.log("documentsTableData in refmoduletab-->", documentsTableData);
  const classes = useStyles();
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);

  const [activeTabKey, setActiveTabKey] = useState<any>("1");
  const [showNoDataFlag, setShowNoDataFoundFlag] = useState<any>(false);
  const tabs =
    clauseSearch || onlyClauseRef
      ? [
          {
            label: "Clauses",
            moduleName: "Clauses",
            key: "1",
            children: (
              <ClausesTab
                clauseTableData={clausesTableData}
                searchValue=""
                selected={selected}
                setSelected={setSelected}
              />
            ),
          },
        ]
      : onlySopRef
      ? [
          {
            label: "Documents(5)",
            moduleName: "Documents",
            key: "1",
            children: (
              <DocumentsTab
                documentTableData={documentsTableData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                isModalVisible={isModalVisible}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },
        ]
      : onlyHiraRef
      ? [
          {
            label: "HIRA",
            moduleName: "HIRA",
            key: "1",
            children: (
              <HiraTab
                hiraTableData={hiraTableData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },
        ]
      : onlyCapaRef
      ? [
          {
            label: "CAPA",
            moduleName: "CAPA",
            key: "1",
            children: (
              <CapaTab
                capaData={capaData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },
        ]
      : [
          {
            label: "Documents(5)",
            moduleName: "Documents",
            key: "1",
            children: (
              <DocumentsTab
                documentTableData={documentsTableData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                isModalVisible={isModalVisible}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },
          {
            label: "HIRA",
            moduleName: "HIRA",
            key: "2",
            children: (
              <HiraTab
                hiraTableData={hiraTableData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },
          {
            label: "Clauses",
            moduleName: "Clauses",
            key: "3",
            children: (
              <ClausesTab
                clauseTableData={clausesTableData}
                searchValue=""
                selected={selected}
                setSelected={setSelected}
              />
            ),
          },
          {
            label: "Ref Doc",
            moduleName: "Ref Doc",
            key: "4",
            children: (
              <RefDocTab
                refDocData={refDocData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
              />
            ),
          },
          {
            label: "NC",
            moduleName: "NC",
            key: "5",
            children: (
              <NcTab
                ncTableData={ncTableData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },

          {
            label: "Aspect Impact",
            moduleName: "AspectImpact",
            key: "6",
            children: (
              <AspectImpactTab
                aspectImpactTableData={aspectImpactTableData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },

          {
            label: "CAPA",
            moduleName: "CAPA",
            key: "7",
            children: (
              <CapaTab
                capaData={capaData}
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
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
                searchValue={searchValue}
                selected={selected}
                setSelected={setSelected}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            ),
          },
        ];

  const updatedTabs = updateTabLabels(tabs, moduleNames);
  // console.log("doc data in refmoduletab useeffect[searchvalue]-->", documentsTableData);
  useEffect(() => {
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
  }, [
    moduleNames,
    searchValue,
    documentsTableData,
    clausesTableData,
    hiraTableData,
  ]);
  useEffect(() => {
    // console.log("doc data in refmoduletab useeffect[searchvalue]-->", documentsTableData);
  }, [searchValue]);
  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handleTabClick = (key: string) => {
    setActiveTabKey(key);
  };

  const renderTabContent = () => {
    const activeTab = tabs.find((tab) => tab.key === activeTabKey);
    return activeTab ? activeTab.children : null;
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
          <div className={classes.tabHeader}>
            {updatedTabs.map((tab: any) => (
              <div
                className={`${classes.tab} ${
                  activeTabKey === tab.key ? classes.tabActive : ""
                }`}
                onClick={() => handleTabClick(tab.key)}
                key={tab.key}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className={classes.tabContent}>{renderTabContent()}</div>
        </div>
      )}
    </>
  );
};

export default ReferencesResultsModuleTabs;
