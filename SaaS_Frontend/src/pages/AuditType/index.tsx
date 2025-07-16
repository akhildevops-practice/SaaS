import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
} from "@material-ui/core";
import useStyles from "./style";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyTableImg from "../../assets/EmptyTableImg.svg";
import Table from "antd/es/table";
import axios from "../../apis/axios.global";
import { useRecoilState } from "recoil";
import { auditTypesFormData } from "../../recoil/atom";
import { auditTypeData } from "schemas/auditTypeData";
import { ReactComponent as CustomDeleteICon } from "../../assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "../../assets/documentControl/Edit.svg";
import { useNavigate } from "react-router-dom";
import checkRole from "utils/checkRoles";
import { Pagination, PaginationProps, Tooltip } from "antd";
import SearchBar from "components/SearchBar";
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;
const AuditType: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formData, setFormData] = useRecoilState(auditTypesFormData);
  const [count, setCount] = useState<number>(10);
  const [selectedSystem, setSelectedSystem] = useState<any>([]);

  const [roles, setRoles] = useState<any[]>([]);
  const [searchValues, setSearch] = useState<any>({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [iconColor, setIconColor] = useState("#380036");
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [systemList, setSystemList] = useState<any>([]);

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [isSystemType, setSystemType] = useState<boolean>(false);

  const [deleteType, setdeleteType] = useState<any>();

  useEffect(() => {
    scopeOptions();
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, [!isSystemType]);

  const scopeOptions = async () => {
    const res = await axios(`/api/audit-settings/getAllScopesData`);
    setSystemList(res.data);
  };
  const getData = async () => {
    const encodeScope = encodeURIComponent(JSON.stringify(selectedSystem));
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/audit-settings/getAllAuditTypesTable?search=${searchQuery.searchQuery}&skip=${page}&limit=${rowsPerPage}&selectedScope=${encodeScope}`
      );
      setFormData(res.data.data);
      setCount(res.data.count);
      setIsLoading(false);
    } catch (err) {
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleEditPlan = (record: any) => {
    navigate(`/audit/auditsettings/auditTypeForm/${record.id}`);
  };

  const handleEditPlanForReadMode = (record: any) => {
    navigate(`/audit/auditsettings/auditTypeForm/readMode/${record.id}`);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Audit Type",
      dataIndex: "auditType",
      key: "auditType",
      width: 200,
      render: (text: any, record) => (
        <>
          {/* <span>{text}</span> */}
          {console.log("record", record)}
          <Tooltip title="click to view Audit Type" placement="right">
            <span
              onClick={() => {
                handleEditPlanForReadMode(record);
              }}
            >
              {text}
            </span>
          </Tooltip>
        </>
      ),
    },
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
      width: 200,
      render: (text) => {
        const scopeName = JSON?.parse(text);
        return <span>{scopeName?.name}</span>;
      },
      // filterIcon: (filtered: any) =>
      //   isSystemType ? (
      //     <FilterFilled style={{ fontSize: "16px", color: "black" }} />
      //   ) : (
      //     <FilterOutlined style={{ fontSize: "16px" }} />
      //   ),
      // filterDropdown: ({ confirm, clearFilters }: any) => {
      //   return (
      //     <div style={{ padding: 8 }}>
      //       {systemList?.map((name: any) => (
      //         <div key={name.id}>
      //           <label style={{ display: "flex", alignItems: "center" }}>
      //             <input
      //               type="checkbox"
      //               onChange={(e) => {
      //                 const value = e.target.value;
      //                 if (e.target.checked) {
      //                   setSelectedSystem([...selectedSystem, value]);
      //                 } else {
      //                   setSelectedSystem(
      //                     selectedSystem.filter((key: any) => key !== value)
      //                   );
      //                 }
      //               }}
      //               value={name.id}
      //               checked={selectedSystem.includes(name.id)} // Check if the checkbox should be checked
      //               style={{
      //                 width: "16px",
      //                 height: "16px",
      //                 marginRight: "5px",
      //               }}
      //             />
      //             {name.name}
      //           </label>
      //         </div>
      //       ))}
      //       <div style={{ marginTop: 8 }}>
      //         <AntdButton
      //           type="primary"
      //           disabled={selectedSystem.length === 0}
      //           onClick={() => {
      //             setSystemType(true);
      //             // handleChangePageNew(1,10)
      //             // handlePagination(1, 10);
      //           }}
      //           style={{
      //             marginRight: 8,
      //             backgroundColor: "#E8F3F9",
      //             color: "black",
      //           }}
      //         >
      //           Apply
      //         </AntdButton>
      //         <AntdButton
      //           onClick={async () => {
      //             setSelectedSystem([]);
      //             setSystemType(false);
      //             // handleChangePageNew(1,10)
      //           }}
      //         >
      //           Reset
      //         </AntdButton>
      //       </div>
      //     </div>
      //   );
      // },
    },
    {
      title: "Audit Responsibility",
      dataIndex: "responsibility",
      key: "responsibility",
      width: 200,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "Description",
      width: 250,
      key: "Description",
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <>
          {isOrgAdmin && (
            <>
              <IconButton
                onClick={() => {
                  handleEditPlan(record);
                }}
                style={{ padding: "10px" }}
              >
                <CustomEditICon width={20} height={20} />
              </IconButton>
              <IconButton
                onClick={() => {
                  handleOpen(record);
                }}
                style={{ padding: "10px" }}
              >
                <CustomDeleteICon width={20} height={20} />
              </IconButton>
            </>
          )}
        </>
      ),
    },
  ];

  const handleOpen = (val: any) => {
    setOpen(true);
    setdeleteType(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `/api/audit-settings/deleteAuditTypeById/${deleteType.id}`
      );
      // Success message or further actions
      console.log("Audit type deleted successfully");
      handleClose();
      getData();
    } catch (error) {
      // Error handling
      console.log("Error deleting audit type", error);
    }
  };

  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;

  //   if (selectedData) {
  //     // Edit mode: Update selectedData directly
  //     setSelectedData((prevData: any) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   } else {
  //     // Add mode: Update formData directly
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleModalCancel = () => {
    setFormData(auditTypeData); // Reset the form data
    setSelectedData(null);
    setModalVisible(false);
    getData();
  };

  const handleSearchChange = (e: any) => {
    setsearchQuery({ searchQuery: e.target.value });
  };

  const handleClickDiscard = async () => {
    const encodeScope = encodeURIComponent(JSON.stringify(selectedSystem));
    setsearchQuery({ searchQuery: "" });
    setPage(1);
    setRowsPerPage(10);
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/audit-settings/getAllAuditTypesTable?search=&skip=${1}&limit=${10}&selectedScope=${encodeScope}`
      );
      setFormData(res.data.data);
      setCount(res.data.count);
      setIsLoading(false);
    } catch (err) {
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleChangePageNew = async (pageNew: number, rowNew: number) => {
    const encodeScope = encodeURIComponent(JSON.stringify(selectedSystem));
    setPage(pageNew);
    setRowsPerPage(rowNew);
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/audit-settings/getAllAuditTypesTable?search=${searchQuery.searchQuery}&skip=${pageNew}&limit=${rowNew}&selectedScope=${encodeScope}`
      );
      setFormData(res.data.data);
      setCount(res.data.count);
      setIsLoading(false);
    } catch (err) {
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };
  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingBottom: "10px",
          }}
        >
          <SearchBar
            placeholder="By Audit Type Name"
            name="searchQuery"
            values={searchQuery}
            handleChange={handleSearchChange}
            handleApply={() => {
              handleChangePageNew(1, 10);
            }}
            endAdornment={true}
            handleClickDiscard={handleClickDiscard}
          />
          {isOrgAdmin && (
            <Button
              onClick={() => {
                // setModalVisible(true);
                // getEntity();
                navigate("/auditTypeForm");
              }}
              style={{
                backgroundColor: "#0E497A",
                color: "#ffffff",
                padding: "5px 17px",
                borderRadius: "6px",
              }}
            >
              Add
            </Button>
          )}
        </div>

        {formData && Array.isArray(formData) && formData.length !== 0 ? (
          <div data-testid="custom-table" className={classes.tableContainer}>
            <Table
              columns={columns}
              dataSource={formData}
              pagination={false}
              size="middle"
              rowKey={"id"}
              // bordered
              className={classes.documentTable}
              // rowClassName={rowClassName}
              onRow={(record) => ({
                onMouseEnter: () => handleMouseEnter(record),
                onMouseLeave: handleMouseLeave,
              })}
            />
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
            {/* <SimplePaginationController
              count={100}
              page={page}
              rowsPerPage={10}
              handleChangePage={handleChangePage}
            /> */}
          </div>
        ) : (
          <>
            <div className={classes.emptyTableImg}>
              <img
                src={EmptyTableImg}
                alt="No Data"
                height="400px"
                width="300px"
              />
            </div>
            <Typography align="center" className={classes.emptyDataText}>
              Let’s begin by adding an Audit Type
            </Typography>
          </>
        )}
      </>

      {isLoading && (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export default AuditType;
