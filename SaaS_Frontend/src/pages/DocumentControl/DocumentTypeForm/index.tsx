import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal } from "antd";
import {
  Select as MUISelect,
  MenuItem,
  CircularProgress,
} from "@material-ui/core";
import { MdChevronLeft } from "react-icons/md";
import AddDocumentForm from "components/AddDocumentForm";
import useStyles from "./styles";
import DocumentTypeFormComponent from "components/Document/DocumentType/DocumentTypeFormComponent";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { debounce } from "lodash";
import checkRoles from "utils/checkRoles";
import { isValidDocType } from "apis/documentsApi";
import { MdCheck } from "react-icons/md";
import {
  Col,
  Form,
  Row,
  Space,
  Button,
  Select,
  Input,
  Typography,
  message,
  Checkbox,
} from "antd";
import _ from "lodash";
import getSessionStorage from "utils/getSessionStorage";
import { Tabs, InputNumber } from "antd";
const { TabPane } = Tabs;
const { Option } = Select;
import clsx from "clsx";
const prefixDefaults = ["YY", "MM", "LocationId", "DepartmentId"];
const suffixDefaults = ["YY", "MM", "LocationId", "DepartmentId"];
const DocNum = ["Serial", "Manual"];
const readAccessOptionsList = [
  "All Users",
  "All in Units",
  "All in Entites",
  "Selected Users",
];
const distributeAccessOptionsList = [
  "None",
  "All Users",
  "All in Units",
  "All in Entities",
  "Selected Users",
  "Respective Entity",
  "Respective Unit",
];

const DocumentTypeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const [form] = Form.useForm<any>();
  const realmName = getAppUrl();
  const userDetails = getSessionStorage();
  const { isEdit, id } = location.state || {};

  const [formData, setFormData] = useState<any>({
    docReadAccess: "All Users",
    docDistributionList: "None",
    docCreateAccess: "All Users",
    whoCanDownload: "All Users",
    documentTypeName: "",
    prefix: [],
    suffix: [],
    applicable_locations: [],
    applicable_systems: [],
    docReadAccessIds: ["All"],
    docDistributionListIds: [],
    docCreateAccessIds: ["All"],
    whoCanDownloadIds: ["All"],
    selectedEntityTypes: [],
    documentNumbering: "Serial",
    workflowId: "none",
    initialVersion: "001",
    default: false,
  });

  const [isFormOptionsLoading, setIsFormOptionsLoading] = useState(true);

  const [locationOption, setLocationOption] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [entityOption, setEntityOption] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);

  const [currentPrefixOptions, setCurrentPrefixOptions] =
    useState<string[]>(prefixDefaults);
  const [currentSuffixOptions, setCurrentSuffixOptions] =
    useState<string[]>(suffixDefaults);
  const [customPrefix, setCustomPrefix] = useState<string>("");
  const [showCustomPrefix, setShowCustomPrefix] = useState<boolean>(false);
  const [customSuffix, setCustomSuffix] = useState<string>("");
  const [showCustomSuffix, setShowCustomSuffix] = useState<boolean>(false);

  const [prefixSample, setPrefixSample] = useState<string>("");
  const [suffixSample, setSuffixSample] = useState<string>("");

  const [formOptions, setFormOptions] = useState<any[]>([]);
  const [workflowList, setWorkflowList] = useState<any>();
  const [versionType, setVersionType] = useState(null);
  const [versionOptions, setVersionOptions] = useState<any>([]);
  const tabList = ["General", "Numbering & Revision", "Access Settings"];
  const [activeTab, setActiveTab] = useState("General");
  const [defaultTrue, setDefaultTrue] = useState<Boolean>(false);
  const [existingDefault, setExistingDefault] = useState<any>({});
  useEffect(() => {
    setIsFormOptionsLoading(true);
    Promise.all([
      getLocationOptions(),
      getUserOptions(),
      getDepartmentOptions(),
      getFormOptions(),
      fetchSystems(),
      getWorkflowList(),
    ])
      .then(() => {
        const initialPrefixes = _.uniq([...prefixDefaults]);
        const initialSuffixes = _.uniq([...suffixDefaults]);
        setCurrentPrefixOptions(initialPrefixes);
        setCurrentSuffixOptions(initialSuffixes);

        // If in edit mode, fetch document type details after options are loaded
        if (isEdit && id) {
          fetchDocumentTypeDetails();
        }
      })
      .catch((error) => {
        console.error("Error loading options:", error);
      })
      .finally(() => {
        setIsFormOptionsLoading(false);
      });
  }, [isEdit, id]);

  useEffect(() => {
    if (formData && formData.applicable_locations) {
      fetchSystems();
    }
  }, [formData?.applicable_locations]);

  useEffect(() => {
    const generateSample = (items: string[] | undefined) => {
      return (
        items
          ?.map((item: any) => {
            if (item === "YY")
              return String(new Date().getFullYear() % 100).padStart(2, "0");
            if (item === "MM")
              return String(new Date().getMonth() + 1).padStart(2, "0");
            if (item === "LocationId") return "LOC";
            if (item === "DepartmentId") return "DEP";
            return item;
          })
          .join("-") || ""
      );
    };
    setPrefixSample(generateSample(formData?.prefix));
    setSuffixSample(generateSample(formData?.suffix));
  }, [formData?.prefix, formData?.suffix]);
  useEffect(() => {
    if (isEdit && versionType) {
      handleVersionTypeChange(versionType);
    }
  }, [versionType]);

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/location/getAllLocations/${userDetails.organizationId}`
      );
      const ops = res.data.map((obj: any) => ({
        value: obj.id,
        label: obj.locationName,
        id: obj.id,
        locationName: obj.locationName,
      }));
      setLocationOption(ops);
    } catch (err) {
      // console.error("Error fetching location options:", err);
    }
  };

  const getUserOptions = async () => {
    try {
      const res = await axios(`/api/user/doctype/filterusers/${realmName}/all`);
      const ops = res.data.map((obj: any) => ({
        value: obj.id,
        label: obj.username,
        id: obj.id,
        name: obj.username,
      }));
      setUserOptions(ops);
    } catch (err) {
      // console.error("Error fetching user options:", err);
    }
  };

  const getDepartmentOptions = async () => {
    try {
      const res = await axios(`/api/entity`);
      const ops = res.data.map((obj: any) => ({
        value: obj.id,
        label: obj.entityName,
        id: obj.id,
        name: obj.entityName,
        entityTypeId: obj.entityTypeId,
      }));
      setEntityOption(ops);
    } catch (err) {
      // console.error("Error fetching entity options:", err);
    }
  };

  const getFormOptions = async () => {
    try {
      const res = await axios.get(
        `/api/documentforms/getallformtitles/${userDetails.organizationId}`
      );
      const formTitles = res.data.map((form: any) => ({
        value: form._id,
        label: form.formTitle,
      }));
      setFormOptions(formTitles);
    } catch (err) {
      // console.error("Error fetching form options:", err);
    }
  };

  const getWorkflowList = async () => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }/api/global-workflow/getGlobalWorkflowTableData?page=${0}&limit=${0}`
      );
      setWorkflowList([
        { _id: "none", title: "None" },
        { _id: "default", title: "Default" },
        ...response.data.tableData,
      ]);
    } catch (error) {
      // console.error("Error fetching upload status:", error);
    }
  };

  const fetchSystems = async () => {
    let locationIds = formData?.applicable_locations || ["All"];
    try {
      const encodedSystems = encodeURIComponent(JSON.stringify(locationIds));
      const { data } = await axios.get(
        `api/systems/displaySystems/${encodedSystems}`
      );
      setSystems(data || []);
    } catch (error) {
      // console.error("Error fetching systems:", error);
      setSystems([]);
    }
  };

  const fetchDocumentTypeDetails = async () => {
    try {
      setIsFormOptionsLoading(true);
      const res = await axios.get(`/api/doctype/${id}`);
      if (res.status === 200 && res.data.success) {
        const data = res.data.data;

        // Transform the data to match form structure
        const transformedData = {
          id: data._id,
          documentTypeName: data.documentTypeName,
          documentNumbering: data.documentNumbering,
          reviewFrequency: data.reviewFrequency,
          revisionRemind: data.revisionRemind,
          versionType: data?.versionType ? data?.versionType : "Alphabet",
          prefix: data.prefix ? data.prefix.split("-") : [],
          suffix: data.suffix ? data.suffix.split("-") : [],
          applicable_locations: data.applicable_locations || [],
          applicable_systems: data.applicable_systems || [],
          currentVersion: data.currentVersion,
          initialVersion: data.initialVersion,
          // Access control fields
          docReadAccess: data.docReadAccess,
          docReadAccessIds: data.docReadAccessIds || [],
          docCreateAccess: data.docCreateAccess,
          docCreateAccessIds: data.docCreateAccessIds || [],
          docDistributionList: data.docDistributionList,
          docDistributionListIds: Array.isArray(data.docDistributionListIds)
            ? data.docDistributionListIds
            : [data.docDistributionListIds].filter(Boolean),
          documentFormId: data.documentFormId,
          whoCanDownload: data.whoCanDownload,
          whoCanDownloadIds: data.whoCanDownloadIds || [],
          workflowId: data.workflowId,
          default: data?.default,
        };
        if (
          data.docDistributionList === "Respective Unit" &&
          userDetails?.locationId
        ) {
          transformedData.docDistributionListIds = [userDetails.locationId];
        }

        if (
          data.docDistributionList === "Respective Entity" &&
          userDetails?.entityId
        ) {
          transformedData.docDistributionListIds = [userDetails.entityId];
        }
        // console.log("Transformed Data:", transformedData);
        setFormData(transformedData);
        form.setFieldsValue(transformedData);
        setVersionType(data?.versionType);

        // Update prefix/suffix options if custom values exist
        if (data.prefix) {
          const prefixParts = data.prefix.split("-");
          const newPrefixOptions = _.uniq([...prefixDefaults, ...prefixParts]);
          setCurrentPrefixOptions(newPrefixOptions);
        }

        if (data.suffix) {
          const suffixParts = data.suffix.split("-");
          const newSuffixOptions = _.uniq([...suffixDefaults, ...suffixParts]);
          setCurrentSuffixOptions(newSuffixOptions);
        }
      }
    } catch (err) {
      // console.error("Error fetching document type details:", err);
      message.error("Failed to fetch document type details");
    } finally {
      setIsFormOptionsLoading(false);
    }
  };
  // console.log("formdata", formData);
  const handleVersionTypeChange = (value: any) => {
    setVersionType(value);

    const previousVersionType = form.getFieldValue("versionType");

    if (previousVersionType && previousVersionType !== value) {
      form.setFieldsValue({ currentVersion: undefined });
    }
    if (value === "Alphabet") {
      const alphabets = [...Array(26)].map((_, i) => {
        const char = String.fromCharCode(65 + i);
        return { label: char, value: char };
      });
      setVersionOptions(alphabets);
    } else if (value === "Numeric") {
      const numerics = [...Array(9)].map((_, i) => {
        const num = (i / 10).toFixed(1); // 0.0 to 0.9
        return { label: num, value: num };
      });
      setVersionOptions(numerics);
    } else {
      setVersionOptions([]);
    }
  };

  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    let newState = formData
      ? { ...formData, ...changedValues }
      : { ...changedValues };
    let updateFormNeeded = false;

    const changedField = Object.keys(changedValues)[0];

    if (changedField === "docReadAccess") {
      newState.docReadAccessIds =
        changedValues.docReadAccess === "All Users" ? ["All"] : [];
      updateFormNeeded = true;
    }
    if (changedField === "docDistributionList") {
      if (changedValues.docDistributionList === "Respective Unit") {
        newState.docDistributionListIds = [userDetails.locationId];
      } else if (changedValues.docDistributionList === "Respective Entity") {
        newState.docDistributionListIds = [userDetails.entityId];
      } else if (changedValues.docDistributionList === "All Users") {
        newState.docDistributionListIds = ["All"];
      } else if (changedValues.docDistributionList === "None") {
        newState.docDistributionListIds = [];
      } else {
        newState.docDistributionListIds = [];
      }
      updateFormNeeded = true;
    }

    if (changedField === "docCreateAccess") {
      newState.docCreateAccessIds =
        changedValues.docCreateAccess === "All Users" ? ["All"] : [];

      // Reset selection when changing access type
      if (
        ["All in Entities", "All in Units", "Selected Users"].includes(
          changedValues.docCreateAccess
        )
      ) {
        newState.docCreateAccessIds = [];
      }

      newState.selectedEntityTypes = [];
      updateFormNeeded = true;
    }

    if (changedField === "whoCanDownload") {
      newState.whoCanDownloadIds =
        changedValues.whoCanDownload === "All Users" ? ["All"] : [];

      // Reset selection when changing access type
      if (
        ["All in Entities", "All in Units", "Selected Users"].includes(
          changedValues.whoCanDownload
        )
      ) {
        newState.whoCanDownloadIds = [];
      }

      newState.selectedEntityTypes = [];
      updateFormNeeded = true;
    }
    if (changedField === "selectedEntityTypes") {
      newState.docCreateAccessIds = [];
      updateFormNeeded = true;
    }
    if (
      changedField === "documentNumbering" &&
      changedValues.documentNumbering !== "Serial"
    ) {
      newState.prefix = [];
      newState.suffix = [];
      updateFormNeeded = true;
    }

    setFormData(newState);

    if (updateFormNeeded) {
      form.setFieldsValue(newState);
    }
  };

  const handleAddCustomPrefix = () => {
    if (customPrefix && !currentPrefixOptions.includes(customPrefix)) {
      const newOptions = [...currentPrefixOptions, customPrefix];
      setCurrentPrefixOptions(newOptions);
      const currentPrefixValue = formData?.prefix || [];
      const newPrefixValue = [...currentPrefixValue, customPrefix];
      setFormData({ ...formData, prefix: newPrefixValue });
      form.setFieldsValue({ prefix: newPrefixValue });
      setShowCustomPrefix(false);
      setCustomPrefix("");
    }
  };
  const handleEditCustomPrefix = () => setShowCustomPrefix(true);

  const handleAddCustomSuffix = () => {
    if (customSuffix && !currentSuffixOptions.includes(customSuffix)) {
      const newOptions = [...currentSuffixOptions, customSuffix];
      setCurrentSuffixOptions(newOptions);
      const currentSuffixValue = formData?.suffix || [];
      const newSuffixValue = [...currentSuffixValue, customSuffix];
      setFormData({ ...formData, suffix: newSuffixValue });
      form.setFieldsValue({ suffix: newSuffixValue });
      setShowCustomSuffix(false);
      setCustomSuffix("");
    }
  };
  const handleEditCustomSuffix = () => setShowCustomSuffix(true);

  const handlePrefixChange = (value: string[]) => {
    setFormData({ ...formData, prefix: value });
    form.setFieldsValue({ prefix: value });
  };
  const handleSuffixChange = (value: string[]) => {
    setFormData({ ...formData, suffix: value });
    form.setFieldsValue({ suffix: value });
  };

  const handleSubmit = async () => {
    // console.log("inside submit");
    try {
      const values = await form.validateFields();

      // Transform only the necessary fields
      const transformedData = {
        ...values,
        prefix:
          values.prefix && values.prefix.length > 0
            ? values.prefix.join("-")
            : "",
        suffix:
          values.suffix && values.suffix.length > 0
            ? values.suffix.join("-")
            : "",
        reviewFrequency: values.reviewFrequency
          ? Number(values.reviewFrequency)
          : 0,
        revisionRemind: values.revisionRemind
          ? Number(values.revisionRemind)
          : 30,
        organizationId: userDetails.organizationId,
        createdBy: userDetails.id,
        default: values?.default ? values?.default : false,
      };

      // Log transformed data
      // console.log("=== TRANSFORMED FORM DATA ===");
      // console.log(transformedData);
      // console.log("default true ", defaultTrue, existingDefault);

      if (!isEdit) {
        const res = await axios.post("/api/doctype", transformedData);
        // console.log("Response", res);
        if (res.status === 200 || res?.status === 201) {
          message.success("Document Type created successfully");
          if (defaultTrue === true && existingDefault) {
            // console.log("insideif");
            const res = await axios.patch(
              `/api/doctype/${existingDefault?._id.toString()}`,
              {
                ...existingDefault,
                default: false,
              }
            );
            // console.log("res", res);
          }
          navigate("/processdocuments/documenttype");
        }
      } else {
        const res = await axios.patch(`/api/doctype/${id}`, transformedData);
        // console.log("Response", res);
        if (res.status === 200 || res?.status === 201) {
          message.success("Document Type updated successfully");
          if (defaultTrue === true && existingDefault) {
            // console.log("insideif");
            const res = await axios.patch(
              `/api/doctype/${existingDefault?._id.toString()}`,
              {
                ...existingDefault,
                default: false,
              }
            );
          }
          navigate("/processdocuments/documenttype");
        }
      }
    } catch (errorInfo) {
      // console.log("Failed validation:", errorInfo);
    }
  };

  const handleDiscard = () => {
    setDefaultTrue(false);
    setExistingDefault({});
    navigate("/processdocuments/documenttype");
  };

  const handleApplicableLocationsChange = (value: string[]) => {
    if (value.includes("All")) {
      // If "All" is selected, make it the only selection
      setFormData({ ...formData, applicable_locations: ["All"] });
      form.setFieldsValue({ applicable_locations: ["All"] });
    } else {
      // If "All" was previously selected and now removed, allow other selections
      setFormData({ ...formData, applicable_locations: value });
      form.setFieldsValue({ applicable_locations: value });
    }
  };

  const renderReadAccessSectiopn = () => (
    <div
      style={{
        background: "#f9fafb",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "24px",
      }}
    >
      <Typography.Title level={5} style={{ marginBottom: "16px" }}>
        Read Access Settings
      </Typography.Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Read Access"
            name="docReadAccess"
            rules={[{ required: true, message: "Please select read access!" }]}
          >
            <Select placeholder="Select Access Type">
              {readAccessOptionsList.map((item, i) => (
                <Option key={i} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.docReadAccess === "All Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Read Access])
                  </span>
                </span>
              }
              name="docReadAccessIds"
            >
              <Select
                mode="multiple"
                value={["All"]}
                disabled
                style={{ width: "100%" }}
              >
                <Option value="All">All</Option>
              </Select>
            </Form.Item>
          </Col>
        )}

        {formData.docReadAccess === "All in Units" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Units
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Read Access)
                  </span>
                </span>
              }
              name="docReadAccessIds"
              rules={[{ required: true, message: "Please select units!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Units"
                style={{ width: "100%" }}
                options={locationOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.docReadAccess === "All in Entites" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Entities
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Read Access)
                  </span>
                </span>
              }
              name="docReadAccessIds"
              rules={[{ required: true, message: "Please select entities!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Entities"
                style={{ width: "100%" }}
                options={entityOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.docReadAccess === "Selected Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Read Access)
                  </span>
                </span>
              }
              name="docReadAccessIds"
              rules={[{ required: true, message: "Please select users!" }]}
            >
              <Select
                mode="multiple"
                showSearch
                placeholder="Select Users"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                options={userOptions}
              />
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );

  const renderDistributionListSection = () => (
    <div
      style={{
        background: "#f9fafb",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "24px",
      }}
    >
      <Typography.Title level={5} style={{ marginBottom: "16px" }}>
        Distribution List Settings
      </Typography.Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={
              <span>
                Distribution List
                <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                  (Distribution List)
                </span>
              </span>
            }
            name="docDistributionList"
            rules={[
              {
                required: true,
                message: "Please select distribution list!",
              },
            ]}
          >
            <Select placeholder="Select Distribution Type">
              {distributeAccessOptionsList.map((item, i) => (
                <Option key={i} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.docDistributionList === "All Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Distribution List)
                  </span>
                </span>
              }
              name="docDistributionListIds"
            >
              <Select
                mode="multiple"
                value={["All"]}
                disabled
                style={{ width: "100%" }}
              >
                <Option value="All">All</Option>
              </Select>
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "All in Units" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Units
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Distribution List)
                  </span>
                </span>
              }
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select units!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Units"
                style={{ width: "100%" }}
                options={locationOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "All in Entities" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Entities
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Distribution List)
                  </span>
                </span>
              }
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select entities!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Entities"
                style={{ width: "100%" }}
                options={entityOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "Selected Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Distribution List)
                  </span>
                </span>
              }
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select users!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Users"
                style={{ width: "100%" }}
                options={userOptions}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}
        {formData.docDistributionList === "Respective Unit" && (
          <Col span={12}>
            <Form.Item
              label="Allowed Unit"
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select a unit!" }]}
            >
              <Select
                disabled
                style={{ width: "100%" }}
                value={formData.docDistributionListIds}
                options={locationOption}
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        )}

        {formData.docDistributionList === "Respective Entity" && (
          <Col span={12}>
            <Form.Item
              label="Allowed Entity"
              name="docDistributionListIds"
              rules={[{ required: true, message: "Please select an entity!" }]}
            >
              <Select
                disabled
                style={{ width: "100%" }}
                value={formData.docDistributionListIds}
                options={entityOption}
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );
  const getDefaultDoctype = async () => {
    try {
      const result = await axios.get(
        `/api/doctype/getDefaultDoctype/${userDetails?.organizationId}`
      );
      return result?.data;
    } catch (error) {}
  };

  const handleOk = async (existingDefault: any) => {
    // console.log("existingDefault", existingDefault);
    try {
      setFormData((prev: any) => ({
        ...prev,
        default: true,
      }));
      form.setFieldsValue({ default: true });
      setDefaultTrue(true);
      // const res = await axios.patch(
      //   `/api/doctype/${existingDefault?._id.toString()}`,
      //   {
      //     ...existingDefault,
      //     default: false,
      //   }
      // );
    } catch (error) {}
  };
  const handleCheckboxChange = async (e: any) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      try {
        const response = await getDefaultDoctype();
        const existingDefault = response;
        setExistingDefault(response[0]);

        if (existingDefault?.length > 0 && existingDefault[0]._id) {
          Modal.confirm({
            title: "Default Document Type Already Exists",
            content: `The document type "${existingDefault[0]?.documentTypeName}" is already set as default. Do you want to replace it?`,
            okText: "Yes",
            cancelText: "No",
            onOk: () => {
              handleOk(existingDefault[0]);
            },
            onCancel: () => {
              // Uncheck the box since user cancelled
              setFormData((prev: any) => ({
                ...prev,
                default: false,
              }));
              form.setFieldsValue({ default: false });
            },
          });
        } else {
          // No existing default, allow selection directly
          setFormData((prev: any) => ({
            ...prev,
            default: true,
          }));
          form.setFieldsValue({ default: true });
        }
      } catch (error) {
        console.error("Error checking existing default document type:", error);
        // Optional: show error notification
      }
    } else {
      // Unchecking the box doesn't need confirmation
      setFormData((prev: any) => ({
        ...prev,
        default: false,
      }));
      form.setFieldsValue({ default: false });
    }
  };

  const renderCreateAccessSection = () => (
    <div
      style={{
        background: "#f9fafb",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "24px",
      }}
    >
      <Typography.Title level={5} style={{ marginBottom: "16px" }}>
        Create Access Settings
      </Typography.Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Create Access"
            name="docCreateAccess"
            rules={[
              { required: true, message: "Please select create access!" },
            ]}
          >
            <Select placeholder="Who can create?">
              {[
                "All Users",
                "Selected Users",
                "PIC",
                "Head",
                "All in Entities",
                "All in Units",
              ].map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.docCreateAccess === "All Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Create Access)
                  </span>
                </span>
              }
              name="docCreateAccessIds"
            >
              <Select
                value={["All"]}
                disabled
                mode="multiple"
                style={{ width: "100%" }}
              >
                <Option value="All">All</Option>
              </Select>
            </Form.Item>
          </Col>
        )}

        {formData.docCreateAccess === "Selected Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Create Access)
                  </span>
                </span>
              }
              name="docCreateAccessIds"
              rules={[{ required: true, message: "Please select users!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Users"
                style={{ width: "100%" }}
                options={userOptions}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.docCreateAccess === "All in Entities" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Entities
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Create Access)
                  </span>
                </span>
              }
              name="docCreateAccessIds"
              rules={[{ required: true, message: "Please select entities!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Entities"
                style={{ width: "100%" }}
                options={entityOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.docCreateAccess === "All in Units" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Units
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Create Access)
                  </span>
                </span>
              }
              name="docCreateAccessIds"
              rules={[{ required: true, message: "Please select units!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Units"
                style={{ width: "100%" }}
                options={locationOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {["PIC", "Head"].includes(formData.docCreateAccess) && (
          <>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Allowed Entities
                    <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                      (Create Access)
                    </span>
                  </span>
                }
                name="docCreateAccessIds"
                rules={[{ required: true, message: "Please select entities!" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select Entities"
                  style={{ width: "100%" }}
                  options={entityOption.map((ent) => ({
                    label: ent.name,
                    value: ent.id,
                  }))}
                  optionFilterProp="label"
                  filterOption={(input: any, option: any) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
    </div>
  );

  const renderWhoCanDownloadSection = () => (
    <div
      style={{
        background: "#f9fafb",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "24px",
      }}
    >
      <Typography.Title level={5} style={{ marginBottom: "16px" }}>
        Who Can Download Settings
      </Typography.Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Download Access"
            name="whoCanDownload"
            rules={[
              { required: true, message: "Please select Who Can Download!" },
            ]}
          >
            <Select placeholder="Who can Download?">
              {[
                "All Users",
                "Selected Users",
                "PIC",
                "Head",
                "All in Entities",
                "All in Units",
              ].map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {formData.whoCanDownload === "All Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Download Access)
                  </span>
                </span>
              }
              name="whoCanDownloadIds"
            >
              <Select
                value={["All"]}
                disabled
                mode="multiple"
                style={{ width: "100%" }}
              >
                <Option value="All">All</Option>
              </Select>
            </Form.Item>
          </Col>
        )}

        {formData.whoCanDownload === "Selected Users" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Users
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Download Access)
                  </span>
                </span>
              }
              name="whoCanDownloadIds"
              rules={[{ required: true, message: "Please select users!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Users"
                style={{ width: "100%" }}
                options={userOptions}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.whoCanDownload === "All in Entities" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Entities
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Create Access)
                  </span>
                </span>
              }
              name="whoCanDownloadIds"
              rules={[{ required: true, message: "Please select entities!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Entities"
                style={{ width: "100%" }}
                options={entityOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {formData.whoCanDownload === "All in Units" && (
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Allowed Units
                  <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                    (Download Access)
                  </span>
                </span>
              }
              name="whoCanDownloadIds"
              rules={[{ required: true, message: "Please select units!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Units"
                style={{ width: "100%" }}
                options={locationOption}
                optionFilterProp="label"
                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        )}

        {["PIC", "Head"].includes(formData.whoCanDownload) && (
          <>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Allowed Entities
                    <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                      (Download Access)
                    </span>
                  </span>
                }
                name="whoCanDownloadIds"
                rules={[{ required: true, message: "Please select entities!" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select Entities"
                  style={{ width: "100%" }}
                  options={entityOption.map((ent) => ({
                    label: ent.name,
                    value: ent.id,
                  }))}
                  optionFilterProp="label"
                  filterOption={(input: any, option: any) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
    </div>
  );

  return (
    <div>
      <div className={classes.header} style={{ padding: "20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Important!
            width: "100%",
          }}
        >
          {/* Left Part: Back button + Heading */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              // type="link"
              onClick={() => navigate("/processdocuments/documenttype")}
              style={{
                display: "flex",
                alignItems: "center",
                padding: 15,
                marginLeft: "12px",
              }}
            >
              <MdChevronLeft style={{ fontSize: 20, marginRight: "-3px" }} />
              <span style={{ fontSize: "16px" }}>Back</span>
            </Button>

            <Typography
              style={{ paddingLeft: "20px", fontWeight: 500, fontSize: "20px" }}
            >
              Document Type Form
            </Typography>
          </div>

          {/* Right Part: Discard and Submit buttons */}
          <div style={{ display: "flex", gap: "12px", marginRight: "10px" }}>
            <Button onClick={handleDiscard}>Discard</Button>
            <Button
              type="primary"
              style={{ backgroundColor: "rgb(0, 48, 89)" }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px", position: "relative", padding: "10px" }}>
        {isFormOptionsLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </div>
        )}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
            disabled={isFormOptionsLoading}
            onValuesChange={handleFormValuesChange}
            size="large"
            style={{ paddingRight: "10px" }}
            className={classes.docTypeForm}
          >
            <div className={classes.customTabWrapper}>
              {tabList.map((tab) => (
                <div
                  key={tab}
                  className={clsx(classes.customTab, {
                    [classes.activeTab]: activeTab === tab,
                  })}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
            <div
              style={{ display: activeTab === "General" ? "block" : "none" }}
            >
              <Row gutter={16}>
                <Col span={10}>
                  <Form.Item
                    label="Document Type Name"
                    name="documentTypeName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter document type name!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter Document Type Name" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    label="Default Settings"
                    name="default"
                    valuePropName="checked"
                  >
                    <Checkbox onChange={handleCheckboxChange}>
                      Set as Default
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    label="Applicable Units"
                    name="applicable_locations"
                    rules={[
                      { required: true, message: "Please select units!" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Select Units"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: "100%" }}
                      options={[
                        { label: "All", value: "All" },
                        ...locationOption,
                      ]}
                      onChange={handleApplicableLocationsChange}
                      value={formData.applicable_locations}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Applicable Systems"
                    name="applicable_systems"
                    rules={[
                      { required: true, message: "Please select systems!" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Select Systems"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: "100%" }}
                      options={systems?.map((sys) => ({
                        label: sys.name,
                        value: sys.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Select Workflow" name="workflowId">
                    <Select
                      placeholder="Select a Workflow"
                      style={{ width: "100%" }}
                      options={workflowList?.map((workflow: any) => ({
                        label: workflow.title,
                        value: workflow._id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Select Form" name="documentFormId">
                    <Select
                      placeholder="Select a form"
                      style={{ width: "100%" }}
                      options={formOptions}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Review Frequency" name="reviewFrequency">
                  <InputNumber min={1} max={100000} defaultValue={30} style={{width : '200px'}} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div
              style={{
                display:
                  activeTab === "Numbering & Revision" ? "block" : "none",
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Document Numbering"
                    name="documentNumbering"
                    rules={[
                      {
                        required: true,
                        message: "Please select numbering type!",
                      },
                    ]}
                  >
                    <Select placeholder="Select numbering">
                      {DocNum.map((item, i) => (
                        <Option key={i} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {formData.documentNumbering === "Serial" && (
                  <>
                    {/* Prefix */}
                    <Col span={8}>
                      <Form.Item label="Prefix" name="prefix">
                        <MUISelect
                          labelId="prefix-label"
                          multiple
                          variant="outlined"
                          value={formData.prefix || []}
                          onChange={(e: any) =>
                            handlePrefixChange(e.target.value as string[])
                          }
                          renderValue={(selected: any) =>
                            (selected as string[]).join("-")
                          }
                          style={{ width: "100%" }}
                        >
                          {currentPrefixOptions.map((item, i) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </MUISelect>
                      </Form.Item>
                      {!showCustomPrefix ? (
                        <Button
                          type="primary"
                          size="small"
                          style={{
                            marginTop: 8,
                            backgroundColor: "rgb(0, 48, 89)",
                          }}
                          onClick={handleEditCustomPrefix}
                        >
                          Add Custom Prefix
                        </Button>
                      ) : (
                        <Input
                          placeholder="Enter custom prefix"
                          value={customPrefix}
                          onChange={(e) => setCustomPrefix(e.target.value)}
                          onPressEnter={handleAddCustomPrefix}
                          suffix={
                            <MdCheck
                              style={{ cursor: "pointer" }}
                              onClick={handleAddCustomPrefix}
                            />
                          }
                        />
                      )}
                    </Col>

                    {/* Suffix */}
                    <Col span={8}>
                      <Form.Item label="Suffix" name="suffix">
                        <MUISelect
                          labelId="suffix-label"
                          multiple
                          variant="outlined"
                          value={formData.suffix || []}
                          onChange={(e: any) =>
                            handleSuffixChange(e.target.value as string[])
                          }
                          renderValue={(selected: any) =>
                            (selected as string[]).join("-")
                          }
                          style={{ width: "100%" }}
                        >
                          {currentSuffixOptions.map((item, i) => (
                            <MenuItem key={i} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </MUISelect>
                      </Form.Item>
                      {!showCustomSuffix ? (
                        <Button
                          type="primary"
                          size="small"
                          style={{
                            marginTop: 8,
                            backgroundColor: "rgb(0, 48, 89)",
                          }}
                          onClick={handleEditCustomSuffix}
                        >
                          Add Custom Suffix
                        </Button>
                      ) : (
                        <Input
                          placeholder="Enter custom suffix"
                          value={customSuffix}
                          onChange={(e) => setCustomSuffix(e.target.value)}
                          onPressEnter={handleAddCustomSuffix}
                          suffix={
                            <MdCheck
                              style={{ cursor: "pointer" }}
                              onClick={handleAddCustomSuffix}
                            />
                          }
                        />
                      )}
                    </Col>

                    {/* Format Preview */}
                    <Col
                      span={24}
                      style={{
                        textAlign: "start",
                        marginBottom: 16,
                        paddingLeft: "calc(50% + 8px)",
                      }}
                    >
                      <Typography.Text strong>
                        Format Sample:{" "}
                        <Typography.Text type="secondary">
                          ({prefixSample || "PRE"} - 001 -{" "}
                          {suffixSample || "SUF"})
                        </Typography.Text>
                      </Typography.Text>
                    </Col>
                  </>
                )}
              </Row>
              <Row gutter={16}>
                {/* Version Controls */}
                <Col span={6}>
                  <Form.Item
                    label="Version Type"
                    name="versionType"
                    rules={[
                      {
                        required: true,
                        message: "Please select version type!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select Version Type"
                      onChange={handleVersionTypeChange}
                    >
                      <Option value="Alphabet">Alphabet</Option>
                      <Option value="Numeric">Numeric</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Initial Version"
                    name="initialVersion"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter initial version of the document!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter Initial version" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Minor Version Limit"
                    name="currentVersion"
                    rules={[
                      { required: true, message: "Please select version!" },
                    ]}
                  >
                    <Select placeholder="Select Version">
                      {versionOptions.map((opt: any) => (
                        <Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div
              style={{
                display: activeTab === "Access Settings" ? "block" : "none",
              }}
            >
              {renderReadAccessSectiopn()}
              {renderDistributionListSection()}
              {renderCreateAccessSection()}
              {renderWhoCanDownloadSection()}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default DocumentTypeForm;
