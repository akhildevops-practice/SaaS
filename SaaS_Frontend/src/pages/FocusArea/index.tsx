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
import useStyles from "./style";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyTableImg from "../../assets/EmptyTableImg.svg";
import Table from "antd/es/table";
import axios from "../../apis/axios.global";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  auditFocusAreaData,
  orgFormData,
} from "../../recoil/atom";
import DynamicFormFields from "../../components/DynamicFormFields";
import MultiUserDisplay from "../../components/MultiUserDisplay";
import { ReactComponent as CustomDeleteICon } from "../../assets/documentControl/Delete.svg";
import CustomButton from "components/CustomButton";

const defaultFormData = { auditFocus: "", areas: [{ name: "" }] };
const FocusArea: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formData, setFormData] = useRecoilState(auditFocusAreaData);
  const [addfocusArea, setFocusArea] = useState<string>();
  const [open, setOpen] = useState(false);
  const [deleteFocusArea, setdeleteFocusArea] = useState<any>();
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (selectedData) {
      setFormData({
        auditFocus: selectedData.auditFocus || "",
        areas:
          selectedData.areas?.map((area: string) => ({ name: area })) || [],
      });
    } else {
      setFormData({ auditFocus: "", areas: [{ name: "" }] });
    }
  }, [selectedData]);

  const getData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/audit-settings/getAllAuditFocusAreas`);
      if (res?.data) {
        const val = res?.data.map((item: any) => {
          return {
            auditFocus: item.auditFocus,
            organizationId: item.organizationId,
            id: item.id,
            areas: item?.areas.map((area: any) => area.name || ""),
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
    const selected = formData.find((item: any) => item.auditFocus === text);
    setSelectedData(selected);

    setModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Focus Area",
      dataIndex: "auditFocus",
      key: "auditFocus",
      width: 150,
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
      title: "Areas",
      dataIndex: "areas",
      width: 600,
      render: (_, record) => {
        const formattedAreas = record.areas.map((area: string) => ({
          name: area,
        }));
        return <MultiUserDisplay data={formattedAreas} name="name" />;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
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
    setdeleteFocusArea(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `/api/audit-settings/deleteAuditFocusAreaById/${deleteFocusArea.id}`
      );
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

  const handleSubmit = async () => {
    if (selectedData) {
      // Update existing Focus Area
      try {
        await axios.put(
          `/api/audit-settings/updateAuditFocusAreaById/${selectedData.id}`,
          {
            auditFocus: selectedData.auditFocus,
            areas: formData.areas,
            organizationId: organizationId,
          }
        );
        setSelectedData(null);
        setModalVisible(false);
        getData();
      } catch (err) {
        console.log("Error updating audit type", err);
      }
    } else {
      // Create new audit Focus Area
      try {
        await axios.post(`/api/audit-settings/newauditFocus`, {
          auditFocus: formData.auditFocus,
          areas: formData.areas,
          organizationId: organizationId,
        });
        setFormData(defaultFormData);
        // setSelectedData(null);
        setModalVisible(false);
        getData();
      } catch (err) {
        console.log("Error creating audit type", err);
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
          height="300px !important"
          overflow="auto"
          width="40vW !important"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div>
            <Typography variant="h6">
              {selectedData ? "Edit Focus Area" : "Add Focus Area"}
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
                  <strong>Focus*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid item sm={12} md={9} className={classes.formBox}>
                  <TextField
                    label="Focus"
                    name="auditFocus"
                    value={
                      selectedData?.auditFocus || formData.auditFocus || ""
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
                  // alignItems: "center",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item sm={2} md={2} className={classes.formTextPadding}>
                  <strong>Areas*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid
                  item
                  sm={12}
                  md={9}
                  // style={{ marginRight: "-800px" }}
                  className={classes.formBox}
                >
                  <DynamicFormFields
                    data={formData}
                    name="areas"
                    setData={setFormData}
                    keyName="name"
                  />
                </Grid>
              </div>
              {/* <div
                style={{
                  display: "flex",
                  paddingTop: "20px",
                  justifyContent: "flex-end",
                  fontFamily: "poppinsregular",
                }}
              >
                <Grid item>
                  <Button
                    style={{
                      backgroundColor: "#006EAD",
                      color: "#ffffff",
                    }}
                    onClick={handleModalCancel}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    style={{
                      backgroundColor: "#006EAD",
                      color: "#ffffff",
                    }}
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    Submit
                  </Button>
                </Grid>
              </div> */}
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
              setModalVisible(true);
              setFormData({ auditFocus: "", areas: [{ name: "" }] });
            }}
            style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
          >
            Add
          </Button>
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

export default FocusArea;
