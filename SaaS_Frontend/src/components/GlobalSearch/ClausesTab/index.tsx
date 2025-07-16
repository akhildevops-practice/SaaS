//react
import { useState, useEffect } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom, globalSearchClausesResult } from "recoil/atom";


//antd
import { Pagination, Table } from "antd";
import type { PaginationProps } from "antd";
//material-ui
import CircularProgress from "@material-ui/core/CircularProgress";
import useStyles from "./style";
import axios from "apis/axios.global";
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;


type Props = {
  clauseTableData: any;
  searchValue: string;
};

const ClausesTab = ({ 
  clauseTableData = [], 
  searchValue="",
 }: Props) => {
  console.log("clauseTableData", clauseTableData);
  const [tableData, setTableData] = useState<any>([]);
  const [count, setCount] = useState<any>(0);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [page, setPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(100); // Default page size is 100

  const classes = useStyles();
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState<any>(
    globalSearchClausesResult
  );

  const totalCount =
  moduleNames.find((module) => module.name === "Clauses")?.count || 0;

  useEffect(() => {
    // console.log("checkcommon clauseTableData in clauses tab-->", clauseTableData);
    setCount(totalCount || 0);
    setTableData(clauseTableData);
  }, [clauseTableData]);

  const fetchTableData = async (page: number=1, pageSize: number=100) => {
    try {
      const queryParams: any = {
        organizationId: sessionStorage.getItem("orgId"),
        searchQuery: searchValue,
        page, // Current page
        limit: pageSize, // Page size
      };
      const queryStringParts: any = [];
      for (const [key, value] of Object.entries(queryParams) as [string, any][]) {
        queryStringParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        );
      }
  
      const queryString = queryStringParts.join("&");
      const res = await axios.get(
        `api/globalsearch/getClausesSearchResultWithFilter?${queryString}`
      );
  
      if (res?.status === 200) {
        console.log("Response in getClausesSearchResultWithFilter tab:", res);
        setTableData(res?.data?.data || []);
      }
    } catch (error) {
      console.error("fetchTableData -> error", error);
      
    }
  }

  const handlePaginationChange = (pageParam: number, pageSizeParam?: number) => {
    setPage(pageParam);
    setPageSize(pageSizeParam || 100); // Update page size if changed
    fetchTableData(pageParam, pageSizeParam || 100);
  };

  const columns = [
    {
      title: "Cluase Title",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => record.name,
    },
    {
      title: "Cluase Number",
      dataIndex: "number",
      key: "number",
      render: (_: any, record: any) => record.number,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (_: any, record: any) => (
        <>
          {record?.description ? (
            <textarea
              // minRows={1}
              rows={3}
              value={record?.description}
              style={{
                width: "100%",
                resize: "none", // Disable resizing to make it look cleaner
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                padding: "8px",
                fontSize: "14px",
              }}
              readOnly
            />
          ) : (
            "N/A"
          )}
        </>
      ),
    },
    {
      title: "System",
      dataIndex: "systemName",
      key: "systemName",
      render: (_: any, record: any) => record.systemName,
    },
    {
      title: "Units Applicable",
      dataIndex: "applicable_locations",
      key: "applicable_locations",
      render: (_: any, record: any) =>
        record.applicable_locations?.map((item: any) => <p>{item.id},</p>),
    },
  ];

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
          <div data-testid="custom-table" className={classes.tableContainer}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              rowKey={"id"}
            />
              <div className={classes.pagination}>
              <Pagination
                size="small"
                current={page}
                pageSize={pageSize}
                total={count} // Use totalCount from moduleNames
                showTotal={showTotal}
                showSizeChanger
                onChange={handlePaginationChange}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ClausesTab;
