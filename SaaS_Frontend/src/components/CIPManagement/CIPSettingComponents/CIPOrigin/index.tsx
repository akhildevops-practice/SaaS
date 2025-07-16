import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Modal,
  Typography,
  TextField,
  IconButton,
  Chip,
  Divider,
} from "@material-ui/core";
import useStyles from "./style";
import ConfirmDialog from "components/ConfirmDialog";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import Table from "antd/es/table";
import MultiUserDisplay from "components/MultiUserDisplay";
import { Autocomplete } from "@material-ui/lab";

import { Pagination, PaginationProps } from "antd";
import { useRecoilState, useRecoilValue } from "recoil";
import { cipOriginData, orgFormData } from "recoil/atom";
import axios from "apis/axios.global";
import AutoComplete from "components/AutoComplete";
import { debounce } from "lodash";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import CustomButton from "components/CustomButton";
import checkRole from "utils/checkRoles";
import { useSnackbar } from "notistack";
import formatQuery from "utils/formatQuery";
import { useParams } from "react-router-dom";

// import { ColumnType } from 'antd/lib/table';

const CIPOrigin: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formData, setFormData] = useRecoilState(cipOriginData);
  const [location, setLocation] = React.useState([]);
  const orgData = useRecoilValue(orgFormData);
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);
  const allOption = { id: "All", locationName: "All" };
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const { id } = useParams();
  const cachedUserData = JSON.parse(
    sessionStorage.getItem("userDetails") as any
  );
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const [deleteOrigin, setdeleteOrigin] = useState<any>();
  const defaultFormData = {
    id: "",
    originName: "",
    options: [],
    location:
      !selectedData && !isOrgAdmin
        ? {
            id: cachedUserData.locationId,
            locationName: cachedUserData.location.locationName,
          }
        : {
            id : "All",
            locationName : "All"
          },
    organizationId: "",
    createdBy: "",
  };

  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  useEffect(() => {
    const url = formatQuery(
      `/api/cip/getAllCIPOrigin`,
      {
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"]
    );
    getData(url);
  }, []);

  let originAheadValue: string;
  let originAheadType: string;

  const getSuggestionListLocation = (value: any, origin: string) => {
    originAheadValue = value;
    originAheadType = origin;
    debouncedSearchLocation();
  };

  const debouncedSearchLocation = debounce(() => {
    getLocation(originAheadValue, originAheadType);
  }, 50);

  const getLocation = async (value: string, origin: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=${value}&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=`
      );
      const locations = res?.data?.locations?.map((item: any) => {
        return {
          id: item.id,
          locationName: item.locationName,
        };
      });
      setLocation(locations);
    } catch (err) {
      enqueueSnackbar("Could not fetch locations", { variant: "error" });
    }
  };

  const getData = async (url: any) => {
    setIsLoading(true);
    try {
      const res = await axios.get(url);
      if (res?.data?.data?.length > 0) {
        setCount(res?.data?.total);
        const val = res?.data?.data.map((item: any) => {
          const transformedOptions = item.options.map((name: any) => ({
            name,
          }));
          return {
            id: item._id,
            originName: item.originName,
            options: transformedOptions,
            location: item.location,
            organizationId: item.organizationId,
            createdBy: item.createdBy,
          };
        });

        setFormData(val);
        setIsLoading(false);
      } else {
        setFormData(defaultFormData);
        setIsLoading(false);
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    const url = formatQuery(
      `/api/cip/getAllCIPOrigin`,
      {
        page: page,
        limit: pageSize,
      },
      ["page", "limit"]
    );
    getData(url);
  };

  const handleLinkClick = async (id: string) => {
    if (id) {
      const res = await axios
        .get(`/api/cip/getCIPOriginById/${id}`)
        .then((res: any) => {
          const val = {
            id: res.data._id,
            organizationId: res.data.organizationId,
            originName: res.data.originName,
            options: res.data.options,
            location: res.data.location,
          };
          return val;
        })
        .then((response: any) => {
          setSelectedData(response);
        });

      setModalVisible(true);
      setIsLoading(false);
    }
  };

  // interface DataType {
  //   key: string;
  //   location: string;
  //   // Add other properties as needed
  // }

  


  const columns: ColumnsType<any> = [
    {
      title: "Unit",
      dataIndex: "location",
      key: "location",
      sorter: (a: any, b: any) => {
        return a.location.locationName.localeCompare(b.location.locationName);
      },
      sortDirections: ["ascend", "descend"],
      width: 100,
      render: (_, record) => {
        return <div>{record?.location?.locationName}</div>;
      },
    },
    {
      title: "Options",
      dataIndex: "options",
      key: "options",
      width: 100,
      render: (_, record) => {
        return <MultiUserDisplay data={record.options} name="name" />;
      },
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
                  handleLinkClick(record.id);
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

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/cip/deleteCIPOrigin/${deleteOrigin.id}`);
      const url = formatQuery(
        `/api/cip/getAllCIPOrigin`,
        {
          page: page,
          limit: rowsPerPage,
        },
        ["page", "limit"]
      );
      getData(url);
      handleClose();
    } catch (error) {
      // Error handling
      enqueueSnackbar("Error deleting CIP Origin", { variant: "error" });
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

  const handleModalCancel = () => {
    setSelectedData(null);
    setModalVisible(false);
    const url = formatQuery(
      `/api/cip/getAllCIPOrigin`,
      {
        page: page,
        limit: rowsPerPage,
      },
      ["page", "limit"]
    );
    getData(url);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setdeleteOrigin(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    console.log("Check", selectedData?.location, formData?.location);

    if (selectedData) {
      // Update existing category
      if (!selectedData?.location?.locationName) {
        enqueueSnackbar("Please Select Unit", { variant: "error" });
        return;
      }
      try {
        const res = await axios.put(
          `/api/cip/updateCIPOrigin/${selectedData.id}`,
          {
            ...selectedData,
            createdBy: userDetails.userName,
            organizationId: organizationId,
          }
        );

        setModalVisible(false);
        const url = formatQuery(
          `/api/cip/getAllCIPOrigin`,
          {
            page: page,
            limit: rowsPerPage,
          },
          ["page", "limit"]
        );
        setFormData(defaultFormData);
        getData(url);
        setSelectedData(null);
      } catch (err) {
        enqueueSnackbar("Error updating CIP Origin", { variant: "error" });
      }
    } else {
      if (!formData?.location?.locationName) {
        enqueueSnackbar("Please Select Unit", { variant: "error" });
        return;
      }
      if (formData?.options?.length > 0) {
        try {
          const res = await axios.post(`/api/cip/createCIPOrigin`, {
            ...formData,
            createdBy: userDetails.userName,
            organizationId: organizationId,
          });
          setModalVisible(false);
          const url = formatQuery(
            `/api/cip/getAllCIPOrigin`,
            {
              page: page,
              limit: rowsPerPage,
            },
            ["page", "limit"]
          );
          getData(url);
        } catch (err) {
          enqueueSnackbar("Error creating CIP Origin", { variant: "error" });
        }
      } else {
        enqueueSnackbar("Please press 'Enter' after adding Options", { variant: "warning" });
      }
    }
  };

  const handleChange = (e: any, value: any[], fieldName: string) => {
    if (selectedData) {
      setSelectedData((prevData: any) => ({
        ...prevData,
        [fieldName]: value,
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      <Modal
        open={modalVisible}
        onClose={handleModalCancel}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          height="300px !important"
          overflow="auto"
          width="55vW !important"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div>
            <Typography variant="h6">
              {selectedData ? "Edit Origin" : "Add New Origin"}
            </Typography>
            <Divider />
            <form>
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item sm={12} md={3} className={classes.formTextPadding}>
                  <strong>Type Name*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid item sm={12} md={9} className={classes.formBox}>
                  <TextField
                    label="Enter Type Name"
                    name="typeName"
                    value={selectedData?.typeName || formData.typeName || ""}
                    onChange={(e: any) =>
                      handleChange(e, e.target.value, "typeName")
                    }
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    required
                    size="small"
                  />
                </Grid>
              </div> */}
              <Grid item sm={1} md={1}></Grid>
              <div
                style={{
                  display: "flex",
                  paddingTop: "20px",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item sm={12} md={3} className={classes.formTextPadding}>
                  <strong>Options*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid
                  item
                  sm={12}
                  md={9}
                  // style={{ marginRight: "-800px" }}
                  className={classes.formBox}
                >
                  <Autocomplete
                    multiple
                    // disabled={isMR || isOrgAdmin ? false : true}
                    // options={formData?.map((option: any) => option.options)}
                    defaultValue={
                      selectedData?.options || formData?.options || []
                    }
                    onChange={(e: any, value) =>
                      handleChange(e, value, "options")
                    }
                    classes={{ paper: classes.autocomplete }}
                    size="small"
                    value={selectedData?.options || formData?.options}
                    freeSolo
                    renderTags={(value: string[], getTagProps) =>
                      value.map((option: string, index: number) => (
                        <>
                          <Chip
                            variant="outlined"
                            size="small"
                            style={{
                              // backgroundColor: "#E0E0E0",
                              fontSize: "12px",
                              border: "transparent",
                              minWidth: "100%",
                              display: "flex",
                              justifyContent: "flex-start",
                            }}
                            label={option}
                            {...getTagProps({ index })}
                          />
                        </>
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="options"
                        style={{ fontSize: "11px" }}
                        placeholder="Press Enter After Each Option"
                        size="small"
                      />
                    )}
                    options={[]}
                  />
                </Grid>
              </div>
              <div
                style={{
                  display: "flex",
                  // alignItems: "center",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item sm={12} md={3} className={classes.formTextPadding}>
                  <strong>Unit*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid
                  item
                  sm={12}
                  md={9}
                  // style={{ marginRight: "-800px" }}
                  className={classes.formBox}
                >
                  <AutoComplete
                    suggestionList={[allOption,...location]}
                    name={"Unit"}
                    keyName={"locationName"}
                    formData={selectedData ? selectedData : formData}
                    setFormData={selectedData ? selectedData : setFormData}
                    getSuggestionList={getSuggestionListLocation}
                    labelKey={"locationName"}
                    disabled={!isOrgAdmin}
                    defaultValue={
                      selectedData ? selectedData.location : formData?.location
                    }
                    handleChangeFromForm={(e: any, value: any) => {
                      selectedData
                        ? setSelectedData((prev: any) => {
                            return {
                              ...prev,
                              location: {
                                id: value?.id,
                                locationName: value?.locationName,
                              },
                            };
                          })
                        : setFormData((prev: any) => {
                            return {
                              ...prev,
                              location: {
                                id: value?.id,
                                locationName: value?.locationName,
                              },
                            };
                          });
                    }}
                    multiple={false}
                  />
                </Grid>
              </div>

              <Box width="100%" display="flex" justifyContent="center" pt={2}>
                <Button
                  // className={classes.buttonColor}
                  variant="outlined"
                  onClick={handleModalCancel}
                >
                  Cancel
                </Button>

                <CustomButton
                  text="Submit"
                  handleClick={handleSubmit}
                  // selectedData ? handleEditField : handleFieldSubmit
                ></CustomButton>
              </Box>
            </form>
          </div>
        </Box>
      </Modal>
      <>
      {isOrgAdmin && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingBottom: "10px",
                }}
              >
                <Button
                  onClick={() => {
                    setFormData(defaultFormData);
                    setModalVisible(true);
                  }}
                  style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
                >
                  Add
                </Button>
              </div>
            </>
      )}
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
              Let’s begin by adding an CIP Origin
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

export default CIPOrigin;
