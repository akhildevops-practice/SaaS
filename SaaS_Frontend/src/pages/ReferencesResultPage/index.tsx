import axios from "apis/axios.global";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  moduleNamesAtom,
  globalSearchClausesResult,
  globalSearchDocumentsResult,
  processDocFormData,
} from "recoil/atom";

//images
import noResultFoundImage from "assets/images/noresultfound.jpeg";

import CircularProgress from "@material-ui/core/CircularProgress";
import ReferencesResultsModuleTabs from "components/CommonReferencesComponents/ReferencesResultsModuleTabs";

type Props = {
  searchValue?: string;
  selected?: any;
  setSelected?: any;
  isModalVisible?: boolean;
  activeTab?: string;
  systems?: any;
  clauseSearch?: boolean;
  onlyClauseRef?: boolean;
  onlySopRef?: boolean;
  onlyHiraRef?: boolean;
  onlyCapaRef?: boolean;
  activeTabKey?: any;
  locationOptions?: any;
  departmentOptions?: any;
  getAllDepartmentsByOrgAndUnitFilter?: any;
};

const ReferencesResultPage = ({
  searchValue = "",
  selected,
  setSelected,
  isModalVisible,
  activeTab,
  systems,
  activeTabKey,
  clauseSearch,
  locationOptions = [],
  departmentOptions = [],
  getAllDepartmentsByOrgAndUnitFilter,
  onlyClauseRef,
  onlySopRef,
  onlyHiraRef,
  onlyCapaRef,
}: Props) => {
  const location = useLocation();
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState(
    globalSearchClausesResult
  );
  const [globalSearchDocuments, setGlobalSearchDocuments] = useRecoilState(
    globalSearchDocumentsResult
  );
  const [documentTableData, setDocumentTableData] = useState<any>([]);
  const [clauseTableData, setClauseTableData] = useState<any>([]);
  const [clauseData, setClauseData] = useState<any>([]);
  const [hiraTableData, setHiraTableData] = useState<any>([]);
  const [aspectImpactTableData, setAspectImpactTableData] = useState<any>([]);
  const [ncData, setNcData] = useState<any>([]);
  const [capaData, setCapaData] = useState<any>([]);
  const [cipData, setCipData] = useState<any>([]);
  const [refDocData, setRefDocData] = useState<any>([]);

  const [isLoading, setIsLoading] = useState<any>(true);
  const [formData, setFormData] = useRecoilState(processDocFormData);

  const orgId = sessionStorage.getItem("orgId");

  // useEffect(() => {
  //   if (!!location?.state?.searchValue) {
  //     getAllModules();
  //   }
  // }, [location])

  useEffect(() => {
    getAllModules(searchValue);
  }, [searchValue]);

  // console.log("checkref module", moduleNames);
  // useEffect(() => {
  //   console.log("moduleNames in globalsearch page-->", moduleNames);
  // }, [moduleNames])
  const getAllModules = async (searchValue: any = "") => {
    try {
      const result = await axios.get(
        `api/globalsearch?page=${1}&limit=${100}&searchQuery=${searchValue}&organization=${orgId}&userFilter=${true}&systemsArray=${systems}`
      );
      if (result?.status === 200 || result?.status === 201) {
        // console.log("checkref insised res.status == 200", result);

        setModuleNames(result?.data?.modulesNameAndCount);
        setGlobalSearchClauses(result?.data?.result?.clauses);
        setGlobalSearchDocuments(result?.data?.result?.document);

        setDocumentTableData(result?.data?.result?.document);
        setHiraTableData(result?.data?.result?.hira);
        setCapaData(result?.data?.result?.capa);
        setCipData(result?.data?.result?.cip);
        setRefDocData(result?.data?.result?.refDoc);
        setAspectImpactTableData(result?.data?.result?.aspectImpact);
        if (
          result?.data?.result?.clauses &&
          result?.data?.result?.clauses?.length > 0
        ) {
          const formattedClauseData = result?.data?.result?.clauses?.map(
            (item: any) => ({
              _id: item._id,
              id: item._id,
              name: item?.name,
              number: item?.number,
              description: item?.description,
              systemName: item?.systemName,
              systemId: item?.systemId,
              applicable_locations: item?.applicable_locations,
            })
          );
          setClauseTableData(formattedClauseData);
        } else {
          setClauseTableData([]);
        }
        const formattedNcData = result?.data?.result?.nc?.map((item: any) => ({
          ...item,
          _id: item._id,
          id: item.id,
          clause: item?.clause?.[0]?.clauseName,
          auditName: item?.audit?.auditName,
          systemName: item?.audit?.system?.name,
          severity: item?.severity,
        }));
        setNcData(formattedNcData);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("checkref error in getAllModules-->", error);
    }
  };
  return (
    <>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          {moduleNames?.length ? (
            <>
              {/* <ModuleHeader moduleName="Search References" />
              <br /> */}
              <ReferencesResultsModuleTabs
                searchValue={searchValue}
                documentsTableData={documentTableData}
                clausesTableData={clauseTableData}
                ncTableData={ncData}
                hiraTableData={hiraTableData}
                aspectImpactTableData={aspectImpactTableData}
                selected={selected}
                setSelected={setSelected}
                isModalVisible={isModalVisible}
                activeTab={activeTab}
                capaData={capaData}
                cipData={cipData}
                refDocData={refDocData}
                clauseSearch={clauseSearch}
                onlyClauseRef={onlyClauseRef}
                onlySopRef={onlySopRef}
                onlyHiraRef={onlyHiraRef}
                onlyCapaRef={onlyCapaRef}
                locationOptions={locationOptions}
                departmentOptions={departmentOptions}
                getAllDepartmentsByOrgAndUnitFilter={
                  getAllDepartmentsByOrgAndUnitFilter
                }
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </>
      )}
    </>
  );
};

export default ReferencesResultPage;
