import { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  FormControl,
  Button,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import ConfirmDialog from "../ConfirmDialog";
import { connectedAppsSchema } from "../../schemas/connectedAppsSchema";
import { useSnackbar } from "notistack";
import axios from "../../apis/axios.global";
import checkRole from "../../utils/checkRoles";
import { roles } from "../../utils/enums";
import useStyles from "./styles";
import { Autocomplete } from "@material-ui/lab";
import { Col, Form, Input, Row, Button as AntdButton, UploadProps } from "antd";
import getSessionStorage from "utils/getSessionStorage";
import Dragger from "antd/es/upload/Dragger";
import { MdInbox } from 'react-icons/md';

interface Props {
  selectedApp: {
    id: string;
    appName: string;
    status: boolean;
    grantType: string;
  };
  handleClose: () => void;
  locationOptions: { value: string; label: string }[];
}

function ConnectedAppForm({
  selectedApp,
  handleClose,
  locationOptions,
}: Props) {
  const [isNew, setIsNew] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [connectedAppData, setConnectedAppData] = useState(connectedAppsSchema);
  const [origCreds, setOrigCreds] = useState({
    username: "",
    password: "",
    clientId: "",
    clientSecret: "",
  });

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const isOrgAdmin = checkRole(roles.ORGADMIN);
  const allOption = { value: "All", label: "All" };
  const userDetails = getSessionStorage();
  const [objectStoreForm] = Form.useForm();
  const [googleForm] = Form.useForm();
  const [objectStoreData, setObjectStoreData] = useState<any>();
  const [googleData, setGoogleData] = useState<any>();
  const [fileList, setFileList] = useState<any>([]);

  useEffect(() => {
    setConnectedAppData((prev) => ({
      ...prev,
      locations: locationOptions?.map((obj) => obj.value),
    }));
  }, []);

  useEffect(() => {
    if (
      selectedApp.id &&
      selectedApp.grantType !== "objectStore" &&
      selectedApp.grantType !== "google"
    ) {
      setIsNew(false);
      getConnectedAppData();
    } else if (selectedApp.id && selectedApp.grantType === "objectStore") {
      setIsNew(false);
      setConnectedAppData((prev) => ({
        ...prev,
        grantType: "objectStore",
      }));
    } else if (selectedApp.id && selectedApp.grantType === "google") {
      setIsNew(false);
      setConnectedAppData((prev) => ({
        ...prev,
        grantType: "google",
      }));
    } else {
      setIsNew(true);
    }
  }, [selectedApp]);

  const getConnectedAppData = async () => {
    await axios(`/api/connected-apps/getconnectedappbyid/${selectedApp.id}`)
      .then((res) => {
        setConnectedAppData({
          id: res.data.id,
          appName: res.data.sourceName,
          status: res.data.Status,
          baseUrl: res.data.baseURL,
          redirectUrl: res.data.redirectURL,
          grantType: res.data.grantType,
          username: res.data.user,
          password: res.data.password,
          clientId: res.data.clientId,
          clientSecret: res.data.clientSecret,
          locations: res.data.locationId,
          description: res.data.description,
          lastModifiedTime: new Date(res.data.createdModifiedAt),
          lastModifiedUser: res.data.createdModifiedBy,
        });

        setOrigCreds({
          username: res.data.user,
          password: res.data.password,
          clientId: res.data.clientId,
          clientSecret: res.data.clientSecret,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e: any) => {
    setConnectedAppData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // for autocomplete
  const handleChangeAdvance = (name: string, newValue: any[]) => {
    setConnectedAppData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSelectAll = (name: string, options: any[]) => {
    setConnectedAppData((prev) => ({
      ...prev,
      [name]: options.map((obj) => obj.value),
    }));
  };
  const handleSelectNone = (name: string) => {
    setConnectedAppData((prev) => ({ ...prev, [name]: [] }));
  };

  const handleDelete = async () => {
    await axios
      .delete(`/api/connected-apps/deleteconnectedapp/${selectedApp.id}`)
      .then((res) => {
        enqueueSnackbar(`App deleted`, { variant: "success" });
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(`Could not delete app`, { variant: "error" });
      });
    setConfirmOpen(false);
    handleClose();
  };

  const handleTestConnection = async () => {
    await axios(`/api/connected-apps/testConnection/${selectedApp.id}`)
      .then((res) => {
        setConnectedAppData((prev) => ({ ...prev, status: res.data }));
        if (res.data)
          enqueueSnackbar("Connection successful", { variant: "success" });
        else enqueueSnackbar("Connection failed", { variant: "error" });
        handleClose();
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar("An error occured", { variant: "error" });
      });
  };

  const handleCreate = async () => {
    if (
      connectedAppData.appName &&
      connectedAppData.baseUrl &&
      connectedAppData.redirectUrl &&
      connectedAppData.clientId &&
      connectedAppData.clientSecret &&
      connectedAppData.locations.length &&
      connectedAppData.description &&
      (connectedAppData.grantType === "client" ||
        (connectedAppData.grantType === "password" &&
          connectedAppData.username &&
          connectedAppData.password))
    ) {
      const temp = {
        sourceName: connectedAppData.appName,
        clientId: connectedAppData.clientId,
        clientSecret: connectedAppData.clientSecret,
        baseURL: connectedAppData.baseUrl,
        user: connectedAppData.username,
        password: connectedAppData.password,
        redirectURL: connectedAppData.redirectUrl,
        grantType: connectedAppData.grantType,
        description: connectedAppData.description,
        locationId: connectedAppData.locations,
        Status: connectedAppData.status,
      };
      await axios
        .post(`/api/connected-apps/connectedapps`, temp)
        .then((res) =>
          enqueueSnackbar("Connected App added", {
            variant: "success",
          })
        )
        .catch((err) => {
          console.error(err);
          enqueueSnackbar("Could not add app", {
            variant: "error",
          });
        });
      handleClose();
    } else {
      enqueueSnackbar("Please fill all the required fields", {
        variant: "error",
      });
    }
  };

  const handleUpdate = async () => {
    if (
      connectedAppData.appName &&
      connectedAppData.baseUrl &&
      connectedAppData.redirectUrl &&
      connectedAppData.clientId &&
      connectedAppData.clientSecret &&
      connectedAppData.locations.length &&
      connectedAppData.description &&
      (connectedAppData.grantType === "client" ||
        (connectedAppData.grantType === "password" &&
          connectedAppData.username &&
          connectedAppData.password))
    ) {
      const temp = {
        clientId: connectedAppData.clientId,
        clientSecret: connectedAppData.clientSecret,
        baseURL: connectedAppData.baseUrl,
        user: connectedAppData.username,
        password: connectedAppData.password,
        redirectURL: connectedAppData.redirectUrl,
        description: connectedAppData.description,
        locationId: connectedAppData.locations,
        Status: connectedAppData.status,
      };
      await axios
        .put(
          `/api/connected-apps/updateselectedconnectedapp/${connectedAppData.id}`,
          temp
        )
        .then((res) =>
          enqueueSnackbar("Connected App updated", {
            variant: "success",
          })
        )
        .catch((err) => {
          console.error(err);
          enqueueSnackbar("Could not update app", {
            variant: "error",
          });
        });
      handleClose();
    } else {
      enqueueSnackbar("Please fill all the required fields", {
        variant: "error",
      });
    }
  };

  const handleObjectStoreDataChange = (e: any) => {
    try {
      setObjectStoreData({
        ...objectStoreData,
        [e.target.name]: e.target.value,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleDataChange = (e: any) => {
    try {
      setGoogleData({
        ...googleData,
        [e.target.name]: e.target.value,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getObjectStoreData = async () => {
    try {
      const result = await axios.get(
        `api/objectStore/getObjectStoreByOrgId/${userDetails.organizationId}`
      );
      if (result.data) {
        const objStrData = {
          _id: result?.data?._id,
          userId: atob(result?.data?.userId),
          tenancyId: atob(result?.data?.tenancyId),
          fingerprint: atob(result?.data?.fingerprint),
          region: atob(result?.data?.region),
          namespace: atob(result?.data?.namespace),
          bucketName: atob(result?.data?.bucketName),
          privateKeyExist: result?.data?.privateKey,
        };
        setObjectStoreData(objStrData);
      } else {
        setObjectStoreData([]);
      }
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const getGoogleData = async () => {
    try {
      const result = await axios.get(
        `api/google/getGoogleByOrgId/${userDetails.organizationId}`
      );
      if (result.data) {
        const gooData = {
          _id: result?.data?._id,
          clientId: atob(result?.data?.clientId),
          clientSecret: atob(result?.data?.clientSecret),
        };
        setGoogleData(gooData);
      } else {
        setGoogleData([]);
      }
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const submitGoogleData = async () => {
    try {
      const finalData = {
        organizationId: userDetails.organizationId,
        clientId: btoa(googleData.clientId),
        clientSecret: btoa(googleData.clientSecret),
      };
      const result = await axios.post(`api/google/createGoogle`, finalData);
      const gooData = {
        _id: result?.data?.response?._id,
        clientId: atob(result.data.response?.clientId),
        clientSecret: atob(result.data.response?.clientSecret),
      };
      setGoogleData(gooData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const submitObjectStoreData = async () => {
    try {
      const formData = new FormData();
      formData.append("organizationId", userDetails.organizationId);
      if (fileList.length !== 0) {
        formData.append("file", fileList[0].originFileObj);
        setFileList([]);
      }
      Object.keys(objectStoreData).forEach((key) => {
        formData.append(key, btoa(objectStoreData[key]));
      });
      const result = await axios.post(
        `api/objectStore/createObjectStore`,
        formData
      );
      const objStrData = {
        _id: result.data.response?._id,
        userId: atob(result.data.response?.userId),
        tenancyId: atob(result.data.response?.tenancyId),
        fingerprint: atob(result.data.response?.fingerprint),
        region: atob(result.data.response?.region),
        namespace: atob(result.data.response?.namespace),
        bucketName: atob(result.data.response?.bucketName),
        privateKeyExist: result.data.response?.privateKey,
      };
      setObjectStoreData(objStrData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const updateGoogleData = async () => {
    try {
      const finalData = {
        clientId: btoa(googleData.clientId),
        clientSecret: btoa(googleData.clientSecret),
      };
      const result = await axios.patch(
        `api/google/updateGoogle/${googleData._id}`,
        finalData
      );
      const gooData = {
        _id: result?.data?.response?._id,
        clientId: atob(result.data.response?.clientId),
        clientSecret: atob(result.data.response?.clientSecret),
      };
      setGoogleData(gooData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const updateObjectStoreData = async () => {
    try {
      const formData = new FormData();
      if (fileList.length !== 0) {
        formData.append("file", fileList[0].originFileObj);
        setFileList([]);
      }
      const { _id, ...rest } = objectStoreData;
      Object.keys(rest).forEach((key) => {
        formData.append(key, btoa(rest[key]));
      });
      const result = await axios.patch(
        `api/objectStore/updateObjectStore/${_id}`,
        formData
      );
      const objStrData = {
        _id: result.data.response?._id,
        userId: atob(result.data.response?.userId),
        tenancyId: atob(result.data.response?.tenancyId),
        fingerprint: atob(result.data.response?.fingerprint),
        region: atob(result.data.response?.region),
        namespace: atob(result.data.response?.namespace),
        bucketName: atob(result.data.response?.bucketName),
        privateKeyExist: result.data.response?.privateKey,
      };
      setObjectStoreData(objStrData);
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
    } catch (error: any) {
      if (!error.response) {
        console.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        console.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  useEffect(() => {
    if (connectedAppData.grantType === "objectStore") {
      getObjectStoreData();
    }
    if (connectedAppData.grantType === "google") {
      getGoogleData();
    }
  }, [connectedAppData]);

  useEffect(() => {
    if (objectStoreData) {
      objectStoreForm.setFieldsValue({
        userId: objectStoreData.userId,
        tenancyId: objectStoreData.tenancyId,
        fingerprint: objectStoreData.fingerprint,
        region: objectStoreData.region,
        namespace: objectStoreData.namespace,
        bucketName: objectStoreData.bucketName,
      });
    }
  }, [objectStoreData]);

  useEffect(() => {
    if (googleData) {
      googleForm.setFieldsValue({
        clientId: googleData.clientId,
        clientSecret: googleData.clientSecret,
      });
    }
  }, [googleData]);

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false,
    fileList,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList);
      }
    },
    onRemove: (file) => {
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      );
    },
  };

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleDelete={handleDelete}
      />
      <form
        data-testid="audit-system-form"
        autoComplete="off"
        className={classes.form}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="flex-end"
          spacing={2}
        >
          {(connectedAppData.grantType === "client" ||
            connectedAppData.grantType === "password") && (
            <>
              <Grid item xs={4} md={2} className={classes.formTextPadding}>
                <strong>Connected App *</strong>
              </Grid>
              <Grid item xs={8} md={4} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="appName"
                  value={connectedAppData.appName}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                  disabled={!isNew}
                />
              </Grid>
            </>
          )}

          <Grid item xs={4} md={2} className={classes.formTextPadding}>
            <strong>Grant type *</strong>
          </Grid>
          <Grid item xs={8} md={4} className={classes.formBox}>
            <FormControl disabled={!isNew} fullWidth>
              <InputLabel>Grant Type</InputLabel>
              <Select
                name="grantType"
                value={connectedAppData.grantType}
                onChange={handleChange}
                disabled={!isNew}
              >
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="password">Password</MenuItem>
                <MenuItem value="objectStore">Object Store</MenuItem>
                <MenuItem value="google">Google</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {(connectedAppData.grantType === "client" ||
            connectedAppData.grantType === "password") && (
            <>
              <Grid item xs={4} md={2} className={classes.formTextPadding}>
                <strong>Base URL *</strong>
              </Grid>
              <Grid item xs={8} md={4} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="baseUrl"
                  value={connectedAppData.baseUrl}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                />
              </Grid>

              <Grid item xs={4} md={2} className={classes.formTextPadding}>
                <strong>Redirect URL *</strong>
              </Grid>
              <Grid item xs={8} md={4} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="redirectUrl"
                  value={connectedAppData.redirectUrl}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                />
              </Grid>

              {connectedAppData.grantType === "password" && (
                <>
                  <Grid item xs={4} md={2} className={classes.formTextPadding}>
                    <strong>Username *</strong>
                  </Grid>
                  <Grid item xs={8} md={4} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="username"
                      value={connectedAppData.username}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      required
                    />
                  </Grid>

                  <Grid item xs={4} md={2} className={classes.formTextPadding}>
                    <strong>Password *</strong>
                  </Grid>
                  <Grid item xs={8} md={4} className={classes.formBox}>
                    <TextField
                      fullWidth
                      name="password"
                      type="password"
                      value={connectedAppData.password}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      required
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={4} md={2} className={classes.formTextPadding}>
                <strong>Client ID *</strong>
              </Grid>
              <Grid item xs={8} md={4} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="clientId"
                  value={connectedAppData.clientId}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                />
              </Grid>

              <Grid item xs={4} md={2} className={classes.formTextPadding}>
                <strong>Client secret *</strong>
              </Grid>
              <Grid item xs={8} md={4} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="clientSecret"
                  type="password"
                  value={connectedAppData.clientSecret}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                />
              </Grid>

              <Grid item xs={12} md={2} className={classes.formTextPadding}>
                <strong>Locations *</strong>
              </Grid>
              <Grid item xs={12} md={10} className={classes.formBox}>
                {/* <CheckboxAutocomplete
              name="locations"
              value={connectedAppData.locations}
              options={locationOptions}
              handleChange={handleChangeAdvance}
              handleSelectAll={handleSelectAll}
              handleSelectNone={handleSelectNone}
            /> */}
                <Autocomplete
                  disablePortal
                  multiple // Enable multiselect
                  id="combo-box-demo"
                  options={[allOption, ...locationOptions]} // Include the "All" option at the beginning
                  onChange={(event, newValue) => {
                    if (newValue.length === 1 && newValue[0]?.value === "All") {
                      // If "All" is selected, set the locations to ["All"]
                      setConnectedAppData((prevData) => ({
                        ...prevData,
                        locations: ["All"],
                      }));
                    } else {
                      // If other options are selected, filter out "All" and set the selected locations
                      const filteredValue = newValue.filter(
                        (option) => option?.value !== "All"
                      );
                      setConnectedAppData((prevData) => ({
                        ...prevData,
                        locations: filteredValue?.map(
                          (option: any) => option?.value
                        ),
                      }));
                    }
                  }}
                  value={connectedAppData.locations?.map((locationId) => {
                    // If locations include "All", return the "All" option
                    if (locationId === "All") return allOption;
                    // Map other locationIds to corresponding options
                    const option = locationOptions.find(
                      (option) => option.value === locationId
                    );
                    return option || null; // Return null for unmatched ids
                  })}
                  getOptionLabel={(option: any) =>
                    option ? option.label || "" : ""
                  } // Check if option is null before accessing properties
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      label="Units"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2} className={classes.formTextPadding}>
                <strong>Description *</strong>
              </Grid>
              <Grid item xs={12} md={10} className={classes.formBox}>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  name="description"
                  value={connectedAppData.description}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                />
              </Grid>

              {!isNew && (
                <>
                  <Grid item xs={6} sm={"auto"}>
                    <Button
                      onClick={() => setConfirmOpen(true)}
                      variant="contained"
                      className={classes.deleteButton}
                      disableElevation
                      disabled={!isOrgAdmin}
                    >
                      Delete
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={"auto"}>
                    <Button
                      onClick={handleTestConnection}
                      variant="contained"
                      color="primary"
                      className={classes.testButton}
                      disableElevation
                    >
                      Test connection
                    </Button>
                  </Grid>
                </>
              )}
              <Grid item xs={isNew ? 6 : 12} sm={"auto"}>
                <Button
                  onClick={isNew ? handleCreate : handleUpdate}
                  variant="contained"
                  color="primary"
                  disableElevation
                  className={classes.submitButton}
                  // disabled={
                  //   // isOrgAdmin ||
                  //   // connectedAppData.clientId === origCreds.clientId ||
                  //   // connectedAppData.clientSecret === origCreds.clientSecret ||
                  //   // (connectedAppData.grantType === "password" &&
                  //   //   (connectedAppData.username === origCreds.username ||
                  //   //     connectedAppData.password === origCreds.password))
                  // }
                >
                  {isNew ? "Add" : "Update"}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
        {connectedAppData.grantType === "objectStore" && (
          <>
            <Form
              form={objectStoreForm}
              layout="vertical"
              onFinish={() => {
                if (objectStoreData?._id) {
                  updateObjectStoreData();
                } else {
                  submitObjectStoreData();
                }
              }}
              style={{ paddingTop: 20 }}
            >
              <Row gutter={16}>
                {/* Left Column */}
                <Col span={12}>
                  <Form.Item
                    label="User ID"
                    name="userId"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter User ID",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="userId"
                      value={objectStoreData?.userId || ""}
                      onChange={handleObjectStoreDataChange}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Tenancy ID"
                    name="tenancyId"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Tenancy ID",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="tenancyId"
                      value={objectStoreData?.tenancyId || ""}
                      onChange={handleObjectStoreDataChange}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Fingerprint"
                    name="fingerprint"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Fingerprint",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="fingerprint"
                      value={objectStoreData?.fingerprint || ""}
                      onChange={handleObjectStoreDataChange}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Region"
                    name="region"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Region",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="region"
                      value={objectStoreData?.region || ""}
                      onChange={handleObjectStoreDataChange}
                    />
                  </Form.Item>
                </Col>

                {/* Right Column */}
                <Col span={12}>
                  <Form.Item
                    label="Namespace"
                    name="namespace"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Namespace",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="namespace"
                      value={objectStoreData?.namespace || ""}
                      onChange={handleObjectStoreDataChange}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Bucket Name"
                    name="bucketName"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Bucket Name",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="bucketName"
                      value={objectStoreData?.bucketName || ""}
                      onChange={handleObjectStoreDataChange}
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      objectStoreData?.privateKeyExist
                        ? "Private Key (Exists)"
                        : "Private Key (Do not Exist)"
                    }
                    name="privateKey"
                  >
                    <Dragger accept=".pem" name="privateKey" {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <MdInbox />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area to upload
                      </p>
                    </Dragger>
                  </Form.Item>
                </Col>
              </Row>

              {/* Submit Button */}
              <Row justify="center">
                <Col>
                  <Form.Item>
                    <AntdButton
                      type="primary"
                      onClick={() => {
                        if (objectStoreData?._id) {
                          updateObjectStoreData();
                        } else {
                          submitObjectStoreData();
                        }
                      }}
                    >
                      {objectStoreData?._id ? "Update" : "Submit"}
                    </AntdButton>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </>
        )}
        {connectedAppData.grantType === "google" && (
          <>
            <Form
              form={googleForm}
              layout="vertical"
              onFinish={() => {
                if (googleData?._id) {
                  updateGoogleData();
                } else {
                  submitGoogleData();
                }
              }}
            >
              <Row gutter={16}>
                {/* Left Column */}
                <Col span={12}>
                  <Form.Item
                    label="Client ID"
                    name="clientId"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Client ID",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="clientId"
                      value={googleData?.clientId || ""}
                      onChange={handleGoogleDataChange}
                    />
                  </Form.Item>
                </Col>

                {/* Right Column */}
                <Col span={12}>
                  <Form.Item
                    label="Client Secret"
                    name="clientSecret"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Client Secret",
                      },
                    ]}
                    style={{ fontWeight: "bold" }}
                  >
                    <Input
                      name="clientSecret"
                      value={googleData?.clientSecret || ""}
                      onChange={handleGoogleDataChange}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Submit Button */}
              <Row justify="center">
                <Col>
                  <Form.Item>
                    <AntdButton
                      type="primary"
                      onClick={() => {
                        if (googleData?._id) {
                          updateGoogleData();
                        } else {
                          submitGoogleData();
                        }
                      }}
                    >
                      {googleData?._id ? "Update" : "Submit"}
                    </AntdButton>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </>
        )}
      </form>
    </>
  );
}

export default ConnectedAppForm;
