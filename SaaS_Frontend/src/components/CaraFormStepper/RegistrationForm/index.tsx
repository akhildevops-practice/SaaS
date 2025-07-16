import {
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";

import {
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Upload,
  Modal,
  Radio,
} from "antd";

import type { UploadProps, RadioChangeEvent } from "antd";

import { useEffect, useState } from "react";

import { API_LINK } from "config";

import TextArea from "antd/es/input/TextArea";
import { useSnackbar } from "notistack";
import { getEntityByLocationId } from "apis/entityApi";
import CrossIcon from "assets/icons/BluecrossIcon.svg";

import moment from "moment";
import dayjs from "dayjs";
import { caraRegistrationForm } from "recoil/atom";
import getYearFormat from "utils/getYearFormat";

import { validateDescription, validateTitle } from "utils/validateInput";
import axios from "apis/axios.global";
import { FiPlus } from "react-icons/fi";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

const { Dragger } = Upload;
const { Option } = Select;

const useStyles = makeStyles((theme) => ({
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      backgroundColor: "white",
      color: "black",

      // border: "none",
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
    "& .ant-select-disabled .ant-select-selection-item span": {
      color: "black !important", // Enforcing the color on the span element
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
    "&.ant-upload-wrapper .ant-upload-drag .ant-upload": {
      padding: "5px 0px",
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
type Props = {
  formData?: any;
  setFormData?: any;
  isEdit?: any;
  open?: any;
  setOpen?: any;
  submitted?: any;
  setSubmitted?: any;
  readMode?: any;
  setFormStatus?: (formStatus: string) => void;
  setRejectEdit?: any;
  refForCapaForm2?: any;
  refForCapaForm3?: any;
  refForCapaForm4?: any;
  refForCapaForm5?: any;
  refForCapaForm6?: any;
  refForCapaForm7?: any;
  refForCapaForm8?: any;
};
const RegistrationForm = ({
  formData,
  setFormData,
  isEdit,

  open,
  setOpen,
  submitted,
  setSubmitted,
  readMode,
  setFormStatus,

  setRejectEdit,
  refForCapaForm2,
  refForCapaForm3,
  refForCapaForm4,
  refForCapaForm5,
  refForCapaForm6,
  refForCapaForm7,
  refForCapaForm8,
}: Props) => {
  const classes = useStyles();
  const [selectedDept, setSelectedDept] = useState<any>({});
  const [systems, setSystems] = useState<any>([]);
  const [optionsData, setOptionsData] = useState<any>([]);
  const [users, setUsers] = useState([]);
  const [defectsData, setDefectsData] = useState<any>([]);
  const [entityUsers, setEntityUsers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [kpis, setKpis] = useState([]);

  const [investForm] = Form.useForm();
  const [caraOwnerForm] = Form.useForm();
  const [value, setValue] = useState(1);
  const { enqueueSnackbar } = useSnackbar();
  const [productOptions, setProductOptions] = useState([]);
  const { RangePicker } = DatePicker;
  const [kpiSelect, setKpiSelect] = useState<any>(false);
  const [currentYear, setCurrentYear] = useState<any>();
  // const [reOpen, setReOpen] = useState<any>(false);
  // const [location, setLocation] = useState([]);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: loggedInUser?.location?.id,
    locationName: loggedInUser?.location?.locationName,
  });
  const matches = useMediaQuery("(min-width:786px)");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [commentError, setCommentError] = useState("");

  const validateComment = (value: any) => {
    let error = "";
    validateTitle(null, value, (validationError) => {
      if (validationError) {
        error = validationError;
      }
    });
    return error;
  };
  // console.log("formData in reg form", formData, isEdit);
  useEffect(() => {
    if (!!isEdit && isEdit) {
      // fetchInitialDepartment(formData?.entityId?.id);
      // console.log("formdata in useeffect isedit inside", formData);
      if (formData?.origin?._id) {
        investForm.setFieldsValue({
          origin: formData?.origin?._id || "",
        });
      }
      if (formData?.kpiId) {
        investForm.setFieldsValue({ kpiId: formData?.kpiId });
      }
      if (formData?.locationId) {
        investForm.setFieldsValue({ locationId: formData?.locationId });
        setSelectedLocation({
          id: formData?.locationId,
          locationName: formData?.locationDetails?.locationName,
        });
      }
      if (formData?.serialNumber) {
        investForm.setFieldsValue({
          serialNumber: formData?.serialNumber,
        });
      }

      if (formData?.description) {
        investForm.setFieldsValue({ description: formData?.description });
      }
      if (formData?.title) {
        investForm.setFieldsValue({ title: formData?.title });
      }
      if (formData?.registeredBy) {
        investForm.setFieldsValue({
          registeredBy: formData?.registeredBy?.username,
        });
      }
      if (formData?.caraCoordinator) {
        investForm.setFieldsValue({
          caraCoordinator: formData?.caraCoordinator?.id,
          coordinator: formData?.coordinator,
        });
      }
      if (formData?.entity) {
        investForm.setFieldsValue({ entity: formData?.entity });
      }
      const systemValues = formData?.systems?.map((system: any) => system);
      investForm.setFieldsValue({ systems: systemValues });

      if (formData?.startDate && formData?.endDate) {
        const formattedStartDate = moment(formData?.startDate).format(
          "DD-MM-YYYY"
        );
        const formattedEndDate = moment(formData?.endDate).format("DD-MM-YYYY");
        investForm.setFieldsValue({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
      }
      if (formData?.caraOwner) {
        investForm.setFieldsValue({ caraOwner: formData?.caraOwner });
      }
      if (formData?.productId) {
        investForm.setFieldsValue({ productId: formData?.productId });
      }
      if (formData?.defectType) {
        investForm.setFieldsValue({ defectType: formData?.defectType });
      }
      if (formData?.status) {
        if (formData?.status === "Accepted") {
          setValue(1);
        } else if (formData?.status === "Rejected") {
          setValue(2);
          setRejectEdit(true);
          investForm.setFieldsValue({ comments: "" });
        }
      }
    } else {
      // investForm.resetFields();
      // caraOwnerForm.resetFields();

      if (!isEdit)
        investForm.setFieldsValue({
          title: formData.title !== "" ? formData?.title : "",
        });
    }
  }, [isEdit, formData]);

  useEffect(() => {
    fetchInitialDepartment(
      formData?.entityId ? formData?.entityId?.id : loggedInUser?.entityId
    );
  }, [formData?.entityId]);
  // console.log("formdata", formData);
  useEffect(() => {
    getAllKpis();
    getData();
    getAllLocations();
    fetchSystemNames();
    getAllEntities();
    getProductOptions();
    // getAllUserByEntities();
  }, [selectedLocation]);
  useEffect(() => {
    fetchInitialDepartment(
      formData?.entityId ? formData?.entityId?.id : loggedInUser?.entityId
    );
  }, [formData?.entityId]);
  useEffect(() => {
    getAllUserByEntities();
  }, [open]);
  // console.log("formdata in cara", isEdit, open);

  useEffect(() => {
    // if (!!formData?.entity) {
    getAllUserForEntity(formData?.entity);
  }, [formData?.entity]);
  useEffect(() => {
    if (!!formData?.productId) {
      getDefectsData(formData?.productId);
    }
  }, [formData?.productId]);
  const fetchInitialDepartment = async (id: string) => {
    try {
      const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
      const entity = res.data;

      setSelectedDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
      setFormData((prevData: any) => ({
        ...prevData,
        entity: entity?.id,
      }));
    } catch (error) {
      console.error("Failed to fetch initial department:", error);
    }
  };

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onRemove: (file) => {
      const updatedFileList = formData.registerfiles.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registerfiles: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registerfiles: fileList,
      }));
    },
  };
  // console.log("users", users);
  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
    const status = e.target.value === 1 ? "Accepted" : "Rejected";

    setFormData({
      ...formData,

      status: status,
    });

    // console.log(e.target.value, "formData...Detail");
  };
  // console.log(systems, "formData...Detail");
  const handleDateRange = (values: any) => {
    if (!values || !Array.isArray(values)) {
      // Handle the case where values is not defined or not an array

      enqueueSnackbar("select a valid date range", { variant: "error" });
      return;
    }
    const [start, end] = values; // Destructure values to get the start and end moments
    const startDate = start?.format("YYYY-MM-DD");
    const endDate = end?.format("YYYY-MM-DD");
    const date = {
      startDate: startDate,
      endDate: endDate,
    };

    setFormData({
      ...formData,
      date: date,
      startDate: startDate,
      endDate: endDate,
    });
  };

  // console.log("formdata in cara registeration and isedit", formData, isEdit);

  const getAllEntities = async () => {
    try {
      // console.log("location", selectedLocation);

      let data = await axios.get(
        `/api/cara/getEntitiesForLocation/${selectedLocation?.id}`
      );

      // console.log(data, "entities");
      if (data?.data) {
        setEntities(
          data.data?.map((item: any) => ({
            ...item,
            label: item.entityName,
            value: item.id,
          }))
        );
      }
    } catch (error) {}
  };

  const getAllUserByEntities = async () => {
    try {
      // console.log("get all users called", formData?.entity);
      //let entityId = JSON.parse(window.sessionStorage.getItem("userDetails")!);
      let data = await axios.get(
        `/api/cara/getAllUsersOfEntity/${formData?.entity}`
      );

      if (data?.data) {
        // console.log(data?.data?.otherUsers, "users");

        // Combine both arrays with unique users while preserving order
        const userMap = new Map();
        (data?.data?.deptHead || []).forEach((user: any) =>
          userMap.set(user.id, user)
        );
        (data?.data?.otherUsers || []).forEach((user: any) =>
          userMap.set(user.id, user)
        );

        const combinedUsers: any = Array.from(userMap.values());
        setUsers(combinedUsers);
        // console.log("combined users", combinedUsers);
        // Set default value for caraOwner if not already set
        // if (
        //   !formData?.caraOwner &&
        //   combinedUsers?.length > 0 &&
        //   !!combinedUsers
        // ) {
        //   setFormData({ ...formData, caraOwner: combinedUsers[0]?.id });
        // }
      }
    } catch (error) {}
  };
  const getAllUserForEntity = async (entity: any) => {
    try {
      let data = await axios.get(
        `/api/cara/getAllUsersOfEntity/${
          entity ? entity : loggedInUser?.entityId
        }`
      );

      if (data?.data) {
        // Combine both arrays with unique users while preserving order
        const userMap = new Map();

        // Adding deptHead users
        (data?.data?.deptHead || []).forEach((user: any) =>
          userMap.set(user.id, { value: user.id, label: user.username })
        );

        // Adding otherUsers
        (data?.data?.otherUsers || []).forEach((user: any) =>
          userMap.set(user.id, { value: user.id, label: user.username })
        );

        // Convert the map to an array
        const combinedUsers: any = Array.from(userMap.values());

        // Set the combined users in state
        setEntityUsers(combinedUsers);
        // setUsers(combinedUsers);
      }
    } catch (error) {
      // console.error("Error fetching users:", error);
    }
  };
  const getProductOptions = async () => {
    try {
      // console.log("selecte", selectedLocation);
      const locid = selectedLocation
        ? selectedLocation?.id
        : loggedInUser?.location?.id;

      const res = await axios.get(`/api/cara/getProductsForLocation/${locid}`);

      if (res?.data) {
        const formattedOptions = res.data.map((product: any) => ({
          value: product.id,
          label: product.entityName,
        }));

        setProductOptions(formattedOptions);
      }
    } catch (err) {
      // console.error("Error fetching products:", err);
    }
  };
  const getData = async () => {
    try {
      let res = await axios.get(`/api/cara/getAllDeviationType`);
      if (res?.data) {
        setOptionsData(res?.data?.data);
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
    }
  };

  const getDefectsData = async (id: any) => {
    try {
      let res = await axios.get(`/api/cara/getDefectForProduct/${id}`);
      if (res?.data) {
        setDefectsData(res?.data);
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
    }
  };

  const { confirm } = Modal;

  const hideModal = (val: string) => {
    if (val === "Accepted" && formData.status === "Accepted") {
      setSubmitted(true);
      if (setFormStatus) {
        setFormStatus("Submitted");
      }
    } else if (formData.status === "Rejected") {
      if (setFormStatus) {
        setFormStatus("Rejected");
      }
    }
    confirm({
      title: "",
      content: "Please click on Submit to save the form",
      onOk() {
        setOpen(false);
      },
      onCancel() {},
    });
  };

  const handleKpiName = (e: any) => {
    setFormData({
      ...formData,
      kpiId: e,
    });
  };

  const [error, setError] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    validateDescription(null, value, (error) => {
      if (error) {
        // Handle the validation error (e.g., set an error state or show a message)
        // console.error(error);
        setError(error);
      } else {
        // Only update form data if there are no validation errors
        setError("");
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    });
  };

  const clearFile = async (data: any) => {
    try {
      const updatedFileList = formData.registerfiles.filter(
        (item: any) => item.uid !== data.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registerfiles: updatedFileList,
      }));
    } catch (error) {
      return error;
    }
  };
  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const getAllKpis = async () => {
    try {
      let res = await axios.get(`api/kpi-definition/getAllKpi`);
      if (res.data) {
        setKpis(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // const parselocation: any = (data: any) => {
  //   let locations: any = [];
  //   data?.map((item: any) => {
  //     locations.push({
  //       locationName: item.locationName,
  //       id: item.id,
  //     });
  //   });

  //   return locations;
  // };
  const GetSystems = async (locationId: any) => {
    let encodedSystems: any;
    if (locationId === "All") {
      encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    } else {
      encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    }
    const { data } = await axios.get(
      `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
    );
    setSystems([
      ...data?.map((item: any) => ({
        ...item,
        label: item.name,
        value: item.id,
      })),
    ]);
    //console.log("systems", systems);
  };
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const fetchSystemNames = async () => {
    try {
      let locationData = JSON.parse(
        window.sessionStorage.getItem("userDetails")!
      );
      const encodedLoc = encodeURIComponent(
        JSON.stringify([locationData.location.id])
      );
      GetSystems(selectedLocation?.id);

      // setSystems(response);
    } catch (error) {
      // console.log({ error });
      enqueueSnackbar("Something went wrong while fetching system types1!", {
        variant: "error",
      });
    }
  };
  // const getSuggestionListLocation = (value: any, type: string) => {
  //   typeAheadValue = value;
  //   typeAheadType = type;
  //   debouncedSearchLocation();
  // };

  // const debouncedSearchLocation = debounce(() => {
  //   getLocation(typeAheadValue, typeAheadType);
  // }, 50);

  const getAllLocations = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${loggedInUser?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };
  return (
    <Form
      layout="vertical"
      form={investForm}
      //initialValues={{ entityId: formData?.entityId?.entityName }}
      initialValues={{
        locationId: loggedInUser?.location?.id,
        // caraCoordinator: formData?.caraCoordinator,
        //  caraOwner: loggedInUser.id,
      }}
      onValuesChange={(changedValues, allValues) =>
        setFormData({ ...formData, ...changedValues })
      }
      rootClassName={classes.labelStyle}
      style={{ margin: "27px" }}
    >
      {/* <Button
          type="dashed"
          style={{
            marginBottom: "10px",
          }}
        >
          {formData?.status ?? "Form Status"}
        </Button> */}
      <Row gutter={[12, 12]}>
        <Col span={24}>
          <Form.Item
            label="Problem Statement"
            name="title"
            rules={[
              {
                required: true,
              },
              {
                validator: validateTitle,
              },
            ]}
            className={classes.disabledInput}
            style={{ marginBottom: 0, paddingTop: "10px" }}
          >
            {/* <div ref={refForCapaForm2}> */}
            <TextArea
              autoSize={{ minRows: 1 }}
              // autoSize={{ minRows: 3, maxRows: 6 }} // You can adjust minRows and maxRows as per your preference
              placeholder="Enter CAPA title"
              size="large"
              name="title"
              onChange={(e: any) => handleChange(e)}
              value={formData?.title}
              defaultValue={formData?.title}
              required={true}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
            />
            {/* </div> */}
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={[12, 12]}
        style={{
          display: "flex",
          flexDirection: matches ? "row" : "column",
          gap: "0px",
          alignItems: "center",
          marginTop: matches ? "15px" : "0px",
        }}
      >
        <Col span={matches ? 12 : 24}>
          <Form.Item
            label="Type:"
            name="type"
            rules={[
              {
                required: true,
              },
            ]}
            className={classes.disabledSelect}
            // style={{ paddingTop: "10px" }}
          >
            {/* <div ref={refForCapaForm3}> */}
            <Select
              placeholder="Select Type"
              size="large"
              value={formData?.type}
              disabled={true}
              defaultValue="Manual"
            >
              <Option value="manual" label="Manual" key="manual">
                Manual
              </Option>
              <Option value="system" label="System" key="system">
                System
              </Option>
            </Select>
            {/* </div> */}
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item
            label="Origin:"
            name="origin"
            rules={[
              {
                required: true,
              },
            ]}
            className={classes.disabledSelect}
            // style={{ paddingTop: "10px" }}
          >
            {/* <div ref={refForCapaForm4}> */}
            <Select
              placeholder="Select Origin"
              onSelect={(value: string) => {
                const selectedOption = optionsData.find(
                  (option: any) => option._id === value
                );
                const isKpiSelected: boolean =
                  selectedOption &&
                  selectedOption.deviationType?.toLowerCase().includes("kpi");
                // console.log("iskpiselected", isKpiSelected, selectedOption);
                setKpiSelect(isKpiSelected);
                setFormData({
                  ...formData,
                  origin: value,
                });
              }}
              size="large"
              value={formData?.origin}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
            >
              {optionsData?.map((option: any) => (
                <Option
                  value={option._id}
                  label={option.deviationType}
                  key={option._id}
                >
                  {option?.deviationType}
                </Option>
              ))}
            </Select>
            {/* </div> */}
          </Form.Item>
        </Col>
      </Row>

      {(kpiSelect || formData?.kpiId) && (
        <Form.Item
          label={` Kpi Name :`}
          name="kpiId"
          className={classes.disabledSelect}
        >
          <Select
            placeholder="Select Kpi Name"
            onChange={handleKpiName}
            size="large"
            value={formData?.kpiId}
            disabled={
              readMode ||
              formData?.status === "Open" ||
              formData?.status === "Accepted" ||
              formData?.status === "Outcome_In_Progress" ||
              formData?.status === "Analysis_In_Progress" ||
              formData?.status === "Closed"
            }
          >
            {kpis &&
              kpis?.length > 0 &&
              kpis?.map((kpi: any) => {
                return (
                  <Option value={kpi?._id} label={kpi?.kpiName} key={kpi?.id}>
                    {kpi.kpiName}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
      )}
      {(kpiSelect || formData.kpiId) && (
        <Col span={24}>
          <Form.Item label="Deviation From: ">
            <RangePicker
              format="DD-MM-YYYY"
              value={[
                formData?.startDate ? dayjs(formData?.startDate) : null,
                formData?.endDate ? dayjs(formData?.endDate) : null, // Static end date
              ]}
              onChange={handleDateRange}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
              // disabled={readStatus}
            />
          </Form.Item>
        </Col>
      )}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item
            label="Description: "
            name="description"
            className={classes.disabledInput}
            // style={{ marginBottom: 0, paddingTop: "10px" }}

            rules={[
              {
                validator: validateDescription,
              },
            ]}
          >
            {/* <div ref={refForCapaForm5}> */}
            <TextArea
              // rows={6} // Increase the number of rows to adjust the height
              autoSize={{ minRows: 1 }}
              placeholder="Enter Description"
              size="large"
              name="description"
              onChange={(e: any) => handleInputChange(e)}
              value={formData?.description}
              defaultValue={formData?.description}
              required={true}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
            />
            {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
          </Form.Item>
        </Col>
      </Row>

      <Row
        gutter={[16, 16]}
        style={{
          display: "flex",
          flexDirection: matches ? "row" : "column",
          gap: "0px",
        }}
      >
        <Col span={matches ? 12 : 24}>
          <Form.Item
            label="Responsible Unit:"
            // name="entityId"
            name="locationId"
            rules={[
              {
                required: true,
              },
            ]}
            className={classes.disabledSelect}
          >
            {/* <div ref={refForCapaForm6}> */}
            <Select
              showSearch
              // placeholder="Filter By Unit"
              placeholder="Select Unit"
              optionFilterProp="children"
              //defaultValue={selectedLocation.id}
              filterOption={(input: any, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              // style={{ width: "100%" }}
              size="large"
              value={selectedLocation}
              options={locationOptions || []}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
              onChange={(e: any, value: any) => {
                // console.log("value in auto", value.id);
                // setFormData((prevFormData: any) => ({
                //   ...prevFormData,
                //   // location: value,
                //   locationId: value.id,
                // }));
                setSelectedLocation({
                  id: value?.id,
                  locationName: value?.locationName,
                });

                investForm.setFieldsValue({
                  // caraCoordinator: formData?.caraCoordinator?.id,
                  entity: undefined,
                });
              }}
            />
            {/* </div> */}
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item
            label="Responsible Entity:"
            // name="entityId"
            name="entity"
            rules={[
              {
                required: true,
              },
            ]}
            className={classes.disabledSelect}
          >
            {/* <div ref={refForCapaForm7}> */}
            {/* <Select
              placeholder="Responsible Entity"
              onChange={(e: any) => {
              
                setFormData((prevData: any) => ({
                  ...prevData,
                  entity: e,
                  coordinator: undefined,
                  caraCoordinator: undefined,
                }));
                investForm.setFieldsValue({
               
                  coordinator: undefined,
                });
               
                getAllUserForEntity(e);
              }}
              size="large"
              value={formData?.entity}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
            >
              {entities &&
                entities.length > 0 &&
                entities.map((entity: any) => (
                  <Option
                    key={entity.id}
                    value={entity.value}
                    label={entity.id}
                  >
                    {entity.entityName}
                  </Option>
                ))}
            </Select> */}
            <DepartmentSelector
              locationId={formData?.locationId}
              selectedDepartment={selectedDept}
              onSelect={(dept, type) => {
                setSelectedDept({ ...dept, type }),
                  setFormData((prevData: any) => ({
                    ...prevData,
                    entity: dept?.id,
                    coordinator: undefined,
                    caraCoordinator: undefined,
                  }));
                investForm.setFieldsValue({
                  // caraCoordinator: formData?.caraCoordinator?.id,
                  coordinator: undefined,
                });
                getAllUserForEntity(dept?.id);
              }}
              onClear={() => setSelectedDept(null)}
            />
            {/* </div> */}
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="Product"
            name="productId"
            className={classes.disabledSelect}
          >
            <Select
              showSearch
              placeholder="Select Product"
              optionFilterProp="children"
              size="large"
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
              filterOption={(input, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              value={formData?.productId}
              options={productOptions || []}
              onChange={(e, value) => {
                // console.log("value", value);
                setFormData({ ...formData, productId: value?.value });
                getDefectsData(value?.value);
                investForm.setFieldsValue({
                  defectType: undefined,
                });
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Defect Type"
            name="defectType"
            className={classes.disabledSelect}
          >
            <Select
              placeholder="Select a defect"
              size="large"
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
              value={formData.selectedOption}
              onChange={(value) =>
                setFormData((prev: any) => ({ ...prev, defectType: value }))
              }
            >
              {defectsData?.map((item: any) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={10}>
          <Form.Item
            label={
              // activeModules?.includes("AI_FEATURES") && isEdit ? (
              //   <div
              //     style={{
              //       display: "flex",
              //       justifyContent: "flex-start",
              //       alignItems: "flex-end",
              //     }}
              //   >
              //     Description{" "}
              //     <Tooltip title="AI Suggestion">

              //       <Button
              //         type="text"
              //         icon={<AiIcon />}
              //         onClick={() => handleSearchCapaInDoc()}
              //       />
              //     </Tooltip>
              //   </div>
              // ) : (
              <>Impact Type</>
              // )
            }
            name="impactType"
            className={classes.disabledInput}
            // style={{ marginBottom: 0, paddingTop: "10px" }}
          >
            {/* <div ref={refForCapaForm5}> */}
            <Input
              name="impactType"
              value={formData?.impactType}
              defaultValue={formData?.impactType}
              required={true}
              disabled={true}
            />
            {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            label={<>Impact</>}
            name="impact"
            className={classes.disabledInput}
            // style={{ marginBottom: 0, paddingTop: "10px" }}
          >
            {/* <div ref={refForCapaForm5}> */}
            <Input
              name="impact"
              value={formData?.impact?.join(", ")}
              defaultValue={formData?.impact?.join(", ")}
              required={true}
              disabled={true}
            />
            {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label={<>Priority</>}
            name="highPriority"
            className={classes.disabledInput}
          >
            <Input
              name="highPriority"
              value={formData?.highPriority ? "High" : "Normal"}
              defaultValue={formData?.highPriority ? "High" : "Normal"}
              required={true}
              disabled={true} // Keep the input disabled
            />
            {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item
            label="Responsible Person :"
            name="coordinator"
            rules={[
              {
                required: true,
              },
            ]}
            className={classes.disabledSelect}
          >
            <Select
              placeholder="Responsible Person"
              onChange={(value) => {
                // When a value is selected, update formData with the user ID
                setFormData((prevData: any) => ({
                  ...prevData,
                  caraCoordinator: value,
                  coordinator: value, // Store only the user ID
                }));
              }}
              size="large"
              value={formData?.caraCoordinator} // Make sure the value is user.id
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
              showSearch // Enables search functionality in the dropdown
              optionFilterProp="label" // Search will be performed on `label`, which is the username
              filterOption={(input: any, option: any) => {
                // Custom filter function to search by the label (username)
                return option?.label
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
            >
              {entityUsers?.map((user: any) => (
                <Option key={user.value} value={user.value} label={user.label}>
                  {user.label}{" "}
                  {/* This is what will be displayed in the dropdown */}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item
            label="System:"
            // name="systemId"
            name="systems"
            // rules={[
            //   {
            //     required: true,
            //   },
            // ]}
            className={classes.disabledSelect}
          >
            {/* <div ref={refForCapaForm8}> */}
            <Select
              placeholder="Select systems"
              onChange={(selectedValues: any) =>
                setFormData((prevData: any) => ({
                  ...prevData,
                  systems: selectedValues,
                }))
              }
              size="large"
              value={formData?.systems}
              mode="multiple"
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
            >
              {systems &&
                systems?.length > 0 &&
                systems?.map((system: any) => (
                  <Option
                    key={system?.id}
                    value={system?.id}
                    label={system?.id}
                  >
                    {system?.name}
                  </Option>
                ))}
            </Select>
            {/* </div> */}
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="Attachments"
            // name="fileList"
            //   help={uploadFileError ? "Please upload a file!" : ""}
            //   validateStatus={uploadFileError ? "error" : ""}
            style={{ marginBottom: "-10px", width: "150px" }}
          >
            <Dragger
              accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
              name="fileList"
              {...uploadFileprops}
              className={`${classes.uploadSection} ant-upload-drag-container`}
              showUploadList={false}
              fileList={formData.registerfiles}
              multiple
              disabled={
                readMode ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
              style={{
                padding: "8px 0px",
                // display: "flex",
                // justifyContent: "center",
                // alignItems: "center",
                // gap: "10px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {" "}
                <FiPlus />
                <p
                  style={{
                    padding: "0px 0px",
                    margin: "0px 0px",
                  }}
                >
                  Upload Files
                </p>
              </span>
            </Dragger>
          </Form.Item>
        </Col>
        {/* <Col span={24}>
                <Tooltip title="Upload files">
                  <Button
                    type="primary"
                    href="#"
                    onClick={() => {
                      setClick(true);
                      addSelectedFiles(fileList);
                    }}
                    className={classes.submitBtn}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Upload Files
                  </Button>
                </Tooltip>
              </Col> */}
        {/* <Col span={24}>
            <strong>
              <span
                style={{
                  color: "red",
                  fontSize: "10px",
                }}
              >
                {!!fileList.length
                  ? "!!Click on Upload files button to upload"
                  : ""}
              </span>
            </strong>
          </Col> */}
      </Row>
      <Row>
        {uploadLoading ? (
          <div>Please wait while documents get uploaded</div>
        ) : (
          formData.registerfiles &&
          formData?.registerfiles?.length > 0 &&
          formData?.registerfiles?.map((item: any) => (
            <div
              style={{
                display: "flex",
                marginLeft: "10px",
                alignItems: "center",
              }}
              key={item.uid}
            >
              <Typography
                className={classes.filename}
                onClick={() => handleLinkClick(item)}
              >
                {/* <a
                        href={`${item?.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLinkClick(item)}
                      > */}
                {item?.name}
                {/* </a> */}
              </Typography>

              <IconButton
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Draft" ||
                  formData?.status === "Closed"
                }
                onClick={() => {
                  // console.log("item click");
                  clearFile(item);
                }}
              >
                <img src={CrossIcon} alt="" />
              </IconButton>
            </div>
          ))
        )}
      </Row>

      <Modal
        title="Accepted Status?"
        open={open}
        onOk={() => {
          if (value === 1 && submitted) {
            setFormData({
              ...formData,
              status: "Accepted",
            });
            //investForm.setFieldsValue({ ...formData, status: "ACCEPTED" });
            // console.log("formData...Detail");
          } else if (value === 2) {
            setFormData({
              ...formData,
              status: "Rejected",
            });
          }
          hideModal("Accepted");
        }}
        onCancel={() => hideModal("Rejected")}
        okText="Submit"
        style={{
          marginLeft: "auto", // Adjust the left margin as needed
          marginRight: "25px", // Center the modal horizontally if needed
        }}
        centered={false}
      >
        <Form
          layout="vertical"
          form={caraOwnerForm}
          initialValues={{
            caraOwner: loggedInUser.id,
            comments: "",
            radioStatus: 2,
          }}
        >
          <Radio.Group
            onChange={onChange}
            value={value}
            name="radioStatus"
            style={{
              marginTop: "6%",
            }}
            disabled={readMode || formData?.status === "CLOSED"}
          >
            <Radio value={1}>Accepted</Radio>
            <Radio value={2}>Rejected</Radio>
          </Radio.Group>
          <Form.Item
            label="Comments"
            name="comments"
            rules={[
              {
                required: true,
              },
              {
                validator: validateTitle,
              },
            ]}
            style={{
              marginTop: "6%",
            }}
            className={classes.disabledInput}
          >
            <TextArea
              rows={6} // Increase the number of rows to adjust the height
              autoSize={{ minRows: 3, maxRows: 6 }} // You can adjust minRows and maxRows as per your preference
              placeholder="Enter Comments"
              size="large"
              name="comments"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                const error = validateComment(value);

                if (error) {
                  setCommentError(error); // Set error if validation fails
                } else {
                  setCommentError(""); // Clear error if validation passes
                  setFormData({
                    ...formData,
                    comments: value, // Update comments in formData
                  });
                }
              }}
              value={formData?.comments}
              //defaultValue={formData?.comments}
              required={true}
              disabled={readMode || formData?.status === "Closed"}
            />
            {commentError && <div style={{ color: "red" }}>{commentError}</div>}{" "}
            {/* Display error message */}
          </Form.Item>
          {value === 1 && submitted && (
            <>
              <Form.Item
                label="CAPA Owner"
                name="caraOwner"
                rules={[
                  {
                    required: true,
                  },
                ]}
                className={classes.disabledSelect}
              >
                <Select
                  placeholder="CAPA Owner"
                  onSelect={(value) => {
                    const ownerId =
                      typeof value === "object" ? value?.key : value;

                    //  console.log("value in capa owner", value);
                    setFormData({ ...formData, caraOwner: ownerId });
                  }}
                  size="large"
                  value={formData?.caraOwner ? formData?.caraOwner : users[0]}
                  disabled={readMode || formData?.status === "Closed"}
                >
                  {users &&
                    users.length > 0 &&
                    users?.map((user: any) => (
                      <Option value={user.id} key={user.id}>
                        {formData?.deptHead &&
                        formData?.deptHead?.some(
                          (deptHeadUser: any) => deptHeadUser?.id === user?.id
                        ) ? (
                          <span>
                            <span role="img" aria-label="star">
                              ⭐
                            </span>{" "}
                            {user?.username}
                          </span>
                        ) : (
                          user.username
                        )}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Form>
  );
};

export default RegistrationForm;
