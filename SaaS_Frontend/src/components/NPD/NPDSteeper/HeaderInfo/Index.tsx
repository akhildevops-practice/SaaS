import {
  Descriptions,
  Input,
  Form,
  Select,
  Row,
  Space,
  Upload,
  Button,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import useStyles from "../styles";
import {
  TextField,
  debounce,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@material-ui/core";

import { getAllUsersApi } from "apis/npdApi";
import { MdAddCircle } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { npdFormData } from "recoil/atom";
import { useRecoilState } from "recoil";
import axios from "apis/axios.global";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { getUserInfo } from "apis/socketApi";
import { MdHighlightOff } from "react-icons/md";
import { MdOutlineCheckCircle } from "react-icons/md";
import { useParams } from "react-router-dom";
import "../../../NPD/Index.css";

// import axios from "axios";
let typeAheadValue: string;
let typeAheadType: string;
type Props = { read?: any };
const HeaderIndex = ({ read }: Props) => {
  const classes = useStyles();
  const [formData, setFormData] = useRecoilState(npdFormData);
  // const [partDataTable, setPartDataTable] = useState<any>([]);
  const [getAllUserData, setGetAllUserData] = useState<any>([]);
  const [projectTypeOptions, setProjectTypeOptions] = useState<any>([]);
  const [custOptins, setCustOptions] = useState<any>([]);
  const [rankTypeOtions, setRankTypeOtions] = useState<any>([]);
  const [productTypeOption, setProductTypeOption] = useState<any>([]);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  useEffect(() => {
    getConfigData();
    getCustomerOptions();
    // getAllSuppliers();
  }, []);
  const [productData, setProductData] = useState<any>([]);
  // const [selectedSupplier, setSelectedSupplier] = useState<any>([]);
  // const [selectedCustomer, setSelectedCustomer] = useState<any>([]);
  const todayDate = new Date().toISOString().split("T")[0];
  const { id } = useParams();
  const [form] = Form.useForm();
  // const handleTagChangeSupplier = (value: any) => {
  //   setSelectedSupplier(value);
  // };
  // const handleTagChangeCustomer = (value: any) => {
  //   setSelectedCustomer(value);
  // };

  useEffect(() => {
    const findByType = productData?.find(
      (ele: any) => ele?.id === formData?.projectType
    );
    const productDataBy = findByType?.product?.map((value: any) => ({
      value: value?.id,
      label: value?.type,
    }));
    setProductTypeOption(productDataBy);
  }, [formData?.projectType, productData]);

  // console.log("id=====>", id)

  const updateEntityType = (selectedValues: string[], data: any) => {
    const updatedData = data?.map((ele: any) => ({
      id: ele?.value,
      category: "Customer",
      stakeHolderName: ele?.label,
      stakeHolderId: ele?.value,
      departments: [],
      isSelected: false,
    }));

    const filteredDepartmentData = formData?.departmentData?.filter(
      (item: any) =>
        selectedValues.includes(item.stakeHolderId) ||
        item.category === userDetail?.organization?.realmName
    );
    const mergedData = [...filteredDepartmentData, ...updatedData];
    const uniqueData = mergedData.reduce((acc: any[], current: any) => {
      if (!acc.some((item) => item.stakeHolderId === current.stakeHolderId)) {
        acc.push(current);
      }
      return acc;
    }, []);

    setFormData((prevForm: any) => ({
      ...prevForm,
      departmentData: uniqueData,
    }));
  };

  // const getAllSuppliers = () => {
  //   try {
  //     getAllUsersApi().then((response: any) => {
  //       // console.log("response", response);
  //       setAllSuppliers(response?.data);
  //     });
  //   } catch (e) {
  //     console.log("error", e);
  //     // enqueueSnackbar(`${e}`, {
  //     //   variant: "error",
  //     // });
  //   }
  // };
  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  const filterOption: any = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  // const suppliersOption =
  //   allSuppliers?.length > 0 &&
  //   allSuppliers
  //     ?.map((item: any) => {
  //       let data = {
  //         value: item.id,
  //         label: item.entityName,
  //       };
  //       return data;
  //     })
  //     .sort((a, b) => a.label.localeCompare(b.label));

  const getConfigData = async () => {
    const data = await axios.get(`/api/configuration`);
    const projectTypeData = data?.data[0]?.projectTypes?.map((value: any) => ({
      value: value?.id,
      label: value?.type,
    }));
    setProductData(data?.data[0]?.projectTypes);
    const rankTypeData = data?.data[0]?.rankType?.map((value: any) => ({
      value: value?.id,
      label: value?.rank,
    }));
    setProjectTypeOptions(projectTypeData);
    setRankTypeOtions(rankTypeData);
  };

  const getCustomerOptions = async () => {
    const result = await axios.get(`/api/configuration/getAllCustomer`);
    const finalResult = result?.data?.map((value: any) => ({
      value: value?.id,
      label: value?.entityName,
    }));
    setCustOptions(finalResult);
  };

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };
  const debouncedSearch = debounce(() => {
    getAllUsersInformation(typeAheadValue, typeAheadType);
  }, 400);

  const getAllUsersInformation = (value: string, type: string) => {
    try {
      getAllUsersApi().then((response: any) => {
        setGetAllUserData(response?.data);
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  const getOptionLabel = (option: any) => {
    if (option && option.email) {
      return option.email;
    } else {
      return "";
    }
  };

  // console.log("formData", formData);

  const handleNameChange = (value: any, key: any) => {
    const data = formData?.attachFiles.map((item: any) =>
      item.key === key ? { ...item, name: value } : item
    );
    setFormData({ ...formData, attachFiles: data });
  };

  const handleAddAttachment = () => {
    setFormData({
      ...formData,
      attachFiles: [
        ...formData?.attachFiles,
        { key: Date.now(), name: "", files: [] },
      ],
    });
    // setAttachments([
    //   ...attachments,
    //   { key: attachments.length + 1, name: "", files: [] },
    // ]);
  };

  const handleDeleteAttachment = (key: any) => {
    if (formData.attachFiles.length !== 1) {
      setFormData({
        ...formData,
        attachFiles: [
          ...formData.attachFiles.filter((item: any) => item.key !== key),
        ],
      });
    }
  };

  const handleFileChange = async (info: any, key: any) => {
    const { file } = info;
    const newformData = new FormData();
    newformData.append("file", file.originFileObj, file.name);

    const userData: any = await getUserInfo();

    try {
      const response = await axios.post(
        `api/configuration/addsingleFile?realm=${userData.data.organization.organizationName}`,
        newformData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Extract the data from the response
      const { documentLink, url, fileName } = response.data;

      // Update the fileList with the new file information
      const newFile = {
        uid: key, // unique identifier
        name: fileName, // file name
        status: "done", // status for completed upload
        url: url, // URL to access the file
        documentLink: documentLink, // additional link if needed
      };

      const updatedFileList = formData.attachFiles.map((item: any) =>
        item.key === key ? { ...item, files: [newFile] } : item
      );

      setFormData({ ...formData, attachFiles: updatedFileList });

      message.success(`${fileName} uploaded successfully.`);
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(`${file.name} file upload failed.`);
    }
  };
  const [duplicateStatus, setDuplicateStatus] = useState<any>();

  const checkingDuplicateNames = async (data: any) => {
    const result = await axios.post(`/api/npd/duplicateProjectName`, {
      name: data,
    });
    if (result.status === 201 || result.status === 200) {
      setDuplicateStatus(result?.data);
    }
  };

  const validateTitle = (_: any, value: any) => {
    // if (duplicateStatus === true) {
    //   return Promise.reject(new Error("Project name Already Exist."));
    // }
    const regex = /^[^!@#$%^&*(),.?":{}|<>][\s\S]*[^!@#$%^&*(),.?":{}|<>]$/;
    if (!regex.test(value)) {
      return Promise.reject(
        new Error("Project name cannot start or end with special characters.")
      );
    }
    return Promise.resolve();
  };

  useEffect(() => {
    if (formData) {
      form.setFieldsValue({
        projectName: formData?.projectName,
      });
    }
  }, [formData, form]);

  if (!formData) {
    return <div>Loading...</div>;
  }

  // console.log("formData ===>", formData);

  return (
    <div>
      <div className={classes.descriptionLabelStyle}>
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            projectName: formData?.projectName,
          }}
        >
          <Descriptions
            bordered
            size="small"
            column={{
              xxl: 2,
              xl: 2,
              lg: 2,
              md: 1,
              sm: 2,
              xs: 2,
            }}
          >
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> Project Type:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please select a project type",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  onSearch={onSearch}
                  filterOption={filterOption}
                  placeholder="Select Project Type"
                  style={{ width: "100%", color: "black" }}
                  value={formData?.projectType}
                  options={projectTypeOptions}
                  disabled={read}
                  onChange={(value, data: any) => {
                    setFormData({
                      ...formData,
                      projectType: value,
                      projectTypeData: data,
                    });
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> Project Name:{" "}
                </>
              }
            >
              <Form.Item
                name="projectName"
                rules={[
                  {
                    required: true,
                  },
                  { validator: validateTitle },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Enter Project Name"
                  value={formData?.projectName}
                  disabled={read}
                  onChange={(event) => {
                    setFormData({
                      ...formData,
                      projectName: event.target.value,
                    });
                    checkingDuplicateNames(event.target.value);
                  }}
                  style={{ color: "black" }}
                  suffix={
                    duplicateStatus ? (
                      <MdHighlightOff
                        style={{
                          color: "red",
                          fontSize: "20px",
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <MdOutlineCheckCircle
                        style={{
                          color: "green",
                          fontSize: "20px",
                          cursor: "pointer",
                        }}
                      />
                    )
                  }
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> Customer:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please select customers",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  onSearch={onSearch}
                  filterOption={filterOption}
                  mode="multiple"
                  placeholder="Select Customer(s)"
                  style={{ width: "100%", color: "black" }}
                  options={custOptins}
                  value={formData?.customer || []}
                  disabled={read}
                  onChange={(value, data: any) => {
                    setFormData({ ...formData, customer: value });
                    updateEntityType(value, data);
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> SOP Date:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please select a date",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <TextField
                  style={{ width: "100%", height: "33px" }}
                  id="sop-date"
                  type="date"
                  disabled={read}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={
                    formData?.sopDate ? formData.sopDate.split("T")[0] : ""
                  } // Extracting the date part
                  onChange={(event) => {
                    setFormData({ ...formData, sopDate: event.target.value });
                  }}
                  inputProps={{
                    min: `${todayDate}`,
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> SOP Quantity:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please enter SOP quantity",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  type="number"
                  placeholder="Enter SOP Quantity"
                  value={formData?.sopQuantity}
                  disabled={read}
                  onChange={(event) => {
                    setFormData({
                      ...formData,
                      sopQuantity: event.target.value,
                    });
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> ESC No.:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please enter ESC No.",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  // type="number"
                  placeholder="Enter ESC No."
                  value={formData?.escNumber}
                  disabled={read}
                  onChange={(event) => {
                    setFormData({ ...formData, escNumber: event.target.value });
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> ESC Rank:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please select ESC rank",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  onSearch={onSearch}
                  filterOption={filterOption}
                  placeholder="Select ESC Rank"
                  style={{ width: "100%", color: "black" }}
                  options={rankTypeOtions}
                  disabled={read}
                  value={formData?.escRank}
                  onChange={(value) => {
                    setFormData({ ...formData, escRank: value });
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> Justification:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please enter justification",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Enter Justification"
                  value={formData?.justification}
                  disabled={read}
                  onChange={(event) => {
                    setFormData({
                      ...formData,
                      justification: event.target.value,
                    });
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <strong style={{ color: "red" }}>*</strong> Kick off meeting
                  date:{" "}
                </>
              }
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please select a date",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <TextField
                  style={{ width: "100%", height: "33px" }}
                  // className={classes.dateInput}
                  id="kick-off-date"
                  disabled={read}
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formData?.meetingDate}
                  onChange={(event) => {
                    setFormData({
                      ...formData,
                      meetingDate: event.target.value,
                    });
                  }}
                  inputProps={{
                    min: `${todayDate}`,
                  }}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item span={12} label="Attachments: ">
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please select a date",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                {formData?.attachFiles?.map((attachment: any, index: any) => (
                  <Space
                    key={attachment.key}
                    style={{ display: "flex", marginBottom: "8px" }}
                    align="start"
                  >
                    <Input
                      placeholder="Attachment Description"
                      value={attachment.name}
                      onChange={(e) =>
                        handleNameChange(e.target.value, attachment.key)
                      }
                      style={{ width: "400px" }}
                      disabled={read}
                    />
                    <Upload
                      // fileList={attachment.files}
                      // onChange={(info) => handleFileChange(info, attachment.key)}
                      multiple
                      fileList={attachment.files} // Display uploaded files
                      onChange={(info: any) =>
                        handleFileChange(info, attachment.key)
                      }
                      disabled={read}
                      // multiple={false} // Set to false for single file upload
                      // listType="picture" // Displays as a picture card
                      onPreview={(file: any) => window.open(file.url)} // Open the file in a new tab on click
                    >
                      <Button disabled={read} icon={<FiUpload />}>
                        Upload Files
                      </Button>
                    </Upload>
                    {formData?.attachFiles?.length !== 1 && (
                      <Button
                        disabled={read}
                        icon={<AiOutlineDelete />}
                        onClick={() => handleDeleteAttachment(attachment.key)}
                      />
                    )}

                    {index === formData?.attachFiles?.length - 1 && (
                      <Button
                        type="primary"
                        disabled={read}
                        icon={<AiOutlinePlusCircle />}
                        onClick={handleAddAttachment}
                      />
                    )}
                  </Space>
                ))}
              </Form.Item>
            </Descriptions.Item>
            {/* <Descriptions.Item label="Supplier: ">
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please select a date",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
               <Select
                mode="multiple"
                value={formData?.supplier}
                style={{ width: "100%" ,color:"black"}}
                onChange={(e: any) => {
                  setFormData({
                    ...formData,
                    supplier: e,
                  });
                }}
                showSearch
                placeholder="Select Supplier"
                optionFilterProp="children"
                onSearch={onSearch}
                filterOption={filterOption}
                options={suppliersOption}
              />
               <Select
      mode="tags"
      style={{ width: '100%' }}
      placeholder="Enter Supplier"
      value={selectedSupplier}
      onChange={handleTagChangeSupplier}
      open={false}
    />
              </Form.Item>
            </Descriptions.Item> */}
          </Descriptions>
        </Form>
      </div>
      <div
        className={classes.tableContainer}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <p style={{ fontSize: "18px", fontWeight: "bold" }}> Part Details</p>
        </div>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead
              style={{
                backgroundColor: "#E8F3F9",
                color: "#00224E",
                height: "50px",
                width: "100%",
              }}
            >
              <TableRow style={{ borderBottom: " 1px #00224E" }}>
                {/* <TableCell
                  style={{
                    color: "#00224E",
                    fontWeight: "bold",
                    padding: "5px",
                    fontSize: "13px",
                  }}
                  align="center"
                  colSpan={6} // updated to 6 to accommodate the new column
                >
                  Part Details
                </TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell
                  style={{
                    color: "#00224E",
                    fontWeight: "bold",
                    padding: "5px",
                    fontSize: "13px",
                    width: "230px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "red" }}>*</strong> Model
                </TableCell>
                <TableCell
                  style={{
                    color: "#00224E",
                    fontWeight: "bold",
                    padding: "5px",
                    fontSize: "13px",
                    width: "290px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "red" }}>*</strong> Part Name
                </TableCell>
                <TableCell
                  style={{
                    color: "#00224E",
                    fontWeight: "bold",
                    padding: "5px",
                    fontSize: "13px",
                    width: "290px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "red" }}>*</strong>Part No
                </TableCell>
                <TableCell
                  style={{
                    color: "#00224E",
                    fontWeight: "bold",
                    padding: "5px",
                    fontSize: "13px",
                    width: "290px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "red" }}>*</strong> Customer Part No
                </TableCell>
                <TableCell
                  style={{
                    color: "#00224E",
                    fontWeight: "bold",
                    padding: "5px",
                    fontSize: "13px",
                    width: "290px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "red" }}>*</strong> Product Type
                </TableCell>
                <TableCell
                  style={{
                    color: "#00224E",
                    fontWeight: "bold",
                    padding: "5px",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData?.partDetails?.map((item: any, i: any) => {
                return (
                  <TableRow key={i}>
                    <TableCell style={{ padding: "5px", fontSize: "12px" }}>
                      <Input
                        value={item.model}
                        disabled={read}
                        onChange={(e) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i
                              ? { ...row, model: e.target.value }
                              : row
                          );

                          setFormData({ ...formData, partDetails: data });
                        }}
                        placeholder="Model"
                        style={{
                          // height: "48px",
                          // marginTop: "8px",
                          width: "250px",
                        }}
                        // fullWidth
                      />
                    </TableCell>
                    <TableCell style={{ padding: "5px", fontSize: "12px" }}>
                      <Input
                        placeholder="Part Name"
                        disabled={read}
                        onChange={(e: any) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i
                              ? { ...row, partName: e.target.value }
                              : row
                          );
                          setFormData({ ...formData, partDetails: data });
                        }}
                        value={item?.partName}
                      />
                      {/* <Autocomplete
                        id="part-name"
                        size="small"
                        freeSolo
                        onChange={(event, value) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i ? { ...row, partName: value } : row
                          );

                          setFormData({ ...formData, partDetails: data });
                        }}
                        value={item?.partName}
                        options={getAllUserData}
                        getOptionLabel={(option: any) => getOptionLabel(option)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onChange={(event) => handleTextChange(event)}
                            margin="normal"
                            variant="outlined"
                            placeholder="Part Name"
                            fullWidth
                          />
                        )}
                      /> */}
                    </TableCell>
                    <TableCell style={{ padding: "5px", fontSize: "12px" }}>
                      <Input
                        placeholder="Part No	"
                        disabled={read}
                        onChange={(e: any) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i
                              ? { ...row, densoPartNo: e.target.value }
                              : row
                          );
                          setFormData({ ...formData, partDetails: data });
                        }}
                        value={item?.densoPartNo}
                      />
                      {/* <Autocomplete
                        id="denso-part-no"
                        size="small"
                        freeSolo
                        onChange={(event, value) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i ? { ...row, densoPartNo: value } : row
                          );

                          setFormData({ ...formData, partDetails: data });
                        }}
                        value={item?.densoPartNo}
                        options={getAllUserData}
                        getOptionLabel={(option: any) => getOptionLabel(option)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onChange={(event) => handleTextChange(event)}
                            margin="normal"
                            variant="outlined"
                            placeholder="Denso Part No"
                            fullWidth
                          />
                        )}
                      /> */}
                    </TableCell>
                    <TableCell style={{ padding: "5px", fontSize: "12px" }}>
                      <Input
                        placeholder="Customer Part No"
                        disabled={read}
                        onChange={(e: any) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i
                              ? { ...row, customer: e.target.value }
                              : row
                          );
                          setFormData({ ...formData, partDetails: data });
                        }}
                        value={item?.customer}
                      />
                      {/* <Autocomplete
                        id="customer-part-no"
                        size="small"
                        freeSolo
                        onChange={(event, value) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i ? { ...row, customer: value } : row
                          );

                          setFormData({ ...formData, partDetails: data });
                        }}
                        value={item?.customer}
                        options={getAllUserData}
                        getOptionLabel={(option: any) => getOptionLabel(option)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onChange={(event) => handleTextChange(event)}
                            margin="normal"
                            variant="outlined"
                            placeholder="Customer Part No"
                            fullWidth
                          />
                        )}
                      /> */}
                    </TableCell>
                    <TableCell style={{ padding: "5px", fontSize: "12px" }}>
                      <Select
                        placeholder="Select Product Type"
                        style={{
                          width: "100%",
                          color: "black",
                          // height: "48px",
                          // marginTop: "8px",
                        }}
                        onChange={(value) => {
                          let data = formData.partDetails;
                          data = data.map((row: any, index: any) =>
                            index === i ? { ...row, productType: value } : row
                          );

                          setFormData({ ...formData, partDetails: data });
                        }}
                        value={item?.productType}
                        disabled={read}
                        options={productTypeOption}
                      />
                    </TableCell>
                    <TableCell style={{ padding: "5px", fontSize: "12px" }}>
                      <Row>
                        <IconButton
                          style={{ padding: "5px" }}
                          disabled={read}
                          onClick={() => {
                            const payload = {
                              model: "",
                              date: "",
                              orderNo: "",
                              qty: "",
                              remarks: "",
                            };
                            // setPartDataTable([...partDataTable, payload]);
                            setFormData({
                              ...formData,
                              partDetails: [...formData?.partDetails, payload],
                            });
                          }}
                        >
                          <MdAddCircle fontSize="small" color="primary" />
                        </IconButton>
                        {formData?.partDetails.length > 1 && (
                          <IconButton
                            style={{ padding: "5px" }}
                            disabled={read}
                            onClick={() => {
                              const temp = [...formData?.partDetails];
                              temp.splice(i, 1);
                              setFormData({ ...formData, partDetails: temp });
                            }}
                          >
                            <MdDelete fontSize="small" color="error" />
                          </IconButton>
                        )}
                      </Row>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default HeaderIndex;
