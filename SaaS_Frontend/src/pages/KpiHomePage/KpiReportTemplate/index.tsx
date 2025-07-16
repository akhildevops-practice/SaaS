import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Grid,
  CircularProgress,
  IconButton,
} from "@material-ui/core";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import ConfirmDialog from "components/ConfirmDialog";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "apis/axios.global";
import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import EmptyTableImg from "../../../assets/EmptyTableImg.svg";
import getUserId from "utils/getUserId";
import { Button, Pagination, PaginationProps, Table } from "antd";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  newTableContainer: {
    marginTop: "1%",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },

    // overflowY: "hidden",
    // overflowX: "hidden !important",
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      padding: "4px 8px !important",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "105px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
      letterSpacing: "0.5px",
    },
    // "& .ant-table-wrapper .ant-table-thead>tr>th": {
    //   position: "sticky", // Add these two properties
    //   top: 0, // Add these two properties
    //   zIndex: 2,
    //   // padding: "12px 16px",
    //   fontWeight: 600,
    //   fontSize: "14px",
    //   padding: "4px 10px !important",
    //   // fontFamily: "Poppins !important",
    //   lineHeight: "24px",
    // },

    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: "420px",
      overflowY: "auto",
      overflowX: "hidden",
    },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      // borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",

      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 5px 0px #0003",
        transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
    "& .ant-table-wrapper .ant-table-content  .ant-table-thead>tr>th": {
      padding: "4px 10px !important",
    },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
}));
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;
function KpiReportTemplate() {
  const [allTemplates, setAllTemplates] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteTemplate, setDeleteTemplate] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [filterList, setFilterList] = useState<any>([]);
  const [isFilterDept, setfilterDept] = useState<boolean>(false);
  const [selectedDept, setselectedDept] = useState<any>([]);
  const [locationList, setLocationList] = useState<any>([]);
  const [isFilterLoc, setfilterLoc] = useState<boolean>(false);
  const [selectedLoc, setselectedLoc] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const classes = useStyles();
  const userId = getUserId();

  useEffect(() => {
    setPage(1);
    setRowsPerPage(10);
    handlePagination(1, 10);
  }, [!isFilterDept, !isFilterLoc]);
  const cols = [
    {
      title: "Template name",
      dataIndex: "templateName",
    },
    {
      title: "Location",
      dataIndex: "location",
      filterIcon: (filtered: any) =>
        isFilterLoc ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {locationList?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedLoc([...selectedLoc, value]);
                      } else {
                        setselectedLoc(
                          selectedLoc.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedLoc.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.locationName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedLoc.length === 0}
                onClick={() => {
                  setfilterLoc(true);
                  // handlePagination(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedLoc([]);
                  setfilterLoc(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Sources",
      dataIndex: "sources",
    },

    {
      title: "Entity Filter",
      dataIndex: "entityFilter",
      filterIcon: (filtered: any) =>
        isFilterDept ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {filterList?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedDept([...selectedDept, value]);
                      } else {
                        setselectedDept(
                          selectedDept.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedDept.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.entityName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedDept.length === 0}
                onClick={() => {
                  setfilterDept(true);
                  // handlePagination(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedDept([]);
                  setfilterDept(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Modified By",
      dataIndex: "modifiedBy",
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_: any, record: any) => (
        <>
          <IconButton
            onClick={() => {
              handleEditTemplate(record);
            }}
            style={{ padding: "10px" }}
          >
            <CustomEditICon width={20} height={20} />
          </IconButton>

          {/* <IconButton
            onClick={() => {
              handleOpenScheduleCalendarMode(record);
            }}
            style={{ padding: "10px" }}
          >
            <ListAltIcon width={20} height={20} />
          </IconButton> */}

          <IconButton
            onClick={() => {
              handleOpen(record);
            }}
            style={{ padding: "10px" }}
          >
            <CustomDeleteICon width={20} height={20} />
          </IconButton>
        </>
      ),
    },
  ];

  useEffect(() => {
    getAllTemplates();
    listforcolulmn();
  }, []);

  useEffect(() => {
    setData(
      allTemplates.map((obj) => ({
        id: obj.id,
        templateName: obj.kpiReportTemplateName,
        location: obj.locationName.locationName,
        sources: obj.sources.map((obj: any) => obj?.sourceName).join(", "),
        status: obj.active ? "Active" : "Inactive",
        modifiedBy: obj.createdBy.username,
        businessUnitFilter: obj.businessUnitFilter?.name ?? "",
        entityFilter: obj.entityFilter?.entityName ?? "",
        reportEditors: obj.reportEditors,
        reportFrequency: obj.reportFrequency,
      }))
    );
  }, [allTemplates]);

  // getAllTemplates API
  const listforcolulmn = async () => {
    const res = await axios(`/api/kpi-report/filterData`);
    setFilterList(res.data.entity);
    setLocationList(res.data.location);
  };

  const getAllTemplates = async () => {
    setIsLoading(true);
    const encodedLoc = encodeURIComponent(JSON.stringify(selectedLoc));
    const encodedDept = encodeURIComponent(JSON.stringify(selectedDept));
    await axios(
      `/api/kpi-report/getAllKpiReportTemplates?skip=${page}&limit=${rowsPerPage}&selectedLoction=${encodedLoc}&selectedEntity=${encodedDept}`
    )
      .then((res) => {
        setAllTemplates(res.data.data);
        setCount(res.data.count);
      })
      .catch((err) => {
        console.error(err);
      });
    setIsLoading(false);
  };

  const openNewTemplate = () => {
    navigate("/kpi/reporttemplates/templateform");
  };

  const handleEditTemplate = (data: any) => {
    navigate(`/kpi/reporttemplates/templateform/${data?.id}`);
  };

  const handleDelete = async () => {
    await axios
      .delete(
        `/api/kpi-report/deleteAllCategoryOfTemplate/${deleteTemplate.id}`
      )
      .catch((err) => console.error(err));
    await axios
      .delete(
        `/api/kpi-report/deleteSelectedKpiReportTemplate/${deleteTemplate.id}`
      )
      .then(() => enqueueSnackbar(`Template deleted`, { variant: "success" }))
      .catch((err) => {
        enqueueSnackbar(`Could not delete template`, {
          variant: "error",
        });
        console.error(err);
      });
    setOpen(false);
    navigate("/kpi", { state: { redirectToTab: "KPI Report Templates" } });
    getAllTemplates();
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteTemplate(val);
  };

  const handlePagination = async (pageSize: any, rowsPerPageSize: any) => {
    setIsLoading(true);
    setPage(pageSize);
    setRowsPerPage(rowsPerPageSize);
    const encodedLoc = encodeURIComponent(JSON.stringify(selectedLoc));
    const encodedDept = encodeURIComponent(JSON.stringify(selectedDept));
    await axios(
      `/api/kpi-report/getAllKpiReportTemplates?skip=${pageSize}&limit=${rowsPerPageSize}&selectedLoction=${encodedLoc}&selectedEntity=${encodedDept}`
    )
      .then((res) => {
        setAllTemplates(res.data.data);
        setCount(res.data.count);
      })
      .catch((err) => {
        console.error(err);
      });
    setIsLoading(false);
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={() => setOpen(false)}
        handleDelete={handleDelete}
      />

      {isLoading ? (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item style={{ paddingTop: "15px" }}>
            <Typography color="primary" variant="h6">
              KPI Report Templates
            </Typography>
          </Grid>

          <Grid item style={{ paddingTop: "15px" }}>
            <Tooltip title="New Template">
              {/* <Fab
                size="medium"
                className={classes.fabButton}
                onClick={openNewTemplate}
              >
                <AddIcon />
              </Fab> */}
              <Button
                onClick={openNewTemplate}
                style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
              >
                Create
              </Button>
            </Tooltip>
          </Grid>

          <Grid item xs={12} style={{ marginTop: 30 }}>
            {data && data?.length !== 0 ? (
              // <CustomTable2
              //   columns={cols}
              //   data={data}
              //   actions={[
              //     // {
              //     //   label: "Run report",
              //     //   icon: <AssessmentIcon fontSize="small" />,
              //     //   handler: handleRunReport,
              //     // },
              //     {
              //       label: "Edit",
              //       icon: <EditIcon fontSize="small" />,
              //       handler: handleEditTemplate,
              //     },
              //     {
              //       label: "Delete",
              //       icon: <DeleteIcon fontSize="small" />,
              //       handler: handleOpen,
              //     },
              //   ]}
              // />
              <>
                <div className={classes.tableContainerScrollable}>
                  <Table
                    className={classes.newTableContainer}
                    // rowClassName={() => "editable-row"}
                    dataSource={data}
                    columns={cols}
                    pagination={false}
                    rowKey={(record: any) => record?.ncObsId?.props?.children}

                    // scroll={{ x: 700, }}
                  />
                </div>
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
                      handlePagination(page, pageSize);
                      // changePage(page);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={classes.imgContainer}>
                  <img src={EmptyTableImg} alt="No Data" width="300px" />
                </div>
                <Typography align="center" className={classes.emptyDataText}>
                  Let’s begin by adding a template
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default KpiReportTemplate;
