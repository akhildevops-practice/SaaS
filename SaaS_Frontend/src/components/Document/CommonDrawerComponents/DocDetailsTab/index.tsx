//react, react-router, recoil
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  processDocFormData,
  drawerData,
  moduleNamesAtom,
  globalSearchClausesResult,
  globalSearchDocumentsResult,
} from "recoil/atom";

//antd
import { Col, Form, Input, Row, Select, Upload, Modal } from "antd";
import type { UploadProps } from "antd";

//material-ui
// import { Chip, MenuItem, makeStyles } from "@material-ui/core";
import { MdInbox } from 'react-icons/md';
import { MdAttachFile } from 'react-icons/md';
//components
import ReferencesResultPage from "pages/ReferencesResultPage";
// import { Select as MUISelect } from "@material-ui/core";
import {
  Select as MUISelect,
  MenuItem,
  makeStyles,
} from "@material-ui/core";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import axios from "apis/axios.global";
import { API_LINK } from "config";

const useStyles = makeStyles((theme: any) => ({
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
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
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

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleDocFormCreated?: any;
  uploadFileError?: any;
  setUploadFileError?: any;
  disableFormFields?: any;
  disableDocType?: any;
  isEdit?: any;
  activeTabKey?: any;
};
const DocDetailsTab = ({
  drawer,
  setDrawer,
  handleDocFormCreated,
  uploadFileError,
  setUploadFileError,
  disableFormFields,
  disableDocType,
  isEdit,
  activeTabKey,
}: Props) => {
  const classes = useStyles();
  const location = useLocation();
  const [expanded, setExpanded] = useState<any>(false);
  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const [systems, setSystems] = useState([]);
  const [sections, setSections] = useState([]);
  const [fileList, setFileList] = useState<any>([]);
  const [documentForm] = Form.useForm();
  const isInitialRender = useRef(true);
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>([]);
  const [selected, setSelected] = useState<any>([]);
  const [documentTableData, setDocumentTableData] = useState<any>([]);
  const [clauseTableData, setClauseTableData] = useState<any>([]);
  const [clauseData, setClauseData] = useState<any>([]);
  const [entity, setEntity] = useState([]);

  const [ncData, setNcData] = useState<any>([]);
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState(
    globalSearchClausesResult
  );
  const [globalSearchDocuments, setGlobalSearchDocuments] = useRecoilState(
    globalSearchDocumentsResult
  );
  const [isLoading, setIsLoading] = useState<any>(true);
  const orgId = sessionStorage.getItem("orgId");
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const labelColStyles = {
    color: "red",
    fontWeight: "bold",
  };

  useEffect(() => {}, [drawer?.mode]);

  useEffect(() => {
    if (drawer?.clearFields === true) {
      documentForm.setFieldsValue({
        documentName: "",
        doctypeName: undefined,
        systems: [],
        reasonOfCreation: "",
        description: "",
        tags: [],
      });
    }
  }, [drawer?.mode]);

  useEffect(() => {
    if (selected && selected.length > 0) {
      const filteredData = selected.reduce((unique: any, item: any) => {
        return unique.findIndex(
          (uniqueItem: any) =>
            uniqueItem.refId === item.refId && uniqueItem.type === item.type
        ) < 0
          ? [...unique, item]
          : unique;
      }, []);

      setSelectedData(filteredData);
    }
  }, [selected]);

  useEffect(() => {
    if (handleDocFormCreated) {
      handleDocFormCreated(documentForm);
    }
  }, [documentForm, handleDocFormCreated]);

  useEffect(() => {
    const GetSystems = async () => {
      try {
        setFormData &&
          setFormData({ ...formData, systems: [], docsClassification: "" });
        setSystems([]);
        formData?.docTypes?.map((value: any) => {
          if (value.documentTypeName === formData.doctypeName) {
            setSystems(value.applicable_systems);
          }
        });
      } catch (err) {
        console.log("Error:", err);
      }
    };
    GetSystems();
    getEntity();
  }, [formData.doctypeName]);
  useEffect(() => {
    formData?.docTypes?.map((value1: any) => {
      if (
        isInitialRender.current &&
        (isEdit || drawerDataState?.formMode === "edit")
      ) {
        isInitialRender.current = false;
        if (value1.documentTypeName === formData.doctypeName) {
          for (const appSystems of value1.applicable_systems) {
            if (formData?.systems?.includes(appSystems.id)) {
              setFormData({
                ...formData,
                docsClassification: value1.document_classification,
                doctypeId: value1.id,
              });
            }
          }
        }
      } else {
        if (value1.documentTypeName === formData.doctypeName) {
          for (const appSystems of value1.applicable_systems) {
            if (formData?.systems?.includes(appSystems.id)) {
              setFormData({
                ...formData,
                distributionUsers: value1.distributionUsers,
                distributionList: value1.distributionList,
                readAccess: value1.readAccess,
                readAccessUsers: value1.readAccessUsers,
                docsClassification: value1.document_classification,
                doctypeId: value1.id,
              });
            }
          }
        }
      }
    });
  }, [formData.doctypeName, formData.systems]);

  useEffect(() => {
    if (!isEdit) setFormData({ ...formData, entityId: userDetails.entityId });
  }, []);

  useEffect(() => {
    GetSections();
  }, [formData.entityId]);

  const GetSections = async () => {
    try {
      const sectionsResponse = await axios.get(
        `api/business/getAllSectionsForEntity/${formData?.entityId}`
      );
      setSections(sectionsResponse?.data);
    } catch (err) {
      console.log("Error:", err);
    }
  };
  const handleSectionChange = (value: any, option: any) => {
    setFormData({
      ...formData,
      section: value,
      sectionName: option.label,
    });
  };
  const handleDocTypeChange = async (value: any, option: any) => {
    setFormData({
      ...formData,
      ["doctypeName"]: value,
      // systems: [],
    });

    formData?.docTypes.map((item: any) => {
      if (item.documentTypeName === value) {
        setSystems(item.applicable_systems);
      }
    });
  };

  const handleSystemsChange = (value: any, option: any) => {
    setFormData({
      ...formData,
      ["systems"]: value,
    });
  };
  const handleTagsChange = (value: any, option: any) => {
    setFormData({
      ...formData,
      ["tags"]: value,
    });
  };

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false, // Prevent file from being uploaded immediately.
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setUploadFileError(false);
        setFormData({ ...formData, file: file });
        setFileList([file]); // Save file in state.
        documentForm.setFieldsValue({ uploader: file });
      }
    },
    onRemove: (file) => {
      setFileList((prevState: any) => []);
      setFormData({ ...formData, file: "" });
    },
    fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  const getEntity = async () => {
    try {
      const entityData = await axios.get("api/documents/getEntityForDocument");
      setEntity(entityData.data);
    } catch (err) {}
  };
  //Validation for fileType
  const validateFile = (file: any) => {
    const notAllowedExtensions = [".xlsx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (notAllowedExtensions.includes(fileExtension)) {
      // Show an error message or perform any other action
      return false;
    }

    // Return true to allow the upload
    return true;
  };
  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePressEnter = (event: any) => {
    if (event.key === "Enter") {
      redirectToGlobalSearch();
    }
  };

  const redirectToGlobalSearch = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleClickSearch = () => {
    redirectToGlobalSearch();
  };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  return (
    <>
      <Modal
        title={
          <div
          // className={classes.header}
          >
            {/* <img
              height={"50px"}
              width={"70px"}
              style={{ marginRight: "15px" }}
            /> */}

            <span
            // className={classes.moduleHeader}
            >
              Search Results
            </span>
          </div>
        }
        width={800}
        style={{ top: 100, right: 250 }}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        // closeIcon={
        //   <img
        //     src={CloseIconImageSvg}
        //     alt="close-drawer"
        //     style={{ width: "36px", height: "38px", cursor: "pointer" }}
        //   />
        // }
        footer={false}
        bodyStyle={{ overflow: "hidden" }}
        // className={classes.modalWrapper}
      >
        <ReferencesResultPage
          searchValue={searchValue}
          selected={selectedData}
          setSelected={setSelected}
          isModalVisible={isModalVisible}
          activeTab={activeTab}
          systems={formData.systems}
        />
      </Modal>
      <Form
        form={documentForm}
        layout="vertical"
        initialValues={{
          documentName: formData?.documentName||undefined,
          doctypeName: formData?.doctypeName,
          reasonOfCreation: formData?.reasonOfCreation,
          description: formData?.description,
          tags: formData?.tags,
          systems: formData.systems || [],
          entityId: formData.entityId || undefined,
          section: formData?.section || undefined,
        }}
        rootClassName={classes.labelStyle}
        // disabled={disableFormFields}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Title: "
              name="documentName"
              rules={[
                {
                  required: true,
                  message: "Please Enter Document Name!",
                },
              ]}
            >
              <Input
                name="documentName"
                placeholder="Enter Document Name"
                disabled={
                  formData.currentVersion === "A"
                    ? formData.status === "PUBLISHED"
                      ? true
                      : false
                    : true
                }
                size="large"
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.documentName}
                style={{
                  border:
                    drawer?.mode === "edit" || disableDocType
                      ? "1px solid red"
                      : undefined,
                  color: "black",
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Document Type: "
              name="doctypeName"
              rules={[
                {
                  required: true,
                  message: "Please select a document type!",
                },
              ]}
            >
              <Select
                placeholder="Select Doc Type"
                onChange={handleDocTypeChange}
                size="large"
                disabled={drawer?.mode === "edit" || disableDocType}
                value={undefined}
              >
                {formData?.docTypes?.map((option: any) => (
                  <Option
                    key={option.documentTypeName}
                    value={option.documentTypeName}
                    label={option.documentTypeName}
                  >
                    {option.documentTypeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="System: "
              name="systems"
              rules={[
                {
                  required: true,
                  message: "Please select a system",
                },
              ]}
            >
              <MUISelect
                fullWidth
                variant="outlined"
                multiple
                disabled={
                  formData.currentVersion === "A"
                    ? formData.status === "PUBLISHED"
                      ? true
                      : false
                    : true
                }
                value={formData.systems}
                onChange={(e) => {
                  handleSystemsChange(e.target.value, "");
                }}
              >
                {systems?.map((option: any, index) => (
                  <MenuItem key={option.id} value={option?.id}>
                    {option?.name}
                  </MenuItem>
                ))}
              </MUISelect>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Dept/Vertical: "
              rules={[
                {
                  required: true,
                  message: "Please select a Department!",
                },
              ]}
            >
              {entity.find((value: any) => value.id === formData.entityId) ? (
                <Select
                  placeholder="Select Entity:"
                  size="large"
                  value={formData.entityId}
                  showSearch
                  disabled={
                    ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                      formData?.documentState
                    )
                      ? true
                      : formData.currentVersion === "A"
                      ? formData.status === "new" || formData.status === "DRAFT"
                        ? false
                        : true
                      : true
                  }
                  optionFilterProp="children"
                  //defaultValue={selectedLocation.id}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setFormData({ ...formData, entityId: value });
                  }}
                  // className={drawer?.mode === "edit" ? classes.select : ""}
                >
                  {!!entity &&
                    !!entity.length &&
                    entity?.map((option: any, index: number) => (
                      <Option
                        key={index}
                        value={option?.id}
                        label={option?.entityName}
                      >
                        {option?.entityName}
                      </Option>
                    ))}
                </Select>
              ) : (
                <Input
                  value={formData?.entityName}
                  disabled={true}
                  size="large"
                ></Input>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Section: "
              name="section"
              rules={[
                {
                  required: true,
                  message: "Please select a System!",
                },
              ]}
            >
              <Select
                placeholder="Select Section"
                size="large"
                value={undefined}
                showSearch
                optionFilterProp="children"
                // className={drawer?.mode === "edit" ? classes.select : ""}
                disabled={
                  ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                    formData?.documentState
                  )
                    ? true
                    : false
                }
                //defaultValue={selectedLocation.id}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={handleSectionChange}
              >
                {!!sections &&
                  !!sections.length &&
                  sections?.map((option: any, index: number) => (
                    <Option key={index} value={option?.id} label={option?.name}>
                      {option?.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Reason for Creation/Amendment*: "
              name="reasonOfCreation"
              rules={[
                {
                  required: false,
                  message: "Please Enter Reason!",
                },
              ]}
            >
              <TextArea
                rows={1}
                autoSize={{ minRows: 1, maxRows: 6 }}
                placeholder="Enter Reason"
                size="large"
                name="reasonOfCreation"
                onChange={(e: any) => handleInputChange(e)}
                disabled={formData.status === "PUBLISHED" ? true : false}
                value={formData?.reasonOfCreation}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="Previous amendment reason: " name="description">
              <TextArea
                name="description"
                autoSize={{ minRows: 1, maxRows: 6 }}
                rows={1}
                placeholder="Enter Document Description"
                onChange={(e: any) => handleInputChange(e)}
                size="large"
                disabled={true}
                value={formData?.description}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="Document Tags: " name="tags">
              <Select
                mode="tags"
                size="large"
                style={{ width: "100%" }}
                placeholder="Add Tag By Pressing Enter"
                dropdownStyle={{ display: "none" }}
                onChange={handleTagsChange}
                value={formData?.tags}
              />
            </Form.Item>
          </Col>
        </Row> */}

        <div
          style={{
            height: "auto",
            maxHeight: "250px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <CommonReferencesTab
                clauseSearch={true}
                drawer={drawer}
                activeTabKey={activeTabKey}
              />
            </Col>
          </Row>
        </div>
        <Row gutter={[16, 16]} style={{ paddingTop: "50px" }}>
          <Col span={24}>
            <Form.Item
              name="uploader"
              style={{ display: "none" }} // Hide this input
            >
              <Input />
            </Form.Item>
            <p>
              NOTE: For viewing .xlsx / .xls files through viewer, ensure Header
              & Footer is enabled in the file before attaching
            </p>
            <Form.Item
              name="documentLink"
              label={
                formData.file !== "" ? "Change Uploaded File" : "Attach File: "
              }
              help={uploadFileError ? "Please upload a file!" : ""}
              validateStatus={uploadFileError ? "error" : ""}
            >
              <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                name="documentLink"
                {...uploadProps}
                className={classes.uploadSection}
              >
                <p className="ant-upload-drag-icon">
                  <MdInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
              </Dragger>
              {(drawer?.mode === "edit" ||
                drawerDataState?.formMode === "edit") &&
                !!formData.documentLink && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: "#f0f0f0",
                      padding: "5px",
                      borderRadius: "5px",
                      marginTop: "5px",
                    }}
                    onClick={async () => {
                      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
                        const url = await viewObjectStorageDoc(
                          formData.documentLink
                        );
                        window.open(url, "_blank");
                      } else {
                        window.open(formData.documentLink, "_blank");
                      }
                    }}
                  >
                    <MdAttachFile style={{ color: "#003059" }} />
                    <span
                      style={{
                        marginLeft: "5px",
                        color: "#003059",
                        fontWeight: "bold",
                      }}
                    >
                      Download
                    </span>
                  </div>
                )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default DocDetailsTab;
