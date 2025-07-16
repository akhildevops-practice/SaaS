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
  orgFormData,
  proficiencyData,
} from "../../recoil/atom";
import { ReactComponent as CustomDeleteICon } from "../../assets/documentControl/Delete.svg";
import CustomButton from "components/CustomButton";
import checkRole from "utils/checkRoles";
import { Pagination, PaginationProps } from "antd";
import { isValid } from "utils/validateInput";
import { useSnackbar } from "notistack";
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;
const defaultFormData = { auditFocus: "", areas: [{ name: "" }] };
const Proficiency: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const classes = useStyles();
  const [count, setCount] = useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useRecoilState(proficiencyData);
  const [addfocusArea, setFocusArea] = useState<string>();
  const [open, setOpen] = useState(false);
  const [deleteProf, setdeleteProf] = useState<any>();
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;
  const isMr = checkRole("MR");
  const isOrgAdmin = checkRole("ORG-ADMIN");

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (selectedData) {
      setFormData({
        proficiency: selectedData.proficiency || "",
        description: selectedData.description || "",
      });
    } else {
      setFormData({ proficiency: "", description: "" });
    }
  }, [selectedData]);

  const getData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/audit-settings/getAllProficiency`);
      if (res?.data.data) {
        const val = res?.data.data.map((item: any) => {
          return {
            proficiency: item.proficiency,
            organizationId: item.organizationId,
            id: item.id,
            description: item.description,
          };
        });
        setCount(res.data.count);
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
    const selected = formData.find((item: any) => item.proficiency === text);
    setSelectedData(selected);

    setModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Proficiency",
      dataIndex: "proficiency",
      key: "proficiency",
      width: 150,
      // render: (text) => <a onClick={() => handleLinkClick(text)}>{text}</a>,
      render: (record: any) => (
        <div>
          <div
            className={classes.clickableField}
            onClick={() => isOrgAdmin && handleLinkClick(record)}
            style={{ textDecorationLine: isOrgAdmin ? "underline" : "none" }}
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
      width: 150,
      render: (record: any) => <div>{record}</div>,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) =>
        isOrgAdmin && (
          <IconButton
            onClick={() => {
              handleOpen(record);
            }}
            style={{ padding: "10px" }}
          >
            {/* <DeleteOutline /> */}
            <CustomDeleteICon width={20} height={20} />
          </IconButton>
        ),

      // </div>
    },
  ];

  const handleOpen = (val: any) => {
    setOpen(true);
    setdeleteProf(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `/api/audit-settings/deleteProficiency/${deleteProf.id}`
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
      const validselectedData = await isValid(selectedData.proficiency);
      if (validselectedData.isValid === false) {
        enqueueSnackbar(`Proficiency ${validselectedData?.errorMessage}`, {
          variant: "error",
        });
        return;
      }
      // Update existing audit type
      try {
        await axios.put(
          `/api/audit-settings/updateProficiencyById/${selectedData.id}`,
          {
            proficiency: selectedData.proficiency,
            description: selectedData.description,
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
      const validatefunctionId = await isValid(formData.proficiency);
      if (validatefunctionId.isValid === false) {
        enqueueSnackbar(`Proficiency ${validatefunctionId?.errorMessage}`, {
          variant: "error",
        });
        return;
      }

      try {
        await axios.post(`/api/audit-settings/newProficiency`, {
          proficiency: formData.proficiency,
          description: formData.description,
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
  const handleChangePageNew = async (pageSize: any, rowsPerPageSize: any) => {
    setIsLoading(true);
    try {
      setPage(pageSize);
      setRowsPerPage(rowsPerPageSize);
      const res = await axios.get(
        `/api/audit-settings/getAllProficiency?skip=${pageSize}&limit=${rowsPerPageSize}`
      );
      if (res?.data) {
        const val = res?.data.data.map((item: any) => {
          return {
            proficiency: item.proficiency,
            organizationId: item.organizationId,
            id: item.id,
            description: item.description,
          };
        });
        setCount(res.data.count);
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
              {selectedData ? "Edit Proficiency" : "Add Proficiency"}
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
                  <strong>Proficiency*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid item sm={12} md={9} className={classes.formBox}>
                  <TextField
                    label="Proficiency"
                    name="proficiency"
                    value={
                      selectedData?.proficiency || formData.proficiency || ""
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
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingBottom: "10px",
          }}
        >
          {isOrgAdmin && (
            <Button
              onClick={() => {
                setModalVisible(true);
                setFormData({ proficiency: "", description: "" });
              }}
              style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
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

export default Proficiency;
