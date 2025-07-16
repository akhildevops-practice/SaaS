import React, { useEffect, useState } from "react";
import { Tabs, Input, Button, Form } from "antd"; // Import necessary components from Ant Design
import { makeStyles } from "@material-ui/core";
import TextArea from "antd/es/input/TextArea";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import checkRoles from "utils/checkRoles";
type Props = {
  isEdit: any;
  formValues: any;
};
const { TabPane } = Tabs;
const useStyles = makeStyles((theme) => ({
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      backgroundColor: "white",
      color: "black",

      // border: "none",
    },
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    cursor: "pointer",
    "&:hover": {
      cursor: "pointer", // Change cursor to pointer on hover
    },
    whiteSpace: "nowrap",
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white",
      background: "white !important",
      color: "black",

      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
      backgroundColor: "white",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
    // "&.ant-select-selector": {
    //   backgroundColor: "white",
    // },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "white !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "white !important",

      // border: "none",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  previewFont: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    textDecoration: "none",
    fontWeight: 600,
    marginLeft: theme.typography.pxToRem(20),
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
}));
const License = ({ isEdit, formValues }: Props) => {
  const isAdmin = checkRoles("admin");
  const [loading, setReloading] = useState(false);
  const [addKey, setAddKey] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    authorizedUsers: "",
    authorizedDocs: "",
    addedUsers: "",
    addedDocs: "",
    openAiKey: "",
    togetherAIKey: "",
    anthropicKey: "",

    openAiInputTokens: "",
    openAiOutputTokens: "",
    anthropicInputTokens: "",
    anthropicOutputTokens: "",
    togetherAIInputTokens: "",
    togetherAIOutputTokens: "",
  });
  const { enqueueSnackbar } = useSnackbar();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  useEffect(() => {
    getRealmLicenseDetails();
  }, []);
  // console.log("formvalues", formValues);
  const getRealmLicenseDetails = async () => {
    const result = await axios.get(
      `/api/license/getRealmLicenseDetails/${formValues.id}`
    );
    // console.log("data", result?.data);
    if (result?.data) {
      setFormData({
        id: result?.data?._id,
        authorizedUsers: result?.data.authorizedUsers,
        authorizedDocs: result?.data.authorizedDocs,
        openAiKey: result?.data.openAiKey,
        togetherAIKey: result?.data.togetherAIKey,
        anthropicKey: result?.data.anthropicKey,
        addedUsers: result?.data.addedUsers,
        addedDocs: result?.data.addedDocs,
        openAiInputTokens: result?.data.openAiInputTokens,
        openAiOutputTokens: result?.data.openAiOutputTokens,
        anthropicInputTokens: result?.data.anthropicInputTokens,
        anthropicOutputTokens: result?.data.anthropicOutputTokens,
        togetherAIInputTokens: result?.data.togetherAIInputTokens,
        togetherAIOutputTokens: result?.data.togetherAIOutputTokens,
      });
    }
  };
  // Function to handle input change
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  // console.log("fomvalues in master", formValues);
  // Function to handle form submission
  const handleSubmit = async () => {
    // console.log("formdata in submit", formData, isEdit);
    if (isEdit && formData?.id !== "" && formData?.id !== undefined) {
      // console.log("inside if");
      //update
      try {
        const payload = {
          ...formData,
          organizationId: formValues.id,
          updatedBy: userDetail.id,
        };
        const res = await axios.patch(
          `/api/license/updateRealmLicense/${formData?.id}`,
          payload
        );
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar("License updated successfully", {
            variant: "success",
          });
          setReloading(true);
          setFormData({
            id: "",
            authorizedUsers: "",
            authorizedDocs: "",
            addedUsers: "",
            addedDocs: "",
            openAiKey: "",
            togetherAIKey: "",
            anthropicKey: "",

            anthropicInputTokens: "",
            anthropicOutputTokens: "",
            openAiInputTokens: "",
            openAiOutputTokens: "",
            togetherAIInputTokens: "",
            togetherAIOutputTokens: "",
          });
        }
      } catch (error) {
        enqueueSnackbar("Error occured while creating license details", {
          variant: "error",
        });
      }
    } else {
      try {
        const payload = {
          ...formData,
          organizationId: formValues.id,
          createdBy: userDetail.id,
          addedUsers: 0,
          addedDocs: 0,
        };
        const res = await axios.post(
          `/api/license/createRealmLicense`,
          payload
        );
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar("License created successfully", {
            variant: "success",
          });
          // setFormData({
          //   id: "",
          //   authorizedUsers: "",
          //   authorizedDocs: "",
          //   openAiKey: "",
          //   togetherAIKey: "",
          //   anthropicKey: "",

          //   anthropicInputTokens: "",
          //   anthropicOutputTokens: "",
          //   openAiInputTokens: "",
          //   openAiOutputTokens: "",
          //   togetherAIInputTokens: "",
          //   togetherAIOutputTokens: "",
          // });
          setReloading(true);
        }
      } catch (error) {
        enqueueSnackbar("Error occured while creating license details", {
          variant: "error",
        });
      }
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 10,
        }}
      >
        <Button type="primary" onClick={() => setAddKey(!addKey)}>
          Add your key
        </Button>
        <Button type="primary" onClick={() => handleSubmit()}>
          Submit Details
        </Button>
      </div>
      <div className={classes.tabsWrapper}>
        <Tabs
          tabPosition="left"
          defaultActiveKey="1"
          type="card"
          style={{ marginTop: "10px" }}
        >
          <TabPane tab="App License" key="1">
            <div className="container" style={{ padding: 10 }}>
              <Form layout="horizontal">
                {formValues?.id !== "master" && (
                  <>
                    {" "}
                    <Form.Item
                      label="Allowed User Count"
                      labelCol={{ span: 8 }} // Adjust label column width
                      wrapperCol={{ span: 16 }} // Adjust input column width
                      style={{ marginBottom: 10 }}
                    >
                      <Input
                        type="number"
                        name="authorizedUsers"
                        value={formData.authorizedUsers}
                        onChange={handleInputChange}
                        placeholder="Enter user count"
                        disabled={!isAdmin}
                        // maxLength={100}
                        style={{ width: 200 }}
                      />
                    </Form.Item>
                    {/* Document Count Field with Label */}
                    <Form.Item
                      label="Allowed Document Count"
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      style={{ marginBottom: 10 }}
                    >
                      <Input
                        type="number"
                        name="authorizedDocs"
                        value={formData.authorizedDocs}
                        onChange={handleInputChange}
                        placeholder="Enter document count"
                        disabled={!isAdmin}
                        // maxLength={50} // Limit input to 10 digits
                        style={{ width: 200 }} // Set width of the input to hold 10 digits
                      />
                    </Form.Item>
                  </>
                )}
                {/* {formValues?.id === "master" && ( */}
                <>
                  {" "}
                  <Form.Item
                    label="Current User Count"
                    labelCol={{ span: 8 }} // Adjust label column width
                    wrapperCol={{ span: 16 }} // Adjust input column width
                    style={{ marginBottom: 10 }}
                  >
                    <Input
                      type="number"
                      name="addedUsers"
                      value={formData.addedUsers}
                      disabled={true}
                      // onChange={handleInputChange}
                      // placeholder="Total user count"
                      // maxLength={100}
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                  {/* Document Count Field with Label */}
                  <Form.Item
                    label="Current Document Count"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ marginBottom: 10 }}
                  >
                    <Input
                      type="number"
                      name="addedDocs"
                      value={formData?.addedDocs}
                      disabled={true}
                      // onChange={handleInputChange}
                      // placeholder="Enter document count"
                      // maxLength={50} // Limit input to 10 digits
                      style={{ width: 200 }} // Set width of the input to hold 10 digits
                    />
                  </Form.Item>
                </>
              </Form>
            </div>
          </TabPane>
          {/* Tab 2 - AI License */}
          <TabPane tab="AI License" key="2">
            <div className="container" style={{ padding: 10 }}>
              {/* OpenAI Key Section */}
              <div
                style={{ display: "flex", marginBottom: 10, flexWrap: "wrap" }}
              >
                {(formValues.id === "master" || addKey) && (
                  <div style={{ flex: 1, minWidth: 300, marginRight: 16 }}>
                    <Form.Item
                      label="OpenAI Key"
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      style={{ marginBottom: 10 }}
                    >
                      <TextArea
                        name="openAiKey"
                        value={formData.openAiKey}
                        onChange={handleInputChange}
                        placeholder="OpenAI Key"
                        style={{ marginBottom: 10, width: "100%" }}
                      />
                    </Form.Item>
                  </div>
                )}

                {((formValues.id !== "master" && isAdmin) || addKey) && (
                  <div style={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 300, marginRight: 16 }}>
                      <Form.Item
                        label="OpenAI IP Tokens"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ marginBottom: 10 }}
                      >
                        <input
                          name="openAiInputTokens"
                          type="number"
                          value={formData.openAiInputTokens}
                          onChange={handleInputChange}
                          placeholder="No of Input Tokens"
                          style={{ marginBottom: 10, width: "100%" }}
                        />
                      </Form.Item>
                    </div>

                    <div style={{ flex: 1, minWidth: 300 }}>
                      <Form.Item
                        label="OpenAI OP Tokens"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ marginBottom: 10 }}
                      >
                        <input
                          name="openAiOutputTokens"
                          type="number"
                          value={formData.openAiOutputTokens}
                          onChange={handleInputChange}
                          placeholder="No of Output Tokens"
                          style={{ marginBottom: 10, width: "100%" }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                )}
              </div>

              {/* TogetherAI Key Section */}
              <div
                style={{ display: "flex", marginBottom: 10, flexWrap: "wrap" }}
              >
                {(formValues?.id === "master" || addKey) && (
                  <div style={{ flex: 1, minWidth: 300, marginRight: 16 }}>
                    <Form.Item
                      label="TogetherAI Key"
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      style={{ marginBottom: 10 }}
                    >
                      <TextArea
                        name="togetherAIKey"
                        value={formData.togetherAIKey}
                        onChange={handleInputChange}
                        placeholder="TogetherAI Key"
                        style={{ marginBottom: 10, width: "100%" }}
                      />
                    </Form.Item>
                  </div>
                )}

                {((formValues.id !== "master" && isAdmin) || addKey) && (
                  <div style={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 300, marginRight: 16 }}>
                      <Form.Item
                        label="TogetherAI IP Tokens"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ marginBottom: 10 }}
                      >
                        <input
                          name="togetherAIInputTokens"
                          type="number"
                          value={formData.togetherAIInputTokens}
                          onChange={handleInputChange}
                          placeholder="No of Input Tokens"
                          style={{ marginBottom: 10, width: "100%" }}
                        />
                      </Form.Item>
                    </div>

                    <div style={{ flex: 1, minWidth: 300 }}>
                      <Form.Item
                        label="TogetherAI OP Tokens"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ marginBottom: 10 }}
                      >
                        <input
                          name="togetherAIOutputTokens"
                          type="number"
                          value={formData.togetherAIOutputTokens}
                          onChange={handleInputChange}
                          placeholder="No of Output Tokens"
                          style={{ marginBottom: 10, width: "100%" }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                )}
              </div>

              {/* Anthropic Key Section */}
              <div
                style={{ display: "flex", marginBottom: 10, flexWrap: "wrap" }}
              >
                {(formValues?.id === "master" || addKey) && (
                  <div style={{ flex: 1, minWidth: 300, marginRight: 16 }}>
                    <Form.Item
                      label="Anthropic Key"
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      style={{ marginBottom: 10 }}
                    >
                      <TextArea
                        name="anthropicKey"
                        value={formData.anthropicKey}
                        onChange={handleInputChange}
                        placeholder="Anthropic Key"
                        style={{ marginBottom: 10, width: "100%" }}
                      />
                    </Form.Item>
                  </div>
                )}

                {((formValues?.id !== "master" && isAdmin) || addKey) && (
                  <div style={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 300, marginRight: 16 }}>
                      <Form.Item
                        label="Anthropic IP Tokens"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ marginBottom: 10 }}
                      >
                        <input
                          name="anthropicInputTokens"
                          type="number"
                          value={formData.anthropicInputTokens}
                          onChange={handleInputChange}
                          placeholder="No of Input Tokens"
                          style={{ marginBottom: 10, width: "100%" }}
                        />
                      </Form.Item>
                    </div>

                    <div style={{ flex: 1, minWidth: 300 }}>
                      <Form.Item
                        label="Anthropic OP Tokens"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ marginBottom: 10 }}
                      >
                        <input
                          name="anthropicOutputTokens"
                          type="number"
                          value={formData.anthropicOutputTokens}
                          onChange={handleInputChange}
                          placeholder="No of Output Tokens"
                          style={{ marginBottom: 10, width: "100%" }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default License;
