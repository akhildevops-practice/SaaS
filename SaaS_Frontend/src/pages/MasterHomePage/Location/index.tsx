import { useState, useEffect } from "react";
import MultiUserDisplay from "components/MultiUserDisplay";
import { API_LINK } from "config";
import { Modal, Upload, Form } from "antd";
import type { UploadProps } from "antd";
import { MdInbox } from "react-icons/md";
import { MdPublish } from "react-icons/md";
import useStyles from "./styles";
import {
  CircularProgress,
  Typography,
  Tooltip,
  Box,
  IconButton,
  useMediaQuery,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { locFormData } from "recoil/atom";
import { locForm } from "schemas/locForm";
import axios from "apis/axios.global";
import ConfirmDialog from "components/ConfirmDialog";
import { useSnackbar } from "notistack";
import formatQuery from "utils/formatQuery";
import getAppUrl from "utils/getAppUrl";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import checkRoles from "utils/checkRoles";
import { Button, Divider, Pagination, PaginationProps, Table } from "antd";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import type { ColumnsType } from "antd/es/table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MdGetApp } from "react-icons/md";

type Props = {};

const fields = [
  "locationName",
  "locationId",
  "functionId",
  // "locationType",
  "createdAt",
  // "user",
  "business",
];
const headers = [
  "Unit Name",
  "Unit Id",
  "Function",
  // "Unit Type",
  "Created At",
  // "Unit Admin",
  "Business",
];

function Location({}: Props) {
  const matches = useMediaQuery("(min-width:822px)");
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const setLocData = useSetRecoilState(locFormData);
  const [open, setOpen] = useState(false);
  const [deleteLoc, setDeleteLoc] = useState<any>();
  const [rerender, setRerender] = useState(false);
  const [searchValue, setSearchValue] = useState<any>({});
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [functionData, setFunctionData] = useState<any>();
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const orgName = getAppUrl();
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isAdmin = checkRoles("admin");
  const isEntityHead = checkRoles("ENTITY-HEAD");
  const isAuditor = checkRoles("AUDITOR");
  const isMR = checkRoles("MR");
  const isGeneralUser = checkRoles("GENERAL-USER");
  const organizationId = sessionStorage.getItem("orgId") || "";
  const [filteredValues, setFilteredValues] = useState([]);
  const [filteredKeys, setFilteredKeys] = useState<any>([]);
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const [searchValues, setSearch] = useState<any>({ searchQuery: "" });
  const [importUnitModel, setImportUnitModel] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);
  const accessRight = isOrgAdmin ? true : isMR ? true : false;
  const columns: ColumnsType<any> = [
    {
      title: "Unit Name",
      dataIndex: "locationName",
      key: "locationName",
    },
    {
      title: "Unit Id",
      dataIndex: "locationId",
      key: "locationId",
    },
    // {
    //   title: "Function",
    //   dataIndex: "functionId",
    //   key: "functionId",
    //   onFilter: (value: any, record: any) => {
    //     const hasMatchingSystem = record.functionId.props.data.some(
    //       (sys: any) => {
    //         // Log the sys object
    //         return sys.name === value;
    //       }
    //     );

    //     console.log("hasMatching", hasMatchingSystem);
    //     return hasMatchingSystem;
    //   },
    //   filterDropdown: ({
    //     setSelectedKeys,
    //     selectedKeys,
    //     confirm,
    //     clearFilters,
    //   }) => {
    //     // Create a Set to store unique function names
    //     const uniqueFunctionNames = new Set();

    //     // Iterate through all records and add unique function names to the set
    //     data?.forEach((item: any) => {
    //       const functionName = item?.functionId?.props?.data[0]?.name
    //         ? item?.functionId?.props?.data[0]?.name
    //         : "";
    //       if (functionName) {
    //         uniqueFunctionNames.add(functionName);
    //       }
    //     });

    //     // Convert the Set back to an array for rendering
    //     const uniqueFunctionNamesArray = Array.from(uniqueFunctionNames);
    //     uniqueFunctionNamesArray.sort((a: any, b: any) =>
    //       a.toLowerCase().localeCompare(b.toLowerCase())
    //     );
    //     return (
    //       <div style={{ padding: 8 }}>
    //         {uniqueFunctionNamesArray.map((name: any) => (
    //           <div key={name}>
    //             <label>
    //               <input
    //                 type="checkbox"
    //                 onChange={(e) => {
    //                   const value = e.target.value;
    //                   if (e.target.checked) {
    //                     setSelectedKeys([...selectedKeys, value]);
    //                   } else {
    //                     setSelectedKeys(
    //                       selectedKeys.filter((key) => key !== value)
    //                     );
    //                   }
    //                 }}
    //                 value={name}
    //                 checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
    //               />
    //               {name}
    //             </label>
    //           </div>
    //         ))}
    //         <div style={{ marginTop: 8 }}>
    //           <Button
    //             type="primary"
    //             onClick={() => {
    //               confirm();
    //               // setFilteredValues(selectedKeys);
    //               console.log("Selected Values:", selectedKeys);
    //             }}
    //             style={{ marginRight: 8 }}
    //           >
    //             Filter
    //           </Button>
    //           {/* Add a reset button */}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Business",
      dataIndex: "business",
      key: "business",
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: any) =>
        record.editAccess && (
          <>
            <IconButton
              onClick={() => {
                handleEditLoc(record);
              }}
              className={classes.actionButtonStyle}
              data-testid="action-item"
            >
              <CustomEditICon width={18} height={18} />
            </IconButton>
            <Divider type="vertical" className={classes.NavDivider} />
            {isOrgAdmin && (
              <IconButton
                onClick={() => {
                  handleOpen(record);
                }}
                className={classes.actionButtonStyle}
                data-testid="action-item"
              >
                <CustomDeleteICon width={18} height={18} />
              </IconButton>
            )}
          </>
        ),
    },
  ];

  useEffect(() => {
    const url = formatQuery(
      `/api/location/${orgName}/Unit`,
      {
        ...searchValue,
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"],
      false
    );

    // console.log("url", url);
    getData(url);
    getFunctions();
  }, []);

  useEffect(() => {
    // console.log("hello world");
    const url = formatQuery(
      `/api/location/${orgName}/Unit`,
      {
        ...searchValue,
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"],
      false
    );

    // console.log("url", url);
    getData(url);
    getFunctions();
  }, [rerender]);
  useEffect(() => {
    const encodedFunctions = encodeURIComponent(JSON.stringify(filteredValues));
    const url = formatQuery(
      `/api/location/locationFilter/${orgName}`,
      {
        page: page,
        limit: rowsPerPage,
        functions: encodedFunctions,
      },
      ["page", "limit", "functions"],
      false
    );

    // console.log("urlllll", url);
    getData(url);
  }, [rerender, filteredValues]);

  const getData = async (url: any) => {
    // console.log("inside getData");
    setIsLoading(true);
    try {
      const res = await axios.get(url);
      if (res?.data?.data) {
        // console.log("res", res.data);
        setCount(res.data.length);
        const val = res?.data?.data?.map((item: any) => {
          const businessNames = item?.businessType?.map(
            (business: any) => business.business
          );

          return {
            locationName: item.locationName,
            locationId: item.locationId,
            id: item.id,
            locationType: item.locationType,
            editAccess: item?.editAccess,
            createdAt: new Date(item.createdAt).toDateString(),
            user: <MultiUserDisplay data={item?.user} name="email" />,
            business: <MultiUserDisplay data={businessNames} name="name" />,
            functionId: (
              <MultiUserDisplay data={item?.functionId} name="name" />
            ),
            users: <MultiUserDisplay data={item?.users} name="email" />,
            businessTypeId: item?.businessTypeId ? item.businessTypeId : null,
          };
        });
        // console.log("Valu", val);
        setData(val);
        // console.log("Updated data:", val);
        setIsLoading(false);
      }
    } catch (err) {
      // console.error(err);
      setIsLoading(false);
    }
  };

  const getFunctions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/business/getAllFunctionsByOrgId/${organizationId}`
      );
      if (res?.data) {
        setFunctionData(res.data);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const exportUnits = async (bool: boolean) => {
    let requiredData: any[] = [];
    const res = await axios.get(
      `/api/location/getAllLocationsForExport/${organizationId}`
    );
    if (data.length === 0 || bool) {
      requiredData = [
        {
          UnitName: "Location1",
          UnitID: "Lo1(MAX 3 Characters)",
          Businesses: "Buisness1",
          BusinessType: "BusinessType1",
          Functions: "Function1",
          Users: "user1@gmail.com",
        },
        {
          UnitName: "Location2",
          UnitID: "Lo2(MAX 3 Characters)",
          Businesses: "Buisness1,Business3",
          BusinessType: "BusinessType2",
          Functions: "Function1,Function2",
          Users: "user1@gmail.com,user2@gmail.com",
        },
        {
          UnitName: "Required",
          UnitID: "Required",
          Businesses: "Required",
          BusinessType: "Not Required",
          Functions: "Required",
          Users: "Not Required (IGNORE THIS ROW WHEN CREATING UNIT IMPORT)",
        },
      ];
    } else {
      for (const element of res.data) {
        requiredData.push({
          UnitName: element.locationName,
          UnitID: element.locationId,
          Businesses: element.businessNames[0],
          BusinessType: element.businessTypeName,
          Functions: element.functionNames.map((item: any) => item).join(", "),
          Users: element.users
            ? element.users.map((item: { email: any }) => item.email).join(", ")
            : "N/A",
        });
      }
    }
    const sheet = XLSX.utils.json_to_sheet(requiredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Units");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    if (data.length === 0 || bool) {
      saveAs(blob, "UnitsTemplate.xlsx");
      if (bool) {
        enqueueSnackbar(`Wrong Template Please View UnitsTemplate`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Export Units Successful`, {
        variant: "success",
      });
      saveAs(blob, "Units.xlsx");
    }
  };

  const importUnit = async () => {
    try {
      const XLSX = require("xlsx");
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      formData.append("orgName", orgName);
      const response = await axios.post(
        `${API_LINK}/api/location/importUnit`,
        formData
      );
      if (response.data.success) {
        const headers = Object.keys(response.data.invalidUnits[0]);
        const invalidSheet = XLSX.utils.aoa_to_sheet(
          response.data.invalidUnits,
          { header: headers }
        );
        const invalidWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          invalidWorkbook,
          invalidSheet,
          "Invalid Units"
        );
        const excelBinaryString = XLSX.write(invalidWorkbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "InvalidUnits.xlsx");
        enqueueSnackbar(`Some Units Failed Please Check InvalidUnits`, {
          variant: "warning",
        });
      }
      if (response.data.wrongFormat) {
        exportUnits(true);
      } else {
        enqueueSnackbar(`Units Import Successful`, {
          variant: "success",
        });
      }
      const url = formatQuery(
        `/api/location/${orgName}/Unit`,
        {
          ...searchValue,
          page: page,
          limit: rowsPerPage,
        },
        ["page", "limit"],
        false
      );
      getData(url);
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const uploadProps: UploadProps = {
    multiple: false, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  const handleEditLoc = (data: any) => {
    // console.log("editData", data);
    navigate(`/master/unit/newlocation/${data.id}`, { state: true });
  };

  const handleSearchChange = (e: any) => {
    // console.log("event", e.target.name, e.target.value);
    e.preventDefault();
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteLoc(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      const res = await axios.delete(`api/location/${deleteLoc?.id}`);
      // const result = await axios.post(`/api/audit-trial/createAuditTrial`, {
      //   moduleType: "UNIT",
      //   actionType: "DELETE",
      //   transactionId: deleteLoc?.id,
      //   actionBy: userid,
      // });
      setIsLoading(false);
      setRerender(!rerender);
      enqueueSnackbar(`Operation Successful`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    setLocData(locForm);
    navigate("/master/unit/newlocation");
  };

  const handleApply = () => {
    setPage(1);
    const url = formatQuery(
      `/api/location/${orgName}/Unit`,
      { ...searchValue, page: 1, limit: rowsPerPage },
      ["query", "page", "limit"]
    );
    getData(url);
  };

  const handleDiscard = () => {
    setPage(1);
    const url = formatQuery(
      `/api/location/${orgName}/Unit`,
      { ...searchValue, page: 1, limit: rowsPerPage },
      ["page", "limit"]
    );
    getData(url);
    setSearchValue({
      query: "",
      locName: "",
      locAdmin: "",
      locationType: "",
    });
  };

  const handleChangePage = (page: any) => {
    setPage(page);
    const url = formatQuery(
      `/api/location/${orgName}/Unit`,
      { ...searchValue, page: page, limit: rowsPerPage },
      ["locName", "locAdmin", "locationType", "page", "limit"]
    );
    getData(url);
  };

  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    // console.log("page", page);
    // console.log("pageSize", pageSize);
    setPage(page);
    setRowsPerPage(pageSize);
    const url = formatQuery(
      `/api/location/${orgName}/Unit`,
      { ...searchValue, page: page, limit: pageSize },
      ["query", "page", "limit"]
    );
    getData(url);
    // let url = formatQuery(
    //   filter ? `/api/dashboard/${filter}/` : `/api/dashboard/`,

    //   {
    //     ...searchValues,
    //     locationId:
    //       userDetailsforFilter.location !== null
    //         ? userDetailsforFilter?.location?.id
    //         : "",
    //     department:
    //       userDetailsforFilter.entity !== null
    //         ? userDetailsforFilter?.entity?.id
    //         : "",
    //     page: page,
    //     limit: pageSize,
    //   },
    //   [
    //     "locationId",
    //     "locationName",
    //     "department",
    //     "creator",
    //     "page",
    //     "limit",
    //     "documentStartDate",
    //     "documentEndDate",
    //     "searchQuery",
    //     "documentStatus",
    //     "documentType",
    //     "readAccess",
    //     "documentName",
    //     "system",
    //   ]
    // );
    // fetchDocuments(url);
  };

  const handleClickDiscard = () => {};

  // console.log("pageandrow", page, rowsPerPage);
  return (
    // <div className={classes.root}>
    <>
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By Unit Name"
          name="locName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Unit Type"
          name="locationType"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Unit Admin"
          name="locAdmin"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
      </FilterDrawer>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />

      <>
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          // style={{ padding: "5px" }}
        >
          {isOrgAdmin && matches && (
            <Tooltip title="Export Units">
              <MdGetApp
                onClick={() => exportUnits(false)}
                style={{
                  position: "relative",
                  top: "-1px",
                  right: "15px",
                  fontSize: "30px",
                  color: "#0E497A",
                }}
              />
            </Tooltip>
          )}
          {isOrgAdmin && matches && (
            <Tooltip title="Import Units">
              <MdPublish
                onClick={() => setImportUnitModel({ open: true })}
                style={{
                  position: "relative",
                  top: "-3px",
                  right: "10px",
                  fontSize: "30px",
                  color: "#0E497A",
                }}
              />
            </Tooltip>
          )}
          {importUnitModel.open && (
            <Modal
              title="Import Units"
              open={importUnitModel.open}
              onCancel={() => setImportUnitModel({ open: false })}
              onOk={() => {
                importUnit();
                setImportUnitModel({ open: false });
              }}
            >
              <Form.Item name="attachments" label={"Attach File: "}>
                <Upload
                  name="attachments"
                  {...uploadProps}
                  className={classes.buttonColor}
                  fileList={fileList}
                >
                  <p className="ant-upload-drag-icon">
                    <MdInbox />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload>
              </Form.Item>
            </Modal>
          )}
          <SearchBar
            placeholder="Search Unit"
            name="query"
            values={searchValue}
            handleChange={handleSearchChange}
            handleApply={handleApply}
            endAdornment={true}
            handleClickDiscard={handleDiscard}
          />
          {/* <Box display="flex" alignItems="center" justifyContent="flex-end">
              <Box className={classes.filterButtonContainer}>
                <Tooltip title="Filter">
                  <Fab
                    size="medium"
                    className={classes.fabButton}
                    onClick={() => setFilterOpen(true)}
                  >
                    <MdFilterList />
                  </Fab>
                </Tooltip>
              </Box>
              <Tooltip title="Add Unit">
                <Fab
                  size="medium"
                  className={classes.fabButton}
                  onClick={handleClick}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Box> */}
        </Box>

        {isLoading ? (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        ) : data && data?.length > 0 ? (
          <>
            {/* <Box
              style={{
                width: "100%",
                backgroundColor: "#E8F3F9",
                height: "54 px",
              }}
              // className={classes.graphContainer}
            >
              
            </Box> */}
            <div data-testid="custom-table" className={classes.tableContainer}>
              {/* <CustomTable
                header={headers}
                fields={fields}
                data={data}
                isAction={isOrgAdmin ? true : false}
                actions={[
                  {
                    label: "Edit",
                    icon: <EditIcon fontSize="small" />,
                    handler: handleEditLoc,
                  },
                  {
                    label: "Delete",
                    icon: <DeleteIcon fontSize="small" />,
                    handler: handleOpen,
                  },
                ]}
              /> */}
              {/* <div className={classes.tableContainerScrollable}> */}
              <Table
                dataSource={data}
                pagination={false}
                columns={columns}
                size="middle"
                rowKey={"id"}
                className={classes.locationTable}
                // rowClassName={rowClassName}
              />
              {/* </div> */}

              {/* <SimplePaginationController
                count={count}
                page={page}
                rowsPerPage={10}
                handleChangePage={handleChangePage}
              /> */}
              <div className={classes.pagination}>
                <Pagination
                  size="small"
                  current={page}
                  pageSize={rowsPerPage}
                  total={count}
                  showTotal={showTotal}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page, pageSize) => {
                    handleChangePageNew(page, pageSize);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={classes.imgContainer}>
              <img
                src={EmptyTableImg}
                alt="No Data"
                height="400px"
                width="300px"
              />
            </div>
            <Typography align="center" className={classes.emptyDataText}>
              Let’s begin by adding a location
            </Typography>
          </>
        )}
      </>

      {/* : (
        <>
          <div className={classes.imgContainer}>
            <img src={NoAccess} alt="No Access" height="400px" width="300px" />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            You are not authorized to view this page
          </Typography>
        </>
      ) */}
    </>
    // </div>
  );
}

export default Location;
