import axios from "apis/axios.global";
import ModuleTabs from "components/GlobalSearch/ModuleTabs";
import ModuleHeader from "components/Navigation/ModuleHeader";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  moduleNamesAtom,
  globalSearchClausesResult,
  globalSearchDocumentsResult,
} from "recoil/atom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useNavigate } from 'react-router-dom';
const GlobalSearch = () => {
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
  const [ncTableData, setNcTableData] = useState<any>([]);
  const [clauseData, setClauseData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [capaData, setCapaData] = useState<any>([]);
  const [cipData, setCipData] = useState<any>([]);
  const [refDocData, setRefDocData] = useState<any>([]);
  const [hiraTableData, setHiraTableData] = useState<any>([]);
  const [aspectImpactTableData, setAspectImpactTableData] = useState<any>([])
  const navigate = useNavigate();
  const orgId = sessionStorage.getItem("orgId");

  useEffect(() => {
    // console.log("checkcommon isloading", isLoading, location);
    
    if (location?.state?.searchValue) {
      getAllModules();
    } 
  }, [location, location?.state]);

  useEffect(() => {
    // console.log("moduleNames in globalsearch page-->", moduleNames);
  }, [moduleNames]);
  const getAllModules = async () => {
    console.log("checkcommon search api called");
      setIsLoading(true);
    try {
      const result = await axios.get(
        `api/globalsearch?searchQuery=${location?.state?.searchValue}&organization=${orgId}&page=${1}&limit=${100}`
      );
      if (result.status === 200 || result.status === 201) {
        console.log("checkcommon res-->", result);
        
        setModuleNames(result.data.modulesNameAndCount);
        setGlobalSearchClauses(result.data.result.clauses);
        setGlobalSearchDocuments(result.data.result.document);
        setHiraTableData(result?.data?.result?.hira);
        setAspectImpactTableData(result?.data?.result?.aspectImpact)
        setCapaData(result?.data?.result?.capa);
        setCipData(result?.data?.result?.cip);
        setRefDocData(result?.data?.result?.refDoc);
        setDocumentTableData(result.data.result.document);
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
          // console.log("checkcommon set clause tabel data", formattedClauseData);
          
          setClauseTableData(formattedClauseData);

          setClauseData(formattedClauseData);
        } else {
          setClauseData([]);
          setClauseTableData([]);
        }

        if (
          result?.data?.result?.nc &&
          result?.data?.result?.nc?.length > 0
        ) {
          const formattedNcData = result?.data?.result?.nc?.map(
            (item: any) => ({
              _id: item._id,
              id: item.id,
              clause: item?.clause?.[0]?.clauseName,
              auditName: item?.audit?.auditName,
              systemName: item?.audit?.system?.name,
              severity: item?.severity,
            })
          );
          console.log("checkcommon nc formattedNcData-->", formattedNcData);

          setNcTableData(formattedNcData);
        } else {
          setNcTableData([]);
        }

        setIsLoading(false);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("error in getAllModules-->", error);
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
          {!!moduleNames?.length && (
            <>
              <ModuleHeader moduleName="Global Search" />
              <br />
              {/* <Button
                data-testid="single-form-wrapper-button"
                onClick={() => {
                  
                  navigate(-1);
                }}
                style={{
                  marginLeft: "15px",
                  display : "flex",
                  marginBottom: "15px",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button> */}
              <ModuleTabs
                documentsTableData={documentTableData}
                clausesTableData={clauseTableData}
                ncTableData={ncTableData}
                hiraTableData={hiraTableData}
                aspImpTableData={aspectImpactTableData}
                capaData={capaData}
                cipData={cipData}
                refDocData={refDocData}
                searchValue={location?.state?.searchValue}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default GlobalSearch;
