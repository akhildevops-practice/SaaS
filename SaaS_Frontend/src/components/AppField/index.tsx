import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
  Typography,
  Modal,
  Box,
  Chip,
} from "@material-ui/core";
import { ReactComponent as DeleteIcon } from "../../assets/documentControl/Delete.svg";
import { ReactComponent as AddIcon } from "../../assets/icons/SquareAddIcon.svg";
import useStyles from "./styles";
import axios from "../../apis/axios.global";
import { useRecoilState, useRecoilValue } from "recoil";
import { addFieldData, orgFormData } from "../../recoil/atom";
import CustomButton from "components/CustomButton";
import { Autocomplete } from "@material-ui/lab";

interface AppField {
  id: number;
  name: string;
  options: string[];
  organizationId?: string;
  isSubmitted?: boolean;
  isEdit?: boolean;
  createdBy?: string;
  isFirstSubmit?: boolean;
}

const AppField: React.FC = () => {
  const orgData = useRecoilValue(orgFormData);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const [appField, setAppField] = useState<AppField[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [formData, setFormData] = useRecoilState(addFieldData);
  // Assign "orgId" from sessionStorage if it exists
  // Otherwise it assigns the value of orgData.organizationId or orgData.id if either exists
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  console.log("sessionstorage from Business&Function");
  useEffect(() => {
    getFields();
    // if (appField.length === 0) {
    //   handleAddField();
    // }
  }, []);

  const handleAddField = async () => {
    console.log("add field called");
    setModalVisible(true);
    setFormData(addFieldData);
  };

  const handleFieldSubmit = async () => {
    try {
      const response = await axios.post(`/api/settings/appField`, {
        ...formData,
        createdBy: userDetails.userName,
        organizationId: organizationId,
      });
      console.log("response", appField, response.data);
      setModalVisible(false);
      getFields();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getFields = async () => {
    try {
      const response = await axios.get(
        `api/settings/getAllAppFields/${organizationId}`
      );
      console.log("responseFields", response.data);
      const data = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        options: item.options,
        isSubmit: false,
        isEdit: true,
      }));
      setAppField(data);
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  console.log("fieldData", appField);
  const handleEditField = async () => {
    try {
      const response = await axios.put(
        `/api/settings/updateAppFiedlById/${selectedData.id}`,
        { name: selectedData.name, options: selectedData.options }
      );
      setSelectedData(null);
      setModalVisible(false);
      getFields();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteField = async (id: number) => {
    try {
      await axios.delete(`/api/settings/deleteAppFieldById/${id}`);
      getFields();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const openItem = async (id: any) => {
    try {
      const response = await axios.get(`/api/settings/getAppFieldById/${id}`);
      const selected = response.data;
      setSelectedData(selected);
      console.log("response.data");
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
    setModalVisible(true);
  };

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: any,
    fieldName: string
  ) => {
    console.log("props", event.target, value, fieldName);

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

  const handleModalCancel = () => {
    setSelectedData(null);
    setModalVisible(false);
  };

  console.log("formData", formData, selectedData);
  return (
    <>
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
          height="250px !important"
          overflow="auto"
          width="40vW !important"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div>
            <Typography variant="h6">
              {selectedData ? "Edit App Field" : "Add New App Field"}
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
                  <strong>App Field*</strong>
                </Grid>
                <Grid item sm={1} md={1}></Grid>
                <Grid item sm={12} md={9} className={classes.formBox}>
                  <TextField
                    label="Enter Field Name"
                    name="name"
                    value={selectedData?.name || formData.name || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange(e, e.target.value, "name")
                    }
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
                      handleFieldChange(e, value, "options")
                    }
                    classes={{ paper: classes.autocomplete }}
                    size="small"
                    value={selectedData?.options || formData?.options}
                    freeSolo
                    renderTags={(value: string[], getTagProps) =>
                      value.map((option: string, index: number) => (
                        <>
                          {console.log("optionsconsole", option)}
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
                  handleClick={
                    selectedData ? handleEditField : handleFieldSubmit
                  }
                ></CustomButton>
              </Box>
            </form>
          </div>
        </Box>
      </Modal>

      <form autoComplete="off" className={classes.form}>
        <Grid container style={{ padding: 0 }}>
          <Grid item sm={12} md={2}></Grid>
          <Grid item sm={12} md={4} className={classes.formTextPadding}>
            <strong>App Field</strong>
          </Grid>
        </Grid>

        <div>
          {appField.map((field, fieldIndex) => (
            <div
              key={field.id}
              style={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "20px",
              }}
            >
              <Grid item sm={12} md={2}></Grid>
              <Grid item sm={12} md={4} alignItems="center">
                <Grid
                  item
                  md={12}
                  className={classes.formBox}
                  style={{ display: "flex" }}
                >
                  <TextField
                    placeholder="Enter Field Name"
                    variant="outlined"
                    value={field.name}
                    style={{ width: "80%" }}
                    onClick={() => {
                      openItem(field.id);
                    }}
                    inputProps={{
                      maxLength: 25,
                      style: { fontSize: "14px", height: "20px" },
                      "data-testid": "organization-name",
                    }}
                  />
                  <IconButton onClick={() => handleDeleteField(field.id)}>
                    <DeleteIcon width={24} height={24} />
                  </IconButton>
                  {fieldIndex === appField.length - 1 && (
                    <IconButton onClick={handleAddField}>
                      <AddIcon width={24} height={24} />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </div>
          ))}
          {appField.length === 0 && (
            <IconButton onClick={handleAddField} style={{ paddingLeft: "18%" }}>
              <AddIcon width={24} height={24} />
            </IconButton>
          )}
        </div>
        {/* <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="flex-start"
        >
          <Grid item xs={2}>
            <Button
              variant="contained"
              onClick={handleAddField}
              style={{
                color: "#0E497A",
                backgroundColor: "#ffffff",
                padding: "18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "medium",
                marginTop: "20px",
              }}
              startIcon={<AddIcon />}
            >
              Add New App Field
            </Button>
          </Grid>
        </Grid> */}
      </form>
    </>
  );
};

export default AppField;
