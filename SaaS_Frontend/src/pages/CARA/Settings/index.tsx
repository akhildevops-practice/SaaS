import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";

import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Modal,
  Typography,
  Divider,
  TextField,
  IconButton,
} from "@material-ui/core";

import useStyles from "./styles";
import ConfirmDialog from "components/ConfirmDialog";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import Table from "antd/es/table";
import axios from "apis/axios.global";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { deviationTypeData, orgFormData } from "recoil/atom";

import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import CustomButton from "components/CustomButton";
import { useSnackbar } from "notistack";
import { Pagination, PaginationProps } from "antd";
import { isValid } from "utils/validateInput";

const defaultFormData = {
  deviationType: "",
  createdBy: "",
  organizationId: "",
};
const Settings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formData, setFormData] = useRecoilState(deviationTypeData);
  const [addfocusArea, setFocusArea] = useState<string>();
  const [open, setOpen] = useState(false);
  const [deleteProf, setdeleteProf] = useState<any>();
  const orgData = useRecoilValue(orgFormData);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [count, setCount] = useState<number>(0);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  useEffect(() => {
    getData();
  }, [page, limit]);

  useEffect(() => {
    if (selectedData) {
      setFormData({
        deviationType: selectedData.deviationType || "",
        description: selectedData.description || "",
      });
    } else {
      setFormData({ deviationType: "", description: "" });
    }
  }, [selectedData]);
  const handlePagination = (page: any, pageSize: any) => {
    setPage(page);
    setLimit(pageSize);
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
    getData();
  };
  const showTotal: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;

  const getData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/cara/getAllDeviationType?page=${page}&limit=${limit}`
      );
      if (res?.data) {
        setCount(res?.data?.count);
        const val = res?.data?.data?.map((item: any) => {
          return {
            deviationType: item.deviationType,
            organizationId: item.organizationId,
            id: item._id,
            description: item.description,
          };
        });

        setFormData(val);

        setIsLoading(false);
      } else {
        setFormData([defaultFormData]);
        setIsLoading(false);
      }
    } catch (err) {
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleLinkClick = (text: string) => {
    const selected = formData.find((item: any) => item.deviationType === text);
    // console.log("selected in handlelinkclick", selected);
    setSelectedData(selected);

    setModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Origin",
      dataIndex: "deviationType",
      key: "deviationType",
 
      // render: (text) => <a onClick={() => handleLinkClick(text)}>{text}</a>,
      render: (record: any) => (
        <div
          style={{
            textDecorationLine: "underline",
            cursor: "pointer",
          }}
        >
          <div
            className={classes.clickableField}
            onClick={() => handleLinkClick(record)}
          >
            {record}
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
     
      render: (record: any) => <div>{record}</div>,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align:"center",
      render: (_, record) => (
        <IconButton
          onClick={() => {
            handleOpen(record);
          }}
          style={{ padding: "10px" }}
        >
          {/* <DeleteOutline /> */}
          <CustomDeleteICon width={20} height={20} />
        </IconButton>
        // </div>
      ),
    },
  ];

  const handleOpen = (val: any) => {
    setOpen(true);
    // console.log("setting delete orof", val);
    setdeleteProf(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      console.log("deleteprof", deleteProf);
      await axios.delete(`/api/cara/deleteDeviationType/${deleteProf.id}`);
      getData();
      handleClose();
    } catch (error) {
      // Error handling
      console.log("Error deleting audit Focus", error);
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (selectedData) {
      if (name === "areas") {
        const updatedAreas = formData.areas.map((area: any) => area.name);
        setSelectedData((prevData: any) => ({
          ...prevData,
          [name]: updatedAreas,
        }));
      } else {
        setSelectedData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
    } else {
      // Add mode: Update formData directly
      if (name === "areas") {
        const updatedAreas = formData.areas.map((area: any) => area.name);
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: updatedAreas,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
    }
  };

  const handleModalCancel = () => {
    setSelectedData(null);
    setModalVisible(false);
    getData();
  };

  // console.log("selectedData", selectedData);
  const handleSubmit = async () => {
    if (selectedData) {
      // Update existing audit type
      // console.log("updating", selectedData);
      try {
        if (formData?.deviationType) {
          const isValidDeviation = isValid(formData?.deviationType);
          if (!isValidDeviation.isValid) {
            enqueueSnackbar(
              `Please add valid deviationtype ${isValidDeviation.errorMessage}`,
              { variant: "error" }
            );
            return;
          }
          if (formData?.description) {
            const isValidDeviation = isValid(formData?.description);
            if (!isValidDeviation.isValid) {
              enqueueSnackbar(
                `Please add valid description ${isValidDeviation.errorMessage}`,
                { variant: "error" }
              );
              return;
            }
          }
          await axios.patch(
            `/api/cara/updateDeviationType/${selectedData.id}`,
            {
              deviationType: selectedData?.deviationType,
              description: selectedData?.description,
              organizationId: organizationId,
            }
          );
          setSelectedData(null);
          setModalVisible(false);
          getData();
        } else {
          enqueueSnackbar("Please enter Origin", { variant: "error" });
        }
      } catch (err) {
        console.log("Error updating Origin", err);
      }
    } else {
      try {
        if (formData?.deviationType) {
          const isValidDeviation = isValid(formData?.deviationType);
          if (!isValidDeviation.isValid) {
            enqueueSnackbar(
              `Please add valid deviationtype ${isValidDeviation.errorMessage}`,
              { variant: "error" }
            );
            return;
          }
          if (formData?.description) {
            const isValidDeviation = isValid(formData?.description);
            if (!isValidDeviation.isValid) {
              enqueueSnackbar(
                `Please add valid decription ${isValidDeviation.errorMessage}`,
                { variant: "error" }
              );
              return;
            }
          }
          const response = await axios.post(`/api/cara/createDeviationType`, {
            deviationType: formData.deviationType,
            description: formData.description,
            createdBy: userDetails.id,
            organizationId: userDetails?.organizationId,
          });
          setFormData(defaultFormData);
          // setSelectedData(null);
          setModalVisible(false);
          getData();
          console.log("response", response);
          if (response.data.status === 409) {
            enqueueSnackbar("Origin name already exists, try different name", {
              variant: "error",
            });
            setModalVisible(true);
          } else if (response.status === 200 || response.status === 201) {
            enqueueSnackbar("Origin added successfully", {
              variant: "success",
            });
          }
        } else {
          enqueueSnackbar("Please add Origin", { variant: "error" });
        }
      } catch (err) {
        // console.log("response", response);
        console.log("Error creating Origin", err);
      }
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
          // width={600}
          minWidth="40vw"
          maxWidth="40vw"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div>
            <Typography variant="h6">
              {selectedData ? "Edit Origin" : "Add Origin"}
            </Typography>
            <Divider />
            <form>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item sm={2} md={2} className={classes.formTextPadding}>
                  <strong>Origin*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid item sm={12} md={9} className={classes.formBox}>
                  <TextField
                    label="Origin"
                    name="deviationType"
                    value={
                      selectedData?.deviationType ||
                      formData.deviationType ||
                      ""
                    }
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    required
                    size="small"
                  />
                </Grid>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item sm={2} md={2} className={classes.formTextPadding}>
                  <strong>Description</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid item sm={12} md={9} className={classes.formBox}>
                  <TextField
                    label="Description"
                    name="description"
                    value={
                      selectedData?.description || formData.description || ""
                    }
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </div>
              <Box width="100%" display="flex" justifyContent="center" pt={2}>
                <Button
                  className={classes.buttonColor}
                  variant="outlined"
                  onClick={handleModalCancel}
                >
                  Cancel
                </Button>

                <CustomButton
                  text="Submit"
                  handleClick={handleSubmit}
                ></CustomButton>
              </Box>
            </form>
            {/* )} */}
          </div>
        </Box>
      </Modal>
      <div style={{width:"60%"}}>
        <div
          style={{
            display: "flex",
            justifyContent: "end",

            paddingBottom: "10px",
            paddingTop: "10px",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() => {
              setModalVisible(true);
              setFormData({ deviationType: "", description: "" });
            }}
            style={{ backgroundColor: "#0E497A", color: "#ffffff",padding:"4px 20px" }}
          >
            Add
          </Button>
        </div>

        {/* <Button
          style={{
            border: "2px solid black",
            position: "absolute",
            top: "70px",
            right: "100px",
          }}
          onClick={() => {
            navigate("/cara/settings/KPI");
          }}
        >
          KPI
        </Button> */}

        {formData && Array.isArray(formData) && formData?.length !== 0 ? (
          <div>
            <Table
              columns={columns}
              dataSource={formData}
              pagination={false}
              rowKey={"id"}
              // bordered
              className={classes.tableContainer}
              // rowClassName={rowClassName}
              onRow={(record) => ({
                onMouseEnter: () => handleMouseEnter(record),
                onMouseLeave: handleMouseLeave,
              })}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <Pagination
                size="small"
                current={page}
                pageSize={limit}
                total={count}
                showTotal={showTotal}
                showSizeChanger
                showQuickJumper
                onChange={(page, pageSize) => {
                  handlePagination(page, pageSize);
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
              Let’s begin by adding an Origin
            </Typography>
          </>
        )}
      </div>

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

export default Settings;
