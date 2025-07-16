//react, react-router, recoil
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import CrossIcon from "assets/icons/BluecrossIcon.svg";
import {
  drawerData,
  moduleNamesAtom,
  globalSearchClausesResult,
  globalSearchDocumentsResult,
  cipFormData,
} from "recoil/atom";

//antd
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Upload,
  Modal,
  Table,
  Tooltip,
  InputNumber,
  Button,
  Popconfirm,
  Table as BenefitsTable,
  message,
} from "antd";
import type { UploadProps } from "antd";

//material-ui
import {
  IconButton,
  TextField,
  Typography,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
//components
import axios from "apis/axios.global";
import useStyles from "./style";
import getAppUrl from "utils/getAppUrl";
import { useSnackbar } from "notistack";
import { API_LINK } from "config";

const useStylesDate = makeStyles((theme) => ({
  dateInput: {
    border: "1px solid #dadada",
    width: "100% !important",
    height: "40px !important",
    borderRadius: "7px",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
    "& .MuiInputBase-input.Mui-disabled": {
      padding: "10px",
      cursor: "not-allowed",
    },
  },
}));

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleCipFormCreated?: any;
  benefits?: any;
  setBenefits?: any;
  uploadFileError?: any;
  setUploadFileError?: any;
  disableFormFields?: any;
  disableDocType?: any;
  template?: any;
  setTemplate?: any;
  isEdit?: any;
  activeTabKey?: any;
  refForcipForm2?: any;
  refForcipForm3?: any;
  refForcipForm4?: any;
  refForcipForm5?: any;
  refForcipForm6?: any;
  refForcipForm7?: any;
};
const CipDetailsTab = ({
  drawer,
  template,
  benefits,
  setBenefits,
  setDrawer,
  setTemplate,
  handleCipFormCreated,
  uploadFileError,
  setUploadFileError,
  disableFormFields,
  disableDocType,
  isEdit,
  activeTabKey,
  refForcipForm2,
  refForcipForm3,
  refForcipForm4,
  refForcipForm5,
  refForcipForm6,
  refForcipForm7,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const classes = useStyles();
  const ClassesDate = useStylesDate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<any>(false);
  const [formData, setFormData] = useRecoilState(cipFormData);
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const [systems, setSystems] = useState([]);
  const [fileList, setFileList] = useState<any>([]);
  const [cipForm] = Form.useForm();
  const isInitialRender = useRef(true);
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  // const [formData, setFormData] = useState<any>([]);
  const [selected, setSelected] = useState<any>([]);
  const [categoryList, setCategoryList] = useState<any>([]);
  const [typeList, setTypeList] = useState<any>([]);
  const [teamList, setTeamList] = useState<any>([]);

  // for cip origin
  const [originList, setOriginList] = useState<any>([]);
  const [documentTableData, setDocumentTableData] = useState<any>([]);
  const [clauseTableData, setClauseTableData] = useState<any>([]);
  const [clauseData, setClauseData] = useState<any>([]);
  const [ncData, setNcData] = useState<any>([]);
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [deptData, setDeptData] = useState<any>([]);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState(
    globalSearchClausesResult
  );
  const [globalSearchDocuments, setGlobalSearchDocuments] = useRecoilState(
    globalSearchDocumentsResult
  );
  const [isLoading, setIsLoading] = useState<any>(true);
  const orgId = sessionStorage.getItem("orgId");
  const labelColStyles = {
    color: "red",
    fontWeight: "bold",
  };
  const { enqueueSnackbar } = useSnackbar();
  const HeadersData = ["Benefit Area", "Metric", "UOM", "Verifier", "Comments"];
  const FieldsData = ["benefitArea", "metric", "uom", "Verifier", "Comments"];
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const orgName = getAppUrl();

  const actionData: any = {
    isAction: true,
    actions: [
      {
        label: "Edit",
        icon: "icon",
        handler: () => console.log("handler"),
      },
    ],
  };

  // useEffect(() => {
  //   console.log("checkdocument activeTabKey in doc details tab", activeTabKey);
  //   getCategoryList();
  //   getTypeList(formData?.locationId);
  // }, [drawer?.mode]);

  useEffect(() => {
    getCategoryList();
    getDepartment();
    getTypeList(isEdit ? formData?.location?.id : userInfo?.location?.id);
    getOriginList(isEdit ? formData?.location?.id : userInfo?.location?.id);
    getTeamsList();
    if (drawer?.clearFields === true) {
      cipForm.setFieldsValue({
        title: "",
        targetDate: undefined,
        cipCategoryId: undefined,
        cipTeamId: undefined,
        cipTypeId: undefined,
        justification: "",
        cost: 0,
        tangibleBenefits: [],
        attachments: [],
        year: "2023",
        locationId: "",
        createdBy: "",
        cipOrigin: undefined,
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

      setFormData(filteredData);
    }
  }, [selected]);

  // useEffect(() => {
  //   console.log("checkdoc formData in doc details tab  --->", formData);
  // }, [formData]);

  useEffect(() => {
    if (handleCipFormCreated) {
      handleCipFormCreated(cipForm);
    }
  }, [cipForm, handleCipFormCreated]);

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePressEnter = (event: any) => {
    if (event.key === "Enter") {
      // console.log("press enter", searchValue);
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
    // console.log("click search", searchValue);
    redirectToGlobalSearch();
  };

  const getCategoryList = async () => {
    const response = await axios.get(
      `/api/cip/getAllCIPCategory?page${0}&limit${null}`
    );
    if (response.status === 200 || response.status === 201) {
      const data = response?.data?.data.map((item: any) => {
        return {
          id: item._id,
          name: item.categoryName,
        };
      });
      setCategoryList(data);
    } else {
      enqueueSnackbar("Error while fetching data", {
        variant: "error",
      });
    }
  };

  const getTeamsList = async () => {
    try {
      const response = await axios.get(
        `/api/cip/getAllCIPTeams?cipCreate=${true}`
      );
      if (response.status === 200 || response.status === 201) {
        const data = response?.data?.data.map((item: any) => {
          return {
            id: item._id,
            name: item.teamName,
          };
        });
        setTeamList(data);
      }
    } catch (error: any) {
      if (!error.response) {
        message.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        message.error(error.response);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const getDepartment = async () => {
    const res = await axios.get(`/api/entity`);
    if (res.status === 200 || res.status === 201) {
      const deptData = res?.data?.map((item: any) => {
        return {
          id: item.id,
          name: item.entityName,
        };
      });
      setDeptData(deptData);
    }
  };

  const getTypeList = async (locationId: string) => {
    const response = await axios.get(
      `/api/cip/getCIPTypeByLocation/${locationId}`
    );
    if (response.status === 200 || response.status === 201) {
      let typesbylocation: any = [];
      const data = response.data.map((item: any) => {
        typesbylocation = [...typesbylocation, ...item.options];
      });
      setTypeList(typesbylocation);
    }
  };

  // for cip origin [function for api]
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
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
  const getOriginList = async (locationId: string) => {
    const response = await axios.get(
      `/api/cip/getCIPOriginByLocation/${locationId}`
    );
    if (response.status === 200 || response.status === 201) {
      let typesbylocation: any = [];
      const data = response.data.map((item: any) => {
        typesbylocation = [...typesbylocation, ...item.options];
      });
      setOriginList(typesbylocation);
    }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList: template?.files || [],
    onRemove: (file) => {
      const updatedFileList = template.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setTemplate((prevTemplate: any) => ({
        ...prevTemplate,
        files: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setTemplate((prevTemplate: any) => ({
          ...prevTemplate,
          files: fileList,
        }));
      }
    },
  };

  const handleDeleteFile = async (url: string) => {
    try {
      const trimmedUrl = url.replace(`${process.env.REACT_APP_API_URL}`, "");
      const data = {
        path: trimmedUrl,
      };
      const response = await axios.post(`/api/audits/attachment/delete`, data);
      if (response.status === 200 || response.status === 201) {
        const updatedUrls = formData.attachments.filter(
          (item: any) => item.documentLink !== url
        );
        setFormData(() => ({
          ...formData,
          attachments: updatedUrls,
        }));
      }
    } catch (error) {
      console.log("error in deleting file", error);
    }
  };

  //date
  const handlerOptionsInst = (name: any, e: any) => {
    setFormData({
      ...formData,
      [name]: e.target.value,
    });
  };

  const handlerDataCategory = (value: any, option: any) => {
    const dataArray = option?.map((item: any) => {
      const data = {
        id: item?.value,
        name: item?.label,
      };
      return data;
    });
    setFormData({
      ...formData,
      ["cipCategoryId"]: dataArray,
    });
  };

  const handlerDataTeam = (value: any, option: any) => {
    const dataArray = option?.map((item: any) => {
      const data = {
        id: item?.value,
        name: item?.label,
      };
      return data;
    });
    setFormData({
      ...formData,
      ["cipTeamId"]: dataArray,
    });
  };
  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onRemove: (file) => {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: fileList,
      }));
    },
  };
  const clearFile = async (data: any) => {
    try {
      //console.log("data in clearfile", data);

      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== data.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    } catch (error) {
      console.error("Error in clearFile:", error);
      return error;
    }
  };
  const validateFutureDate = (_: any, value: any) => {
    const selectedDate = new Date(value);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      return Promise.reject("Date cannot be a future date");
    }
    return Promise.resolve();
  };

  function validateInput(value: any, fieldType: any) {
    // Define regex patterns
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/u;
    const disallowedChars = /[<>]/u;

    // Rule: No starting with special character (non-letter and non-number)
    const startsWithSpecialChar = /^[^\p{L}\p{N}]/u.test(value);

    // Rule: No two consecutive special characters
    const consecutiveSpecialChars =
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/u.test(value);

    // Rule: Disallow < and >
    const containsDisallowedChars = disallowedChars.test(value);

    // Check rules based on field type
    if (fieldType === "text" || fieldType === "dropdown") {
      if (startsWithSpecialChar) {
        return "The input should not start with a special character or space.";
      }

      if (consecutiveSpecialChars) {
        return "No two consecutive special characters are allowed.";
      }

      if (containsDisallowedChars) {
        return "The characters < and > are not allowed.";
      }

      return true; // Passes validation for text or dropdown fields
    } else if (fieldType === "number") {
      // Rule: Only numbers are allowed
      if (!/^\d+$/u.test(value)) {
        return "Only numeric values are allowed.";
      }

      return true; // Passes validation for number fields
    }

    return "Invalid field type."; // In case an unsupported field type is passed
  }

  const validateField = (fieldType: any) => ({
    validator(_: any, value: any) {
      const result = validateInput(value, fieldType);
      if (result === true) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(result));
    },
  });

  return (
    <>
      <Modal
        title={
          <div>
            <span>Search Results</span>
          </div>
        }
        width={800}
        style={{ top: 100, right: 250 }}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        bodyStyle={{ overflow: "hidden" }}
        // className={classes.modalWrapper}
      ></Modal>
      <Form
        form={cipForm}
        layout="vertical"
        initialValues={{
          title: formData?.title,
          targetDate: formData?.targetDate,
          cipCategoryId: formData?.cipCategoryId
            ? formData.cipCategoryId.map((item: any) => item.id)
            : [],
          cipTeamId: formData?.cipTeamId
            ? formData.cipTeamId.map((item: any) => item.id)
            : [],
          cipTypeId: formData?.cipTypeId,
          justification: formData?.justification,
          cost: formData?.cost,
          cipOrigin: formData.cipOrigin,
          tangibleBenefits: formData?.tangibleBenefits,
          cancellation: formData?.cancellation,
          attachments: formData?.attachments,
          plannedStartDate: formData?.plannedStartDate?.substring(0, 10),
          plannedEndDate: formData?.plannedEndDate?.substring(0, 10),
          actualStartDate: formData?.actualStartDate?.substring(0, 10),
          actualEndDate: formData?.actualEndDate?.substring(0, 10),
          year: "2023",
          locationId: "",
          createdBy: "",
        }}
        rootClassName={classes.labelStyle}
        disabled={disableFormFields}
        // style={disableFormFields ? { color: "black !important" } : {}}
      >
        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="CIP Title "
              name="title"
              rules={[
                { required: true, message: "Please Enter CIP Name!" },
                {
                  validator: validateField("text").validator,
                },
              ]}
            >
              {/* <div ref={refForcipForm2}> */}
              <Input
                name="title"
                placeholder="Enter CIP Name"
                size="large"
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.title}
                style={{ backgroundColor: disableFormFields ? "white" : "" }}
              />
              {/* </div> */}
            </Form.Item>
          </Col>

          <Col span={matches ? 12 : 24}>
            {/* <div ref={refForcipForm3}> */}
            <Form.Item
              label="CIP Category: "
              name="cipCategoryId"
              rules={[
                {
                  required: true,
                  message: "Please select a CIP Category!",
                },
              ]}
              className={disableFormFields ? classes.selectdisabled : ""}
            >
              {/* <div
              ref={refForcipForm3}
              > */}
              <Select
                mode="multiple"
                placeholder="Select CIP Category"
                value={formData.cipCategoryId || []}
                onChange={(value, option) => {
                  handlerDataCategory(value, option);
                }}
                size="large"
                style={{ backgroundColor: disableFormFields ? "white" : "" }}

                // disabled={drawer?.mode === "edit" || disableDocType}
                //value={formData?.cipCategoryId?.name}
              >
                {categoryList?.map((option: any, index: number) => (
                  <Option key={index} value={option.id} label={option.name}>
                    {option.name}
                  </Option>
                ))}
              </Select>
              {/* </div> */}
            </Form.Item>
            {/* </div> */}
          </Col>
          {/* <Col span={12}>
            <Form.Item
              label="Department: "
              name="entity"
              rules={[
                {
                  required: true,
                  message: "Please select a Department!",
                },
              ]}
            >
              <Select
                placeholder="Select Department"
                onChange={(value, option: any) => {
                  console.log("option", option);
                  setFormData({
                    ...formData,
                    ["entity"]: value,
                  });
                }}
                // value={formData?.entity?.name}
                size="large"
              >
                {deptData?.map((option: any, index: number) => (
                  <Option key={index} value={option.id} label={option.name}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
        </Row>
        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="CIP Methodology: "
              name="cipTypeId"
              rules={[
                {
                  required: true,
                  message: "Please select a Type!",
                },
              ]}
              className={disableFormFields ? classes.selectdisabled : ""}
            >
              {/* <div ref={refForcipForm4}> */}
              <Select
                mode="multiple"
                placeholder="Select Type"
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    ["cipTypeId"]: value,
                  });
                  // console.log("value:",value)
                }}
                size="large"
                // value={formData?.cipTypeId}
                style={{ backgroundColor: disableFormFields ? "white" : "" }}
              >
                {typeList?.map((option: any, index: number) => (
                  <Option key={index} value={option} label={option}>
                    {option}
                  </Option>
                ))}
              </Select>
              {/* </div> */}
            </Form.Item>
          </Col>

          {/* --------------------origin---------------- */}

          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="CIP Origin: "
              name="cipOrigin"
              rules={[
                {
                  required: true,
                  message: "Please select a CIP Origin!",
                },
              ]}
              className={disableFormFields ? classes.selectdisabled : ""}
            >
              {/* <div ref={refForcipForm5}> */}
              <Select
                mode="multiple"
                // placeholder="Select CIP Category"
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    ["cipOrigin"]: value,
                  })
                }
                size="large"

                // disabled={drawer?.mode === "edit" || disableDocType}
                //value={formData?.cipCategoryId?.name}
              >
                {originList?.map((option: any, index: number) => (
                  <Option key={index} value={option} label={option}>
                    {option}
                  </Option>
                ))}
              </Select>
              {/* </div> */}
            </Form.Item>
          </Col>
        </Row>

        {/* ----------------Target date-----------------------       */}

        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Planned Start Date: "
              name="plannedStartDate"
              rules={[
                {
                  required: true,
                  message: "Please Enter Target Date!",
                },
              ]}
            >
              {/* <div ref={refForcipForm6}> */}
              <Input
                name="plannedStartDate"
                type="date"
                size="large"
                onChange={(e: any) => {
                  handlerOptionsInst("plannedStartDate", e);
                }}
                value={formData?.plannedStartDate?.substring(0, 10)}
                style={{ backgroundColor: disableFormFields ? "white" : "" }}
              />
              {/* </div> */}
            </Form.Item>
          </Col>
          {/* 
          --------------planed end date----------- */}

          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Planned End Date: "
              name="plannedEndDate"
              rules={[
                {
                  required: true,
                  message: "Please Enter Target Date!",
                },
              ]}
            >
              {/* <div ref={refForcipForm7}> */}
              <TextField
                className={ClassesDate.dateInput}
                id="plannedEndDate"
                name="plannedEndDate"
                type="date"
                value={formData?.plannedEndDate?.substring(0, 10)}
                onChange={(e: any) => {
                  handlerOptionsInst("plannedEndDate", e);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: `${formData?.plannedStartDate}`,
                }}
                disabled={disableFormFields}
                style={{
                  width: "95%",
                  height: "37px",
                  backgroundColor: disableFormFields ? "white" : "",
                }}
                InputProps={{
                  style: {
                    backgroundColor: disableFormFields ? "white" : "",
                  },
                }}
              />
              {/* </div> */}

              {/* <Input
                name="plannedEndDate"
                type="date"
                size="large"
                onChange={(e: any) => {
                  handlerOptionsInst("plannedEndDate", e);
                }}
                value={formData?.plannedEndDate?.substring(0, 10)}
                minDate={dayjs(formData?.plannedStartDate)}
              /> */}
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item
              label="Approx Cost in ₹ INR: "
              name="cost"
              rules={[
                {
                  required: false,
                  message: "Please Enter Cost!",
                },
                // {
                //   pattern: /^\d{10}$/,
                //   message: "Please enter a 10-digit number",
                // },
              ]}
            >
              <Input
                name="cost"
                type="number"
                placeholder="Enter Approx Cost"
                size="large"
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.cost}
                prefix="₹"
              />
            </Form.Item>
          </Col> */}
        </Row>

        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 12 : 24}>
            {/* <div ref={refForcipForm3}> */}
            <Form.Item
              label="GRT Teams: "
              name="cipTeamId"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please select a GRT Teams!",
              //   },
              // ]}
              className={disableFormFields ? classes.selectdisabled : ""}
            >
              {/* <div
              ref={refForcipForm3}
              > */}
              <Select
                mode="multiple"
                placeholder="Select GRT Teams"
                value={formData.cipTeamId || []}
                onChange={(value, option) => {
                  handlerDataTeam(value, option);
                }}
                size="large"
                style={{ backgroundColor: disableFormFields ? "white" : "" }}

                // disabled={drawer?.mode === "edit" || disableDocType}
                //value={formData?.cipCategoryId?.name}
              >
                {teamList?.map((option: any, index: number) => (
                  <Option key={index} value={option.id} label={option.name}>
                    {option.name}
                  </Option>
                ))}
              </Select>
              {/* </div> */}
            </Form.Item>
            {/* </div> */}
          </Col>
        </Row>

        {formData.buttonStatusInDates && (
          <Row
            gutter={[16, 16]}
            style={{
              display: "flex",
              flexDirection: matches ? "row" : "column",
            }}
          >
            <Col span={matches ? 12 : 24}>
              <Form.Item
                label="Actual Start Date: "
                name="actualStartDate"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Actual Target Date!",
                  },
                  {
                    validator: validateFutureDate,
                  },
                ]}
              >
                <Input
                  name="actualStartDate"
                  type="date"
                  size="large"
                  onChange={(e: any) => {
                    handlerOptionsInst("actualStartDate", e);
                  }}
                  value={formData?.actualStartDate?.substring(0, 10)}
                />
              </Form.Item>
            </Col>
            {/* 
          --------------actual end date----------- */}

            <Col span={matches ? 12 : 24}>
              <Form.Item label="Actual End Date: " name="actualEndDate">
                <Input
                  name="actualEndDate"
                  type="date"
                  size="large"
                  onChange={(e: any) => {
                    handlerOptionsInst("actualEndDate", e);
                  }}
                  value={formData?.actualEndDate?.substring(0, 10)}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          {formData.cancellationButtonStatus && (
            <Col span={matches ? 12 : 24}>
              <Form.Item
                label="Cancellation Reasons: "
                name="cancellationReason"
                rules={[
                  {
                    required: false,
                    message: "Please Enter justification and Benefits!",
                  },
                ]}
              >
                <TextArea
                  rows={1}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder="Enter Cancellation Reasons"
                  size="large"
                  name="cancellationReason"
                  onChange={(e: any) => handleInputChange(e)}
                  value={formData?.cancellationReason}
                />
              </Form.Item>
            </Col>
          )}

          {/* {formData.buttonStatusInDates && (
            <Col span={12}>
              <Form.Item
                label="Dropped Reasons: "
                name="droppedReason"
                rules={[
                  {
                    required: false,
                    message: "Please Enter justification and Benefits!",
                  },
                ]}
              >
                <TextArea
                  rows={1}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder="Enter Dropped Reasons"
                  size="large"
                  name="droppedReason"
                  onChange={(e: any) => handleInputChange(e)}
                  value={formData?.droppedReason}
                />
              </Form.Item>
            </Col>
          )} */}
        </Row>
        {/* <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Justification & Intangible Benefits: "
              name="justification"
              rules={[
                {
                  required: false,
                  message: "Please Enter justification and Benefits!",
                },
              ]}
            >
              <TextArea
                rows={1}
                autoSize={{ minRows: 1, maxRows: 6 }}
                placeholder="Enter justification and Benefits"
                size="large"
                name="justification"
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.justification}
              />
            </Form.Item>
          </Col>
        </Row> */}

        {formData?.cancellation && (
          <Row
            gutter={[16, 16]}
            style={{
              display: "flex",
              flexDirection: matches ? "row" : "column",
            }}
          >
            <Col span={matches ? 12 : 24}>
              <Form.Item
                label="Cancellation Reason: "
                name="cancellation"
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
                  name="cancellation"
                  onChange={(e: any) => handleInputChange(e)}
                  value={formData?.cancellation}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* <Row gutter={[16, 16]}>
          <Col span={24}>
            <div className={classes.tableSection}>
              <div className={classes.table}>
                <TangibleTable
                  header={HeadersData}
                  fields={FieldsData}
                  data={benefits}
                  setData={setBenefits}
                  formData={formData}
                  setFormData={setFormData}
                  isAction={actionData.isAction}
                  actions={actionData.actions}
                  isEdit={isEdit}
                  systemId={location?.state?.id}
                  orgId={orgId}
                  disabled={disableFormFields}
                  addFields={true}
                  label={"Add Benefit"}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ height: "auto", marginBottom: "70px" }}>
          <Col span={24}>
            <Form.Item name="uploader" style={{ display: "none" }}>
              <Input />
            </Form.Item>
            <Dragger name="files" {...uploadProps}>
              <div style={{ textAlign: "center" }}>
                <MdInbox style={{ fontSize: "36px" }} />
                <p className="ant-upload-text">
                  Click or drag files here to upload
                </p>
              </div>
            </Dragger>
            <Grid item sm={12} md={4}></Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              {!!formData?.attachments && !!formData?.attachments?.length && (
                <div>
                  <Typography
                    variant="body2"
                    style={{
                      marginTop: "16px",
                      marginBottom: "8px",
                    }}
                  >
                    Uploaded Files:
                  </Typography>

                  {formData?.attachments?.map((item: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <a
                        key={index}
                        href={item.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          color: "#1890ff",
                          textDecoration: "none",
                          marginRight: "8px", // This gives some space to the delete icon
                        }}
                      >
                       
                        {item.fileName}
                      </a>
                      <div
                        style={{
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                        onClick={() => handleDeleteFile(item.documentLink)}
                      >
                        <MdDelete style={{ fontSize: "18px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Grid>
          </Col>
        </Row> */}
        <Row
          gutter={[16, 16]}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <Col
            span={matches ? 12 : 24}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          > */}
          <Form.Item
            // name="fileList"
            help={uploadFileError ? "Please upload a file!" : ""}
            validateStatus={uploadFileError ? "error" : ""}
            style={{
              marginBottom: "-10px",
              width: "60%",
            }}
          >
            <Dragger
              accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
              name="fileList"
              {...uploadFileprops}
              className={`${classes.uploadSection} ant-upload-drag-container`}
              showUploadList={false}
              fileList={formData?.files}
              multiple
              style={{ width: "100%" }}
              // disabled={readStatus}
              // disabled={formData.status === "CA PENDING"}
            >
              {/* <p className="ant-upload-drag-icon">
                <MdInbox />
              </p> */}
              <p className="ant-upload-text">Upload Files</p>
            </Dragger>
          </Form.Item>
          {/* </Col> */}
        </Row>
        <Row
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {uploadLoading ? (
            <div>Please wait while documents get uploaded</div>
          ) : (
            formData?.files &&
            formData?.files?.length > 0 && (
              <div>
                {formData?.files.map((item: any) => (
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "5px", // Spacing between items
                      alignItems: "center",
                    }}
                    key={item.uid}
                  >
                    <Typography
                      className={classes.filename}
                      onClick={() => handleLinkClick(item)}
                      style={{
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      {item?.name}
                    </Typography>

                    <IconButton
                      onClick={() => {
                        clearFile(item);
                      }}
                      style={{ marginLeft: "10px" }}
                    >
                      <img src={CrossIcon} alt="" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )
          )}
        </Row>
      </Form>
    </>
  );
};

export default CipDetailsTab;
